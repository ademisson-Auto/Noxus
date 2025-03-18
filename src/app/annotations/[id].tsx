import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Edit, Trash2, Share, Settings } from 'lucide-react-native';
import { useAnnotations, Annotation } from '../../lib/AnnotationsContext';
import AnnotationModal from '../../components/AnnotationModal';
import LoadingAnimation from '../../components/LoadingAnimation';
import { exportAnnotationsAsPDF } from '../../utils/exportAnnotations';
import { supabase } from '../../lib/supabase';

export default function AnnotationsScreen() {
  const params = useLocalSearchParams();
  const id = params.id as string;
  const bookId = params.bookId as string;
  const bookTitle = params.bookTitle as string;
  
  const [loading, setLoading] = useState(true);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [editingAnnotation, setEditingAnnotation] = useState<Annotation | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { getChapterAnnotations, updateAnnotation, deleteAnnotation } = useAnnotations();

  useEffect(() => {
    if (id) {
      console.log(`Carregando anotações para o capítulo com ID: ${id}`);
      loadAnnotations();
    } else {
      console.error('ID do capítulo não fornecido');
      Alert.alert('Erro', 'Não foi possível identificar o capítulo');
    }
  }, [id]);

  async function loadAnnotations() {
    try {
      setLoading(true);
      console.log(`Buscando anotações para o capítulo: ${id}`);
      
      // Primeiro tentar com getChapterAnnotations que usa o cache
      let chapterAnnotations = await getChapterAnnotations(id);
      
      if (chapterAnnotations.length === 0) {
        console.log('Não foram encontradas anotações. Tentando buscar diretamente do Supabase...');
        
        try {
          // Tentar buscar diretamente do Supabase sem filtrar pelo estado global
          const { data, error } = await supabase
            .from('annotations')
            .select('*')
            .eq('chapter_id', id);
          
          if (error) {
            console.error('Erro ao buscar diretamente do Supabase:', error);
          } else if (data && data.length > 0) {
            console.log(`Encontradas ${data.length} anotações diretamente do Supabase`);
            chapterAnnotations = data;
          }
        } catch (directError) {
          console.error('Erro ao buscar diretamente do Supabase:', directError);
        }
      }
      
      console.log(`${chapterAnnotations.length} anotações encontradas no total`);
      
      // Forçar atualização do estado global com estas anotações para manter sincronização
      if (chapterAnnotations.length > 0) {
        console.log('Atualizando estado local com anotações encontradas');
      }
      
      setAnnotations(chapterAnnotations);
    } catch (error) {
      console.error('Erro ao carregar anotações:', error);
      Alert.alert('Erro', 'Não foi possível carregar as anotações');
    } finally {
      setLoading(false);
    }
  }

  async function handleEditAnnotation(annotation: Annotation) {
    setEditingAnnotation(annotation);
    setModalVisible(true);
  }

  async function handleSaveAnnotation(content: string, color: string, category?: string) {
    if (!editingAnnotation) return;

    try {
      const success = await updateAnnotation(editingAnnotation.id, content, color, category);
      if (success) {
        setAnnotations(prev => 
          prev.map(a => a.id === editingAnnotation.id ? { ...a, content, color, category } : a)
        );
        Alert.alert('Sucesso', 'Anotação atualizada com sucesso');
      }
    } catch (error) {
      console.error('Erro ao atualizar anotação:', error);
      Alert.alert('Erro', 'Não foi possível atualizar a anotação');
    } finally {
      setModalVisible(false);
      setEditingAnnotation(null);
    }
  }

  async function handleDeleteAnnotation(annotationId: string) {
    try {
      // Verificar se a anotação existe localmente antes de tentar excluir
      const annotationExists = annotations.some(a => a.id === annotationId);
      if (!annotationExists) {
        console.error(`Anotação com ID ${annotationId} não encontrada localmente.`);
        Alert.alert(
          'Erro',
          'Esta anotação não foi encontrada. A tela será atualizada.',
          [{ 
            text: 'OK', 
            onPress: () => loadAnnotations() 
          }]
        );
        return;
      }

      Alert.alert(
        'Confirmação',
        'Tem certeza que deseja excluir esta anotação?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Excluir', 
            style: 'destructive',
            onPress: async () => {
              try {
                setLoading(true);
                console.log(`Excluindo anotação ID: ${annotationId}`);
                
                const success = await deleteAnnotation(annotationId);
                
                if (success) {
                  console.log(`Exclusão bem-sucedida para ID: ${annotationId}`);
                  // Atualizar o estado local com as anotações filtradas
                  setAnnotations((prev) => prev.filter(a => a.id !== annotationId));
                  
                  setTimeout(() => {
                    Alert.alert('Sucesso', 'Anotação excluída com sucesso');
                  }, 300);
                } else {
                  console.error(`Falha na exclusão para ID: ${annotationId}`);
                  // Tentar recarregar anotações para garantir sincronia
                  await loadAnnotations();
                  
                  setTimeout(() => {
                    Alert.alert('Erro', 'Não foi possível excluir a anotação. A tela foi atualizada.');
                  }, 300);
                }
              } catch (error) {
                console.error('Erro ao excluir anotação:', error);
                // Recarregar para garantir sincronia
                await loadAnnotations();
                
                setTimeout(() => {
                  Alert.alert('Erro', 'Ocorreu um erro ao excluir a anotação. A tela foi atualizada.');
                }, 300);
              } finally {
                setLoading(false);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Erro ao mostrar diálogo de confirmação:', error);
    }
  }

  async function handleExportAnnotations() {
    try {
      const success = await exportAnnotationsAsPDF({
        bookTitle: bookTitle as string,
        annotations: annotations
      });
      if (success) {
        Alert.alert('Sucesso', 'Anotações exportadas com sucesso');
      }
    } catch (error) {
      console.error('Erro ao exportar anotações:', error);
      Alert.alert('Erro', 'Não foi possível exportar as anotações');
    }
  }

  function navigateToReadingPosition(annotation: Annotation) {
    console.log(`Navegando para a posição da anotação: ${annotation.id}`);
    console.log(`Parâmetros: bookId=${bookId}, chapter=${annotation.chapter_id}, position=${annotation.position}`);
    
    // Parâmetros explícitos para evitar problemas de tipagem
    const params = { 
      id: bookId, 
      chapter: annotation.chapter_id,
      position: annotation.position.toString(),
      annotationId: annotation.id
    };
    
    router.push({
      pathname: '/reader/[id]',
      params
    });
  }

  function renderAnnotationItem({ item }: { item: Annotation }) {
    return (
      <TouchableOpacity 
        style={[styles.annotationItem, { borderLeftColor: item.color || '#4F46E5' }]}
        onPress={() => navigateToReadingPosition(item)}
      >
        <View style={styles.annotationHeader}>
          <Text style={styles.timestamp}>
            {new Date(item.created_at).toLocaleDateString('pt-BR')}
          </Text>
          {item.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.annotationContent}>{item.content}</Text>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleEditAnnotation(item)}
          >
            <Edit size={18} color="#4F46E5" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleDeleteAnnotation(item.id)}
          >
            <Trash2 size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle} numberOfLines={1}>Anotações</Text>
        
        <TouchableOpacity 
          style={styles.exportButton}
          onPress={handleExportAnnotations}
        >
          <Share size={24} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle}>{bookTitle}</Text>
      </View>

      {loading ? (
        <LoadingAnimation message="Carregando anotações..." />
      ) : annotations.length > 0 ? (
        <FlatList
          data={annotations}
          renderItem={renderAnnotationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhuma anotação encontrada para este capítulo</Text>
        </View>
      )}

      {/* Modal para edição de anotação */}
      <AnnotationModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditingAnnotation(null);
        }}
        onSave={handleSaveAnnotation}
        existingAnnotation={editingAnnotation || undefined}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    color: '#111827',
  },
  exportButton: {
    padding: 8,
  },
  bookInfo: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  listContainer: {
    padding: 16,
  },
  annotationItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  annotationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#6B7280',
  },
  categoryBadge: {
    backgroundColor: '#EBF5FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    color: '#2563EB',
  },
  annotationContent: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
}); 