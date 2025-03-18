// Script para verificar a estrutura da tabela annotations
import { supabase } from '../lib/supabase';

// Interface para definição de coluna da tabela
interface ColumnDefinition {
  column_name: string;
  data_type: string;
  is_nullable: boolean;
  column_default?: string;
  character_maximum_length?: number;
}

// Interface para a definição completa da tabela
interface TableDefinition {
  table_name: string;
  columns: ColumnDefinition[];
}

// Interface para as restrições da tabela
interface TableConstraint {
  constraint_name: string;
  constraint_type: 'PRIMARY KEY' | 'FOREIGN KEY' | 'UNIQUE' | 'CHECK';
  definition: string;
}

// Interface para os índices da tabela
interface TableIndex {
  index_name: string;
  column_names: string[];
  is_unique: boolean;
}

// Esquema esperado para a tabela annotations
const EXPECTED_ANNOTATIONS_SCHEMA: ColumnDefinition[] = [
  {
    column_name: 'id',
    data_type: 'uuid',
    is_nullable: false
  },
  {
    column_name: 'user_id',
    data_type: 'uuid',
    is_nullable: false
  },
  {
    column_name: 'book_id',
    data_type: 'uuid',
    is_nullable: false
  },
  {
    column_name: 'chapter_id',
    data_type: 'uuid',
    is_nullable: false
  },
  {
    column_name: 'content',
    data_type: 'text',
    is_nullable: false
  },
  {
    column_name: 'position',
    data_type: 'integer',
    is_nullable: false
  },
  {
    column_name: 'color',
    data_type: 'text',
    is_nullable: true
  },
  {
    column_name: 'category',
    data_type: 'text',
    is_nullable: true
  },
  {
    column_name: 'created_at',
    data_type: 'timestamp with time zone',
    is_nullable: true
  },
  {
    column_name: 'updated_at',
    data_type: 'timestamp with time zone',
    is_nullable: true
  }
];

// Função original para manter compatibilidade
export async function checkAnnotationsTable() {
  try {
    // Primeiro, tentar usar a função RPC personalizada
    try {
      const { data: columns, error } = await supabase
        .rpc('get_table_definition', {
          p_table_name: 'annotations'
        });
      
      if (!error) {
        return columns;
      }
      // Se houver erro, continua para o método alternativo
    } catch (rpcError) {
      console.log('Função RPC não disponível, usando método alternativo');
    }
    
    // Método alternativo: verificar se a tabela existe consultando-a diretamente
    const { data, error } = await supabase
      .from('annotations')
      .select('id')
      .limit(1);
    
    if (error) {
      if (error.code === 'PGRST116') {
        // Código para "relação não existe"
        console.log('Tabela annotations não existe');
        return null;
      }
      console.error('Erro ao verificar tabela:', error);
      return null;
    }
    
    // Se chegou aqui, a tabela existe, mas não podemos obter sua estrutura detalhada
    // Retornar uma estrutura simplificada indicando que a tabela existe
    return [
      { column_name: 'id', data_type: 'uuid', is_nullable: false },
      { column_name: 'table_exists', data_type: 'bool', is_nullable: false }
    ] as ColumnDefinition[];
  } catch (error) {
    console.error('Erro ao verificar estrutura da tabela:', error);
    return null;
  }
}

// Nova função que aproveita a original mas adiciona validação do esquema
export async function validateAnnotationsTable(): Promise<{
  exists: boolean;
  isValid: boolean;
  missingColumns: string[];
  invalidColumns: ColumnDefinition[];
  report: string;
} | null> {
  try {
    const columns = await checkAnnotationsTable();
    
    if (!columns || columns.length === 0) {
      return {
        exists: false,
        isValid: false,
        missingColumns: EXPECTED_ANNOTATIONS_SCHEMA.map(col => col.column_name),
        invalidColumns: [],
        report: 'A tabela annotations não existe no banco de dados.'
      };
    }

    // Se a tabela existe, mas não temos informações detalhadas da estrutura
    if (columns.some((col: ColumnDefinition) => col.column_name === 'table_exists')) {
      return {
        exists: true,
        isValid: false, // Não podemos garantir que é válida sem informações detalhadas
        missingColumns: [],
        invalidColumns: [],
        report: 'A tabela annotations existe, mas não foi possível verificar sua estrutura detalhada. ' +
               'Execute a migração que adiciona a função get_table_definition para uma verificação completa.'
      };
    }
    
    // Comparar com o esquema esperado
    const missingColumns: string[] = [];
    const invalidColumns: ColumnDefinition[] = [];
    
    // Verificar colunas ausentes
    EXPECTED_ANNOTATIONS_SCHEMA.forEach(expectedColumn => {
      const foundColumn = columns.find((col: ColumnDefinition) => col.column_name === expectedColumn.column_name);
      if (!foundColumn) {
        missingColumns.push(expectedColumn.column_name);
      } else if (
        foundColumn.data_type !== expectedColumn.data_type ||
        foundColumn.is_nullable !== expectedColumn.is_nullable
      ) {
        invalidColumns.push(foundColumn);
      }
    });
    
    const isValid = missingColumns.length === 0 && invalidColumns.length === 0;
    
    // Gerar relatório
    let report = isValid 
      ? 'A tabela annotations está em conformidade com o esquema esperado.'
      : 'A tabela annotations apresenta problemas no esquema:';
    
    if (missingColumns.length > 0) {
      report += `\n- Colunas ausentes: ${missingColumns.join(', ')}`;
    }
    
    if (invalidColumns.length > 0) {
      report += '\n- Colunas com tipo ou configuração incorreta:';
      invalidColumns.forEach(col => {
        const expected = EXPECTED_ANNOTATIONS_SCHEMA.find(e => e.column_name === col.column_name);
        report += `\n  - ${col.column_name}: encontrado '${col.data_type}' (${col.is_nullable ? 'nullable' : 'not null'}), esperado '${expected?.data_type}' (${expected?.is_nullable ? 'nullable' : 'not null'})`;
      });
    }
    
    return {
      exists: true,
      isValid,
      missingColumns,
      invalidColumns,
      report
    };
  } catch (error) {
    console.error('Erro ao verificar estrutura da tabela:', error);
    return null;
  }
}

