/** Experimental display adjustment: sharpen around a fixed 65% crossover. */
export function sharpenInferredPdoom(p: number): number {
  const squared = p * p
  return (0.35 * squared) / (0.35 * squared + 0.65 * (1 - p) ** 2)
}

/** Preserve asymmetric interpretation offsets, clipping only at probability limits. */
export function recenterPdoomBounds(
  rawEstimate: number,
  rawBounds: [number, number],
  correctedEstimate: number
): [number, number] {
  const shift = correctedEstimate - rawEstimate
  return [Math.max(0, rawBounds[0] + shift), Math.min(1, rawBounds[1] + shift)]
}
