import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { Alert } from 'react-native';

// Função interna para gerar UUIDs sem depender de bibliotecas externas
function generateUUID() {
  // Public Domain/MIT
  let timestamp = new Date().getTime();
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    timestamp += performance.now(); // use high-precision timer if available
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(charPosition) {
    const randomValue = (timestamp + Math.random() * 16) % 16 | 0;
    timestamp = Math.floor(timestamp / 16);
    return (charPosition === 'x' ? randomValue : (randomValue & 0x3 | 0x8)).toString(16);
  });
}

export type Annotation = {
  id: string;
  book_id: string;
  chapter_id: string;
  content: string;
  position: number;
  color: string;
  category?: string;
  created_at: string;
  updated_at: string;
};

export const AnnotationCategories = [
  'Importante',
  'Dúvida', 
  'Revisão',
  'Inspiração',
  'Vocabulário',
  'Personagem'
];

// Tipo para armazenamento local de anotações pendentes
type PendingAnnotation = {
  id: string;
  action: 'add' | 'update' | 'delete';
  data?: Omit<Annotation, 'id' | 'created_at' | 'updated_at'>;
  timestamp: number;
};

// Chave para armazenar anotações pendentes
const PENDING_ANNOTATIONS_KEY = 'pending_annotations';

type AnnotationsContextType = {
  annotations: Annotation[];
  isLoading: boolean;
  isOnline: boolean;
  hasPendingSync: boolean;
  getBookAnnotations: (bookId: string) => Promise<Annotation[]>;
  getChapterAnnotations: (chapterId: string) => Promise<Annotation[]>;
  addAnnotation: (bookId: string, chapterId: string, content: string, position: number, color?: string, category?: string) => Promise<Annotation | null>;
  updateAnnotation: (id: string, content: string, color?: string, category?: string) => Promise<boolean>;
  deleteAnnotation: (id: string) => Promise<boolean>;
  getAnnotationsByCategory: (bookId: string, category: string) => Promise<Annotation[]>;
  forceSync: () => Promise<boolean>;
};

const AnnotationsContext = createContext<AnnotationsContextType | undefined>(undefined);

// Uma flag para rastrear se o contexto está montado
const MOUNT_STATUS = {
  isMounted: false
};

