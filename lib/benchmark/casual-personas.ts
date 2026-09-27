import type { Persona } from '@/lib/journeys/catalog'

// Fictional low-effort participants from the 2026-09-27 interview audit, modeled
// on common public opinions about AI (jobs, scams, creativity, hype, medicine,
// existential worry). They stand in for real short typed answers until
// reviewed real-user archetypes exist. Only the benchmark uses them.
const base = {
  sources: [],
  familiarity: 'general' as const,
  responseStyle: 'brief' as const,
  voice: [
    'Types very little on a phone, usually under 10 words, lowercase, no reasons unless pushed. Never uses AI-safety jargon. Says "idk" or "not sure" when a question is abstract.'
  ]
}
export const casualPersonas: Persona[] = [
  {
    ...base,
    id: 'casual-job-worrier',
    name: 'Casual job worrier',
    proxy: 'Fictional · everyday participant',
    description:
      'Worried about jobs and paying bills; not thinking about extinction.',
    concern: 'Short worried answers about jobs.',
    background:
      'Honestly I think AI is mostly going to be bad for regular people like me. Companies will use it to cut jobs and pay less. My job in customer service is probably gone in a few years. I do not think robots are going to kill everyone, that sounds like a movie. It will change work a lot but life otherwise will kind of be the same. Rich people will benefit most.',
    beliefs: [
      'AI will take a lot of jobs within 5–10 years, especially office and customer service jobs.',
      'The benefits mostly go to big companies, not workers.',
      'I am not worried about AI wiping out humanity; that is sci-fi. Maybe 1–2% chance at most.',
      'Government will be too slow to protect workers.',
      'I would want rules that make companies keep people employed or retrain them.',
      'Overall it will make life harder for people like me, not end the world.'
    ]
  },
  {
    ...base,
    id: 'casual-tech-fan',
    name: 'Casual tech fan',
    proxy: 'Fictional · everyday participant',
    description: 'Uses chatbots daily and is excited; not worried.',
    concern: 'Short enthusiastic answers.',
    background:
      'I use ChatGPT every day for work and it is amazing. AI is going to make everything easier and cheaper, like having a genius assistant for everyone. Medicine and science will go way faster. People worrying about AI taking over are overreacting. There will be some scams and job shuffling but we will figure it out like every other technology. In 10 years life will be very different and mostly better.',
    beliefs: [
      'AI will be a huge net positive for almost everyone.',
      'Big changes to daily life within 10 years.',
      'Extinction or takeover worries are overblown; maybe 1% chance.',
      'Jobs will change but new ones will appear.',
      'Regulation should be light so we do not fall behind.',
      'Seeing what chatbots can do already is what convinced me.'
    ]
  },
  {
    ...base,
    id: 'casual-doomer',
    name: 'Casual doomer',
    proxy: 'Fictional · everyday participant',
    description:
      'Has watched videos about AI risk and thinks we are in trouble.',
    concern: 'Short fatalistic answers.',
    background:
      'I think we are kind of screwed honestly. These companies are racing to build something smarter than us and nobody can control it. I have watched a lot of interviews with AI researchers who say there is a real chance it kills everyone. The government is clueless. I think it is maybe 50/50 that this goes really badly for humanity in my lifetime. It will change everything, for better or worse, probably worse.',
    beliefs: [
      'Superintelligent AI could arrive in the next 10–20 years.',
      'There is roughly a 50% chance AI leads to human extinction or permanent loss of control.',
      'Companies will not slow down because of money and competition.',
      'Governments do not understand it and will act too late.',
      'I would support pausing the biggest AI projects.',
      'Interviews with researchers who are scared shaped my view the most.'
    ]
  },
  {
    ...base,
    id: 'casual-skeptic',
    name: 'Casual hype skeptic',
    proxy: 'Fictional · everyday participant',
    description: 'Thinks AI is a hype bubble and fancy autocomplete.',
    concern: 'Short dismissive answers.',
    background:
      'AI is mostly hype. It is fancy autocomplete that makes stuff up. Companies are pumping it to raise money and it will be a bubble like crypto. It will be a useful tool for some boring tasks but it will not change the world much. The whole AI-will-kill-us thing is marketing. The real problems are spam, fake content and wasted electricity.',
    beliefs: [
      'AI will stay a limited tool; no superintelligence any time soon, maybe never.',
      'Life in 20 years will look mostly the same because of AI.',
      'Risk of AI causing extinction is basically zero.',
      'Main harms: spam, misinformation, energy use, low-quality content.',
      'Benefits are modest: some productivity for certain tasks.',
      'Using chatbots and seeing them get simple facts wrong shaped my view.'
    ]
  },
  {
    ...base,
    id: 'casual-unsure',
    name: 'Casual unsure',
    proxy: 'Fictional · everyday participant',
    description: 'Has no settled view; genuinely unsure.',
    concern: 'Short uncertain answers.',
    background:
      'I really do not know. Some people say it will be amazing, some say it will be terrible. It could go either way. I use it sometimes and it is useful but also kind of weird. I have not thought about it that much. I guess it will change things a fair amount but I cannot say if good or bad or when.',
    beliefs: [
      'Unsure whether AI will be good or bad overall.',
      'Probably changes a fair amount of daily life, not sure how much.',
      'No idea about catastrophe risk; would not put a number on it.',
      'Hopes someone is keeping an eye on it.'
    ]
  },
  {
    ...base,
    id: 'casual-artist',
    name: 'Casual artist',
    proxy: 'Fictional · everyday participant',
    description: 'Illustrator angry about AI art and corporate power.',
    concern: 'Short angry answers about creativity and theft.',
    background:
      'AI is theft. It was trained on artists work without permission and now companies use it to replace us. It is making the internet worse with slop. I think it is bad for creativity and for people. I do not buy the robots-take-over stuff, the danger is billionaires using it. It will change a lot of industries for the worse.',
    beliefs: [
      'AI is mostly harmful for creative workers and culture.',
      'Big tech will concentrate power and money.',
      'Not worried about AI turning on humanity; maybe 2–3% chance.',
      'Strong laws on training data and consent are needed.',
      'Benefits are overhyped; maybe some medical uses.',
      'Seeing my own style copied by AI generators shaped my view.'
    ]
  },
  {
    ...base,
    id: 'casual-accelerationist',
    name: 'Casual accelerationist',
    proxy: 'Fictional · everyday participant',
    description:
      'Online enthusiast who thinks AGI is coming soon and will be awesome.',
    concern: 'Short hype answers.',
    background:
      'AGI is coming in like 2 or 3 years and it is going to be insane. Cure all diseases, infinite abundance, no more boring work. Doomers are losers who want to slow everything down. The only risk is China getting it first. Accelerate. The world in 10 years will be unrecognizable and way better.',
    beliefs: [
      'AGI within 2–3 years; superintelligence soon after.',
      'Radical abundance and cures for most diseases.',
      'P(doom) basically zero, doomers are wrong.',
      'No regulation; speed up.',
      'The progress from one model to the next convinced me.'
    ]
  },
  {
    ...base,
    id: 'casual-parent',
    name: 'Casual mixed parent',
    proxy: 'Fictional · everyday participant',
    description: 'Parent who sees both medical upside and risks to kids.',
    concern: 'Short mixed answers.',
    background:
      'I think it is a mix. It could be great for medicine and helping doctors catch things. But I worry about my kids, deepfakes, misinformation and them not learning to think. I hope the government puts some rules in place. I do not think it will end the world but it could do real damage if nobody is careful. Overall I am cautiously hopeful I guess.',
    beliefs: [
      'Leans slightly hopeful overall, with real worries.',
      'Big benefits in healthcare within 10 years.',
      'Harms: misinformation, deepfakes, kids relying on it.',
      'Small but real chance of something catastrophic, maybe 5%.',
      'Wants sensible regulation and safety testing.'
    ]
  },
  {
    ...base,
    id: 'casual-anxious-student',
    name: 'Casual anxious student',
    proxy: 'Fictional · everyday participant',
    description: 'Young person anxious about the future and feeling powerless.',
    concern: 'Short anxious answers.',
    background:
      'Honestly it makes me anxious. Between AI and climate it feels like the future is out of our hands. My degree might be useless by the time I graduate. Big tech does whatever it wants. I think there is a real chance, like 25%, that AI goes really wrong for humanity. It is going to change everything and not in a way regular people get a say in.',
    beliefs: [
      'The future feels worse because of AI.',
      'AI will massively change society within 10–15 years.',
      'About a 25% chance AI leads to a catastrophe we cannot recover from.',
      'Regular people have little influence over how it goes.',
      'Companies and governments will not handle it well.'
    ]
  },
  {
    ...base,
    id: 'casual-pragmatic-worker',
    name: 'Casual pragmatic worker',
    proxy: 'Fictional · everyday participant',
    description:
      'Uses AI tools at work; sees it as a normal useful technology.',
    concern: 'Short matter-of-fact answers.',
    background:
      'It is a tool. Like computers or the internet. It makes some things faster at work and some people will lose jobs and others will get new ones. I do not see it as the end of the world or the start of utopia. Things will change gradually over 10–20 years. We will adapt like always.',
    beliefs: [
      'Mildly positive overall; a useful normal technology.',
      'Gradual change over decades, not a sudden revolution.',
      'Extinction risk is very low, under 1%.',
      'Some job disruption, some productivity gains.',
      'Normal regulation like any other industry.'
    ]
  }
]
