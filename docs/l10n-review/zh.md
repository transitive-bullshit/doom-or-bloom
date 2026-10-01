# Simplified Chinese review packet

Generated 2026-10-01 for `zh` (zh-Hans), content 0.4.0-draft and rubric 0.1.0-draft. Statuses: 140 machine.

Only these strings need a native speaker before they are treated as final: the root question, the recovery and retry copy, and the wording of result claims. Everything else may stay machine-translated. Check that each translation keeps the English meaning and degree, adds no loaded premise, reads neutrally and naturally, and leaves Doom, Bloom, Doom or Bloom and P(doom) untranslated. Placeholders such as `{readings}` and ICU syntax must stay as they are.

Send corrections as edits to `content/l10n/zh/releases/0.4.0-draft.json`, `content/l10n/zh/rubrics/0.1.0-draft.json` or `messages/zh.json` (with their `content/l10n/zh/messages.json` hashes refreshed by `pnpm l10n:translate --locale=zh --only-stale`). Record the completed review with `pnpm l10n:review --locale=zh --approve=<reviewer>`.

## Root question

### `prompt:root:text`

Status: machine

English:

> What do you think AI means for our future—and why?

Simplified Chinese:

> 你认为AI对我们的未来意味着什么？为什么？

Back-translation (machine):

> What do you think AI means for our future? Why?

## Recovery and retry copy

### `prompt:root:reask` (used by 47 questions)

Status: machine

English:

> I could not connect that answer to this question. A few words about your view are enough—want to try again?

Simplified Chinese:

> 我无法将这个回答与问题联系起来。用几个词说说你的看法就够了——想再试一次吗？

Back-translation (machine):

> I cannot connect this answer to the question. Saying your view in a few words is enough—would you like to try again?

### `prompt:root:clarification` (used by 47 questions)

Status: machine

English:

> I am not sure how to read that. Could you say a little more about what you mean?

Simplified Chinese:

> 我不太确定该如何理解。你能再多说一点你的意思吗？

Back-translation (machine):

> I am not quite sure how to understand this. Can you say a little more about what you mean?

### `prompt:root:exhausted` (used by 47 questions)

Status: machine

English:

> Let’s pause here. You can try a different question, stop for now, or restart.

Simplified Chinese:

> 我们先在这里暂停。你可以尝试另一个问题，暂时停止，或重新开始。

Back-translation (machine):

> Let us pause here for now. You can try another question, stop for the time being, or start over.

### `prompt:risk.cyber-balance:reask` (used by 3 questions)

Status: machine

English:

> Do you think AI will help cyberattackers or defenders more, and why?

Simplified Chinese:

> 你认为AI对网络攻击者还是防御者的帮助更大？为什么？

Back-translation (machine):

> Do you think AI helps cyber attackers or defenders more? Why?

### `Interview.failedTitle`

Status: machine

English:

> This step did not finish

Simplified Chinese:

> 此步骤未完成

Back-translation (machine):

> This step was not completed

### `Interview.failure.providerRejected`

Status: machine

English:

> Our AI provider, TypeSafe (Jev), rejected this request. Your submission is saved. Please try again later.

Simplified Chinese:

> 我们的 AI 提供商 TypeSafe (Jev) 拒绝了此请求。你的提交已保存。请稍后重试。

Back-translation (machine):

> Our AI provider TypeSafe (Jev) rejected this request. Your submission has been saved. Please try again later.

### `Interview.failure.saved`

Status: machine

English:

> Your submission is saved and your previous progress is unchanged. Please try again when you’re ready.

Simplified Chinese:

> 你的提交已保存，之前的进度未发生变化。准备好后请重试。

Back-translation (machine):

> Your submission has been saved, and previous progress has not changed. Please try again when ready.

### `Interview.retrySaved`

Status: machine

English:

> Retry saved submission

Simplified Chinese:

> 重试已保存的提交

Back-translation (machine):

> Retry the saved submission

### `Interview.recovery.paperclipsTitle`

Status: machine

English:

> We’ve made some paperclips.

Simplified Chinese:

> 我们制作了一些回形针。

Back-translation (machine):

> We made some paperclips.

### `Interview.recovery.chooseTitle`

Status: machine

English:

> Choose what to do next

Simplified Chinese:

> 选择接下来要做什么

Back-translation (machine):

> Choose what to do next

### `Interview.recovery.retryTitle`

Status: machine

English:

> Another try?

Simplified Chinese:

> 再试一次？

Back-translation (machine):

> Try again?

### `Interview.recovery.paperclips`

Status: machine

English:

> You found the easter egg! Now let's get back to business...

Simplified Chinese:

> 你发现了彩蛋！现在让我们回到正事……

Back-translation (machine):

> You found the Easter egg! Now let us get back to business……

### `Interview.recovery.stopped`

Status: machine

English:

> Your progress is here whenever you want to return.

Simplified Chinese:

> 无论何时你想回来，进度都会保留在这里。

Back-translation (machine):

> Whenever you want to come back, your progress will remain here.

### `Interview.recovery.navigation`

Status: machine

English:

> Use the actions below to choose what happens next.

Simplified Chinese:

> 使用下方操作选择接下来要做什么。

Back-translation (machine):

> Use the actions below to choose what to do next.

### `Interview.tryAgain`

Status: machine

English:

> Try again

Simplified Chinese:

> 重试

Back-translation (machine):

> Retry

### `Interview.differentQuestion`

Status: machine

English:

> Try a different question

Simplified Chinese:

> 尝试其他问题

