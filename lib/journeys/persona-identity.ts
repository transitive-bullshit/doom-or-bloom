export const publicPersonaIdentities: Record<
  string,
  { slug: string; xUsername: string | null }
> = {
  'alignment-philosopher': { slug: 'jkcarlsmith', xUsername: 'jkcarlsmith' },
  'rationalist-safety-advocate': {
    slug: 'slatestarcodex',
    xUsername: 'slatestarcodex'
  },
  'takeoff-forecaster': { slug: 'dkokotajlo', xUsername: 'dkokotajlo' },
  'institutional-growth-optimist': {
    slug: 'tylercowen',
    xUsername: 'tylercowen'
  },
  'superintelligence-stop-advocate': { slug: 'so8res', xUsername: 'so8res' },
  'empirical-control-researcher': {
    slug: 'ryangreenblatt',
    xUsername: 'ryangreenblatt'
  },
  'biosecurity-abundance-optimist': {
    slug: 'noahpinion',
    xUsername: 'noahpinion'
  },
  'control-alarmist': { slug: 'esyudkowsky', xUsername: 'esyudkowsky' },
  'cautious-builder': { slug: 'sama', xUsername: 'sama' },
  'abundance-advocate': { slug: 'pmarca', xUsername: 'pmarca' },
  'empirical-skeptic': { slug: 'garymarcus', xUsername: 'garymarcus' },
  'practical-optimist': { slug: 'andrewyng', xUsername: 'andrewyng' },
  'world-model-optimist': { slug: 'ylecun', xUsername: 'ylecun' },
  'concerned-pioneer': { slug: 'geoffreyhinton', xUsername: 'geoffreyhinton' },
  'bubble-critic': { slug: 'edzitron', xUsername: 'edzitron' },
  'democratic-moratorium': { slug: 'sensanders', xUsername: 'sensanders' },
  'competitive-decentralist': { slug: 'davidsacks', xUsername: 'davidsacks' },
  'scientific-steward': { slug: 'demishassabis', xUsername: 'demishassabis' },
  'coordinated-scaler': { slug: '_sholtodouglas', xUsername: '_sholtodouglas' },
  'alignment-maximalist': { slug: 'tszzl', xUsername: 'tszzl' },
  'efficient-intelligence-builder': {
    slug: 'noamshazeer',
    xUsername: 'noamshazeer'
  },
  'reasoning-frontier-builder': {
    slug: 'polynoamial',
    xUsername: 'polynoamial'
  },
  'learning-bottleneck-investigator': {
    slug: 'dwarkesh_sp',
    xUsername: 'dwarkesh_sp'
  },
  'frontier-pacer': { slug: 'darioamodei', xUsername: 'darioamodei' },
  'abundance-risk-taker': { slug: 'elonmusk', xUsername: 'elonmusk' },
  'open-science-realist': { slug: 'natolambert', xUsername: 'natolambert' },
  'scientist-ai-advocate': {
    slug: 'yoshua_bengio',
    xUsername: 'yoshua_bengio'
  },
  'safe-superintelligence-researcher': {
    slug: 'ilyasut',
    xUsername: 'ilyasut'
  },
  'hands-on-agent-builder': { slug: 'karpathy', xUsername: 'karpathy' },
  'human-centered-spatial-builder': { slug: 'drfeifei', xUsername: 'drfeifei' },
  'digital-succession-optimist': {
    slug: 'richardssutton',
    xUsername: 'richardssutton'
  },
  'community-ai-critic': { slug: 'timnitgebru', xUsername: 'timnitgebru' },
  'normal-technology-realist': {
    slug: 'random_walker',
    xUsername: 'random_walker'
  },
  'pro-worker-economist': { slug: 'dacemoglumit', xUsername: 'dacemoglumit' },
  'personal-superintelligence-builder': { slug: 'finkd', xUsername: 'finkd' },
  'provable-control-advocate': { slug: 'stuart-russell', xUsername: null },
  'language-hype-critic': { slug: 'emilymbender', xUsername: 'emilymbender' },
  'tool-ai-moratorium': { slug: 'tegmark', xUsername: 'tegmark' },
  'open-frontier-idealist': { slug: 'liang-wenfeng', xUsername: null },
  'democratic-ai-steward': { slug: 'barackobama', xUsername: 'barackobama' },
  'america-first-ai-booster': {
    slug: 'realdonaldtrump',
    xUsername: 'realdonaldtrump'
  },
  'equitable-ai-philanthropist': { slug: 'billgates', xUsername: 'billgates' },
  'anti-doomer': { slug: 'jensen-huang', xUsername: null }
}

export function personaIdentity(id: string) {
  return publicPersonaIdentities[id] ?? { slug: id, xUsername: null }
}
