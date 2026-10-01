# French review packet

Generated 2026-10-01 for `fr` (fr), content 0.4.0-draft and rubric 0.1.0-draft. Statuses: 140 machine.

Only these strings need a native speaker before they are treated as final: the root question, the recovery and retry copy, and the wording of result claims. Everything else may stay machine-translated. Check that each translation keeps the English meaning and degree, adds no loaded premise, reads neutrally and naturally, and leaves Doom, Bloom, Doom or Bloom and P(doom) untranslated. Placeholders such as `{readings}` and ICU syntax must stay as they are.

Send corrections as edits to `content/l10n/fr/releases/0.4.0-draft.json`, `content/l10n/fr/rubrics/0.1.0-draft.json` or `messages/fr.json` (with their `content/l10n/fr/messages.json` hashes refreshed by `pnpm l10n:translate --locale=fr --only-stale`). Record the completed review with `pnpm l10n:review --locale=fr --approve=<reviewer>`.

## Root question

### `prompt:root:text`

Status: machine

English:

> What do you think AI means for our future—and why?

French:

> Selon vous, que signifie l’IA pour notre avenir, et pourquoi ?

Back-translation (machine):

> In your view, what does AI mean for our future, and why?

## Recovery and retry copy

### `prompt:root:reask` (used by 47 questions)

Status: machine

English:

> I could not connect that answer to this question. A few words about your view are enough—want to try again?

French:

> Je n’ai pas pu relier cette réponse à la question. Quelques mots sur votre point de vue suffisent. Voulez-vous réessayer ?

Back-translation (machine):

> I could not connect this answer to the question. A few words about your point of view are enough. Would you like to try again?

### `prompt:root:clarification` (used by 47 questions)

Status: machine

English:

> I am not sure how to read that. Could you say a little more about what you mean?

French:

> Je ne suis pas sûr de savoir comment interpréter cela. Pourriez-vous préciser un peu ce que vous voulez dire ?

Back-translation (machine):

> I am not sure how to interpret that. Could you clarify a little what you mean?

### `prompt:root:exhausted` (used by 47 questions)

Status: machine

English:

> Let’s pause here. You can try a different question, stop for now, or restart.

French:

> Faisons une pause ici. Vous pouvez essayer une autre question, vous arrêter pour le moment ou recommencer.

Back-translation (machine):

> Let us pause here. You can try another question, stop for now, or start again.

### `prompt:risk.cyber-balance:reask` (used by 3 questions)

Status: machine

English:

> Do you think AI will help cyberattackers or defenders more, and why?

French:

> Pensez-vous que l’IA aidera davantage les auteurs de cyberattaques ou ceux qui s’en défendent, et pourquoi ?

Back-translation (machine):

> Do you think AI will help the perpetrators of cyberattacks more or those who defend against them, and why?

### `Interview.failedTitle`

Status: machine

English:

> This step did not finish

French:

> Cette étape ne s’est pas terminée

Back-translation (machine):

> This step did not finish

### `Interview.failure.providerRejected`

Status: machine

English:

> Our AI provider, TypeSafe (Jev), rejected this request. Your submission is saved. Please try again later.

French:

> Notre fournisseur d’IA, TypeSafe (Jev), a rejeté cette requête. Votre réponse est enregistrée. Veuillez réessayer plus tard.

Back-translation (machine):

> Our AI provider, TypeSafe (Jev), rejected this request. Your answer is saved. Please try again later.

### `Interview.failure.saved`

Status: machine

English:

> Your submission is saved and your previous progress is unchanged. Please try again when you’re ready.

French:

> Votre réponse est enregistrée et votre progression précédente reste inchangée. Veuillez réessayer lorsque vous serez prêt.

Back-translation (machine):

> Your answer is saved and your previous progress remains unchanged. Please try again when you are ready.

### `Interview.retrySaved`

Status: machine

English:

> Retry saved submission

French:

> Réessayer d’envoyer la réponse enregistrée

Back-translation (machine):

> Try sending the saved answer again

### `Interview.recovery.paperclipsTitle`

Status: machine

English:

> We’ve made some paperclips.

French:

> Nous avons fabriqué quelques trombones.

Back-translation (machine):

> We made a few paper clips.

### `Interview.recovery.chooseTitle`

Status: machine

English:

> Choose what to do next

French:

> Choisissez la suite

Back-translation (machine):

> Choose what comes next

### `Interview.recovery.retryTitle`

Status: machine

English:

> Another try?

French:

> Une nouvelle tentative ?

Back-translation (machine):

> A new attempt?

### `Interview.recovery.paperclips`

Status: machine

English:

> You found the easter egg! Now let's get back to business...

French:

> Vous avez trouvé l’easter egg ! Maintenant, revenons à nos affaires...

Back-translation (machine):

> You found the easter egg! Now, let us get back to business...

### `Interview.recovery.stopped`

Status: machine

English:

> Your progress is here whenever you want to return.

French:

> Votre progression vous attend si vous souhaitez revenir.

Back-translation (machine):

> Your progress is waiting for you if you wish to return.

### `Interview.recovery.navigation`

Status: machine

English:

> Use the actions below to choose what happens next.

French:

> Utilisez les actions ci-dessous pour choisir la suite.

Back-translation (machine):

> Use the actions below to choose what comes next.

### `Interview.tryAgain`

Status: machine

English:

> Try again

French:

> Réessayer

Back-translation (machine):

> Try again

### `Interview.differentQuestion`

Status: machine

English:

> Try a different question

French:

> Essayer une autre question

