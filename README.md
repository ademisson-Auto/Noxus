# Aplicativo de Leitura - Documentação

## 📱 Visão Geral

Este é um aplicativo de leitura mobile desenvolvido com React Native e Expo, que permite aos usuários ler livros, fazer anotações e gerenciar favoritos. O aplicativo possui recursos de funcionamento offline, sincronização com o backend Supabase, e fluxos de autenticação.

## 🔧 Tecnologias e Dependências

- **Framework**: React Native com Expo Router
- **Backend**: Supabase (PostgreSQL + API REST)
- **Gerenciamento de Estado**: Context API do React
- **Armazenamento Local**: AsyncStorage
- **Detecção de Rede**: NetInfo
- **TypeScript**: Para tipagem estática

## 📂 Estrutura do Projeto

```
project/
├── assets/
│   └── images/
├── src/
│   ├── app/                  # Rotas e telas do Expo Router
│   │   ├── (auth)/           # Autenticação (login/registro)
│   │   ├── (tabs)/           # Navegação principal por abas
│   │   ├── reader/           # Tela de leitura
│   │   ├── annotations/      # Gerenciamento de anotações
│   │   └── _layout.tsx       # Layout principal da aplicação
│   ├── components/           # Componentes reutilizáveis
│   ├── lib/                  # Contextos e serviços
│   │   ├── AnnotationsContext.tsx  # Contexto de anotações
│   │   ├── FavoritesContext.tsx    # Contexto de favoritos
│   │   └── supabase.ts             # Cliente Supabase
│   └── utils/                # Utilitários
│       └── checkDbStructure.ts  # Verificação do esquema do banco de dados
├── supabase/                 # Configurações e migrações do Supabase
│   └── migrations/           # Scripts SQL para migrações
├── .env                      # Variáveis de ambiente
├── app.json                  # Configuração do Expo
└── tsconfig.json             # Configuração do TypeScript
```

## 🌟 Funcionalidades Principais

### 1. Sistema de Autenticação
- Login e registro de usuários
- Gerenciamento de sessão via Supabase Auth

### 2. Gerenciamento de Anotações
- Criar, atualizar e excluir anotações para livros
- Categorizar anotações (Importante, Dúvida, Revisão, etc.)
- Colorir anotações para organização visual
- Sincronização automática quando o dispositivo está online
- Armazenamento local quando offline

### 3. Favoritos
- Marcar livros como favoritos
- Visualizar lista de livros favoritos

### 4. Leitor de Livros
- Interface para leitura de livros por capítulos
- Suporte a diferentes tipos de conteúdo (ebooks, light novels, mangás)

### 5. Funcionamento Offline
- Operações CRUD em anotações quando offline
- Fila de sincronização para operações pendentes
- Sincronização automática quando o dispositivo fica online

## 🔄 Contextos e Gerenciamento de Estado

### AnnotationsContext

Este contexto gerencia todas as operações relacionadas a anotações, incluindo:

- **Estado**:
  - `annotations`: Lista de anotações carregadas
  - `isLoading`: Indicador de operações em andamento
  - `isOnline`: Status de conexão do dispositivo
  - `hasPendingSync`: Se existem operações pendentes de sincronização

- **Métodos**:
  - `getBookAnnotations(bookId)`: Busca todas as anotações de um livro
  - `getChapterAnnotations(chapterId)`: Busca anotações de um capítulo específico
  - `addAnnotation(bookId, chapterId, content, position, color, category)`: Adiciona uma nova anotação
  - `updateAnnotation(id, content, color, category)`: Atualiza uma anotação existente
  - `deleteAnnotation(id)`: Remove uma anotação
  - `getAnnotationsByCategory(bookId, category)`: Filtra anotações por categoria
  - `forceSync()`: Força a sincronização de operações pendentes

- **Sistema de Sincronização**:
  - Fila gerenciada via AsyncStorage usando `PENDING_ANNOTATIONS_KEY`
  - Três tipos de operações pendentes: `add`, `update` e `delete`

- **Inicialização Segura**:
  - Sistema de atrasos controlados para evitar erros de UIManager
  - Flags de montagem para evitar operações em componentes desmontados

### FavoritesContext

Gerencia os livros favoritos do usuário, incluindo:

- Adicionar/remover favoritos
- Verificação de status de favorito
- Carregamento de livros marcados como favoritos

## 🔌 API e Integração com o Backend

### Supabase

A integração com o Supabase inclui:

- **Tabelas**:
  - `annotations`: Armazena anotações dos usuários
  - `books`: Informações sobre livros
  - `auth.users`: Gerenciamento de usuários

- **Validação de Esquema**:
  O utilitário `checkDbStructure.ts` verifica se o banco de dados está configurado corretamente:
  - Verifica a existência e estrutura da tabela `annotations`
  - Valida tipos de dados e constraints
  - Fornece sugestões SQL para correções

