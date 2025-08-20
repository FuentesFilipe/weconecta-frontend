// @ts-check
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import globals from 'globals'
import nodePlugin from 'eslint-plugin-node';
import perfectionist from 'eslint-plugin-perfectionist';
import unicorn from 'eslint-plugin-unicorn';

export default tseslint.config(
  eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    {
    plugins: {
      node: nodePlugin, perfectionist, unicorn
    },
    languageOptions: {
        globals: {
            ...globals.node,
            ...globals.browser
        },
        parserOptions: {
            projectService: true,
            tsconfigRootDir: import.meta.dirname
        }
    },
    rules: {
      // estilo
      indent: ['error', 4],
      semi: ['error', 'always'],
      quotes: ['error', 'single', { avoidEscape: true }],

      // regras TypeScript
      '@typescript-eslint/no-redeclare': 'off',
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],

      // outras regras
      'no-console': ['warn'],
      'node/prefer-global/process': 'off',
      'node/no-process-env': 'error',

      // import sorting (se você usa eslint-plugin-perfectionist)
      'perfectionist/sort-imports': [
        'error',
        {
          tsconfigRootDir: '.'
        }
      ],

      // filename case
      'unicorn/filename-case': [
        'error',
        {
          case: 'pascalCase',
          ignore: [
            'globals.css',
            'client.tsx',
            'layout.tsx',
            'README.md',
            'index.css',
            'index.ts',
            'index.tsx',
            'page.tsx'
          ]
        }
      ]
    }
  },
  {
    files: ['index.ts', 'index.tsx', 'page.tsx', 'components/ui/**/*'],
    rules: {
      'unicorn/filename-case': 'off'
    }
  }
)
