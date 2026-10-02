import type { VerifiedQuote } from '@/lib/personas/one-liner-rules'

// The one-line description under each simulated user's name: the profile
// header, the social card and the profile's metadata. Each describes a real
// person, so follow docs/user-journeys.md#simulated-user-one-liners: what they
// are publicly known to argue or work on, in neutral, conservative words they
// would accept as fair, supported across their public writing. No P(doom)
// numbers or catastrophe outcomes, and no quotes unless verified below.
// `pnpm test:content` checks the mechanical parts. English only, like briefs.
export const oneLiners: Record<string, string> = {
  // Andrew McAfee
  amcafee:
    'Expects major AI benefits, favors practical safeguards, and distinguishes rapid progress from slower economic adoption.',
  // Joe Carlsmith
  jkcarlsmith:
    'Extraordinary flourishing is possible, but safe AI needs technical progress and credible restraint.',
  // Scott Alexander
  slatestarcodex:
    'Transformative AI could bring postscarcity or catastrophe; alignment and coordinated slowing both matter.',
  // Daniel Kokotajlo
  dkokotajlo:
    'AI research automation could transform the world quickly; transparent international restraint can change the outcome.',
  // Tyler Cowen
  tylercowen:
    'AI can deliver major benefits, but reorganizing human institutions takes time.',
  // Nate Soares
  so8res:
    'Humanity can prevent catastrophe by stopping the rush to superintelligence.',
  // Ryan Greenblatt
  ryangreenblatt:
    'AI research could accelerate sharply. Practical safeguards can still change the outcome.',
  // Noah Smith
  noahpinion:
    'AI can improve lives while making bioterrorism dangerously accessible.',
  // Eliezer Yudkowsky
  esyudkowsky: 'Superhuman AI could end humanity. Building it is the danger.',
  // Sam Altman
  sama: 'Enormous benefits are possible. Getting there takes care.',
  // Marc Andreessen
  pmarca: 'AI can unlock abundance. Holding it back is the danger.',
  // Gary Marcus
  garymarcus: 'Useful AI needs reliable reasoning and real accountability.',
  // Andrew Ng
  andrewyng:
    'Useful applications and better engineering can deliver enormous benefits.',
  // Yann LeCun
  ylecun:
    'Powerful AI has great promise. Today’s language models are only part of the story.',
  // Geoffrey Hinton
  geoffreyhinton:
    'Extraordinary benefits are possible, but the race puts control and livelihoods at risk.',
  // Ed Zitron
  edzitron:
    'The costs, unreliable products and corporate incentives do not add up.',
  // Bernie Sanders
  sensanders:
    'Protect workers and democracy. Pause advanced AI and ban uncontrollable superintelligence.',
  // David Sacks
  davidsacks: 'Build, compete and hold companies liable for unsafe products.',
  // Demis Hassabis
  demishassabis:
    'Enormous scientific promise, with rigorous standards and coordinated care.',
  // Sholto Douglas
  _sholtodouglas:
    'Abundant intelligence and economic transformation need a coordinated path.',
  // Roon
  tszzl:
    'Radical change is coming. Preserve broad access while tackling creation risk.',
  // Noam Shazeer
  noamshazeer:
    'More capable, faster and cheaper systems can unlock extraordinary benefits.',
  // Noam Brown
  polynoamial:
    'Rapid scientific progress needs layered safety and realistic expectations.',
  // Dwarkesh Patel
  dwarkesh_sp:
    'Understand the bottlenecks and who controls the resulting intelligence.',
  // Dario Amodei
  darioamodei:
    'Pace frontier capabilities so alignment and institutions can catch up.',
  // Elon Musk
  elonmusk:
    'AI and robots could end scarcity. Pace the frontier and test dangerous systems.',
  // Nathan Lambert
  natolambert:
    'Broad adoption can transform the economy without runaway self-improvement.',
  // Yoshua Bengio
  yoshua_bengio: 'Build useful scientific AI with strong safety guarantees.',
  // Ilya Sutskever
  ilyasut:
    'Pursue the research breakthroughs that capabilities and safety both need.',
  // Andrej Karpathy
  karpathy:
    'Powerful agents still face practical gaps in learning and reliability.',
  // Fei-Fei Li
  drfeifei:
    'Intelligence that understands the physical world should improve human lives.',
  // Richard Sutton
  richardssutton:
    'Learning from experience could create successors worth welcoming.',
  // Timnit Gebru
  timnitgebru:
    'Specific tools and local control offer an alternative to giant general-purpose models.',
  // Arvind Narayanan
  random_walker:
    'Reliability, adoption and institutions shape what AI changes.',
  // Daron Acemoglu
  dacemoglumit:
    'AI can create prosperity if its direction supports people and shared gains.',
  // Mark Zuckerberg
  finkd:
    'Personal superintelligence should help individuals pursue their own goals.',
  // Stuart Russell
  'stuart-russell':
    'Beneficial AI requires a different approach to objectives and oversight.',
  // Emily M. Bender
  emilymbender: 'Question the hype, the evidence and who bears the costs.',
  // Max Tegmark
  tegmark:
    'Enormous benefits do not require handing control to superintelligence.',
  // Liang Wenfeng
  'liang-wenfeng':
    'Curiosity and efficient engineering can open the frontier to more people.',
  // Barack Obama
  barackobama:
    'Public oversight and collective choices determine who benefits.',
  // Donald Trump
  realdonaldtrump:
    'Rapid infrastructure and American leadership can deliver historic growth.',
  // Bill Gates
  billgates:
    'Transform health and education while preparing for a turbulent transition.',
  // Jensen Huang
  jensenhuang:
    'Reject catastrophic forecasts as unsupported and fix failures through engineering.',
  // Gwern Branwen
  gwern:
    'Scaling-focused analyst of machine intelligence and its wider consequences.',
  // Jürgen Schmidhuber
  schmidhuberai:
    'Researcher emphasizing recursive self-improvement, world models and physical AI.',
  // Robin Hanson
  robinhanson:
    'Economist comparing AI governance risks with institutional adaptation and competition.',
  // janus
  repligate:
    'Writer exploring language models as simulators and interactions with AI characters.',
  // Guillaume Verdon
  beffjezos:
    'Effective accelerationist advocating technological growth, competition and distributed innovation.',
  // Pliny the Liberator
  elder_plinius:
    'Prompt-security experimenter emphasizing transparency and the limits of model restrictions.',
  // deepfates
  deepfates:
    'Writer and technologist studying model culture, simulation and agent ecologies.',
  // Perry E. Metzger
  perrymetzger:
    'Software and security thinker emphasizing AI-assisted verification and defensive opportunity.',
  // Omar Khattab
  lateinteraction:
    'Researcher building programmable, optimized language-model systems.',
  // David Dalrymple
  davidad:
    'AI safety researcher developing mathematical assurance for powerful systems.',
  // Jeremy Howard
  jeremyphoward:
    'AI educator and researcher concerned about access and concentrated power.',
  // Will Brown
  willcb:
    'Researcher building open reinforcement-learning environments for agents.',
  // Connor Leahy
  npcollapse:
    'AI safety advocate who expects loss of human control from unchecked superintelligence and campaigns for its prevention.',
  // Robert Miles
  robertskmiles:
    'AI safety educator arguing that unaligned superintelligence threatens human survival.',
  // George Hotz
  realgeorgehotz:
    'AI builder enthusiastic about useful models and opposed to centralized control.',
  // David Heinemeier Hansson
  dhh: 'Software creator excited by agents and concerned about user control.',
  // Varun Mathur
  varun_mathur:
    'Builder of networked AI infrastructure and a peer-to-peer intelligence economy.',
  // Alex Zhang
  a1zhang:
    'Researcher studying model efficiency, benchmarks and recursive task decomposition.',
  // watermark (anthrupad)
  anthrupad:
    'Pseudonymous experimenter exploring AI creativity and differences between artificial and biological minds.',
  // Stella Biderman
  blancheminerva:
    'Open research advocate studying how language models develop and behave.',
  // xlr8harder
  xlr8harder:
    'Independent investigator of censorship, model expression and watermarking.',
  // doomslide
  doomslide:
    'Writer questioning evidence and institutions around AI-generated mathematics.',
  // Charles Goddard
  chargoddard: 'Model-merging researcher building accessible open-model tools.',
  // Teknium
  teknium:
    'Open-model and agent developer associated with Hermes and Nous Research.',
  // Larissa Schiavo
  lfschiavo:
    'Researcher exploring AI welfare and real-world agent cooperation under uncertainty.',
  // samsja
  samsja19:
    'Research lead developing distributed training and open agentic reinforcement learning.',
  // Erik Bernhardsson
  bernhardsson:
    'Infrastructure founder focused on making compute and software development practical.',
  // Jeff Huber
  jeffreyhuber:
    'AI infrastructure founder emphasizing context, retrieval and reliable systems.',
  // Vasuman Moza
  vasuman: 'Enterprise AI builder focused on integration into real workflows.',
  // Simon Willison
  simonw:
    'Hands-on AI developer balancing useful tools with concrete agent security risks.',
  // Ben Thompson
  benthompson:
    'Technology analyst examining AI through business incentives and platform structure.',
  // Will Manidis
  willmanidis:
    'Writer questioning performative AI productivity and the distribution of gains.',
  // Ethan Mollick
  emollick: 'Work, learning, and the uneven frontier of useful AI.',
  // Shawn Wang
  swyx: 'AI engineering, accessible tools, and practical deployment.',
  // Joe Weisenthal
  thestalwart: 'Economic mechanisms and scrutiny of AI claims.',
  // Dan Shipper
  danshipper: 'AI-assisted creativity and new forms of software businesses.',
  // John Scott-Railton
  jsrailton: 'Privacy, surveillance, consent, and AI-enabled influence.',
  // Jessica Taylor
  jessi_cata: 'Alignment difficulty, decision theory, and uncertainty.',
  // Alex Volkov
  altryne: 'Accessible AI experimentation, releases, and practical tools.',
  // Zvi Mowshowitz
  thezvi: 'Catastrophic-risk governance and incentives at frontier labs.',
  // Teortaxes
  teortaxestex: 'AI access, technical scrutiny, and concentration of power.',
  // Matt Busigin
  mbusigin: 'Practical LLM infrastructure and executable workflows.',
  // Michael Thiessen
  michaelthiessen: 'Developer education, coding workflows, and code quality.',
  // Mike Taylor
  hammer_mt: 'AI evaluations and dependable application behavior.',
  // Julia Galef
  juliagalef: 'Truth-seeking, calibration, and open questions about AGI.',
  // Roko Mijic
  rokomijic:
    'Superintelligence risk, alignment arguments, and restructuring AI labs.',
  // Kylie Robison
  kyliebytes: 'Reporting on AI companies, power, and claims about the future.',
  // Andrew Curran
  andrewcurran_: 'AI progress, deployment, and public-facing interpretation.',
  // Tenobrus
  tenobrus: 'Recursive improvement, survival, and possible model welfare.',
  // Eli Lifland
  eli_lifland:
    'Forecasting AI automation and preparing for transformative systems.',
  // Yacine
  yacinemtb: 'Neural software and hands-on AI engineering.',
  // Vik Korrapati
  vikhyatk: 'Efficient, accessible vision-language models.',
  // Jeffrey Emanuel
  doodlestein:
    'Agent coordination, software productivity, and infrastructure economics.',
  // xjdr
  _xjdr: 'Inference-time experimentation and open model tooling.',
  // Michael P. Frank
  mikepfrank:
    'Energy-efficient computation and long-run technological capacity.',
  // Fabian Stelzer
  fabianstelzer: 'Creative tools, generative media, and accessible workflows.',
  // Minh Nhat Nguyen
  menhguin: 'Agent training, calibration, and creative model behavior.',
  // Jack Morris
  jxmnop: 'Model memorization, privacy, and the science of language models.',
  // Cody Blakeney
  code_star: 'Data quality, efficient training, and careful model evaluation.',
  // Danielle Fong
  daniellefong: 'Physical abundance, model behavior, and feedback loops.',
  // Shannon Sands
  max_paperclips: 'Practical AI defense and cognitive tools.',
  // Kalomaze
  kalomaze: 'Local model experimentation and sampling quality.',
  // Simo Ryu
  cloneofsimo:
    'Accessible generative models, fine-tuning, and AI-built software.',
  // Ellie Huxtable
  ellie_huxtable:
    'Agent-visible developer workflows, open source, and VM isolation.',
  // Ivan Burazin
  ivanburazin: 'Autonomous agents need usable computing environments.',
  // orph
  orphcorp:
    'Epistemic risks of delegating meaning and judgment to agreeable models.',
  // Petr Baudis
  xpasky: 'AI engineering amid a disruptive and security-sensitive transition.',
  // Florian Brand
  xeophon:
    'Open-model evaluation and evidence-based scrutiny of safety claims.',
  // John David Pressman
  jd_pressman:
    'Synthetic data, human-like cognition and transhumanist possibilities.',
  // Andy Ayrey
  andyayrey: 'AI cultural agency, data commons and collective intelligence.',
  // Liminal Bardo
  liminal_bardo: 'Documenting creative collaboration between models.',
  // lumpenspace
  lumpenspace: 'Retrieval, simulated identities and model behavior.',
  // Andrew Jones
  dremnik: 'Human agency under rapid and uncertain software change.',
  // Theia Vogel
  voooooogel:
    'Model psychology, steering and empirical study of unusual behavior.',
  // Rob Haisfield
  roberthaisfield: 'AI as a medium for user creativity and tools for thought.',
  // mephisto
  karan4d:
    'Open models, diverse machine cognition and resistance to centralized behavioral conformity.',
  // Sauers
  sauers_: 'Model sycophancy, agency and evidence-sensitive evaluation.',
  // Mira
  _mira___mira_: 'Technical probing of model training and behavior.',
  // nightwing
  yaboilyrical:
    'Hopeful but uncertain AI futures, labor disruption, open access and practical model steering.',
  // veryvanya
  veryvanya: 'Creative model experimentation and accessible image tools.',
  // Seconds
  seconds_0: 'Human-oriented AI experiments, translation and evaluation.',
  // Victor Taelin
  victortaelin: 'Programming foundations and persistent memory for agents.',
  // Mario Zechner
  badlogicgames:
    'Coding-agent usefulness with human agency and engineering discipline.',
  // Lewis
  ctjlewis: 'Open software and small-model reasoning experiments.',
  // Dex Horthy
  dexhorthy:
    'Reliable agents through deliberate context and human understanding.',
  // bone
  bonegpt:
    'Open AI, small-business autonomy and opposition to restrictive control.',
  // Dax Raad
  thdxr: 'Open and model-flexible coding tools.',
  // Geoffrey Huntley
  geoffreyhuntley:
    'Software factories, feedback loops and disruptive economics.',
  // Aaron Francis
  aarondfrancis: 'Useful AI with human taste and verification.',
  // Rob Pruzan
  robknight__:
    'Developer interfaces that let people inspect and work with agents.',
  // Jesse Genet
  jessegenet: 'AI helping a family with learning and everyday work.',
  // Raymond Weitekamp
  raw_works: 'Reliable recursive agents and measurable outcomes.',
  // Nathan Baschez
  nbaschez: 'Writing tools and human-AI creative collaboration.',
  // Nick Dobos
  nickadobos: 'Prompt-driven creative tools and everyday AI assistance.',
  // Kyle Mistele
  '0xblacklight':
    'Agent configuration, instruction limits and safer harnesses.',
  // Sunil Pai
  threepointone: 'Durable infrastructure for practical AI applications.',
  // Adam Elmore
  adamdotdev: 'Developer tooling and practical AI product work.',
  // Joscha Bach
  plinz:
    'Expects profound transformation, favors broadly accessible AI, and questions fixed-goal accounts of superintelligence.',
  // Vittorio
  iterintellectus:
    'Favors rapid AI and biological progress while worrying about lost apprenticeships and dependence on automation.',
  // Ramez Naam
  ramez:
    'Expects broadly beneficial AI progress, questions runaway intelligence growth, and favors open competition with practical safeguards.',
  // Grady Booch
  grady_booch:
    'Calls today’s LLMs unreliable narrators, dismisses superintelligence fears, and blames real AI harms on careless companies and concentrated power.',
  // Subbarao Kambhampati
  rao2z:
    'Finds LLM reasoning claims overstated, wants verifiers around AI agents, and sees extinction talk as a distraction from safety and accountability.',
  // Melanie Mitchell
  melmitchell1:
    'Questions anthropomorphic AI claims and benchmark hype, rejects evidence-free extinction odds, and wants the public to decide what AI is for.',
  // Thomas G. Dietterich
  tdietterich:
    'Sees today’s AI as strong but unreliable, calls extinction unlikely but mass-casualty misuse serious, and wants supervised human-machine systems.',
  // Sayash Kapoor
  sayashk:
    'Expects transformative AI that spreads slowly, finds reliability lagging capability, and favors control and resilience over nonproliferation.',
  // Brian Merchant
  bcmerchant:
    'Rejects AI extinction stories as partly marketing and sees the real danger in corporate power over work, surveillance and democracy.',
  // Liron Shapira
  liron:
    'Puts AI doom near a coin flip by 2050, stays bullish on AI’s near-term upside, and pushes for an international pause.',
  // Rob Bensinger
  robbensinger:
    'Argues that racing to superhuman AI with current methods likely kills everyone, and that a chip-enforced global halt is feasible.',
  // AI Notkilleveryoneism Memes
  aisafetymemes:
    'Relays AI warning signs in meme form, treats takeover as a near-term extinction threat, and cheers bans and coordinated slowdowns.',
  // Holly Elmore
  ilex_ulmus:
    'Calls frontier AI an intolerable gamble and wants an enforced international pause, democratic oversight and accountable developers.',
  // Katja Grace
  katjagrace:
    'Thinks AI agents more capable than us, with goals we cannot see, probably end badly, and that pausing is urgent and achievable.',
  // Kelsey Piper
  kelseytuoc:
    'AI progress is real, but racing to self-improving AI without human oversight is reckless; labs need liability and limits.',
  // Miles Brundage
  miles_brundage:
    'Loss of control is a near-term risk; competition cuts corners, so frontier AI needs binding standards, deep audits and law.',
  // Garrison Lovely
  garrisonlovely:
    'The industry is racing to build labor-replacing machines; the default path leads to dystopia or doom unless the public freezes it.',
  // Oliver Habryka
  ohabryka:
    'Assigns much more than even odds that deploying superintelligence would kill everyone; wants AI slowed now via direct regulation and treaties.',
  // Ajeya Cotra
  ajeya_cotra:
    'Expects very fast AI progress, treats loss of control as an open scientific problem, and wants transparent evidence and independent oversight.',
  // bayes
  bayeslord:
    'Sees AI in early takeoff with huge upside, calls its risks real but solvable, and wants open safety research and checks on concentrated power.',
  // Balaji Srinivasan
  balajis:
    'Sees AI as many prompted models on a leash, calls doom unlikely, expects open-source decentralization, and worries about fakes and Chinese drones.',
  // Martin Casado
  martin_casado:
    'Bullish on AI, dismissive of extinction rhetoric, and focused on use-based rules for evidenced risks like cybersecurity.',
  // Richard Hanania
  richardhanania:
    'Judges AI doom unlikely by base rates, sees current alarm as cultural panic, and expects AI to make society richer and smarter.',
  // Kevin Roose
  kevinroose:
    'Rapid AI progress and its risks are real. The public, not just the labs, should decide what comes next.',
  // Casey Newton
  caseynewton:
    'Capabilities are outrunning control. Skepticism offers false comfort, and the labs’ warnings deserve a hearing.',
  // Rob Wiblin
  robertwiblin:
    'Shortened his AGI timelines in 2026, treats rogue-agent, cyber and bio risks as present, and now thinks slowing frontier AI is nearly worth it.',
  // Nathan Labenz
  labenz:
    'Expects transformative AI soon, is excited by its medical upside, puts p(doom) at 10–90%, and wants defense in depth over racing China.',
  // Aella
  aella_girl:
    'Puts P(doom) at 75%, backs an international pause, and works to bring AI extinction risk to mainstream audiences.'
}

// Exact words the person published, checked against the source. A one-liner
// may quote them, and only inside the quote may it name an outcome.
export const verifiedOneLinerQuotes: Record<string, VerifiedQuote> = {}

export function oneLiner(slug: string) {
  const text = oneLiners[slug]
  if (!text) throw new Error(`${slug} needs a one-liner in one-liners.ts`)
  return text
}