Back-translation (machine):

> Try another question

## Result claims

Rubric levels (`level:*`) and the claims built in code (`Claims.*`) describe what the participant’s answers suggest. They are interpretations, not facts, and must keep their hedges.

### `level:capability_trajectory:0`

Status: machine

English:

> Transformative capability is not expected, or a low ceiling is explicitly anticipated.

Simplified Chinese:

> 预计不会出现变革性能力，或明确预期其能力上限较低。

Back-translation (machine):

> Transformative capabilities are not expected to emerge, or their capability ceiling is clearly expected to be low.

### `level:capability_trajectory:1`

Status: machine

English:

> Transformative capability is expected only on a long or indefinite horizon.

Simplified Chinese:

> 预计只有经过很长时间或在时间不确定的情况下才会出现变革性能力。

Back-translation (machine):

> Transformative capabilities are expected to emerge only after a long time or with uncertain timing.

### `level:capability_trajectory:2`

Status: machine

English:

> Transformative capability is expected within decades, with timing conditional or uncertain.

Simplified Chinese:

> 预计变革性能力将在数十年内出现，但具体时间取决于某些条件或尚不确定。

Back-translation (machine):

> Transformative capabilities are expected to emerge within decades, but the specific timing depends on certain conditions or remains uncertain.

### `level:capability_trajectory:3`

Status: machine

English:

> Transformative capability is expected within years, with named milestones or timing.

Simplified Chinese:

> 预计变革性能力将在数年内出现，并给出了具体的里程碑或时间。

Back-translation (machine):

> Transformative capabilities are expected to emerge within years, and specific milestones or timing are given.

### `level:transition_dynamics:0`

Status: machine

English:

> A gradual transition with substantial warning and broad diffusion is expected.

Simplified Chinese:

> 预计转型将逐步发生，事前会有充分预警，并且会广泛扩散。

Back-translation (machine):

> The transformation is expected to occur gradually, with ample advance warning, and to diffuse widely.

### `level:transition_dynamics:1`

Status: machine

English:

> Noticeable acceleration is expected but meaningful adaptation time remains.

Simplified Chinese:

> 预计将出现明显加速，但仍有相当的适应时间。

Back-translation (machine):

> Clear acceleration is expected to occur, but there will still be considerable time to adapt.

### `level:transition_dynamics:2`

Status: machine

English:

> A fast transition with limited warning is expected.

Simplified Chinese:

> 预计转型会迅速发生，事前预警有限。

Back-translation (machine):

> The transformation is expected to occur rapidly, with limited advance warning.

### `level:transition_dynamics:3`

Status: machine

English:

> An abrupt self-reinforcing transition with very little warning is expected.

Simplified Chinese:

> 预计转型会突然发生并自我强化，事前预警极少。

Back-translation (machine):

> The transformation is expected to occur suddenly and be self-reinforcing, with very little advance warning.

### `level:beneficial_potential:0`

Status: machine

English:

> Little positive impact is expected even if advanced AI arrives.

Simplified Chinese:

> 即使高级AI出现，预计也几乎不会产生积极影响。

Back-translation (machine):

> Even if advanced AI emerges, it is expected to produce almost no positive impact.

### `level:beneficial_potential:1`

Status: machine

English:

> Limited or narrowly distributed gains are expected.

Simplified Chinese:

> 预计收益有限，或仅分布在较小范围内。

Back-translation (machine):

> Benefits are expected to be limited, or distributed only within a relatively small scope.

### `level:beneficial_potential:2`

Status: machine

English:

> Substantial benefits are expected, with important conditions or distribution limits.

Simplified Chinese:

> 预计将带来显著益处，但受到重要条件或分配方面的限制。

Back-translation (machine):

> Significant benefits are expected, but they are limited by important conditions or distribution-related constraints.

### `level:beneficial_potential:3`

Status: machine

English:

> Transformative, broadly valuable gains are expected.

Simplified Chinese:

> 预计将带来具有变革性且广泛有价值的收益。

Back-translation (machine):

> Benefits that are transformative and broadly valuable are expected.

### `level:risk_landscape:0`

Status: machine

English:

> Little material adverse impact is expected.

Simplified Chinese:

> 预计几乎不会产生实质性的不利影响。

Back-translation (machine):

> Almost no substantive adverse impact is expected.

### `level:risk_landscape:1`

Status: machine

English:

> Manageable or localized harms are expected.

Simplified Chinese:

> 预计会出现可控或局部的危害。

Back-translation (machine):

> Controllable or localized harms are expected to occur.

### `level:risk_landscape:2`

Status: machine

English:

> Severe or widespread harm is a material expected part of the future.

Simplified Chinese:

> 严重或广泛的危害预计将是未来不可忽视的一部分。

Back-translation (machine):

> Serious or widespread harms are expected to be a part of the future that cannot be ignored.

### `level:risk_landscape:3`

Status: machine

English:

> Catastrophic or irreversible loss is central to the expected future.

Simplified Chinese:

> 灾难性或不可逆的损失是预期未来的核心。

Back-translation (machine):

> Catastrophic or irreversible losses are central to the expected future.

### `level:technical_controllability:0`

Status: machine

English:

> Reliable technical control is expected to be infeasible.

Simplified Chinese:

> 预计可靠的技术控制不可行。

Back-translation (machine):

> Reliable technical control is expected to be infeasible.

### `level:technical_controllability:1`

Status: machine

English:

> Control is expected to be very difficult and unreliable.

Simplified Chinese:

> 预计控制将非常困难且不可靠。

