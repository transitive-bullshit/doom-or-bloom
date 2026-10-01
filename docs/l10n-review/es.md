# Spanish review packet

Generated 2026-10-01 for `es` (es), content 0.4.0-draft and rubric 0.1.0-draft. Statuses: 140 machine.

Only these strings need a native speaker before they are treated as final: the root question, the recovery and retry copy, and the wording of result claims. Everything else may stay machine-translated. Check that each translation keeps the English meaning and degree, adds no loaded premise, reads neutrally and naturally, and leaves Doom, Bloom, Doom or Bloom and P(doom) untranslated. Placeholders such as `{readings}` and ICU syntax must stay as they are.

Send corrections as edits to `content/l10n/es/releases/0.4.0-draft.json`, `content/l10n/es/rubrics/0.1.0-draft.json` or `messages/es.json` (with their `content/l10n/es/messages.json` hashes refreshed by `pnpm l10n:translate --locale=es --only-stale`). Record the completed review with `pnpm l10n:review --locale=es --approve=<reviewer>`.

## Root question

### `prompt:root:text`

Status: machine

English:

> What do you think AI means for our future—and why?

Spanish:

> ¿Qué crees que significa la IA para nuestro futuro y por qué?

Back-translation (machine):

> What do you think AI means for our future and why?

## Recovery and retry copy

### `prompt:root:reask` (used by 47 questions)

Status: machine

English:

> I could not connect that answer to this question. A few words about your view are enough—want to try again?

Spanish:

> No pude relacionar esa respuesta con esta pregunta. Bastan unas pocas palabras sobre tu visión. ¿Quieres intentarlo de nuevo?

Back-translation (machine):

> I could not relate that answer to this question. Just a few words about your view are enough. Do you want to try again?

### `prompt:root:clarification` (used by 47 questions)

Status: machine

English:

> I am not sure how to read that. Could you say a little more about what you mean?

Spanish:

> No sé bien cómo interpretar eso. ¿Podrías explicar un poco más qué quieres decir?

Back-translation (machine):

> I am not sure how to interpret that. Could you explain a little more what you mean?

### `prompt:root:exhausted` (used by 47 questions)

Status: machine

English:

> Let’s pause here. You can try a different question, stop for now, or restart.

Spanish:

> Hagamos una pausa aquí. Puedes probar con otra pregunta, detenerte por ahora o empezar de nuevo.

Back-translation (machine):

> Let us pause here. You can try another question, stop for now, or start again.

### `prompt:risk.cyber-balance:reask` (used by 3 questions)

Status: machine

English:

> Do you think AI will help cyberattackers or defenders more, and why?

Spanish:

> ¿Crees que la IA ayudará más a los ciberatacantes o a los defensores y por qué?

Back-translation (machine):

> Do you think AI will help cyberattackers or defenders more, and why?

### `Interview.failedTitle`

Status: machine

English:

> This step did not finish

Spanish:

> Este paso no terminó

Back-translation (machine):

> This step did not finish

### `Interview.failure.providerRejected`

Status: machine

English:

> Our AI provider, TypeSafe (Jev), rejected this request. Your submission is saved. Please try again later.

Spanish:

> Nuestro proveedor de IA, TypeSafe (Jev), rechazó esta solicitud. Tu envío está guardado. Inténtalo de nuevo más tarde.

Back-translation (machine):

> Our AI provider, TypeSafe (Jev), rejected this request. Your submission is saved. Try again later.

### `Interview.failure.saved`

Status: machine

English:

> Your submission is saved and your previous progress is unchanged. Please try again when you’re ready.

Spanish:

> Tu envío está guardado y tu progreso anterior no cambió. Inténtalo de nuevo cuando quieras.

Back-translation (machine):

> Your submission is saved and your previous progress did not change. Try again whenever you want.

### `Interview.retrySaved`

Status: machine

English:

> Retry saved submission

Spanish:

> Reintentar el envío guardado

Back-translation (machine):

> Retry the saved submission

### `Interview.recovery.paperclipsTitle`

Status: machine

English:

> We’ve made some paperclips.

Spanish:

> Hicimos algunos clips

Back-translation (machine):

> We made some clips

### `Interview.recovery.chooseTitle`

Status: machine

English:

> Choose what to do next

Spanish:

> Elige qué hacer ahora

Back-translation (machine):

> Choose what to do now

### `Interview.recovery.retryTitle`

Status: machine

English:

> Another try?

Spanish:

> ¿Otro intento?

Back-translation (machine):

> Another attempt?

### `Interview.recovery.paperclips`

Status: machine

English:

> You found the easter egg! Now let's get back to business...

Spanish:

> ¡Encontraste el huevo de Pascua! Ahora volvamos a lo nuestro…

Back-translation (machine):

> You found the Easter egg! Now let us get back to our thing…

### `Interview.recovery.stopped`

Status: machine

English:

> Your progress is here whenever you want to return.

Spanish:

> Tu progreso te espera aquí cuando quieras volver.

Back-translation (machine):

> Your progress is waiting for you here whenever you want to return.

### `Interview.recovery.navigation`

Status: machine

English:

> Use the actions below to choose what happens next.

Spanish:

> Usa las acciones de abajo para elegir qué pasa ahora.

Back-translation (machine):

> Use the actions below to choose what happens now.

### `Interview.tryAgain`

Status: machine

English:

> Try again

Spanish:

> Intentar de nuevo

Back-translation (machine):

> Try again

### `Interview.differentQuestion`

Status: machine

English:

> Try a different question

Spanish:

> Probar otra pregunta

Back-translation (machine):

> Try another question

## Result claims

Rubric levels (`level:*`) and the claims built in code (`Claims.*`) describe what the participant’s answers suggest. They are interpretations, not facts, and must keep their hedges.

### `level:capability_trajectory:0`

Status: machine

English:

> Transformative capability is not expected, or a low ceiling is explicitly anticipated.

Spanish:

> No se espera una capacidad transformadora, o se prevé explícitamente un límite bajo.

Back-translation (machine):

> Transformative capability is not expected, or a low limit is explicitly anticipated.

### `level:capability_trajectory:1`

Status: machine

English:

> Transformative capability is expected only on a long or indefinite horizon.

Spanish:

> Solo se espera una capacidad transformadora en un horizonte lejano o indefinido.

Back-translation (machine):

> Transformative capability is expected only on a distant or indefinite horizon.

### `level:capability_trajectory:2`

Status: machine

English:

> Transformative capability is expected within decades, with timing conditional or uncertain.

Spanish:

> Se espera una capacidad transformadora en cuestión de décadas, con plazos condicionales o inciertos.

Back-translation (machine):

> Transformative capability is expected within decades, with conditional or uncertain timelines.

### `level:capability_trajectory:3`

Status: machine

English:

> Transformative capability is expected within years, with named milestones or timing.

Spanish:

> Se espera una capacidad transformadora en cuestión de años, con hitos o plazos específicos.

Back-translation (machine):

> Transformative capability is expected within years, with specific milestones or timelines.

### `level:transition_dynamics:0`

Status: machine

English:

> A gradual transition with substantial warning and broad diffusion is expected.

Spanish:

> Se espera una transición gradual, con advertencias sustanciales y una amplia difusión.

Back-translation (machine):

> A gradual transition is expected, with substantial warnings and broad diffusion.

### `level:transition_dynamics:1`

Status: machine

English:

> Noticeable acceleration is expected but meaningful adaptation time remains.

Spanish:

> Se espera una aceleración perceptible, pero seguirá habiendo un tiempo considerable para la adaptación.

Back-translation (machine):

> A perceptible acceleration is expected, but there will still be considerable time for adaptation.

### `level:transition_dynamics:2`

Status: machine

English:

> A fast transition with limited warning is expected.

Spanish:

> Se espera una transición rápida con advertencias limitadas.

Back-translation (machine):

> A rapid transition with limited warnings is expected.

### `level:transition_dynamics:3`

Status: machine

English:

> An abrupt self-reinforcing transition with very little warning is expected.

Spanish:

> Se espera una transición abrupta que se refuerce a sí misma, con muy pocas advertencias.

Back-translation (machine):

> An abrupt, self-reinforcing transition is expected, with very few warnings.

### `level:beneficial_potential:0`

Status: machine

English:

> Little positive impact is expected even if advanced AI arrives.

Spanish:

> Se espera poco impacto positivo, incluso si llega la IA avanzada.

Back-translation (machine):

> Little positive impact is expected, even if advanced AI arrives.

### `level:beneficial_potential:1`

Status: machine

English:

> Limited or narrowly distributed gains are expected.

Spanish:

> Se esperan beneficios limitados o con una distribución restringida.

Back-translation (machine):

> Limited benefits or benefits with restricted distribution are expected.

### `level:beneficial_potential:2`

Status: machine

English:

> Substantial benefits are expected, with important conditions or distribution limits.

Spanish:

> Se esperan beneficios sustanciales, con condiciones importantes o límites en su distribución.

Back-translation (machine):

> Substantial benefits are expected, with important conditions or limits on their distribution.

### `level:beneficial_potential:3`

Status: machine

English:

> Transformative, broadly valuable gains are expected.

Spanish:

> Se esperan beneficios transformadores y de gran valor para muchos.

Back-translation (machine):

> Transformative benefits of great value to many are expected.

### `level:risk_landscape:0`

Status: machine

English:

> Little material adverse impact is expected.

Spanish:

> Se espera poco impacto adverso significativo.

Back-translation (machine):

> Little significant adverse impact is expected.

### `level:risk_landscape:1`

Status: machine

English:

> Manageable or localized harms are expected.

Spanish:

> Se esperan daños manejables o localizados.

Back-translation (machine):

> Manageable or localized harms are expected.

### `level:risk_landscape:2`

Status: machine

English:

> Severe or widespread harm is a material expected part of the future.

Spanish:

> Se espera que los daños graves o generalizados sean una parte significativa del futuro.

Back-translation (machine):

> Serious or widespread harms are expected to be a significant part of the future.

### `level:risk_landscape:3`

Status: machine

English:

> Catastrophic or irreversible loss is central to the expected future.

Spanish:

> Las pérdidas catastróficas o irreversibles ocupan un lugar central en el futuro esperado.

Back-translation (machine):

> Catastrophic or irreversible losses occupy a central place in the expected future.

### `level:technical_controllability:0`

Status: machine

English:

> Reliable technical control is expected to be infeasible.

Spanish:

> Se espera que un control técnico fiable sea inviable.

Back-translation (machine):

> Reliable technical control is expected to be unviable.

### `level:technical_controllability:1`

Status: machine

English:

> Control is expected to be very difficult and unreliable.

Spanish:

> Se espera que el control sea muy difícil y poco fiable.

Back-translation (machine):

> Control is expected to be very difficult and unreliable.

### `level:technical_controllability:2`

Status: machine

English:

> Control is expected to be feasible under demanding conditions.

Spanish:

> Se espera que el control sea viable bajo condiciones exigentes.

Back-translation (machine):

> Control is expected to be viable under demanding conditions.

### `level:technical_controllability:3`

Status: machine

English:

> Reliable technical control is expected to be broadly feasible.

Spanish:

> Se espera que un control técnico fiable sea viable en términos generales.

Back-translation (machine):

> Reliable technical control is expected to be viable in general terms.

### `level:institutional_competence:0`

Status: machine

English:

> Institutions are expected to fail to respond effectively.

Spanish:

> Se espera que las instituciones no respondan eficazmente.

Back-translation (machine):

> Institutions are expected not to respond effectively.

### `level:institutional_competence:1`

Status: machine

English:

> Institutions are expected to respond too weakly or too late in many cases.

Spanish:

> Se espera que, en muchos casos, las instituciones respondan con demasiada debilidad o demasiado tarde.

Back-translation (machine):

> In many cases, institutions are expected to respond too weakly or too late.

### `level:institutional_competence:2`

Status: machine

English:

> Effective responses are expected under specific coordination conditions.

Spanish:

> Se esperan respuestas eficaces bajo condiciones específicas de coordinación.

Back-translation (machine):

> Effective responses are expected under specific coordination conditions.

### `level:institutional_competence:3`

Status: machine

English:

> Institutions are expected to adapt effectively and in time.

Spanish:

> Se espera que las instituciones se adapten eficazmente y a tiempo.

Back-translation (machine):

> Institutions are expected to adapt effectively and in time.

### `level:human_agency:0`

Status: machine

English:

> The expected future undermines or eliminates the forms of agency/continuity the participant explicitly values.

Spanish:

> El futuro esperado socava o elimina las formas de agencia o continuidad que el participante valora explícitamente.

Back-translation (machine):

> The expected future undermines or eliminates the forms of agency or continuity that the participant explicitly values.

### `level:human_agency:1`

Status: machine

English:

> Significant valued agency or continuity is expected to be lost.

Spanish:

> Se espera perder una parte significativa de la agencia o continuidad valoradas.

Back-translation (machine):

> A significant part of the valued agency or continuity is expected to be lost.

### `level:human_agency:2`

Status: machine

English:

> Valued agency/continuity is expected to be substantially preserved, with changes or conditions.

Spanish:

> Se espera preservar sustancialmente la agencia o continuidad valoradas, con cambios o condiciones.

Back-translation (machine):

> The valued agency or continuity is expected to be substantially preserved, with changes or conditions.

### `level:human_agency:3`

Status: machine

English:

> Valued agency/continuity is expected to expand or flourish.

Spanish:

> Se espera que la agencia o continuidad valoradas se amplíen o prosperen.

Back-translation (machine):

> The valued agency or continuity is expected to expand or prosper.

### `level:action_posture:0`

Status: machine

English:

> A broad pause or substantial slowing is preferred.

Spanish:

> Se prefiere una pausa amplia o una desaceleración sustancial.

Back-translation (machine):

> A broad pause or a substantial slowdown is preferred.

### `level:action_posture:1`

Status: machine

English:

> Restrained development and strong prior safeguards are preferred.

Spanish:

> Se prefiere un desarrollo moderado con sólidas salvaguardias previas.

Back-translation (machine):

> Moderate development with strong prior safeguards is preferred.

### `level:action_posture:2`

Status: machine

English:

> Continued development with targeted safeguards is preferred.

Spanish:

> Se prefiere continuar el desarrollo con salvaguardias específicas.

Back-translation (machine):

> Continuing development with specific safeguards is preferred.

### `level:action_posture:3`

Status: machine

English:

> Rapid development or broad access is preferred.

Spanish:

> Se prefiere un desarrollo rápido o un acceso amplio.

Back-translation (machine):

> Rapid development or broad access is preferred.

### `level:causal_clarity:0`

Status: machine

English:

> An outcome is asserted without a supporting mechanism.

Spanish:

> Se afirma un resultado sin un mecanismo que lo sustente.

Back-translation (machine):

> An outcome is asserted without a mechanism that supports it.

### `level:causal_clarity:1`

Status: machine

English:

> A causal factor is named but its connection to the outcome is not explained.

Spanish:

> Se menciona un factor causal, pero no se explica su conexión con el resultado.

Back-translation (machine):

> A causal factor is mentioned, but its connection to the outcome is not explained.

### `level:causal_clarity:2`

Status: machine

English:

> A coherent mechanism connects a cause to an outcome with a relevant condition.

Spanish:

> Un mecanismo coherente conecta una causa con un resultado bajo una condición pertinente.

Back-translation (machine):

> A coherent mechanism connects a cause with an outcome under a relevant condition.

### `level:causal_clarity:3`

Status: machine

English:

> A mechanism is developed with dependencies, limitations, or potential failure points.

Spanish:

> Se desarrolla un mecanismo con sus dependencias, limitaciones o posibles puntos de fallo.

Back-translation (machine):

> A mechanism is developed with its dependencies, limitations, or possible points of failure.

### `level:scope_discipline:0`

Status: machine

English:

> Materially different scopes are conflated without qualification.

Spanish:

> Se confunden alcances sustancialmente diferentes sin matización alguna.

Back-translation (machine):

> Substantially different scopes are confused without any qualification.

### `level:scope_discipline:1`

Status: machine

English:

> Some scope is specified but material boundaries remain blurred.

Spanish:

> Se especifica parte del alcance, pero algunos límites sustanciales siguen siendo difusos.

Back-translation (machine):

