/**
 * Deterministic PRNG (Mulberry32) + Fisher-Yates shuffle.
 * Keeps product order stable within a given time window (default: 15 minutes)
 * so Vite prerendering and client hydration match, and back-button navigation
 * doesn't suffer from layout shift.
 */
export function getTimeBucketSeed(minutes = 15, salt = 0): number {
  const bucket = Math.floor(Date.now() / (1000 * 60 * minutes))
  return bucket + salt
}

export function seededShuffle<T>(items: T[], seed: number): T[] {
  if (items.length <= 1) return items

  const result = [...items]
  let currentSeed = seed

  const random = () => {
    currentSeed |= 0
    currentSeed = (currentSeed + 0x6d2b79f5) | 0
    let t = Math.imul(currentSeed ^ (currentSeed >>> 15), 1 | currentSeed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }

  return result
}

/**
 * Keeps the top `pinnedCount` newest drops strictly chronological,
 * and shuffles the remaining pool so repeat visitors always see fresh additions first.
 */
export function shuffleWithPinned<T>(
  sortedItems: T[],
  seed: number,
  pinnedCount = 0
): T[] {
  if (pinnedCount <= 0) return seededShuffle(sortedItems, seed)
  if (sortedItems.length <= pinnedCount) return sortedItems

  const pinned = sortedItems.slice(0, pinnedCount)
  const pool = sortedItems.slice(pinnedCount)
  return [...pinned, ...seededShuffle(pool, seed)]
}