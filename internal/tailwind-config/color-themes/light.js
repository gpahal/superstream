const { blue, green, red, sage, yellow } = require('@radix-ui/colors')

const { radixColorsWithoutName, black, white } = require('./common.js')

module.exports = {
  bg: {
    '': white,
    emphasis: sage.sage3,
  },
  fg: sage.sage12,
  neutral: radixColorsWithoutName(sage),
  primary: radixColorsWithoutName(green, white),
  info: radixColorsWithoutName(blue, white),
  warn: radixColorsWithoutName(yellow, black),
  error: radixColorsWithoutName(red, white),
  link: radixColorsWithoutName(blue),
}
