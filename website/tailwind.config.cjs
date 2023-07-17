const tailwindConfig = require('@internal/tailwind-config')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [...tailwindConfig.content],
  presets: [tailwindConfig],
}
