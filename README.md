<div align="center">
  
  # 📖 NOXUS
  
  **App avançado de leitura com sistema de anotações offline-first**
  
  *Arquitetura robusta para leitura inteligente, anotações categorizadas e sincronização offline*
  
  [![React Native](https://img.shields.io/badge/React%20Native-Latest-blue.svg)](https://reactnative.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-Latest-blue.svg)](https://www.typescriptlang.org/)
  [![Expo Router](https://img.shields.io/badge/Expo%20Router-Latest-black.svg)](https://expo.dev/)
  [![Supabase](https://img.shields.io/badge/Supabase-Backend-green.svg)](https://supabase.com/)
  [![Offline First](https://img.shields.io/badge/Offline-First-orange.svg)](#)
  [![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
  
  [📱 Demo](#-demonstração) • [⚡ Instalação](#-instalação-rápida) • [🏠 Arquitetura](#-arquitetura) • [🔄 Sync](#-sincronização-offline)
  
</div>

---

## 🎯 Características Principais

<table>
  <tr>
    <td>🔄</td>
    <td><strong>Offline-First</strong></td>
    <td>Sistema robusto de sincronização com fila de operações pendentes</td>
  </tr>
  <tr>
    <td>📝</td>
    <td><strong>Anotações Avançadas</strong></td>
    <td>Categorização, cores, posições e busca inteligente</td>
  </tr>
  <tr>
    <td>🏠</td>
    <td><strong>Arquitetura Moderna</strong></td>
    <td>Expo Router, Context API e gerenciamento de estado avançado</td>
  </tr>
  <tr>
    <td>🔐</td>
    <td><strong>Autenticação Segura</strong></td>
    <td>Supabase Auth com RLS e JWT tokens</td>
  </tr>
  <tr>
    <td>📈</td>
    <td><strong>Performance</strong></td>
    <td>Inicialização otimizada e gerenciamento de memória</td>
  </tr>
  <tr>
    <td>🛠️</td>
    <td><strong>Developer Experience</strong></td>
    <td>TypeScript, validação de schema e debug tools</td>
  </tr>
</table>

## 📱 Demonstração

> **Nota:** Screenshots e demo em vídeo serão adicionados em breve!

## 🚀 Visão Geral

Noxus é um aplicativo de leitura mobile desenvolvido com React Native e Expo, que permite aos usuários ler livros, fazer anotações e gerenciar favoritos. O aplicativo possui recursos de funcionamento offline, sincronização com o backend Supabase, e fluxos de autenticação.

## 🚀 Stack Tecnológico

### 📱 Frontend & Arquitetura
```
📱 React Native           - Framework mobile multiplataforma
🛣️ Expo Router             - Roteamento baseado em arquivos
🔷 TypeScript             - Tipagem estática e segurança
🧩 Context API             - Gerenciamento de estado reativo
💫 Expo                    - Plataforma de desenvolvimento
```

### 💾 Backend & Dados
```
🔋 Supabase                - Backend-as-a-Service
🔐 Supabase Auth          - Autenticação JWT
💾 PostgreSQL             - Banco relacional
📏 AsyncStorage           - Persistência local
🌐 NetInfo                 - Detecção de conectividade
```

### 🔄 Sincronização & Offline
```
📋 AsyncStorage Queue     - Fila de operações pendentes
🔄 Auto Sync               - Sincronização automática
🔌 Offline Detection      - Monitoramento de conectividade
📦 Data Persistence       - Armazenamento local robusto
```

### 🛠️ DevOps & Qualidade
```
🧩 Schema Validation      - Validação de banco de dados
🐛 Debug Tools             - Ferramentas de debug
📄 Migration Scripts       - Scripts de migração SQL
📊 Performance Monitor     - Monitoramento de performance
```

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

## 📚 Funcionalidades Principais

### 🔐 Sistema de Autenticação Segura
- ✓ Login/registro com email e senha
- ✓ Sessão persistente com Supabase Auth
- ✓ Recuperação de senha
- ✓ Logout seguro

### 📝 Sistema de Anotações Avançadas
- ✓ **CRUD Completo** - Criar, ler, atualizar e deletar anotações
- ✓ **Categorização** - Importante, Dúvida, Revisão, Ideia, etc.
- ✓ **Sistema de Cores** - Organização visual por cores
- ✓ **Posições Precisas** - Anotações vinculadas a posições específicas
- ✓ **Busca e Filtros** - Encontre anotações por categoria ou conteúdo
- ✓ **Export/Import** - Backup e restauração de anotações

### ❤️ Sistema de Favoritos
- ✓ Marcar/desmarcar livros favoritos
- ✓ Lista organizada de favoritos
- ✓ Acesso rápido aos livros preferidos
- ✓ Sincronização entre dispositivos

### 📱 Leitor Multiplataforma
- ✓ **Interface Intuitiva** - Leitura por capítulos
- ✓ **Multi-formato** - Ebooks, light novels, mangás
- ✓ **Navegação Rápida** - Entre capítulos e livros
- ✓ **Modo Escuro/Claro** - Conforto visual

### 🔄 Funcionalidade Offline-First
- ✓ **Operações Offline** - CRUD completo sem internet
- ✓ **Fila de Sincronização** - Operações pendentes organizadas
- ✓ **Auto-Sync** - Sincronização automática ao conectar
- ✓ **Conflict Resolution** - Resolução inteligente de conflitos
- ✓ **Status Indicators** - Indicadores visuais de status de sync

## ⚡ Instalação Rápida

```bash
# Clone o repositório
git clone https://github.com/ademisson-Auto/Noxus.git
cd Noxus

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais do Supabase

# Inicie o projeto
npx expo start
```

### 📝 Pré-requisitos

- Node.js 18+
- npm ou yarn
- Expo CLI global: `npm install -g @expo/cli`
- Conta no [Supabase](https://supabase.com) (gratuita)
- Expo Go app no seu dispositivo (para testes)

### 🚀 Comandos de Desenvolvimento

```bash
# Executar no Android
npx expo run:android

# Executar no iOS  
npx expo run:ios

# Executar na Web
npx expo start --web

# Limpar cache
npx expo start --clear
```

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

## 🛣️ Roadmap

### 🕰️ Próximas Atualizações

- [ ] 📸 **Screenshots & Demo** - Adicionar imagens e vídeo demonstrativo
- [ ] 📊 **Dashboard de Analytics** - Estatísticas de leitura e anotações
- [ ] 🔍 **Busca Global** - Busca avançada em todo o conteúdo
- [ ] 📄 **Export Avançado** - PDF, Markdown, Notion
- [ ] 🔔 **Notificações** - Lembretes de leitura e metas
- [ ] 🎙️ **Notas de Voz** - Anotações em áudio

### 💡 Ideias Futuras

- 🤖 **IA Reading Assistant** - Sugestões inteligentes de anotações
- 👥 **Social Reading** - Compartilhamento e discussões
- 🎨 **Temas Personalizados** - Interface totalmente customizável
- ☁️ **Multi-device Sync** - Sincronização em tempo real
- 📚 **Library Management** - Organização avançada de biblioteca

## 🤝 Como Contribuir

Contribuições são muito bem-vindas! Este projeto prioriza qualidade de código e experiência do desenvolvedor.

### 🐛 Reportar Bugs
1. Verifique se o bug já foi reportado nas [Issues](https://github.com/ademisson-Auto/Noxus/issues)
2. Crie uma nova issue com:
   - Descrição detalhada do problema
   - Passos para reproduzir
   - Screenshots ou vídeos
   - Logs relevantes
   - Informações do dispositivo

### ✨ Sugerir Melhorias
1. Abra uma issue com o label `enhancement`
2. Descreva a funcionalidade proposta
3. Explique o caso de uso
4. Sugira implementação se possível

### 📝 Contribuir com Código
1. Faça um fork do projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Siga os padrões de código (TypeScript, ESLint)
4. Implemente testes quando aplicável
5. Commit com mensagens descritivas
6. Push para a branch: `git push origin feature/nova-funcionalidade`
7. Abra um Pull Request

### 🧩 Diretrizes Técnicas

- **TypeScript**: Tipagem forte obrigatória
- **Padrões**: Siga os padrões existentes do projeto
- **Performance**: Considere impacto na performance
- **Offline-First**: Mantenha compatibilidade offline
- **Testes**: Adicione testes para novas funcionalidades

## 📋 Licença

Este projeto está licenciado sob a **Licença MIT** - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

<div align="center">
  
  **📖 Noxus - Leitura inteligente com anotações avançadas**
  
  *Arquitetura offline-first para uma experiência de leitura superior*
  
  Desenvolvido com ❤️ por [Ademisson](https://github.com/ademisson-Auto)
  
  [![GitHub](https://img.shields.io/badge/GitHub-ademisson--Auto-black?logo=github)](https://github.com/ademisson-Auto)
  [![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue?logo=linkedin)](https://linkedin.com/in/ademisson)
  
  **Se este projeto te inspirou, deixe uma ⭐!**
  
</div>
