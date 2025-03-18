import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Pressable,
  ScrollView
} from 'react-native';
import { X } from 'lucide-react-native';
import { Annotation, AnnotationCategories } from '../lib/AnnotationsContext';

const colorOptions = [
  '#FFEB3B', // Amarelo
  '#4CAF50', // Verde
  '#2196F3', // Azul
  '#E91E63', // Rosa
  '#FF9800', // Laranja
  '#9C27B0'  // Roxo
];

type AnnotationModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (content: string, color: string, category?: string) => void;
  existingAnnotation?: Annotation;
};

export default function AnnotationModal({
  visible,
  onClose,
  onSave,
  existingAnnotation
}: AnnotationModalProps) {
  const [content, setContent] = useState('');
  const [selectedColor, setSelectedColor] = useState('#FFEB3B');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);

  // Preencher com dados existentes, se houver
  useEffect(() => {
    if (existingAnnotation) {
      setContent(existingAnnotation.content);
      setSelectedColor(existingAnnotation.color);
      setSelectedCategory(existingAnnotation.category);
    } else {
      setContent('');
      setSelectedColor('#FFEB3B');
      setSelectedCategory(undefined);
    }
  }, [existingAnnotation, visible]);

  const handleSave = () => {
    if (content.trim()) {
      onSave(content.trim(), selectedColor, selectedCategory);
      setContent('');
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {existingAnnotation ? 'Editar Anotação' : 'Nova Anotação'}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <TextInput
                style={styles.input}
                value={content}
                onChangeText={setContent}
                placeholder="Digite sua anotação aqui..."
                multiline
                autoFocus
              />

              <Text style={styles.colorLabel}>Cor do destaque:</Text>
              <View style={styles.colorContainer}>
                {colorOptions.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      selectedColor === color && styles.selectedColor,
                    ]}
                    onPress={() => setSelectedColor(color)}
                  />
                ))}
              </View>

              <Text style={styles.colorLabel}>Categoria:</Text>
              <View style={styles.categoryContainer}>
                <TouchableOpacity
                  style={[
                    styles.categoryChip,
                    !selectedCategory && styles.selectedCategoryChip
                  ]}
                  onPress={() => setSelectedCategory(undefined)}
                >
                  <Text style={[
                    styles.categoryText,
                    !selectedCategory && styles.selectedCategoryText
                  ]}>
                    Sem categoria
                  </Text>
                </TouchableOpacity>
                {AnnotationCategories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryChip,
                      selectedCategory === category && styles.selectedCategoryChip
                    ]}
                    onPress={() => setSelectedCategory(category)}
                  >
                    <Text style={[
                      styles.categoryText,
                      selectedCategory === category && styles.selectedCategoryText
                    ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={onClose}
                >
                  <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.saveButton,
                    !content.trim() && styles.disabledButton,
                  ]}
                  onPress={handleSave}
                  disabled={!content.trim()}
                >
                  <Text style={styles.saveButtonText}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  input: {
    height: 120,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    textAlignVertical: 'top',
    fontSize: 16,
  },
  colorLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#374151',
  },
  colorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
    marginBottom: 8,
  },
  selectedColor: {
    borderWidth: 2,
    borderColor: '#111827',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    marginBottom: 8,
  },
  selectedCategoryChip: {
    backgroundColor: '#4F46E5',
  },
  categoryText: {
    color: '#4B5563',
    fontSize: 14,
  },
  selectedCategoryText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    marginRight: 12,
  },
  saveButton: {
    backgroundColor: '#4F46E5',
  },
  disabledButton: {
    backgroundColor: '#A5B4FC',
    opacity: 0.7,
  },
  buttonText: {
    color: '#4B5563',
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
}); 