# Brazilian Portuguese review packet

Generated 2026-10-01 for `pt` (pt-BR), content 0.4.0-draft and rubric 0.1.0-draft. Statuses: 140 machine.

Only these strings need a native speaker before they are treated as final: the root question, the recovery and retry copy, and the wording of result claims. Everything else may stay machine-translated. Check that each translation keeps the English meaning and degree, adds no loaded premise, reads neutrally and naturally, and leaves Doom, Bloom, Doom or Bloom and P(doom) untranslated. Placeholders such as `{readings}` and ICU syntax must stay as they are.

Send corrections as edits to `content/l10n/pt/releases/0.4.0-draft.json`, `content/l10n/pt/rubrics/0.1.0-draft.json` or `messages/pt.json` (with their `content/l10n/pt/messages.json` hashes refreshed by `pnpm l10n:translate --locale=pt --only-stale`). Record the completed review with `pnpm l10n:review --locale=pt --approve=<reviewer>`.

## Root question

### `prompt:root:text`

Status: machine

English:

> What do you think AI means for our future—and why?

Brazilian Portuguese:

> O que você acha que a IA significa para o nosso futuro — e por quê?

Back-translation (machine):

> What do you think AI means for our future — and why?

## Recovery and retry copy

### `prompt:root:reask` (used by 47 questions)

Status: machine

English:

> I could not connect that answer to this question. A few words about your view are enough—want to try again?

Brazilian Portuguese:

> Não consegui relacionar essa resposta a esta pergunta. Algumas palavras sobre sua visão são suficientes — quer tentar novamente?

Back-translation (machine):

> I couldn't relate that response to this question. A few words about your view are enough — want to try again?

### `prompt:root:clarification` (used by 47 questions)

Status: machine

English:

> I am not sure how to read that. Could you say a little more about what you mean?

Brazilian Portuguese:

> Não tenho certeza de como interpretar isso. Você poderia explicar um pouco mais o que quer dizer?

Back-translation (machine):

> I'm not sure how to interpret that. Could you explain a little more what you mean?

### `prompt:root:exhausted` (used by 47 questions)

Status: machine

English:

> Let’s pause here. You can try a different question, stop for now, or restart.

Brazilian Portuguese:

> Vamos pausar aqui. Você pode tentar uma pergunta diferente, parar por enquanto ou recomeçar.

Back-translation (machine):

> Let's pause here. You can try a different question, stop for now, or start over.

### `prompt:risk.cyber-balance:reask` (used by 3 questions)

Status: machine

English:

> Do you think AI will help cyberattackers or defenders more, and why?

Brazilian Portuguese:

> Você acha que a IA ajudará mais os invasores cibernéticos ou os defensores, e por quê?

Back-translation (machine):

> Do you think AI will help cyber attackers or defenders more, and why?

### `Interview.failedTitle`

Status: machine

English:

> This step did not finish

Brazilian Portuguese:

> Esta etapa não foi concluída

Back-translation (machine):

> This step was not completed

### `Interview.failure.providerRejected`

Status: machine

English:

> Our AI provider, TypeSafe (Jev), rejected this request. Your submission is saved. Please try again later.

Brazilian Portuguese:

> Nosso provedor de IA, TypeSafe (Jev), rejeitou esta solicitação. Sua resposta foi salva. Tente novamente mais tarde.

Back-translation (machine):

> Our AI provider, TypeSafe (Jev), rejected this request. Your answer was saved. Try again later.

### `Interview.failure.saved`

Status: machine

English:

> Your submission is saved and your previous progress is unchanged. Please try again when you’re ready.

Brazilian Portuguese:

> Sua resposta foi salva, e seu progresso anterior permanece inalterado. Tente novamente quando estiver pronto.

Back-translation (machine):

> Your answer was saved, and your previous progress remains unchanged. Try again when you are ready.

### `Interview.retrySaved`

Status: machine

English:

> Retry saved submission

Brazilian Portuguese:

> Tentar enviar novamente a resposta salva

Back-translation (machine):

> Try submitting the saved answer again

### `Interview.recovery.paperclipsTitle`

Status: machine

English:

> We’ve made some paperclips.

Brazilian Portuguese:

> Fizemos alguns clipes de papel.

Back-translation (machine):

> We made some paper clips.

### `Interview.recovery.chooseTitle`

Status: machine

English:

> Choose what to do next

Brazilian Portuguese:

> Escolha o que fazer a seguir

Back-translation (machine):

> Choose what to do next

### `Interview.recovery.retryTitle`

Status: machine

English:

> Another try?

Brazilian Portuguese:

> Tentar de novo?

Back-translation (machine):

> Try again?

### `Interview.recovery.paperclips`

Status: machine

English:

> You found the easter egg! Now let's get back to business...

Brazilian Portuguese:

> Você encontrou o easter egg! Agora vamos voltar ao que interessa...

Back-translation (machine):

> You found the easter egg! Now let's get back to what matters...

### `Interview.recovery.stopped`

Status: machine

English:

> Your progress is here whenever you want to return.

Brazilian Portuguese:

> Seu progresso estará aqui quando você quiser voltar.

Back-translation (machine):

> Your progress will be here when you want to come back.

### `Interview.recovery.navigation`

Status: machine

English:

> Use the actions below to choose what happens next.

Brazilian Portuguese:

> Use as ações abaixo para escolher o que acontecerá a seguir.

Back-translation (machine):

> Use the actions below to choose what will happen next.

### `Interview.tryAgain`

Status: machine

English:

> Try again

Brazilian Portuguese:

> Tentar novamente

Back-translation (machine):

> Try again

### `Interview.differentQuestion`

Status: machine

English:

> Try a different question

Brazilian Portuguese:

> Tentar outra pergunta

Back-translation (machine):

