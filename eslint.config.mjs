/* eslint unicorn/filename-case: "off" */
import antfu from '@antfu/eslint-config';

export default antfu(
    {
        type: 'app',
        react: true,
        typescript: true,
        formatters: true,
        stylistic: {
            indent: 4,
            semi: true,
            quotes: 'single',
        },
    },
    {
        rules: {
            'ts/no-redeclare': 'off',
            'ts/consistent-type-definitions': ['error', 'type'],
            'no-console': ['warn'],
            'antfu/no-top-level-await': ['off'],
            'node/prefer-global/process': ['off'],
            'node/no-process-env': ['error'],
            'perfectionist/sort-imports': [
                'error',
                {
                    tsconfigRootDir: '.',
                },
            ],
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
                        'page.tsx',
                    ],
                },
            ],
        },
    },
    {
        files: [
            'index.ts',
            'index.tsx',
            'page.tsx',
            'components/ui/**/*',
        ],
        rules: {
            'unicorn/filename-case': 'off',
        },
    },
);
