import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { supabase } from './supabase';

type FavoritesContextType = {
  favorites: string[];
  isLoading: boolean;
  refreshFavorites: () => Promise<void>;
  isFavorite: (bookId: string) => boolean;
  toggleFavorite: (bookId: string) => Promise<boolean>;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  async function loadFavorites() {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('favorites')
        .select('book_id')
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao carregar favoritos:', error);
        throw error;
      }

      // Extrair apenas os IDs dos livros
      const bookIds = data?.map(item => item.book_id) || [];
      console.log('Favoritos carregados:', bookIds.length);
      setFavorites(bookIds);
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function refreshFavorites() {
    return loadFavorites();
  }

  function isFavorite(bookId: string) {
    return favorites.includes(bookId);
  }

  async function toggleFavorite(bookId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert('Você precisa estar logado para favoritar um livro');
        return false;
      }
      
      const isCurrentlyFavorite = isFavorite(bookId);
      
      if (isCurrentlyFavorite) {
        // Remover dos favoritos
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('book_id', bookId);
        
        if (error) {
          console.error('Erro ao remover favorito:', error);
          return false;
        }
        
        setFavorites(favorites.filter(id => id !== bookId));
      } else {
        // Adicionar aos favoritos
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            book_id: bookId
          });
        
        if (error) {
          console.error('Erro ao adicionar favorito:', error);
          return false;
        }
        
        setFavorites([...favorites, bookId]);
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao alternar favorito:', error);
      return false;
    }
  }

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        isLoading,
        refreshFavorites,
        isFavorite,
        toggleFavorite
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites deve ser usado dentro de um FavoritesProvider');
  }
  return context;
} 