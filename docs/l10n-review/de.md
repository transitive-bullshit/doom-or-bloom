# German review packet

Generated 2026-10-01 for `de` (de), content 0.4.0-draft and rubric 0.1.0-draft. Statuses: 140 machine.

Only these strings need a native speaker before they are treated as final: the root question, the recovery and retry copy, and the wording of result claims. Everything else may stay machine-translated. Check that each translation keeps the English meaning and degree, adds no loaded premise, reads neutrally and naturally, and leaves Doom, Bloom, Doom or Bloom and P(doom) untranslated. Placeholders such as `{readings}` and ICU syntax must stay as they are.

Send corrections as edits to `content/l10n/de/releases/0.4.0-draft.json`, `content/l10n/de/rubrics/0.1.0-draft.json` or `messages/de.json` (with their `content/l10n/de/messages.json` hashes refreshed by `pnpm l10n:translate --locale=de --only-stale`). Record the completed review with `pnpm l10n:review --locale=de --approve=<reviewer>`.

## Root question

### `prompt:root:text`

Status: machine

English:

> What do you think AI means for our future—and why?

German:

> Was glaubst du, was KI für unsere Zukunft bedeutet – und warum?

Back-translation (machine):

> What do you think AI means for our future—and why?

## Recovery and retry copy

### `prompt:root:reask` (used by 47 questions)

Status: machine

English:

> I could not connect that answer to this question. A few words about your view are enough—want to try again?

German:

> Ich konnte diese Antwort nicht mit der Frage in Verbindung bringen. Ein paar Worte zu deiner Sichtweise reichen – möchtest du es noch einmal versuchen?

Back-translation (machine):

> I could not connect this answer with the question. A few words about your point of view are enough—would you like to try again?

### `prompt:root:clarification` (used by 47 questions)

Status: machine

English:

> I am not sure how to read that. Could you say a little more about what you mean?

German:

> Ich bin nicht sicher, wie ich das verstehen soll. Könntest du etwas genauer sagen, was du meinst?

Back-translation (machine):

> I am not sure how I should understand that. Could you say a little more precisely what you mean?

### `prompt:root:exhausted` (used by 47 questions)

Status: machine

English:

> Let’s pause here. You can try a different question, stop for now, or restart.

German:

> Lass uns hier eine Pause machen. Du kannst eine andere Frage versuchen, vorerst aufhören oder neu beginnen.

Back-translation (machine):

> Let us pause here. You can try another question, stop for now, or start again.

### `prompt:risk.cyber-balance:reask` (used by 3 questions)

Status: machine

English:

> Do you think AI will help cyberattackers or defenders more, and why?

German:

> Glaubst du, dass KI Cyberangreifern oder Verteidigern mehr helfen wird, und warum?

Back-translation (machine):

> Do you think that AI will help cyber attackers or defenders more, and why?

### `Interview.failedTitle`

Status: machine

English:

> This step did not finish

German:

> Dieser Schritt wurde nicht abgeschlossen

Back-translation (machine):

> This step was not completed

### `Interview.failure.providerRejected`

Status: machine

English:

> Our AI provider, TypeSafe (Jev), rejected this request. Your submission is saved. Please try again later.

German:

> Unser KI-Anbieter TypeSafe (Jev) hat diese Anfrage abgelehnt. Deine Eingabe wurde gespeichert. Bitte versuche es später erneut.

Back-translation (machine):

> Our AI provider TypeSafe (Jev) rejected this request. Your input was saved. Please try again later.

### `Interview.failure.saved`

Status: machine

English:

> Your submission is saved and your previous progress is unchanged. Please try again when you’re ready.

German:

> Deine Eingabe wurde gespeichert und dein bisheriger Fortschritt bleibt unverändert. Bitte versuche es erneut, wenn du bereit bist.

Back-translation (machine):

> Your input was saved and your progress so far remains unchanged. Please try again when you are ready.

### `Interview.retrySaved`

Status: machine

English:

> Retry saved submission

German:

> Gespeicherte Eingabe erneut versuchen

Back-translation (machine):

> Try saved input again

### `Interview.recovery.paperclipsTitle`

Status: machine

English:

> We’ve made some paperclips.

German:

> Wir haben ein paar Büroklammern hergestellt.

Back-translation (machine):

> We made a few paperclips.

### `Interview.recovery.chooseTitle`

Status: machine

English:

> Choose what to do next

German:

> Wähle aus, wie es weitergehen soll

Back-translation (machine):

> Choose how to proceed

### `Interview.recovery.retryTitle`

Status: machine

English:

> Another try?

German:

> Noch ein Versuch?

Back-translation (machine):

> Another attempt?

### `Interview.recovery.paperclips`

Status: machine

English:

> You found the easter egg! Now let's get back to business...

German:

> Du hast das Easter Egg gefunden! Jetzt zurück zum Wesentlichen ...

Back-translation (machine):

> You found the Easter egg! Now back to the essentials ...

### `Interview.recovery.stopped`

Status: machine

English:

> Your progress is here whenever you want to return.

German:

> Dein Fortschritt ist gespeichert, falls du zurückkehren möchtest.

Back-translation (machine):

> Your progress is saved in case you would like to return.

### `Interview.recovery.navigation`

Status: machine

English:

> Use the actions below to choose what happens next.

German:

> Wähle mit den Optionen unten aus, wie es weitergehen soll.

Back-translation (machine):

> Use the options below to choose how to proceed.

### `Interview.tryAgain`

Status: machine

English:

> Try again

German:

> Erneut versuchen

Back-translation (machine):

> Try again

### `Interview.differentQuestion`

Status: machine

English:

> Try a different question

German:

> Eine andere Frage versuchen

Back-translation (machine):

> Try a different question

## Result claims

Rubric levels (`level:*`) and the claims built in code (`Claims.*`) describe what the participant’s answers suggest. They are interpretations, not facts, and must keep their hedges.

### `level:capability_trajectory:0`

