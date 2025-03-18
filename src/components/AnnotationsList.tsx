import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Annotation, useAnnotations } from '../lib/AnnotationsContext';
import { Edit2, Trash2, Tag } from 'lucide-react-native';

type AnnotationsListProps = {
  annotations: Annotation[];
  onEditAnnotation: (annotation: Annotation) => void;
  onDeleteAnnotation: (annotation: Annotation) => void;
  onAnnotationPress: (annotation: Annotation) => void;
};

export default function AnnotationsList({
  annotations,
  onEditAnnotation,
  onDeleteAnnotation,
  onAnnotationPress
}: AnnotationsListProps) {
  
  const confirmDelete = (annotation: Annotation) => {
    Alert.alert(
      'Excluir Anotação',
      'Tem certeza que deseja excluir esta anotação?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          onPress: () => onDeleteAnnotation(annotation),
          style: 'destructive'
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      
      // Formatação manual para português
      const day = date.getDate().toString().padStart(2, '0');
      const months = [
        'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
        'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
      ];
      const month = months[date.getMonth()];
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      return `${day} de ${month} às ${hours}:${minutes}`;
    } catch (error) {
      return dateString;
    }
  };
  
  const renderItem = ({ item }: { item: Annotation }) => (
    <TouchableOpacity 
      style={[styles.annotationItem, { borderLeftColor: item.color }]}
      onPress={() => onAnnotationPress(item)}
    >
      <View style={styles.annotationContent}>
        <Text style={styles.annotationText} numberOfLines={3}>
          {item.content}
        </Text>
        
        <View style={styles.annotationFooter}>
          <Text style={styles.annotationDate}>
            {formatDate(item.updated_at)}
          </Text>
          
          {item.category && (
            <View style={styles.categoryChip}>
              <Tag size={12} color="#4F46E5" style={styles.categoryIcon} />
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.annotationActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => onEditAnnotation(item)}
        >
          <Edit2 size={20} color="#555" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => confirmDelete(item)}
        >
          <Trash2 size={20} color="#E53E3E" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {annotations.length > 0 ? (
        <FlatList
          data={annotations}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Você ainda não tem nenhuma anotação
          </Text>
          <Text style={styles.emptySubText}>
            Selecione um trecho do texto durante a leitura para criar uma anotação
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  annotationItem: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    borderLeftWidth: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  annotationContent: {
    flex: 1,
  },
  annotationText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  annotationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  annotationDate: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  annotationActions: {
    justifyContent: 'space-around',
    paddingLeft: 8,
  },
  actionButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  categoryIcon: {
    marginRight: 3,
  },
  categoryText: {
    fontSize: 11,
    color: '#4F46E5',
    fontWeight: '500',
  },
}); 