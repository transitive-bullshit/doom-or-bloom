export type PortraitBox = {
  x: number
  y: number
  width: number
  height: number
}

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value))

/** Visual-only separation, restarted from data anchors on every layout. */
export function separatePortraits(
  boxes: PortraitBox[],
  width: number,
  height: number
) {
  const positions = boxes.map((box) => ({
    ...box,
    x: clamp(box.x, 0, width),
    y: clamp(box.y, 0, height)
  }))
  for (let pass = 0; pass < 3; pass++) {
    const shifts = positions.map(() => ({ x: 0, y: 0 }))
    for (let i = 0; i < positions.length; i++) {
      const a = positions[i]!
      for (let j = i + 1; j < positions.length; j++) {
        const b = positions[j]!
        const overlapX = Math.max(
          0,
          Math.min(a.x + a.width / 2, b.x + b.width / 2) -
            Math.max(a.x - a.width / 2, b.x - b.width / 2)
        )
        const overlapY = Math.max(
          0,
          Math.min(a.y + a.height / 2, b.y + b.height / 2) -
            Math.max(a.y - a.height / 2, b.y - b.height / 2)
        )
        if (
          overlapX * overlapY <=
          0.25 * Math.min(a.width * a.height, b.width * b.height)
        )
          continue
        const dx = b.x - a.x
        const dy = b.y - a.y
        const distance = Math.hypot(dx, dy)
        // Stable tie-breaker for identical coordinates, without random jitter.
        const angle = (((i * 31 + j * 17) % 360) * Math.PI) / 180
        const x = distance ? dx / distance : Math.cos(angle)
        const y = distance ? dy / distance : Math.sin(angle)
        shifts[i]!.x -= x * 6
        shifts[i]!.y -= y * 6
        shifts[j]!.x += x * 6
        shifts[j]!.y += y * 6
      }
    }
    positions.forEach((position, i) => {
      const shift = shifts[i]!
      const scale = Math.min(1, 6 / (Math.hypot(shift.x, shift.y) || 1))
      position.x = clamp(position.x + shift.x * scale, 0, width)
      position.y = clamp(position.y + shift.y * scale, 0, height)
    })
  }
  return positions
}