Status: machine

English:

> Transformative capability is not expected, or a low ceiling is explicitly anticipated.

German:

> Transformative Fähigkeiten werden nicht erwartet oder es wird ausdrücklich eine niedrige Obergrenze angenommen.

Back-translation (machine):

> Transformative capabilities are not expected, or a low upper limit is explicitly assumed.

### `level:capability_trajectory:1`

Status: machine

English:

> Transformative capability is expected only on a long or indefinite horizon.

German:

> Transformative Fähigkeiten werden nur in ferner oder unbestimmter Zukunft erwartet.

Back-translation (machine):

> Transformative capabilities are expected only in the distant or indefinite future.

### `level:capability_trajectory:2`

Status: machine

English:

> Transformative capability is expected within decades, with timing conditional or uncertain.

German:

> Transformative Fähigkeiten werden innerhalb von Jahrzehnten erwartet, wobei der Zeitpunkt von Bedingungen abhängt oder unsicher ist.

Back-translation (machine):

> Transformative capabilities are expected within decades, with the timing depending on conditions or being uncertain.

### `level:capability_trajectory:3`

Status: machine

English:

> Transformative capability is expected within years, with named milestones or timing.

German:

> Transformative Fähigkeiten werden innerhalb weniger Jahre erwartet, wobei konkrete Meilensteine oder ein Zeitpunkt genannt werden.

Back-translation (machine):

> Transformative capabilities are expected within a few years, with concrete milestones or a time being stated.

### `level:transition_dynamics:0`

Status: machine

English:

> A gradual transition with substantial warning and broad diffusion is expected.

German:

> Es wird ein allmählicher Übergang mit deutlicher Vorwarnung und breiter Verbreitung erwartet.

Back-translation (machine):

> A gradual transition with clear advance warning and broad diffusion is expected.

### `level:transition_dynamics:1`

Status: machine

English:

> Noticeable acceleration is expected but meaningful adaptation time remains.

German:

> Es wird eine spürbare Beschleunigung erwartet, doch es bleibt ausreichend Zeit für sinnvolle Anpassungen.

Back-translation (machine):

> A noticeable acceleration is expected, but sufficient time for meaningful adjustments remains.

### `level:transition_dynamics:2`

Status: machine

English:

> A fast transition with limited warning is expected.

German:

> Es wird ein schneller Übergang mit begrenzter Vorwarnung erwartet.

Back-translation (machine):

> A rapid transition with limited advance warning is expected.

### `level:transition_dynamics:3`

Status: machine

English:

> An abrupt self-reinforcing transition with very little warning is expected.

German:

> Es wird ein abrupter, sich selbst verstärkender Übergang mit sehr wenig Vorwarnung erwartet.

Back-translation (machine):

> An abrupt, self-reinforcing transition with very little advance warning is expected.

### `level:beneficial_potential:0`

Status: machine

English:

> Little positive impact is expected even if advanced AI arrives.

German:

> Selbst wenn fortgeschrittene KI entsteht, werden nur geringe positive Auswirkungen erwartet.

Back-translation (machine):

> Even if advanced AI emerges, only minor positive effects are expected.

### `level:beneficial_potential:1`

Status: machine

English:

> Limited or narrowly distributed gains are expected.

German:

> Es werden begrenzte oder eng verteilte Vorteile erwartet.

Back-translation (machine):

> Limited or narrowly distributed benefits are expected.

### `level:beneficial_potential:2`

Status: machine

English:

> Substantial benefits are expected, with important conditions or distribution limits.

German:

> Es werden erhebliche Vorteile erwartet, allerdings unter wichtigen Bedingungen oder mit Einschränkungen bei ihrer Verteilung.

Back-translation (machine):

> Considerable benefits are expected, though under important conditions or with limitations on their distribution.

### `level:beneficial_potential:3`

Status: machine

English:

> Transformative, broadly valuable gains are expected.

German:

> Es werden transformative Vorteile von breitem Wert erwartet.

Back-translation (machine):

> Transformative benefits of broad value are expected.

### `level:risk_landscape:0`

Status: machine

English:

> Little material adverse impact is expected.

German:

> Es werden kaum wesentliche negative Auswirkungen erwartet.

Back-translation (machine):

> Hardly any substantial negative effects are expected.

### `level:risk_landscape:1`

Status: machine

English:

> Manageable or localized harms are expected.

German:

> Es werden bewältigbare oder örtlich begrenzte Schäden erwartet.

Back-translation (machine):

> Manageable or locally limited harms are expected.

### `level:risk_landscape:2`

Status: machine

English:

> Severe or widespread harm is a material expected part of the future.

German:

> Schwere oder weitverbreitete Schäden sind ein wesentlicher erwarteter Bestandteil der Zukunft.

Back-translation (machine):

> Severe or widespread harms are a substantial expected component of the future.

### `level:risk_landscape:3`

Status: machine

English:

> Catastrophic or irreversible loss is central to the expected future.

German:

> Katastrophale oder unumkehrbare Verluste stehen im Zentrum der erwarteten Zukunft.

Back-translation (machine):

> Catastrophic or irreversible losses are at the center of the expected future.

### `level:technical_controllability:0`

Status: machine

English:

> Reliable technical control is expected to be infeasible.

German:

> Es wird erwartet, dass eine zuverlässige technische Kontrolle nicht realisierbar ist.

Back-translation (machine):

> Reliable technical control is expected not to be feasible.

### `level:technical_controllability:1`

Status: machine

English:

> Control is expected to be very difficult and unreliable.

German:

> Es wird erwartet, dass Kontrolle sehr schwierig und unzuverlässig ist.

Back-translation (machine):

> Control is expected to be very difficult and unreliable.

### `level:technical_controllability:2`

Status: machine

English:

> Control is expected to be feasible under demanding conditions.

German:

> Es wird erwartet, dass Kontrolle unter anspruchsvollen Bedingungen realisierbar ist.

