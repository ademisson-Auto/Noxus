import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft, Tag } from 'lucide-react-native';
import { useAnnotations, Annotation, AnnotationCategories } from '../../../lib/AnnotationsContext';
import AnnotationsList from '../../../components/AnnotationsList';
import AnnotationModal from '../../../components/AnnotationModal';
import LoadingAnimation from '../../../components/LoadingAnimation';

type GroupedAnnotations = {
  [key: string]: Annotation[];
};

export default function BookAnnotationsScreen() {
  const { id: bookId, title } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [groupedAnnotations, setGroupedAnnotations] = useState<GroupedAnnotations>({});
  const [currentAnnotation, setCurrentAnnotation] = useState<Annotation | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { getBookAnnotations, updateAnnotation, deleteAnnotation } = useAnnotations();

  useEffect(() => {
    if (bookId) {
      loadAnnotations();
    }
  }, [bookId]);

  useEffect(() => {
    if (annotations.length > 0) {
      groupAnnotationsByCategory();
    }
  }, [annotations]);

  async function loadAnnotations() {
    try {
      setLoading(true);
      const data = await getBookAnnotations(bookId as string);
      setAnnotations(data);
    } catch (error) {
      console.error('Erro ao carregar anotações:', error);
    } finally {
      setLoading(false);
    }
  }

  function groupAnnotationsByCategory() {
    const grouped: GroupedAnnotations = {};

    // Inicializa com "Sem categoria" e todas as categorias possíveis
    grouped['Sem categoria'] = [];
    AnnotationCategories.forEach(category => {
      grouped[category] = [];
    });

    // Agrupa as anotações por categoria
    annotations.forEach(annotation => {
      if (annotation.category) {
        grouped[annotation.category].push(annotation);
      } else {
        grouped['Sem categoria'].push(annotation);
      }
    });

    // Remove categorias vazias
    Object.keys(grouped).forEach(category => {
      if (grouped[category].length === 0) {
        delete grouped[category];
      }
    });

    setGroupedAnnotations(grouped);
  }

  function handleEditAnnotation(annotation: Annotation) {
    setCurrentAnnotation(annotation);
    setModalVisible(true);
  }

  async function handleDeleteAnnotation(annotation: Annotation) {
    const success = await deleteAnnotation(annotation.id);
    if (success) {
      setAnnotations(prev => prev.filter(a => a.id !== annotation.id));
    }
  }

  async function handleSaveAnnotation(content: string, color: string, category?: string) {
    if (!currentAnnotation) return;

    try {
      const success = await updateAnnotation(currentAnnotation.id, content, color, category);
      if (success) {
        setAnnotations(prev => 
          prev.map(a => a.id === currentAnnotation.id ? 
            { ...a, content, color, category, updated_at: new Date().toISOString() } : a)
        );
      }
    } catch (error) {
      console.error('Erro ao salvar anotação:', error);
    } finally {
      setModalVisible(false);
      setCurrentAnnotation(null);
    }
  }

  function renderCategorySection(category: string, annotations: Annotation[]) {
    return (
      <View key={category} style={styles.categorySection}>
        <View style={styles.categoryHeader}>
          <Tag size={18} color="#4F46E5" />
          <Text style={styles.categoryTitle}>{category}</Text>
          <Text style={styles.categoryCount}>
            {annotations.length} {annotations.length === 1 ? 'anotação' : 'anotações'}
          </Text>
        </View>
        <AnnotationsList
          annotations={annotations}
          onEditAnnotation={handleEditAnnotation}
          onDeleteAnnotation={handleDeleteAnnotation}
          onAnnotationPress={() => {}}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Anotações</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <View style={styles.bookInfoContainer}>
        <Text style={styles.bookTitle}>{title}</Text>
        <Text style={styles.annotationCount}>
          {annotations.length} {annotations.length === 1 ? 'anotação' : 'anotações'} no total
        </Text>
      </View>

      {loading ? (
        <LoadingAnimation message="Carregando anotações..." />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {Object.keys(groupedAnnotations).length > 0 ? (
            Object.entries(groupedAnnotations).map(([category, items]) => 
              renderCategorySection(category, items)
            )
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>Nenhuma anotação encontrada</Text>
              <Text style={styles.emptySubtitle}>
                Você ainda não criou nenhuma anotação para este livro
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      <AnnotationModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveAnnotation}
        existingAnnotation={currentAnnotation || undefined}
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
    alignItems: 'center',
    justifyContent: 'space-between',
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
  },
  headerPlaceholder: {
    width: 40,
  },
  bookInfoContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  bookTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  annotationCount: {
    fontSize: 15,
    color: '#6B7280',
  },
  content: {
    padding: 16,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
    marginRight: 8,
  },
  categoryCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  emptyContainer: {
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
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
}); 