> Try another question

## Result claims

Rubric levels (`level:*`) and the claims built in code (`Claims.*`) describe what the participant’s answers suggest. They are interpretations, not facts, and must keep their hedges.

### `level:capability_trajectory:0`

Status: machine

English:

> Transformative capability is not expected, or a low ceiling is explicitly anticipated.

Brazilian Portuguese:

> Não se espera uma capacidade transformadora, ou prevê-se explicitamente um limite baixo.

Back-translation (machine):

> Transformative capability is not expected, or a low limit is explicitly predicted.

### `level:capability_trajectory:1`

Status: machine

English:

> Transformative capability is expected only on a long or indefinite horizon.

Brazilian Portuguese:

> Espera-se uma capacidade transformadora apenas em um horizonte temporal longo ou indefinido.

Back-translation (machine):

> Transformative capability is expected only over a long or indefinite time horizon.

### `level:capability_trajectory:2`

Status: machine

English:

> Transformative capability is expected within decades, with timing conditional or uncertain.

Brazilian Portuguese:

> Espera-se uma capacidade transformadora dentro de algumas décadas, com um horizonte temporal condicional ou incerto.

Back-translation (machine):

> Transformative capability is expected within a few decades, with a conditional or uncertain time horizon.

### `level:capability_trajectory:3`

Status: machine

English:

> Transformative capability is expected within years, with named milestones or timing.

Brazilian Portuguese:

> Espera-se uma capacidade transformadora dentro de alguns anos, com marcos ou prazos específicos.

Back-translation (machine):

> Transformative capability is expected within a few years, with specific milestones or deadlines.

### `level:transition_dynamics:0`

Status: machine

English:

> A gradual transition with substantial warning and broad diffusion is expected.

Brazilian Portuguese:

> Espera-se uma transição gradual, com amplo aviso prévio e ampla difusão.

Back-translation (machine):

> A gradual transition is expected, with ample advance warning and broad diffusion.

### `level:transition_dynamics:1`

Status: machine

English:

> Noticeable acceleration is expected but meaningful adaptation time remains.

Brazilian Portuguese:

> Espera-se uma aceleração perceptível, mas ainda haverá um tempo significativo para adaptação.

Back-translation (machine):

> Noticeable acceleration is expected, but there will still be significant time for adaptation.

### `level:transition_dynamics:2`

Status: machine

English:

> A fast transition with limited warning is expected.

Brazilian Portuguese:

> Espera-se uma transição rápida, com pouco aviso prévio.

Back-translation (machine):

> A rapid transition is expected, with little advance warning.

### `level:transition_dynamics:3`

Status: machine

English:

> An abrupt self-reinforcing transition with very little warning is expected.

Brazilian Portuguese:

> Espera-se uma transição abrupta e autorreforçada, com pouquíssimo aviso prévio.

Back-translation (machine):

> An abrupt and self-reinforcing transition is expected, with very little advance warning.

### `level:beneficial_potential:0`

Status: machine

English:

> Little positive impact is expected even if advanced AI arrives.

Brazilian Portuguese:

> Espera-se pouco impacto positivo, mesmo que uma IA avançada surja.

Back-translation (machine):

> Little positive impact is expected, even if advanced AI emerges.

### `level:beneficial_potential:1`

Status: machine

English:

> Limited or narrowly distributed gains are expected.

Brazilian Portuguese:

> Esperam-se ganhos limitados ou distribuídos de forma restrita.

Back-translation (machine):

> Limited or narrowly distributed gains are expected.

### `level:beneficial_potential:2`

Status: machine

English:

> Substantial benefits are expected, with important conditions or distribution limits.

Brazilian Portuguese:

> Esperam-se benefícios substanciais, com condições importantes ou limites de distribuição.

Back-translation (machine):

> Substantial benefits are expected, with important conditions or distribution limits.

### `level:beneficial_potential:3`

Status: machine

English:

> Transformative, broadly valuable gains are expected.

Brazilian Portuguese:

> Esperam-se ganhos transformadores e amplamente valiosos.

Back-translation (machine):

> Transformative and broadly valuable gains are expected.

### `level:risk_landscape:0`

Status: machine

English:

> Little material adverse impact is expected.

Brazilian Portuguese:

> Espera-se pouco impacto adverso relevante.

Back-translation (machine):

> Little relevant adverse impact is expected.

### `level:risk_landscape:1`

Status: machine

English:

> Manageable or localized harms are expected.

Brazilian Portuguese:

> Esperam-se danos administráveis ou localizados.

Back-translation (machine):

> Manageable or localized harms are expected.

### `level:risk_landscape:2`

Status: machine

English:

> Severe or widespread harm is a material expected part of the future.

Brazilian Portuguese:

> Danos graves ou generalizados são uma parte relevante do futuro esperado.

Back-translation (machine):

> Serious or widespread harms are a relevant part of the expected future.

### `level:risk_landscape:3`

Status: machine

English:

> Catastrophic or irreversible loss is central to the expected future.

Brazilian Portuguese:

> Uma perda catastrófica ou irreversível ocupa um lugar central no futuro esperado.

Back-translation (machine):

> A catastrophic or irreversible loss occupies a central place in the expected future.

### `level:technical_controllability:0`

Status: machine

English:

> Reliable technical control is expected to be infeasible.

Brazilian Portuguese:

> Espera-se que um controle técnico confiável seja inviável.

Back-translation (machine):

> Reliable technical control is expected to be unfeasible.

### `level:technical_controllability:1`

Status: machine

English:

> Control is expected to be very difficult and unreliable.

Brazilian Portuguese:

> Espera-se que o controle seja muito difícil e pouco confiável.

Back-translation (machine):

> Control is expected to be very difficult and unreliable.

### `level:technical_controllability:2`

Status: machine

