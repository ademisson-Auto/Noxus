module.exports = {
  'env': {
    'browser': true,
    'es2021': true,
    'react-native/react-native': true
  },
  'extends': [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:promise/recommended'
  ],
  'parser': '@typescript-eslint/parser',
  'parserOptions': {
    'ecmaVersion': 'latest',
    'sourceType': 'module',
    'ecmaFeatures': {
      'jsx': true
    }
  },
  'plugins': [
    'react',
    'react-native',
    '@typescript-eslint',
    'promise'
  ],
  'rules': {
    // Regras de padronização de estilo
    'camelcase': ['warn', { 
      'properties': 'never',
      'ignoreDestructuring': true,
      'ignoreImports': true,
      'allow': ['user_id', 'book_id', 'chapter_id', 'created_at', 'updated_at', 'last_read', 'reading_time', 'avatar_url', 'p_table_name', 'is_nullable', 'data_type', 'column_name', 'books_read', 'cover_url']
    }],
    'promise/prefer-await-to-then': 'warn',
    'promise/prefer-await-to-callbacks': 'warn',
    'react/prop-types': 'off', // Não necessário com TypeScript
    'react-native/no-inline-styles': 'warn',
    'react-native/no-unused-styles': 'warn',
    
    // Configuração para JSX com React 17+ (não necessita import)
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',
    
    // Regras para consistência de código
    'indent': ['warn', 2, { 'SwitchCase': 1 }],
    'linebreak-style': ['warn', 'windows'],
    'quotes': ['warn', 'single', { 'avoidEscape': true }],
    'semi': ['warn', 'always'],
    
    // Reduzir severidade para variáveis não usadas
    '@typescript-eslint/no-unused-vars': 'warn',
    
    // Nomenclatura
    'no-underscore-dangle': ['warn', { 'allow': ['_id'] }]
  },
  'settings': {
    'react': {
      'version': 'detect'
    }
  }
}; 