> Part of the scope is specified, but some substantial boundaries remain diffuse.

### `level:scope_discipline:2`

Status: machine

English:

> Relevant actors, conditions, or horizons are distinguished.

Spanish:

> Se distinguen los actores, las condiciones o los horizontes pertinentes.

Back-translation (machine):

> The relevant actors, conditions, or horizons are distinguished.

### `level:scope_discipline:3`

Status: machine

English:

> The boundaries needed to interpret consequential claims are clear, including relevant differences in actors, horizons or conditions. Every sentence need not restate those boundaries.

Spanish:

> Los límites necesarios para interpretar afirmaciones trascendentes están claros, incluidas las diferencias pertinentes entre actores, horizontes o condiciones. No es necesario que cada oración vuelva a enunciar esos límites.

Back-translation (machine):

> The boundaries necessary to interpret consequential claims are clear, including the relevant differences between actors, horizons, or conditions. It is not necessary for every sentence to restate those boundaries.

### `level:appropriate_uncertainty:0`

Status: machine

English:

> Certainty is asserted despite explicitly limited or conflicting evidence.

Spanish:

> Se afirma certeza pese a que las pruebas son explícitamente limitadas o contradictorias.

Back-translation (machine):

> Certainty is asserted despite the evidence being explicitly limited or contradictory.

### `level:appropriate_uncertainty:1`

Status: machine

English:

> Uncertainty is acknowledged but the strength of the claim is poorly matched to its support.

Spanish:

> Se reconoce la incertidumbre, pero la contundencia de la afirmación no se corresponde bien con el respaldo que tiene.

Back-translation (machine):

> Uncertainty is acknowledged, but the forcefulness of the claim does not correspond well with the support it has.

### `level:appropriate_uncertainty:2`

Status: machine

English:

> Confidence is proportionate to the supplied evidence and important unknowns are preserved.

Spanish:

> El grado de confianza es proporcional a las pruebas aportadas y se mantienen las incógnitas importantes.

Back-translation (machine):

> The degree of confidence is proportional to the evidence provided, and important unknowns are maintained.

### `level:appropriate_uncertainty:3`

Status: machine

English:

> Uncertainty is differentiated across claims and linked to concrete evidence limitations.

Spanish:

> La incertidumbre se diferencia entre las distintas afirmaciones y se vincula con limitaciones concretas de las pruebas.

Back-translation (machine):

> Uncertainty is differentiated among the different claims and is linked to specific limitations of the evidence.

### `level:internal_coherence:0`

Status: machine

English:

> Related statements remain incompatible under the same stated assumptions after clarification.

Spanish:

> Tras una aclaración, las afirmaciones relacionadas siguen siendo incompatibles bajo los mismos supuestos declarados.

Back-translation (machine):

> After a clarification, the related claims remain incompatible under the same stated assumptions.

### `level:internal_coherence:1`

Status: machine

English:

> A material incompatibility remains possible but partially explained.

Spanish:

> Sigue siendo posible una incompatibilidad sustancial, aunque se explica parcialmente.

Back-translation (machine):

> A substantial incompatibility remains possible, although it is partially explained.

### `level:internal_coherence:2`

Status: machine

English:

> Related positions fit under the stated assumptions.

Spanish:

> Las posiciones relacionadas son compatibles bajo los supuestos declarados.

Back-translation (machine):

> The related positions are compatible under the stated assumptions.

### `level:internal_coherence:3`

Status: machine

English:

> The material claims fit together under their expressed assumptions and scopes; any apparent tensions are resolved by those distinctions. An already coherent account does not need to invent and then reconcile a contradiction.

Spanish:

> Las afirmaciones sustanciales encajan entre sí bajo los supuestos y alcances expresados; cualquier tensión aparente queda resuelta por esas distinciones. Una explicación que ya es coherente no necesita inventar una contradicción para luego resolverla.

Back-translation (machine):

> The substantial claims fit together under the expressed assumptions and scopes; any apparent tension is resolved by those distinctions. An explanation that is already coherent does not need to invent a contradiction and then resolve it.

### `level:counterargument_engagement:0`

Status: machine

English:

> An alternative is dismissed without engaging its actual claim.

Spanish:

> Se descarta una alternativa sin abordar lo que realmente afirma.

Back-translation (machine):

> An alternative is dismissed without addressing what it actually claims.

### `level:counterargument_engagement:1`

Status: machine

English:

> An alternative is acknowledged but its strongest relevant basis is omitted.

Spanish:

> Se reconoce una alternativa, pero se omite su fundamento pertinente más sólido.

Back-translation (machine):

> An alternative is acknowledged, but its strongest relevant basis is omitted.

### `level:counterargument_engagement:2`

Status: machine

English:

> A serious alternative is represented fairly and addressed on its merits.

Spanish:

> Se presenta de manera justa una alternativa seria y se aborda por sus propios méritos.

Back-translation (machine):

> A serious alternative is presented fairly and addressed on its own merits.

### `level:counterargument_engagement:3`

Status: machine

English:

> The participant identifies when a serious alternative could outperform their account.

Spanish:

> El participante identifica en qué casos una alternativa seria podría explicar mejor que su propia explicación.

Back-translation (machine):

> The participant identifies in which cases a serious alternative might explain better than their own explanation.

### `level:updateability:0`

Status: machine

English:

> The participant explicitly rules out revising the belief regardless of evidence.

Spanish:

> El participante descarta explícitamente revisar la creencia independientemente de las pruebas.

Back-translation (machine):

