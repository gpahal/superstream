function radixColorsWithoutName(colors, fg) {
  const newObj = { fg }
  Object.entries(colors).forEach(([k, v]) => {
    if (k.endsWith('10') || k.endsWith('11') || k.endsWith('12')) {
      newObj[k.slice(-2)] = v
    } else {
      newObj[k.slice(-1)] = v
    }
  })
  return newObj
}

module.exports = {
  radixColorsWithoutName,
}