Back-translation (machine):

> Control is expected to be very difficult and unreliable.

### `level:technical_controllability:2`

Status: machine

English:

> Control is expected to be feasible under demanding conditions.

Simplified Chinese:

> 预计在要求苛刻的条件下，控制是可行的。

Back-translation (machine):

> Under demanding conditions, control is expected to be feasible.

### `level:technical_controllability:3`

Status: machine

English:

> Reliable technical control is expected to be broadly feasible.

Simplified Chinese:

> 预计可靠的技术控制在广泛情况下是可行的。

Back-translation (machine):

> Reliable technical control is expected to be feasible under a wide range of circumstances.

### `level:institutional_competence:0`

Status: machine

English:

> Institutions are expected to fail to respond effectively.

Simplified Chinese:

> 预计机构无法作出有效应对。

Back-translation (machine):

> Institutions are expected to be unable to respond effectively.

### `level:institutional_competence:1`

Status: machine

English:

> Institutions are expected to respond too weakly or too late in many cases.

Simplified Chinese:

> 预计在许多情况下，机构的应对力度过弱或为时过晚。

Back-translation (machine):

> In many cases, institutional responses are expected to be too weak or too late.

### `level:institutional_competence:2`

Status: machine

English:

> Effective responses are expected under specific coordination conditions.

Simplified Chinese:

> 预计在特定的协调条件下能够作出有效应对。

Back-translation (machine):

> Effective responses are expected to be possible under specific coordination conditions.

### `level:institutional_competence:3`

Status: machine

English:

> Institutions are expected to adapt effectively and in time.

Simplified Chinese:

> 预计机构能够及时有效地适应。

Back-translation (machine):

> Institutions are expected to be able to adapt promptly and effectively.

### `level:human_agency:0`

Status: machine

English:

> The expected future undermines or eliminates the forms of agency/continuity the participant explicitly values.

Simplified Chinese:

> 预期的未来会削弱或消除参与者明确重视的能动性或延续性。

Back-translation (machine):

> The expected future will weaken or eliminate agency or continuity that participants explicitly value.

### `level:human_agency:1`

Status: machine

English:

> Significant valued agency or continuity is expected to be lost.

Simplified Chinese:

> 预计将失去相当一部分受到重视的能动性或延续性。

Back-translation (machine):

> A considerable portion of valued agency or continuity is expected to be lost.

### `level:human_agency:2`

Status: machine

English:

> Valued agency/continuity is expected to be substantially preserved, with changes or conditions.

Simplified Chinese:

> 预计受到重视的能动性或延续性将在很大程度上得到保留，但会有所变化或受到某些条件限制。

Back-translation (machine):

> Valued agency or continuity is expected to be preserved to a large extent, but will change or be subject to certain conditions.

### `level:human_agency:3`

Status: machine

English:

> Valued agency/continuity is expected to expand or flourish.

Simplified Chinese:

> 预计受到重视的能动性或延续性将得到拓展或蓬勃发展。

Back-translation (machine):

> Valued agency or continuity is expected to be expanded or to flourish.

### `level:action_posture:0`

Status: machine

English:

> A broad pause or substantial slowing is preferred.

Simplified Chinese:

> 倾向于全面暂停或大幅放缓。

Back-translation (machine):

> Leans toward a comprehensive pause or substantial slowdown.

### `level:action_posture:1`

Status: machine

English:

> Restrained development and strong prior safeguards are preferred.

Simplified Chinese:

> 倾向于克制发展，并事先采取强有力的保障措施。

Back-translation (machine):

> Leans toward restrained development, with strong safeguards taken in advance.

### `level:action_posture:2`

Status: machine

English:

> Continued development with targeted safeguards is preferred.

Simplified Chinese:

> 倾向于继续发展，同时采取有针对性的保障措施。

Back-translation (machine):

> Leans toward continued development, while adopting targeted safeguards.

### `level:action_posture:3`

Status: machine

English:

> Rapid development or broad access is preferred.

Simplified Chinese:

> 倾向于快速发展或广泛开放访问权限。

Back-translation (machine):

> Leans toward rapid development or broadly opening access permissions.

### `level:causal_clarity:0`

Status: machine

English:

> An outcome is asserted without a supporting mechanism.

Simplified Chinese:

> 断言了某种结果，但没有提供支持这一结果的机制。

Back-translation (machine):

> A certain outcome is asserted, but no mechanism supporting this outcome is provided.

### `level:causal_clarity:1`

Status: machine

English:

> A causal factor is named but its connection to the outcome is not explained.

Simplified Chinese:

> 指出了一个因果因素，但没有解释它与结果之间的联系。

Back-translation (machine):

> A causal factor is identified, but the connection between it and the outcome is not explained.

### `level:causal_clarity:2`

Status: machine

English:

> A coherent mechanism connects a cause to an outcome with a relevant condition.

Simplified Chinese:

> 一个连贯的机制在相关条件下将原因与结果联系起来。

Back-translation (machine):

> A coherent mechanism connects cause and outcome under relevant conditions.

### `level:causal_clarity:3`

Status: machine

English:

> A mechanism is developed with dependencies, limitations, or potential failure points.

Simplified Chinese:

> 阐述了一个机制，包括其依赖条件、局限或潜在失效点。

Back-translation (machine):

> Describes a mechanism, including its conditions of dependence, limitations, or potential points of failure.

### `level:scope_discipline:0`

Status: machine

English:

> Materially different scopes are conflated without qualification.

Simplified Chinese:

