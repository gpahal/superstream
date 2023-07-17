/** @type {import("eslint").Linter.Config} */
const config = {
  root: true,
  extends: [
    'turbo',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:@typescript-eslint/stylistic-type-checked',
    'prettier',
  ],
  env: {
    es2022: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: true,
  },
  plugins: ['@typescript-eslint', 'unicorn'],
  rules: {
    'no-unused-vars': 'off',
    'no-restricted-imports': [
      'error',
      {
        patterns: ['..*'],
      },
    ],
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
    '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'no-type-imports' }],
    '@typescript-eslint/no-misused-promises': [2, { checksVoidReturn: { attributes: false } }],
    '@typescript-eslint/no-floating-promises': ['error'],
    '@typescript-eslint/prefer-nullish-coalescing': ['off'],
    '@typescript-eslint/unbound-method': ['off'],
    'unicorn/filename-case': [
      'error',
      {
        cases: {
          kebabCase: true,
        },
      },
    ],
    'unicorn/prefer-node-protocol': 'error',
  },
  ignorePatterns: [
    '**/.*.cjs',
    '**/*.config.cjs',
    'pnpm-lock.yaml',
    '.turbo',
    'build',
    'dist',
    'target',
    'out',
    '.out',
    '.next',
    '.vercel',
    '.anchor',
    'tmp',
    '.tmp',
    '.cache',
    '.eslintcache',
    'node_modules',
    'test-ledger',
    '.vscode',
    '.history',
    '.idea',
    '.idea_modules',
  ],
  reportUnusedDisableDirectives: true,
}

module.exports = config