> The participant explicitly rules out revising the belief regardless of the evidence.

### `level:updateability:1`

Status: machine

English:

> A vague update condition is given without specifying relevant evidence.

Spanish:

> Se proporciona una condición imprecisa para actualizar la creencia sin especificar pruebas pertinentes.

Back-translation (machine):

> An imprecise condition for updating the belief is provided without specifying relevant evidence.

### `level:updateability:2`

Status: machine

English:

> Identifiable evidence or a development could change the stated belief.

Spanish:

> Pruebas identificables o un acontecimiento podrían cambiar la creencia declarada.

Back-translation (machine):

> Identifiable evidence or an event could change the stated belief.

### `level:updateability:3`

Status: machine

English:

> A specific discriminating observation is tied to a particular belief change.

Spanish:

> Una observación específica que permite distinguir entre posibilidades se vincula con un cambio concreto de creencia.

Back-translation (machine):

> A specific observation that makes it possible to distinguish between possibilities is linked to a concrete change in belief.

### `level:grounded_understanding:0`

Status: machine

English:

> An explicitly supplied observation materially contradicts the claim it is used to support.

Spanish:

> Una observación proporcionada explícitamente contradice de manera sustancial la afirmación que pretende respaldar.

Back-translation (machine):

> An explicitly provided observation substantially contradicts the claim it is intended to support.

### `level:grounded_understanding:1`

Status: machine

English:

> An offered observation or example has a weak or unexplained connection to the claim.

Spanish:

> Una observación o un ejemplo aportados tienen una conexión débil o no explicada con la afirmación.

Back-translation (machine):

> A provided observation or example has a weak or unexplained connection with the claim.

### `level:grounded_understanding:2`

Status: machine

English:

> A clear connection links the offered basis to the claim, with relevant limitations.

Spanish:

> Una conexión clara vincula el fundamento aportado con la afirmación, teniendo en cuenta las limitaciones pertinentes.

Back-translation (machine):

> A clear connection links the provided basis with the claim, taking into account the relevant limitations.

### `level:grounded_understanding:3`

Status: machine

English:

> The account distinguishes observation, interpretation and uncertainty, explaining the limits of the offered basis.

Spanish:

> La explicación distingue entre observación, interpretación e incertidumbre, y explica los límites del fundamento aportado.

Back-translation (machine):

> The explanation distinguishes between observation, interpretation, and uncertainty, and explains the limits of the provided basis.

### `level:catastrophic_risk:0`

Status: machine

English:

> Catastrophic outcomes are expected to be negligible or effectively avoided under the participant’s stated assumptions.

Spanish:

> Se espera que los resultados catastróficos sean insignificantes o se eviten de manera efectiva bajo los supuestos declarados por el participante.

Back-translation (machine):

> Catastrophic outcomes are expected to be negligible or effectively avoided under the assumptions stated by the participant.

### `level:catastrophic_risk:1`

Status: machine

English:

> Catastrophe is possible but expected to be a limited part of the outlook under stated conditions.

Spanish:

> Una catástrofe es posible, pero se espera que constituya una parte limitada de la perspectiva bajo las condiciones declaradas.

Back-translation (machine):

> A catastrophe is possible, but it is expected to constitute a limited part of the outlook under the stated conditions.

### `level:catastrophic_risk:2`

Status: machine

English:

> Catastrophic outcomes are a material possibility in the participant’s outlook, with consequential uncertainty or conditions.

Spanish:

> Los resultados catastróficos son una posibilidad sustancial en la perspectiva del participante, con incertidumbre o condiciones de consecuencias importantes.

Back-translation (machine):

> Catastrophic outcomes are a substantial possibility in the participant's outlook, with uncertainty or conditions of major consequences.

### `level:catastrophic_risk:3`

Status: machine

English:

> Catastrophic outcomes dominate the participant’s expectation under stated assumptions.

Spanish:

> Los resultados catastróficos predominan en las expectativas del participante bajo los supuestos declarados.

Back-translation (machine):

> Catastrophic outcomes predominate in the participant's expectations under the stated assumptions.

### `Claims.levels.overall_outlook.0`

Status: machine

English:

> Overwhelmingly harmful overall.

Spanish:

> En conjunto, abrumadoramente perjudicial.

Back-translation (machine):

> Overall, overwhelmingly harmful.

### `Claims.levels.overall_outlook.1`

Status: machine

English:

> More harmful than beneficial overall.

Spanish:

> En conjunto, más perjudicial que beneficioso.

Back-translation (machine):

> Overall, more harmful than beneficial.

### `Claims.levels.overall_outlook.2`

Status: machine

English:

> A broadly balanced or limited overall impact is expected.

Spanish:

> Se espera un impacto general más o menos equilibrado o limitado.

Back-translation (machine):

> A more or less balanced or limited overall impact is expected.

### `Claims.levels.overall_outlook.3`

Status: machine

English:

> More beneficial than harmful overall.

Spanish:

> En conjunto, más beneficioso que perjudicial.

Back-translation (machine):

> Overall, more beneficial than harmful.

### `Claims.levels.overall_outlook.4`

Status: machine

English:

> Overwhelmingly beneficial overall.

Spanish:

> En conjunto, abrumadoramente beneficioso.

Back-translation (machine):

> Overall, overwhelmingly beneficial.

### `Claims.levels.outlook_orientation.0`

Status: machine

English:

> Your outlook is strongly oriented toward catastrophe or overwhelming harm.

Spanish:

> Tu perspectiva se orienta claramente hacia la catástrofe o un daño abrumador.