English:

> Control is expected to be feasible under demanding conditions.

Brazilian Portuguese:

> Espera-se que o controle seja viável sob condições exigentes.

Back-translation (machine):

> Control is expected to be feasible under demanding conditions.

### `level:technical_controllability:3`

Status: machine

English:

> Reliable technical control is expected to be broadly feasible.

Brazilian Portuguese:

> Espera-se que um controle técnico confiável seja amplamente viável.

Back-translation (machine):

> Reliable technical control is expected to be broadly feasible.

### `level:institutional_competence:0`

Status: machine

English:

> Institutions are expected to fail to respond effectively.

Brazilian Portuguese:

> Espera-se que as instituições não consigam responder de forma eficaz.

Back-translation (machine):

> Institutions are expected to be unable to respond effectively.

### `level:institutional_competence:1`

Status: machine

English:

> Institutions are expected to respond too weakly or too late in many cases.

Brazilian Portuguese:

> Espera-se que, em muitos casos, as instituições respondam de forma fraca demais ou tarde demais.

Back-translation (machine):

> Institutions are expected, in many cases, to respond too weakly or too late.

### `level:institutional_competence:2`

Status: machine

English:

> Effective responses are expected under specific coordination conditions.

Brazilian Portuguese:

> Esperam-se respostas eficazes sob condições específicas de coordenação.

Back-translation (machine):

> Effective responses are expected under specific coordination conditions.

### `level:institutional_competence:3`

Status: machine

English:

> Institutions are expected to adapt effectively and in time.

Brazilian Portuguese:

> Espera-se que as instituições se adaptem de forma eficaz e em tempo hábil.

Back-translation (machine):

> Institutions are expected to adapt effectively and in a timely manner.

### `level:human_agency:0`

Status: machine

English:

> The expected future undermines or eliminates the forms of agency/continuity the participant explicitly values.

Brazilian Portuguese:

> O futuro esperado compromete ou elimina as formas de agência ou continuidade que o participante valoriza explicitamente.

Back-translation (machine):

> The expected future compromises or eliminates the forms of agency or continuity that the participant explicitly values.

### `level:human_agency:1`

Status: machine

English:

> Significant valued agency or continuity is expected to be lost.

Brazilian Portuguese:

> Espera-se que uma parcela significativa da agência ou continuidade valorizada seja perdida.

Back-translation (machine):

> A significant share of valued agency or continuity is expected to be lost.

### `level:human_agency:2`

Status: machine

English:

> Valued agency/continuity is expected to be substantially preserved, with changes or conditions.

Brazilian Portuguese:

> Espera-se que a agência ou continuidade valorizada seja substancialmente preservada, com mudanças ou condições.

Back-translation (machine):

> Valued agency or continuity is expected to be substantially preserved, with changes or conditions.

### `level:human_agency:3`

Status: machine

English:

> Valued agency/continuity is expected to expand or flourish.

Brazilian Portuguese:

> Espera-se que a agência ou continuidade valorizada se amplie ou prospere.

Back-translation (machine):

> Valued agency or continuity is expected to expand or thrive.

### `level:action_posture:0`

Status: machine

English:

> A broad pause or substantial slowing is preferred.

Brazilian Portuguese:

> É preferível uma pausa ampla ou uma desaceleração substancial.

Back-translation (machine):

> A broad pause or substantial slowdown is preferable.

### `level:action_posture:1`

Status: machine

English:

> Restrained development and strong prior safeguards are preferred.

Brazilian Portuguese:

> É preferível um desenvolvimento contido, com fortes salvaguardas prévias.

Back-translation (machine):

> Contained development, with strong prior safeguards, is preferable.

### `level:action_posture:2`

Status: machine

English:

> Continued development with targeted safeguards is preferred.

Brazilian Portuguese:

> É preferível continuar o desenvolvimento com salvaguardas direcionadas.

Back-translation (machine):

> Continuing development with targeted safeguards is preferable.

### `level:action_posture:3`

Status: machine

English:

> Rapid development or broad access is preferred.

Brazilian Portuguese:

> É preferível um desenvolvimento rápido ou um acesso amplo.

Back-translation (machine):

> Rapid development or broad access is preferable.

### `level:causal_clarity:0`

Status: machine

English:

> An outcome is asserted without a supporting mechanism.

Brazilian Portuguese:

> Um resultado é afirmado sem um mecanismo que lhe dê sustentação.

Back-translation (machine):

> An outcome is asserted without a mechanism that supports it.

### `level:causal_clarity:1`

Status: machine

English:

> A causal factor is named but its connection to the outcome is not explained.

Brazilian Portuguese:

> Um fator causal é mencionado, mas sua conexão com o resultado não é explicada.

Back-translation (machine):

> A causal factor is mentioned, but its connection to the outcome is not explained.

### `level:causal_clarity:2`

Status: machine

English:

> A coherent mechanism connects a cause to an outcome with a relevant condition.

Brazilian Portuguese:

> Um mecanismo coerente conecta uma causa a um resultado mediante uma condição relevante.

Back-translation (machine):

> A coherent mechanism connects a cause to an outcome through a relevant condition.

### `level:causal_clarity:3`

Status: machine

English:

> A mechanism is developed with dependencies, limitations, or potential failure points.

Brazilian Portuguese:

> Um mecanismo é desenvolvido com dependências, limitações ou possíveis pontos de falha.

Back-translation (machine):

> A mechanism is developed with dependencies, limitations, or possible points of failure.

### `level:scope_discipline:0`

Status: machine

English:

> Materially different scopes are conflated without qualification.

Brazilian Portuguese:

> Escopos substancialmente diferentes são confundidos sem ressalvas.

Back-translation (machine):

> Substantially different scopes are conflated without caveats.

### `level:scope_discipline:1`