Back-translation (machine):

> Try another question

## Result claims

Rubric levels (`level:*`) and the claims built in code (`Claims.*`) describe what the participant’s answers suggest. They are interpretations, not facts, and must keep their hedges.

### `level:capability_trajectory:0`

Status: machine

English:

> Transformative capability is not expected, or a low ceiling is explicitly anticipated.

French:

> Aucune capacité transformatrice n’est attendue, ou un plafond bas est explicitement anticipé.

Back-translation (machine):

> No transformative capability is expected, or a low ceiling is explicitly anticipated.

### `level:capability_trajectory:1`

Status: machine

English:

> Transformative capability is expected only on a long or indefinite horizon.

French:

> Une capacité transformatrice n’est attendue qu’à un horizon lointain ou indéfini.

Back-translation (machine):

> A transformative capability is expected only at a distant or indefinite horizon.

### `level:capability_trajectory:2`

Status: machine

English:

> Transformative capability is expected within decades, with timing conditional or uncertain.

French:

> Une capacité transformatrice est attendue d’ici quelques décennies, selon un calendrier conditionnel ou incertain.

Back-translation (machine):

> A transformative capability is expected within a few decades, according to a conditional or uncertain timeline.

### `level:capability_trajectory:3`

Status: machine

English:

> Transformative capability is expected within years, with named milestones or timing.

French:

> Une capacité transformatrice est attendue d’ici quelques années, avec des jalons ou un calendrier précis.

Back-translation (machine):

> A transformative capability is expected within a few years, with milestones or a precise timeline.

### `level:transition_dynamics:0`

Status: machine

English:

> A gradual transition with substantial warning and broad diffusion is expected.

French:

> Une transition progressive, assortie d’un préavis substantiel et d’une large diffusion, est attendue.

Back-translation (machine):

> A gradual transition, accompanied by substantial advance warning and broad diffusion, is expected.

### `level:transition_dynamics:1`

Status: machine

English:

> Noticeable acceleration is expected but meaningful adaptation time remains.

French:

> Une accélération sensible est attendue, mais il reste un temps d’adaptation significatif.

Back-translation (machine):

> A noticeable acceleration is expected, but significant time for adaptation remains.

### `level:transition_dynamics:2`

Status: machine

English:

> A fast transition with limited warning is expected.

French:

> Une transition rapide avec un préavis limité est attendue.

Back-translation (machine):

> A rapid transition with limited advance warning is expected.

### `level:transition_dynamics:3`

Status: machine

English:

> An abrupt self-reinforcing transition with very little warning is expected.

French:

> Une transition brutale et auto-amplificatrice, avec très peu de préavis, est attendue.

Back-translation (machine):

> An abrupt and self-amplifying transition, with very little advance warning, is expected.

### `level:beneficial_potential:0`

Status: machine

English:

> Little positive impact is expected even if advanced AI arrives.

French:

> Peu d’effets positifs sont attendus, même si une IA avancée voit le jour.

Back-translation (machine):

> Few positive effects are expected, even if advanced AI comes into being.

### `level:beneficial_potential:1`

Status: machine

English:

> Limited or narrowly distributed gains are expected.

French:

> Des bénéfices limités ou répartis de manière restreinte sont attendus.

Back-translation (machine):

> Limited or narrowly distributed benefits are expected.

### `level:beneficial_potential:2`

Status: machine

English:

> Substantial benefits are expected, with important conditions or distribution limits.

French:

> Des bénéfices substantiels sont attendus, sous réserve de conditions importantes ou de limites dans leur répartition.

Back-translation (machine):

> Substantial benefits are expected, subject to important conditions or limits in their distribution.

### `level:beneficial_potential:3`

Status: machine

English:

> Transformative, broadly valuable gains are expected.

French:

> Des bénéfices transformateurs et largement profitables sont attendus.

Back-translation (machine):

> Transformative and broadly beneficial benefits are expected.

### `level:risk_landscape:0`

Status: machine

English:

> Little material adverse impact is expected.

French:

> Peu d’effets négatifs substantiels sont attendus.

Back-translation (machine):

> Few substantial negative effects are expected.

### `level:risk_landscape:1`

Status: machine

English:

> Manageable or localized harms are expected.

French:

> Des dommages gérables ou localisés sont attendus.

Back-translation (machine):

> Manageable or localized harms are expected.

### `level:risk_landscape:2`

Status: machine

English:

> Severe or widespread harm is a material expected part of the future.

French:

> Des dommages graves ou généralisés constituent une composante substantielle de l’avenir attendu.

Back-translation (machine):

> Serious or widespread harms constitute a substantial component of the expected future.

### `level:risk_landscape:3`

Status: machine

English:

> Catastrophic or irreversible loss is central to the expected future.

French:

> Une perte catastrophique ou irréversible occupe une place centrale dans l’avenir attendu.

Back-translation (machine):

> Catastrophic or irreversible loss occupies a central place in the expected future.

### `level:technical_controllability:0`

Status: machine

English:

> Reliable technical control is expected to be infeasible.

French:

> Un contrôle technique fiable devrait être irréalisable.

Back-translation (machine):

> Reliable technical control should be infeasible.

### `level:technical_controllability:1`

Status: machine

English:

> Control is expected to be very difficult and unreliable.

French:

> Le contrôle devrait être très difficile et peu fiable.

Back-translation (machine):

> Control should be very difficult and unreliable.

### `level:technical_controllability:2`

Status: machine

English:

> Control is expected to be feasible under demanding conditions.

French:

> Le contrôle devrait être réalisable dans des conditions exigeantes.

Back-translation (machine):

> Control should be feasible under demanding conditions.

### `level:technical_controllability:3`

Status: machine

English:

> Reliable technical control is expected to be broadly feasible.

French:

> Un contrôle technique fiable devrait être largement réalisable.

Back-translation (machine):

> Reliable technical control should be broadly feasible.

### `level:institutional_competence:0`

Status: machine

English:

> Institutions are expected to fail to respond effectively.

French:

> Les institutions ne devraient pas parvenir à réagir efficacement.

Back-translation (machine):

> Institutions should not manage to respond effectively.

### `level:institutional_competence:1`

Status: machine

English:

> Institutions are expected to respond too weakly or too late in many cases.

French:

> Les institutions devraient, dans de nombreux cas, réagir trop faiblement ou trop tard.

Back-translation (machine):

> Institutions should, in many cases, respond too weakly or too late.

### `level:institutional_competence:2`

Status: machine

English:

> Effective responses are expected under specific coordination conditions.

French:

> Des réponses efficaces sont attendues sous réserve de conditions de coordination précises.

Back-translation (machine):

> Effective responses are expected subject to specific coordination conditions.

### `level:institutional_competence:3`

Status: machine

English:

> Institutions are expected to adapt effectively and in time.

French:

> Les institutions devraient s’adapter efficacement et à temps.

Back-translation (machine):

> Institutions should adapt effectively and in time.

### `level:human_agency:0`

Status: machine

English:

> The expected future undermines or eliminates the forms of agency/continuity the participant explicitly values.

French:

> L’avenir attendu compromet ou élimine les formes de capacité d’action ou de continuité auxquelles la personne interrogée accorde explicitement de la valeur.

Back-translation (machine):

> The expected future compromises or eliminates the forms of capacity for action or continuity to which the person questioned explicitly assigns value.

### `level:human_agency:1`

Status: machine

English:

> Significant valued agency or continuity is expected to be lost.

French:

> Une part importante de la capacité d’action ou de la continuité valorisée devrait être perdue.

Back-translation (machine):

> A significant part of the valued capacity for action or continuity should be lost.

### `level:human_agency:2`

Status: machine

English:

> Valued agency/continuity is expected to be substantially preserved, with changes or conditions.

French:

> La capacité d’action ou la continuité valorisée devrait être en grande partie préservée, moyennant des changements ou sous certaines conditions.

Back-translation (machine):

> The valued capacity for action or continuity should be largely preserved, with changes or under certain conditions.

### `level:human_agency:3`

Status: machine

English:

> Valued agency/continuity is expected to expand or flourish.

French:

> La capacité d’action ou la continuité valorisée devrait se développer ou s’épanouir.

Back-translation (machine):

> The valued capacity for action or continuity should develop or flourish.

### `level:action_posture:0`

Status: machine

English:

> A broad pause or substantial slowing is preferred.

French:

> Une pause générale ou un ralentissement substantiel sont privilégiés.

Back-translation (machine):

> A general pause or a substantial slowdown are preferred.

### `level:action_posture:1`

Status: machine

English:

> Restrained development and strong prior safeguards are preferred.

French:

> Un développement limité et de solides mesures de protection préalables sont privilégiés.

Back-translation (machine):

> Limited development and strong prior protective measures are preferred.

### `level:action_posture:2`

Status: machine

English:

> Continued development with targeted safeguards is preferred.

French:

> La poursuite du développement avec des mesures de protection ciblées est privilégiée.

Back-translation (machine):

> Continued development with targeted protective measures is preferred.

### `level:action_posture:3`

Status: machine

English:

> Rapid development or broad access is preferred.

French:

> Un développement rapide ou un large accès sont privilégiés.

Back-translation (machine):

> Rapid development or broad access are preferred.

### `level:causal_clarity:0`

Status: machine

English:

> An outcome is asserted without a supporting mechanism.

French:

> Un résultat est affirmé sans mécanisme à l’appui.

Back-translation (machine):

> An outcome is asserted without a supporting mechanism.

### `level:causal_clarity:1`

Status: machine

English:

> A causal factor is named but its connection to the outcome is not explained.

French:

> Un facteur causal est nommé, mais son lien avec le résultat n’est pas expliqué.

Back-translation (machine):

> A causal factor is named, but its link to the outcome is not explained.

### `level:causal_clarity:2`

Status: machine

English:

> A coherent mechanism connects a cause to an outcome with a relevant condition.

French:

> Un mécanisme cohérent relie une cause à un résultat sous une condition pertinente.

Back-translation (machine):

> A coherent mechanism links a cause to an outcome under a relevant condition.

### `level:causal_clarity:3`

Status: machine

English:

> A mechanism is developed with dependencies, limitations, or potential failure points.

French:

> Un mécanisme est développé en précisant ses dépendances, ses limites ou ses points de défaillance potentiels.

Back-translation (machine):

> A mechanism is developed by specifying its dependencies, its limits, or its potential points of failure.

### `level:scope_discipline:0`

Status: machine

English:

> Materially different scopes are conflated without qualification.

French:

> Des périmètres sensiblement différents sont confondus sans réserve.

Back-translation (machine):

> Significantly different scopes are conflated without qualification.

### `level:scope_discipline:1`

Status: machine

English:

> Some scope is specified but material boundaries remain blurred.

French:

> Un certain périmètre est précisé, mais des limites importantes restent floues.

Back-translation (machine):

> Some scope is specified, but important boundaries remain unclear.

### `level:scope_discipline:2`