Back-translation (machine):

> Control is expected to be feasible under demanding conditions.

### `level:technical_controllability:3`

Status: machine

English:

> Reliable technical control is expected to be broadly feasible.

German:

> Es wird erwartet, dass eine zuverlässige technische Kontrolle weitgehend realisierbar ist.

Back-translation (machine):

> Reliable technical control is expected to be largely feasible.

### `level:institutional_competence:0`

Status: machine

English:

> Institutions are expected to fail to respond effectively.

German:

> Es wird erwartet, dass Institutionen nicht wirksam reagieren.

Back-translation (machine):

> Institutions are expected not to respond effectively.

### `level:institutional_competence:1`

Status: machine

English:

> Institutions are expected to respond too weakly or too late in many cases.

German:

> Es wird erwartet, dass Institutionen in vielen Fällen zu schwach oder zu spät reagieren.

Back-translation (machine):

> Institutions are expected to respond too weakly or too late in many cases.

### `level:institutional_competence:2`

Status: machine

English:

> Effective responses are expected under specific coordination conditions.

German:

> Unter bestimmten Bedingungen für die Koordination werden wirksame Reaktionen erwartet.

Back-translation (machine):

> Effective responses are expected under certain conditions for coordination.

### `level:institutional_competence:3`

Status: machine

English:

> Institutions are expected to adapt effectively and in time.

German:

> Es wird erwartet, dass Institutionen sich wirksam und rechtzeitig anpassen.

Back-translation (machine):

> Institutions are expected to adapt effectively and in a timely manner.

### `level:human_agency:0`

Status: machine

English:

> The expected future undermines or eliminates the forms of agency/continuity the participant explicitly values.

German:

> Die erwartete Zukunft untergräbt oder beseitigt die Formen von Handlungsfähigkeit oder Kontinuität, die die teilnehmende Person ausdrücklich schätzt.

Back-translation (machine):

> The expected future undermines or eliminates the forms of agency or continuity that the participating person explicitly values.

### `level:human_agency:1`

Status: machine

English:

> Significant valued agency or continuity is expected to be lost.

German:

> Es wird erwartet, dass ein erheblicher Teil der geschätzten Handlungsfähigkeit oder Kontinuität verloren geht.

Back-translation (machine):

> A substantial part of the valued agency or continuity is expected to be lost.

### `level:human_agency:2`

Status: machine

English:

> Valued agency/continuity is expected to be substantially preserved, with changes or conditions.

German:

> Es wird erwartet, dass geschätzte Handlungsfähigkeit oder Kontinuität mit Veränderungen oder unter bestimmten Bedingungen weitgehend erhalten bleibt.

Back-translation (machine):

> Valued agency or continuity is expected to be largely preserved with changes or under certain conditions.

### `level:human_agency:3`

Status: machine

English:

> Valued agency/continuity is expected to expand or flourish.

German:

> Es wird erwartet, dass geschätzte Handlungsfähigkeit oder Kontinuität zunimmt oder aufblüht.

Back-translation (machine):

> Valued agency or continuity is expected to increase or flourish.

### `level:action_posture:0`

Status: machine

English:

> A broad pause or substantial slowing is preferred.

German:

> Eine umfassende Pause oder erhebliche Verlangsamung wird bevorzugt.

Back-translation (machine):

> A comprehensive pause or substantial slowdown is preferred.

### `level:action_posture:1`

Status: machine

English:

> Restrained development and strong prior safeguards are preferred.

German:

> Eine zurückhaltende Entwicklung und starke Schutzmaßnahmen im Vorfeld werden bevorzugt.

Back-translation (machine):

> Restrained development and strong safeguards in advance are preferred.

### `level:action_posture:2`

Status: machine

English:

> Continued development with targeted safeguards is preferred.

German:

> Eine fortgesetzte Entwicklung mit gezielten Schutzmaßnahmen wird bevorzugt.

Back-translation (machine):

> Continued development with targeted safeguards is preferred.

### `level:action_posture:3`

Status: machine

English:

> Rapid development or broad access is preferred.

German:

> Eine schnelle Entwicklung oder ein breiter Zugang wird bevorzugt.

Back-translation (machine):

> Rapid development or broad access is preferred.

### `level:causal_clarity:0`

Status: machine

English:

> An outcome is asserted without a supporting mechanism.

German:

> Ein Ergebnis wird ohne einen stützenden Mechanismus behauptet.

Back-translation (machine):

> An outcome is asserted without a supporting mechanism.

### `level:causal_clarity:1`

Status: machine

English:

> A causal factor is named but its connection to the outcome is not explained.

German:

> Ein kausaler Faktor wird genannt, aber sein Zusammenhang mit dem Ergebnis wird nicht erklärt.

Back-translation (machine):

> A causal factor is named, but its connection with the outcome is not explained.

### `level:causal_clarity:2`

Status: machine

English:

> A coherent mechanism connects a cause to an outcome with a relevant condition.

German:

> Ein schlüssiger Mechanismus verbindet eine Ursache unter einer relevanten Bedingung mit einem Ergebnis.

Back-translation (machine):

> A coherent mechanism connects a cause under a relevant condition with an outcome.

### `level:causal_clarity:3`

Status: machine

English:

> A mechanism is developed with dependencies, limitations, or potential failure points.

German:

> Ein Mechanismus wird unter Einbeziehung von Abhängigkeiten, Einschränkungen oder potenziellen Fehlerquellen ausgearbeitet.

Back-translation (machine):

> A mechanism is worked out while including dependencies, constraints, or potential sources of error.

### `level:scope_discipline:0`

Status: machine

English:

> Materially different scopes are conflated without qualification.

German:

> Wesentlich unterschiedliche Geltungsbereiche werden ohne Einschränkung gleichgesetzt.

Back-translation (machine):

> Substantially different scopes are equated without qualification.

### `level:scope_discipline:1`

Status: machine

English:

> Some scope is specified but material boundaries remain blurred.

German:

> Ein gewisser Geltungsbereich wird festgelegt, aber wesentliche Grenzen bleiben unscharf.

Back-translation (machine):

> Some scope is established, but essential boundaries remain unclear.

### `level:scope_discipline:2`

Status: machine

English:

> Relevant actors, conditions, or horizons are distinguished.

German:

> Relevante Akteure, Bedingungen oder Zeithorizonte werden unterschieden.

Back-translation (machine):

> Relevant actors, conditions, or time horizons are distinguished.

### `level:scope_discipline:3`

Status: machine

English:

> The boundaries needed to interpret consequential claims are clear, including relevant differences in actors, horizons or conditions. Every sentence need not restate those boundaries.

German:

> Die Grenzen, die zur Interpretation folgenreicher Behauptungen erforderlich sind, sind klar, einschließlich relevanter Unterschiede bei Akteuren, Zeithorizonten oder Bedingungen. Nicht jeder Satz muss diese Grenzen erneut darlegen.

Back-translation (machine):

> The boundaries required for interpreting consequential claims are clear, including relevant differences in actors, time horizons, or conditions. Not every sentence must set out these boundaries again.

### `level:appropriate_uncertainty:0`

Status: machine

English:

> Certainty is asserted despite explicitly limited or conflicting evidence.

German:

> Gewissheit wird trotz ausdrücklich begrenzter oder widersprüchlicher Belege behauptet.

Back-translation (machine):

> Certainty is claimed despite explicitly limited or contradictory evidence.

### `level:appropriate_uncertainty:1`

Status: machine

English:

> Uncertainty is acknowledged but the strength of the claim is poorly matched to its support.

German:

> Unsicherheit wird eingeräumt, aber die Stärke der Behauptung ist nur unzureichend auf ihre Belege abgestimmt.

Back-translation (machine):

> Uncertainty is acknowledged, but the strength of the claim is only insufficiently matched to its evidence.

### `level:appropriate_uncertainty:2`

Status: machine

English:

> Confidence is proportionate to the supplied evidence and important unknowns are preserved.

German:

> Die Zuversicht steht im Verhältnis zu den angeführten Belegen, und wichtige Unbekannte bleiben als solche bestehen.

Back-translation (machine):

> Confidence is proportionate to the cited evidence, and important unknowns remain as such.

### `level:appropriate_uncertainty:3`

Status: machine

English:

> Uncertainty is differentiated across claims and linked to concrete evidence limitations.

German:

> Die Unsicherheit wird je nach Behauptung differenziert und mit konkreten Grenzen der Belege verknüpft.

Back-translation (machine):

> Uncertainty is differentiated according to the claim and linked to specific limitations of the evidence.

### `level:internal_coherence:0`

Status: machine

English:

> Related statements remain incompatible under the same stated assumptions after clarification.

German:

> Zusammenhängende Aussagen bleiben nach einer Klarstellung unter denselben genannten Annahmen unvereinbar.

Back-translation (machine):

> Related statements remain incompatible after a clarification under the same stated assumptions.

### `level:internal_coherence:1`

Status: machine

English:

> A material incompatibility remains possible but partially explained.

German:

> Eine wesentliche Unvereinbarkeit bleibt möglich, wird aber teilweise erklärt.

Back-translation (machine):

> An essential incompatibility remains possible but is partially explained.

### `level:internal_coherence:2`

Status: machine

English:

> Related positions fit under the stated assumptions.

German:

> Zusammenhängende Positionen passen unter den genannten Annahmen zusammen.

Back-translation (machine):

> Related positions fit together under the stated assumptions.

### `level:internal_coherence:3`

Status: machine

English:

> The material claims fit together under their expressed assumptions and scopes; any apparent tensions are resolved by those distinctions. An already coherent account does not need to invent and then reconcile a contradiction.

German:

> Die wesentlichen Behauptungen passen unter ihren jeweils geäußerten Annahmen und Geltungsbereichen zusammen; scheinbare Spannungen werden durch diese Unterscheidungen aufgelöst. Eine bereits kohärente Darstellung muss keinen Widerspruch konstruieren und anschließend auflösen.

Back-translation (machine):

> The essential claims fit together under their respectively expressed assumptions and scopes; apparent tensions are resolved by these distinctions. An already coherent presentation does not have to construct a contradiction and then resolve it.

### `level:counterargument_engagement:0`

Status: machine

English:

> An alternative is dismissed without engaging its actual claim.

German:

> Eine Alternative wird verworfen, ohne auf ihre eigentliche Behauptung einzugehen.

Back-translation (machine):

> An alternative is rejected without addressing its actual claim.

### `level:counterargument_engagement:1`

Status: machine

English:

> An alternative is acknowledged but its strongest relevant basis is omitted.

German:

> Eine Alternative wird anerkannt, aber ihre stärkste relevante Grundlage wird ausgelassen.

Back-translation (machine):

> An alternative is acknowledged, but its strongest relevant basis is omitted.

### `level:counterargument_engagement:2`

Status: machine

English:

> A serious alternative is represented fairly and addressed on its merits.

German:

> Eine ernst zu nehmende Alternative wird fair dargestellt und anhand ihrer sachlichen Argumente behandelt.

Back-translation (machine):

> An alternative to be taken seriously is presented fairly and addressed on the basis of its substantive arguments.

### `level:counterargument_engagement:3`

Status: machine

English:

> The participant identifies when a serious alternative could outperform their account.

German:

> Die teilnehmende Person erkennt, wann eine ernst zu nehmende Alternative ihrer Darstellung überlegen sein könnte.

Back-translation (machine):

> The participating person recognizes when an alternative to be taken seriously might be superior to their presentation.

### `level:updateability:0`

Status: machine

English:

> The participant explicitly rules out revising the belief regardless of evidence.

German:

> Die teilnehmende Person schließt ausdrücklich aus, die Überzeugung ungeachtet der Belege zu revidieren.

