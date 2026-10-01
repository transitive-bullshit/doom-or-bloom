/** Presentation identity; never used for scoring or inference. */
export type ResultSubject = {
  name: string
  avatar?: string
  possessivePronoun?: 'his' | 'her' | 'their'
  /**
   * A simulated user (the default), or a real person's card-only share link,
   * whose point is “their view” rather than a simulation.
   */
  kind?: 'simulated' | 'shared'
}

/**
 * Arguments for messages that address the participant or describe a simulated
 * user: `subject` is `self` or the subject's possessive pronoun, for an ICU
 * select (`{subject, select, self {…} his {…} her {…} other {…}}`), and `name`
 * names the subject. Languages without gendered possessives use `other` alone.
 */
export function subjectArgs(subject?: ResultSubject) {
  return {
    subject: subject ? (subject.possessivePronoun ?? 'their') : 'self',
    name: subject?.name ?? ''
  }
}
