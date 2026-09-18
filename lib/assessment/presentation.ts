import type { Assessment, Component } from './schema'
import { worldviewIds } from './schema'
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
  const eligibleFindings = bundle.findings
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
  const isWorldview = (finding: Bundle['findings'][number]) =>
    finding.conditions.some((c) => worldviewIds.some((id) => id === c.vector))
  // Reserve room for both what the participant expects and how they reason.
  // Within each group, retain authored order and all evidence/range gates.
  const reasoning = eligibleFindings.find((finding) => !isWorldview(finding))
  const worldview = eligibleFindings.find(isWorldview)
  const selected = [reasoning, worldview, ...eligibleFindings]
  const findings = selected
    .filter(
      (finding, index): finding is Bundle['findings'][number] =>
        finding !== undefined && selected.indexOf(finding) === index
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
  const topicPresent = (vector: string) => {
    const component = components.find((c) => c.vector === vector)
    return Boolean(component?.evidenceIds.length)
  }
  const openTopics = (resource: Bundle['resources'][number]) =>
    resource.conditions.filter(
      (c) =>
        c.basis === 'topic' &&
        topicPresent(c.vector) &&
        (components.find((component) => component.vector === c.vector)?.value ==
          null ||
          state.unresolved.some(
            (item) => item.vector === c.vector && item.kind !== 'reference'
          ))
    ).length
  const relevance = (resource: Bundle['resources'][number]) =>
    resource.conditions.length +
    resource.conditions.filter(
      (c) => c.min !== undefined || c.max !== undefined
    ).length /
      4 +
    resource.priority
  const groups = new Set<string>()
  const topics = new Set<string>()
  const resources = bundle.resources
    .filter(
      (resource) =>
        resource.familiarity === 'general' ||
        state.familiarity.level === 'expert'
    )
    .filter(
      (resource) =>
        resource.conditions.every((c) =>
          c.basis === 'topic' ? topicPresent(c.vector) : matches(c)
        ) && !resource.exclusions.some((c) => matches(c))
    )
    .sort(
      (a, b) =>
        openTopics(b) - openTopics(a) ||
        relevance(b) - relevance(a) ||
        a.id.localeCompare(b.id)
    )
    .filter((resource) => {
      const coveredTopics = resource.conditions
        .filter((c) => c.basis === 'topic')
        .map((c) => c.vector)
      if (
        groups.has(resource.purposeGroup) ||
        coveredTopics.some((topic) => topics.has(topic))
      )
        return false
      groups.add(resource.purposeGroup)
      for (const topic of coveredTopics) topics.add(topic)
      return true
    })
    .slice(0, 3)
    .map(({ id, title, url, purpose, question, effort }) => ({
      id,
      title,
      url,
      purpose,
      question,
      effort
    }))
  return { findings, resources }
}