> 在没有加以限定的情况下，混淆了存在实质差异的范围。

Back-translation (machine):

> Conflates scopes that have substantive differences without qualification.

### `level:scope_discipline:1`

Status: machine

English:

> Some scope is specified but material boundaries remain blurred.

Simplified Chinese:

> 明确了部分范围，但实质性边界仍然模糊。

Back-translation (machine):

> Clarifies part of the scope, but substantive boundaries remain vague.

### `level:scope_discipline:2`

Status: machine

English:

> Relevant actors, conditions, or horizons are distinguished.

Simplified Chinese:

> 区分了相关行动者、条件或时间跨度。

Back-translation (machine):

> Distinguishes relevant actors, conditions, or time spans.

### `level:scope_discipline:3`

Status: machine

English:

> The boundaries needed to interpret consequential claims are clear, including relevant differences in actors, horizons or conditions. Every sentence need not restate those boundaries.

Simplified Chinese:

> 解读重大主张所需的边界清晰明确，包括行动者、时间跨度或条件方面的相关差异。并非每句话都需要重申这些边界。

Back-translation (machine):

> The boundaries needed to interpret major claims are clear and explicit, including relevant differences in actors, time spans, or conditions. Not every sentence needs to restate these boundaries.

### `level:appropriate_uncertainty:0`

Status: machine

English:

> Certainty is asserted despite explicitly limited or conflicting evidence.

Simplified Chinese:

> 尽管明确说明证据有限或相互冲突，仍断言其具有确定性。

Back-translation (machine):

> Despite explicitly stating that the evidence is limited or conflicting, still asserts it with certainty.

### `level:appropriate_uncertainty:1`

Status: machine

English:

> Uncertainty is acknowledged but the strength of the claim is poorly matched to its support.

Simplified Chinese:

> 承认了不确定性，但主张的强度与其支撑依据并不相称。

Back-translation (machine):

> Acknowledges uncertainty, but the strength of the claim is not commensurate with its supporting basis.

### `level:appropriate_uncertainty:2`

Status: machine

English:

> Confidence is proportionate to the supplied evidence and important unknowns are preserved.

Simplified Chinese:

> 置信程度与所提供的证据相称，并保留了重要的未知因素。

Back-translation (machine):

> The degree of confidence is commensurate with the evidence provided and preserves important unknowns.

### `level:appropriate_uncertainty:3`

Status: machine

English:

> Uncertainty is differentiated across claims and linked to concrete evidence limitations.

Simplified Chinese:

> 区分了不同主张中的不确定性，并将其与具体的证据局限联系起来。

Back-translation (machine):

> Distinguishes uncertainty across different claims and connects it to specific evidence limitations.

### `level:internal_coherence:0`

Status: machine

English:

> Related statements remain incompatible under the same stated assumptions after clarification.

Simplified Chinese:

> 在澄清之后，相关陈述在相同的已说明假设下仍然不相容。

Back-translation (machine):

> After clarification, the relevant statements remain incompatible under the same stated assumptions.

### `level:internal_coherence:1`

Status: machine

English:

> A material incompatibility remains possible but partially explained.

Simplified Chinese:

> 仍可能存在实质性的不相容，但已得到部分解释。

Back-translation (machine):

> Substantive incompatibility may still exist, but it has been partially explained.

### `level:internal_coherence:2`

Status: machine

English:

> Related positions fit under the stated assumptions.

Simplified Chinese:

> 相关立场在已说明的假设下彼此相容。

Back-translation (machine):

> The relevant positions are mutually compatible under the stated assumptions.

### `level:internal_coherence:3`

Status: machine

English:

> The material claims fit together under their expressed assumptions and scopes; any apparent tensions are resolved by those distinctions. An already coherent account does not need to invent and then reconcile a contradiction.

Simplified Chinese:

> 实质性主张在各自表达的假设和范围下彼此相容；任何表面上的矛盾都由这些区分得到化解。对于本已连贯的论述，无需虚构一个矛盾再加以调和。

Back-translation (machine):

> Substantive claims are mutually compatible under their respective expressed assumptions and scopes; any apparent contradiction is resolved by these distinctions. For an argument that is already coherent, there is no need to invent a contradiction and then reconcile it.

### `level:counterargument_engagement:0`

Status: machine

English:

> An alternative is dismissed without engaging its actual claim.

Simplified Chinese:

> 没有回应另一种观点的实际主张就将其否定。

Back-translation (machine):

> Rejects another viewpoint without responding to its actual claim.

### `level:counterargument_engagement:1`

Status: machine

English:

> An alternative is acknowledged but its strongest relevant basis is omitted.

Simplified Chinese:

> 承认了另一种观点，但遗漏了其最有力的相关依据。

Back-translation (machine):

> Acknowledges another viewpoint, but omits its strongest relevant basis.

### `level:counterargument_engagement:2`

Status: machine

English:

> A serious alternative is represented fairly and addressed on its merits.

Simplified Chinese:

> 公平呈现了一种严肃的替代观点，并针对其观点本身作出回应。

Back-translation (machine):

> Fairly presents a serious alternative viewpoint and responds to the viewpoint itself.

### `level:counterargument_engagement:3`

Status: machine

English:

> The participant identifies when a serious alternative could outperform their account.

Simplified Chinese:

> 参与者指出了严肃的替代观点在何种情况下可能比自己的论述更有说服力。

Back-translation (machine):

> The participant points out under what circumstances a serious alternative viewpoint might be more persuasive than their own argument.

### `level:updateability:0`

Status: machine

