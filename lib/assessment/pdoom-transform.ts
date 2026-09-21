/** Experimental display adjustment: sharpen around a fixed 65% crossover. */
export function sharpenInferredPdoom(p: number): number {
  const squared = p * p
  return (0.35 * squared) / (0.35 * squared + 0.65 * (1 - p) ** 2)
}
