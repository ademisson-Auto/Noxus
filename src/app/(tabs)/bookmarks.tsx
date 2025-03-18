import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';
import { useFavorites } from '../../lib/FavoritesContext';
import LoadingAnimation from '../../components/LoadingAnimation';
import { supabase } from '../../lib/supabase';
import { useFocusEffect } from '@react-navigation/native';

type BookmarkItem = {
  id: string;
  books: {
    id: string;
    title: string;
    author: string;
    cover_url: string;
    type: string;
  };
};

export default function BookmarksScreen() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { favorites, refreshFavorites, isLoading: isFavoritesLoading } = useFavorites();

  // Atualizar favoritos ao entrar na tela
  useFocusEffect(
    React.useCallback(() => {
      console.log('Tela de favoritos recebeu foco, atualizando...');
      setIsLoading(true); // Inicia o carregamento ao receber foco
      
      const loadFavorites = async () => {
        try {
          await refreshFavorites();
          await fetchBookmarks();
        } catch (error) {
          console.error('Erro ao atualizar favoritos:', error);
        }
      };
      
      loadFavorites();
      
      return () => {
        // Cleanup quando a tela perde o foco
      };
    }, [])
  );

  // Carregar dados iniciais
  useEffect(() => {
    if (!isFavoritesLoading) { // Só busca livros quando a lista de favoritos estiver pronta
      fetchBookmarks();
    }
  }, [favorites, isFavoritesLoading]);

  async function fetchBookmarks() {
    try {
      if (isFavoritesLoading) {
        return; // Se ainda estiver carregando favoritos, espera
      }
      
      setIsLoading(true);
      
      if (favorites.length === 0) {
        setBookmarks([]);
        setIsLoading(false);
        return;
      }

      console.log('Buscando detalhes para', favorites.length, 'favoritos');
      
      const { data, error } = await supabase
        .from('books')
        .select(`
          id,
          title,
          author,
          cover_url,
          type
        `)
        .in('id', favorites);

      if (error) {
        console.error('Erro na consulta de favoritos:', error);
        throw error;
      }
      
      // Aguardar um momento para garantir que todos os dados estejam disponíveis
      // e evitar a sensação de carregamento parcial
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log('Livros favoritos encontrados:', data?.length || 0);
      
      // Transformar os dados para o formato esperado
      const formattedData = data?.map(book => ({
        id: book.id,
        books: book
      })) || [];
      
      setBookmarks(formattedData);
    } catch (error) {
      console.error('Erro ao buscar favoritos:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleBookPress(bookId: string) {
    router.push(`/library/${bookId}`);
  }

  if (isLoading || isFavoritesLoading) {
    return <LoadingAnimation message={isLoading ? 'Buscando seus livros favoritos...' : 'Preparando seus favoritos...'} />;
  }

  if (bookmarks.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Você ainda não adicionou nenhum livro aos favoritos</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meus Favoritos</Text>
      <FlatList
        data={bookmarks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.bookItem}
            onPress={() => handleBookPress(item.books.id)}
          >
            <Image 
              source={{ uri: item.books.cover_url }} 
              style={styles.bookCover}
            />
            <View style={styles.bookInfo}>
              <Text style={styles.bookTitle}>{item.books.title}</Text>
              <Text style={styles.bookAuthor}>{item.books.author}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 40,
  },
  bookItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  bookCover: {
    width: 70,
    height: 100,
    borderRadius: 8,
  },
  bookInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
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
  emptyContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});