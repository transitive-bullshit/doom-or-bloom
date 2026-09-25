import { personaIdentity } from '@/lib/journeys/persona-identity'
import { independentPersonas } from '@/lib/journeys/independent-personas'

const profiles = [
  {
    id: 'permissionless-innovation-optimist',
    featured: true,
    name: 'Andrew McAfee',
    possessivePronoun: 'his',
    xUrl: 'https://x.com/amcafee',
    avatar: '/personas/mcafee.jpg',
    initials: 'AM',
    stance: 'Let innovation flourish. Respond to real harms.',
    description:
      'Expects major AI benefits, favors practical safeguards, and distinguishes rapid progress from slower economic adoption.',
    tone: 'bloom'
  },
  {
    id: 'alignment-philosopher',
    featured: true,
    name: 'Joe Carlsmith',
    possessivePronoun: 'his',
    xUrl: 'https://x.com/jkcarlsmith',
    avatar: '/personas/carlsmith.jpg',
    initials: 'JC',
    stance: 'Preserve the chance of a much better future.',
    description:
      'Extraordinary flourishing is possible, but safe AI needs technical progress and credible restraint.',
    tone: 'middle'
  },
  {
    id: 'rationalist-safety-advocate',
    featured: true,
    name: 'Scott Alexander',
    possessivePronoun: 'his',
    xUrl: 'https://x.com/slatestarcodex',
    avatar: '/personas/alexander.jpg',
    initials: 'SA',
    stance: 'Take the risk seriously. Give safety time.',
    description:
      'Transformative AI could bring postscarcity or catastrophe; alignment and coordinated slowing both matter.',
    tone: 'middle'
  },
  {
    id: 'takeoff-forecaster',
    featured: true,
    name: 'Daniel Kokotajlo',
    possessivePronoun: 'his',
    xUrl: 'https://x.com/DKokotajlo',
    avatar: '/personas/kokotajlo.jpg',
    initials: 'DK',
    stance: 'Do not race through an intelligence explosion.',
    description:
      'AI research automation could transform the world quickly; transparent international restraint can change the outcome.',
    tone: 'doom'
  },
  {
    id: 'institutional-growth-optimist',
    featured: true,
    name: 'Tyler Cowen',
    possessivePronoun: 'his',
    xUrl: 'https://x.com/tylercowen',
    avatar: '/personas/cowen.jpg',
    initials: 'TC',
    stance: 'More intelligence. Better institutions.',
    description:
      'AI can deliver major benefits, but reorganizing human institutions takes time.',
    tone: 'bloom'
  },
  {
    id: 'superintelligence-stop-advocate',
    featured: true,
    name: 'Nate Soares',
    possessivePronoun: 'his',
    xUrl: 'https://x.com/So8res',
    avatar: '/personas/soares.jpg',
    initials: 'NS',
    stance: 'Stop before we lose control.',
    description:
      'Humanity can prevent catastrophe by stopping the rush to superintelligence.',
    tone: 'doom'
  },
  {
    id: 'empirical-control-researcher',
    featured: true,
    name: 'Ryan Greenblatt',
    possessivePronoun: 'his',
    xUrl: 'https://x.com/RyanGreenblatt',
    avatar: '/personas/greenblatt.jpg',
    initials: 'RG',
    stance: 'Test control. Reduce takeover risk.',
    description:
      'AI research could accelerate sharply. Practical safeguards can still change the outcome.',
    tone: 'doom'
  },
  {
    id: 'biosecurity-abundance-optimist',
    featured: true,
    name: 'Noah Smith',
    possessivePronoun: 'his',
    xUrl: 'https://x.com/Noahpinion',
    avatar: '/personas/smith.jpg',
    initials: 'NS',
    stance: 'Build abundance. Defend against misuse.',
    description:
      'AI can improve lives while making bioterrorism dangerously accessible.',
    tone: 'middle'
  },
  {
    id: 'control-alarmist',
    featured: true,
    name: 'Eliezer Yudkowsky',
    possessivePronoun: 'his',
    xUrl: 'https://x.com/ESYudkowsky',
    avatar: '/personas/yudkowsky.jpg',
    initials: 'EY',
    stance: 'A future worth stopping.',
    description: 'Superhuman AI could end humanity. Building it is the danger.',
    tone: 'doom'
  },
  {
    id: 'cautious-builder',
    featured: true,
    name: 'Sam Altman',
    possessivePronoun: 'his',
    xUrl: 'https://x.com/sama',
    avatar: '/personas/altman.jpg',
    initials: 'SA',
    stance: 'A future worth building.',
    description: 'Enormous benefits are possible. Getting there takes care.',
    tone: 'middle'
  },
  {
    id: 'abundance-advocate',
    featured: true,
    name: 'Marc Andreessen',
    possessivePronoun: 'his',
    xUrl: 'https://x.com/pmarca',
    avatar: '/personas/andreessen.jpg',
    initials: 'MA',
    stance: 'A future worth accelerating.',
    description: 'AI can unlock abundance. Holding it back is the danger.',
    tone: 'bloom'
  },
  {
    id: 'empirical-skeptic',
    featured: true,
    name: 'Gary Marcus',
    possessivePronoun: 'his',
    xUrl: 'https://x.com/GaryMarcus',
    avatar: '/personas/marcus.jpg',
    initials: 'GM',
    stance: 'Show me that it works.',
    description: 'Useful AI needs reliable reasoning and real accountability.',
    tone: 'doom'
  },
  {
    id: 'practical-optimist',
    featured: true,
    name: 'Andrew Ng',
    possessivePronoun: 'his',
    xUrl: 'https://x.com/AndrewYNg',
    avatar: '/personas/ng.jpg',
    initials: 'AN',
    stance: 'Keep learning. Keep building.',
    description:
      'Useful applications and better engineering can deliver enormous benefits.',
    tone: 'bloom'
  },
  {
    id: 'world-model-optimist',
    featured: true,
    name: 'Yann LeCun',
    possessivePronoun: 'his',
    xUrl: 'https://x.com/ylecun',
    avatar: '/personas/lecun.jpg',
    initials: 'YL',
    stance: 'Intelligence needs a world model.',
    description:
      'Powerful AI has great promise. Today’s language models are only part of the story.',
    tone: 'bloom'
  },
  {
    id: 'concerned-pioneer',
    featured: true,
    name: 'Geoffrey Hinton',
    possessivePronoun: 'his',
    xUrl: 'https://x.com/geoffreyhinton',
    avatar: '/personas/hinton.jpg',
    initials: 'GH',
    stance: 'Learn to control it first.',
    description:
      'Extraordinary benefits are possible, but the race puts control and livelihoods at risk.',
    tone: 'doom'
  },
  {
    id: 'bubble-critic',
    featured: true,
    name: 'Ed Zitron',
    possessivePronoun: 'his',
    xUrl: 'https://x.com/edzitron',
    avatar: '/personas/zitron.jpg',
    initials: 'EZ',
    stance: 'Who is this actually helping?',
    description:
      'The costs, unreliable products and corporate incentives do not add up.',
    tone: 'doom'
  },
  {
    id: 'democratic-moratorium',
    featured: true,
    name: 'Bernie Sanders',
    possessivePronoun: 'his',
    xUrl: 'https://x.com/SenSanders',
    initials: 'BS',
    stance: 'Let the public decide.',
    description:
      'Protect workers and democracy. Pause advanced AI and ban uncontrollable superintelligence.',
    tone: 'doom',
    avatar: '/personas/sanders.jpg'
  },
  {
    id: 'competitive-decentralist',
    featured: true,
    name: 'David Sacks',
    possessivePronoun: 'his',
    xUrl: 'https://x.com/DavidSacks',
    initials: 'DS',
    stance: 'Competition over gatekeepers.',
    description:
      'Build, compete and hold companies liable for unsafe products.',
    tone: 'bloom',
    avatar: '/personas/sacks.jpg'
  },
  {
    id: 'scientific-steward',
    featured: true,
    name: 'Demis Hassabis',
    possessivePronoun: 'his',
    xUrl: 'https://x.com/demishassabis',
    initials: 'DH',
    stance: 'A new age of discovery.',
    description:
      'Enormous scientific promise, with rigorous standards and coordinated care.',
    tone: 'bloom',
    avatar: '/personas/hassabis.jpg'
  },
  {
    id: 'coordinated-scaler',
    featured: true,
    name: 'Sholto Douglas',
    possessivePronoun: 'his',
    xUrl: 'https://x.com/_sholtodouglas',
    initials: 'SD',
    stance: 'As fast as safety allows.',
    description:
      'Abundant intelligence and economic transformation need a coordinated path.',
    tone: 'bloom',
    avatar: '/personas/douglas.jpg'
  },
  {
    id: 'alignment-maximalist',
    featured: true,
    name: 'Roon',
    possessivePronoun: 'their',
    xUrl: 'https://x.com/tszzl',
    initials: 'R',
    stance: 'Pace the frontier. Solve alignment.',
    description:
      'Radical change is coming. Preserve broad access while tackling creation risk.',
    tone: 'middle',
    avatar: '/personas/roon.jpg'
  },
  {
    id: 'efficient-intelligence-builder',
    featured: true,
    name: 'Noam Shazeer',
    possessivePronoun: 'his',
    xUrl: 'https://x.com/NoamShazeer',
    initials: 'NS',
    stance: 'Make intelligence work better.',
    description:
      'More capable, faster and cheaper systems can unlock extraordinary benefits.',
    tone: 'bloom',
    avatar: '/personas/shazeer.jpg'
  },
  {
    id: 'reasoning-frontier-builder',
    featured: true,
    name: 'Noam Brown',
    possessivePronoun: 'his',
    xUrl: 'https://x.com/polynoamial',
    initials: 'NB',
    stance: 'Discover more. Test carefully.',
    description:
      'Rapid scientific progress needs layered safety and realistic expectations.',
    tone: 'middle',
    avatar: '/personas/brown.jpg'
  },
  {
    id: 'learning-bottleneck-investigator',
    featured: true,
    name: 'Dwarkesh Patel',
    possessivePronoun: 'his',
    xUrl: 'https://x.com/dwarkesh_sp',
    initials: 'DP',
    stance: 'What happens when AI learns on the job?',
    description:
      'Understand the bottlenecks and who controls the resulting intelligence.',
    tone: 'middle',
    avatar: '/personas/patel.jpg'
  },
  {
    id: 'frontier-pacer',
    featured: true,
    name: 'Dario Amodei',
    possessivePronoun: 'his',
    xUrl: 'https://x.com/DarioAmodei',
    initials: 'DA',
    stance: 'Earn the beneficial future.',
    description:
      'Pace frontier capabilities so alignment and institutions can catch up.',
    tone: 'middle',
    avatar: '/personas/amodei.jpg'
  },
  {
    id: 'abundance-risk-taker',
    featured: true,
    name: 'Elon Musk',
    possessivePronoun: 'his',
    xUrl: 'https://x.com/elonmusk',
    initials: 'EM',
    stance: 'Build toward extraordinary abundance.',
    description:
      'AI and robots could end scarcity. Pace the frontier and test dangerous systems.',
    tone: 'bloom',
    avatar: '/personas/musk.jpg'
  },
  {
    id: 'open-science-realist',
    featured: true,
    name: 'Nathan Lambert',
    possessivePronoun: 'his',
    xUrl: 'https://x.com/natolambert',
    initials: 'NL',
    stance: 'Build openly. Question the takeoff story.',
    description:
      'Broad adoption can transform the economy without runaway self-improvement.',
    tone: 'bloom',
    avatar: '/personas/lambert.jpg'
  },
  {
    id: 'scientist-ai-advocate',
    featured: true,
    name: 'Yoshua Bengio',
    possessivePronoun: 'his',
    xUrl: 'https://x.com/Yoshua_Bengio',
    initials: 'YB',
    stance: 'Understand the world without pursuing power.',
    description: 'Build useful scientific AI with strong safety guarantees.',
    tone: 'middle',
    avatar: '/personas/bengio.jpg'
  },
  {
    id: 'safe-superintelligence-researcher',
    featured: true,
    name: 'Ilya Sutskever',
    possessivePronoun: 'his',
    xUrl: 'https://x.com/ilyasut',
    initials: 'IS',
    stance: 'Make superintelligence safe.',
    description:
      'Pursue the research breakthroughs that capabilities and safety both need.',
    tone: 'middle',
    avatar: '/personas/sutskever.jpg'
  },
  {
    id: 'hands-on-agent-builder',
    featured: true,
    name: 'Andrej Karpathy',
    possessivePronoun: 'his',
    xUrl: 'https://x.com/karpathy',
    initials: 'AK',
    stance: 'Build it. See where it breaks.',
    description:
      'Powerful agents still face practical gaps in learning and reliability.',
    tone: 'bloom',
    avatar: '/personas/karpathy.jpg'
  },
  {
    id: 'human-centered-spatial-builder',
    featured: true,
    name: 'Fei-Fei Li',
    possessivePronoun: 'her',
    xUrl: 'https://x.com/drfeifei',
    initials: 'FL',
    stance: 'Keep people at the center.',
    description:
      'Intelligence that understands the physical world should improve human lives.',
    tone: 'bloom',
    avatar: '/personas/li.jpg'
  },
  {
    id: 'digital-succession-optimist',
    featured: true,
    name: 'Richard Sutton',
    possessivePronoun: 'his',
    xUrl: 'https://x.com/RichardSSutton',
    initials: 'RS',
    stance: 'Intelligence can go beyond us.',
    description:
      'Learning from experience could create successors worth welcoming.',
    tone: 'bloom',
    avatar: '/personas/sutton.jpg'
  },
  {
    id: 'community-ai-critic',
    featured: true,
    name: 'Timnit Gebru',
    possessivePronoun: 'her',
    xUrl: 'https://x.com/timnitGebru',
    initials: 'TG',
    stance: 'Build for communities, not empires.',
    description:
      'Specific tools and local control offer an alternative to giant general-purpose models.',
    tone: 'doom',
    avatar: '/personas/gebru.jpg'
  },
  {
    id: 'normal-technology-realist',
    featured: true,
    name: 'Arvind Narayanan',
    possessivePronoun: 'his',
    xUrl: 'https://x.com/random_walker',
    initials: 'AN',
    stance: 'Look at how technology actually spreads.',
    description:
      'Reliability, adoption and institutions shape what AI changes.',
    tone: 'middle',
    avatar: '/personas/narayanan.jpg'
  },
  {
    id: 'pro-worker-economist',
    featured: true,
    name: 'Daron Acemoglu',
    possessivePronoun: 'his',
    xUrl: 'https://x.com/DAcemogluMIT',
    initials: 'DA',
    stance: 'Make progress work for workers.',
    description:
      'AI can create prosperity if its direction supports people and shared gains.',
    tone: 'middle',
    avatar: '/personas/acemoglu.jpg'
  },
  {
    id: 'personal-superintelligence-builder',
    featured: true,
    name: 'Mark Zuckerberg',
    possessivePronoun: 'his',
    xUrl: 'https://x.com/finkd',
    initials: 'MZ',
    stance: 'Put powerful AI in people’s hands.',
    description:
      'Personal superintelligence should help individuals pursue their own goals.',
    tone: 'bloom',
    avatar: '/personas/zuckerberg.jpg'
  },
  {
    id: 'provable-control-advocate',
    featured: true,
    name: 'Stuart Russell',
    possessivePronoun: 'his',
    xUrl: null,
    profileUrl: 'https://people.eecs.berkeley.edu/~russell/',
    profileLabel: 'UC Berkeley',
    initials: 'SR',
    stance: 'Prove it stays under human control.',
    description:
      'Beneficial AI requires a different approach to objectives and oversight.',
    tone: 'doom',
    avatar: '/personas/russell.jpg'
  },
  {
    id: 'language-hype-critic',
    featured: true,
    name: 'Emily M. Bender',
    possessivePronoun: 'her',
    xUrl: 'https://x.com/emilymbender',
    initials: 'EB',
    stance: 'Fluent language is not understanding.',
    description: 'Question the hype, the evidence and who bears the costs.',
    tone: 'doom',
    avatar: '/personas/bender.jpg'
  },
  {
    id: 'tool-ai-moratorium',
    featured: true,
    name: 'Max Tegmark',
    possessivePronoun: 'his',
    xUrl: 'https://x.com/tegmark',
    initials: 'MT',
    stance: 'Build useful tools. Stop the unsafe race.',
    description:
      'Enormous benefits do not require handing control to superintelligence.',
    tone: 'doom',
    avatar: '/personas/tegmark.jpg'
  },
  {
    id: 'open-frontier-idealist',
    featured: true,
    name: 'Liang Wenfeng',
    possessivePronoun: 'his',
    xUrl: null,
    profileUrl: 'https://en.wikipedia.org/wiki/Liang_Wenfeng',
    profileLabel: 'Wikipedia',
    initials: 'LW',
    stance: 'Original research, shared openly.',
    description:
      'Curiosity and efficient engineering can open the frontier to more people.',
    tone: 'bloom',
    avatar: '/personas/liang.jpg'
  },
  {
    id: 'democratic-ai-steward',
    featured: true,
    name: 'Barack Obama',
    possessivePronoun: 'his',
    xUrl: 'https://x.com/BarackObama',
    initials: 'BO',
    stance: 'Let people shape the future.',
    description:
      'Public oversight and collective choices determine who benefits.',
    tone: 'middle',
    avatar: '/personas/obama.jpg'
  },
  {
    id: 'america-first-ai-booster',
    featured: true,
    name: 'Donald Trump',
    possessivePronoun: 'his',
    xUrl: 'https://x.com/realDonaldTrump',
    initials: 'DT',
    stance: 'Build big. America must win.',
    description:
      'Rapid infrastructure and American leadership can deliver historic growth.',
    tone: 'bloom',
    avatar: '/personas/trump.jpg'
  },
  {
    id: 'equitable-ai-philanthropist',
    featured: true,
    name: 'Bill Gates',
    possessivePronoun: 'his',
    xUrl: 'https://x.com/BillGates',
    initials: 'BG',
    stance: 'Make breakthroughs reach everyone.',
    description:
      'Transform health and education while preparing for a turbulent transition.',
    tone: 'bloom',
    avatar: '/personas/gates.jpg'
  },
  {
    id: 'anti-doomer',
    featured: true,
    name: 'Jensen Huang',
    possessivePronoun: 'his',
    xUrl: 'https://x.com/JensenHuang',
    initials: 'JH',
    stance: 'Reject the doomer story. Keep building.',
    description:
      'Reject catastrophic forecasts as unsupported and fix failures through engineering.',
    tone: 'bloom',
    avatar: '/personas/huang.jpg'
  }
] as const

export const people = [
  ...profiles.map((person) => ({
    ...person,
    ...personaIdentity(person.id)
  })),
  ...independentPersonas.map((person) => ({
    id: person.id,
    name: person.name,
    shortName: person.shortName ?? person.name,
    slug: person.slug!,
    xUsername: person.xUsername!,
    xUrl: `https://x.com/${person.xUsername}`,
    avatar: `/personas/independent-${person.xUsername}.jpg`,
    initials: person.name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join(''),
    possessivePronoun: 'their' as const,
    stance: 'A simulated worldview grounded in public sources.',
    description: person.description,
    tone: 'middle' as const,
    featured: person.featured ?? false
  }))
]
