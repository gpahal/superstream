const baseConfig = require('@gpahal/prettier-config/base')

/** @type {import("@gpahal/prettier-config/base").PrettierConfig} */
const config = {
  ...baseConfig,
  tailwindConfig: './website/tailwind.config.cjs',
}

module.exports = config
