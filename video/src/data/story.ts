import { personas, type Persona } from './personas'

export const bySlug = (slug: string) => {
  const p = personas.find((p) => p.slug === slug)
  if (!p) throw new Error(`Unknown persona ${slug}`)
  return p as Persona
}

// Faces for "Some see doom / Some see bloom", taken from each end of the map.
export const doomSide = [
  'esyudkowsky',
  'geoffreyhinton',
  'dkokotajlo',
  'so8res',
  'yoshua_bengio',
  'ryangreenblatt'
]
export const bloomSide = [
  'pmarca',
  'jensenhuang',
  'sama',
  'ylecun',
  'finkd',
  'andrewyng'
]

// Generic, unattributed hot takes: the noise, not anyone's words.
export const takes: { text: string; tone: 'doom' | 'bloom' | 'meh' }[] = [
  { text: 'AGI is two years away', tone: 'bloom' },
  { text: 'It’s just autocomplete', tone: 'meh' },
  { text: 'We’re all going to die', tone: 'doom' },
  { text: 'Utopia is coming', tone: 'bloom' },
  { text: 'Pause it now', tone: 'doom' },
  { text: 'Accelerate', tone: 'bloom' },
  { text: 'It’s a bubble', tone: 'meh' },
  { text: 'Your job is next', tone: 'doom' },
  { text: 'Nothing ever happens', tone: 'meh' },
  { text: 'It will cure cancer', tone: 'bloom' },
  { text: 'p(doom) = 90%', tone: 'doom' },
  { text: 'Overhyped, again', tone: 'meh' },
  { text: 'Superintelligence by 2030', tone: 'bloom' },
  { text: 'Just regulate it', tone: 'doom' },
  { text: 'Open-source everything', tone: 'bloom' },
  { text: 'It can’t even count letters', tone: 'meh' },
  { text: 'The singularity is near', tone: 'bloom' },
  { text: 'Humans won’t be needed', tone: 'doom' },
  { text: 'Doomers are a cult', tone: 'bloom' },
  { text: 'Stochastic parrots', tone: 'meh' },
  { text: 'Abundance for all', tone: 'bloom' },
  { text: 'Lights out for all of us', tone: 'doom' },
  { text: 'It’s all vibes', tone: 'meh' },
  { text: 'Build the bunker', tone: 'doom' }
]

export const handles = [
  'midwit_max',
  'agi_tomorrow',
  'lossfunction',
  'touchgrass',
  'p_doom_daily',
  'acc_bro',
  'skeptic_sam',
  'the_real_ted',
  'gradient_gal',
  'hyperscaler',
  'normie_nick',
  'safetymaxxer',
  'vibecheck',
  'tokenomics',
  'neural_ned',
  'singularity_sue',
  'luddite_lou',
  'eval_enjoyer',
  'shoggoth_fan',
  'bayes_bae',
  'compute_cathy',
  'post_rat',
  'kardashev2',
  'humanist_hal'
]

// The "everything" AI will change.
export const everything = [
  'work',
  'science',
  'medicine',
  'art',
  'money',
  'war',
  'love',
  'power',
  'truth',
  'school',
  'music',
  'code',
  'jobs',
  'democracy',
  'energy',
  'news',
  'friendship',
  'privacy',
  'creativity',
  'cities',
  'law',
  'faith',
  'dating',
  'parenting',
  'movies',
  'research',
  'math',
  'climate',
  'the economy',
  'mental health',
  'childhood',
  'journalism',
  'language',
  'trust',
  'space',
  'cancer',
  'aging',
  'elections',
  'security',
  'search'
]

// Real prompts from the Doom or Bloom question bank (content/releases/0.4.0-draft).
export const rootQuestion = 'What do you think AI means for our future—and why?'
export const followUps = [
  'What discovery or event would most change your view of AI’s future impact?',
  'Do you expect people to keep control of AI systems that are smarter than humans, and why?',
  'What would a good future need to preserve about being human?'
]

// An illustrative participant answer, in the voice of the launch post.
export const sampleAnswer =
  'Honestly? I’m excited and a little worried. I use AI every day and the progress is wild. It’s already making people more productive, and it could speed up science and medicine. But things are moving faster than our institutions can adapt, and I’m not sure we’ll keep control of systems we don’t fully understand.'

// Where the example participant lands, and who is closest to them.
export const you = {
  x: 0.585,
  y: 0.765,
  rx: [0.47, 0.71] as const,
  ry: [0.62, 0.9] as const
}
export const closest = ['dwarkesh_sp', 'darioamodei', 'billgates']

// Faces the camera visits while "hovering" the map.
export const tour = ['esyudkowsky', 'darioamodei', 'sama', 'pmarca']

export const dimensions = [
  'Capabilities',
  'Speed',
  'Benefits',
  'Harms',
  'Control',
  'Institutions',
  'Agency',
  'Action'
]
