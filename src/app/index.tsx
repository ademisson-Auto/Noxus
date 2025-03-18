import { useEffect, useState } from 'react';
import { Redirect, Href } from 'expo-router';
import { supabase } from '../lib/supabase';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logDbStructureCheck } from '../utils/checkDbStructure';
import { Session } from '@supabase/supabase-js';

// Chave para salvar a última tela visitada
const LAST_SCREEN_KEY = '@reading_app/last_screen';
// Chave para verificar se é o primeiro lançamento
const FIRST_LAUNCH_KEY = '@reading_app/first_launch';

// Usando um tipo mais específico compatível com Expo Router
type AppRoute = string;

export default function Index() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastScreen, setLastScreen] = useState<string | null>(null);
  const [isFirstLaunch, setIsFirstLaunch] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    // Verificar estrutura do banco de dados em ambiente de desenvolvimento
    if (__DEV__) {
      // Usando IIFE assíncrona para padronizar o uso de async/await
      (async () => {
        try {
          await logDbStructureCheck();
        } catch (error) {
          console.error('Erro ao verificar estrutura do banco:', error);
        }
      })();
    }

    // Verificar se é o primeiro lançamento
    const checkFirstLaunch = async () => {
      try {
        const value = await AsyncStorage.getItem(FIRST_LAUNCH_KEY);
        if (value === null) {
          // É o primeiro lançamento
          await AsyncStorage.setItem(FIRST_LAUNCH_KEY, 'false');
          setIsFirstLaunch(true);
        }
      } catch (error) {
        console.error('Erro ao verificar primeiro lançamento:', error);
      }
    };

    // Recuperar a última tela visitada
    const getLastScreen = async () => {
      try {
        const savedScreen = await AsyncStorage.getItem(LAST_SCREEN_KEY);
        if (savedScreen) {
          setLastScreen(savedScreen);
        }
      } catch (error) {
        console.error('Erro ao recuperar última tela:', error);
      }
    };

    // Verificar sessão do Supabase
    const checkSession = async () => {
      try {
        setCheckingSession(true);
        
        // Obter sessão atual
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        setSession(data.session);
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
        setSession(null);
      } finally {
        setCheckingSession(false);
      }
    };

    // Executar verificações
    const initializeApp = async () => {
      try {
        await Promise.all([
          checkFirstLaunch(),
          getLastScreen(),
          checkSession()
        ]);
      } catch (error) {
        console.error('Erro ao inicializar app:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Salvar a tela atual
  const saveCurrentScreen = async (screen: AppRoute) => {
    try {
      await AsyncStorage.setItem(LAST_SCREEN_KEY, screen);
    } catch (error) {
      console.error('Erro ao salvar tela atual:', error);
    }
  };

  // Mostrar tela de carregamento enquanto verifica a sessão
  if (checkingSession) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0ea5e9" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  // Redireciona com base no estado de autenticação
  if (session) {
    // Se o usuário estiver autenticado, redireciona para a última tela ou para as abas
    const redirectTo = lastScreen || '/(tabs)';
    saveCurrentScreen(redirectTo);
    return <Redirect href={redirectTo as Href<string>} />;
  } else {
    // Se não estiver autenticado, redireciona para o login
    return <Redirect href={'/(auth)/login' as Href<string>} />;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
}); 