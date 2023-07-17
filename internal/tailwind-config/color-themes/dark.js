const { blueDark, greenDark, redDark, sageDark, yellowDark } = require('@radix-ui/colors')

const { radixColorsWithoutName, black, white } = require('./common.js')

module.exports = {
  bg: {
    '': sageDark.sage2,
    emphasis: black,
  },
  fg: white,
  neutral: radixColorsWithoutName(sageDark),
  primary: radixColorsWithoutName(greenDark, white),
  info: radixColorsWithoutName(blueDark, white),
  warn: radixColorsWithoutName(yellowDark, black),
  error: radixColorsWithoutName(redDark, white),
  link: radixColorsWithoutName(blueDark),
}
