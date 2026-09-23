import type { Result } from '@/lib/assessment/schema'
import {
  closestPersonas,
  type PersonaComparison
} from '@/lib/assessment/persona-matches'
import type { CardData } from './card'

export function resultCardData(
  result: Result,
  personas: PersonaComparison[] = []
): CardData {
  return {
    horizontal: result.horizontal.value,
    vertical: result.vertical.value,
    horizontalRange: result.horizontal.range,
    verticalRange: result.vertical.range,
    influence: result.experiment?.influence.value ?? null,
    transformation: result.experiment?.transformation.value ?? null,
    influenceRange: result.experiment?.influence.range ?? [0, 1],
    transformationRange: result.experiment?.transformation.range ?? [0, 1],
    influenceInterpretation: result.experiment?.influence.interpretation,
    transformationInterpretation:
      result.experiment?.transformation.interpretation,
    upside:
      result.components.find((c) => c.vector === 'beneficial_potential')
        ?.value ?? null,
    harm:
      result.components.find((c) => c.vector === 'risk_landscape')?.value ??
      null,
    upsideRange: result.components.find(
      (c) => c.vector === 'beneficial_potential'
    )?.range,
    harmRange: result.components.find((c) => c.vector === 'risk_landscape')
      ?.range,
    pdoom:
      result.experiment?.pdoom?.estimate ??
      (result.experiment?.pdoom?.bounds
        ? (result.experiment.pdoom.bounds[0] +
            result.experiment.pdoom.bounds[1]) /
          2
        : null),
    pdoomRange: result.experiment?.pdoom?.bounds,
    pdoomToken: result.experiment?.pdoom?.token,
    generatedAt: result.experiment?.generatedAt,
    closestPersonaIds: closestPersonas(result, personas).map(({ id }) => id),
    provisional: result.provisional
  }
}
