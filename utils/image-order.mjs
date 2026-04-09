export function insertImagesAt(currentImages = [], newImages = [], insertIndex = 0, maxCount = Infinity) {
  const currentList = normalizeImageList(currentImages)
  const additions = normalizeImageList(newImages)
  const safeMaxCount = normalizeMaxCount(maxCount)

  if (!additions.length) {
    return currentList.slice(0, safeMaxCount)
  }

  const safeIndex = clampIndex(insertIndex, currentList.length)
  return [
    ...currentList.slice(0, safeIndex),
    ...additions,
    ...currentList.slice(safeIndex)
  ].slice(0, safeMaxCount)
}

export function moveImage(images = [], fromIndex = 0, toIndex = 0) {
  const list = normalizeImageList(images)
  if (!list.length) {
    return []
  }

  const lastIndex = list.length - 1
  if (
    !Number.isInteger(fromIndex) ||
    !Number.isInteger(toIndex) ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex > lastIndex ||
    toIndex > lastIndex ||
    fromIndex === toIndex
  ) {
    return list.slice()
  }

  const nextList = list.slice()
  const [target] = nextList.splice(fromIndex, 1)
  nextList.splice(toIndex, 0, target)
  return nextList
}

function normalizeImageList(list) {
  return Array.isArray(list) ? list.filter(Boolean) : []
}

function normalizeMaxCount(value) {
  if (!Number.isFinite(value) || value <= 0) {
    return Infinity
  }
  return Math.floor(value)
}

function clampIndex(value, max) {
  if (!Number.isInteger(value)) {
    return max
  }
  return Math.max(0, Math.min(max, value))
}