export function AnnotationsProvider({ children }: { children: ReactNode }) {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [pendingAnnotations, setPendingAnnotations] = useState<PendingAnnotation[]>([]);
  const [hasPendingSync, setHasPendingSync] = useState(false);
  const [isContextReady, setIsContextReady] = useState(false);

  // Registrar que o componente foi montado
  useEffect(() => {
    MOUNT_STATUS.isMounted = true;
    
    // Aguardar um pouco para garantir que todos os sistemas nativos estejam prontos
    const initTimer = setTimeout(() => {
      setIsContextReady(true);
    }, 300);
    
    return () => {
      clearTimeout(initTimer);
      MOUNT_STATUS.isMounted = false;
    };
  }, []);

  // Verificar status de conexão - agora com inicialização adiada
  useEffect(() => {
    // Não iniciar nada até que o contexto esteja pronto
    if (!isContextReady) return;
    
    try {
      const handleConnectionChange = (state: NetInfoState) => {
        // Verificar se o componente ainda está montado
        if (!MOUNT_STATUS.isMounted) return;
        
        try {
          const isConnected = state?.isConnected ?? false;
          setIsOnline(isConnected);
          
          // Se ficou online, tenta sincronizar alterações pendentes
          if (isConnected && pendingAnnotations.length > 0) {
            syncPendingAnnotations();
          }
        } catch (innerError) {
          console.error('Erro ao processar mudança de conexão:', innerError);
        }
      };
      
      // Estado inicial com mais proteção e com delay para garantir inicialização completa
      const checkInitialConnection = async () => {
        try {
          // Verificar se o componente ainda está montado
          if (!MOUNT_STATUS.isMounted) return;
          
          const state = await NetInfo.fetch();
          setIsOnline(state?.isConnected ?? false);
        } catch (error) {
          console.error('Erro ao verificar estado inicial da conexão:', error);
          // Não falhar completamente, usar um valor padrão
          setIsOnline(true);
        }
      };
      
      // Executa após um pequeno delay para garantir que a UI esteja pronta
      const connectionTimer = setTimeout(() => {
        checkInitialConnection();
      }, 500);
      
      // Monitorar alterações de conexão de forma segura
      let unsubscribe: ReturnType<typeof NetInfo.addEventListener> | null = null;
      try {
        unsubscribe = NetInfo.addEventListener(handleConnectionChange);
      } catch (listenerError) {
        console.error('Erro ao adicionar listener de conexão:', listenerError);
      }
      
      return () => {
        clearTimeout(connectionTimer);
        try {
          if (unsubscribe) {
            unsubscribe();
          }
        } catch (cleanupError) {
          console.error('Erro ao remover listener:', cleanupError);
        }
      };
    } catch (outerError) {
      console.error('Erro ao configurar monitoramento de conexão:', outerError);
      // Garantir que o app não falhe completamente
      setIsOnline(true);
    }
  }, [isContextReady, pendingAnnotations]);

  // Carregar anotações pendentes do AsyncStorage - também adiado
  useEffect(() => {
    if (!isContextReady) return;
    
    const loadTimer = setTimeout(() => {
      loadPendingAnnotations();
    }, 200);
    
    return () => clearTimeout(loadTimer);
  }, [isContextReady]);

  // Atualizar flag de sincronização pendente
  useEffect(() => {
    setHasPendingSync(pendingAnnotations.length > 0);
  }, [pendingAnnotations]);

  // Função para carregar anotações pendentes do AsyncStorage
  const loadPendingAnnotations = async () => {
    try {
      const storedData = await AsyncStorage.getItem(PENDING_ANNOTATIONS_KEY);
      if (storedData) {
        const parsedData = JSON.parse(storedData) as PendingAnnotation[];
        setPendingAnnotations(parsedData);
      }
    } catch (error) {
      console.error('Erro ao carregar anotações pendentes:', error);
    }
  };

  // Função para salvar anotações pendentes no AsyncStorage
  const savePendingAnnotations = async (items: PendingAnnotation[]) => {
    try {
      await AsyncStorage.setItem(PENDING_ANNOTATIONS_KEY, JSON.stringify(items));
      setPendingAnnotations(items);
    } catch (error) {
      console.error('Erro ao salvar anotações pendentes:', error);
    }
  };

  // Adicionar uma ação à fila pendente
  const addToPendingQueue = async (
    action: 'add' | 'update' | 'delete',
    id: string,
    data?: Omit<Annotation, 'id' | 'created_at' | 'updated_at'>
  ) => {
    try {
      const newItem: PendingAnnotation = {
        id,
        action,
        data,
        timestamp: new Date().getTime()
      };
      
      const updatedQueue = [...pendingAnnotations, newItem];
      await savePendingAnnotations(updatedQueue);
      
      return true;
    } catch (error) {
      console.error('Erro ao adicionar à fila de pendentes:', error);
      return false;
    }
  };

  // Sincronizar anotações pendentes com o servidor
  const syncPendingAnnotations = async () => {
    if (!isOnline || pendingAnnotations.length === 0) return false;
    
    setIsLoading(true);
    let success = true;
    
    try {
      // Copiar a fila para manipulação
      const queue = [...pendingAnnotations];
      const syncedIds: string[] = [];
      
      // Processar cada item na fila
      for (const item of queue) {
        try {
          const { action, id, data } = item;
          
          if (action === 'add' && data) {
            const user = await getCurrentUser();
            if (!user) continue;
            
            const { error } = await supabase
              .from('annotations')
              .insert({
                id,
                user_id: user.id,
                book_id: data.book_id,
                chapter_id: data.chapter_id,
                content: data.content,
                position: data.position,
                color: data.color || '#FFEB3B',
                category: data.category,
              });
            
            if (!error) syncedIds.push(id);
          } 
          else if (action === 'update' && data) {
            const { error } = await supabase
              .from('annotations')
              .update({
                content: data.content,
                color: data.color,
                category: data.category,
                updated_at: new Date().toISOString()
              })
              .eq('id', id);
            
            if (!error) syncedIds.push(id);
          } 
          else if (action === 'delete') {
            const { error } = await supabase
              .from('annotations')
              .delete()
              .eq('id', id);
            
            if (!error) syncedIds.push(id);
          }
        } catch (err) {
          console.error('Erro ao sincronizar item:', err);
        }
      }
      
      // Remover itens sincronizados da fila
      if (syncedIds.length > 0) {
        const remainingItems = pendingAnnotations.filter(item => !syncedIds.includes(item.id));
        await savePendingAnnotations(remainingItems);
      }
      
      // Se ainda houver itens não sincronizados
      if (syncedIds.length < queue.length) {
        success = false;
      }
    } catch (error) {
      console.error('Erro na sincronização:', error);
      success = false;
    } finally {
      setIsLoading(false);
    }
    
    return success;
  };
  
  // Forçar sincronização - para ser chamada pelo usuário
  const forceSync = async () => {
    if (!isOnline) {
      Alert.alert(
        'Sem conexão',
        'Você está offline. Conecte-se à internet para sincronizar suas anotações.'
      );
      return false;
    }
    
    if (pendingAnnotations.length === 0) {
      Alert.alert('Sincronizado', 'Todas as suas anotações já estão sincronizadas.');
      return true;
    }
    
    const result = await syncPendingAnnotations();
    
    if (result) {
      Alert.alert('Sucesso', 'Todas as anotações foram sincronizadas com sucesso!');
    } else {
      Alert.alert(
        'Sincronização parcial',
        'Algumas anotações não puderam ser sincronizadas. Tente novamente mais tarde.'
      );
    }
    
    return result;
  };

  // Funções modificadas para suporte offline

  async function getBookAnnotations(bookId: string): Promise<Annotation[]> {
    try {
      setIsLoading(true);
      
      // Primeiro tenta obter do Supabase se estiver online
      if (isOnline) {
        const user = await getCurrentUser();
        
        if (!user) return [];

        const { data, error } = await supabase
          .from('annotations')
          .select('*')
          .eq('book_id', bookId)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        return data || [];
      } else {
        // Se estiver offline, usa somente cache/dados locais
        // Aqui você poderia implementar um cache local mais sofisticado
        // Para simplificar, estamos apenas retornando as anotações já carregadas
        return annotations.filter(ann => ann.book_id === bookId);
      }
    } catch (error) {
      console.error('Erro ao buscar anotações do livro:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }

  async function getChapterAnnotations(chapterId: string): Promise<Annotation[]> {
    try {
      setIsLoading(true);
      console.log(`getChapterAnnotations: Buscando anotações para capítulo ID: ${chapterId}`);
      
      // Tentar do servidor se online
      if (isOnline) {
        // Primeiro, vamos verificar se há anotações para o capítulo sem aplicar filtros específicos
        const { data: allAnnotations, error: allError } = await supabase
          .from('annotations')
          .select('*');
        
        if (allError) {
          console.error('Erro ao buscar todas as anotações:', allError);
        } else {
          console.log(`Total de anotações no banco: ${allAnnotations.length}`);
          
          // Verificar se há anotações com este ID de capítulo
          const chapterAnnos = allAnnotations.filter(a => a.chapter_id === chapterId);
          console.log(`Anotações para o capítulo ${chapterId}: ${chapterAnnos.length}`);
          
          if (chapterAnnos.length === 0) {
            // Se não encontrou, verificar quais IDs de capítulo existem
            const uniqueChapterIds = [...new Set(allAnnotations.map(a => a.chapter_id))];
            console.log(`IDs de capítulos existentes: ${JSON.stringify(uniqueChapterIds)}`);
          }
        }
        
        // Buscar específicamente pelo ID do capítulo
        const { data, error } = await supabase
          .from('annotations')
          .select('*')
          .eq('chapter_id', chapterId)
          .order('position', { ascending: true });
        
        if (error) {
          console.error('Erro ao buscar anotações específicas do capítulo:', error);
          throw error;
        }

        console.log(`Resultado final: ${data ? data.length : 0} anotações para o capítulo ${chapterId}`);

        // Atualizar o estado global para incluir as anotações carregadas do capítulo específico
        if (data && data.length > 0) {
          // Primeiro, remover do estado global quaisquer anotações existentes deste capítulo
          // para evitar duplicatas
          const annotationsWithoutThisChapter = annotations.filter(
            ann => ann.chapter_id !== chapterId
          );
          
          // Depois, adicionar as novas anotações do capítulo ao estado global
          setAnnotations([...annotationsWithoutThisChapter, ...data]);
          console.log(`Sincronizadas ${data.length} anotações para o estado global`);
        }
        
        return data || [];
      } else {
        // Offline - usar cache
        const cachedAnnos = annotations.filter(ann => ann.chapter_id === chapterId);
        console.log(`Usando cache: ${cachedAnnos.length} anotações para o capítulo ${chapterId}`);
        return cachedAnnos;
      }
    } catch (error) {
      console.error('Erro ao buscar anotações do capítulo:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }

  async function addAnnotation(
    bookId: string,
    chapterId: string,
    content: string, 
    position: number,
    color = '#FFEB3B',
    category?: string
  ): Promise<Annotation | null> {
    try {
      console.log(`Adicionando anotação: livro=${bookId}, capítulo=${chapterId}, posição=${position}`);
      setIsLoading(true);
      
      // Normalizar o chapterId para garantir que é uma string
      const chapterIdString = String(chapterId);
      console.log(`Tipo de chapterId normalizado: ${typeof chapterIdString}`);
      
      // Gerar um UUID válido para o Supabase
      const id = generateUUID();
      console.log(`UUID gerado: ${id}`);
      
      const now = new Date().toISOString();
      
      // Nova anotação
      const newAnnotation: Annotation = {
        id,
        book_id: bookId,
        chapter_id: chapterIdString,
        content,
        position,
        color,
        category,
        created_at: now,
        updated_at: now
      };
      
      console.log(`Anotação preparada: ${JSON.stringify(newAnnotation)}`);
      
      // Se estiver online, salva diretamente
      if (isOnline) {
        const user = await getCurrentUser();
        
        if (!user) {
          console.error('Usuário não autenticado');
          return null;
        }
        
        console.log(`Inserindo anotação no Supabase para usuário ${user.id}`);
        
        const { error } = await supabase
          .from('annotations')
          .insert({
            id,
            user_id: user.id,
            book_id: bookId,
            chapter_id: chapterIdString,
            content,
            position,
            color,
            category
          });
        
        if (error) {
          console.error('Erro ao inserir no Supabase:', error);
          // Se falhar, adiciona à fila de pendentes
          await addToPendingQueue('add', id, {
            book_id: bookId,
            chapter_id: chapterIdString,
            content,
            position,
            color,
            category
          });
        } else {
          console.log('Anotação inserida com sucesso no Supabase!');
        }
      } else {
        // Se estiver offline, adiciona à fila de pendentes
        console.log('Offline: adicionando anotação à fila de pendentes');
        await addToPendingQueue('add', id, {
          book_id: bookId,
          chapter_id: chapterIdString,
          content,
          position,
          color,
          category
        });
      }
      
      // Atualiza o estado local
      console.log('Atualizando estado local com a nova anotação');
      setAnnotations(prev => [newAnnotation, ...prev]);
      
      return newAnnotation;
    } catch (error) {
      console.error('Erro ao adicionar anotação:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  async function updateAnnotation(
    id: string, 
    content: string, 
    color?: string,
    category?: string
  ): Promise<boolean> {
    try {
      setIsLoading(true);

      // Atualizar anotação no estado local
      const annotationToUpdate = annotations.find(ann => ann.id === id);
      if (!annotationToUpdate) return false;
      
      const updatedData = {
        content,
        color: color || annotationToUpdate.color,
        category,
        book_id: annotationToUpdate.book_id,
        chapter_id: annotationToUpdate.chapter_id,
        position: annotationToUpdate.position
      };
      
      // Se estiver online, atualiza diretamente
      if (isOnline) {
        const { error } = await supabase
          .from('annotations')
          .update({
            content,
            color: color || annotationToUpdate.color,
            category,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);
        
        if (error) {
          // Se falhar, adiciona à fila de pendentes
          await addToPendingQueue('update', id, updatedData);
        }
      } else {
        // Se estiver offline, adiciona à fila de pendentes
        await addToPendingQueue('update', id, updatedData);
      }

      // Atualiza o estado local
      setAnnotations(prev => 
        prev.map(ann => 
          ann.id === id 
            ? { 
              ...ann, 
              content, 
              color: color || ann.color, 
              category,
              updated_at: new Date().toISOString() 
            } 
            : ann
        )
      );

      return true;
    } catch (error) {
      console.error('Erro ao atualizar anotação:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  async function deleteAnnotation(id: string): Promise<boolean> {
    try {
      console.log(`Tentando excluir anotação com ID: ${id}`);
      setIsLoading(true);
      
      // Verificar se a anotação existe no estado local
      let annotationExists = annotations.some(ann => ann.id === id);
      
      if (!annotationExists && isOnline) {
        // Se não existir no estado local, verificar diretamente no Supabase
        console.log('Anotação não encontrada no estado local. Verificando no Supabase...');
        const { data, error } = await supabase
          .from('annotations')
          .select('id')
          .eq('id', id)
          .single();
          
        if (error) {
          console.error('Erro ao verificar anotação no Supabase:', error);
        } else if (data) {
          console.log('Anotação encontrada no Supabase. Prosseguindo com exclusão.');
          annotationExists = true;
        }
      }
      
      if (!annotationExists) {
        console.log(`Anotação com ID ${id} não encontrada`);
        return false;
      }

      // Se estiver online, exclui diretamente
      if (isOnline) {
        console.log('Online: Excluindo anotação diretamente no Supabase');
        const { error } = await supabase
          .from('annotations')
          .delete()
          .eq('id', id);
        
        if (error) {
          console.error('Erro ao excluir anotação no Supabase:', error);
          // Se falhar, adiciona à fila de pendentes
          console.log('Adicionando exclusão à fila de pendentes devido a erro');
          await addToPendingQueue('delete', id);
        } else {
          console.log('Anotação excluída com sucesso no Supabase');
        }
      } else {
        // Se estiver offline, adiciona à fila de pendentes
        console.log('Offline: Adicionando exclusão à fila de pendentes');
        await addToPendingQueue('delete', id);
      }

      // Atualiza o estado local
      console.log('Atualizando estado local após exclusão');
      setAnnotations(prev => prev.filter(ann => ann.id !== id));

      return true;
    } catch (error) {
      console.error('Erro ao excluir anotação:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  async function getAnnotationsByCategory(bookId: string, category: string): Promise<Annotation[]> {
    try {
      setIsLoading(true);
      
      if (isOnline) {
        const user = await getCurrentUser();
        
        if (!user) return [];

        const { data, error } = await supabase
          .from('annotations')
          .select('*')
          .eq('book_id', bookId)
          .eq('category', category)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        return data || [];
      } else {
        // Offline - usar cache
        return annotations.filter(
          ann => ann.book_id === bookId && ann.category === category
        );
      }
    } catch (error) {
      console.error('Erro ao buscar anotações por categoria:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AnnotationsContext.Provider 
      value={{
        annotations,
        isLoading,
        isOnline,
        hasPendingSync,
        getBookAnnotations,
        getChapterAnnotations,
        addAnnotation,
        updateAnnotation,
        deleteAnnotation,
        getAnnotationsByCategory,
        forceSync
      }}
    >
      {children}
    </AnnotationsContext.Provider>
  );
}

export function useAnnotations() {
  const context = useContext(AnnotationsContext);
  if (context === undefined) {
    throw new Error('useAnnotations must be used within an AnnotationsProvider');
  }
  return context;
}

// Em vez de usar o método getUser(), usa getSession() para obter o usuário atual
const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session?.user;
  } catch (error) {
    console.error('Erro ao obter usuário atual:', error);
    return null;
  }
}; 