Status: machine

English:

> Some scope is specified but material boundaries remain blurred.

Brazilian Portuguese:

> Algum escopo é especificado, mas limites substanciais permanecem imprecisos.

Back-translation (machine):

> Some scope is specified, but substantial boundaries remain imprecise.

### `level:scope_discipline:2`

Status: machine

English:

> Relevant actors, conditions, or horizons are distinguished.

Brazilian Portuguese:

> Atores, condições ou horizontes relevantes são diferenciados.

Back-translation (machine):

> Relevant actors, conditions, or horizons are differentiated.

### `level:scope_discipline:3`

Status: machine

English:

> The boundaries needed to interpret consequential claims are clear, including relevant differences in actors, horizons or conditions. Every sentence need not restate those boundaries.

Brazilian Portuguese:

> Os limites necessários para interpretar afirmações com consequências são claros, incluindo diferenças relevantes entre atores, horizontes ou condições. Não é necessário que todas as frases reiterem esses limites.

Back-translation (machine):

> The boundaries necessary to interpret consequential claims are clear, including relevant differences among actors, horizons, or conditions. It is not necessary for every sentence to reiterate these boundaries.

### `level:appropriate_uncertainty:0`

Status: machine

English:

> Certainty is asserted despite explicitly limited or conflicting evidence.

Brazilian Portuguese:

> Há uma afirmação de certeza apesar de evidências explicitamente limitadas ou conflitantes.

Back-translation (machine):

> There is a claim of certainty despite explicitly limited or conflicting evidence.

### `level:appropriate_uncertainty:1`

Status: machine

English:

> Uncertainty is acknowledged but the strength of the claim is poorly matched to its support.

Brazilian Portuguese:

> A incerteza é reconhecida, mas a força da afirmação é pouco compatível com a sustentação que ela possui.

Back-translation (machine):

> Uncertainty is acknowledged, but the strength of the claim is poorly matched to the support it has.

### `level:appropriate_uncertainty:2`

Status: machine

English:

> Confidence is proportionate to the supplied evidence and important unknowns are preserved.

Brazilian Portuguese:

> O grau de confiança é proporcional às evidências fornecidas, e importantes incógnitas são preservadas.

Back-translation (machine):

> The degree of confidence is proportional to the evidence provided, and important unknowns are preserved.

### `level:appropriate_uncertainty:3`

Status: machine

English:

> Uncertainty is differentiated across claims and linked to concrete evidence limitations.

Brazilian Portuguese:

> A incerteza é diferenciada entre as afirmações e vinculada a limitações concretas das evidências.

Back-translation (machine):

> Uncertainty is differentiated among the claims and linked to concrete limitations of the evidence.

### `level:internal_coherence:0`

Status: machine

English:

> Related statements remain incompatible under the same stated assumptions after clarification.

Brazilian Portuguese:

> Afirmações relacionadas continuam incompatíveis sob os mesmos pressupostos declarados após esclarecimentos.

Back-translation (machine):

> Related claims remain incompatible under the same stated assumptions after clarifications.

### `level:internal_coherence:1`

Status: machine

English:

> A material incompatibility remains possible but partially explained.

Brazilian Portuguese:

> Uma incompatibilidade substancial continua possível, mas é parcialmente explicada.

Back-translation (machine):

> A substantial incompatibility remains possible, but is partially explained.

### `level:internal_coherence:2`

Status: machine

English:

> Related positions fit under the stated assumptions.

Brazilian Portuguese:

> As posições relacionadas são compatíveis sob os pressupostos declarados.

Back-translation (machine):

> The related positions are compatible under the stated assumptions.

### `level:internal_coherence:3`

Status: machine

English:

> The material claims fit together under their expressed assumptions and scopes; any apparent tensions are resolved by those distinctions. An already coherent account does not need to invent and then reconcile a contradiction.

Brazilian Portuguese:

> As afirmações substanciais são compatíveis entre si sob seus pressupostos e escopos expressos; quaisquer tensões aparentes são resolvidas por essas distinções. Uma explicação já coerente não precisa inventar e depois conciliar uma contradição.

Back-translation (machine):

> The substantial claims are compatible with one another under their expressed assumptions and scopes; any apparent tensions are resolved by these distinctions. An already coherent explanation does not need to invent and then reconcile a contradiction.

### `level:counterargument_engagement:0`

Status: machine

English:

> An alternative is dismissed without engaging its actual claim.

Brazilian Portuguese:

> Uma alternativa é descartada sem considerar sua afirmação real.

Back-translation (machine):

> An alternative is dismissed without considering its actual claim.

### `level:counterargument_engagement:1`

Status: machine

English:

> An alternative is acknowledged but its strongest relevant basis is omitted.

Brazilian Portuguese:

> Uma alternativa é reconhecida, mas sua fundamentação relevante mais forte é omitida.

Back-translation (machine):

> An alternative is acknowledged, but its strongest relevant grounding is omitted.

### `level:counterargument_engagement:2`

Status: machine

English:

> A serious alternative is represented fairly and addressed on its merits.

Brazilian Portuguese:

> Uma alternativa séria é apresentada de forma justa e considerada por seus próprios méritos.

Back-translation (machine):

> A serious alternative is presented fairly and considered on its own merits.

### `level:counterargument_engagement:3`

Status: machine

English:

> The participant identifies when a serious alternative could outperform their account.

Brazilian Portuguese:

> O participante identifica quando uma alternativa séria poderia superar sua explicação.

Back-translation (machine):

> The participant identifies when a serious alternative could surpass their explanation.

### `level:updateability:0`

Status: machine

English:

> The participant explicitly rules out revising the belief regardless of evidence.

Brazilian Portuguese:

> O participante exclui explicitamente a possibilidade de revisar a crença, independentemente das evidências.