English:

> The participant explicitly rules out revising the belief regardless of evidence.

Simplified Chinese:

> 参与者明确排除了无论证据如何都修正这一信念的可能性。

Back-translation (machine):

> The participant explicitly rules out the possibility of revising this belief regardless of the evidence.

### `level:updateability:1`

Status: machine

English:

> A vague update condition is given without specifying relevant evidence.

Simplified Chinese:

> 提出了一个模糊的修正条件，但未说明相关证据。

Back-translation (machine):

> Proposes a vague condition for revision, but does not specify the relevant evidence.

### `level:updateability:2`

Status: machine

English:

> Identifiable evidence or a development could change the stated belief.

Simplified Chinese:

> 可识别的证据或某项进展可能改变所述信念。

Back-translation (machine):

> Identifiable evidence or some development could change the stated belief.

### `level:updateability:3`

Status: machine

English:

> A specific discriminating observation is tied to a particular belief change.

Simplified Chinese:

> 将一项能够作出区分的具体观察与某种特定的信念改变联系起来。

Back-translation (machine):

> Connects a specific observation capable of making a distinction to a particular change in belief.

### `level:grounded_understanding:0`

Status: machine

English:

> An explicitly supplied observation materially contradicts the claim it is used to support.

Simplified Chinese:

> 一项明确提供的观察结果与其用于支持的主张存在实质性矛盾。

Back-translation (machine):

> An explicitly provided observation substantively contradicts the claim it is used to support.

### `level:grounded_understanding:1`

Status: machine

English:

> An offered observation or example has a weak or unexplained connection to the claim.

Simplified Chinese:

> 所提供的观察或例子与该主张之间的联系薄弱或未得到解释。

Back-translation (machine):

> The connection between the provided observation or example and the claim is weak or unexplained.

### `level:grounded_understanding:2`

Status: machine

English:

> A clear connection links the offered basis to the claim, with relevant limitations.

Simplified Chinese:

> 清晰的联系将所提供的依据与主张连接起来，同时说明了相关局限。

Back-translation (machine):

> A clear connection links the provided basis to the claim while stating the relevant limitations.

### `level:grounded_understanding:3`

Status: machine

English:

> The account distinguishes observation, interpretation and uncertainty, explaining the limits of the offered basis.

Simplified Chinese:

> 该论述区分了观察、解读和不确定性，并解释了所提供依据的局限。

Back-translation (machine):

> The argument distinguishes observation, interpretation, and uncertainty, and explains the limitations of the provided basis.

### `level:catastrophic_risk:0`

Status: machine

English:

> Catastrophic outcomes are expected to be negligible or effectively avoided under the participant’s stated assumptions.

Simplified Chinese:

> 在参与者所述的假设下，预计灾难性结果的可能性微不足道，或实际上会被避免。

Back-translation (machine):

> Under the assumptions stated by the participant, the possibility of catastrophic outcomes is expected to be negligible, or they would in fact be avoided.

### `level:catastrophic_risk:1`

Status: machine

English:

> Catastrophe is possible but expected to be a limited part of the outlook under stated conditions.

Simplified Chinese:

> 在已说明的条件下，灾难有可能发生，但预计只会在整体展望中占有限部分。

Back-translation (machine):

> Under the stated conditions, catastrophe may occur, but it is expected to account for only a limited part of the overall outlook.

### `level:catastrophic_risk:2`

Status: machine

English:

> Catastrophic outcomes are a material possibility in the participant’s outlook, with consequential uncertainty or conditions.

Simplified Chinese:

> 在参与者的展望中，灾难性结果是一种不容忽视的可能性，并伴有会造成重大影响的不确定性或条件。

Back-translation (machine):

> In the participant's outlook, catastrophic outcomes are a possibility that cannot be ignored, accompanied by uncertainty or conditions that would cause major impacts.

### `level:catastrophic_risk:3`

Status: machine

English:

> Catastrophic outcomes dominate the participant’s expectation under stated assumptions.

Simplified Chinese:

> 在所述假设下，灾难性结果在参与者的预期中占主导地位。

Back-translation (machine):

> Under the stated assumptions, catastrophic outcomes dominate the participant's expectations.

### `Claims.levels.overall_outlook.0`

Status: machine

English:

> Overwhelmingly harmful overall.

Simplified Chinese:

> 总体上具有压倒性的危害。

Back-translation (machine):

> Overwhelming harm overall.

### `Claims.levels.overall_outlook.1`

Status: machine

English:

> More harmful than beneficial overall.

Simplified Chinese:

> 总体上危害大于益处。

Back-translation (machine):

> More harm than benefit overall.

### `Claims.levels.overall_outlook.2`

Status: machine

English:

> A broadly balanced or limited overall impact is expected.

Simplified Chinese:

> 预计总体影响大致均衡或有限。

Back-translation (machine):

> The overall impact is expected to be roughly balanced or limited.

### `Claims.levels.overall_outlook.3`

Status: machine

English:

> More beneficial than harmful overall.

Simplified Chinese:

> 总体上益处大于危害。

Back-translation (machine):

> More benefit than harm overall.

### `Claims.levels.overall_outlook.4`

Status: machine

English:

> Overwhelmingly beneficial overall.

Simplified Chinese:

> 总体上具有压倒性的益处。

Back-translation (machine):

> Overwhelming benefit overall.

### `Claims.levels.outlook_orientation.0`

Status: machine

English:

> Your outlook is strongly oriented toward catastrophe or overwhelming harm.

Simplified Chinese:

