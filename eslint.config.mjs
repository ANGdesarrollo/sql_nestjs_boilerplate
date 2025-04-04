import eslint from '@eslint/js';
import eslintPluginImport from 'eslint-plugin-import';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['.eslintrc.js', 'dist', 'node_modules', 'scripts'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      globals: {
        ...globals.node
      },
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        project: 'tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      import: eslintPluginImport
    }
  },
  {
    rules: {
      // Formatting & Style rules
      'brace-style': ['error', 'allman', { allowSingleLine: true }],
      'indent': ['error', 2, {
        SwitchCase: 1,
        VariableDeclarator: 1,
        outerIIFEBody: 1,
        MemberExpression: 1,
        FunctionDeclaration: { body: 1, parameters: 1 },
        FunctionExpression: { body: 1, parameters: 1 },
        CallExpression: { arguments: 1 },
        ArrayExpression: 1,
        ObjectExpression: 1,
        ImportDeclaration: 1,
        flatTernaryExpressions: false,
        offsetTernaryExpressions: true,
        ignoreComments: false
      }],
      'quotes': ['warn', 'single'],
      'semi': ['warn', 'always'],
      'semi-spacing': ['warn', { 'before': false, 'after': true }],
      'comma-spacing': ['warn', { 'before': false, 'after': true }],
      'space-infix-ops': 'error',
      'space-in-parens': ['warn', 'never'],
      'spaced-comment': ['error', 'always'],
      'array-bracket-spacing': ['warn', 'never'],
      'object-curly-spacing': ['warn', 'always'],
      'block-spacing': 'warn',
      'arrow-spacing': 'warn',
      'space-before-function-paren': ['warn', 'never'],
      'keyword-spacing': ['warn', { 'before': true }],
      'linebreak-style': ['error', 'unix'],
      'padded-blocks': ['error', 'never'],
      'eol-last': ['error', 'always'],
      'max-len': [
        'warn',
        {
          'ignoreStrings': true,
          'ignoreRegExpLiterals': true,
          'code': 300
        }
      ],
      'no-multiple-empty-lines': 'warn',
      'no-trailing-spaces': [
        'warn',
        { 'ignoreComments': false, 'skipBlankLines': false }
      ],
      'comma-dangle': [
        'error',
        {
          'arrays': 'never',
          'objects': 'never',
          'imports': 'never',
          'exports': 'never',
          'functions': 'never'
        }
      ],

      // Best practices
      'prefer-const': 'warn',
      'no-shadow-restricted-names': 'error',
      'no-sequences': 'error',
      'no-new-wrappers': 'error',
      'no-eval': 'error',
      'no-fallthrough': 'warn',
      'no-cond-assign': 'error',
      'no-duplicate-case': 'error',
      'no-empty': 'off',
      'no-caller': 'error',
      'new-parens': 'error',
      'max-lines': ['warn', 600],
      'no-unused-vars': 'off', // Using TS version
      'no-prototype-builtins': 'warn',
      'no-console': 'warn',
      'prefer-template': 'error',
      'no-throw-literal': 'error',
      'no-undef-init': 'error',
      'no-unsafe-finally': 'error',
      'no-unused-expressions': 'error',
      'no-unused-labels': 'error',
      'object-shorthand': 'warn',
      'one-var': ['warn', 'never'],
      'prefer-object-spread': 'error',
      'quote-props': ['error', 'consistent-as-needed'],
      'radix': 'error',
      'curly': 'warn',
      'use-isnan': 'error',

      // TypeScript-specific rules
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-use-before-define': [
        'warn',
        { 'functions': true, 'variables': true, 'classes': false }
      ],
      '@typescript-eslint/no-shadow': 'error',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      'no-mixed-spaces-and-tabs': 'off',

      // Import rules
      'import/order': [
        'error',
        {
          'newlines-between': 'always',
          'alphabetize': { 'order': 'asc', 'caseInsensitive': true },
          'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'pathGroups': [
            {
              'pattern': '@/**',
              'group': 'internal',
            },
          ],
        },
      ],
    },
  },
);
