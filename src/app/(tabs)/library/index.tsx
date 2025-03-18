import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, TextInput } from 'react-native';
import { Search } from 'lucide-react-native';
import { supabase } from '../../../lib/supabase';
import { router } from 'expo-router';
import LoadingAnimation from '../../../components/LoadingAnimation';

type Book = {
  id: string;
  title: string;
  author: string;
  cover_url: string;
  type: 'manga' | 'light_novel' | 'ebook';
};

export default function Library() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'manga' | 'light_novel' | 'ebook'>('all');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const types = [
    { id: 'all', label: 'Todos' },
    { id: 'manga', label: 'Mangá' },
    { id: 'light_novel', label: 'Light Novels' },
    { id: 'ebook', label: 'E-Books' },
  ];

  useEffect(() => {
    fetchBooks();
  }, [selectedType]);

  async function fetchBooks() {
    try {
      setLoading(true);
      let query = supabase.from('books').select('*');
      
      if (selectedType !== 'all') {
        query = query.eq('type', selectedType);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      setBooks(data || []);
    } catch (error) {
      console.error('Erro ao buscar livros:', error);
    } finally {
      setLoading(false);
    }
  }

  const handlePress = (id: string) => {
    if (id) {
      router.push(`/library/${id}`);
    }
  };

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <LoadingAnimation />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Biblioteca</Text>
        <View style={styles.searchContainer}>
          <Search size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar livros..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.filters}>
        <FlatList
          horizontal
          data={types}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedType === item.id && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedType(item.id as typeof selectedType)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedType === item.id && styles.filterButtonTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
        />
      </View>

      <FlatList
        data={filteredBooks}
        numColumns={2}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.bookCard}
            onPress={() => handlePress(item.id)}
          >
            <Image 
              source={{ uri: item.cover_url || 'https://via.placeholder.com/150x200' }} 
              style={styles.bookCover} 
            />
            <View style={styles.bookInfo}>
              <Text style={styles.bookTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.bookAuthor} numberOfLines={1}>
                {item.author}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.grid}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum livro encontrado</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 16,
  },
  filters: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  filterButtonActive: {
    backgroundColor: '#0ea5e9',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  grid: {
    padding: 10,
  },
  bookCard: {
    flex: 1,
    margin: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bookCover: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  bookInfo: {
    padding: 12,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
}); 