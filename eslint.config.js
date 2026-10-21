// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const tseslint = require('typescript-eslint');

module.exports = defineConfig([
  expoConfig,
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [...tseslint.configs.strictTypeChecked, ...tseslint.configs.stylisticTypeChecked],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: __dirname },
    },
    rules: {
      eqeqeq: ['error', 'always'],
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-var': 'error',
      'prefer-const': 'error',
      curly: ['error', 'multi-line'],
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // The codebase declares props and data shapes with `type`; interfaces add nothing here.
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      // `onPress={() => router.push(...)}` is idiomatic in handlers.
      '@typescript-eslint/no-confusing-void-expression': ['error', { ignoreArrowShorthand: true }],
      // `.catch(() => {})` and no-op defaults are deliberate here.
      '@typescript-eslint/no-empty-function': ['error', { allow: ['arrowFunctions'] }],
      // `Easing.quad` and friends are plain functions in React Native's typings.
      '@typescript-eslint/unbound-method': ['error', { ignoreStatic: true }],
      // Event handlers and effects routinely hand promises to callbacks that return void.
      '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: { attributes: false } }],
      // Template literals with numbers are fine and everywhere in UI strings.
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
    },
  },
  {
    // Config and build scripts run in Node, not React Native.
    files: ['*.js', 'scripts/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: { __dirname: 'readonly', require: 'readonly', module: 'writable', process: 'readonly', console: 'readonly' },
    },
    rules: { 'no-console': 'off' },
  },
  {
    ignores: ['dist/*', '.expo/*'],
  },
]);
