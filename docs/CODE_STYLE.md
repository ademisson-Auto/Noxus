# Guia de Estilo de Código

Este documento define as convenções de codificação a serem seguidas no projeto para garantir consistência e legibilidade no código.

## Configuração

A configuração do ESLint e do Prettier está definida nos arquivos:
- `.eslintrc.js` - Regras de lint e padrões JavaScript/TypeScript
- `.prettierrc` - Formatação visual do código

## Convenções de Nomenclatura

### Variáveis e Funções

- Use **camelCase** para variáveis e funções:
  ```typescript
  const userData = { ... };
  function loadUserData() { ... }
  ```

- Prefixos para variáveis booleanas:
  ```typescript
  const isLoading = true;
  const hasPermission = false;
  ```

- Use nomes descritivos que indiquem a finalidade:
  ```typescript
  // Bom
  const userSessionData = ...;
  function fetchUserAnnotations() { ... }

  // Evite
  const data = ...;
  function getData() { ... }
  ```

### Exceções para campos do banco de dados

As seguintes propriedades podem continuar usando snake_case, pois são nomes de colunas no banco de dados:
- `user_id`
- `book_id`
- `chapter_id`
- `created_at`
- `updated_at`
- `last_read`
- `reading_time`
- `avatar_url`
- `books_read`
- `cover_url`

### Componentes e Interfaces/Tipos

- Use **PascalCase** para componentes, interfaces e tipos:
  ```typescript
  interface UserProfile { ... }
  type BookDetails = { ... };

  function UserProfileCard() { ... }
  ```

### Constantes

- Use **UPPER_SNAKE_CASE** para constantes globais:
  ```typescript
  const API_URL = '...';
  const MAX_RETRY_COUNT = 3;
  ```

## Padrões de Código

### React e JSX

- Não é necessário importar o React em arquivos JSX/TSX (compatível com React 17+):
  ```typescript
  // Não é mais necessário este import para usar JSX:
  // import React from 'react';
  
  function MyComponent() {
    return <View>...</View>;
  }
  ```

### Async/Await vs Promises

- Prefira **async/await** em vez de callbacks `.then()/.catch()`:

  ```typescript
  // Preferido:
  async function fetchData() {
    try {
      const result = await api.getData();
      return result;
    } catch (error) {
      console.error('Erro:', error);
      throw error;
    }
  }

  // Evite:
  function fetchData() {
    return api.getData()
      .then(result => {
        return result;
      })
      .catch(error => {
        console.error('Erro:', error);
        throw error;
      });
  }
  ```

- Em `useEffect`, use IIFE (Immediately Invoked Function Expression) quando precisar de async:

  ```typescript
  useEffect(() => {
    // Boa prática com async em useEffect
    (async () => {
      try {
        await loadData();
      } catch (error) {
        console.error('Erro:', error);
      }
    })();
  }, []);
  ```

### Tratamento de Erros

- Use blocos try/catch para capturar erros em funções assíncronas:

  ```typescript
  async function handleSubmit() {
    try {
      setIsLoading(true);
      await saveData();
      showSuccessMessage();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      showErrorMessage(error);
    } finally {
      setIsLoading(false);
    }
  }
  ```

### Comentários

- Use JSDoc para documentar funções públicas:

  ```typescript
  /**
   * Busca anotações de um livro específico
   * @param bookId - ID do livro para buscar anotações
   * @returns Lista de anotações encontradas
   */
  async function getBookAnnotations(bookId: string): Promise<Annotation[]> {
    // ...
  }
  ```

- Use comentários para explicar lógica complexa, não para descrever código óbvio:

  ```typescript
  // Bom:
  // Aplica política de exponential backoff para retentativas
  const delay = Math.pow(2, retryCount) * 1000;
  
  // Evite:
  // Incrementa o contador
  count++;
  ```

### Imports

Organize os imports na seguinte ordem:
1. Bibliotecas externas/padrão
2. Componentes e utilitários internos
3. Tipos e interfaces
4. Assets e estilos

```typescript
// React e bibliotecas externas
import { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { router } from 'expo-router';

// Componentes e serviços internos
import { supabase } from '../../lib/supabase';
import UserAvatar from '../components/UserAvatar';

// Tipos e interfaces
import type { UserProfile } from '../types';

// Recursos e estilos 
import { styles } from './styles';
import userIcon from '../assets/icons/user.png';
```

## Aplicação das Diretrizes

Para verificar e corrigir automaticamente o código de acordo com estas regras:

```bash
# Verificar erros de lint
npm run lint

# Corrigir erros automaticamente quando possível
npm run lint:fix
``` 