import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, BookOpen, Share2, Star } from 'lucide-react-native';
import { ActivityIndicator } from 'react-native';
import { supabase } from '../../../lib/supabase';
import { useFavorites } from '../../../lib/FavoritesContext';

type BookDetails = {
  id: string;
  title: string;
  author: string;
  cover_url: string;
  description: string;
  type: 'manga' | 'light_novel' | 'ebook';
  chapters: Array<{
    id: string;
    number: number;
    title: string;
  }>;
};

export default function BookDetails() {
  const { id } = useLocalSearchParams();
  const [book, setBook] = useState<BookDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    fetchBookDetails();
  }, [id]);

  async function fetchBookDetails() {
    try {
      const { data, error } = await supabase
        .from('books')
        .select(`
          *,
          chapters (
            id,
            number,
            title
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setBook(data);
    } catch (error) {
      console.error('Erro ao buscar detalhes do livro:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleFavorite() {
    if (!book) return;
    
    const success = await toggleFavorite(book.id);
    if (!success) {
      alert('Erro ao processar favorito. Tente novamente.');
    }
  }

  function handleReadChapter(chapterId: string) {
    if (!book || !book.id) {
      console.error('ID do livro não disponível');
      return;
    }
    
    router.push({
      pathname: '/reader/[id]',
      params: { id: book.id, chapter: chapterId }
    });
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (!book) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Livro não encontrado</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.bookInfo}>
          <Image
            source={{ uri: book.cover_url || 'https://via.placeholder.com/150x200' }}
            style={styles.bookCover}
            resizeMode="cover"
          />
          <View style={styles.bookDetails}>
            <Text style={styles.bookTitle}>{book.title}</Text>
            <Text style={styles.bookAuthor}>{book.author}</Text>
            <Text style={styles.bookType}>
              {book.type === 'manga' ? 'Mangá' : 
                book.type === 'light_novel' ? 'Light Novel' : 'E-book'}
            </Text>

            <View style={styles.actions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleToggleFavorite}
              >
                <Star 
                  size={20} 
                  color="#4F46E5" 
                  fill={book ? (isFavorite(book.id) ? '#4F46E5' : 'transparent') : 'transparent'} 
                />
                <Text style={styles.actionText}>
                  {book && isFavorite(book.id) ? 'Favoritado' : 'Favoritar'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton}>
                <Share2 size={20} color="#4F46E5" />
                <Text style={styles.actionText}>Compartilhar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Descrição</Text>
          <Text style={styles.description}>{book.description}</Text>
        </View>

        <View style={styles.chaptersSection}>
          <Text style={styles.sectionTitle}>Capítulos</Text>
          {book.chapters.length === 0 ? (
            <Text style={styles.emptyText}>Nenhum capítulo disponível</Text>
          ) : (
            book.chapters.map((chapter) => (
              <TouchableOpacity
                key={chapter.id}
                style={styles.chapterItem}
                onPress={() => handleReadChapter(chapter.id)}
              >
                <View>
                  <Text style={styles.chapterNumber}>Capítulo {chapter.number}</Text>
                  <Text style={styles.chapterTitle}>{chapter.title}</Text>
                </View>
                <BookOpen size={20} color="#4F46E5" />
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    paddingTop: 60,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginLeft: 16,
  },
  content: {
    flex: 1,
  },
  bookInfo: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  bookCover: {
    width: 120,
    height: 180,
    borderRadius: 8,
    backgroundColor: '#E5E5E5',
  },
  bookDetails: {
    flex: 1,
    marginLeft: 16,
  },
  bookTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  bookAuthor: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  bookType: {
    fontSize: 14,
    color: '#4F46E5',
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  actionText: {
    fontSize: 14,
    color: '#4F46E5',
    marginLeft: 4,
  },
  descriptionSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  chaptersSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    marginBottom: 24,
  },
  chapterItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  chapterNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  chapterTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
  },
}); 