Status: machine

English:

> Relevant actors, conditions, or horizons are distinguished.

French:

> Les acteurs, conditions ou horizons pertinents sont distingués.

Back-translation (machine):

> The relevant actors, conditions, or horizons are distinguished.

### `level:scope_discipline:3`

Status: machine

English:

> The boundaries needed to interpret consequential claims are clear, including relevant differences in actors, horizons or conditions. Every sentence need not restate those boundaries.

French:

> Les limites nécessaires à l’interprétation des affirmations lourdes de conséquences sont claires, notamment les différences pertinentes entre les acteurs, les horizons ou les conditions. Il n’est pas nécessaire que chaque phrase rappelle ces limites.

Back-translation (machine):

> The boundaries necessary for interpreting high-consequence claims are clear, including relevant differences among actors, horizons, or conditions. It is not necessary for every sentence to restate these boundaries.

### `level:appropriate_uncertainty:0`

Status: machine

English:

> Certainty is asserted despite explicitly limited or conflicting evidence.

French:

> Une certitude est affirmée malgré des éléments de preuve explicitement limités ou contradictoires.

Back-translation (machine):

> Certainty is asserted despite explicitly limited or contradictory evidence.

### `level:appropriate_uncertainty:1`

Status: machine

English:

> Uncertainty is acknowledged but the strength of the claim is poorly matched to its support.

French:

> L’incertitude est reconnue, mais la force de l’affirmation correspond mal aux éléments qui l’étayent.

Back-translation (machine):

> Uncertainty is acknowledged, but the strength of the claim poorly matches the evidence supporting it.

### `level:appropriate_uncertainty:2`

Status: machine

English:

> Confidence is proportionate to the supplied evidence and important unknowns are preserved.

French:

> Le degré de confiance est proportionné aux éléments de preuve fournis et les inconnues importantes sont maintenues.

Back-translation (machine):

> The degree of confidence is proportionate to the evidence provided, and important unknowns are maintained.

### `level:appropriate_uncertainty:3`

Status: machine

English:

> Uncertainty is differentiated across claims and linked to concrete evidence limitations.

French:

> L’incertitude est différenciée selon les affirmations et reliée à des limites concrètes des éléments de preuve.

Back-translation (machine):

> Uncertainty is differentiated by claim and linked to concrete limitations of the evidence.

### `level:internal_coherence:0`

Status: machine

English:

> Related statements remain incompatible under the same stated assumptions after clarification.

French:

> Après clarification, des affirmations connexes restent incompatibles sous les mêmes hypothèses énoncées.

Back-translation (machine):

> After clarification, related claims remain incompatible under the same stated assumptions.

### `level:internal_coherence:1`

Status: machine

English:

> A material incompatibility remains possible but partially explained.

French:

> Une incompatibilité importante reste possible, mais elle est partiellement expliquée.

Back-translation (machine):

> An important incompatibility remains possible, but it is partially explained.

### `level:internal_coherence:2`

Status: machine

English:

> Related positions fit under the stated assumptions.

French:

> Les positions connexes sont compatibles sous les hypothèses énoncées.

Back-translation (machine):

> The related positions are compatible under the stated assumptions.

### `level:internal_coherence:3`

Status: machine

English:

> The material claims fit together under their expressed assumptions and scopes; any apparent tensions are resolved by those distinctions. An already coherent account does not need to invent and then reconcile a contradiction.

French:

> Les affirmations importantes sont compatibles entre elles dans le cadre de leurs hypothèses et périmètres exprimés ; toute tension apparente est résolue par ces distinctions. Un exposé déjà cohérent n’a pas besoin d’inventer une contradiction pour ensuite la résoudre.

Back-translation (machine):

> Important claims are compatible with one another within the framework of their expressed assumptions and scopes; any apparent tension is resolved by these distinctions. An already coherent account does not need to invent a contradiction and then resolve it.

### `level:counterargument_engagement:0`

Status: machine

English:

> An alternative is dismissed without engaging its actual claim.

French:

> Une autre possibilité est écartée sans que son affirmation réelle soit examinée.

Back-translation (machine):

> Another possibility is dismissed without its actual claim being examined.

### `level:counterargument_engagement:1`

Status: machine

English:

> An alternative is acknowledged but its strongest relevant basis is omitted.

French:

> Une autre possibilité est reconnue, mais son fondement pertinent le plus solide est omis.

Back-translation (machine):

> Another possibility is acknowledged, but its strongest relevant basis is omitted.

### `level:counterargument_engagement:2`

Status: machine

English:

> A serious alternative is represented fairly and addressed on its merits.

French:

> Une autre possibilité sérieuse est présentée équitablement et examinée sur le fond.

Back-translation (machine):

> Another serious possibility is presented fairly and examined on the merits.

### `level:counterargument_engagement:3`

Status: machine

English:

> The participant identifies when a serious alternative could outperform their account.

French:

> Le participant détermine dans quels cas une autre possibilité sérieuse pourrait mieux rendre compte de la situation que son propre exposé.

Back-translation (machine):

> The participant determines in which cases another serious possibility could better account for the situation than their own account.

### `level:updateability:0`

Status: machine

English:

> The participant explicitly rules out revising the belief regardless of evidence.

French:

> Le participant exclut explicitement de réviser sa conviction, quels que soient les éléments de preuve.

Back-translation (machine):

> The participant explicitly rules out revising their belief, regardless of the evidence.

### `level:updateability:1`

Status: machine

English:

> A vague update condition is given without specifying relevant evidence.

French:

> Une condition de révision vague est donnée sans préciser les éléments de preuve pertinents.

Back-translation (machine):

> A vague revision condition is given without specifying the relevant evidence.

### `level:updateability:2`

Status: machine

English:

> Identifiable evidence or a development could change the stated belief.

French:

> Des éléments de preuve identifiables ou une évolution pourraient modifier la conviction énoncée.

Back-translation (machine):

> Identifiable evidence or a development could change the stated belief.

### `level:updateability:3`

Status: machine

English:

> A specific discriminating observation is tied to a particular belief change.

French:

> Une observation précise permettant de trancher est liée à une modification particulière de la conviction.

Back-translation (machine):

> A precise observation allowing the matter to be decided is linked to a particular change in belief.

### `level:grounded_understanding:0`

Status: machine

English:

> An explicitly supplied observation materially contradicts the claim it is used to support.

French:

> Une observation explicitement fournie contredit substantiellement l’affirmation qu’elle est censée étayer.

Back-translation (machine):

> An explicitly provided observation substantially contradicts the claim it is meant to support.

### `level:grounded_understanding:1`

Status: machine

English:

> An offered observation or example has a weak or unexplained connection to the claim.

French:

> Une observation ou un exemple proposé présente un lien faible ou inexpliqué avec l’affirmation.

Back-translation (machine):

> A proposed observation or example has a weak or unexplained link to the claim.

### `level:grounded_understanding:2`

Status: machine

English:

> A clear connection links the offered basis to the claim, with relevant limitations.

French:

> Un lien clair relie le fondement proposé à l’affirmation, avec les limites pertinentes.

Back-translation (machine):

> A clear link connects the proposed basis to the claim, with the relevant limitations.

### `level:grounded_understanding:3`

Status: machine

English:

> The account distinguishes observation, interpretation and uncertainty, explaining the limits of the offered basis.

French:

> L’exposé distingue l’observation, l’interprétation et l’incertitude, en expliquant les limites du fondement proposé.

Back-translation (machine):

> The account distinguishes observation, interpretation, and uncertainty, while explaining the limitations of the proposed basis.

### `level:catastrophic_risk:0`

Status: machine

English:

> Catastrophic outcomes are expected to be negligible or effectively avoided under the participant’s stated assumptions.

French:

> Les issues catastrophiques devraient être négligeables ou effectivement évitées dans le cadre des hypothèses énoncées par le participant.

Back-translation (machine):

> Catastrophic outcomes should be negligible or effectively avoided within the framework of the assumptions stated by the participant.

### `level:catastrophic_risk:1`

Status: machine

English:

> Catastrophe is possible but expected to be a limited part of the outlook under stated conditions.

French:

> Une catastrophe est possible, mais ne devrait constituer qu’une part limitée des perspectives dans les conditions énoncées.

Back-translation (machine):

> A catastrophe is possible, but should constitute only a limited share of the outlook under the stated conditions.

### `level:catastrophic_risk:2`

Status: machine

English:

> Catastrophic outcomes are a material possibility in the participant’s outlook, with consequential uncertainty or conditions.

French:

> Les issues catastrophiques constituent une possibilité substantielle dans les perspectives du participant, avec une incertitude ou des conditions lourdes de conséquences.

Back-translation (machine):

> Catastrophic outcomes constitute a substantial possibility in the participant's outlook, with uncertainty or high-consequence conditions.

### `level:catastrophic_risk:3`

Status: machine

English:

> Catastrophic outcomes dominate the participant’s expectation under stated assumptions.

French:

> Les issues catastrophiques dominent les attentes de la personne participante selon les hypothèses énoncées.

Back-translation (machine):

> Catastrophic outcomes dominate the participating person's expectations under the stated assumptions.

### `Claims.levels.overall_outlook.0`

Status: machine

English:

> Overwhelmingly harmful overall.

French:

> Impact global extrêmement néfaste.

Back-translation (machine):

> Extremely harmful overall impact.

### `Claims.levels.overall_outlook.1`

Status: machine

English:

> More harmful than beneficial overall.

French:

> Impact global plus néfaste que bénéfique.

Back-translation (machine):

> Overall impact more harmful than beneficial.

### `Claims.levels.overall_outlook.2`

Status: machine

English:

> A broadly balanced or limited overall impact is expected.

French:

> Un impact global globalement équilibré ou limité est attendu.

Back-translation (machine):

> An overall impact that is broadly balanced or limited is expected.

### `Claims.levels.overall_outlook.3`

Status: machine

English:

> More beneficial than harmful overall.

French:

> Impact global plus bénéfique que néfaste.

Back-translation (machine):

> Overall impact more beneficial than harmful.

### `Claims.levels.overall_outlook.4`

Status: machine

English:

> Overwhelmingly beneficial overall.

French:

> Impact global extrêmement bénéfique.

Back-translation (machine):

> Extremely beneficial overall impact.

### `Claims.levels.outlook_orientation.0`

Status: machine

English:

> Your outlook is strongly oriented toward catastrophe or overwhelming harm.

French:

> Votre perspective est fortement orientée vers la catastrophe ou des dommages considérables.

Back-translation (machine):

> Your perspective is strongly oriented toward catastrophe or considerable harm.

### `Claims.levels.outlook_orientation.1`

Status: machine

English:

> Your outlook leans toward concern about harmful futures, while allowing better outcomes.

French:

> Votre perspective tend vers l’inquiétude quant à des futurs néfastes, tout en laissant place à de meilleurs résultats.

Back-translation (machine):