Back-translation (machine):

> Your outlook is clearly oriented toward catastrophe or overwhelming harm.

### `Claims.levels.outlook_orientation.1`

Status: machine

English:

> Your outlook leans toward concern about harmful futures, while allowing better outcomes.

Spanish:

> Tu perspectiva se inclina hacia la preocupación por futuros perjudiciales, aunque admite mejores desenlaces.

Back-translation (machine):

> Your outlook leans toward concern about harmful futures, although it allows for better outcomes.

### `Claims.levels.outlook_orientation.2`

Status: machine

English:

> Your outlook is mixed or undecided: neither hope nor worry clearly dominates. This is not a prediction of equal benefits and harms.

Spanish:

> Tu perspectiva es mixta o indecisa: ni la esperanza ni la preocupación predominan con claridad. Esto no es una predicción de beneficios y daños iguales.

Back-translation (machine):

> Your outlook is mixed or undecided: neither hope nor concern clearly predominates. This is not a prediction of equal benefits and harms.

### `Claims.levels.outlook_orientation.3`

Status: machine

English:

> Your outlook leans toward beneficial futures, while allowing serious risks.

Spanish:

> Tu perspectiva se inclina hacia futuros beneficiosos, aunque admite riesgos serios.

Back-translation (machine):

> Your outlook leans toward beneficial futures, although it allows for serious risks.

### `Claims.levels.outlook_orientation.4`

Status: machine

English:

> Your outlook is strongly oriented toward transformative flourishing.

Spanish:

> Tu perspectiva se orienta claramente hacia un florecimiento transformador.

Back-translation (machine):

> Your outlook is clearly oriented toward transformative flourishing.

### `Claims.levels.capability_ceiling.0`

Status: machine

English:

> AI is expected to remain bounded tools.

Spanish:

> Se espera que la IA siga siendo un conjunto de herramientas acotadas.

Back-translation (machine):

> AI is expected to remain a set of bounded tools.

### `Claims.levels.capability_ceiling.1`

Status: machine

English:

> AI is expected to match people across most cognitive work.

Spanish:

> Se espera que la IA iguale a las personas en la mayor parte del trabajo cognitivo.

Back-translation (machine):

> AI is expected to equal people in most cognitive work.

### `Claims.levels.capability_ceiling.2`

Status: machine

English:

> AI is expected to substantially exceed people across cognitive work.

Spanish:

> Se espera que la IA supere ampliamente a las personas en el trabajo cognitivo.

Back-translation (machine):

> AI is expected to greatly surpass people in cognitive work.

### `Claims.levels.development_pace.0`

Status: machine

English:

> Stop or substantially slow development of more capable AI.

Spanish:

> Detener o frenar considerablemente el desarrollo de IA más capaz.

Back-translation (machine):

> Stop or considerably slow the development of more capable AI.

### `Claims.levels.development_pace.1`

Status: machine

English:

> Continue development under stated safeguards.

Spanish:

> Continuar el desarrollo con las salvaguardas indicadas.

Back-translation (machine):

> Continue development with the indicated safeguards.

### `Claims.levels.development_pace.2`

Status: machine

English:

> Speed up development of more capable AI.

Spanish:

> Acelerar el desarrollo de IA más capaz.

Back-translation (machine):

> Accelerate the development of more capable AI.

### `Claims.levels.deployment_policy.0`

Status: machine

English:

> Restrict the AI uses discussed until prior protections or permission are in place.

Spanish:

> Restringir los usos de la IA mencionados hasta que existan protecciones o permisos previos.

Back-translation (machine):

> Restrict the mentioned uses of AI until protections or prior permissions exist.

### `Claims.levels.deployment_policy.1`

Status: machine

English:

> Allow the AI uses discussed with targeted accountability and protections.

Spanish:

> Permitir los usos de la IA mencionados con rendición de cuentas y protecciones específicas.

Back-translation (machine):

> Allow the mentioned uses of AI with accountability and specific protections.

### `Claims.levels.deployment_policy.2`

Status: machine

English:

> Minimize restrictions on the AI uses discussed.

Spanish:

> Reducir al mínimo las restricciones a los usos de la IA mencionados.

Back-translation (machine):

> Minimize restrictions on the mentioned uses of AI.

### `Claims.levels.access_policy.0`

Status: machine

English:

> Restrict access to powerful AI.

Spanish:

> Restringir el acceso a la IA potente.

Back-translation (machine):

> Restrict access to powerful AI.

### `Claims.levels.access_policy.1`

Status: machine

English:

> Allow access subject to capability or use restrictions.

Spanish:

> Permitir el acceso con restricciones de capacidad o de uso.

Back-translation (machine):

> Allow access with capability or use restrictions.

### `Claims.levels.access_policy.2`

Status: machine

English:

> Favor broad or open access to powerful AI.

Spanish:

> Favorecer un acceso amplio o abierto a la IA potente.

Back-translation (machine):

> Favor broad or open access to powerful AI.

### `Claims.levels.influence.0`

Status: machine

English:

> Human choices have almost no influence over the eventual AI outcome.

Spanish:

> Las decisiones humanas casi no influyen en el desenlace final de la IA.

Back-translation (machine):

> Human decisions have almost no influence on the final outcome of AI.

### `Claims.levels.influence.1`

Status: machine

English:

> Human choices can make limited changes, but dominant forces constrain the outcome.

Spanish:

> Las decisiones humanas pueden introducir cambios limitados, pero fuerzas dominantes condicionan el desenlace.

Back-translation (machine):

