import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import LoadingAnimation from '../../../components/LoadingAnimation';

type Book = {
  id: string;
  title: string;
  author: string;
  cover_url: string;
  type: string;
};

export default function DiscoverScreen() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooks();
  }, []);

  async function fetchBooks() {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('id, title, author, cover_url, type')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      setBooks(data || []);
    } catch (error) {
      console.error('Erro ao buscar livros:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleBookPress(bookId: string) {
    router.push(`/library/${bookId}`);
  }

  if (loading) {
    return <LoadingAnimation />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Descubra</Text>
      </View>

      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.bookCard}
            onPress={() => handleBookPress(item.id)}
          >
            <Image
              source={{ uri: item.cover_url || 'https://via.placeholder.com/150x200' }}
              style={styles.bookCover}
              resizeMode="cover"
            />
            <View style={styles.bookInfo}>
              <Text style={styles.bookTitle}>{item.title}</Text>
              <Text style={styles.bookAuthor}>{item.author}</Text>
              <Text style={styles.bookType}>{item.type.replace('_', ' ')}</Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.booksList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 30,
  },
  booksList: {
    padding: 16,
  },
  bookCard: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  bookCover: {
    width: 80,
    height: 120,
    backgroundColor: '#E5E5E5',
  },
  bookInfo: {
    flex: 1,
    padding: 12,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  bookAuthor: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  bookType: {
    fontSize: 12,
    color: '#4F46E5',
    marginTop: 8,
    textTransform: 'capitalize',
  },
}); 