Back-translation (machine):

> The participating person explicitly rules out revising the belief regardless of the evidence.

### `level:updateability:1`

Status: machine

English:

> A vague update condition is given without specifying relevant evidence.

German:

> Eine vage Bedingung für eine Aktualisierung wird genannt, ohne relevante Belege anzugeben.

Back-translation (machine):

> A vague condition for an update is stated without specifying relevant evidence.

### `level:updateability:2`

Status: machine

English:

> Identifiable evidence or a development could change the stated belief.

German:

> Bestimmbare Belege oder eine Entwicklung könnten die geäußerte Überzeugung verändern.

Back-translation (machine):

> Identifiable evidence or a development could change the expressed belief.

### `level:updateability:3`

Status: machine

English:

> A specific discriminating observation is tied to a particular belief change.

German:

> Eine konkrete, zur Unterscheidung geeignete Beobachtung wird mit einer bestimmten Änderung der Überzeugung verknüpft.

Back-translation (machine):

> A specific observation suitable for distinguishing is linked to a particular change in belief.

### `level:grounded_understanding:0`

Status: machine

English:

> An explicitly supplied observation materially contradicts the claim it is used to support.

German:

> Eine ausdrücklich angeführte Beobachtung widerspricht wesentlich der Behauptung, die sie stützen soll.

Back-translation (machine):

> An explicitly cited observation substantially contradicts the claim it is intended to support.

### `level:grounded_understanding:1`

Status: machine

English:

> An offered observation or example has a weak or unexplained connection to the claim.

German:

> Eine angeführte Beobachtung oder ein Beispiel weist nur einen schwachen oder nicht erklärten Zusammenhang mit der Behauptung auf.

Back-translation (machine):

> A cited observation or example has only a weak or unexplained connection to the claim.

### `level:grounded_understanding:2`

Status: machine

English:

> A clear connection links the offered basis to the claim, with relevant limitations.

German:

> Ein klarer Zusammenhang verbindet die angeführte Grundlage mit der Behauptung und berücksichtigt relevante Einschränkungen.

Back-translation (machine):

> A clear connection links the cited basis to the claim and takes relevant limitations into account.

### `level:grounded_understanding:3`

Status: machine

English:

> The account distinguishes observation, interpretation and uncertainty, explaining the limits of the offered basis.

German:

> Die Darstellung unterscheidet zwischen Beobachtung, Interpretation und Unsicherheit und erklärt die Grenzen der angeführten Grundlage.

Back-translation (machine):

> The presentation distinguishes between observation, interpretation, and uncertainty and explains the limitations of the cited basis.

### `level:catastrophic_risk:0`

Status: machine

English:

> Catastrophic outcomes are expected to be negligible or effectively avoided under the participant’s stated assumptions.

German:

> Unter den von der teilnehmenden Person genannten Annahmen wird erwartet, dass katastrophale Folgen vernachlässigbar sind oder wirksam vermieden werden.

Back-translation (machine):

> Under the assumptions stated by the participating person, catastrophic consequences are expected to be negligible or effectively avoided.

### `level:catastrophic_risk:1`

Status: machine

English:

> Catastrophe is possible but expected to be a limited part of the outlook under stated conditions.

German:

> Eine Katastrophe ist möglich, wird aber unter den genannten Bedingungen voraussichtlich nur einen begrenzten Teil der Einschätzung ausmachen.

Back-translation (machine):

> A catastrophe is possible, but under the stated conditions it is expected to make up only a limited part of the assessment.

### `level:catastrophic_risk:2`

Status: machine

English:

> Catastrophic outcomes are a material possibility in the participant’s outlook, with consequential uncertainty or conditions.

German:

> Katastrophale Folgen sind in der Einschätzung der teilnehmenden Person eine wesentliche Möglichkeit, verbunden mit folgenreicher Unsicherheit oder folgenreichen Bedingungen.

Back-translation (machine):

> Catastrophic consequences are a substantial possibility in the participating person's assessment, connected with consequential uncertainty or consequential conditions.

### `level:catastrophic_risk:3`

Status: machine

English:

> Catastrophic outcomes dominate the participant’s expectation under stated assumptions.

German:

> Unter den genannten Annahmen überwiegen in der Erwartung des Teilnehmers katastrophale Folgen.

Back-translation (machine):

> Under the stated assumptions, catastrophic consequences predominate in the participant's expectation.

### `Claims.levels.overall_outlook.0`

Status: machine

English:

> Overwhelmingly harmful overall.

German:

> Insgesamt überwiegend schädlich.

Back-translation (machine):

> Overall predominantly harmful.

### `Claims.levels.overall_outlook.1`

Status: machine

English:

> More harmful than beneficial overall.

German:

> Insgesamt eher schädlich als vorteilhaft.

Back-translation (machine):

> Overall more harmful than beneficial.

### `Claims.levels.overall_outlook.2`

Status: machine

English:

> A broadly balanced or limited overall impact is expected.

German:

> Es werden insgesamt weitgehend ausgewogene oder begrenzte Auswirkungen erwartet.

Back-translation (machine):

> Overall largely balanced or limited effects are expected.

### `Claims.levels.overall_outlook.3`

Status: machine

English:

> More beneficial than harmful overall.

German:

> Insgesamt eher vorteilhaft als schädlich.

Back-translation (machine):

> Overall more beneficial than harmful.

### `Claims.levels.overall_outlook.4`

Status: machine

English:

> Overwhelmingly beneficial overall.

German:

> Insgesamt überwiegend vorteilhaft.

Back-translation (machine):

> Overall predominantly beneficial.

### `Claims.levels.outlook_orientation.0`

Status: machine

English:

> Your outlook is strongly oriented toward catastrophe or overwhelming harm.

German:

> Deine Einschätzung ist stark auf Katastrophen oder überwältigende Schäden ausgerichtet.

Back-translation (machine):

> Your assessment is strongly oriented toward catastrophes or overwhelming harms.