> Human decisions can introduce limited changes, but dominant forces condition the outcome.

### `Claims.levels.influence.2`

Status: machine

English:

> Human choices have meaningful but substantially constrained influence.

Spanish:

> Las decisiones humanas tienen una influencia significativa, aunque muy condicionada.

Back-translation (machine):

> Human decisions have significant influence, although highly constrained.

### `Claims.levels.influence.3`

Status: machine

English:

> Human choices can substantially redirect the AI trajectory.

Spanish:

> Las decisiones humanas pueden redirigir sustancialmente la trayectoria de la IA.

Back-translation (machine):

> Human decisions can substantially redirect the trajectory of AI.

### `Claims.levels.influence.4`

Status: machine

English:

> Human choices are decisive: very different AI futures remain within collective reach.

Spanish:

> Las decisiones humanas son decisivas: futuros muy distintos para la IA siguen a nuestro alcance colectivo.

Back-translation (machine):

> Human decisions are decisive: very different futures for AI remain within our collective reach.

### `Claims.levels.transformation.0`

Status: machine

English:

> AI is expected to cause little lasting societal change.

Spanish:

> Se espera que la IA cause pocos cambios sociales duraderos.

Back-translation (machine):

> AI is expected to cause few lasting social changes.

### `Claims.levels.transformation.1`

Status: machine

English:

> AI is expected to bring incremental improvements and disruptions within familiar institutions.

Spanish:

> Se espera que la IA traiga mejoras y disrupciones graduales dentro de instituciones conocidas.

Back-translation (machine):

> AI is expected to bring gradual improvements and disruptions within known institutions.

### `Claims.levels.transformation.2`

Status: machine

English:

> AI is expected to substantially change several sectors of society.

Spanish:

> Se espera que la IA cambie sustancialmente varios sectores de la sociedad.

Back-translation (machine):

> AI is expected to substantially change several sectors of society.

### `Claims.levels.transformation.3`

Status: machine

English:

> AI is expected to restructure economies, institutions and everyday life broadly.

Spanish:

> Se espera que la IA reestructure ampliamente las economías, las instituciones y la vida cotidiana.

Back-translation (machine):

> AI is expected to broadly restructure economies, institutions, and everyday life.

### `Claims.levels.transformation.4`

Status: machine

English:

> AI is expected to fundamentally transform civilization or humanity’s continued existence.

Spanish:

> Se espera que la IA transforme de raíz la civilización o la continuidad de la existencia humana.

Back-translation (machine):

> AI is expected to transform civilization or the continuity of human existence at the root.

### `Claims.uncertain`

Status: machine

English:

> You expressed uncertainty here rather than a directional expectation.

Spanish:

> Aquí expresaste incertidumbre en lugar de una expectativa con una dirección clara.

Back-translation (machine):

> Here you expressed uncertainty instead of an expectation with a clear direction.

### `Claims.unestablished`

Status: machine

English:

> A directional position is not yet established by these answers.

Spanish:

> Estas respuestas aún no establecen una postura con una dirección clara.

Back-translation (machine):

> These responses do not yet establish a position with a clear direction.

### `Claims.unresolved`

Status: machine

English:

> The interpretation of these answers still needs clarification.

Spanish:

> La interpretación de estas respuestas aún necesita aclararse.

Back-translation (machine):

> The interpretation of these responses still needs to be clarified.

### `Claims.readings`

Status: machine

English:

> Several readings remain plausible: {readings}

Spanish:

> Varias lecturas siguen siendo plausibles: {readings}

Back-translation (machine):

> Several readings remain plausible: {readings}

### `Claims.unplacedUncertain.capability_trajectory`

Status: machine

English:

> You expressed uncertainty about whether or when transformative AI arrives.

Spanish:

> Expresaste incertidumbre sobre si llegará la IA transformadora y cuándo.

Back-translation (machine):

> You expressed uncertainty about whether transformative AI will arrive and when.

### `Claims.unplacedUncertain.transition_dynamics`

Status: machine

English:

> You expressed uncertainty about how quickly AI-driven change unfolds.

Spanish:

> Expresaste incertidumbre sobre la rapidez con que se desarrollará el cambio impulsado por la IA.

Back-translation (machine):

> You expressed uncertainty about how quickly AI-driven change will develop.

### `Claims.unplacedUncertain.beneficial_potential`

Status: machine

English:

> You expressed uncertainty about the positive impact you expect from AI.

Spanish:

> Expresaste incertidumbre sobre el impacto positivo que esperas de la IA.

Back-translation (machine):

> You expressed uncertainty about the positive impact you expect from AI.

### `Claims.unplacedUncertain.risk_landscape`

Status: machine

English:

> You expressed uncertainty about the harm you expect from AI.

Spanish:

> Expresaste incertidumbre sobre el daño que esperas de la IA.

Back-translation (machine):

> You expressed uncertainty about the harm you expect from AI.

### `Claims.unplacedUncertain.technical_controllability`

Status: machine

English:

> You expressed uncertainty about whether technical control of powerful AI will work.

Spanish:

> Expresaste incertidumbre sobre si funcionará el control técnico de la IA potente.

Back-translation (machine):

> You expressed uncertainty about whether technical control of powerful AI will work.

### `Claims.unplacedUncertain.institutional_competence`

Status: machine

English:

> You expressed uncertainty about how effectively institutions will respond.

Spanish:

> Expresaste incertidumbre sobre la eficacia con que responderán las instituciones.

Back-translation (machine):

> You expressed uncertainty about how effectively institutions will respond.

