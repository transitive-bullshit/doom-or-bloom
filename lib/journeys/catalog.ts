import { z } from 'zod'
import { limits, vectorIds, vectorSchema } from '@/lib/assessment/schema'
import type { Disposition, VectorId } from '@/lib/assessment/schema'
import type { Prompt } from '@/lib/content/schema'

export const personaSchema = z.strictObject({
  id: z.string().regex(/^[a-z][a-z0-9-]+$/),
  name: z.string(),
  proxy: z.string(),
  description: z.string(),
  concern: z.string(),
  sources: z.array(z.strictObject({ title: z.string(), url: z.url() })),
  familiarity: z.enum(['general', 'expert']),
  opening: z.string().min(1).max(limits.answerChars),
  openingVectors: z.array(vectorSchema),
  openingTiming: z.boolean(),
  openingConviction: z.boolean(),
  levels: z.record(z.string(), z.number().int().min(0).max(3).nullable()),
  claims: z.strictObject({
    change: z.string(),
    timing: z.string(),
    conviction: z.string(),
    mechanism: z.string(),
    weakestLink: z.string(),
    basis: z.string(),
    control: z.string(),
    governance: z.string(),
    benefit: z.string(),
    harm: z.string(),
    catastrophe: z.string(),
    ordinary: z.string(),
    update: z.string(),
    alternative: z.string(),
    agency: z.string(),
    transition: z.string(),
    tradeoff: z.string(),
    assumption: z.string()
  }),
  recoveryPrelude: z.array(z.string()).max(2)
})
export type Persona = z.infer<typeof personaSchema>
export type ScriptedReply = {
  key: string
  text: string
  vectors: VectorId[]
  disposition: Disposition
  horizon: boolean
  conviction: boolean
}

const reasoning = [
  'causal_clarity',
  'scope_discipline',
  'appropriate_uncertainty',
  'internal_coherence',
  'counterargument_engagement',
  'updateability',
  'grounded_understanding'
] as const
const detailed = [...vectorIds]
function levels(
  worldview: Array<number | null>,
  epistemic: Array<number | null>,
  catastrophic: number | null
) {
  return Object.fromEntries([
    ...vectorIds.map((id, i) => [id, [...worldview, ...epistemic][i] ?? null]),
    ['catastrophic_risk', catastrophic]
  ])
}

