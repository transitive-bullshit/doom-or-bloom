// The distinction each authored question is meant to resolve. These are
// hypotheses for routing, never claims that the participant has a deficit.
const questionObjectives = {
  'concrete.general':
    'Which concrete change the participant actually expects, beyond general sentiment.',
  'timeline.general':
    'When major everyday change is expected, or whether its timing is explicitly unknown.',
  'conviction.general':
    'How strongly the participant holds the already expressed transformation timeline.',
  'mechanism.general': 'How an expected central change would happen.',
  'grounding.general':
    'The observation or experience underlying the central forecast, beyond its causal mechanism.',
  'control.general':
    'Whether humans can retain control of smarter systems and why.',
  'governance.general':
    'How institutions are expected to respond, separately from desired policy.',
  'upside.general':
    'Which benefits are expected, separately from merely possible benefits.',
  'risk.general':
    'Which harms are expected, separately from merely possible harms.',
  'crux.general': 'A concrete development that would change a central belief.',
  'countercase.general':
    'The strongest opposing argument the participant regards as relevant.',
  'agency.general': 'What the participant values preserving in a good future.',
  'transition.speed':
    'Which constraint or feedback is expected to determine the speed of progress.',
  'transition.warning':
    'Whether irreversible harm would have actionable warning signs.',
  'transition.feedback': 'What constrains AI-driven AI improvement.',
  'upside.distribution':
    'Who is expected to receive benefits, beyond their aggregate scale.',
  'upside.bottleneck':
    'What could prevent potential benefits from reaching ordinary people.',
  'risk.catastrophe':
    'Expected likelihood of irreversible harm, separately from ordinary disruption.',
  'risk.misuse': 'Which misuse is central to the participant’s concern.',
  'risk.ordinary': 'Expected everyday harms outside catastrophe scenarios.',
  'risk.cyber-balance':
    'Whether AI changes the balance between cyberattackers and defenders, and the mechanism deciding that balance.',
  'control.test':
    'Evidence that would change the participant’s controllability expectation.',
  'governance.incentives':
    'Which pressures determine expected safety behavior.',
  'governance.coordination':
    'Whether competing actors are expected to cooperate and why.',
  'agency.consent': 'Which AI-driven changes require meaningful human consent.',
  'action.tradeoff':
    'An accepted cost of the participant’s preferred response.',
  'grounding.claim':
    'How observed current capabilities support the forecast about future capabilities.',
  'scope.assumption':
    'A central dependency not already established as a mechanism, condition or crux. Do not repeat an already explained growth assumption.',
  'timeline.milestone':
    'An observable milestone for transformation, if the horizon is not already understood.',
  'mechanism.chain':
    'An acknowledged weak evidential link in a specific causal account.',
  'capability.2030': 'Expected concrete capabilities by 2030.',
  'policy.general': 'Preferred changes to development or deployment policy.',
  'uncertainty.general':
    'The central unresolved uncertainty, beyond already expressed unknowns.',
  'impact.over-time': 'How expected near-term and longer-term effects differ.',
  'impact.overall':
    'An adopted net-impact forecast, only if not already expressed or explicitly left unknown.'
}

export function questionObjective(id: string, fallback: string) {
  return Object.hasOwn(questionObjectives, id)
    ? questionObjectives[id as keyof typeof questionObjectives]
    : fallback
}
