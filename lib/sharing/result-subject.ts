/** Presentation identity; never used for scoring or inference. */
export type ResultSubject = {
  name: string
  avatar?: string
  possessivePronoun?: 'his' | 'her' | 'their'
}

export function resultFraming(subject?: ResultSubject) {
  const possessive = subject?.possessivePronoun ?? 'their'
  return {
    owner: subject ? `${subject.name}’s` : 'Your',
    possessive: subject ? possessive : 'your',
    answers: subject ? `${possessive} simulated answers` : 'your answers',
    hingeQuestion: (hinge: { id: string; question: string }) => {
      if (!subject) return hinge.question
      const questions: Record<string, string> = {
        assumption: `If this assumption turned out differently, how would ${possessive} outlook change?`,
        uncertainty: `What would help ${possessive === 'his' ? 'him' : possessive === 'her' ? 'her' : 'them'} distinguish the plausible outcomes here?`,
        update: `What evidence would be enough, and in which direction would it move ${possessive} view?`
      }
      return questions[hinge.id] ?? hinge.question
    },
    detailsTitle: 'More details',
    resultsLabel: subject
      ? `${subject.name}’s simulated worldview results`
      : 'Your worldview results'
  }
}
