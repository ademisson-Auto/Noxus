import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

interface LoadingAnimationProps {
  message?: string;
}

export default function LoadingAnimation({ message = 'Carregando...' }: LoadingAnimationProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#4F46E5" style={styles.spinner} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  spinner: {
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    color: '#4B5563',
    fontWeight: '500',
  },
}); 