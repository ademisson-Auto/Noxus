import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Modal, FlatList } from 'react-native';
import { supabase } from '../../../lib/supabase';
import LoadingAnimation from '../../../components/LoadingAnimation';
import { BookOpen, Settings, LogOut, X, Clock } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

type UserProfile = {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  books_read: number;
  reading_time: number;
};

type ReadingHistoryItem = {
  id: string;
  last_read: string;
  books: {
    id: string;
    title: string;
    author: string;
    cover_url: string;
  };
  chapters: {
    id: string;
    number: number;
    title: string;
  };
};

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [readingHistory, setReadingHistory] = useState<ReadingHistoryItem[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchUserProfile();
    fetchReadingHistory();
  }, []);

  async function fetchUserProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      setProfile(data || {
        id: user.id,
        username: 'Leitor',
        email: user.email || '',
        avatar_url: null,
        books_read: 0,
        reading_time: 0
      });
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchReadingHistory() {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from('reading_history')
        .select(`
          id,
          last_read,
          books (
            id,
            title,
            author,
            cover_url
          ),
          chapters (
            id,
            number,
            title
          )
        `)
        .eq('user_id', user.id)
        .order('last_read', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      setReadingHistory(data || []);
    } catch (error) {
      console.error('Erro ao buscar histórico de leitura:', error);
    }
  }

  async function handleSignOut() {
    try {
      // Limpar o AsyncStorage
      await AsyncStorage.clear();
      
      // Fazer logout no Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Redirecionar para a tela de login
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Erro ao sair:', error);
      alert('Erro ao sair. Tente novamente.');
    }
  }

  function handleReadingHistory() {
    setShowHistoryModal(true);
  }

  function handleSettings() {
    alert('Funcionalidade de Configurações em desenvolvimento');
  }

  function handleContinueReading(item: ReadingHistoryItem) {
    setShowHistoryModal(false);
    router.push({
      pathname: '/reader/[id]',
      params: { 
        id: item.books.id, 
        chapter: item.chapters.id 
      }
    });
  }

  if (loading) {
    return <LoadingAnimation />;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Perfil</Text>
        <TouchableOpacity style={styles.settingsButton} onPress={handleSettings}>
          <Settings size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        <Image
          source={
            profile?.avatar_url
              ? { uri: profile.avatar_url }
              : { uri: 'https://via.placeholder.com/100x100' }
          }
          style={styles.avatar}
        />
        <Text style={styles.username}>{profile?.username}</Text>
        <Text style={styles.email}>{profile?.email}</Text>
      </View>

      <View style={styles.statsSection}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{profile?.books_read || 0}</Text>
          <Text style={styles.statLabel}>Livros Lidos</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{Math.floor((profile?.reading_time || 0) / 60)}</Text>
          <Text style={styles.statLabel}>Horas de Leitura</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.continueReading} 
        onPress={() => readingHistory.length > 0 && handleContinueReading(readingHistory[0])}
        disabled={readingHistory.length === 0}
      >
        <Clock size={20} color="#4F46E5" />
        <View style={styles.continueReadingText}>
          <Text style={styles.continueReadingTitle}>Continuar Lendo</Text>
          {readingHistory.length > 0 ? (
            <Text style={styles.continueReadingSubtitle} numberOfLines={1}>
              {readingHistory[0].books.title} - Cap. {readingHistory[0].chapters.number}
            </Text>
          ) : (
            <Text style={styles.continueReadingSubtitle}>Nenhuma leitura recente</Text>
          )}
        </View>
      </TouchableOpacity>

      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem} onPress={handleReadingHistory}>
          <BookOpen size={20} color="#4F46E5" />
          <Text style={styles.menuText}>Histórico de Leitura</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem} onPress={handleSettings}>
          <Settings size={20} color="#4F46E5" />
          <Text style={styles.menuText}>Configurações</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.menuItem, styles.signOutButton]} onPress={handleSignOut}>
          <LogOut size={20} color="#EF4444" />
          <Text style={[styles.menuText, styles.signOutText]}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* Modal para histórico de leitura */}
      <Modal
        visible={showHistoryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowHistoryModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Histórico de Leitura</Text>
              <TouchableOpacity onPress={() => setShowHistoryModal(false)}>
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {readingHistory.length > 0 ? (
              <FlatList
                data={readingHistory}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.historyItem}
                    onPress={() => handleContinueReading(item)}
                  >
                    <Image 
                      source={{ uri: item.books.cover_url || 'https://via.placeholder.com/60x90' }} 
                      style={styles.historyCover} 
                    />
                    <View style={styles.historyInfo}>
                      <Text style={styles.historyTitle} numberOfLines={1}>{item.books.title}</Text>
                      <Text style={styles.historyChapter}>Capítulo {item.chapters.number}: {item.chapters.title}</Text>
                      <Text style={styles.historyDate}>{formatDate(item.last_read)}</Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            ) : (
              <View style={styles.emptyHistory}>
                <Text style={styles.emptyHistoryText}>Nenhum histórico de leitura</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 30,
  },
  settingsButton: {
    marginTop: 30,
  },
  profileSection: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E5E5E5',
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
  },
  email: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  statsSection: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  divider: {
    width: 1,
    backgroundColor: '#E5E5E5',
    height: '100%',
  },
  continueReading: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  continueReadingText: {
    marginLeft: 12,
    flex: 1,
  },
  continueReadingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  continueReadingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  menuSection: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  menuText: {
    fontSize: 16,
    color: '#111827',
    marginLeft: 12,
  },
  signOutButton: {
    borderBottomWidth: 0,
  },
  signOutText: {
    color: '#EF4444',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  historyItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  historyCover: {
    width: 60,
    height: 90,
    borderRadius: 8,
    backgroundColor: '#E5E5E5',
  },
  historyInfo: {
    marginLeft: 12,
    flex: 1,
    justifyContent: 'center',
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  historyChapter: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  historyDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  emptyHistory: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyHistoryText: {
    fontSize: 16,
    color: '#6B7280',
  },
}); 