Back-translation (machine):

> The participant explicitly rules out the possibility of revising the belief, regardless of the evidence.

### `level:updateability:1`

Status: machine

English:

> A vague update condition is given without specifying relevant evidence.

Brazilian Portuguese:

> Uma condição vaga para atualização é apresentada sem especificar evidências relevantes.

Back-translation (machine):

> A vague condition for updating is presented without specifying relevant evidence.

### `level:updateability:2`

Status: machine

English:

> Identifiable evidence or a development could change the stated belief.

Brazilian Portuguese:

> Evidências identificáveis ou um acontecimento poderiam mudar a crença declarada.

Back-translation (machine):

> Identifiable evidence or an event could change the stated belief.

### `level:updateability:3`

Status: machine

English:

> A specific discriminating observation is tied to a particular belief change.

Brazilian Portuguese:

> Uma observação específica capaz de distinguir entre possibilidades é vinculada a uma determinada mudança de crença.

Back-translation (machine):

> A specific observation capable of distinguishing among possibilities is linked to a particular change of belief.

### `level:grounded_understanding:0`

Status: machine

English:

> An explicitly supplied observation materially contradicts the claim it is used to support.

Brazilian Portuguese:

> Uma observação fornecida explicitamente contradiz de forma substancial a afirmação que ela é usada para sustentar.

Back-translation (machine):

> An explicitly provided observation substantially contradicts the claim it is used to support.

### `level:grounded_understanding:1`

Status: machine

English:

> An offered observation or example has a weak or unexplained connection to the claim.

Brazilian Portuguese:

> Uma observação ou um exemplo apresentado tem uma conexão fraca ou não explicada com a afirmação.

Back-translation (machine):

> A presented observation or example has a weak or unexplained connection to the claim.

### `level:grounded_understanding:2`

Status: machine

English:

> A clear connection links the offered basis to the claim, with relevant limitations.

Brazilian Portuguese:

> Uma conexão clara vincula a fundamentação apresentada à afirmação, com as limitações relevantes.

Back-translation (machine):

> A clear connection links the presented grounding to the claim, with the relevant limitations.

### `level:grounded_understanding:3`

Status: machine

English:

> The account distinguishes observation, interpretation and uncertainty, explaining the limits of the offered basis.

Brazilian Portuguese:

> A explicação distingue observação, interpretação e incerteza, explicando os limites da fundamentação apresentada.

Back-translation (machine):

> The explanation distinguishes observation, interpretation, and uncertainty, explaining the limits of the presented grounding.

### `level:catastrophic_risk:0`

Status: machine

English:

> Catastrophic outcomes are expected to be negligible or effectively avoided under the participant’s stated assumptions.

Brazilian Portuguese:

> Espera-se que resultados catastróficos sejam insignificantes ou efetivamente evitados sob os pressupostos declarados pelo participante.

Back-translation (machine):

> Catastrophic outcomes are expected to be insignificant or effectively avoided under the assumptions stated by the participant.

### `level:catastrophic_risk:1`

Status: machine

English:

> Catastrophe is possible but expected to be a limited part of the outlook under stated conditions.

Brazilian Portuguese:

> Uma catástrofe é possível, mas espera-se que seja uma parte limitada da perspectiva sob as condições declaradas.

Back-translation (machine):

> A catastrophe is possible, but is expected to be a limited part of the outlook under the stated conditions.

### `level:catastrophic_risk:2`

Status: machine

English:

> Catastrophic outcomes are a material possibility in the participant’s outlook, with consequential uncertainty or conditions.

Brazilian Portuguese:

> Resultados catastróficos são uma possibilidade substancial na perspectiva do participante, com incertezas ou condições que têm consequências.

Back-translation (machine):

> Catastrophic outcomes are a substantial possibility in the participant's outlook, with uncertainties or conditions that have consequences.

### `level:catastrophic_risk:3`

Status: machine

English:

> Catastrophic outcomes dominate the participant’s expectation under stated assumptions.

Brazilian Portuguese:

> Resultados catastróficos predominam na expectativa do participante sob as premissas declaradas.

Back-translation (machine):

> Catastrophic outcomes predominate in the participant's expectation under the stated premises.

### `Claims.levels.overall_outlook.0`

Status: machine

English:

> Overwhelmingly harmful overall.

Brazilian Portuguese:

> Impacto geral extremamente prejudicial.

Back-translation (machine):

> Extremely harmful overall impact.

### `Claims.levels.overall_outlook.1`

Status: machine

English:

> More harmful than beneficial overall.

Brazilian Portuguese:

> Impacto geral mais prejudicial do que benéfico.

Back-translation (machine):

> Overall impact more harmful than beneficial.

### `Claims.levels.overall_outlook.2`

Status: machine

English:

> A broadly balanced or limited overall impact is expected.

Brazilian Portuguese:

> Espera-se um impacto geral amplamente equilibrado ou limitado.

Back-translation (machine):

> A broadly balanced or limited overall impact is expected.

### `Claims.levels.overall_outlook.3`

Status: machine

English:

> More beneficial than harmful overall.

Brazilian Portuguese:

> Impacto geral mais benéfico do que prejudicial.

Back-translation (machine):

> Overall impact more beneficial than harmful.

### `Claims.levels.overall_outlook.4`

Status: machine

English:

> Overwhelmingly beneficial overall.

Brazilian Portuguese:

> Impacto geral extremamente benéfico.

Back-translation (machine):

> Extremely beneficial overall impact.

### `Claims.levels.outlook_orientation.0`

Status: machine

English:

> Your outlook is strongly oriented toward catastrophe or overwhelming harm.

Brazilian Portuguese:

> Sua perspectiva está fortemente orientada para uma catástrofe ou danos extremos.

Back-translation (machine):