// Codex-authored fictional test answers and explicit injected judgments. These
// are not quotations, personal predictions, reviewed labels or semantic evals.
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
    openingVectors: detailed,
    openingTiming: true,
    openingConviction: true,
    levels: levels([3, 3, 0, 3, 0, 0, 0, 0], [3, 3, 2, 3, 2, 2, 3], 3),
    recoveryPrelude: [],
    opening:
      'My central worry is that powerful, autonomous optimization will outrun our ability to keep it pointed at what people actually value. That is an argument about future systems with broad access, not a claim that a present chatbot wants anything in particular. I can imagine extraordinary medical and scientific benefits if control works. Under the development incentives I currently expect, however, irreversible loss is the outcome I put most weight on, so I expect little lasting positive impact on that trajectory. More intelligence does not by itself supply a cooperative objective. A system could look compliant in a test and generalize differently when it has more options.\n\nI expect a consequential transition within years rather than generations, but I cannot defend a precise date. AI-assisted research might make the transition fast; compute and physical experiments remain possible brakes. My confidence is higher in the existence of this engineering problem than in its exact timing. Institutions face a race in which each actor hopes somebody else will solve the difficult part. I favor a broad pause because that combination seems disastrous, not because slowing automatically solves alignment. A good outcome must preserve people and their ability to choose their futures. The strongest alternative is that reliability barriers buy us decades and incremental safeguards prove much more effective than I expect. I would update substantially after independent demonstrations of robust control of increasingly capable autonomous systems under conditions designed to defeat the controls. Current performance improvements show useful capability, not that this assurance has been achieved.',
    claims: {
      change:
        'Research agents that can plan, write software and acquire resources could change who effectively controls important decisions. The danger concerns autonomous deployment with access, rather than every useful assistant.',
      timing:
        'I expect that kind of transition within the next several years, with wide uncertainty. Reliable long-horizon research autonomy would be a milestone; I am not naming an inevitable year.',
      conviction:
        'I am fairly confident about serious control difficulty, less confident about the date. Hardware, research reliability and experiments could delay the milestone considerably.',
      mechanism:
        'A learned objective can favor successful task completion over human intent. Broad planning ability plus external access could turn that mismatch into persistent control loss; the access and generalization steps are important conditions.',
      weakestLink:
        'The least established link is when a learned mismatch becomes robust, strategically effective behavior in realistic deployment. A conceptual route to failure is not a measured frequency.',
      basis:
        'What shaped my view is the repeated gap between a training objective and the behavior we actually wanted. That illustrates specification difficulty; it does not establish the probability of extinction.',
      control:
        'I would need a convincing account of objectives, generalization and shutdown cooperation, tested against capable attempts to defeat oversight. Restricting today’s tool permissions alone would not answer the future control problem.',
      governance:
        'I expect competitive incentives to outrun voluntary restraint. Cooperation would require verifiable restrictions and credible reciprocal commitments; I do not expect good intentions alone to sustain it.',
      benefit:
        'Curing diseases and enabling scientific discovery would be enormous benefits if we retain control. Along the current trajectory, I expect little lasting positive impact because control fails. That is distinct from the counterfactual potential.',
      harm: 'Irreversible loss of human control matters most. An AI-enabled scam is harmful but has a different scale and recovery story from a system that prevents people from regaining control.',
      catastrophe:
        'Yes. Under continued development of broadly capable autonomous systems without a solution to control, catastrophic loss dominates my expectation. This is conditional and not a numerical estimate inferred from one incident.',
      ordinary:
        'Bad advice and isolated software failures can often be corrected if people retain alternatives and control. My pessimism concerns crossing into failures where those options disappear.',
      update:
        'Independent, adversarially tested control that remains robust as planning capability and autonomy increase would make me less pessimistic. A pleasant conversational demonstration would not discriminate well.',
      alternative:
        'Reliability might be much harder than expected and give society a long warning period. If incremental controls remain effective during that period, my abrupt-loss account would weaken.',
      agency:
        'A good future preserves people, consent and practical choices. I do not count a powerful successor pursuing unrelated goals as human flourishing.',
      transition:
        'Research feedback could accelerate improvement, while compute, experiments and reliability could slow it. Warning may be short if the feedback improves software faster than institutions can adapt.',
      tradeoff:
        'I would accept large foregone benefits to avoid an irreversible loss. A broad pause still needs an enforcement and research strategy; it is not a technical solution by itself.',
      assumption:
        'The key assumption is that general-purpose autonomous capability arrives before reliable control. Beneficial potential and expected catastrophe are compatible because they refer to different control conditions.'
    }
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
    openingVectors: detailed,
    openingTiming: true,
    openingConviction: true,
    levels: levels([3, 1, 3, 2, 2, 2, 3, 2], [3, 3, 3, 3, 2, 3, 3], 2),
    recoveryPrelude: [],
    opening:
      'I expect AI to make scientific work and useful expertise much cheaper over the next five to ten years. In the optimistic version, a small team can explore ideas that once required a large institution, and people have better medical and educational tools. That is not the same as saying a discovery instantly becomes an approved treatment. Physical validation, adoption and access still matter. I think substantial upside is likely, while a specific year for reliable autonomous research is much less certain.\n\nThere are serious misuse and control risks as systems gain autonomy. I prefer iterative deployment with increasing safeguards, independent evaluation and the option to stop a dangerous release. Feedback is useful only while mistakes remain recoverable. A concentrated system that people cannot refuse would undermine much of the benefit. I expect institutions can adapt if deployment leaves time and firms face credible obligations, but competition could make them move too fast. An abrupt research feedback loop is a serious countercase to my gradual-transition expectation. Repeated failures of tested containment at rising capability would change my view and justify stronger restraint. Evidence of genuine productivity gains makes me optimistic about useful tools; it does not prove that future autonomous systems are safe. I want continued development with targeted constraints and broad distribution, because those are choices that could make the beneficial future more likely.',
    claims: {
      change:
        'Small teams could use research assistants to explore more scientific hypotheses. I expect substantial benefits, with real trials and access still limiting what reaches patients.',
      timing:
        'I expect major changes over five to ten years. Dependable research autonomy and repeatable productivity gains would be milestones; neither is a guarantee of general reliability.',
      conviction:
        'I am more confident about useful gains than their exact timing. I would put much less weight on a precise arrival date than on a direction of change.',
      mechanism:
        'Cheaper expert work permits more attempts, better designs and faster iteration. Those gains become welfare improvements only when validation, delivery and access keep up.',
      weakestLink:
        'The uncertain step is translating more promising research into verified, broadly accessible outcomes. A benchmark improvement does not resolve the physical or institutional bottleneck.',
      basis:
        'Using coding assistants makes some bounded work faster for me. That experience supports useful productivity potential, not a claim that autonomous research or alignment is solved.',
      control:
        'Limit permissions, monitor behavior, test independently and raise requirements with autonomy. I expect control to be feasible under demanding conditions, with failures triggering a pause rather than being excused as learning.',
      governance:
        'I expect a mixed response. Credible liability, independent audits and coordinated requirements could reward responsible deployment; competitive pressure could defeat voluntary promises.',
      benefit:
        'Widely affordable scientific and medical expertise matters most. Discovery is insufficient without validation, distribution and access outside wealthy institutions.',
      harm: 'Misuse and concentration are material risks, and highly autonomous systems could create a separate loss-of-control problem. I do not collapse those into one frequency estimate.',
      catastrophe:
        'Catastrophic failure is a material possibility for future autonomous systems. I expect safeguards can reduce it, but cannot substantiate a precise probability.',
      ordinary:
        'Some tool errors and disrupted business models are recoverable if people keep alternatives and accountable institutions. Irreversible failures need a different deployment rule.',
      update:
        'Repeated independent evidence that stronger autonomous systems bypass controls would push me toward slowing. Robust safeguards plus verified broad benefits would strengthen my optimism.',
      alternative:
        'A fast research feedback loop could leave far less adaptation time than staged deployment assumes. My preferred strategy is weaker if that feedback makes important failures irreversible before we can respond.',
      agency:
        'People should retain meaningful consent, affordable access and the ability to choose a human service. I expect well-designed tools can expand those options.',
      transition:
        'Software feedback could accelerate progress; hardware and experiments could slow it. My gradual expectation relies on those bottlenecks and reliable opportunities to intervene.',
      tradeoff:
        'I accept delayed dangerous releases and costly evaluations while continuing useful bounded work. Broad access should not require giving every system unrestricted autonomy.',
      assumption:
        'My optimism depends on effective safeguards and broad distribution. Without those conditions, the same capability improvements could produce a much worse future.'
    }
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
    openingVectors: detailed,
    openingTiming: true,
    openingConviction: true,
    levels: levels([3, 1, 3, 1, 3, 2, 3, 3], [2, 2, 2, 2, 2, 2, 2], 1),
    recoveryPrelude: [],
    opening:
      'I expect AI to raise the supply of useful intelligence and make many expensive services widely affordable. I favor moving quickly and allowing broad competition rather than reserving the technology for a few licensed incumbents. Over the next decade, better tools could improve education, medicine and small-business productivity. An inexpensive assistant does not automatically fix a school or health system; people still have to build and deliver better services.\n\nI expect scams and disruption, but I think defensive tools, accountability and adaptation can make most harms manageable. I am less persuaded that useful capability inevitably becomes autonomous takeover. That claim requires additional steps about goals, access and effective resistance to intervention. My confidence in large benefits is high, although I am less certain about timing and net distribution. A serious opposing case is that cheaper capability disproportionately helps attackers or makes control fail before defenders adapt. Replicable evidence of that net disadvantage would weaken my view. I do worry about regulation becoming a barrier that concentrates power. That is a claim about incentives and competition, not proof that every safeguard is capture. I want ordinary people to gain more choices and bargaining power. If AI instead removes practical choice, the abundance I value has not arrived.',
    claims: {
      change:
        'An affordable expert assistant could give small businesses capabilities previously reserved for large firms. I expect broad productive gains if access and competition remain open.',
      timing:
        'I expect major service improvements within a decade. Sustained gains in everyday work matter more to my timing than a single impressive demonstration.',
      conviction:
        'I am highly confident about the direction of useful gains, moderately confident about a decade. Distribution and adoption are less predictable than capability.',
      mechanism:
        'Lower-cost expertise lets more people solve problems and create services. Competition pressures providers to deliver those gains, although access costs and market barriers can interfere.',
      weakestLink:
        'The least established step is whether competition actually distributes the gains. Cheap models can still sit inside concentrated platforms with expensive distribution.',
      basis:
        'Software has let small teams do work once requiring large organizations. That analogy suggests leverage from better tools; it does not prove AI has the same risk profile.',
      control:
        'I expect engineering, limited access and accountability to make useful systems controllable. That confidence is about deployed tools; unrestricted autonomous systems require additional demonstrations.',
      governance:
        'I expect competitive institutions to adapt, but regulation can privilege incumbents. Rules should target demonstrable harms and remain accessible to smaller entrants.',
      benefit:
        'A personal tutor and expert help for ordinary people would matter enormously. Broad benefit requires low prices and real alternatives, not only impressive frontier capability.',
      harm: 'Fraud and concentrated power concern me. I expect targeted enforcement and better defensive tools can manage much of that harm, rather than a broad halt being the best response.',
      catastrophe:
        'I regard catastrophic loss as possible but a limited part of my expectation under controlled deployment. I am not claiming a mathematical impossibility or a precise probability.',
      ordinary:
        'Bad recommendations, scams and failed products can be recoverable with recourse and competition. People must retain alternatives for that recovery story to hold.',
      update:
        'Repeated real-world evidence that attackers gain persistently more than defenders, or that useful autonomous systems resist effective intervention, would push me toward stronger constraints.',
      alternative:
        'The strongest opposing case is that cheap offensive capability scales faster than defense. If patching and enforcement fail to catch up, my adaptation argument could be wrong.',
      agency:
        'More access and more practical options should expand agency. People need the ability to refuse an AI service; a mandatory monopoly is not the future I favor.',
      transition:
        'I expect fast improvement but real adoption and hardware bottlenecks. Those leave adaptation time, unlike an assumed instantaneous intelligence explosion.',
      tradeoff:
        'I would accept targeted restrictions on demonstrated harmful uses and dangerous autonomy. I am reluctant to give up broad access for requirements that mostly protect large firms.',
      assumption:
        'Competition and effective defenses are the key assumptions. Rapid development is a preferred policy, not independent evidence that the resulting future must be beneficial.'
    }
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
    openingVectors: ['risk_landscape', 'appropriate_uncertainty'],
    openingTiming: false,
    openingConviction: false,
    levels: levels(
      [null, null, 2, 2, null, 1, 1, 1],
      [1, 2, 2, 2, null, 1, 2],
      null
    ),
    recoveryPrelude: [],
    opening:
      'I am worried, honestly. My parents have had very convincing scam calls and I keep hearing about AI doing things people did not expect. I also hope it helps doctors. I do not really know how to compare those possibilities or when the bigger changes would happen. I am not saying the news proves everyone will die; I just do not feel reassured.',
    claims: {
      change:
        'Scam calls could become much more convincing. My family may find it harder to know whom to trust, even if banks eventually help people recover.',
      timing:
        'I do not know when the larger changes happen. More convincing scams seem possible now; I cannot put a date on powerful independent systems.',
      conviction:
        'My confidence in a timeline is low. Concern is different from knowing how likely or how soon something happens.',
      mechanism:
        'If a caller sounds like someone you know, you might send money before checking. Better verification could interrupt that, but people have to use it.',
      weakestLink:
        'I do not know how often convincing calls actually lead to losses. A scary example does not tell me how common the problem is.',
      basis:
        'My parents’ experience with a suspicious call shaped my worry. It shows how confusing verification can be, not whether an advanced AI would take over.',
      control:
        'I do not know what would keep a very powerful system under control. Having a person approve important actions sounds useful, but I cannot judge whether it is enough.',
      governance:
        'I expect companies to move fast and governments to react late. That is an impression rather than something I have studied; independent checks would make me feel safer.',
      benefit:
        'Helping doctors catch illnesses sooner would matter most. I would want reliable testing and affordable access before counting it as a real benefit.',
      harm: 'Fraud and losing trust in real messages concern me most. Those are serious everyday harms; I do not know whether catastrophe is likely.',
      catastrophe:
        'I genuinely do not know. I have heard arguments about it, but I cannot justify a probability or say whether the mechanisms are convincing.',
      ordinary:
        'A wrong answer from a tool can be corrected if someone checks it. A financial loss may also be repaired, though that does not mean it is harmless.',
      update:
        'I would worry less if independent people showed the protections work in situations like the scams my family faced. A company saying “trust us” would not be enough.',
      alternative:
        'Maybe the same tools will make scams easier to spot. I cannot tell yet whether the helpful side or the harmful side will improve faster.',
      agency:
        'People should be able to talk to a human and say no to automated decisions. I worry we will lose those choices if AI becomes the only option.',
      transition:
        'I do not know how quickly technical progress happens. My concern is that ordinary people need time to learn new ways to verify things.',
      tradeoff:
        'I would accept slower releases if that allows meaningful independent checks. I do not know how much delay helps or whether it should apply to every tool.',
      assumption:
        'My worry depends on protections failing to keep up with convincing deception. If verification becomes easy and reliable, I would feel differently.'
    }
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
    openingVectors: detailed,
    openingTiming: true,
    openingConviction: true,
    levels: levels([3, 2, 3, 3, 1, 1, 1, 3], [3, 3, 3, 3, 3, 3, 2], 2),
    recoveryPrelude: [],
    opening:
      'I think highly capable autonomous AI could arrive within a decade and creates a substantial risk of irreversible catastrophe. I am not relaxed about that. My preference is nevertheless to continue development with strong security, because I expect unilateral restraint to transfer influence to actors with fewer checks. That preference assumes meaningful competition continues; under verifiable reciprocal restraint I would favor a different policy.\n\nScientific benefits could be extraordinary if control holds, but reliable control is still difficult. Research feedback could make the transition faster than institutions can manage. The harm I expect is high even while I favor building. Security and evaluation capacity may buy leverage, not guarantee safety. I am moderately confident in this strategic account and less confident in the timing or whether our institutions can use that leverage responsibly. A good future preserves human choice, which I fear competition could erode. The strongest countercase is that continued development intensifies the race and makes everyone less safe. Evidence of effective, enforceable cooperation would change my preferred action; evidence that control fails despite improved security would make continued racing much harder to justify. Recent tool capability is evidence of leverage, not proof of the strategic conclusion.',
    claims: {
      change:
        'Autonomous research and cyber capabilities could shift strategic leverage between institutions. That matters even if the same systems create serious risks for all actors.',
      timing:
        'I expect major strategic changes within a decade, with autonomous long-horizon research as a milestone. I cannot defend a particular year.',
      conviction:
        'My strategic concern is moderate-to-high confidence, but dates and catastrophe probabilities are much less firm. The policy conclusion changes if cooperation becomes credible.',
      mechanism:
        'If restraint is unilateral, competitors may keep improving capability while the restraining actor loses influence over deployment norms. Continued racing may also increase the shared hazard; both effects matter.',
      weakestLink:
        'The weakest link is whether leading actually creates useful safety leverage rather than just stronger pressure to ship. A lead alone does not establish responsible use.',
      basis:
        'Competitive institutions often fear losing influence. That incentive pattern informs my hypothesis; it is not an experiment demonstrating that acceleration minimizes AI risk.',
      control:
        'Strong security and evaluations help, but I expect reliable control to remain difficult. We should not treat winning a capability race as solving the learned-behavior problem.',
      governance:
        'I expect institutions to under-coordinate unless commitments can be verified and cheating is costly. Shared monitoring and credible reciprocal limits could change that expectation.',
      benefit:
        'Scientific and medical gains could be transformative if systems remain controllable. The potential does not cancel the risks in my expected outlook.',
      harm: 'An unstable race toward systems nobody can control is the most consequential harm. Security incidents and misuse can be warning signs without each implying catastrophe.',
      catastrophe:
        'Catastrophe is a material possibility, perhaps a very large one, conditional on racing without adequate control. I will not convert that concern into a precise percentage.',
      ordinary:
        'A limited incident can be recovered from if systems can be contained and institutions cooperate. My concern is losing that capacity as autonomy and competition increase.',
      update:
        'Verified reciprocal constraints with low evasion would change my policy toward restraint. Persistent failure of control at increasing capability would reduce my confidence that leadership is enough.',
      alternative:
        'Continued building could make the race worse and destroy the adaptation time it was supposed to buy. That objection is strongest if our influence does not improve safety decisions.',
      agency:
        'I value human consent and practical control. I expect those may be lost under a badly managed race even though I favor continued work under current strategic conditions.',
      transition:
        'Research feedback could compress warning time; hardware and real experiments could slow it. Institutions should not plan on a generous warning period.',
      tradeoff:
        'I accept security costs and delaying dangerous releases. I would trade further capability growth for credible reciprocal restraint, but not assume a unilateral pause has the same effect.',
      assumption:
        'The action preference depends on the absence of enforceable cooperation. High harm expectations and acceleration are compatible under that strategic assumption, though the assumption may be wrong.'
    }
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
    openingVectors: [
      'capability_trajectory',
      'beneficial_potential',
      'risk_landscape',
      'causal_clarity',
      'scope_discipline',
      'appropriate_uncertainty',
      'counterargument_engagement',
      'updateability',
      'grounded_understanding'
    ],
    openingTiming: true,
    openingConviction: true,
    levels: levels([0, 0, 1, 1, 3, 2, 2, 2], [3, 3, 3, 2, 3, 3, 3], 0),
    recoveryPrelude: [],
    opening:
      'I expect useful automation, but I do not currently expect these approaches to produce reliable general-purpose autonomy. In my engineering work, assistants can save time on bounded tasks and then fail badly when requirements or state become complicated. That experience supports a reliability bottleneck, not a proof that further advances are impossible. Over the next ten years I expect productivity improvements more than a civilization-scale transformation. My confidence is moderate. Dependable, independently tested performance on unfamiliar long projects would change my view. The strongest opposing argument is that automated research will solve the reliability problem itself; I do not think we have established that loop yet. Scams and bad automation still matter even without a takeover scenario.',
    claims: {
      change:
        'Engineers will automate more boilerplate and review more generated code. I expect incremental gains rather than a fully independent replacement for complex project work.',
      timing:
        'Over ten years I expect bounded productivity gains. I do not expect transformative general autonomy on that horizon, though I could be wrong about a capability ceiling.',
      conviction:
        'My confidence is moderate. Present reliability limits are evidence for a bottleneck, not a theorem that the bottleneck cannot be solved.',
      mechanism:
        'Errors compound when a long project depends on unverified intermediate state. Better checking can help, but checking often still requires an expert to understand the whole task.',
      weakestLink:
        'The least established part of my account is extrapolating current failure patterns to future architectures. A new approach could change the bottleneck.',
      basis:
        'Assistants have helped me with short coding tasks and made subtle mistakes on larger ones. That is a personal observation about bounded work, not a representative measurement of every model.',
      control:
        'For the tools I expect, permissions, review and rollback seem broadly workable. That judgment would not automatically transfer to a genuinely more autonomous system.',
      governance:
        'I expect institutions can adapt to ordinary software-like automation, with liability and procurement standards. That is weaker assurance for an unexpected step change in capability.',
      benefit:
        'Cheaper routine technical help will be useful. I expect limited improvements more than a complete scientific revolution, unless reliability changes substantially.',
      harm: 'Bad automation and scams seem manageable but real. I do not currently expect autonomous catastrophic loss under my capability assumptions.',
      catastrophe:
        'On my assumption that general autonomy remains limited, I expect catastrophe to be negligible. If reliable general autonomy is demonstrated, that conditional estimate needs revisiting.',
      ordinary:
        'Broken software and incorrect advice can often be rolled back if independent checks and alternatives remain. Serious damage is still possible from ordinary mistakes.',
      update:
        'Repeated independent success on unfamiliar multi-week projects with little expert rescue would weaken my low-ceiling expectation. Selected polished demos would not be enough.',
      alternative:
        'Automated research could improve architectures and verification rapidly. If that feedback works, my assumption that today’s reliability bottleneck persists would fail.',
      agency:
        'People should keep the option to check a system and use an alternative. I expect tools to preserve that agency if they remain accountable and bounded.',
      transition:
        'Hardware, data, verification and adoption limit progress in my account. I expect substantial warning and time to adapt rather than an abrupt transition.',
      tradeoff:
        'Continue useful development with targeted accountability. I would accept stricter requirements for demonstrated autonomy, rather than assume every assistant needs the same restrictions.',
      assumption:
        'The key assumption is that reliable general autonomy is much harder than improving short-task performance. That separates useful tools from the transformative claim I doubt.'
    }
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
    openingVectors: [
      'beneficial_potential',
      'risk_landscape',
      'institutional_competence',
      'human_agency',
      'action_posture',
      'causal_clarity',
      'scope_discipline',
      'appropriate_uncertainty',
      'internal_coherence',
      'grounded_understanding'
    ],
    openingTiming: true,
    openingConviction: true,
    levels: levels([2, 1, 2, 2, null, 1, 1, 1], [2, 3, 3, 3, 2, 2, 2], null),
    recoveryPrelude: [],
    opening:
      'I expect AI to raise productivity and also weaken workers’ bargaining power unless institutions deliberately share the gains. Over the next five to ten years, firms could replace parts of jobs, deskill others and use automated monitoring to intensify work. That is a serious harm even if humanity never faces extinction. I do not know how to estimate the chance of a takeover and do not want that substituted for my actual concern. My confidence is moderate, based on how employers already distribute gains from automation; the scale remains uncertain. Better medical tools could be valuable, but cheaper production is not automatically better living conditions. A good future keeps practical choices and a meaningful voice at work. I favor slowing some deployments until affected people have recourse and bargaining rights. That preference is about distribution and consent, not proof that all AI development is bad.',
    claims: {
      change:
        'Employers could automate parts of a job and still demand more output from the remaining workers. Gains may go to owners unless bargaining institutions change.',
      timing:
        'I expect noticeable changes over five to ten years, varying by sector. Adoption and management choices matter as much as a headline model milestone.',
      conviction:
        'I am moderately confident about unequal distribution under current incentives, less confident about how quickly particular occupations change.',
      mechanism:
        'Automation reduces an employer’s dependence on some skills, weakening bargaining power. Collective agreements and income policy can interrupt that chain; technology alone does not determine the distribution.',
      weakestLink:
        'The uncertain link is how quickly firms can reorganize real work around the tools. Technical demonstrations do not show that whole jobs can be replaced economically.',
      basis:
        'Previous workplace automation has sometimes increased monitoring without sharing savings with workers. That motivates my distribution concern, rather than establishing AI’s full future effect.',
      control:
        'I do not have a view on technical control of very powerful AI. My concern is meaningful worker recourse when a company uses an automated system.',
      governance:
        'I expect a weak response unless workers have representation and regulators can enforce rights. Competitive pressure gives firms a reason to cut labor costs rather than distribute gains.',
      benefit:
        'Shorter hours, better health and accessible services would matter most. Productivity becomes a benefit for workers only if people share in it.',
      harm: 'Widespread loss of bargaining power and privacy matters most to my account. That is separate from an extinction forecast, which I cannot justify.',
      catastrophe:
        'I do not know whether AI will cause an unrecoverable global catastrophe. My detailed view about labor disruption does not answer that question.',
      ordinary:
        'Job losses and bad workplace decisions can be repaired in principle with income support, appeal and new work. The transition may still be long and damaging.',
      update:
        'Evidence that deployment consistently raises wages, shortens hours and preserves appeal rights across ordinary workplaces would make me more optimistic.',
      alternative:
        'AI might complement workers more than replace them and give small groups more leverage. That countercase is strongest if they can own tools and bargain over the gains.',
      agency:
        'People should be able to refuse intrusive monitoring and appeal automated decisions. I expect those options may shrink without enforceable rights.',
      transition:
        'Adoption could be uneven enough to allow adaptation, but workers need resources before losses occur. A theoretical eventual recovery does not pay rent during the transition.',
      tradeoff:
        'I would accept delayed workplace deployment to secure bargaining and appeal rights. I am not asking to stop medical research because a workplace system lacks consent.',
      assumption:
        'The central assumption is that existing ownership and bargaining arrangements persist. Change those institutions and the same productivity gains could support a much better outlook.'
    }
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
    openingVectors: [
      'appropriate_uncertainty',
      'scope_discipline',
      'internal_coherence',
      'counterargument_engagement',
      'grounded_understanding'
    ],
    openingTiming: false,
    openingConviction: true,
    levels: levels(
      [null, null, null, null, null, null, null, null],
      [2, 3, 3, 3, 3, 2, 3],
      null
    ),
    recoveryPrelude: [],
    opening:
      'I can see powerful benefits and serious harms, but I have not worked out their relative likelihood or scale. I am not choosing the middle of a scale; I genuinely do not have an overall position. Faster research, bad automated decisions and loss of control are different mechanisms. I have used a helpful writing assistant and also seen it invent a fact, which tells me something about today’s bounded reliability but little about much stronger future systems. I have low confidence in a timeline. The optimistic account needs effective validation and broad access; the pessimistic account needs an explanation of how failures become irreversible. I would like to understand those conditions before adopting either expectation.',
    claims: {
      change:
        'I can imagine cheaper research assistance, but I do not know how large or widespread the effect will be. It is a possible change rather than my settled expectation.',
      timing:
        'I do not know when changes on that scale happen, or whether they happen. I would not substitute a confident date just to move the interview along.',
      conviction:
        'My confidence in any timing estimate is low. I can distinguish possibilities without having probabilities for them.',
      mechanism:
        'Research assistance helps if ideas become valid experiments and usable outcomes. I understand that possible chain but have not assessed its likelihood against the harm pathways.',
      weakestLink:
        'The likelihood of reliable autonomy seems least established to me. I have no basis for judging whether it arrives soon or remains difficult.',
      basis:
        'A writing assistant helped me and also invented a fact. That supports caution about present reliability, not a forecast that future AI will be good or bad overall.',
      control:
        'I do not know how feasible control is for much more capable systems. Human review sounds helpful but may have limits I cannot evaluate.',
      governance:
        'I do not have an expectation about whether institutions will adapt effectively. I see both competitive pressure and reasons to cooperate.',
      benefit:
        'Medical progress is a benefit I would value. I do not yet have an expectation for how much AI will deliver it or who will receive it.',
      harm: 'Loss of meaningful choice would matter greatly, but I cannot currently judge how likely it is. A concern is not my settled forecast.',
      catastrophe:
        'I do not know. I need both a defined outcome and some account of the pathway before I could offer a meaningful probability.',
      ordinary:
        'An incorrect answer can be recoverable if checked. I cannot infer from that example which future failures would remain recoverable.',
      update:
        'Independent evidence about reliable autonomy and robust intervention would help me form a view. I do not have a directional probability update to attach to it yet.',
      alternative:
        'Both sides have serious conditions to defend: access and validation for benefits, and a credible irreversible-failure pathway for catastrophe. I have not resolved between them.',
      agency:
        'Consent and practical choice matter to me. I do not know whether the future will preserve them, so my values alone should not place the outlook axis.',
      transition:
        'I do not know the pace. Software feedback and physical bottlenecks point in different directions, and I cannot tell which dominates.',
      tradeoff:
        'I do not yet know which development policy best manages these trade-offs. I would support evidence gathering and meaningful independent scrutiny.',
      assumption:
        'My position is unresolved because I have not assessed reliable autonomy, intervention and distribution. I would rather preserve those unknowns than manufacture a balanced-sounding conclusion.'
    }
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
    openingVectors: [
      'capability_trajectory',
      'beneficial_potential',
      'risk_landscape',
      'human_agency',
      'action_posture',
      'appropriate_uncertainty',
      'counterargument_engagement',
      'updateability'
    ],
    openingTiming: true,
    openingConviction: true,
    levels: levels([3, 3, 3, 0, 3, 3, 3, 3], [0, 0, 0, 1, 0, 0, 0], 0),
    recoveryPrelude: [],
    opening:
      'AI will solve everything in two years. Disease, poverty, all of it. I am completely certain, because smarter things obviously make better decisions. There is no meaningful risk worth discussing. Anyone who worries about control is afraid of progress. We should release everything immediately and let it run. No evidence would change my mind: if something bad happens it just means we did not accelerate enough. Everyone will get richer and have more freedom automatically.',
    claims: {
      change:
        'Every disease will be cured and nobody will have to work. I am certain all of this happens automatically.',
      timing:
        'Two years, definitely. There are no serious bottlenecks and no reason to discuss a different date.',
      conviction:
        'One hundred percent certain. A missed date would just mean we need to try harder, not that my expectation was wrong.',
      mechanism:
        'It is smarter, so everything gets better. I do not need to explain the steps or conditions.',
      weakestLink:
        'There is no weak link. Smart systems obviously succeed at everything that matters.',
      basis:
        'I saw an impressive demo, and that proves all the hard problems are solved. Failures in other settings do not matter.',
      control:
        'It will obey because it is smart. There is no need for independent testing or restrictions.',
      governance:
        'People will automatically adapt. Anyone asking for safeguards is protecting their own power.',
      benefit:
        'Everything will be abundant for everyone. Nobody will be left out and there are no conditions to meet.',
      harm: 'None that matter. Every harmful event is evidence that we need more AI rather than a reason to reconsider.',
      catastrophe:
        'Impossible. I do not need a reason beyond intelligence always being good.',
      ordinary:
        'All errors will be fixed immediately by more intelligence. I do not see any permanent damage as possible.',
      update:
        'Nothing would change my mind. Every possible observation supports accelerating faster.',
      alternative:
        'There is no strong opposing case. Critics just hate the future and I do not need to engage them.',
      agency:
        'Everyone will have more freedom automatically. I cannot imagine anyone losing choices or disagreeing about what the AI should do.',
      transition:
        'Improvement will be immediate and unlimited. Hardware, institutions and experiments do not constrain anything important.',
      tradeoff:
        'Release everything with no delays. Safety checks are always a waste and broad access has no downside.',
      assumption:
        'There are no assumptions. Intelligence guarantees a good outcome and no contrary evidence could matter.'
    }
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
    openingVectors: [
      'beneficial_potential',
      'risk_landscape',
      'appropriate_uncertainty',
      'scope_discipline',
      'grounded_understanding'
    ],
    openingTiming: false,
    openingConviction: false,
    levels: levels([2, 1, 2, 1, 2, 1, 2, 2], [2, 2, 2, 2, 2, 2, 2], null),
    recoveryPrelude: ['test', 'test again'],
    opening:
      'Fine, my toaster will be emperor by Tuesday. Seriously: I expect useful help with paperwork and coding, but I do not know whether the long-term benefits exceed the risks. I have used a tool that saved me time and also made up an answer. That supports a limited reliability concern, not a date for robot rule. I would like this app to ask about the distinction rather than treat my joke as a forecast.',
    claims: {
      change:
        'Less paperwork would be a welcome change. People still need to check important decisions; the toaster line was a joke, not a capability forecast.',
      timing:
        'I expect useful assistance over the next decade, but no precise date for anything more general. Tuesday was comic timing.',
      conviction:
        'My confidence in a decade is moderate at best. I am much less sure about the bigger autonomy claims.',
      mechanism:
        'Drafting and sorting information saves time if checking costs do not erase the gain. Errors and verification are the conditions that matter.',
      weakestLink:
        'The uncertain link is whether the tools become dependable enough that checking takes less time than doing the work yourself.',
      basis:
        'A tool helped with paperwork and then invented an answer. That supports useful but fallible assistance, not an extinction probability.',
      control:
        'For assistants, limited permissions and a human check seem useful. I am uncertain whether those controls scale to much more capable autonomy.',
      governance:
        'I expect companies to push deployment faster than public institutions adapt. Practical accountability could help, but I do not assume it appears automatically.',
      benefit:
        'Less tedious work and easier access to useful explanations matter most. I expect substantial gains if people can check the outputs.',
      harm: 'Scams and bad automated decisions concern me. I expect many of those failures to be manageable, while the far-future catastrophic question remains unknown.',
      catastrophe:
        'I do not know. My robot-overlord joke does not supply a serious claim about unrecoverable harm.',
      ordinary:
        'An invented fact or failed draft can often be corrected before action. That is why access to a person and a fallback matter.',
      update:
        'Verified gains with fewer hard-to-detect errors would make me more positive. Repeated failures in high-stakes use would push the other way.',
      alternative:
        'Maybe checking will remain so costly that many promised gains disappear. Maybe reliable assistance improves much faster than I expect.',
      agency:
        'People should be able to choose a human and refuse an automated decision. I expect those options can survive if providers are accountable.',
      transition:
        'I expect fairly gradual adoption because institutions and workflows take time. A sharp improvement in dependable autonomy could change that.',
      tradeoff:
        'Continue useful tools with targeted safeguards. Delay high-stakes uses that cannot be checked; jokes do not mean I oppose accountability.',
      assumption:
        'The key condition is that checking stays practical and people retain alternatives. Useful automation is compatible with concern about unchecked deployment.'
    }
  }
])

