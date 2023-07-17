/** @type {import('eslint').Linter.Config} */
const config = {
  extends: [
    './base',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:compat/recommended',
  ],
  env: {
    browser: true,
  },
  globals: {
    React: 'writable',
  },
  plugins: ['react', 'jsx-a11y', 'compat', 'tailwindcss'],
  settings: {
    react: {
      version: 'detect',
    },
    tailwindcss: {
      config: './tailwind.config.cjs',
    },
  },
  rules: {
    'react/no-unknown-property': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'jsx-a11y/alt-text': [
      'error',
      {
        elements: ['img'],
        img: ['Image'],
      },
    ],
    'jsx-a11y/aria-props': 'warn',
    'jsx-a11y/aria-proptypes': 'warn',
    'jsx-a11y/aria-unsupported-elements': 'warn',
    'jsx-a11y/role-has-required-aria-props': 'warn',
    'jsx-a11y/role-supports-aria-props': 'warn',
    'react/jsx-no-target-blank': 'off',
    'tailwindcss/enforces-negative-arbitrary-values': 'error',
    'tailwindcss/enforces-shorthand': 'error',
    'tailwindcss/no-contradicting-classname': 'error',
  },
}

module.exports = config
