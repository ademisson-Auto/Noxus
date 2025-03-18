// Script para verificar a estrutura da tabela annotations
import { supabase } from '../lib/supabase';

/**
 * Verifica se a tabela annotations existe e retorna suas colunas
 * @returns {Promise<Array|null>} Colunas da tabela ou null em caso de erro
 */
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
    ];
  } catch (error) {
    console.error('Erro ao verificar estrutura da tabela:', error);
    return null;
  }
}

/**
 * Verifica e exibe informações sobre a estrutura da tabela no console
 * @returns {Promise<string>} Mensagem indicando o resultado da verificação
 */
export async function logDbStructureCheck() {
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

// Você pode usar esta função em um useEffect para verificar a estrutura
// E então modificar o Supabase conforme necessário 