> Your perspective tends toward concern about harmful futures, while leaving room for better outcomes.

### `Claims.levels.outlook_orientation.2`

Status: machine

English:

> Your outlook is mixed or undecided: neither hope nor worry clearly dominates. This is not a prediction of equal benefits and harms.

French:

> Votre perspective est mitigée ou indécise : ni l’espoir ni l’inquiétude ne prédomine clairement. Cela ne signifie pas que vous prévoyez des bénéfices et des dommages égaux.

Back-translation (machine):

> Your perspective is mixed or undecided: neither hope nor concern clearly predominates. This does not mean that you expect equal benefits and harms.

### `Claims.levels.outlook_orientation.3`

Status: machine

English:

> Your outlook leans toward beneficial futures, while allowing serious risks.

French:

> Votre perspective penche vers des futurs bénéfiques, tout en admettant des risques sérieux.

Back-translation (machine):

> Your perspective leans toward beneficial futures, while acknowledging serious risks.

### `Claims.levels.outlook_orientation.4`

Status: machine

English:

> Your outlook is strongly oriented toward transformative flourishing.

French:

> Votre perspective est fortement orientée vers un épanouissement transformateur.

Back-translation (machine):

> Your perspective is strongly oriented toward transformative flourishing.

### `Claims.levels.capability_ceiling.0`

Status: machine

English:

> AI is expected to remain bounded tools.

French:

> L’IA devrait rester un ensemble d’outils aux capacités limitées.

Back-translation (machine):

> AI should remain a set of tools with limited capabilities.

### `Claims.levels.capability_ceiling.1`

Status: machine

English:

> AI is expected to match people across most cognitive work.

French:

> L’IA devrait égaler les humains dans la plupart des tâches cognitives.

Back-translation (machine):

> AI should equal humans in most cognitive tasks.

### `Claims.levels.capability_ceiling.2`

Status: machine

English:

> AI is expected to substantially exceed people across cognitive work.

French:

> L’IA devrait largement dépasser les humains dans les tâches cognitives.

Back-translation (machine):

> AI should greatly surpass humans in cognitive tasks.

### `Claims.levels.development_pace.0`

Status: machine

English:

> Stop or substantially slow development of more capable AI.

French:

> Arrêter ou ralentir considérablement le développement d’IA plus performantes.

Back-translation (machine):

> Stop or considerably slow the development of more capable AI.

### `Claims.levels.development_pace.1`

Status: machine

English:

> Continue development under stated safeguards.

French:

> Poursuivre le développement dans le cadre des mesures de protection annoncées.

Back-translation (machine):

> Continue development within the framework of the announced protective measures.

### `Claims.levels.development_pace.2`

Status: machine

English:

> Speed up development of more capable AI.

French:

> Accélérer le développement d’IA plus performantes.

Back-translation (machine):

> Accelerate the development of more capable AI.

### `Claims.levels.deployment_policy.0`

Status: machine

English:

> Restrict the AI uses discussed until prior protections or permission are in place.

French:

> Restreindre les usages de l’IA évoqués jusqu’à la mise en place préalable de mesures de protection ou d’une autorisation.

Back-translation (machine):

> Restrict the mentioned uses of AI until protective measures or authorization have first been put in place.

### `Claims.levels.deployment_policy.1`

Status: machine

English:

> Allow the AI uses discussed with targeted accountability and protections.

French:

> Autoriser les usages de l’IA évoqués avec des mesures ciblées de responsabilisation et de protection.

Back-translation (machine):

> Allow the mentioned uses of AI with targeted accountability and protective measures.

### `Claims.levels.deployment_policy.2`

Status: machine

English:

> Minimize restrictions on the AI uses discussed.

French:

> Réduire au minimum les restrictions sur les usages de l’IA évoqués.

Back-translation (machine):

> Reduce restrictions on the mentioned uses of AI to a minimum.

### `Claims.levels.access_policy.0`

Status: machine

English:

> Restrict access to powerful AI.

French:

> Restreindre l’accès aux IA puissantes.

Back-translation (machine):

> Restrict access to powerful AI.

### `Claims.levels.access_policy.1`

Status: machine

English:

> Allow access subject to capability or use restrictions.

French:

> Autoriser l’accès sous réserve de restrictions liées aux capacités ou aux usages.

Back-translation (machine):

> Allow access subject to restrictions related to capabilities or uses.

### `Claims.levels.access_policy.2`

Status: machine

English:

> Favor broad or open access to powerful AI.

French:

> Privilégier un accès large ou ouvert aux IA puissantes.

Back-translation (machine):

> Favor broad or open access to powerful AI.

### `Claims.levels.influence.0`

Status: machine

English:

> Human choices have almost no influence over the eventual AI outcome.

French:

> Les choix humains n’ont presque aucune influence sur l’issue finale liée à l’IA.

Back-translation (machine):

> Human choices have almost no influence on the final outcome related to AI.

### `Claims.levels.influence.1`

Status: machine

English:

> Human choices can make limited changes, but dominant forces constrain the outcome.

French:

> Les choix humains peuvent apporter des changements limités, mais des forces dominantes contraignent l’issue.

Back-translation (machine):

> Human choices can bring limited changes, but dominant forces constrain the outcome.

### `Claims.levels.influence.2`

Status: machine

English:

> Human choices have meaningful but substantially constrained influence.

French:

> Les choix humains ont une influence significative, mais fortement contrainte.

Back-translation (machine):

> Human choices have significant, but strongly constrained, influence.

### `Claims.levels.influence.3`

Status: machine

English:

