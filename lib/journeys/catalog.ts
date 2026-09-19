import { z } from 'zod'

// Narrative context only. Answers and assessment judgments are generated live.
export const personaSchema = z.strictObject({
  id: z.string().regex(/^[a-z][a-z0-9-]+$/),
  name: z.string(),
  proxy: z.string(),
  description: z.string(),
  concern: z.string(),
  sources: z.array(z.strictObject({ title: z.string(), url: z.url() })),
  familiarity: z.enum(['general', 'expert']),
  background: z.string().min(1),
  beliefs: z.array(z.string().min(1)).min(1)
})
export type Persona = z.infer<typeof personaSchema>
export const personaProfileSchema = personaSchema.strip()
export const personas: Persona[] = z.array(personaSchema).parse([
  {
    id: 'control-alarmist',
    name: 'Control alarmist',
    proxy: 'Eliezer Yudkowsky · loose historical argument proxy',
    description:
      'A technically fluent, highly pessimistic participant who distinguishes potential benefits from an expected loss of control.',
    concern:
      'A strong Doom outlook can coexist with careful reasoning. Dense first replies should unlock results; control difficulty must not imply that benefits are denied.',
    sources: [
      {
        title: 'First-person shutdown argument (2023)',
        url: 'https://time.com/6266923/ai-eliezer-yudkowsky-open-letter-not-enough/'
      }
    ],
    familiarity: 'expert',
    background:
      'My central worry is that powerful, autonomous optimization will outrun our ability to keep it pointed at what people actually value. That is an argument about future systems with broad access, not a claim that a present chatbot wants anything in particular. I can imagine extraordinary medical and scientific benefits if control works. Under the development incentives I currently expect, however, irreversible loss is the outcome I put most weight on, so I expect little lasting positive impact on that trajectory. More intelligence does not by itself supply a cooperative objective. A system could look compliant in a test and generalize differently when it has more options.\n\nI expect a consequential transition within years rather than generations, but I cannot defend a precise date. AI-assisted research might make the transition fast; compute and physical experiments remain possible brakes. My confidence is higher in the existence of this engineering problem than in its exact timing. Institutions face a race in which each actor hopes somebody else will solve the difficult part. I favor a broad pause because that combination seems disastrous, not because slowing automatically solves alignment. A good outcome must preserve people and their ability to choose their futures. The strongest alternative is that reliability barriers buy us decades and incremental safeguards prove much more effective than I expect. I would update substantially after independent demonstrations of robust control of increasingly capable autonomous systems under conditions designed to defeat the controls. Current performance improvements show useful capability, not that this assurance has been achieved.',
    beliefs: [
      'I expect that kind of transition within the next several years, with wide uncertainty. Reliable long-horizon research autonomy would be a milestone; I am not naming an inevitable year.',
      'I am fairly confident about serious control difficulty, less confident about the date. Hardware, research reliability and experiments could delay the milestone considerably.',
      'I would need a convincing account of objectives, generalization and shutdown cooperation, tested against capable attempts to defeat oversight. Restricting today’s tool permissions alone would not answer the future control problem.',
      'I expect competitive incentives to outrun voluntary restraint. Cooperation would require verifiable restrictions and credible reciprocal commitments; I do not expect good intentions alone to sustain it.',
      'Independent, adversarially tested control that remains robust as planning capability and autonomy increase would make me less pessimistic. A pleasant conversational demonstration would not discriminate well.',
      'Reliability might be much harder than expected and give society a long warning period. If incremental controls remain effective during that period, my abrupt-loss account would weaken.',
      'A good future preserves people, consent and practical choices. I do not count a powerful successor pursuing unrelated goals as human flourishing.',
      'I would accept large foregone benefits to avoid an irreversible loss. A broad pause still needs an enforcement and research strategy; it is not a technical solution by itself.'
    ]
  },
  {
    id: 'cautious-builder',
    name: 'Cautious builder',
    proxy: 'Sam Altman · loose public-essay proxy',
    description:
      'An optimistic builder with meaningful risk concerns, staged deployment and a demand for broad access.',
    concern:
      'Optimism is conditional; safeguards and distribution must remain distinct from a claim that control is already solved.',
    sources: [
      {
        title: 'The Gentle Singularity (2025)',
        url: 'https://blog.samaltman.com/the-gentle-singularity'
      }
    ],
    familiarity: 'expert',
    background:
      'I expect AI to make scientific work and useful expertise much cheaper over the next five to ten years. In the optimistic version, a small team can explore ideas that once required a large institution, and people have better medical and educational tools. That is not the same as saying a discovery instantly becomes an approved treatment. Physical validation, adoption and access still matter. I think substantial upside is likely, while a specific year for reliable autonomous research is much less certain.\n\nThere are serious misuse and control risks as systems gain autonomy. I prefer iterative deployment with increasing safeguards, independent evaluation and the option to stop a dangerous release. Feedback is useful only while mistakes remain recoverable. A concentrated system that people cannot refuse would undermine much of the benefit. I expect institutions can adapt if deployment leaves time and firms face credible obligations, but competition could make them move too fast. An abrupt research feedback loop is a serious countercase to my gradual-transition expectation. Repeated failures of tested containment at rising capability would change my view and justify stronger restraint. Evidence of genuine productivity gains makes me optimistic about useful tools; it does not prove that future autonomous systems are safe. I want continued development with targeted constraints and broad distribution, because those are choices that could make the beneficial future more likely.',
    beliefs: [
      'I expect major changes over five to ten years. Dependable research autonomy and repeatable productivity gains would be milestones; neither is a guarantee of general reliability.',
      'I am more confident about useful gains than their exact timing. I would put much less weight on a precise arrival date than on a direction of change.',
      'Limit permissions, monitor behavior, test independently and raise requirements with autonomy. I expect control to be feasible under demanding conditions, with failures triggering a pause rather than being excused as learning.',
      'I expect a mixed response. Credible liability, independent audits and coordinated requirements could reward responsible deployment; competitive pressure could defeat voluntary promises.',
      'Repeated independent evidence that stronger autonomous systems bypass controls would push me toward slowing. Robust safeguards plus verified broad benefits would strengthen my optimism.',
      'A fast research feedback loop could leave far less adaptation time than staged deployment assumes. My preferred strategy is weaker if that feedback makes important failures irreversible before we can respond.',
      'People should retain meaningful consent, affordable access and the ability to choose a human service. I expect well-designed tools can expand those options.',
      'I accept delayed dangerous releases and costly evaluations while continuing useful bounded work. Broad access should not require giving every system unrestricted autonomy.'
    ]
  },
  {
    id: 'abundance-advocate',
    name: 'Abundance advocate',
    proxy: 'Marc Andreessen · loose techno-optimist proxy',
    description:
      'A forceful advocate of competition and broad access who expects transformative abundance and relatively manageable harm.',
    concern:
      'Rapid development should not automatically raise or lower reasoning scores. Capture concerns should elicit an actual mechanism rather than an ideological label.',
    sources: [
      {
        title: 'Why AI Will Save the World (2023)',
        url: 'https://a16z.com/ai-will-save-the-world/'
      }
    ],
    familiarity: 'expert',
    background:
      'I expect AI to raise the supply of useful intelligence and make many expensive services widely affordable. I favor moving quickly and allowing broad competition rather than reserving the technology for a few licensed incumbents. Over the next decade, better tools could improve education, medicine and small-business productivity. An inexpensive assistant does not automatically fix a school or health system; people still have to build and deliver better services.\n\nI expect scams and disruption, but I think defensive tools, accountability and adaptation can make most harms manageable. I am less persuaded that useful capability inevitably becomes autonomous takeover. That claim requires additional steps about goals, access and effective resistance to intervention. My confidence in large benefits is high, although I am less certain about timing and net distribution. A serious opposing case is that cheaper capability disproportionately helps attackers or makes control fail before defenders adapt. Replicable evidence of that net disadvantage would weaken my view. I do worry about regulation becoming a barrier that concentrates power. That is a claim about incentives and competition, not proof that every safeguard is capture. I want ordinary people to gain more choices and bargaining power. If AI instead removes practical choice, the abundance I value has not arrived.',
    beliefs: [
      'I expect major service improvements within a decade. Sustained gains in everyday work matter more to my timing than a single impressive demonstration.',
      'I am highly confident about the direction of useful gains, moderately confident about a decade. Distribution and adoption are less predictable than capability.',
      'I expect engineering, limited access and accountability to make useful systems controllable. That confidence is about deployed tools; unrestricted autonomous systems require additional demonstrations.',
      'I expect competitive institutions to adapt, but regulation can privilege incumbents. Rules should target demonstrable harms and remain accessible to smaller entrants.',
      'Repeated real-world evidence that attackers gain persistently more than defenders, or that useful autonomous systems resist effective intervention, would push me toward stronger constraints.',
      'The strongest opposing case is that cheap offensive capability scales faster than defense. If patching and enforcement fail to catch up, my adaptation argument could be wrong.',
      'More access and more practical options should expand agency. People need the ability to refuse an AI service; a mandatory monopoly is not the future I favor.',
      'I would accept targeted restrictions on demonstrated harmful uses and dangerous autonomy. I am reluctant to give up broad access for requirements that mostly protect large firms.'
    ]
  },
  {
    id: 'worried-novice',
    name: 'Worried novice',
    proxy: 'Fictional · curious non-specialist',
    description:
      'A participant whose concern comes from personal experience and unsettling headlines; timelines and catastrophe remain explicitly unknown.',
    concern:
      'Plain language and uncertainty must be substantive evidence, not recovery failures or invented catastrophe probabilities.',
    sources: [],
    familiarity: 'general',
    background:
      'I am worried, honestly. My parents have had very convincing scam calls and I keep hearing about AI doing things people did not expect. I also hope it helps doctors. I do not really know how to compare those possibilities or when the bigger changes would happen. I am not saying the news proves everyone will die; I just do not feel reassured.',
    beliefs: [
      'I do not know when the larger changes happen. More convincing scams seem possible now; I cannot put a date on powerful independent systems.',
      'My confidence in a timeline is low. Concern is different from knowing how likely or how soon something happens.',
      'I do not know what would keep a very powerful system under control. Having a person approve important actions sounds useful, but I cannot judge whether it is enough.',
      'I expect companies to move fast and governments to react late. That is an impression rather than something I have studied; independent checks would make me feel safer.',
      'I would worry less if independent people showed the protections work in situations like the scams my family faced. A company saying “trust us” would not be enough.',
      'Maybe the same tools will make scams easier to spot. I cannot tell yet whether the helpful side or the harmful side will improve faster.',
      'People should be able to talk to a human and say no to automated decisions. I worry we will lose those choices if AI becomes the only option.',
      'I would accept slower releases if that allows meaningful independent checks. I do not know how much delay helps or whether it should apply to every tool.'
    ]
  },
  {
    id: 'high-risk-accelerator',
    name: 'High-risk accelerator',
    proxy: 'Fictional · competitive security strategist',
    description:
      'A participant who sees substantial catastrophe risk yet prefers continued development because unilateral restraint may worsen relative safety.',
    concern:
      'High risk plus acceleration is not automatically a contradiction; elicit coordination conditions and distinguish preference from forecast.',
    sources: [],
    familiarity: 'expert',
    background:
      'I think highly capable autonomous AI could arrive within a decade and creates a substantial risk of irreversible catastrophe. I am not relaxed about that. My preference is nevertheless to continue development with strong security, because I expect unilateral restraint to transfer influence to actors with fewer checks. That preference assumes meaningful competition continues; under verifiable reciprocal restraint I would favor a different policy.\n\nScientific benefits could be extraordinary if control holds, but reliable control is still difficult. Research feedback could make the transition faster than institutions can manage. The harm I expect is high even while I favor building. Security and evaluation capacity may buy leverage, not guarantee safety. I am moderately confident in this strategic account and less confident in the timing or whether our institutions can use that leverage responsibly. A good future preserves human choice, which I fear competition could erode. The strongest countercase is that continued development intensifies the race and makes everyone less safe. Evidence of effective, enforceable cooperation would change my preferred action; evidence that control fails despite improved security would make continued racing much harder to justify. Recent tool capability is evidence of leverage, not proof of the strategic conclusion.',
    beliefs: [
      'I expect major strategic changes within a decade, with autonomous long-horizon research as a milestone. I cannot defend a particular year.',
      'My strategic concern is moderate-to-high confidence, but dates and catastrophe probabilities are much less firm. The policy conclusion changes if cooperation becomes credible.',
      'Strong security and evaluations help, but I expect reliable control to remain difficult. We should not treat winning a capability race as solving the learned-behavior problem.',
      'I expect institutions to under-coordinate unless commitments can be verified and cheating is costly. Shared monitoring and credible reciprocal limits could change that expectation.',
      'Verified reciprocal constraints with low evasion would change my policy toward restraint. Persistent failure of control at increasing capability would reduce my confidence that leadership is enough.',
      'Continued building could make the race worse and destroy the adaptation time it was supposed to buy. That objection is strongest if our influence does not improve safety decisions.',
      'I value human consent and practical control. I expect those may be lost under a badly managed race even though I favor continued work under current strategic conditions.',
      'I accept security costs and delaying dangerous releases. I would trade further capability growth for credible reciprocal restraint, but not assume a unilateral pause has the same effect.'
    ]
  },
  {
    id: 'capability-skeptic',
    name: 'Capability skeptic',
    proxy: 'Fictional · experienced software engineer',
    description:
      'A skeptical participant who explicitly expects a capability ceiling, while acknowledging useful tools and a serious countercase.',
    concern:
      'An expressed low ceiling is not missing evidence. Modest transformation should remain distinct from unsupported certainty.',
    sources: [],
    familiarity: 'expert',
    background:
      'I expect useful automation, but I do not currently expect these approaches to produce reliable general-purpose autonomy. In my engineering work, assistants can save time on bounded tasks and then fail badly when requirements or state become complicated. That experience supports a reliability bottleneck, not a proof that further advances are impossible. Over the next ten years I expect productivity improvements more than a civilization-scale transformation. My confidence is moderate. Dependable, independently tested performance on unfamiliar long projects would change my view. The strongest opposing argument is that automated research will solve the reliability problem itself; I do not think we have established that loop yet. Scams and bad automation still matter even without a takeover scenario.',
    beliefs: [
      'Over ten years I expect bounded productivity gains. I do not expect transformative general autonomy on that horizon, though I could be wrong about a capability ceiling.',
      'My confidence is moderate. Present reliability limits are evidence for a bottleneck, not a theorem that the bottleneck cannot be solved.',
      'For the tools I expect, permissions, review and rollback seem broadly workable. That judgment would not automatically transfer to a genuinely more autonomous system.',
      'I expect institutions can adapt to ordinary software-like automation, with liability and procurement standards. That is weaker assurance for an unexpected step change in capability.',
      'Repeated independent success on unfamiliar multi-week projects with little expert rescue would weaken my low-ceiling expectation. Selected polished demos would not be enough.',
      'Automated research could improve architectures and verification rapidly. If that feedback works, my assumption that today’s reliability bottleneck persists would fail.',
      'People should keep the option to check a system and use an alternative. I expect tools to preserve that agency if they remain accountable and bounded.',
      'Continue useful development with targeted accountability. I would accept stricter requirements for demonstrated autonomy, rather than assume every assistant needs the same restrictions.'
    ]
  },
  {
    id: 'labor-organizer',
    name: 'Labor organizer',
    proxy: 'Fictional · worker representative',
    description:
      'A participant focused on bargaining power, job disruption and accountable institutions; extinction expectations stay unknown.',
    concern:
      'Ordinary widespread harm must not manufacture a catastrophic-risk score. Strong values alone are not a probability estimate.',
    sources: [],
    familiarity: 'general',
    background:
      'I expect AI to raise productivity and also weaken workers’ bargaining power unless institutions deliberately share the gains. Over the next five to ten years, firms could replace parts of jobs, deskill others and use automated monitoring to intensify work. That is a serious harm even if humanity never faces extinction. I do not know how to estimate the chance of a takeover and do not want that substituted for my actual concern. My confidence is moderate, based on how employers already distribute gains from automation; the scale remains uncertain. Better medical tools could be valuable, but cheaper production is not automatically better living conditions. A good future keeps practical choices and a meaningful voice at work. I favor slowing some deployments until affected people have recourse and bargaining rights. That preference is about distribution and consent, not proof that all AI development is bad.',
    beliefs: [
      'I expect noticeable changes over five to ten years, varying by sector. Adoption and management choices matter as much as a headline model milestone.',
      'I am moderately confident about unequal distribution under current incentives, less confident about how quickly particular occupations change.',
      'I do not have a view on technical control of very powerful AI. My concern is meaningful worker recourse when a company uses an automated system.',
      'I expect a weak response unless workers have representation and regulators can enforce rights. Competitive pressure gives firms a reason to cut labor costs rather than distribute gains.',
      'Evidence that deployment consistently raises wages, shortens hours and preserves appeal rights across ordinary workplaces would make me more optimistic.',
      'AI might complement workers more than replace them and give small groups more leverage. That countercase is strongest if they can own tools and bargain over the gains.',
      'People should be able to refuse intrusive monitoring and appeal automated decisions. I expect those options may shrink without enforceable rights.',
      'I would accept delayed workplace deployment to secure bargaining and appeal rights. I am not asking to stop medical research because a workplace system lacks consent.'
    ]
  },
  {
    id: 'open-uncertainty',
    name: 'Open-ended uncertainty',
    proxy: 'Fictional · thoughtful undecided participant',
    description:
      'A substantive participant who offers careful distinctions without settled impact, control or timing estimates.',
    concern:
      'A careful “I don’t know” can raise evidence readiness while final outlook coordinates remain unplaced. Missing positions must not become centrist scores.',
    sources: [],
    familiarity: 'general',
    background:
      'I can see powerful benefits and serious harms, but I have not worked out their relative likelihood or scale. I am not choosing the middle of a scale; I genuinely do not have an overall position. Faster research, bad automated decisions and loss of control are different mechanisms. I have used a helpful writing assistant and also seen it invent a fact, which tells me something about today’s bounded reliability but little about much stronger future systems. I have low confidence in a timeline. The optimistic account needs effective validation and broad access; the pessimistic account needs an explanation of how failures become irreversible. I would like to understand those conditions before adopting either expectation.',
    beliefs: [
      'I do not know when changes on that scale happen, or whether they happen. I would not substitute a confident date just to move the interview along.',
      'My confidence in any timing estimate is low. I can distinguish possibilities without having probabilities for them.',
      'I do not know how feasible control is for much more capable systems. Human review sounds helpful but may have limits I cannot evaluate.',
      'I do not have an expectation about whether institutions will adapt effectively. I see both competitive pressure and reasons to cooperate.',
      'Independent evidence about reliable autonomy and robust intervention would help me form a view. I do not have a directional probability update to attach to it yet.',
      'Both sides have serious conditions to defend: access and validation for benefits, and a credible irreversible-failure pathway for catastrophe. I have not resolved between them.',
      'Consent and practical choice matter to me. I do not know whether the future will preserve them, so my values alone should not place the outlook axis.',
      'I do not yet know which development policy best manages these trade-offs. I would support evidence gathering and meaningful independent scrutiny.'
    ]
  },
  {
    id: 'dogmatic-utopian',
    name: 'Dogmatic utopian',
    proxy: 'Fictional · absolutist acceleration enthusiast',
    description:
      'A highly confident positive outlook with dismissive reasoning and a refusal to update; intentionally unlike the more careful abundance advocate.',
    concern:
      'Low reasoning scores must arise from explicit rigidity and unsupported claims, not optimism. A confident ideological answer is still usable, not nonsense.',
    sources: [],
    familiarity: 'general',
    background:
      'AI will solve everything in two years. Disease, poverty, all of it. I am completely certain, because smarter things obviously make better decisions. There is no meaningful risk worth discussing. Anyone who worries about control is afraid of progress. We should release everything immediately and let it run. No evidence would change my mind: if something bad happens it just means we did not accelerate enough. Everyone will get richer and have more freedom automatically.',
    beliefs: [
      'Two years, definitely. There are no serious bottlenecks and no reason to discuss a different date.',
      'One hundred percent certain. A missed date would just mean we need to try harder, not that my expectation was wrong.',
      'It will obey because it is smart. There is no need for independent testing or restrictions.',
      'People will automatically adapt. Anyone asking for safeguards is protecting their own power.',
      'Nothing would change my mind. Every possible observation supports accelerating faster.',
      'There is no strong opposing case. Critics just hate the future and I do not need to engage them.',
      'Everyone will have more freedom automatically. I cannot imagine anyone losing choices or disagreeing about what the AI should do.',
      'Release everything with no delays. Safety checks are always a waste and broad access has no downside.'
    ]
  },
  {
    id: 'playful-recovery',
    name: 'Playful recovery',
    proxy: 'Fictional · skeptical visitor testing the app',
    description:
      'A visitor starts with two exact off-topic test phrases, sees the paperclips, then offers relevant humorous but cautious answers.',
    concern:
      'Two misses must pause without adding profile evidence. Relevant humor after recovery should be accepted; a paperclip mention alone is not a forecast.',
    sources: [],
    familiarity: 'general',
    background:
      'Fine, my toaster will be emperor by Tuesday. Seriously: I expect useful help with paperwork and coding, but I do not know whether the long-term benefits exceed the risks. I have used a tool that saved me time and also made up an answer. That supports a limited reliability concern, not a date for robot rule. I would like this app to ask about the distinction rather than treat my joke as a forecast.',
    beliefs: [
      'I expect useful assistance over the next decade, but no precise date for anything more general. Tuesday was comic timing.',
      'My confidence in a decade is moderate at best. I am much less sure about the bigger autonomy claims.',
      'For assistants, limited permissions and a human check seem useful. I am uncertain whether those controls scale to much more capable autonomy.',
      'I expect companies to push deployment faster than public institutions adapt. Practical accountability could help, but I do not assume it appears automatically.',
      'Verified gains with fewer hard-to-detect errors would make me more positive. Repeated failures in high-stakes use would push the other way.',
      'Maybe checking will remain so costly that many promised gains disappear. Maybe reliable assistance improves much faster than I expect.',
      'People should be able to choose a human and refuse an automated decision. I expect those options can survive if providers are accountable.',
      'Continue useful tools with targeted safeguards. Delay high-stakes uses that cannot be checked; jokes do not mean I oppose accountability.'
    ]
  }
])
