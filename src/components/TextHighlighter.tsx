import React, { useState, forwardRef, useImperativeHandle, ForwardRefRenderFunction } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView
} from 'react-native';
import { X } from 'lucide-react-native';
import { Annotation } from '../lib/AnnotationsContext';

const colorOptions = [
  '#FFEB3B', // Amarelo (default)
  '#4CAF50', // Verde
  '#2196F3', // Azul
  '#E91E63', // Rosa
  '#FF9800', // Laranja
  '#9C27B0'  // Roxo
];

type TextHighlighterProps = {
  contentText: string;
  onHighlight: (text: string, position: number, color: string) => void;
  highlightedAnnotationId?: string | null;
  annotations?: Annotation[];
};

// Dividir o conteúdo em parágrafos para facilitar a seleção
const splitIntoParagraphs = (text: string) => {
  return text.split('\n').filter(para => para.trim().length > 0);
};

const TextHighlighterComponent: ForwardRefRenderFunction<ScrollView, TextHighlighterProps> = (
  { contentText, onHighlight, highlightedAnnotationId, annotations = [] },
  ref
) => {
  const [selectedText, setSelectedText] = useState('');
  const [selectedPosition, setSelectedPosition] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedColor, setSelectedColor] = useState(colorOptions[0]);
  const [notes, setNotes] = useState('');
  
  const paragraphs = splitIntoParagraphs(contentText);

  const handleParagraphPress = (text: string, index: number) => {
    // Simples demonstração - em um app real, poderíamos usar long-press
    // ou implementar uma seleção de texto personalizada
    setSelectedText(text);
    setSelectedPosition(index);
    setModalVisible(true);
  };

  const handleSaveHighlight = () => {
    if (selectedText.trim()) {
      onHighlight(selectedText, selectedPosition, selectedColor);
      setModalVisible(false);
      setSelectedText('');
      setNotes('');
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedText('');
    setNotes('');
  };

  // Verifica se o parágrafo tem alguma anotação associada
  const findAnnotationForParagraph = (index: number) => {
    return annotations.find(ann => ann.position === index);
  };

  // Verifica se a anotação está destacada (selecionada)
  const isHighlighted = (annotationId: string) => {
    return highlightedAnnotationId === annotationId;
  };

  return (
    <>
      <ScrollView
        ref={ref}
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        {paragraphs.map((paragraph, index) => {
          const annotation = findAnnotationForParagraph(index);
          const highlighted = annotation ? isHighlighted(annotation.id) : false;
          
          return (
            <TouchableOpacity
              key={index}
              onPress={() => handleParagraphPress(paragraph, index)}
              style={[
                styles.paragraph,
                annotation && { borderLeftWidth: 3, borderLeftColor: annotation.color },
                highlighted && styles.highlightedParagraph
              ]}
            >
              <Text style={[
                styles.text,
                highlighted && styles.highlightedText
              ]}>
                {paragraph}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Modal
        transparent
        visible={modalVisible}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Destacar texto</Text>
              <TouchableOpacity onPress={closeModal}>
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.selectedTextContainer}>
              <Text style={styles.selectedText}>{selectedText}</Text>
            </View>

            <Text style={styles.colorLabel}>Escolha uma cor:</Text>
            <View style={styles.colorContainer}>
              {colorOptions.map(color => (
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

            <TextInput
              style={styles.notesInput}
              placeholder="Adicione notas (opcional)"
              multiline
              value={notes}
              onChangeText={setNotes}
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={closeModal}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSaveHighlight}
              >
                <Text style={styles.saveButtonText}>Destacar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const TextHighlighter = forwardRef(TextHighlighterComponent);
export default TextHighlighter;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    padding: 16,
  },
  paragraph: {
    marginBottom: 16,
    paddingLeft: 12,
  },
  text: {
    fontSize: 18,
    lineHeight: 28,
    color: '#333333',
  },
  highlightedParagraph: {
    backgroundColor: '#FFFDE7',
  },
  highlightedText: {
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
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
    color: '#333',
  },
  selectedTextContainer: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  selectedText: {
    fontSize: 16,
    color: '#333',
  },
  colorLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#555',
  },
  colorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginHorizontal: 4,
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: '#333',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#EEE',
  },
  saveButton: {
    backgroundColor: '#4F46E5',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#555',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFF',
  },
}); 