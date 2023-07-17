/** @type {import("stylelint").Config} */
const config = {
  extends: ['stylelint-config-standard'],
  rules: {
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['tailwind', 'apply', 'layer', 'config'],
      },
    ],
    'function-no-unknown': [
      true,
      {
        ignoreFunctions: ['theme'],
      },
    ],
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
}

module.exports = config
