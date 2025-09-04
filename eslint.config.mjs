export default [
  {
    ignores: ['node_modules', '.nuxt', 'dist', '.output', '**/*.ts', '**/*.vue'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'error',
    },
  },
];