> Their outlook is strongly oriented toward catastrophe or extreme harms.

### `Claims.levels.outlook_orientation.1`

Status: machine

English:

> Your outlook leans toward concern about harmful futures, while allowing better outcomes.

Brazilian Portuguese:

> Sua perspectiva tende à preocupação com futuros prejudiciais, embora admita resultados melhores.

Back-translation (machine):

> Their outlook tends toward concern about harmful futures, although it admits better outcomes.

### `Claims.levels.outlook_orientation.2`

Status: machine

English:

> Your outlook is mixed or undecided: neither hope nor worry clearly dominates. This is not a prediction of equal benefits and harms.

Brazilian Portuguese:

> Sua perspectiva é mista ou indefinida: nem a esperança nem a preocupação predominam claramente. Isso não é uma previsão de benefícios e danos iguais.

Back-translation (machine):

> Their outlook is mixed or undefined: neither hope nor concern clearly predominates. This is not a prediction of equal benefits and harms.

### `Claims.levels.outlook_orientation.3`

Status: machine

English:

> Your outlook leans toward beneficial futures, while allowing serious risks.

Brazilian Portuguese:

> Sua perspectiva tende a futuros benéficos, embora admita riscos graves.

Back-translation (machine):

> Their outlook tends toward beneficial futures, although it admits serious risks.

### `Claims.levels.outlook_orientation.4`

Status: machine

English:

> Your outlook is strongly oriented toward transformative flourishing.

Brazilian Portuguese:

> Sua perspectiva é fortemente orientada para uma prosperidade transformadora.

Back-translation (machine):

> Their outlook is strongly oriented toward transformative prosperity.

### `Claims.levels.capability_ceiling.0`

Status: machine

English:

> AI is expected to remain bounded tools.

Brazilian Portuguese:

> Espera-se que a IA continue sendo um conjunto de ferramentas limitadas.

Back-translation (machine):

> AI is expected to continue being a set of limited tools.

### `Claims.levels.capability_ceiling.1`

Status: machine

English:

> AI is expected to match people across most cognitive work.

Brazilian Portuguese:

> Espera-se que a IA se equipare às pessoas na maior parte do trabalho cognitivo.

Back-translation (machine):

> AI is expected to match people in most cognitive work.

### `Claims.levels.capability_ceiling.2`

Status: machine

English:

> AI is expected to substantially exceed people across cognitive work.

Brazilian Portuguese:

> Espera-se que a IA supere substancialmente as pessoas no trabalho cognitivo.

Back-translation (machine):

> AI is expected to substantially surpass people in cognitive work.

### `Claims.levels.development_pace.0`

Status: machine

English:

> Stop or substantially slow development of more capable AI.

Brazilian Portuguese:

> Interromper ou desacelerar substancialmente o desenvolvimento de uma IA mais capaz.

Back-translation (machine):

> Stop or substantially slow down the development of more capable AI.

### `Claims.levels.development_pace.1`

Status: machine

English:

> Continue development under stated safeguards.

Brazilian Portuguese:

> Continuar o desenvolvimento sob as salvaguardas declaradas.

Back-translation (machine):

> Continue development under the stated safeguards.

### `Claims.levels.development_pace.2`

Status: machine

English:

> Speed up development of more capable AI.

Brazilian Portuguese:

> Acelerar o desenvolvimento de uma IA mais capaz.

Back-translation (machine):

> Accelerate the development of more capable AI.

### `Claims.levels.deployment_policy.0`

Status: machine

English:

> Restrict the AI uses discussed until prior protections or permission are in place.

Brazilian Portuguese:

> Restringir os usos da IA discutidos até que proteções prévias ou uma autorização estejam em vigor.

Back-translation (machine):

> Restrict the discussed uses of AI until prior protections or an authorization are in effect.

### `Claims.levels.deployment_policy.1`

Status: machine

English:

> Allow the AI uses discussed with targeted accountability and protections.

Brazilian Portuguese:

> Permitir os usos da IA discutidos com responsabilização e proteções específicas.

Back-translation (machine):

> Allow the discussed uses of AI with accountability and specific protections.

### `Claims.levels.deployment_policy.2`

Status: machine

English:

> Minimize restrictions on the AI uses discussed.

Brazilian Portuguese:

> Minimizar as restrições aos usos da IA discutidos.

Back-translation (machine):

> Minimize restrictions on the discussed uses of AI.

### `Claims.levels.access_policy.0`

Status: machine

English:

> Restrict access to powerful AI.

Brazilian Portuguese:

> Restringir o acesso à IA poderosa.

Back-translation (machine):

> Restrict access to powerful AI.

### `Claims.levels.access_policy.1`

Status: machine

English:

> Allow access subject to capability or use restrictions.

Brazilian Portuguese:

> Permitir o acesso sujeito a restrições de capacidade ou de uso.

Back-translation (machine):

> Allow access subject to capability or use restrictions.

### `Claims.levels.access_policy.2`

Status: machine

English:

> Favor broad or open access to powerful AI.

Brazilian Portuguese:

> Favorecer o acesso amplo ou aberto à IA poderosa.

Back-translation (machine):

> Favor broad or open access to powerful AI.

### `Claims.levels.influence.0`

Status: machine

English:

> Human choices have almost no influence over the eventual AI outcome.

Brazilian Portuguese:

> As escolhas humanas quase não influenciam o resultado final da IA.

Back-translation (machine):

> Human choices have almost no influence on the final outcome of AI.

### `Claims.levels.influence.1`

Status: machine

English:

> Human choices can make limited changes, but dominant forces constrain the outcome.

Brazilian Portuguese:

> As escolhas humanas podem produzir mudanças limitadas, mas forças dominantes restringem o resultado.

Back-translation (machine):

> Human choices can produce limited changes, but dominant forces constrain the outcome.