// Verifica se todas as tabelas necessárias existem e têm a estrutura correta
export async function checkDatabaseStructure(): Promise<{
  isValid: boolean;
  report: string;
} | null> {
  try {
    const annotationsCheck = await validateAnnotationsTable();
    
    if (!annotationsCheck) {
      return {
        isValid: false,
        report: 'Não foi possível verificar a tabela annotations.'
      };
    }
    
    // Aqui você pode adicionar verificações para outras tabelas
    // por exemplo: const booksCheck = await checkBooksTable();
    
    const isValid = annotationsCheck.isValid;
    const report = annotationsCheck.report;
    
    return {
      isValid,
      report
    };
  } catch (error) {
    console.error('Erro ao verificar estrutura do banco de dados:', error);
    return null;
  }
}

// Função para executar verificação e sugerir correções
export async function verifyAndSuggestFixes(): Promise<string> {
  const result = await checkDatabaseStructure();
  
  if (!result) {
    return 'Não foi possível verificar a estrutura do banco de dados. Verifique a conexão com o Supabase.';
  }
  
  if (result.isValid) {
    return 'O banco de dados está estruturado corretamente.';
  }
  
  let suggestoes = result.report + '\n\nSugestões de correção:';
  
  const annotationsCheck = await validateAnnotationsTable();
  if (annotationsCheck && !annotationsCheck.exists) {
    suggestoes += '\n\n1. Criar a tabela annotations:';
    suggestoes += `\n
CREATE TABLE IF NOT EXISTS annotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id uuid REFERENCES books(id) ON DELETE CASCADE,
  chapter_id uuid REFERENCES chapters(id) ON DELETE CASCADE,
  content text NOT NULL,
  position integer NOT NULL,
  color text DEFAULT '#FFEB3B',
  category text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
    `;
  } else if (annotationsCheck && annotationsCheck.missingColumns.length > 0) {
    suggestoes += '\n\n1. Adicionar colunas ausentes na tabela annotations:';
    annotationsCheck.missingColumns.forEach(colName => {
      const colDef = EXPECTED_ANNOTATIONS_SCHEMA.find(c => c.column_name === colName);
      if (colDef) {
        suggestoes += `\nALTER TABLE annotations ADD COLUMN ${colName} ${colDef.data_type}${colDef.is_nullable ? '' : ' NOT NULL'};`;
      }
    });
  }
  
  return suggestoes;
}

/**
 * Verifica e exibe informações sobre a estrutura da tabela no console
 * @returns {Promise<string>} Mensagem indicando o resultado da verificação
 */
export async function logDbStructureCheck() {
  // Somente executar verificação detalhada em modo de desenvolvimento
  if (!__DEV__) {
    console.log('Verificação de estrutura desativada em produção');
    return 'Verificação ignorada (produção)';
  }

  try {
    console.log('Verificando estrutura do banco de dados...');
    const columns = await checkAnnotationsTable();
    console.log('Relatório da estrutura do banco:');
    
    if (columns && columns.length > 0) {
      if (columns.some(column => column.column_name === 'table_exists')) {
        console.log('Tabela annotations encontrada, mas função get_table_definition não está disponível.');
        console.log('Para detalhes completos, você precisa executar a migração SQL que adiciona a função get_table_definition ao banco de dados.');
        console.log('Execute a migração localizada em supabase/migrations/20250318000000_add_get_table_definition.sql');
      } else {
        console.log(`Tabela annotations encontrada com ${columns.length} colunas.`);
        console.log('Colunas:', columns.map(column => column.column_name).join(', '));
      }
    } else {
      console.log('Tabela annotations não encontrada ou sem colunas.');
      console.log('Você deve executar a migração para criar esta tabela. Consulte o script em supabase/migrations/20250318000000_add_get_table_definition.sql');
    }
    
    return 'Verificação concluída';
  } catch (error) {
    console.error('Erro ao verificar estrutura do banco:', error);
    return 'Erro na verificação';
  }
} 