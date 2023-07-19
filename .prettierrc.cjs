const baseConfig = require('@gpahal/prettier-config/base')
const { addPrettierTailwindConfig } = require('@gpahal/prettier-config/tailwindcss')

/** @type {import("@gpahal/prettier-config/base").PrettierBaseConfig & import("@gpahal/prettier-config/tailwindcss").PrettierTailwindConfig} */
const config = addPrettierTailwindConfig(baseConfig, './website/tailwind.config.cjs')

module.exports = config
