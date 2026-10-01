// ESLint flat config (ESLint 9). Sengaja ringan: fokus ke bug nyata + kebersihan dasar.
const globals = require('globals');

module.exports = [
    { ignores: ['evolve/**', 'wiki/**', 'lib/**', 'node_modules/**', 'dist/**', 'tools/**'] },
    {
        files: ['src/**/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                ...globals.browser,
                $: 'readonly',
                jQuery: 'readonly',
                Vue: 'readonly',
                LZString: 'readonly',
                // library eksternal yang dimuat lewat <script> di index.html
                Sortable: 'readonly',
                CryptoJS: 'readonly',
                Popper: 'readonly',
                Chart: 'readonly',
                gtag: 'readonly',
                importGame: 'readonly', // di-set lewat window.importGame
            },
        },
        rules: {
            // bug nyata
            'no-undef': 'error',
            'eqeqeq': ['warn', 'always'],
            'no-dupe-keys': 'error',
            'no-dupe-args': 'error',
            'no-dupe-else-if': 'error',
            'no-duplicate-case': 'error',
            'no-self-assign': 'error',
            'no-unreachable': 'error',
            'no-const-assign': 'error',
            'no-func-assign': 'error',
            'no-import-assign': 'error',
            'no-unsafe-negation': 'error',
            'use-isnan': 'error',
            'valid-typeof': 'error',
            // kebersihan
            'no-var': 'warn',
            'no-unused-vars': ['warn', { args: 'none', caughtErrors: 'none' }],
            'no-redeclare': 'warn',
            'no-empty': ['warn', { allowEmptyCatch: true }],
        },
    },
    {
        files: ['test/**/*.mjs', 'build*.js', 'eslint.config.js'],
        languageOptions: { ecmaVersion: 2022, sourceType: 'module', globals: { ...globals.node, ...globals.browser, $: 'readonly', Vue: 'readonly', LZString: 'readonly' } },
        rules: { 'no-undef': 'error', 'no-unused-vars': ['warn', { args: 'none', caughtErrors: 'none' }] },
    },
];