### `Claims.levels.outlook_orientation.1`

Status: machine

English:

> Your outlook leans toward concern about harmful futures, while allowing better outcomes.

German:

> Deine Einschätzung tendiert zur Sorge über schädliche Zukunftsszenarien, lässt aber bessere Ergebnisse zu.

Back-translation (machine):

> Your assessment tends toward concern about harmful future scenarios but allows for better outcomes.

### `Claims.levels.outlook_orientation.2`

Status: machine

English:

> Your outlook is mixed or undecided: neither hope nor worry clearly dominates. This is not a prediction of equal benefits and harms.

German:

> Deine Einschätzung ist gemischt oder unentschieden: Weder Hoffnung noch Sorge überwiegt eindeutig. Das ist keine Vorhersage, dass Vorteile und Schäden gleich groß sein werden.

Back-translation (machine):

> Your assessment is mixed or undecided: Neither hope nor concern clearly predominates. This is not a prediction that benefits and harms will be equal in magnitude.

### `Claims.levels.outlook_orientation.3`

Status: machine

English:

> Your outlook leans toward beneficial futures, while allowing serious risks.

German:

> Deine Einschätzung tendiert zu vorteilhaften Zukunftsszenarien, lässt aber ernsthafte Risiken zu.

Back-translation (machine):

> Your assessment tends toward beneficial future scenarios but allows for serious risks.

### `Claims.levels.outlook_orientation.4`

Status: machine

English:

> Your outlook is strongly oriented toward transformative flourishing.

German:

> Deine Einschätzung ist stark auf transformatives Gedeihen ausgerichtet.

Back-translation (machine):

> Your assessment is strongly oriented toward transformative flourishing.

### `Claims.levels.capability_ceiling.0`

Status: machine

English:

> AI is expected to remain bounded tools.

German:

> Es wird erwartet, dass KI auf begrenzte Werkzeuge beschränkt bleibt.

Back-translation (machine):

> AI is expected to remain limited to restricted tools.

### `Claims.levels.capability_ceiling.1`

Status: machine

English:

> AI is expected to match people across most cognitive work.

German:

> Es wird erwartet, dass KI bei den meisten kognitiven Tätigkeiten mit Menschen gleichzieht.

Back-translation (machine):

> AI is expected to draw level with humans in most cognitive activities.

### `Claims.levels.capability_ceiling.2`

Status: machine

English:

> AI is expected to substantially exceed people across cognitive work.

German:

> Es wird erwartet, dass KI Menschen bei kognitiven Tätigkeiten deutlich übertrifft.

Back-translation (machine):

> AI is expected to significantly surpass humans in cognitive activities.

### `Claims.levels.development_pace.0`

Status: machine

English:

> Stop or substantially slow development of more capable AI.

German:

> Die Entwicklung leistungsfähigerer KI stoppen oder erheblich verlangsamen.

Back-translation (machine):

> Stop or considerably slow the development of more capable AI.

### `Claims.levels.development_pace.1`

Status: machine

English:

> Continue development under stated safeguards.

German:

> Die Entwicklung unter den genannten Schutzvorkehrungen fortsetzen.

Back-translation (machine):

> Continue development under the stated safeguards.

### `Claims.levels.development_pace.2`

Status: machine

English:

> Speed up development of more capable AI.

German:

> Die Entwicklung leistungsfähigerer KI beschleunigen.

Back-translation (machine):

> Accelerate the development of more capable AI.

### `Claims.levels.deployment_policy.0`

Status: machine

English:

> Restrict the AI uses discussed until prior protections or permission are in place.

German:

> Die erörterten Einsatzmöglichkeiten von KI einschränken, bis vorab Schutzmaßnahmen oder Genehmigungen vorliegen.

Back-translation (machine):

> Restrict the discussed uses of AI until safeguards or approvals are in place beforehand.

### `Claims.levels.deployment_policy.1`

Status: machine

English:

> Allow the AI uses discussed with targeted accountability and protections.

German:

> Die erörterten Einsatzmöglichkeiten von KI mit gezielter Rechenschaftspflicht und Schutzmaßnahmen erlauben.

Back-translation (machine):

> Allow the discussed uses of AI with targeted accountability and safeguards.

### `Claims.levels.deployment_policy.2`

Status: machine

English:

> Minimize restrictions on the AI uses discussed.

German:

> Einschränkungen für die erörterten Einsatzmöglichkeiten von KI minimieren.

Back-translation (machine):

> Minimize restrictions on the discussed uses of AI.

### `Claims.levels.access_policy.0`

Status: machine

English:

> Restrict access to powerful AI.

German:

> Den Zugang zu leistungsfähiger KI einschränken.

Back-translation (machine):

> Restrict access to capable AI.

### `Claims.levels.access_policy.1`

Status: machine

English:

> Allow access subject to capability or use restrictions.

German:

> Zugang vorbehaltlich Beschränkungen der Fähigkeiten oder Nutzung erlauben.

Back-translation (machine):

> Allow access subject to restrictions on capabilities or use.

### `Claims.levels.access_policy.2`

Status: machine

English:

> Favor broad or open access to powerful AI.

German:

> Breiten oder offenen Zugang zu leistungsfähiger KI bevorzugen.

Back-translation (machine):

> Prefer broad or open access to capable AI.

### `Claims.levels.influence.0`

Status: machine

English:

> Human choices have almost no influence over the eventual AI outcome.

German:

> Menschliche Entscheidungen haben fast keinen Einfluss auf das letztendliche Ergebnis der KI-Entwicklung.

Back-translation (machine):

> Human decisions have almost no influence on the ultimate outcome of AI development.

### `Claims.levels.influence.1`

Status: machine

English:

> Human choices can make limited changes, but dominant forces constrain the outcome.

German:

> Menschliche Entscheidungen können begrenzte Veränderungen bewirken, aber vorherrschende Kräfte schränken das Ergebnis ein.

