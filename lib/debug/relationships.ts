import type { Prompt, Reference } from '@/lib/content/schema'
import { retiredPromptReason } from '@/lib/assessment/prompt-policy'

export type GraphEdge = { source: string; target: string; label: string }
export type QuestionRelation = 'transitions' | 'targets' | 'novelty'

export function questionRelationships(
  prompts: Prompt[],
  selectedId: string,
  relation: QuestionRelation
): GraphEdge[] {
  const selected = prompts.find((prompt) => prompt.id === selectedId)
  if (!selected) return []
  if (relation === 'transitions') {
    const permitted = (from: Prompt, to: Prompt) =>
      to.family !== 'root' &&
      !retiredPromptReason(to.id) &&
      (to.permittedAfter.includes('*') ||
        to.permittedAfter.includes(from.family))
    return prompts
      .filter((prompt) => prompt.id !== selectedId)
      .flatMap((prompt) => {
        const edges: GraphEdge[] = []
        if (permitted(selected, prompt))
          edges.push({
            source: selectedId,
            target: prompt.id,
            label: 'Permitted next family'
          })
        if (permitted(prompt, selected))
          edges.push({
            source: prompt.id,
            target: selectedId,
            label: 'Permitted previous family'
          })
        return edges
      })
  }
  return prompts
    .filter((prompt) => prompt.id !== selectedId)
    .flatMap((prompt) => {
      const shared =
        relation === 'targets'
          ? prompt.targets.filter((target) => selected.targets.includes(target))
          : prompt.noveltyGroup === selected.noveltyGroup
            ? [prompt.noveltyGroup]
            : []
      return shared.length
        ? [{ source: selectedId, target: prompt.id, label: shared.join(', ') }]
        : []
    })
}
export function corpusRelationships(
  references: Reference[],
  selectedId: string
): GraphEdge[] {
  return references
    .flatMap((reference) => [
      ...reference.entities.map((id) => ({
        source: reference.id,
        target: id,
        label: 'Associated entity'
      })),
      ...reference.related.map((id) => ({
        source: reference.id,
        target: id,
        label: 'Authored related entry'
      }))
    ])
    .filter((edge) => edge.source === selectedId || edge.target === selectedId)
}
