import { useEffect, useState } from 'react';
import { SplashScreen, Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AnnotationsProvider } from '../lib/AnnotationsContext';
import { FavoritesProvider } from '../lib/FavoritesContext';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

// Mantenha a tela de splash visível enquanto o aplicativo carrega
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    // Atrasar a inicialização para evitar problemas com módulos nativos
    // mas mantendo o tempo mínimo possível para boa experiência
    async function prepareApp() {
      try {
        // Reduzido o tempo de espera de 2000ms para 500ms
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (e) {
        console.warn('Erro durante inicialização:', e);
      } finally {
        // Marcar o app como pronto
        setAppIsReady(true);
        // Esconder a tela de splash imediatamente
        try {
          await SplashScreen.hideAsync();
        } catch (error) {
          console.warn('Erro ao esconder splash:', error);
        }
      }
    }

    prepareApp();
  }, []);

  if (!appIsReady) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0ea5e9" />
        <Text style={styles.loadingText}>Inicializando aplicativo...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <FavoritesProvider>
        <AnnotationsProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="reader/[id]" options={{ headerShown: false, presentation: 'card' }} />
            <Stack.Screen name="annotations/[id]" options={{ headerShown: false, presentation: 'card' }} />
            {/* Essas rotas ainda precisam ser implementadas corretamente */}
            {/* <Stack.Screen name="annotations/book/[id]" options={{ headerShown: false, presentation: 'card' }} /> */}
            {/* <Stack.Screen name="search" options={{ headerShown: false, presentation: 'modal' }} /> */}
          </Stack>
        </AnnotationsProvider>
      </FavoritesProvider>
    </SafeAreaProvider>
  );
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