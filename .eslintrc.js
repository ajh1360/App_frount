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
      "react/react-in-jsx-scope": "off",

      semi: ['error', 'always'],
    },
  };