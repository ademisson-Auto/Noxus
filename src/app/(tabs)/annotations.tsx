import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Annotation, AnnotationCategories, useAnnotations } from '../../lib/AnnotationsContext';
import { ChevronRight, Search, Book, Tag, Wifi, WifiOff } from 'lucide-react-native';
import LoadingAnimation from '../../components/LoadingAnimation';
import { supabase } from '../../lib/supabase';

type BookWithAnnotations = {
  id: string;
  title: string;
  cover_url: string;
  annotations: Annotation[];
};

type UserBook = {
  id: string;
  title: string;
  cover_url: string;
};

export default function AnnotationsTab() {
  const [loading, setLoading] = useState(true);
  const [booksWithAnnotations, setBooksWithAnnotations] = useState<BookWithAnnotations[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const { getBookAnnotations, isOnline, hasPendingSync, forceSync } = useAnnotations();

  useEffect(() => {
    loadBooks();
  }, []);

  async function loadBooks() {
    try {
      setLoading(true);
      
      // Obtém os books do Supabase - sem filtrar por user_id
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        setBooksWithAnnotations([]);
        return;
      }
      
      // Modificado para buscar todos os livros sem filtrar por user_id
      const { data: userBooks, error } = await supabase
        .from('books')
        .select('id, title, cover_url');
      
      if (error) {
        console.error('Erro ao carregar livros:', error);
        return;
      }

      // Para cada livro, busca suas anotações
      if (userBooks) {
        const booksWithAnno = await Promise.all(
          userBooks.map(async (book: UserBook) => {
            const bookAnnotations = await getBookAnnotations(book.id);
            return {
              ...book,
              annotations: bookAnnotations
            };
          })
        );

        // Filtra somente livros que têm anotações
        const filtered = booksWithAnno.filter((book: BookWithAnnotations) => book.annotations.length > 0);
        setBooksWithAnnotations(filtered);
      }
    } catch (error) {
      console.error('Erro ao carregar livros com anotações:', error);
    } finally {
      setLoading(false);
    }
  }

  function getFilteredBooks() {
    if (!selectedCategory) {
      return booksWithAnnotations;
    }

    return booksWithAnnotations.map(book => ({
      ...book,
      annotations: book.annotations.filter(
        annotation => annotation.category === selectedCategory
      )
    })).filter(book => book.annotations.length > 0);
  }

  function navigateToBookAnnotations(bookId: string, bookTitle: string) {
    // Por enquanto, desativamos esta navegação até implementar corretamente
    // router.push({
    //   pathname: "/(tabs)/annotations/book/[id]",
    //   params: { id: bookId, title: bookTitle }
    // } as any);
    
    // Mostrar alerta temporário
    alert(`Função em desenvolvimento: Ver anotações do livro "${bookTitle}"`);
  }

  const CategorySelector = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoryContainer}
    >
      <TouchableOpacity
        style={[
          styles.categoryChip,
          selectedCategory === undefined && styles.categoryChipSelected
        ]}
        onPress={() => setSelectedCategory(undefined)}
      >
        <Tag size={16} color={selectedCategory === undefined ? '#FFF' : '#4F46E5'} />
        <Text 
          style={[
            styles.categoryLabel,
            selectedCategory === undefined && styles.categoryLabelSelected
          ]}
        >
          Todas
        </Text>
      </TouchableOpacity>

      {AnnotationCategories.map(category => (
        <TouchableOpacity
          key={category}
          style={[
            styles.categoryChip,
            selectedCategory === category && styles.categoryChipSelected
          ]}
          onPress={() => setSelectedCategory(category)}
        >
          <Tag size={16} color={selectedCategory === category ? '#FFF' : '#4F46E5'} />
          <Text 
            style={[
              styles.categoryLabel,
              selectedCategory === category && styles.categoryLabelSelected
            ]}
          >
            {category}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderBookItem = ({ item }: { item: BookWithAnnotations }) => (
    <TouchableOpacity
      style={styles.bookItem}
      onPress={() => navigateToBookAnnotations(item.id, item.title)}
    >
      <View style={styles.bookInfo}>
        <View style={styles.bookIconContainer}>
          <Book size={24} color="#4F46E5" />
        </View>
        <View style={styles.bookTextContainer}>
          <Text style={styles.bookTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.annotationCount}>
            {item.annotations.length} {item.annotations.length === 1 ? 'anotação' : 'anotações'}
          </Text>
        </View>
      </View>
      <ChevronRight size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Anotações</Text>
        <View style={styles.headerActions}>
          {!isOnline && (
            <View style={styles.offlineIndicator}>
              <WifiOff size={16} color="#EF4444" />
              <Text style={styles.offlineText}>Offline</Text>
            </View>
          )}
          {hasPendingSync && (
            <TouchableOpacity 
              style={styles.syncButton}
              onPress={forceSync}
            >
              <Wifi size={18} color={isOnline ? '#4F46E5' : '#9CA3AF'} />
              <Text style={styles.syncText}>Sincronizar</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={styles.searchButton}
            // onPress={() => router.push("/(tabs)/search" as any)}
          >
            <Search size={22} color="#111827" />
          </TouchableOpacity>
        </View>
      </View>

      <CategorySelector />

      {loading ? (
        <LoadingAnimation message="Carregando suas anotações..." />
      ) : getFilteredBooks().length > 0 ? (
        <FlatList
          data={getFilteredBooks()}
          renderItem={renderBookItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Nenhuma anotação encontrada</Text>
          <Text style={styles.emptySubtitle}>
            {selectedCategory 
              ? `Você ainda não tem anotações na categoria "${selectedCategory}"`
              : 'Você ainda não criou nenhuma anotação em seus livros'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  searchButton: {
    padding: 8,
  },
  categoryContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 10,
    backgroundColor: '#EEF2FF',
    borderRadius: 20,
  },
  categoryChipSelected: {
    backgroundColor: '#4F46E5',
  },
  categoryLabel: {
    marginLeft: 6,
    fontSize: 14,
    color: '#4F46E5',
  },
  categoryLabelSelected: {
    color: '#FFFFFF',
  },
  listContainer: {
    padding: 16,
  },
  bookItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  bookInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bookIconContainer: {
    width: 44,
    height: 44,
    backgroundColor: '#EEF2FF',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bookTextContainer: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  annotationCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: '80%',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  offlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  offlineText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
  },
  syncText: {
    color: '#4F46E5',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
}); 