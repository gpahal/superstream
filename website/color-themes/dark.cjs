const { blueDark, greenDark, redDark, sageDark, yellowDark } = require('@radix-ui/colors')

const { radixColorsWithoutName } = require('./common.cjs')

module.exports = {
  bg: {
    '': sageDark.sage2,
    emphasis: sageDark.sage1,
  },
  fg: {
    '': 'hsl(0 0% 100%)',
    muted: 'hsl(155, 5.67%, 82.6%)',
    subtle: 'hsl(155, 5.33%, 72.2%)',
  },
  neutral: radixColorsWithoutName(sageDark),
  primary: radixColorsWithoutName(greenDark, 'hsl(0 0% 100%)'),
  info: radixColorsWithoutName(blueDark, 'hsl(0 0% 100%)'),
  warn: radixColorsWithoutName(yellowDark, 'hsl(0 0% 0%)'),
  error: radixColorsWithoutName(redDark, 'hsl(0 0% 100%)'),
  link: radixColorsWithoutName(blueDark),
  code: {
    bg: sageDark.sage4,
  },
}
