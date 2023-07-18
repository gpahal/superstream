const { blue, green, red, sage, yellow } = require('@radix-ui/colors')

const { radixColorsWithoutName } = require('./common.cjs')

module.exports = {
  bg: {
    '': '#ffffff',
    emphasis: sage.sage3,
  },
  fg: {
    '': sage.sage12,
    muted: 'hsl(155, 17%, 20.33%)',
    subtle: sage.sage11,
  },
  neutral: radixColorsWithoutName(sage),
  primary: radixColorsWithoutName(green, '#ffffff'),
  info: radixColorsWithoutName(blue, '#ffffff'),
  warn: radixColorsWithoutName(yellow, '#000000'),
  error: radixColorsWithoutName(red, '#ffffff'),
  link: radixColorsWithoutName(blue),
  code: {
    bg: sage.sage2,
  },
}
