import type { Assessment, Component } from './schema'
import type { Bundle } from '@/lib/content/loader'

export function selectPresentation(
  state: Assessment,
  components: Component[],
  bundle: Bundle
) {
  const matches = (
    condition: Bundle['findings'][number]['conditions'][number],
    conservative = false
  ) => {
    const component = components.find((c) => c.vector === condition.vector)
    if (!condition.assessed) return component?.value == null
    if (component?.value == null) return false
    return (
      (condition.min === undefined ||
        (conservative ? component.range[0] : component.value) >=
          condition.min) &&
      (condition.max === undefined ||
        (conservative ? component.range[1] : component.value) <= condition.max)
    )
  }
  const findings = bundle.findings
    .filter(
      (finding) =>
        finding.conditions.every((c) => matches(c, true)) &&
        !finding.exclusions.some((c) => matches(c))
    )
    .filter((finding) =>
      finding.conditions.every(
        (c) =>
          !c.assessed ||
          (!state.unresolved.some(
            (u) => u.vector === c.vector && u.kind !== 'reference'
          ) &&
            (components.find((component) => component.vector === c.vector)
              ?.evidenceIds.length ?? 0) > 0)
      )
    )
    .slice(0, 3)
    .map((finding) => ({
      id: finding.id,
      text: finding.text,
      evidenceIds: [
        ...new Set(
          finding.conditions.flatMap(
            (c) =>
              components.find((component) => component.vector === c.vector)
                ?.evidenceIds ?? []
          )
        )
      ]
    }))
  const relevance = (resource: Bundle['resources'][number]) =>
    resource.conditions.length +
    resource.conditions.filter(
      (c) => c.min !== undefined || c.max !== undefined
    ).length /
      4 +
    resource.priority
  const groups = new Set<string>()
  const resources = bundle.resources
    .filter(
      (resource) =>
        resource.familiarity === 'general' ||
        state.familiarity.level === 'expert'
    )
    .filter(
      (resource) =>
        resource.conditions.every((c) => matches(c)) &&
        !resource.exclusions.some((c) => matches(c))
    )
    .sort((a, b) => relevance(b) - relevance(a) || a.id.localeCompare(b.id))
    .filter((resource) => {
      if (groups.has(resource.purposeGroup)) return false
      groups.add(resource.purposeGroup)
      return true
    })
    .slice(0, 3)
    .map(({ id, title, url, purpose, effort }) => ({
      id,
      title,
      url,
      purpose,
      effort
    }))
  return { findings, resources }
}