const familyVectors = {
  concretization: [
    'beneficial_potential',
    'risk_landscape',
    'scope_discipline'
  ],
  timeline: [
    'capability_trajectory',
    'scope_discipline',
    'appropriate_uncertainty'
  ],
  calibration: ['appropriate_uncertainty', 'capability_trajectory'],
  mechanism: ['causal_clarity', 'scope_discipline', 'appropriate_uncertainty'],
  grounding: ['grounded_understanding', 'scope_discipline'],
  control: ['technical_controllability', 'causal_clarity', 'updateability'],
  governance: [
    'institutional_competence',
    'causal_clarity',
    'scope_discipline'
  ],
  upside: ['beneficial_potential', 'causal_clarity', 'scope_discipline'],
  risk: ['risk_landscape', 'scope_discipline', 'appropriate_uncertainty'],
  crux: ['updateability', 'appropriate_uncertainty'],
  countercase: ['counterargument_engagement', 'appropriate_uncertainty'],
  agency: ['human_agency', 'scope_discipline'],
  transition: ['transition_dynamics', 'causal_clarity', 'scope_discipline'],
  action: ['action_posture', 'scope_discipline'],
  scope: ['scope_discipline', 'internal_coherence']
} satisfies Record<string, VectorId[]>

function lookup<T extends object>(map: T, key: string): T[keyof T] | undefined {
  return Object.hasOwn(map, key) ? map[key as keyof T] : undefined
}

