/* eslint-.env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
    root: true,
    env: {
        node: true,
    },
    extends: [
        'plugin:vue/vue3-essential',
        'plugin:vue/vue3-recommended',
        'eslint:recommended',
        '@vue/typescript/recommended',
        'plugin:prettier/recommended',
    ],
    parserOptions: {
        ecmaVersion: 2020,
    },
    parser: 'vue-eslint-parser',
    globals: {
        $: true,
        jQuery: true,
        NodeJS: true,
    },
    rules: {
        'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        'vue/no-reserved-component-names': 'off',
    },
    overrides: [
        {
            files: [
                '**/__tests__/*.{j,t}s?(x)',
                '**/tests/unit/**/*.spec.{j,t}s?(x)',
            ],
            env: {
                jest: true,
            },
        },
    ],
}