> Human choices can substantially redirect the AI trajectory.

French:

> Les choix humains peuvent réorienter considérablement la trajectoire de l’IA.

Back-translation (machine):

> Human choices can considerably redirect the trajectory of AI.

### `Claims.levels.influence.4`

Status: machine

English:

> Human choices are decisive: very different AI futures remain within collective reach.

French:

> Les choix humains sont décisifs : des futurs de l’IA très différents restent à la portée de l’action collective.

Back-translation (machine):

> Human choices are decisive: very different AI futures remain within the reach of collective action.

### `Claims.levels.transformation.0`

Status: machine

English:

> AI is expected to cause little lasting societal change.

French:

> L’IA devrait entraîner peu de changements durables dans la société.

Back-translation (machine):

> AI should lead to little lasting change in society.

### `Claims.levels.transformation.1`

Status: machine

English:

> AI is expected to bring incremental improvements and disruptions within familiar institutions.

French:

> L’IA devrait apporter des améliorations et des perturbations progressives au sein d’institutions familières.

Back-translation (machine):

> AI should bring gradual improvements and disruptions within familiar institutions.

### `Claims.levels.transformation.2`

Status: machine

English:

> AI is expected to substantially change several sectors of society.

French:

> L’IA devrait transformer considérablement plusieurs secteurs de la société.

Back-translation (machine):

> AI should considerably transform several sectors of society.

### `Claims.levels.transformation.3`

Status: machine

English:

> AI is expected to restructure economies, institutions and everyday life broadly.

French:

> L’IA devrait restructurer en profondeur les économies, les institutions et la vie quotidienne.

Back-translation (machine):

> AI should profoundly restructure economies, institutions, and daily life.

### `Claims.levels.transformation.4`

Status: machine

English:

> AI is expected to fundamentally transform civilization or humanity’s continued existence.

French:

> L’IA devrait transformer fondamentalement la civilisation ou la pérennité de l’existence humaine.

Back-translation (machine):

> AI should fundamentally transform civilization or the continued existence of humanity.

### `Claims.uncertain`

Status: machine

English:

> You expressed uncertainty here rather than a directional expectation.

French:

> Vous avez exprimé ici une incertitude plutôt qu’une attente orientée dans un sens précis.

Back-translation (machine):

> You expressed uncertainty here rather than an expectation oriented in a specific direction.

### `Claims.unestablished`

Status: machine

English:

> A directional position is not yet established by these answers.

French:

> Ces réponses ne permettent pas encore d’établir une position orientée dans un sens précis.

Back-translation (machine):

> These responses do not yet make it possible to establish a position oriented in a specific direction.

### `Claims.unresolved`

Status: machine

English:

> The interpretation of these answers still needs clarification.

French:

> L’interprétation de ces réponses doit encore être clarifiée.

Back-translation (machine):

> The interpretation of these responses still needs to be clarified.

### `Claims.readings`

Status: machine

English:

> Several readings remain plausible: {readings}

French:

> Plusieurs interprétations restent plausibles : {readings}

Back-translation (machine):

> Several interpretations remain plausible: {readings}

### `Claims.unplacedUncertain.capability_trajectory`

Status: machine

English:

> You expressed uncertainty about whether or when transformative AI arrives.

French:

> Vous avez exprimé une incertitude quant à savoir si ou quand une IA transformatrice arrivera.

Back-translation (machine):

> You expressed uncertainty about whether or when transformative AI will arrive.

### `Claims.unplacedUncertain.transition_dynamics`

Status: machine

English:

> You expressed uncertainty about how quickly AI-driven change unfolds.

French:

> Vous avez exprimé une incertitude quant à la rapidité avec laquelle les changements induits par l’IA se produiront.

Back-translation (machine):

> You expressed uncertainty about how quickly the changes induced by AI will occur.

### `Claims.unplacedUncertain.beneficial_potential`

Status: machine

English:

> You expressed uncertainty about the positive impact you expect from AI.

French:

> Vous avez exprimé une incertitude quant à l’impact positif que vous attendez de l’IA.

Back-translation (machine):

> You expressed uncertainty about the positive impact you expect from AI.

### `Claims.unplacedUncertain.risk_landscape`

Status: machine

English:

> You expressed uncertainty about the harm you expect from AI.

French:

> Vous avez exprimé une incertitude quant aux dommages que vous attendez de l’IA.

Back-translation (machine):

> You expressed uncertainty about the harms you expect from AI.

### `Claims.unplacedUncertain.technical_controllability`

Status: machine

English:

> You expressed uncertainty about whether technical control of powerful AI will work.

French:

> Vous avez exprimé une incertitude quant à l’efficacité du contrôle technique des IA puissantes.

Back-translation (machine):

> You expressed uncertainty about the effectiveness of the technical control of powerful AI.

### `Claims.unplacedUncertain.institutional_competence`

Status: machine

English:

> You expressed uncertainty about how effectively institutions will respond.

French:

> Vous avez exprimé une incertitude quant à l’efficacité avec laquelle les institutions réagiront.

Back-translation (machine):

> You expressed uncertainty about how effectively institutions will respond.

### `Claims.unplacedUncertain.human_agency`

Status: machine

English:

> You expressed uncertainty about what happens to the forms of agency you value.

French:

> Vous avez exprimé une incertitude quant à ce qu’il adviendra des formes de capacité d’action auxquelles vous accordez de l’importance.

Back-translation (machine):

> You expressed uncertainty about what will happen to the forms of agency to which you attach importance.

### `Claims.unplacedUncertain.action_posture`

