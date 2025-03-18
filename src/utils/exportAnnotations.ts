import { Platform, Alert } from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
// import Share from 'react-native-share';
import { Annotation } from '../lib/AnnotationsContext';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

export type ExportOptions = {
  bookTitle: string;
  annotations: Annotation[];
  includeCategories?: boolean;
  fileName?: string;
};

/**
 * Gera HTML para uma lista de anotações
 */
function generateAnnotationsHTML(options: ExportOptions): string {
  const { bookTitle, annotations, includeCategories = true } = options;
  
  // Agrupar anotações por categoria
  const groupedByCat: { [key: string]: Annotation[] } = {};
  
  annotations.forEach(ann => {
    const category = ann.category || 'Sem categoria';
    if (!groupedByCat[category]) {
      groupedByCat[category] = [];
    }
    groupedByCat[category].push(ann);
  });

  // Gerar data formatada
  const formattedDate = format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: pt });
  
  // Gerar estilos e HTML header
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Anotações - ${bookTitle}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          margin: 20px;
          color: #333;
        }
        h1 {
          color: #4F46E5;
          font-size: 22px;
          margin-bottom: 10px;
          border-bottom: 1px solid #ddd;
          padding-bottom: 10px;
        }
        .date {
          color: #777;
          font-size: 14px;
          margin-bottom: 30px;
        }
        h2 {
          color: #333;
          font-size: 18px;
          margin-top: 25px;
          margin-bottom: 15px;
          border-bottom: 1px solid #eee;
          padding-bottom: 5px;
        }
        .annotation {
          margin-bottom: 20px;
          padding: 15px;
          background-color: #f9f9f9;
          border-radius: 8px;
        }
        .annotation-content {
          font-size: 16px;
          margin-bottom: 10px;
        }
        .annotation-date {
          color: #777;
          font-size: 12px;
        }
        .color-tag {
          display: inline-block;
          width: 12px;
          height: 12px;
          border-radius: 6px;
          margin-right: 8px;
        }
        .page-break {
          page-break-before: always;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Anotações - ${bookTitle}</h1>
        <div class="date">Exportado em ${formattedDate}</div>
      </div>
  `;

  // Resumo de anotações
  html += `
    <h2>Resumo</h2>
    <p>Total de anotações: ${annotations.length}</p>
  `;

  if (includeCategories) {
    Object.keys(groupedByCat).forEach(category => {
      const count = groupedByCat[category].length;
      html += `<p>${category}: ${count} anotação(ões)</p>`;
    });
  }

  html += '<div class="page-break"></div>';

  // Se categorizado, adicionar cada seção
  if (includeCategories) {
    Object.keys(groupedByCat).forEach(category => {
      html += `<h2>${category}</h2>`;
      
      groupedByCat[category].forEach(ann => {
        const date = new Date(ann.updated_at);
        const formattedDate = format(date, "d 'de' MMMM 'de' yyyy, HH:mm", { locale: pt });
        
        html += `
          <div class="annotation">
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
              <span class="color-tag" style="background-color: ${ann.color}"></span>
              <span class="annotation-date">${formattedDate}</span>
            </div>
            <div class="annotation-content">${ann.content}</div>
          </div>
        `;
      });
    });
  } else {
    // Se não categorizado, listar todas as anotações cronologicamente
    html += '<h2>Todas as anotações</h2>';
    
    annotations
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .forEach(ann => {
        const date = new Date(ann.updated_at);
        const formattedDate = format(date, "d 'de' MMMM 'de' yyyy, HH:mm", { locale: pt });
        
        html += `
          <div class="annotation">
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
              <span class="color-tag" style="background-color: ${ann.color}"></span>
              <span class="annotation-date">${formattedDate}</span>
            </div>
            <div class="annotation-content">${ann.content}</div>
          </div>
        `;
      });
  }

  html += `
    </body>
    </html>
  `;

  return html;
}

/**
 * Exporta anotações como PDF (versão simplificada para Expo Go)
 */
export async function exportAnnotationsAsPDF(options: ExportOptions): Promise<boolean> {
  try {
    // Versão temporária para Expo Go que apenas gera o PDF sem compartilhar
    Alert.alert(
      'Função não disponível no Expo Go',
      'A exportação de PDF requer um build de desenvolvimento ou EAS Build. Esta é uma simulação da funcionalidade.',
      [
        { 
          text: 'Ver prévia', 
          onPress: async () => {
            const html = generateAnnotationsHTML(options);
            Alert.alert(
              'Prévia de anotações',
              `PDF seria gerado com ${options.annotations.length} anotações do livro "${options.bookTitle}"`
            );
          }
        },
        { text: 'OK', style: 'cancel' }
      ]
    );
    
    // Simulamos sucesso para não quebrar o fluxo do app
    return true;
    
    /*
    // Código comentado - implementação completa que requer build nativo
    const { bookTitle, fileName } = options;
    const html = generateAnnotationsHTML(options);
    
    // Nome do arquivo padrão
    const defaultFileName = fileName || 
      `anotacoes_${bookTitle.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`;
    
    // Gerar PDF
    const pdfOptions = {
      html,
      fileName: defaultFileName,
      directory: 'Documents',
      width: 612, // Tamanho A4
      height: 792,
    };

    const pdf = await RNHTMLtoPDF.convert(pdfOptions);
    
    if (!pdf.filePath) {
      throw new Error('Falha ao gerar o PDF');
    }

    // Compartilhar o PDF
    await Share.open({
      url: Platform.OS === 'android' ? `file://${pdf.filePath}` : pdf.filePath,
      type: 'application/pdf',
      title: 'Compartilhar anotações',
      subject: `Anotações - ${bookTitle}`,
      message: `Anotações do livro: ${bookTitle}`
    });
    */

  } catch (error) {
    console.error('Erro ao exportar anotações:', error);
    return false;
  }
} 