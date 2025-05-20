module.exports = {
    root: true,
    env: {
      browser: true,
      es2021: true,
    },
    extends: [
      'eslint:recommended',
      'plugin:react/recommended',
    ],
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
      ecmaVersion: 12,
    
      sourceType: 'module',
    },
    plugins: ['react'],
    rules: {
      // 예: 세미콜론 필수
      semi: ['error', 'always'],
    },
  };