- **Segurança**:
  - RLS (Row Level Security) para proteção de dados
  - Autenticação via token JWT

## 🛠️ Utilitários e Ferramentas

### checkDbStructure.ts

Este utilitário verifica a integridade da estrutura do banco de dados:

- **Funções**:
  - `checkAnnotationsTable()`: Verifica a existência e estrutura da tabela annotations
  - `validateAnnotationsTable()`: Valida o esquema contra o esperado
  - `logDbStructureCheck()`: Exibe informações de diagnóstico no console
  - `verifyAndSuggestFixes()`: Sugere correções para problemas detectados

- **Esquema Esperado**:
  Define o esquema esperado para a tabela annotations, incluindo tipos de dados e nullability para cada coluna:
  - `id`, `user_id`, `book_id`, `chapter_id`, `content`, `position`, `color`, `category`, `created_at`, `updated_at`

### Utilidades Gerais

- `generateUUID()`: Gera identificadores únicos para anotações offline
- `getCurrentUser()`: Obtém o usuário autenticado atual via Supabase
- `loadPendingAnnotations()`: Carrega operações pendentes do AsyncStorage

## 🚀 Fluxo de Inicialização do Aplicativo

### Processo de Inicialização Otimizado

O aplicativo implementa um processo de inicialização em fases para evitar erros com módulos nativos:

1. **Fase de Splash Screen**:
   - Mantém a tela de splash por 500ms para garantir inicialização segura
   - Usa `SplashScreen.preventAutoHideAsync()` e `SplashScreen.hideAsync()`

2. **Inicialização de Contextos**:
   - AnnotationsContext é inicializado com atraso de 300ms
   - Verificação de conexão de rede após 500ms
   - Carregamento de dados locais após 200ms

3. **Verificação de Banco de Dados**:
   - Em modo de desenvolvimento, verifica a estrutura da tabela annotations
   - Exibe relatório detalhado em caso de problemas

## ⚙️ Configurações e Personalizações

### app.json

Define a configuração do aplicativo Expo, incluindo:
- Nome e versão do aplicativo
- Icones e splash screen
- Configurações específicas para Android e iOS
- Permissões necessárias (ex: INTERNET)

## 🔍 Possíveis Melhorias

### 1. Performance e Otimização
- **Otimização de Renderização**: Implementar `React.memo()` para componentes que não precisam de re-renderização frequente
- **Virtualização**: Usar `FlatList` com otimizações para listas grandes de anotações
- **Paginação**: Implementar paginação para carregar anotações em lotes

### 2. Experiência do Usuário
- **Sincronização Visual**: Indicadores mais claros do status de sincronização
- **Modo Offline Aprimorado**: Ícones e feedbacks visuais para operações offline
- **Animações**: Adicionar transições suaves para melhorar a experiência

### 3. Arquitetura e Código
- **Testes Automatizados**: Implementar testes unitários, de integração e E2E
- **Migração para Redux ou Recoil**: Para gerenciamento de estado mais escalável
- **Cache Inteligente**: Implementar estratégias de cache mais sofisticadas

### 4. Segurança
- **Criptografia Local**: Criptografar dados sensíveis no AsyncStorage
- **Renovação de Token**: Implementar refresh token para sessões mais seguras
- **Validação de Entrada**: Melhorar validação de dados em formulários

### 5. Funcionalidades
- **Exportação de Anotações**: Para PDF ou formatos de texto
- **Compartilhamento**: Permitir compartilhar anotações com outros usuários
- **Pesquisa Avançada**: Busca em anotações com filtros avançados

## 🔧 Solução de Problemas Conhecidos

### Erro de UIManager
O projeto implementa soluções para o erro "Attempt to invoke interface method 'void abi49_0_0.expo.modules.core.interfaces.services.UIManager.registerLifecycleEventListener'" através de:

1. Inicialização sequencial e retardada de componentes
2. Sistema de proteção contra acessos em componentes desmontados
3. Uso de flags de montagem e timers para garantir inicialização correta

### Problemas de Esquema do Banco
Implementação de scripts de migração e validação para garantir consistência do banco de dados:
- Verificação das colunas e tipos esperados
- Sugestões de correção com scripts SQL automáticos
- Logs detalhados para diagnóstico

## 📝 Conclusão

Este aplicativo de leitura oferece uma experiência rica ao usuário com funcionalidades robustas de anotações e favoritos, combinando uma arquitetura moderna com React Native e integração eficiente com Supabase. O sistema de funcionamento offline e sincronização garante que os usuários possam usar o aplicativo em qualquer situação, mesmo sem conectividade constante.

A arquitetura implementada prioriza a experiência do usuário, a performance e a estabilidade, com soluções específicas para problemas conhecidos em aplicativos React Native.