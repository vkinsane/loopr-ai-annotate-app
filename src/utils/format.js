const toPercent = (value, total) => `${(value / total) * 100}%`

/** Where a box in photo pixels goes on screen, as CSS percentages of the photo. */
export const percentRect = ({ x, y, width, height }, size) => ({
  left: toPercent(x, size.width), top: toPercent(y, size.height), width: toPercent(width, size.width), height: toPercent(height, size.height),
})

export const plural = (count, one, many = `${one}s`) => `${count} ${count === 1 ? one : many}`
