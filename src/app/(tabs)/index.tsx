import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function Home() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Bem-vindo ao ReadApp</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Continue Lendo</Text>
        {/* Seção de leitura contínua será implementada */}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mangás Populares</Text>
        {/* Seção de mangás será implementada */}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Light Novels em Destaque</Text>
        {/* Seção de light novels será implementada */}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>E-Books Recomendados</Text>
        {/* Seção de e-books será implementada */}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 50,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
});