Status: machine

English:

> You expressed uncertainty about which development or policy response you prefer.

French:

> Vous avez exprimé une incertitude quant à la réponse en matière de développement ou de politique publique que vous préférez.

Back-translation (machine):

> You expressed uncertainty about the response in terms of development or public policy that you prefer.

### `Claims.unplacedUncertain.catastrophic_risk`

Status: machine

English:

> You expressed uncertainty about the prospect of catastrophic or irreversible harm.

French:

> Vous avez exprimé une incertitude quant à la possibilité de dommages catastrophiques ou irréversibles.

Back-translation (machine):

> You expressed uncertainty about the possibility of catastrophic or irreversible harms.

### `Claims.unplacedUnestablished.capability_trajectory`

Status: machine

English:

> These answers do not yet establish whether or when transformative AI arrives.

French:

> Ces réponses ne permettent pas encore d’établir si ou quand une IA transformatrice arrivera.

Back-translation (machine):

> These responses do not yet make it possible to establish whether or when transformative AI will arrive.

### `Claims.unplacedUnestablished.transition_dynamics`

Status: machine

English:

> These answers do not yet establish how quickly AI-driven change unfolds.

French:

> Ces réponses ne permettent pas encore d’établir à quelle vitesse les changements induits par l’IA se produiront.

Back-translation (machine):

> These responses do not yet make it possible to establish how quickly the changes induced by AI will occur.

### `Claims.unplacedUnestablished.beneficial_potential`

Status: machine

English:

> These answers do not yet establish the positive impact you expect from AI.

French:

> Ces réponses ne permettent pas encore d’établir l’impact positif que vous attendez de l’IA.

Back-translation (machine):

> These responses do not yet make it possible to establish the positive impact you expect from AI.

### `Claims.unplacedUnestablished.risk_landscape`

Status: machine

English:

> These answers do not yet establish the harm you expect from AI.

French:

> Ces réponses ne permettent pas encore d’établir les dommages que vous attendez de l’IA.

Back-translation (machine):

> These responses do not yet make it possible to establish the harms you expect from AI.

### `Claims.unplacedUnestablished.technical_controllability`

Status: machine

English:

> These answers do not yet establish whether technical control of powerful AI will work.

French:

> Ces réponses ne permettent pas encore d’établir si le contrôle technique d’une IA puissante fonctionnera.

Back-translation (machine):

> These responses do not yet make it possible to establish whether the technical control of a powerful AI will work.

### `Claims.unplacedUnestablished.institutional_competence`

Status: machine

English:

> These answers do not yet establish how effectively institutions will respond.

French:

> Ces réponses ne permettent pas encore d’établir avec quelle efficacité les institutions réagiront.

Back-translation (machine):

> These responses do not yet make it possible to establish how effectively institutions will respond.

### `Claims.unplacedUnestablished.human_agency`

Status: machine

English:

> These answers do not yet establish what happens to the forms of agency you value.

French:

> Ces réponses ne permettent pas encore d’établir ce qu’il adviendra des formes de capacité d’action auxquelles vous accordez de l’importance.

Back-translation (machine):

> These answers do not yet make it possible to establish what will happen to the forms of capacity for action to which you attach importance.

### `Claims.unplacedUnestablished.action_posture`

Status: machine

English:

> These answers do not yet establish which development or policy response you prefer.

French:

> Ces réponses ne permettent pas encore d’établir quelle réponse en matière de développement ou de politique vous préférez.

Back-translation (machine):

> These answers do not yet make it possible to establish which response in terms of development or policy you prefer.

### `Claims.unplacedUnestablished.catastrophic_risk`

Status: machine

English:

> These answers do not yet establish the prospect of catastrophic or irreversible harm.

French:

> Ces réponses ne permettent pas encore d’établir la possibilité de dommages catastrophiques ou irréversibles.

Back-translation (machine):

> These answers do not yet make it possible to establish the possibility of catastrophic or irreversible harm.

### `Claims.facetUnsettled`

Status: machine

English:

> You have not settled on a position here.

French:

> Vous n’avez pas encore arrêté votre position sur ce point.

Back-translation (machine):

> You have not yet settled your position on this point.

### `Claims.axisUnsettled`

Status: machine

English:

> You have not settled on this. The point marks the center of the open range, not a moderate belief.

French:

> Vous n’avez pas encore arrêté votre position sur ce point. Le point indique le centre de la plage ouverte, et non une opinion modérée.

Back-translation (machine):

> You have not yet settled your position on this point. The point indicates the center of the open range, and not a moderate opinion.

### `Claims.axisTentative`

Status: machine

English:

> A tentative estimate from your answers; the wider range shows other plausible readings.

French:

> Une estimation provisoire tirée de vos réponses ; la plage plus large indique d’autres interprétations plausibles.

Back-translation (machine):

> A provisional estimate drawn from your answers; the wider range indicates other plausible interpretations.

### `Claims.timelineExpressed`

Status: machine

English:

> Timing expressed in answer {number}; see the full answer for its scope and uncertainty.

French:

> Horizon temporel exprimé dans la réponse {number} ; consultez la réponse complète pour en connaître la portée et le degré d’incertitude.

Back-translation (machine):

> Time horizon expressed in answer {number}; consult the full answer to know its scope and degree of uncertainty.

### `Claims.timelineUnsettled`

Status: machine

English:

> You have not settled on a timeline.

French:

> Vous n’avez pas encore arrêté d’horizon temporel.

Back-translation (machine):

> You have not yet settled on a time horizon.
