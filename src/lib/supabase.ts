import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Recupera as variáveis de ambiente do Expo constantes
// No Expo 49, usamos Constants.expoConfig
const supabaseUrl = 'https://fkfvoycrynxtnovjryol.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrZnZveWNyeW54dG5vdmpyeW9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyMzM4NDksImV4cCI6MjA1NzgwOTg0OX0.4RnM1poXPiUdvgepyllNby7u-ZBjP7yVQG0iVciNmNs';

// Criar adaptador de armazenamento personalizado
const customStorageAdapter = {
  getItem: (key: string) => AsyncStorage.getItem(key),
  setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
  removeItem: (key: string) => AsyncStorage.removeItem(key),
};

// Exportar o cliente Supabase com persistência configurada
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: customStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});