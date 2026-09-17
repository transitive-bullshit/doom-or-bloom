import { questionSchema } from '@/lib/assessment/schema'
import type { QuestionTemplates, Rubric } from '@/lib/content/schema'

export function createQuestions(templates: QuestionTemplates) {
  const authoredQuestion = (
    id: keyof QuestionTemplates['questions'],
    slots: Record<string, string> = {},
    criteria?: Record<string, string | null> | string[]
  ) => {
    const template = templates.questions[id]
    const instructions = template.instructions.replaceAll(
      /\{\{(\w+)\}\}/g,
      (_match, key: string) => {
        if (!(key in slots)) throw new Error('Missing authored question slot')
        return slots[key]!
      }
    )
    return questionSchema.parse(
      criteria
        ? { ...template, instructions, criteria }
        : { ...template, instructions }
    )
  }
  const statusQuestion = (meaning: string, source: string) =>
    authoredQuestion('presence', { meaning, source })
  const rubricQuestions = (rubric: Rubric, source: string) =>
    Object.fromEntries(
      rubric.dimensions.map((d) => [
        d.id,
        authoredQuestion('dimension', { source, meaning: d.meaning }, d.levels)
      ])
    )
  return {
    authoredQuestion,
    statusQuestion,
    rubricQuestions,
    dispositionQuestion: authoredQuestion('disposition')
  }
}