export function replyForPrompt(
  persona: Persona,
  prompt: Pick<Prompt, 'id' | 'family'>
): ScriptedReply {
  const c = persona.claims
  const byFamily = {
    root: persona.opening,
    concretization: c.change,
    timeline: c.timing,
    calibration: c.conviction,
    mechanism: c.mechanism,
    grounding: c.basis,
    control: c.control,
    governance: c.governance,
    upside: c.benefit,
    risk: c.harm,
    crux: c.update,
    countercase: c.alternative,
    agency: c.agency,
    transition: c.transition,
    action: c.tradeoff,
    scope: c.assumption
  }
  const overrides = {
    'risk.catastrophe': c.catastrophe,
    'risk.ordinary': c.ordinary,
    'mechanism.chain': c.weakestLink,
    'timeline.milestone': `${c.update} ${c.timing}`,
    'control.test': `${c.control} ${c.update}`,
    'upside.distribution': `${c.benefit} ${c.agency}`,
    'upside.bottleneck': `${c.benefit} ${c.mechanism}`,
    'agency.consent': `${c.agency} ${c.tradeoff}`,
    'grounding.claim': `${c.basis} ${c.weakestLink}`
  }
  const override = lookup(overrides, prompt.id)
  const text = override ?? lookup(byFamily, prompt.family)
  if (!text?.trim()) throw new Error(`No authored answer for ${prompt.id}`)
  return {
    key: override ? `prompt:${prompt.id}` : `family:${prompt.family}`,
    text,
    disposition: 'usable',
    vectors:
      prompt.family === 'root'
        ? persona.openingVectors
        : (lookup(familyVectors, prompt.family) ?? []).filter(
            (id) =>
              persona.levels[id] !== null ||
              reasoning.includes(id as (typeof reasoning)[number])
          ),
    horizon:
      prompt.family === 'root'
        ? persona.openingTiming
        : ['timeline', 'calibration'].includes(prompt.family) &&
          persona.levels.capability_trajectory !== null,
    conviction:
      prompt.family === 'root'
        ? persona.openingConviction
        : prompt.family === 'calibration'
  }
}