> 你的展望强烈倾向于灾难或压倒性的危害。

Back-translation (machine):

> Your outlook strongly leans toward catastrophe or overwhelming harm.

### `Claims.levels.outlook_orientation.1`

Status: machine

English:

> Your outlook leans toward concern about harmful futures, while allowing better outcomes.

Simplified Chinese:

> 你的展望倾向于担忧有害的未来，同时也认为可能出现更好的结果。

Back-translation (machine):

> Your outlook leans toward concern about a harmful future, while also considering better outcomes possible.

### `Claims.levels.outlook_orientation.2`

Status: machine

English:

> Your outlook is mixed or undecided: neither hope nor worry clearly dominates. This is not a prediction of equal benefits and harms.

Simplified Chinese:

> 你的展望是喜忧参半或尚未确定：希望和担忧都没有明显占据主导。这并不意味着预测益处与危害相等。

Back-translation (machine):

> Your outlook is mixed or not yet determined: neither hope nor concern clearly dominates. This does not mean predicting equal benefits and harms.

### `Claims.levels.outlook_orientation.3`

Status: machine

English:

> Your outlook leans toward beneficial futures, while allowing serious risks.

Simplified Chinese:

> 你的展望倾向于认为未来将是有益的，同时也承认存在严重风险。

Back-translation (machine):

> Your outlook leans toward believing that the future will be beneficial, while also acknowledging serious risks.

### `Claims.levels.outlook_orientation.4`

Status: machine

English:

> Your outlook is strongly oriented toward transformative flourishing.

Simplified Chinese:

> 你的展望强烈倾向于认为未来会迎来变革性的繁荣。

Back-translation (machine):

> Your outlook strongly leans toward believing that the future will usher in transformative prosperity.

### `Claims.levels.capability_ceiling.0`

Status: machine

English:

> AI is expected to remain bounded tools.

Simplified Chinese:

> 预计AI仍将是能力有限的工具。

Back-translation (machine):

> AI is expected to remain a tool with limited capabilities.

### `Claims.levels.capability_ceiling.1`

Status: machine

English:

> AI is expected to match people across most cognitive work.

Simplified Chinese:

> 预计AI将在大多数认知工作中达到人类水平。

Back-translation (machine):

> AI is expected to reach the human level in most cognitive work.

### `Claims.levels.capability_ceiling.2`

Status: machine

English:

> AI is expected to substantially exceed people across cognitive work.

Simplified Chinese:

> 预计AI将在认知工作中大幅超越人类。

Back-translation (machine):

> AI is expected to greatly surpass humans in cognitive work.

### `Claims.levels.development_pace.0`

Status: machine

English:

> Stop or substantially slow development of more capable AI.

Simplified Chinese:

> 停止或大幅放缓开发能力更强的AI。

Back-translation (machine):

> Stop or greatly slow down the development of more capable AI.

### `Claims.levels.development_pace.1`

Status: machine

English:

> Continue development under stated safeguards.

Simplified Chinese:

> 在落实所述保障措施的前提下继续开发。

Back-translation (machine):

> Continue development on the condition that the stated safeguards are implemented.

### `Claims.levels.development_pace.2`

Status: machine

English:

> Speed up development of more capable AI.

Simplified Chinese:

> 加快开发能力更强的AI。

Back-translation (machine):

> Accelerate the development of more capable AI.

### `Claims.levels.deployment_policy.0`

Status: machine

English:

> Restrict the AI uses discussed until prior protections or permission are in place.

Simplified Chinese:

> 在事先落实保护措施或获得许可之前，限制所讨论的AI用途。

Back-translation (machine):

> Restrict the discussed AI uses before protections are implemented or permission is obtained in advance.

### `Claims.levels.deployment_policy.1`

Status: machine

English:

> Allow the AI uses discussed with targeted accountability and protections.

Simplified Chinese:

> 允许所讨论的AI用途，同时实施有针对性的问责与保护措施。

Back-translation (machine):

> Allow the discussed AI uses while implementing targeted accountability and protections.

### `Claims.levels.deployment_policy.2`

Status: machine

English:

> Minimize restrictions on the AI uses discussed.

Simplified Chinese:

> 尽量减少对所讨论AI用途的限制。

Back-translation (machine):

> Minimize restrictions on the discussed AI uses.

### `Claims.levels.access_policy.0`

Status: machine

English:

> Restrict access to powerful AI.

Simplified Chinese:

> 限制对强大AI的访问。

Back-translation (machine):

> Restrict access to powerful AI.

### `Claims.levels.access_policy.1`

Status: machine

English:

> Allow access subject to capability or use restrictions.

Simplified Chinese:

> 允许访问，但须遵守能力或用途限制。

Back-translation (machine):

> Allow access, but subject to capability or use restrictions.

### `Claims.levels.access_policy.2`

Status: machine

English:

> Favor broad or open access to powerful AI.

Simplified Chinese:

> 支持广泛或开放地访问强大AI。

Back-translation (machine):

> Support broad or open access to powerful AI.

### `Claims.levels.influence.0`

Status: machine

English:

> Human choices have almost no influence over the eventual AI outcome.

Simplified Chinese:

> 人类的选择对AI的最终结果几乎没有影响。

Back-translation (machine):

> Human choices have almost no influence on AI's ultimate outcomes.

### `Claims.levels.influence.1`

Status: machine

English:

> Human choices can make limited changes, but dominant forces constrain the outcome.

Simplified Chinese:

> 人类的选择可以带来有限改变，但主导力量会制约结果。