### `Claims.levels.influence.2`

Status: machine

English:

> Human choices have meaningful but substantially constrained influence.

Brazilian Portuguese:

> As escolhas humanas têm uma influência significativa, mas substancialmente limitada.

Back-translation (machine):

> Human choices have significant but substantially limited influence.

### `Claims.levels.influence.3`

Status: machine

English:

> Human choices can substantially redirect the AI trajectory.

Brazilian Portuguese:

> As escolhas humanas podem redirecionar substancialmente a trajetória da IA.

Back-translation (machine):

> Human choices can substantially redirect the trajectory of AI.

### `Claims.levels.influence.4`

Status: machine

English:

> Human choices are decisive: very different AI futures remain within collective reach.

Brazilian Portuguese:

> As escolhas humanas são decisivas: futuros muito diferentes para a IA permanecem ao alcance coletivo.

Back-translation (machine):

> Human choices are decisive: very different futures for AI remain within collective reach.

### `Claims.levels.transformation.0`

Status: machine

English:

> AI is expected to cause little lasting societal change.

Brazilian Portuguese:

> Espera-se que a IA cause poucas mudanças sociais duradouras.

Back-translation (machine):

> AI is expected to cause few lasting social changes.

### `Claims.levels.transformation.1`

Status: machine

English:

> AI is expected to bring incremental improvements and disruptions within familiar institutions.

Brazilian Portuguese:

> Espera-se que a IA traga melhorias incrementais e disrupções dentro de instituições conhecidas.

Back-translation (machine):

> AI is expected to bring incremental improvements and disruptions within familiar institutions.

### `Claims.levels.transformation.2`

Status: machine

English:

> AI is expected to substantially change several sectors of society.

Brazilian Portuguese:

> Espera-se que a IA transforme substancialmente vários setores da sociedade.

Back-translation (machine):

> AI is expected to substantially transform several sectors of society.

### `Claims.levels.transformation.3`

Status: machine

English:

> AI is expected to restructure economies, institutions and everyday life broadly.

Brazilian Portuguese:

> Espera-se que a IA reestruture amplamente as economias, as instituições e a vida cotidiana.

Back-translation (machine):

> AI is expected to broadly restructure economies, institutions, and everyday life.

### `Claims.levels.transformation.4`

Status: machine

English:

> AI is expected to fundamentally transform civilization or humanity’s continued existence.

Brazilian Portuguese:

> Espera-se que a IA transforme fundamentalmente a civilização ou a continuidade da existência da humanidade.

Back-translation (machine):

> AI is expected to fundamentally transform civilization or the continuity of humanity's existence.

### `Claims.uncertain`

Status: machine

English:

> You expressed uncertainty here rather than a directional expectation.

Brazilian Portuguese:

> Você expressou incerteza aqui, em vez de uma expectativa direcional.

Back-translation (machine):

> You expressed uncertainty here, rather than a directional expectation.

### `Claims.unestablished`

Status: machine

English:

> A directional position is not yet established by these answers.

Brazilian Portuguese:

> Estas respostas ainda não estabelecem uma posição direcional.

Back-translation (machine):

> These responses do not yet establish a directional position.

### `Claims.unresolved`

Status: machine

English:

> The interpretation of these answers still needs clarification.

Brazilian Portuguese:

> A interpretação destas respostas ainda precisa ser esclarecida.

Back-translation (machine):

> The interpretation of these responses still needs to be clarified.

### `Claims.readings`

Status: machine

English:

> Several readings remain plausible: {readings}

Brazilian Portuguese:

> Várias interpretações continuam plausíveis: {readings}

Back-translation (machine):

> Several interpretations remain plausible: {readings}

### `Claims.unplacedUncertain.capability_trajectory`

Status: machine

English:

> You expressed uncertainty about whether or when transformative AI arrives.

Brazilian Portuguese:

> Você expressou incerteza sobre se ou quando a IA transformadora chegará.

Back-translation (machine):

> You expressed uncertainty about whether or when transformative AI will arrive.

### `Claims.unplacedUncertain.transition_dynamics`

Status: machine

English:

> You expressed uncertainty about how quickly AI-driven change unfolds.

Brazilian Portuguese:

> Você expressou incerteza sobre a rapidez com que as mudanças impulsionadas pela IA ocorrerão.

Back-translation (machine):

> You expressed uncertainty about how quickly AI-driven changes will occur.

### `Claims.unplacedUncertain.beneficial_potential`

Status: machine

English:

> You expressed uncertainty about the positive impact you expect from AI.

Brazilian Portuguese:

> Você expressou incerteza sobre o impacto positivo que espera da IA.

Back-translation (machine):

> You expressed uncertainty about the positive impact you expect from AI.

### `Claims.unplacedUncertain.risk_landscape`

Status: machine

English:

> You expressed uncertainty about the harm you expect from AI.

Brazilian Portuguese:

> Você expressou incerteza sobre os danos que espera da IA.

Back-translation (machine):

> You expressed uncertainty about the harms you expect from AI.

### `Claims.unplacedUncertain.technical_controllability`

Status: machine

English:

> You expressed uncertainty about whether technical control of powerful AI will work.

Brazilian Portuguese:

> Você expressou incerteza sobre se o controle técnico da IA poderosa funcionará.

Back-translation (machine):

> You expressed uncertainty about whether the technical control of powerful AI will work.

### `Claims.unplacedUncertain.institutional_competence`

Status: machine

English:

> You expressed uncertainty about how effectively institutions will respond.

Brazilian Portuguese:

> Você expressou incerteza sobre a eficácia da resposta das instituições.

Back-translation (machine):

> You expressed uncertainty about the effectiveness of the institutions' response.

### `Claims.unplacedUncertain.human_agency`

Status: machine

