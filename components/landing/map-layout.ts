// Move overlapping portrait labels, never the measured points they connect to.
export function placePortraits(
  anchors: { x: number; y: number }[],
  width: number,
  height: number,
  diameter: number
) {
  const placed: { x: number; y: number }[] = []
  const clearanceSquared = (diameter + 5) ** 2
  const fits = (x: number, y: number) =>
    placed.every((p) => (p.x - x) ** 2 + (p.y - y) ** 2 >= clearanceSquared)
  for (const anchor of anchors) {
    if (fits(anchor.x, anchor.y)) {
      placed.push(anchor)
      continue
    }
    let best = anchor
    let bestDistance = Infinity
    // A bounded grid also handles several personas at the exact same point.
    for (let x = 0; x <= width; x += 4) {
      for (let y = 0; y <= height; y += 4) {
        const distance = (anchor.x - x) ** 2 + (anchor.y - y) ** 2
        if (distance >= bestDistance || !fits(x, y)) continue
        best = { x, y }
        bestDistance = distance
      }
    }
    placed.push(best)
  }
  return placed
}
