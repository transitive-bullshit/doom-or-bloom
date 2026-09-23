/** Experimental display adjustment: sharpen around a fixed 65% crossover. */
export function sharpenInferredPdoom(p: number): number {
  const squared = p * p
  return (0.35 * squared) / (0.35 * squared + 0.65 * (1 - p) ** 2)
}

/** Delta-method spread: scale asymmetric offsets by the curve's local slope. */
export function recenterPdoomBounds(
  rawEstimate: number,
  rawBounds: [number, number],
  correctedEstimate: number
): [number, number] {
  const p = rawEstimate
  const denominator = 0.35 * p ** 2 + 0.65 * (1 - p) ** 2
  const scale = (2 * 0.35 * 0.65 * p * (1 - p)) / denominator ** 2
  return [
    Math.max(0, correctedEstimate + scale * (rawBounds[0] - p)),
    Math.min(1, correctedEstimate + scale * (rawBounds[1] - p))
  ]
}