English:

> You expressed uncertainty about what happens to the forms of agency you value.

Brazilian Portuguese:

> Você expressou incerteza sobre o que acontecerá com as formas de agência que você valoriza.

Back-translation (machine):

> You expressed uncertainty about what will happen to the forms of agency you value.

### `Claims.unplacedUncertain.action_posture`

Status: machine

English:

> You expressed uncertainty about which development or policy response you prefer.

Brazilian Portuguese:

> Você expressou incerteza sobre qual resposta de desenvolvimento ou política prefere.

Back-translation (machine):

> You expressed uncertainty about which development or policy response you prefer.

### `Claims.unplacedUncertain.catastrophic_risk`

Status: machine

English:

> You expressed uncertainty about the prospect of catastrophic or irreversible harm.

Brazilian Portuguese:

> Você expressou incerteza sobre a possibilidade de danos catastróficos ou irreversíveis.

Back-translation (machine):

> You expressed uncertainty about the possibility of catastrophic or irreversible harms.

### `Claims.unplacedUnestablished.capability_trajectory`

Status: machine

English:

> These answers do not yet establish whether or when transformative AI arrives.

Brazilian Portuguese:

> Estas respostas ainda não estabelecem se ou quando a IA transformadora chegará.

Back-translation (machine):

> These responses do not yet establish whether or when transformative AI will arrive.

### `Claims.unplacedUnestablished.transition_dynamics`

Status: machine

English:

> These answers do not yet establish how quickly AI-driven change unfolds.

Brazilian Portuguese:

> Estas respostas ainda não estabelecem a rapidez com que as mudanças impulsionadas pela IA ocorrerão.

Back-translation (machine):

> These responses do not yet establish how quickly AI-driven changes will occur.

### `Claims.unplacedUnestablished.beneficial_potential`

Status: machine

English:

> These answers do not yet establish the positive impact you expect from AI.

Brazilian Portuguese:

> Estas respostas ainda não estabelecem o impacto positivo que você espera da IA.

Back-translation (machine):

> These responses do not yet establish the positive impact you expect from AI.

### `Claims.unplacedUnestablished.risk_landscape`

Status: machine

English:

> These answers do not yet establish the harm you expect from AI.

Brazilian Portuguese:

> Estas respostas ainda não estabelecem os danos que você espera da IA.

Back-translation (machine):

> These responses do not yet establish the harms you expect from AI.

### `Claims.unplacedUnestablished.technical_controllability`

Status: machine

English:

> These answers do not yet establish whether technical control of powerful AI will work.

Brazilian Portuguese:

> Estas respostas ainda não estabelecem se o controle técnico de uma IA poderosa funcionará.

Back-translation (machine):

> These responses do not yet establish whether the technical control of powerful AI will work.

### `Claims.unplacedUnestablished.institutional_competence`

Status: machine

English:

> These answers do not yet establish how effectively institutions will respond.

Brazilian Portuguese:

> Estas respostas ainda não estabelecem com que eficácia as instituições responderão.

Back-translation (machine):

> These responses do not yet establish how effectively institutions will respond.

### `Claims.unplacedUnestablished.human_agency`

Status: machine

English:

> These answers do not yet establish what happens to the forms of agency you value.

Brazilian Portuguese:

> Estas respostas ainda não estabelecem o que acontecerá com as formas de agência que você valoriza.

Back-translation (machine):

> These answers still do not establish what will happen to the forms of agency that you value.

### `Claims.unplacedUnestablished.action_posture`

Status: machine

English:

> These answers do not yet establish which development or policy response you prefer.

Brazilian Portuguese:

> Estas respostas ainda não estabelecem qual resposta de desenvolvimento ou de política você prefere.

Back-translation (machine):

> These answers still do not establish which development or policy response you prefer.

### `Claims.unplacedUnestablished.catastrophic_risk`

Status: machine

English:

> These answers do not yet establish the prospect of catastrophic or irreversible harm.

Brazilian Portuguese:

> Estas respostas ainda não estabelecem a possibilidade de danos catastróficos ou irreversíveis.

Back-translation (machine):

> These answers still do not establish the possibility of catastrophic or irreversible harms.

### `Claims.facetUnsettled`

Status: machine

English:

> You have not settled on a position here.

Brazilian Portuguese:

> Você ainda não definiu uma posição aqui.

Back-translation (machine):

> You have not yet defined a position here.

### `Claims.axisUnsettled`

Status: machine

English:

> You have not settled on this. The point marks the center of the open range, not a moderate belief.

Brazilian Portuguese:

> Você ainda não definiu uma posição sobre isso. O ponto marca o centro do intervalo em aberto, não uma crença moderada.

Back-translation (machine):

> You have not yet defined a position on this. The point marks the center of the open interval, not a moderate belief.

### `Claims.axisTentative`

Status: machine

English:

> A tentative estimate from your answers; the wider range shows other plausible readings.

Brazilian Portuguese:

> Uma estimativa provisória com base nas suas respostas; o intervalo mais amplo mostra outras interpretações plausíveis.

Back-translation (machine):

> A provisional estimate based on your answers; the broader interval shows other plausible interpretations.

### `Claims.timelineExpressed`

Status: machine

English:

> Timing expressed in answer {number}; see the full answer for its scope and uncertainty.

Brazilian Portuguese:

> Horizonte temporal expresso na resposta {number}; veja a resposta completa para entender seu escopo e sua incerteza.

Back-translation (machine):

> Time horizon expressed in answer {number}; see the full answer to understand its scope and uncertainty.

### `Claims.timelineUnsettled`

Status: machine

English:

> You have not settled on a timeline.

Brazilian Portuguese:

> Você ainda não definiu um horizonte temporal.

Back-translation (machine):

> You have not yet defined a time horizon.