### `Claims.unplacedUncertain.human_agency`

Status: machine

English:

> You expressed uncertainty about what happens to the forms of agency you value.

Spanish:

> Expresaste incertidumbre sobre qué pasará con las formas de autonomía que valoras.

Back-translation (machine):

> You expressed uncertainty about what will happen to the forms of autonomy you value.

### `Claims.unplacedUncertain.action_posture`

Status: machine

English:

> You expressed uncertainty about which development or policy response you prefer.

Spanish:

> Expresaste incertidumbre sobre qué respuesta de desarrollo o de política prefieres.

Back-translation (machine):

> You expressed uncertainty about which development or policy response you prefer.

### `Claims.unplacedUncertain.catastrophic_risk`

Status: machine

English:

> You expressed uncertainty about the prospect of catastrophic or irreversible harm.

Spanish:

> Expresaste incertidumbre sobre la posibilidad de un daño catastrófico o irreversible.

Back-translation (machine):

> You expressed uncertainty about the possibility of catastrophic or irreversible harm.

### `Claims.unplacedUnestablished.capability_trajectory`

Status: machine

English:

> These answers do not yet establish whether or when transformative AI arrives.

Spanish:

> Estas respuestas aún no aclaran si llegará la IA transformadora ni cuándo.

Back-translation (machine):

> These responses do not yet clarify whether transformative AI will arrive or when.

### `Claims.unplacedUnestablished.transition_dynamics`

Status: machine

English:

> These answers do not yet establish how quickly AI-driven change unfolds.

Spanish:

> Estas respuestas aún no aclaran la rapidez con que se desarrollará el cambio impulsado por la IA.

Back-translation (machine):

> These responses do not yet clarify how quickly AI-driven change will develop.

### `Claims.unplacedUnestablished.beneficial_potential`

Status: machine

English:

> These answers do not yet establish the positive impact you expect from AI.

Spanish:

> Estas respuestas aún no aclaran el impacto positivo que esperas de la IA.

Back-translation (machine):

> These responses do not yet clarify the positive impact you expect from AI.

### `Claims.unplacedUnestablished.risk_landscape`

Status: machine

English:

> These answers do not yet establish the harm you expect from AI.

Spanish:

> Estas respuestas aún no aclaran el daño que esperas de la IA.

Back-translation (machine):

> These responses do not yet clarify the harm you expect from AI.

### `Claims.unplacedUnestablished.technical_controllability`

Status: machine

English:

> These answers do not yet establish whether technical control of powerful AI will work.

Spanish:

> Estas respuestas aún no aclaran si funcionará el control técnico de la IA potente.

Back-translation (machine):

> These responses do not yet clarify whether technical control of powerful AI will work.

### `Claims.unplacedUnestablished.institutional_competence`

Status: machine

English:

> These answers do not yet establish how effectively institutions will respond.

Spanish:

> Estas respuestas aún no aclaran la eficacia con que responderán las instituciones.

Back-translation (machine):

> These responses do not yet clarify how effectively institutions will respond.

### `Claims.unplacedUnestablished.human_agency`

Status: machine

English:

> These answers do not yet establish what happens to the forms of agency you value.

Spanish:

> Estas respuestas aún no aclaran qué pasará con las formas de autonomía que valoras.

Back-translation (machine):

> These answers still do not clarify what will happen with the forms of autonomy that you value.

### `Claims.unplacedUnestablished.action_posture`

Status: machine

English:

> These answers do not yet establish which development or policy response you prefer.

Spanish:

> Estas respuestas aún no aclaran qué respuesta de desarrollo o de política prefieres.

Back-translation (machine):

> These answers still do not clarify what development or policy response you prefer.

### `Claims.unplacedUnestablished.catastrophic_risk`

Status: machine

English:

> These answers do not yet establish the prospect of catastrophic or irreversible harm.

Spanish:

> Estas respuestas aún no aclaran tu postura sobre la posibilidad de un daño catastrófico o irreversible.

Back-translation (machine):

> These answers still do not clarify your position on the possibility of catastrophic or irreversible harm.

### `Claims.facetUnsettled`

Status: machine

English:

> You have not settled on a position here.

Spanish:

> Aún no te has decidido por una postura aquí.

Back-translation (machine):

> You have not yet decided on a position here.

### `Claims.axisUnsettled`

Status: machine

English:

> You have not settled on this. The point marks the center of the open range, not a moderate belief.

Spanish:

> Aún no te has decidido sobre esto. El punto marca el centro del rango abierto, no una creencia moderada.

Back-translation (machine):

> You have not yet decided about this. The point marks the center of the open range, not a moderate belief.

### `Claims.axisTentative`

Status: machine

English:

> A tentative estimate from your answers; the wider range shows other plausible readings.

Spanish:

> Una estimación provisional a partir de tus respuestas; el rango más amplio muestra otras lecturas plausibles.

Back-translation (machine):

> A provisional estimate from your answers; the wider range shows other plausible readings.

### `Claims.timelineExpressed`

Status: machine

English:

> Timing expressed in answer {number}; see the full answer for its scope and uncertainty.

Spanish:

> Plazos expresados en la respuesta {number}; consulta la respuesta completa para ver su alcance y su incertidumbre.

Back-translation (machine):

> Timeframes expressed in answer {number}; consult the full answer to see their scope and uncertainty.

### `Claims.timelineUnsettled`

Status: machine

English:

> You have not settled on a timeline.

Spanish:

> Aún no te has decidido por unos plazos.

Back-translation (machine):

> You have not yet decided on timeframes.