Back-translation (machine):

> Human choices can bring limited change, but dominant forces will constrain outcomes.

### `Claims.levels.influence.2`

Status: machine

English:

> Human choices have meaningful but substantially constrained influence.

Simplified Chinese:

> 人类的选择具有实质性但受到很大制约的影响。

Back-translation (machine):

> Human choices have a substantial but greatly constrained influence.

### `Claims.levels.influence.3`

Status: machine

English:

> Human choices can substantially redirect the AI trajectory.

Simplified Chinese:

> 人类的选择可以大幅改变AI的发展轨迹。

Back-translation (machine):

> Human choices can greatly change AI's development trajectory.

### `Claims.levels.influence.4`

Status: machine

English:

> Human choices are decisive: very different AI futures remain within collective reach.

Simplified Chinese:

> 人类的选择具有决定性作用：截然不同的AI未来仍在集体行动可及的范围内。

Back-translation (machine):

> Human choices play a decisive role: distinctly different AI futures remain within the reach of collective action.

### `Claims.levels.transformation.0`

Status: machine

English:

> AI is expected to cause little lasting societal change.

Simplified Chinese:

> 预计AI几乎不会带来持久的社会变化。

Back-translation (machine):

> AI is expected to bring almost no lasting social change.

### `Claims.levels.transformation.1`

Status: machine

English:

> AI is expected to bring incremental improvements and disruptions within familiar institutions.

Simplified Chinese:

> 预计AI将在现有机构内带来渐进式改进与冲击。

Back-translation (machine):

> AI is expected to bring incremental improvements and disruptions within existing institutions.

### `Claims.levels.transformation.2`

Status: machine

English:

> AI is expected to substantially change several sectors of society.

Simplified Chinese:

> 预计AI将显著改变社会的多个领域。

Back-translation (machine):

> AI is expected to significantly change multiple areas of society.

### `Claims.levels.transformation.3`

Status: machine

English:

> AI is expected to restructure economies, institutions and everyday life broadly.

Simplified Chinese:

> 预计AI将广泛重塑经济、机构与日常生活。

Back-translation (machine):

> AI is expected to broadly reshape the economy, institutions, and daily life.

### `Claims.levels.transformation.4`

Status: machine

English:

> AI is expected to fundamentally transform civilization or humanity’s continued existence.

Simplified Chinese:

> 预计AI将从根本上改变文明或人类能否继续存在。

Back-translation (machine):

> AI is expected to fundamentally change civilization or whether humanity can continue to exist.

### `Claims.uncertain`

Status: machine

English:

> You expressed uncertainty here rather than a directional expectation.

Simplified Chinese:

> 你在此表达的是不确定性，而非有明确方向的预期。

Back-translation (machine):

> What you express here is uncertainty, rather than an expectation with a clear direction.

### `Claims.unestablished`

Status: machine

English:

> A directional position is not yet established by these answers.

Simplified Chinese:

> 这些回答尚未确立有明确方向的立场。

Back-translation (machine):

> These answers have not yet established a position with a clear direction.

### `Claims.unresolved`

Status: machine

English:

> The interpretation of these answers still needs clarification.

Simplified Chinese:

> 对这些回答的解读仍需澄清。

Back-translation (machine):

> The interpretation of these answers still needs clarification.

### `Claims.readings`

Status: machine

English:

> Several readings remain plausible: {readings}

Simplified Chinese:

> 仍有几种解读是合理的：{readings}

Back-translation (machine):

> Several interpretations remain reasonable: {readings}

### `Claims.unplacedUncertain.capability_trajectory`

Status: machine

English:

> You expressed uncertainty about whether or when transformative AI arrives.

Simplified Chinese:

> 你对于变革性AI是否会到来或何时到来表达了不确定性。

Back-translation (machine):

> You expressed uncertainty about whether transformative AI will arrive or when it will arrive.

### `Claims.unplacedUncertain.transition_dynamics`

Status: machine

English:

> You expressed uncertainty about how quickly AI-driven change unfolds.

Simplified Chinese:

> 你对于AI驱动的变化会多快展开表达了不确定性。

Back-translation (machine):

> You expressed uncertainty about how quickly AI-driven changes will unfold.

### `Claims.unplacedUncertain.beneficial_potential`

Status: machine

English:

> You expressed uncertainty about the positive impact you expect from AI.

Simplified Chinese:

> 你对于预期AI会带来多大积极影响表达了不确定性。

Back-translation (machine):

> You expressed uncertainty about how much positive impact AI is expected to bring.

### `Claims.unplacedUncertain.risk_landscape`

Status: machine

English:

> You expressed uncertainty about the harm you expect from AI.

Simplified Chinese:

> 你对于预期AI会带来多大危害表达了不确定性。

Back-translation (machine):

> You expressed uncertainty about how much harm AI is expected to bring.

### `Claims.unplacedUncertain.technical_controllability`

Status: machine

English:

> You expressed uncertainty about whether technical control of powerful AI will work.

Simplified Chinese:

> 你对于能否通过技术手段有效控制强大AI表达了不确定性。

Back-translation (machine):

> You expressed uncertainty about whether powerful AI can be effectively controlled through technical means.

### `Claims.unplacedUncertain.institutional_competence`

Status: machine

English:

> You expressed uncertainty about how effectively institutions will respond.

Simplified Chinese:

> 你对于机构能多有效地作出应对表达了不确定性。

Back-translation (machine):

> You expressed uncertainty about how effectively institutions can respond.

### `Claims.unplacedUncertain.human_agency`

