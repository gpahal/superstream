const { blue, green, red, sage, yellow } = require('@radix-ui/colors')

const { radixColorsWithoutName } = require('./common.cjs')

module.exports = {
  bg: {
    '': 'hsl(0 0% 100%)',
    emphasis: sage.sage3,
  },
  fg: {
    '': sage.sage12,
    muted: 'hsl(155, 17%, 20.33%)',
    subtle: sage.sage11,
  },
  neutral: radixColorsWithoutName(sage),
  primary: radixColorsWithoutName(green, 'hsl(0 0% 100%)'),
  info: radixColorsWithoutName(blue, 'hsl(0 0% 100%)'),
  warn: radixColorsWithoutName(yellow, 'hsl(0 0% 0%)'),
  error: radixColorsWithoutName(red, 'hsl(0 0% 100%)'),
  link: radixColorsWithoutName(blue),
  code: {
    bg: sage.sage2,
  },
}
