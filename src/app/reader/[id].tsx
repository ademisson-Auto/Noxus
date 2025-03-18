import { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, ChevronLeft, ChevronRight, Settings, BookOpen, MessageSquare } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { useAnnotations, Annotation } from '../../lib/AnnotationsContext';
import AnnotationModal from '../../components/AnnotationModal';
import TextHighlighter from '../../components/TextHighlighter';

type Chapter = {
  id: string;
  number: number;
  title: string;
  content_url: string;
  books: {
    id: string;
    title: string;
    type: 'manga' | 'light_novel' | 'ebook';
  };
};

export default function Reader() {
  const { id, chapter: chapterId, position, annotationId } = useLocalSearchParams();
  const scrollViewRef = useRef<ScrollView>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [previousChapter, setPreviousChapter] = useState<string | null>(null);
  const [nextChapter, setNextChapter] = useState<string | null>(null);
  const [annotationModalVisible, setAnnotationModalVisible] = useState(false);
  const [currentAnnotation, setCurrentAnnotation] = useState<Annotation | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const [chapterAnnotations, setChapterAnnotations] = useState<Annotation[]>([]);
  const [highlightedAnnotation, setHighlightedAnnotation] = useState<string | null>(null);
  const { addAnnotation, updateAnnotation, deleteAnnotation, getChapterAnnotations } = useAnnotations();

  useEffect(() => {
    fetchChapterDetails();
    if (chapterId) {
      loadAnnotations();
    }
  }, [id, chapterId]);

  // Efeito para mover para a posição da anotação quando carregado
  useEffect(() => {
    if (!loading && position && scrollViewRef.current) {
      // Implementação básica - em uma app real você precisaria calcular 
      // a posição real baseada no layout e caracteres
      const positionValue = parseInt(position as string);
      
      // Esperar um pouco para garantir que o conteúdo esteja renderizado
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: positionValue * 100, // Valor aproximado para simulação
          animated: true
        });
        
        // Destacar a anotação selecionada
        if (annotationId) {
          setHighlightedAnnotation(annotationId as string);
          
          // Resetar após alguns segundos
          setTimeout(() => {
            setHighlightedAnnotation(null);
          }, 3000);
        }
      }, 500);
    }
  }, [loading, position, annotationId]);

  async function fetchChapterDetails() {
    try {
      // Buscar detalhes do capítulo atual
      const { data, error } = await supabase
        .from('chapters')
        .select(`
          *,
          books (
            id,
            title,
            type
          )
        `)
        .eq('book_id', id)
        .eq('id', chapterId)
        .single();

      if (error) throw error;
      setChapter(data);

      // Salvar no histórico de leitura
      await saveReadingHistory(data);

      // Buscar capítulos anterior e próximo
      const { data: chaptersData, error: chaptersError } = await supabase
        .from('chapters')
        .select('id, number')
        .eq('book_id', id)
        .order('number', { ascending: true });

      if (chaptersError) throw chaptersError;

      if (chaptersData && chaptersData.length > 0) {
        const currentIndex = chaptersData.findIndex(c => c.id === chapterId);
        
        if (currentIndex > 0) {
          setPreviousChapter(chaptersData[currentIndex - 1].id);
        }
        
        if (currentIndex < chaptersData.length - 1) {
          setNextChapter(chaptersData[currentIndex + 1].id);
        }
      }
    } catch (error) {
      console.error('Error fetching chapter:', error);
    } finally {
      setLoading(false);
    }
  }

  async function saveReadingHistory(chapterData: Chapter) {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) return;

      // Verificar se já existe um registro
      const { data: existingHistory } = await supabase
        .from('reading_history')
        .select('*')
        .eq('user_id', user.user.id)
        .eq('book_id', id)
        .eq('chapter_id', chapterId)
        .single();

      if (existingHistory) {
        // Atualizar o registro existente
        await supabase
          .from('reading_history')
          .update({
            last_read: new Date().toISOString(),
            progress: 100 // Consideramos que abrir o capítulo significa ler 100%
          })
          .eq('id', existingHistory.id);
      } else {
        // Inserir novo registro
        await supabase
          .from('reading_history')
          .insert({
            user_id: user.user.id,
            book_id: id,
            chapter_id: chapterId,
            progress: 100,
            last_read: new Date().toISOString()
          });
      }

      // Atualizar a contagem de livros lidos e tempo de leitura
      await updateReadingStats(user.user.id);
    } catch (error) {
      console.error('Error saving reading history:', error);
    }
  }

  async function updateReadingStats(userId: string) {
    try {
      // Obter o perfil atual
      const { data: profile } = await supabase
        .from('profiles')
        .select('books_read, reading_time')
        .eq('id', userId)
        .single();

      if (profile) {
        // Atualizar o tempo de leitura (adicionando 5 minutos por capítulo lido)
        await supabase
          .from('profiles')
          .update({
            reading_time: profile.reading_time + 5
          })
          .eq('id', userId);
      }
    } catch (error) {
      console.error('Error updating reading stats:', error);
    }
  }

  async function loadAnnotations() {
    if (!chapterId) return;
    
    try {
      const annotations = await getChapterAnnotations(chapterId as string);
      setChapterAnnotations(annotations);
    } catch (error) {
      console.error('Erro ao carregar anotações:', error);
    }
  }

  function handleNavigateToChapter(targetChapterId: string) {
    if (!targetChapterId) return;
    
    router.push({
      pathname: '/reader/[id]',
      params: { id: id as string, chapter: targetChapterId }
    });
  }

  // Adicionar uma nova anotação
  function handleAddAnnotation() {
    if (!chapter) return;
    
    // Para demonstração, usamos uma posição fixa. 
    // Em um app real, isso viria da seleção de texto pelo usuário
    setSelectedPosition(Math.floor(Math.random() * 1000)); // Simulação de posição
    setCurrentAnnotation(null);
    setAnnotationModalVisible(true);
  }

  // Editar uma anotação existente
  function handleEditAnnotation(annotation: Annotation) {
    setCurrentAnnotation(annotation);
    setAnnotationModalVisible(true);
  }

  // Excluir anotação
  async function handleDeleteAnnotation(annotationId: string) {
    const success = await deleteAnnotation(annotationId);
    if (success) {
      setChapterAnnotations(prev => prev.filter(a => a.id !== annotationId));
      Alert.alert('Sucesso', 'Anotação excluída com sucesso');
    } else {
      Alert.alert('Erro', 'Não foi possível excluir a anotação');
    }
  }

  // Salvar anotação (nova ou editada)
  async function handleSaveAnnotation(content: string, color: string) {
    if (!chapter) return;
    
    try {
      if (currentAnnotation) {
        // Atualizar anotação existente
        const success = await updateAnnotation(currentAnnotation.id, content, color);
        if (success) {
          setChapterAnnotations(prev => 
            prev.map(a => a.id === currentAnnotation.id ? { ...a, content, color } : a)
          );
          Alert.alert('Sucesso', 'Anotação atualizada com sucesso');
        }
      } else {
        // Adicionar nova anotação
        const position = selectedPosition || 0;
        const newAnnotation = await addAnnotation(
          chapter.books.id,
          chapterId as string,
          content,
          position,
          color
        );
        
        if (newAnnotation) {
          setChapterAnnotations(prev => [newAnnotation, ...prev]);
          Alert.alert('Sucesso', 'Anotação adicionada com sucesso');
        }
      }
    } catch (error) {
      console.error('Erro ao salvar anotação:', error);
      Alert.alert('Erro', 'Não foi possível salvar a anotação');
    } finally {
      setAnnotationModalVisible(false);
      setCurrentAnnotation(null);
      setSelectedPosition(null);
    }
  }

  // Visualizar anotações
  function handleShowAnnotations() {
    if (!chapter || !chapterId) {
      Alert.alert('Erro', 'Informações do capítulo não disponíveis');
      return;
    }
    
    if (chapterAnnotations.length === 0) {
      Alert.alert(
        'Anotações', 
        'Você ainda não tem anotações para este capítulo.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Criar Anotação', onPress: handleAddAnnotation }
        ]
      );
      return;
    }
    
    // Navegar para a tela de anotações com parâmetros explícitos
    const chapterIdString = typeof chapterId === 'string' ? chapterId : String(chapterId);
    
    const params = { 
      id: chapterIdString, 
      bookId: chapter.books.id, 
      bookTitle: chapter.books.title 
    };
    
    console.log('Navegando para anotações com params:', JSON.stringify(params));
    console.log('Tipo de chapterId:', typeof chapterId);
    console.log('Valor de chapterId:', chapterId);
    console.log(`Total de anotações sendo passadas: ${chapterAnnotations.length}`);
    
    router.push({
      pathname: '/annotations/[id]',
      params
    });
  }

  // Conteúdo simulado do capítulo (em um app real, isso viria de uma API)
  const chapterContent = `Este é o conteúdo do capítulo ${chapter?.number} de ${chapter?.books.title}.
O conteúdo real seria carregado de ${chapter?.content_url}.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec auctor, nisl eget ultricies tincidunt, nisl enim aliquam nisl, eget ultricies nisl enim eget nisl. Donec auctor, nisl eget ultricies tincidunt, nisl enim aliquam nisl, eget ultricies nisl enim eget nisl.

Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Donec auctor, nisl eget ultricies tincidunt, nisl enim aliquam nisl, eget ultricies nisl enim eget nisl. Donec auctor, nisl eget ultricies tincidunt, nisl enim aliquam nisl.

Mauris vehicula, nisl eget ultricies tincidunt, nisl enim aliquam nisl, eget ultricies nisl enim eget nisl. Donec auctor, nisl eget ultricies tincidunt, nisl enim aliquam nisl, eget ultricies nisl enim eget nisl.`;

  // Adicionar uma anotação com texto destacado
  async function handleHighlightText(text: string, position: number, color: string) {
    if (!chapter) return;
    
    try {
      console.log(`Criando anotação para o livro ID: ${chapter.books.id}, capítulo ID: ${chapterId}`);
      
      const newAnnotation = await addAnnotation(
        chapter.books.id,
        chapterId as string,
        text,
        position,
        color
      );
      
      if (newAnnotation) {
        console.log(`Anotação criada com sucesso: ${JSON.stringify(newAnnotation)}`);
        setChapterAnnotations(prev => [newAnnotation, ...prev]);
        Alert.alert('Sucesso', 'Destaque adicionado com sucesso');
      }
    } catch (error) {
      console.error('Erro ao adicionar destaque:', error);
      Alert.alert('Erro', 'Não foi possível adicionar o destaque');
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Carregando capítulo...</Text>
      </View>
    );
  }

  if (!chapter) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Capítulo não encontrado</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Text style={styles.bookTitle}>{chapter.books.title}</Text>
          <Text style={styles.chapterTitle}>
            Capítulo {chapter.number}: {chapter.title}
          </Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleAddAnnotation}
          >
            <MessageSquare size={24} color="#333" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleShowAnnotations}
          >
            <BookOpen size={24} color="#333" />
            {chapterAnnotations.length > 0 && (
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{chapterAnnotations.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Usar o TextHighlighter em vez do ScrollView com Text */}
      <TextHighlighter
        ref={scrollViewRef}
        contentText={chapter?.content_url || 'Conteúdo não disponível'}
        onHighlight={handleHighlightText}
        highlightedAnnotationId={highlightedAnnotation}
        annotations={chapterAnnotations}
      />

      {/* Navegação entre capítulos */}
      <View style={styles.navigation}>
        <TouchableOpacity
          style={[styles.navButton, !previousChapter && styles.disabledButton]}
          onPress={() => previousChapter && handleNavigateToChapter(previousChapter)}
          disabled={!previousChapter}
        >
          <ChevronLeft size={24} color={previousChapter ? '#333' : '#CCC'} />
          <Text style={[styles.navButtonText, !previousChapter && styles.disabledText]}>
            Anterior
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.navButton, !nextChapter && styles.disabledButton]}
          onPress={() => nextChapter && handleNavigateToChapter(nextChapter)}
          disabled={!nextChapter}
        >
          <Text style={[styles.navButtonText, !nextChapter && styles.disabledText]}>
            Próximo
          </Text>
          <ChevronRight size={24} color={nextChapter ? '#333' : '#CCC'} />
        </TouchableOpacity>
      </View>

      {/* Modal de Anotação */}
      <AnnotationModal
        visible={annotationModalVisible}
        onClose={() => {
          setAnnotationModalVisible(false);
          setCurrentAnnotation(null);
        }}
        onSave={handleSaveAnnotation}
        existingAnnotation={currentAnnotation || undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    fontSize: 18,
    color: '#ef4444',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  headerButton: {
    padding: 8,
  },
  headerInfo: {
    flex: 1,
    marginHorizontal: 12,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  chapterTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  chapterContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#f1f5f9',
  },
  navButtonText: {
    fontSize: 16,
    color: '#333',
    marginHorizontal: 8,
  },
  disabledText: {
    color: '#CCC',
  },
  headerActions: {
    flexDirection: 'row',
  },
  badgeContainer: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#4F46E5',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
}); 