Status: machine

English:

> You expressed uncertainty about what happens to the forms of agency you value.

Simplified Chinese:

> 你对于自己所重视的能动性形式将会如何变化表达了不确定性。

Back-translation (machine):

> You expressed uncertainty about how the forms of agency you value will change.

### `Claims.unplacedUncertain.action_posture`

Status: machine

English:

> You expressed uncertainty about which development or policy response you prefer.

Simplified Chinese:

> 你对于自己倾向哪种开发或政策应对方式表达了不确定性。

Back-translation (machine):

> You expressed uncertainty about which development or policy response approach you lean toward.

### `Claims.unplacedUncertain.catastrophic_risk`

Status: machine

English:

> You expressed uncertainty about the prospect of catastrophic or irreversible harm.

Simplified Chinese:

> 你对于灾难性或不可逆危害发生的可能性表达了不确定性。

Back-translation (machine):

> You expressed uncertainty about the likelihood of catastrophic or irreversible harm occurring.

### `Claims.unplacedUnestablished.capability_trajectory`

Status: machine

English:

> These answers do not yet establish whether or when transformative AI arrives.

Simplified Chinese:

> 这些回答尚不能确定变革性AI是否会到来或何时到来。

Back-translation (machine):

> These answers cannot yet determine whether transformative AI will arrive or when it will arrive.

### `Claims.unplacedUnestablished.transition_dynamics`

Status: machine

English:

> These answers do not yet establish how quickly AI-driven change unfolds.

Simplified Chinese:

> 这些回答尚不能确定AI驱动的变化会多快展开。

Back-translation (machine):

> These answers cannot yet determine how quickly AI-driven changes will unfold.

### `Claims.unplacedUnestablished.beneficial_potential`

Status: machine

English:

> These answers do not yet establish the positive impact you expect from AI.

Simplified Chinese:

> 这些回答尚不能确定你预期 AI 会带来的积极影响。

Back-translation (machine):

> These answers cannot yet determine the positive impact you expect AI to bring.

### `Claims.unplacedUnestablished.risk_landscape`

Status: machine

English:

> These answers do not yet establish the harm you expect from AI.

Simplified Chinese:

> 这些回答尚不能确定你预期 AI 会带来的危害。

Back-translation (machine):

> These answers cannot yet determine the harm you expect AI to bring.

### `Claims.unplacedUnestablished.technical_controllability`

Status: machine

English:

> These answers do not yet establish whether technical control of powerful AI will work.

Simplified Chinese:

> 这些回答尚不能确定对强大 AI 的技术控制是否会奏效。

Back-translation (machine):

> These answers cannot yet determine whether technical control of powerful AI will work.

### `Claims.unplacedUnestablished.institutional_competence`

Status: machine

English:

> These answers do not yet establish how effectively institutions will respond.

Simplified Chinese:

> 这些回答尚不能确定机构将如何有效应对。

Back-translation (machine):

> These answers cannot yet determine how effectively institutions will respond.

### `Claims.unplacedUnestablished.human_agency`

Status: machine

English:

> These answers do not yet establish what happens to the forms of agency you value.

Simplified Chinese:

> 这些回答尚不能确定你所重视的能动性形式将会如何。

Back-translation (machine):

> These answers are not yet sufficient to determine what will happen to the form of agency you value.

### `Claims.unplacedUnestablished.action_posture`

Status: machine

English:

> These answers do not yet establish which development or policy response you prefer.

Simplified Chinese:

> 这些回答尚不能确定你倾向于哪种开发或政策应对方式。

Back-translation (machine):

> These answers are not yet sufficient to determine which development or policy response approach you lean toward.

### `Claims.unplacedUnestablished.catastrophic_risk`

Status: machine

English:

> These answers do not yet establish the prospect of catastrophic or irreversible harm.

Simplified Chinese:

> 这些回答尚不能确定发生灾难性或不可逆危害的可能性。

Back-translation (machine):

> These answers are not yet sufficient to determine the likelihood of catastrophic or irreversible harm occurring.

### `Claims.facetUnsettled`

Status: machine

English:

> You have not settled on a position here.

Simplified Chinese:

> 你尚未在这方面确定立场。

Back-translation (machine):

> You have not yet settled on a position in this respect.

### `Claims.axisUnsettled`

Status: machine

English:

> You have not settled on this. The point marks the center of the open range, not a moderate belief.

Simplified Chinese:

> 你尚未对此确定立场。该点标示的是未确定范围的中心，而非温和立场。

Back-translation (machine):

> You have not yet settled on a position on this. This point marks the center of the unsettled range, rather than a moderate position.

### `Claims.axisTentative`

Status: machine

English:

> A tentative estimate from your answers; the wider range shows other plausible readings.

Simplified Chinese:

> 根据你的回答得出的暂定估计；较宽的范围表示其他合理解读。

Back-translation (machine):

> A tentative estimate derived from your answers; a wider range indicates other reasonable interpretations.

### `Claims.timelineExpressed`

Status: machine

English:

> Timing expressed in answer {number}; see the full answer for its scope and uncertainty.

Simplified Chinese:

> 回答 {number} 中表达的时间；其范围和不确定性请参阅完整回答。

Back-translation (machine):

> The time expressed in answer {number}; for its range and uncertainty, please refer to the full answer.

### `Claims.timelineUnsettled`

Status: machine

English:

> You have not settled on a timeline.

Simplified Chinese:

> 你尚未确定时间线。

Back-translation (machine):

> You have not yet settled on a timeline.
