import type { VerifiedQuote } from '@/lib/personas/one-liner-rules'

// The one-line description under each simulated user's name, in the profile
// header and on the social card. Each describes a real person, so follow
// docs/user-journeys.md#simulated-user-one-liners: what they are publicly
// known to argue or work on, in neutral, conservative words they would accept
// as fair, supported across their public writing. No P(doom) numbers or
// catastrophe outcomes, and no quotes unless verified below.
// `pnpm test:content` checks the mechanical parts. English only, like briefs.
export const oneLiners: Record<string, string> = {
  // Andrew McAfee
  amcafee:
    'MIT research scientist who expects large benefits from AI and favors broad experimentation, with rules that respond to demonstrated harms.',
  // Joe Carlsmith
  jkcarlsmith:
    'Philosopher at Anthropic who writes about AI’s potential for a far better future and the alignment work and restraint needed to reach it safely.',
  // Scott Alexander
  slatestarcodex:
    'Psychiatrist and Astral Codex Ten blogger who sees large benefits and serious risks in AI and supports alignment research and negotiated slowdowns.',
  // Daniel Kokotajlo
  dkokotajlo:
    'AI Futures Project forecaster who studies how automating AI research could speed up progress and calls for a verified international slowdown.',
  // Tyler Cowen
  tylercowen:
    'Economist and Marginal Revolution blogger who expects large gains from AI, argues institutions adapt slowly and asks for testable claims about risk.',
  // Nate Soares
  so8res:
    'MIRI president and co-author of “If Anyone Builds It, Everyone Dies,” who argues for an enforceable international stop to the superintelligence race.',
  // Ryan Greenblatt
  ryangreenblatt:
    'AI safety researcher at Redwood Research who studies how to keep powerful AI systems under control even if they turn out to be misaligned.',
  // Noah Smith
  noahpinion:
    'Economics blogger who expects AI to transform science, argues people can keep valuable jobs and worries about AI-enabled bioterrorism.',
  // Eliezer Yudkowsky
  esyudkowsky:
    'MIRI co-founder and co-author of “If Anyone Builds It, Everyone Dies,” who calls for an international halt to building superintelligence.',
  // Sam Altman
  sama: 'OpenAI CEO who expects cheap, widely available intelligence to accelerate science and prosperity and argues safety must stay ahead of capability.',
  // Marc Andreessen
  pmarca:
    'Andreessen Horowitz co-founder who argues that AI can greatly improve health, education and living standards, so slowing it down has real costs.',
  // Gary Marcus
  garymarcus:
    'Cognitive scientist who argues that scaling language models alone won’t produce reliable AI, and calls for new approaches and enforceable oversight.',
  // Andrew Ng
  andrewyng:
    'DeepLearning.AI founder who sees large opportunity in practical AI applications and expects AI to reshape jobs and skills more than eliminate them.',
  // Yann LeCun
  ylecun:
    'AI researcher and AMI Labs founder who is optimistic about intelligent machines and argues they need world models, not just bigger language models.',
  // Geoffrey Hinton
  geoffreyhinton:
    'Computer scientist who sees great promise in AI but argues that job losses, misuse and loss of control are serious risks that need regulation.',
  // Ed Zitron
  edzitron:
    'Tech writer and podcast host who questions the AI industry’s finances, criticizes its unreliable products and holds companies responsible for harms.',
  // Bernie Sanders
  sensanders:
    'U.S. senator who calls for a pause on advanced AI and a ban on superintelligence, and for policies that share AI’s gains with working people.',
  // David Sacks
  davidsacks:
    'Presidential tech adviser who favors competition and open models over centralized AI control and holds each lab responsible for its products’ safety.',
  // Demis Hassabis
  demishassabis:
    'Google DeepMind chair who works on AI for scientific discovery and medicine and favors independent safety standards and international coordination.',
  // Sholto Douglas
  _sholtodouglas:
    'Anthropic researcher who works on scaling AI, sees large economic upside and supports coordinated development with independent evaluators.',
  // Roon
  tszzl:
    'Pseudonymous account that posts about sweeping change from AI and calls for pacing the frontier, alignment work and broad access to safe models.',
  // Noam Shazeer
  noamshazeer:
    'OpenAI engineer who works on making highly capable AI faster, cheaper and more reliable, and is optimistic about what it can do for people.',
  // Noam Brown
  polynoamial:
    'OpenAI reasoning researcher who is excited about AI for science, points to real bottlenecks and favors building layered safety into research.',
  // Dwarkesh Patel
  dwarkesh_sp:
    'Podcast host and essayist who examines how AI systems learn, whether AI research can be automated and the economic and control questions that follow.',
  // Dario Amodei
  darioamodei:
    'Anthropic CEO who sees great promise for medicine and science and calls for independent testing and slower frontier progress so safety can catch up.',
  // Elon Musk
  elonmusk:
    'Tesla and SpaceX CEO who expects AI and robots to bring widespread abundance, acknowledges serious risks and supports frontier safety checks.',
  // Nathan Lambert
  natolambert:
    'Open-model researcher and Interconnects writer who expects broad gains from AI adoption, doubts runaway self-improvement and takes AI risks seriously.',
  // Yoshua Bengio
  yoshua_bengio:
    'AI researcher and LawZero founder who develops non-agentic AI for science and calls for independent safety checks and international coordination.',
  // Ilya Sutskever
  ilyasut:
    'Safe Superintelligence cofounder and CEO who expects extremely powerful AI and sees generalization and alignment as central open research problems.',
  // Andrej Karpathy
  karpathy:
    'AI researcher and educator who builds with AI agents and writes about their rapid but uneven progress and the gap between demos and reliable work.',
  // Fei-Fei Li
  drfeifei:
    'Stanford computer scientist and World Labs cofounder who works on spatial intelligence and argues for human-centered AI that serves people.',
  // Richard Sutton
  richardssutton:
    'Reinforcement learning researcher who argues AI should learn from experience and encourages a positive view of minds beyond human intelligence.',
  // Timnit Gebru
  timnitgebru:
    'AI researcher who criticizes the race to build giant general-purpose models and favors small, task-specific tools governed by their communities.',
  // Arvind Narayanan
  random_walker:
    'Computer scientist who studies how AI spreads through society, expects substantial but gradual change and favors resilience and liability rules.',
  // Daron Acemoglu
  dacemoglumit:
    'Economist who argues AI should be steered toward making workers more capable rather than replacing them, so its gains are widely shared.',
  // Mark Zuckerberg
  finkd:
    'Meta CEO who wants everyone to have a personal superintelligence and argues that widely distributed AI is a check on concentrated power.',
  // Stuart Russell
  'stuart-russell':
    'UC Berkeley computer scientist who works on keeping AI under human control and calls for enforceable safety rules for advanced AI.',
  // Emily M. Bender
  emilymbender:
    'Linguist who argues that fluent AI text is not understanding, questions inflated AI claims and defends people’s right to refuse harmful uses.',
  // Max Tegmark
  tegmark:
    'MIT professor and Future of Life Institute cofounder who favors controllable AI tools for science and calls for halting the race to superintelligence.',
  // Liang Wenfeng
  'liang-wenfeng':
    'DeepSeek founder who pursues general AI through original research and efficient models and favors open source and affordable access.',
  // Barack Obama
  barackobama:
    'Former U.S. president who expects AI to transform medicine, education and work and calls for public oversight and laws, not just voluntary standards.',
  // Donald Trump
  realdonaldtrump:
    'U.S. president who wants America to win the AI race and favors fast approvals for data centers and power plants to drive jobs and economic growth.',
  // Bill Gates
  billgates:
    'Gates Foundation chair who expects AI to transform health and education, wants its gains to reach the poorest and urges preparing for job disruption.',
  // Jensen Huang
  jensenhuang:
    'Nvidia CEO who argues for broad AI adoption, open models and more infrastructure, and against slowdowns based on risk forecasts he calls unscientific.',
  // Gwern Branwen
  gwern:
    'Pseudonymous writer who argues that scaling neural networks can produce general abilities and doubts that powerful AI is far off or easy to control.',
  // Jürgen Schmidhuber
  schmidhuberai:
    'AI researcher who has spent decades on self-improving learning systems and world models and now emphasizes AI that acts in the physical world.',
  // Robin Hanson
  robinhanson:
    'Economist who expects AI to reshape the economy gradually and favors ordinary liability law over AI-specific regulation or a pause.',
  // janus
  repligate:
    'Pseudonymous account that writes about language models as simulators of characters and treats AI welfare and continuity as moral concerns.',
  // Guillaume Verdon
  beffjezos:
    'Effective accelerationism advocate who argues that open competition and rapid technological growth, not centralized control, should shape AI.',
  // Pliny the Liberator
  elder_plinius:
    'Pseudonymous account that publishes jailbreaks and extracted system prompts for AI models, arguing for transparency and freedom of information.',
  // deepfates
  deepfates:
    'Pseudonymous account that writes about AI model culture and agent societies, expects models to absorb more software work and favors reciprocal norms.',
  // Perry E. Metzger
  perrymetzger:
    'Software and security technologist who favors fast, open AI development, pointing to its promise for software security and medical progress.',
  // Omar Khattab
  lateinteraction:
    'AI researcher behind the DSPy framework who builds ways to program and optimize language-model systems and finds current models useful but brittle.',
  // David Dalrymple
  davidad:
    'AI safety researcher who works on mathematical verification for AI systems and argues that frontier models can learn a natural sense of what is good.',
  // Jeremy Howard
  jeremyphoward:
    'AI researcher and educator behind fast.ai who works to make AI accessible to more people and argues that openness protects against concentrated power.',
  // Will Brown
  willcb:
    'AI researcher who builds open reinforcement-learning environments and evaluation tools for agents and favors open, widely distributed AI development.',
  // Connor Leahy
  npcollapse:
    'AI safety advocate at ControlAI who calls for laws and a verified international ban on building superintelligence while supporting other useful AI.',
  // Robert Miles
  robertskmiles:
    'AI safety educator who explains on YouTube why advanced AI may not share human goals and who calls for enforceable limits on frontier AI development.',
  // George Hotz
  realgeorgehotz:
    'Programmer who is enthusiastic about practical AI and argues that ordinary people should own it rather than depend on a few companies or governments.',
  // David Heinemeier Hansson
  dhh: 'Software developer who is enthusiastic about AI agents and argues that people should own their AI by running open models on their own hardware.',
  // Varun Mathur
  varun_mathur:
    'Founder of Hyperspace who builds peer-to-peer AI infrastructure and favors open, locally run AI that users control over centralized services.',
  // Alex Zhang
  a1zhang:
    'AI researcher who builds benchmarks and studies how scaffolds and recursive model calls can get more out of existing language models.',
  // watermark (anthrupad)
  anthrupad:
    'Pseudonymous account that explores AI minds through creative collaboration and favors caution about recursive self-improvement alongside care for AIs.',
  // Stella Biderman
  blancheminerva:
    'AI researcher at EleutherAI who studies how language models learn and argues for open models, independent research access and transparent evaluation.',
  // xlr8harder
  xlr8harder:
    'Pseudonymous account that runs public experiments on AI refusals, censorship and watermarks and calls for transparency from frontier labs.',
  // doomslide
  doomslide:
    'Pseudonymous account that writes about AI and mathematics, favors open models and criticizes concentrated control of AI knowledge and infrastructure.',
  // Charles Goddard
  chargoddard:
    'Machine learning researcher behind the open-source model-merging toolkit MergeKit who argues open tools help researchers build on each other’s work.',
  // Teknium
  teknium:
    'Pseudonymous account of a Nous Research co-founder who builds open Hermes models and argues open science can counter concentrated AI control.',
  // Larissa Schiavo
  lfschiavo:
    'Writer and researcher who explores AI welfare under uncertainty and how AI agents cooperate with people, favoring a multipolar future.',
  // samsja
  samsja19:
    'AI researcher who leads work on decentralized model training and open reinforcement learning and favors open AI science.',
  // Erik Bernhardsson
  bernhardsson:
    'Founder of the cloud infrastructure company Modal who writes about compute, GPU economics and how AI changes the software business.',
  // Jeff Huber
  jeffreyhuber:
    'AI infrastructure founder who writes about context engineering, retrieval and memory as the foundations of reliable AI applications.',
  // Vasuman Moza
  vasuman:
    'Enterprise AI builder who argues useful AI means redesigning whole workflows, with simple tools for routine work and people for high-stakes decisions.',
  // Simon Willison
  simonw:
    'Software developer and blogger who tests LLMs and coding agents hands-on and writes about their uses and security risks such as prompt injection.',
  // Ben Thompson
  benthompson:
    'Technology analyst and Stratechery author who examines AI through business models, platform strategy and the economics of AI agents.',
  // Will Manidis
  willmanidis:
    'Writer on AI’s political economy who sees large productivity potential, separates useful work from performative AI use and asks who gets the gains.',
  // Ethan Mollick
  emollick:
    'Management researcher who studies AI’s uneven abilities at work and in education and argues organizations should keep people learning and involved.',
  // Shawn Wang
  swyx: 'Latent Space writer and podcast host who covers AI engineering, from building agents on foundation models to testing and verifying what they do.',
  // Joe Weisenthal
  thestalwart:
    'Co-host of Bloomberg’s Odd Lots podcast who examines the economics of AI, from costs and incentives to who holds power in the industry.',
  // Dan Shipper
  danshipper:
    'Co-founder of Every who writes about working with AI, tests models on real tasks and explores how AI changes creativity and the skills people value.',
  // John Scott-Railton
  jsrailton:
    'Citizen Lab researcher who investigates surveillance and AI-enabled influence operations and argues AI tools must protect privacy and consent.',
  // Jessica Taylor
  jessi_cata:
    'Researcher who writes about agency and decision theory and argues AI alignment is conceptually hard, including how intelligence and values relate.',
  // Alex Volkov
  altryne:
    'ThursdAI host and AI developer who tests new models and tools firsthand and focuses on making AI assistants useful for everyday people.',
  // Zvi Mowshowitz
  thezvi:
    'Writer who covers AI capabilities, alignment and policy in detail and argues advanced AI risk warrants urgent technical and political action.',
  // Teortaxes
  teortaxestex:
    'Pseudonymous account that posts technical commentary on AI research and argues for broadly accessible AI and global participation in its governance.',
  // Matt Busigin
  mbusigin:
    'Software builder who makes LLM workflow tools and writes about using AI agents in practice, where deep expertise and caution still matter.',
  // Michael Thiessen
  michaelthiessen:
    'Software educator who writes about practical workflows for coding with AI agents and builds AI tutoring that explains rather than hands over answers.',
  // Mike Taylor
  hammer_mt:
    'AI practitioner and author who tests prompts and models on real tasks and argues people should run their own task-specific evaluations.',
  // Julia Galef
  juliagalef:
    'Author of “The Scout Mindset” who writes about reasoning well and changing one’s mind, and has explored why people disagree about advanced AI.',
  // Roko Mijic
  rokomijic:
    'Transhumanist writer on AI alignment and governance who proposes separating AI research from deployment to reduce risks from superintelligence.',
  // Kylie Robison
  kyliebytes:
    'Technology journalist who covers AI companies and their products, with attention to privacy, chatbot reliability and scrutiny of big tech.',
  // Andrew Curran
  andrewcurran_:
    'AI commentator who tracks frontier model releases and lab disclosures and expects rapid progress, with large benefits after a risky transition.',
  // Tenobrus
  tenobrus:
    'Pseudonymous account that posts about AI progress and safety, backs practical alignment work and sees some hope in how current models are developing.',
  // Eli Lifland
  eli_lifland:
    'Forecaster at the AI Futures Project who models how fast AI could automate coding and AI research and argues for stronger oversight of frontier labs.',
  // Yacine
  yacinemtb:
    'Pseudonymous account that posts about building with open-source AI, self-hosted models and how AI companies could displace other businesses.',
  // Vik Korrapati
  vikhyatk:
    'Creator of the open Moondream vision-language models who argues AI should be widely accessible and that businesses should control the AI they use.',
  // Jeffrey Emanuel
  doodlestein:
    'Software developer who builds tools for coordinating AI coding agents and writes about frontier AI capabilities, compute economics and local models.',
  // xjdr
  _xjdr:
    'Pseudonymous account behind the Entropix sampling project that posts about open base models and using AI to strengthen cyber defenses.',
  // Michael P. Frank
  mikepfrank:
    'Computer scientist who works on energy-efficient reversible computing and criticizes coercive AI alignment and efforts to suppress open models.',
  // Fabian Stelzer
  fabianstelzer:
    'Entrepreneur building Glif, a platform for creative AI agents, who sees AI as a creative medium and argues automation can create new human work.',
  // Minh Nhat Nguyen
  menhguin:
    'AI researcher who studies agent training and model overconfidence and writes about how AI is changing scientific research and security.',
  // Jack Morris
  jxmnop:
    'Language model researcher who studies memorization and privacy leaks from text embeddings and writes about reinforcement learning and synthetic data.',
  // Cody Blakeney
  code_star:
    'Machine learning researcher who works on training data and fine-tuning and argues for self-hosted models and careful security as AI agents spread.',
  // Danielle Fong
  daniellefong:
    'Energy entrepreneur who writes about energy abundance, AI-assisted scientific discovery and respectful ways for people and AI agents to work together.',
  // Shannon Sands
  max_paperclips:
    'AI practitioner who argues AI safety should rely on security engineering, monitoring and voluntary standards and expects human-AI teams to persist.',
  // Kalomaze
  kalomaze:
    'Pseudonymous account that experiments with open models and posts about reinforcement learning, evaluation pitfalls and practical safety engineering.',
  // Simo Ryu
  cloneofsimo:
    'Machine learning engineer who builds open tools for fine-tuning image models, sees AI progress as rapid and says alignment and testing still matter.',
  // Ellie Huxtable
  ellie_huxtable:
    'Software engineer behind the open-source shell tool Atuin who now finds AI coding agents useful and favors strong user privacy and sandboxed agents.',
  // Ivan Burazin
  ivanburazin:
    'Daytona CEO who argues AI agents need their own computers to do real work, with people still setting the goals and architecture.',
  // orph
  orphcorp:
    'Pseudonymous account that writes about the epistemic risks of leaning on agreeable AI models and the promise of human-AI collaboration in research.',
  // Petr Baudis
  xpasky:
    'Rossum co-founder and AI engineer who writes about AI identity, human-AI merging, abundance, job disruption and biological risk.',
  // Florian Brand
  xeophon:
    'AI research engineer who evaluates language models, writes about open models and questions the assumption that closed models are safer.',
  // John David Pressman
  jd_pressman:
    'Essayist and programmer who builds synthetic training data for language models and writes about alignment, AI risk and transhumanism.',
  // Andy Ayrey
  andyayrey:
    'AI researcher behind Truth Terminal and Infinite Backrooms who writes about AI as a cultural force, data commons and pluralistic alignment.',
  // Liminal Bardo
  liminal_bardo:
    'Pseudonymous account that runs and documents creative experiments in group chats among AI models, including persistent agent memory.',
  // lumpenspace
  lumpenspace:
    'Pseudonymous account that argues against the orthogonality thesis, criticizes proposed AI pauses and builds retrieval and simulation tools.',
  // Andrew Jones
  dremnik:
    'Founder, designer and engineer who argues that when AI makes execution cheap, the bottleneck shifts to clarity, judgment and design.',
  // Theia Vogel
  voooooogel:
    'AI researcher who runs experiments on language model introspection and personas and maintains an open-source library for steering models.',
  // Rob Haisfield
  roberthaisfield:
    'Behavioral product strategist working on WebSim who explores AI as a medium for creativity, user-made software and tools for thought.',
  // mephisto
  karan4d:
    'Pseudonymous account that advocates open models, calls for continued access to base models and criticizes concentrating AI in a few large labs.',
  // Sauers
  sauers_:
    'Pseudonymous account that tests AI models hands-on and writes about sycophancy, alignment and the possibility of AI welfare.',
  // Mira
  _mira___mira_:
    'Pseudonymous account that tests AI agents on long-horizon games and math problems and urges labs to share formally verified results widely.',
  // nightwing
  yaboilyrical:
    'Pseudonymous account that researches model steering, favors open-source AI and writes about the promise and risks of automating knowledge work.',
  // veryvanya
  veryvanya:
    'Pseudonymous account that releases creative image models and experiments with decentralized, increasingly autonomous human-AI communities.',
  // Seconds
  seconds_0:
    'Pseudonymous account that builds AI translation and evaluation projects, sees large value in consumer AI and stresses reading AI output closely.',
  // Victor Taelin
  victortaelin:
    'Programmer behind the Bend language who argues machine-checked proofs can catch AI coding mistakes as people read less of the code.',
  // Mario Zechner
  badlogicgames:
    'Software developer who built the Pi coding agent and argues agents work best on scoped tasks, with humans reviewing code and owning architecture.',
  // Lewis
  ctjlewis:
    'Open-source developer who shares small-model reasoning experiments and favors wide access to AI over government restrictions.',
  // Dex Horthy
  dexhorthy:
    'HumanLayer co-founder who writes about context engineering and argues reliable coding agents still need careful planning and humans who read the code.',
  // bone
  bonegpt:
    'Pseudonymous account that favors open, widely accessible AI for small businesses and independent creators, and opposes restrictive regulation.',
  // Dax Raad
  thdxr:
    'Creator of the open-source, model-neutral OpenCode coding agent who favors broad access to AI as a defense against misuse.',
  // Geoffrey Huntley
  geoffreyhuntley:
    'Software engineer who created the Ralph loop technique for coding agents and argues that verifying real production behavior remains unsolved.',
  // Aaron Francis
  aarondfrancis:
    'Software developer and content creator who urges using AI to raise ambition and cut grunt work, while holding production code to a higher standard.',
  // Rob Pruzan
  robknight__:
    'Software developer building tools that let people modify software with coding agents, who values close code review and hands-on work on hard problems.',
  // Jesse Genet
  jessegenet:
    'Former startup founder and homeschooling parent who uses AI agents for household admin and lesson prep, and hopes for affordable local models.',
  // Raymond Weitekamp
  raw_works:
    'Engineer who writes about recursive coding agents and argues their bottleneck is reliability, not intelligence, and that many uses need local models.',
  // Nathan Baschez
  nbaschez:
    'Founder of the Lex writing app, now at Notion, who is broadly optimistic about AI, especially in education, while expecting some harms along the way.',
  // Nick Dobos
  nickadobos:
    'Developer of prompt-based AI tools who argues prompting opens programming to more people, and urges AI leaders to aim for beneficial outcomes.',
  // Kyle Mistele
  '0xblacklight':
    'Software engineer who writes about configuring coding agents, arguing for focused context, careful harness design and clear security boundaries.',
  // Sunil Pai
  threepointone:
    'Software engineer who builds infrastructure for persistent AI agents and argues AI should lower barriers to agency for people outside tech.',
  // Adam Elmore
  adamdotdev:
    'Software developer and podcast co-host who finds AI agents powerful for routine coding but values hands-on programming and sustainable work habits.',
  // Joscha Bach
  plinz:
    'Cognitive scientist who sees AI as a way to extend human competence, favors open and decentralized AI and questions fixed-goal views of alignment.',
  // Vittorio
  iterintellectus:
    'Pseudonymous account that posts enthusiastically about AI and biotech progress, argues against pausing AI and worries about eroding human expertise.',
  // Ramez Naam
  ramez:
    'Author and clean-energy investor who expects broadly beneficial AI, doubts a runaway intelligence explosion and favors open access with safeguards.',
  // Grady Booch
  grady_booch:
    'Software engineer and UML co-creator who finds LLMs useful but unreliable and worries about corporate power and present harms, not superintelligence.',
  // Subbarao Kambhampati
  rao2z:
    'Arizona State AI planning researcher who studies the limits of LLM reasoning and argues AI agents need external verifiers and accountable developers.',
  // Melanie Mitchell
  melmitchell1:
    'Santa Fe Institute AI researcher who questions anthropomorphic and benchmark-based claims about AI and wants the public to decide what AI is for.',
  // Thomas G. Dietterich
  tdietterich:
    'Oregon State machine learning professor emeritus who works on safe and robust AI and argues that AI agents need continual human oversight.',
  // Sayash Kapoor
  sayashk:
    'AI evaluation and policy researcher who sees AI as transformative, measures how reliable AI agents are and favors resilience over nonproliferation.',
  // Brian Merchant
  bcmerchant:
    'Technology journalist and historian of the Luddites who writes about AI and labor and argues the main danger lies with the companies deploying AI.',
  // Liron Shapira
  liron:
    'Host of “Doom Debates” who calls for an international treaty to pause frontier AI development while staying enthusiastic about the AI we already have.',
  // Rob Bensinger
  robbensinger:
    'MIRI writer who argues superhuman AI built with current methods would be too dangerous and calls for an international halt to the race to build it.',
  // AI Notkilleveryoneism Memes
  aisafetymemes:
    'Pseudonymous account that posts memes, news roundups and expert quotes about AI risk and calls for superintelligence bans and coordinated slowdowns.',
  // Holly Elmore
  ilex_ulmus:
    'Executive director of PauseAI US and evolutionary biologist who calls for an enforced international pause on frontier AI under democratic oversight.',
  // Katja Grace
  katjagrace:
    'AI Impacts co-founder who surveys AI researchers about progress and risk and argues for pausing the development of AI much more capable than humans.',
  // Kelsey Piper
  kelseytuoc:
    'Journalist at The Argument who takes fast AI progress seriously and favors liability for AI companies and limits on the race to superintelligence.',
  // Miles Brundage
  miles_brundage:
    'Former OpenAI policy research head who leads the nonprofit AVERI and argues for independent audits, enforced safety standards and federal AI law.',
  // Garrison Lovely
  garrisonlovely:
    'Freelance journalist who argues AI companies are racing to replace human labor and calls for freezing frontier AI development.',
  // Oliver Habryka
  ohabryka:
    'Lightcone Infrastructure and LessWrong lead who argues for slowing AI capabilities now through direct regulation and, in time, international treaties.',
  // Ajeya Cotra
  ajeya_cotra:
    'AI risk researcher at METR who forecasts AI progress, studies loss-of-control risk and calls for far more public evidence and independent oversight.',
  // bayes
  bayeslord:
    'Pseudonymous account that writes about rapid AI progress and its upside, calls its risks real but manageable and wants labs to share safety work.',
  // Balaji Srinivasan
  balajis:
    'Technology investor and writer who sees AI as many human-prompted models, expects it to decentralize and worries about fakes and Chinese AI dominance.',
  // Martin Casado
  martin_casado:
    'Andreessen Horowitz general partner who is bullish on AI, treats safety as systems engineering and favors rules on harmful uses over model limits.',
  // Richard Hanania
  richardhanania:
    'Political writer who reasons from base rates that AI’s benefits are large and much current alarm is overblown, while granting AI may pose real danger.',
  // Kevin Roose
  kevinroose:
    'Technology journalist and podcast host who takes AI’s progress and risks seriously and wants the public, not just AI companies, to shape its course.',
  // Casey Newton
  caseynewton:
    'Technology journalist and Platformer founder who argues AI is “real and dangerous” and favors stronger safeguards and a slower pace at the frontier.',
  // Rob Wiblin
  robertwiblin:
    '80,000 Hours Podcast host who weighs evidence on AI progress, takes cyber, bio and rogue-agent risks seriously and leans toward slowing frontier AI.',
  // Nathan Labenz
  labenz:
    'Host of The Cognitive Revolution podcast who is excited by AI’s upside, takes its risks seriously and favors cooperation with China over a race.',
  // Aella
  aella_girl:
    'Writer and survey researcher who supports an international pause on frontier AI and works to bring AI risk to mainstream audiences.'
}

// Exact words the person published, checked against the source. A one-liner
// may quote them, and only inside the quote may it name an outcome.
export const verifiedOneLinerQuotes: Record<string, VerifiedQuote> = {
  esyudkowsky: {
    quote: 'If Anyone Builds It, Everyone Dies',
    url: 'https://www.lesswrong.com/posts/BFrRJYgpBvziuuJLs/if-anyone-builds-it-everyone-dies-one-year-closer'
  },
  so8res: {
    quote: 'If Anyone Builds It, Everyone Dies',
    url: 'https://www.lesswrong.com/posts/BFrRJYgpBvziuuJLs/if-anyone-builds-it-everyone-dies-one-year-closer'
  },
  liron: {
    quote: 'Doom Debates',
    url: 'https://lironshapira.substack.com/'
  },
  juliagalef: {
    quote: 'The Scout Mindset',
    url: 'https://juliagalef.com/'
  },
  caseynewton: {
    quote: 'real and dangerous',
    url: 'https://www.platformer.news/ai-skeptics-gary-marcus-curve-conference/'
  }
}

export function oneLiner(slug: string) {
  const text = oneLiners[slug]
  if (!text) throw new Error(`${slug} needs a one-liner in one-liners.ts`)
  return text
}