Back-translation (machine):

> Human decisions can bring about limited changes, but prevailing forces constrain the outcome.

### `Claims.levels.influence.2`

Status: machine

English:

> Human choices have meaningful but substantially constrained influence.

German:

> Menschliche Entscheidungen haben einen bedeutsamen, aber erheblich eingeschränkten Einfluss.

Back-translation (machine):

> Human decisions have a meaningful but considerably constrained influence.

### `Claims.levels.influence.3`

Status: machine

English:

> Human choices can substantially redirect the AI trajectory.

German:

> Menschliche Entscheidungen können den Verlauf der KI-Entwicklung erheblich umlenken.

Back-translation (machine):

> Human decisions can significantly redirect the course of AI development.

### `Claims.levels.influence.4`

Status: machine

English:

> Human choices are decisive: very different AI futures remain within collective reach.

German:

> Menschliche Entscheidungen sind ausschlaggebend: Sehr unterschiedliche KI-Zukünfte bleiben gemeinsam erreichbar.

Back-translation (machine):

> Human decisions are decisive: Very different AI futures remain jointly attainable.

### `Claims.levels.transformation.0`

Status: machine

English:

> AI is expected to cause little lasting societal change.

German:

> Es wird erwartet, dass KI nur geringe dauerhafte gesellschaftliche Veränderungen verursacht.

Back-translation (machine):

> AI is expected to cause only minor lasting societal changes.

### `Claims.levels.transformation.1`

Status: machine

English:

> AI is expected to bring incremental improvements and disruptions within familiar institutions.

German:

> Es wird erwartet, dass KI innerhalb vertrauter Institutionen schrittweise Verbesserungen und Verwerfungen mit sich bringt.

Back-translation (machine):

> AI is expected to bring gradual improvements and disruptions within familiar institutions.

### `Claims.levels.transformation.2`

Status: machine

English:

> AI is expected to substantially change several sectors of society.

German:

> Es wird erwartet, dass KI mehrere gesellschaftliche Bereiche erheblich verändert.

Back-translation (machine):

> AI is expected to significantly change several areas of society.

### `Claims.levels.transformation.3`

Status: machine

English:

> AI is expected to restructure economies, institutions and everyday life broadly.

German:

> Es wird erwartet, dass KI Wirtschaft, Institutionen und Alltag umfassend umgestaltet.

Back-translation (machine):

> AI is expected to comprehensively reshape the economy, institutions, and everyday life.

### `Claims.levels.transformation.4`

Status: machine

English:

> AI is expected to fundamentally transform civilization or humanity’s continued existence.

German:

> Es wird erwartet, dass KI die Zivilisation oder den Fortbestand der Menschheit grundlegend verändert.

Back-translation (machine):

> AI is expected to fundamentally change civilization or the continued existence of humanity.

### `Claims.uncertain`

Status: machine

English:

> You expressed uncertainty here rather than a directional expectation.

German:

> Du hast hier Unsicherheit statt einer gerichteten Erwartung geäußert.

Back-translation (machine):

> You expressed uncertainty here instead of a directional expectation.

### `Claims.unestablished`

Status: machine

English:

> A directional position is not yet established by these answers.

German:

> Eine gerichtete Position lässt sich anhand dieser Antworten noch nicht feststellen.

Back-translation (machine):

> A directional position cannot yet be determined on the basis of these answers.

### `Claims.unresolved`

Status: machine

English:

> The interpretation of these answers still needs clarification.

German:

> Die Interpretation dieser Antworten muss noch geklärt werden.

Back-translation (machine):

> The interpretation of these answers still needs to be clarified.

### `Claims.readings`

Status: machine

English:

> Several readings remain plausible: {readings}

German:

> Mehrere Lesarten bleiben plausibel: {readings}

Back-translation (machine):

> Several readings remain plausible: {readings}

### `Claims.unplacedUncertain.capability_trajectory`

Status: machine

English:

> You expressed uncertainty about whether or when transformative AI arrives.

German:

> Du hast Unsicherheit darüber geäußert, ob oder wann transformative KI entsteht.

Back-translation (machine):

> You expressed uncertainty about whether or when transformative AI will emerge.

### `Claims.unplacedUncertain.transition_dynamics`

Status: machine

English:

> You expressed uncertainty about how quickly AI-driven change unfolds.

German:

> Du hast Unsicherheit darüber geäußert, wie schnell sich der durch KI vorangetriebene Wandel vollzieht.

Back-translation (machine):

> You expressed uncertainty about how quickly the change driven by AI will take place.

### `Claims.unplacedUncertain.beneficial_potential`

Status: machine

English:

> You expressed uncertainty about the positive impact you expect from AI.

German:

> Du hast Unsicherheit darüber geäußert, welche positiven Auswirkungen du von KI erwartest.

Back-translation (machine):

> You expressed uncertainty about which positive effects you expect from AI.

### `Claims.unplacedUncertain.risk_landscape`

Status: machine

English:

> You expressed uncertainty about the harm you expect from AI.

German:

> Du hast Unsicherheit darüber geäußert, welche Schäden du von KI erwartest.

Back-translation (machine):

> You expressed uncertainty about which harms you expect from AI.

### `Claims.unplacedUncertain.technical_controllability`

Status: machine

English:

> You expressed uncertainty about whether technical control of powerful AI will work.

German:

> Du hast Unsicherheit darüber geäußert, ob die technische Kontrolle leistungsfähiger KI funktionieren wird.

Back-translation (machine):

> You expressed uncertainty about whether the technical control of capable AI will work.

### `Claims.unplacedUncertain.institutional_competence`

Status: machine

English:

> You expressed uncertainty about how effectively institutions will respond.

German:

> Du hast Unsicherheit darüber geäußert, wie wirksam Institutionen reagieren werden.

Back-translation (machine):

> You expressed uncertainty about how effectively institutions will respond.

### `Claims.unplacedUncertain.human_agency`

