const { blueDark, greenDark, redDark, sageDark, yellowDark, indigoDark } = require('@radix-ui/colors')

const { radixColorsWithoutName, black, white } = require('./common.cjs')

module.exports = {
  bg: {
    '': sageDark.sage2,
    emphasis: sageDark.sage1,
  },
  fg: {
    '': white,
    muted: 'hsl(155, 5.67%, 82.6%)',
    subtle: 'hsl(155, 5.33%, 72.2%)',
  },
  neutral: radixColorsWithoutName(sageDark),
  primary: radixColorsWithoutName(greenDark, '#ffffff'),
  info: radixColorsWithoutName(blueDark, '#ffffff'),
  warn: radixColorsWithoutName(yellowDark, '#000000'),
  error: radixColorsWithoutName(redDark, '#ffffff'),
  link: radixColorsWithoutName(blueDark),
  code: {
    bg: sageDark.sage4,
  },
}