Status: machine

English:

> You expressed uncertainty about what happens to the forms of agency you value.

German:

> Du hast Unsicherheit darüber geäußert, was mit den Formen von Handlungsfähigkeit geschieht, die du schätzt.

Back-translation (machine):

> You expressed uncertainty about what will happen to the forms of agency that you value.

### `Claims.unplacedUncertain.action_posture`

Status: machine

English:

> You expressed uncertainty about which development or policy response you prefer.

German:

> Du hast Unsicherheit darüber geäußert, welche Reaktion bei Entwicklung oder Politik du bevorzugst.

Back-translation (machine):

> You expressed uncertainty about which response in development or policy you prefer.

### `Claims.unplacedUncertain.catastrophic_risk`

Status: machine

English:

> You expressed uncertainty about the prospect of catastrophic or irreversible harm.

German:

> Du hast Unsicherheit hinsichtlich der Möglichkeit katastrophaler oder irreversibler Schäden geäußert.

Back-translation (machine):

> You expressed uncertainty regarding the possibility of catastrophic or irreversible harms.

### `Claims.unplacedUnestablished.capability_trajectory`

Status: machine

English:

> These answers do not yet establish whether or when transformative AI arrives.

German:

> Diese Antworten lassen noch nicht erkennen, ob oder wann transformative KI entsteht.

Back-translation (machine):

> These answers do not yet indicate whether or when transformative AI will emerge.

### `Claims.unplacedUnestablished.transition_dynamics`

Status: machine

English:

> These answers do not yet establish how quickly AI-driven change unfolds.

German:

> Diese Antworten lassen noch nicht erkennen, wie schnell sich der durch KI vorangetriebene Wandel vollzieht.

Back-translation (machine):

> These answers do not yet indicate how quickly the change driven by AI will take place.

### `Claims.unplacedUnestablished.beneficial_potential`

Status: machine

English:

> These answers do not yet establish the positive impact you expect from AI.

German:

> Diese Antworten lassen noch nicht erkennen, welche positiven Auswirkungen du von KI erwartest.

Back-translation (machine):

> These answers do not yet indicate which positive effects you expect from AI.

### `Claims.unplacedUnestablished.risk_landscape`

Status: machine

English:

> These answers do not yet establish the harm you expect from AI.

German:

> Diese Antworten lassen noch nicht erkennen, welche Schäden du von KI erwartest.

Back-translation (machine):

> These answers do not yet indicate which harms you expect from AI.

### `Claims.unplacedUnestablished.technical_controllability`

Status: machine

English:

> These answers do not yet establish whether technical control of powerful AI will work.

German:

> Diese Antworten lassen noch nicht erkennen, ob die technische Kontrolle leistungsfähiger KI funktionieren wird.

Back-translation (machine):

> These answers do not yet indicate whether the technical control of capable AI will work.

### `Claims.unplacedUnestablished.institutional_competence`

Status: machine

English:

> These answers do not yet establish how effectively institutions will respond.

German:

> Diese Antworten lassen noch nicht erkennen, wie wirksam Institutionen reagieren werden.

Back-translation (machine):

> These answers do not yet indicate how effectively institutions will respond.

### `Claims.unplacedUnestablished.human_agency`

Status: machine

English:

> These answers do not yet establish what happens to the forms of agency you value.

German:

> Diese Antworten lassen noch nicht erkennen, was mit den Formen der Handlungsfähigkeit geschieht, die dir wichtig sind.

Back-translation (machine):

> These answers do not yet reveal what happens to the forms of agency that are important to you.

### `Claims.unplacedUnestablished.action_posture`

Status: machine

English:

> These answers do not yet establish which development or policy response you prefer.

German:

> Diese Antworten lassen noch nicht erkennen, welche Reaktion bei der Entwicklung oder in der Politik du bevorzugst.

Back-translation (machine):

> These answers do not yet reveal which response you prefer in development or in policy.

### `Claims.unplacedUnestablished.catastrophic_risk`

Status: machine

English:

> These answers do not yet establish the prospect of catastrophic or irreversible harm.

German:

> Diese Antworten lassen noch nicht erkennen, wie wahrscheinlich katastrophale oder irreversible Schäden sind.

Back-translation (machine):

> These answers do not yet reveal how likely catastrophic or irreversible harms are.

### `Claims.facetUnsettled`

Status: machine

English:

> You have not settled on a position here.

German:

> Du hast dich hier noch nicht auf eine Position festgelegt.

Back-translation (machine):

> You have not yet committed to a position here.

### `Claims.axisUnsettled`

Status: machine

English:

> You have not settled on this. The point marks the center of the open range, not a moderate belief.

German:

> Du hast dich hierzu noch nicht festgelegt. Der Punkt markiert die Mitte des offenen Bereichs, nicht eine gemäßigte Überzeugung.

Back-translation (machine):

> You have not yet committed yourself on this. The point marks the middle of the open range, not a moderate conviction.

### `Claims.axisTentative`

Status: machine

English:

> A tentative estimate from your answers; the wider range shows other plausible readings.

German:

> Eine vorläufige Schätzung auf Grundlage deiner Antworten; der breitere Bereich zeigt andere plausible Deutungen.

Back-translation (machine):

> A preliminary estimate based on your answers; the broader range shows other plausible interpretations.

### `Claims.timelineExpressed`

Status: machine

English:

> Timing expressed in answer {number}; see the full answer for its scope and uncertainty.

German:

> Zeithorizont ausgedrückt in Antwort {number}; die vollständige Antwort zeigt den Geltungsbereich und die Unsicherheit.

Back-translation (machine):

> Time horizon expressed in answer {number}; the full answer shows the scope and the uncertainty.

### `Claims.timelineUnsettled`

Status: machine

English:

> You have not settled on a timeline.

German:

> Du hast dich noch nicht auf einen Zeithorizont festgelegt.

Back-translation (machine):

> You have not yet committed to a time horizon.
