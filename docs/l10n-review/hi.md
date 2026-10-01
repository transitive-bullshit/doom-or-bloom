# Hindi review packet

Generated 2026-10-01 for `hi` (hi), content 0.4.0-draft and rubric 0.1.0-draft. Statuses: 140 machine.

Only these strings need a native speaker before they are treated as final: the root question, the recovery and retry copy, and the wording of result claims. Everything else may stay machine-translated. Check that each translation keeps the English meaning and degree, adds no loaded premise, reads neutrally and naturally, and leaves Doom, Bloom, Doom or Bloom and P(doom) untranslated. Placeholders such as `{readings}` and ICU syntax must stay as they are.

Send corrections as edits to `content/l10n/hi/releases/0.4.0-draft.json`, `content/l10n/hi/rubrics/0.1.0-draft.json` or `messages/hi.json` (with their `content/l10n/hi/messages.json` hashes refreshed by `pnpm l10n:translate --locale=hi --only-stale`). Record the completed review with `pnpm l10n:review --locale=hi --approve=<reviewer>`.

## Root question

### `prompt:root:text`

Status: machine

English:

> What do you think AI means for our future—and why?

Hindi:

> आपके विचार में एआई हमारे भविष्य के लिए क्या मायने रखती है—और क्यों?

Back-translation (machine):

> In your view, what does AI mean for our future—and why?

## Recovery and retry copy

### `prompt:root:reask` (used by 47 questions)

Status: machine

English:

> I could not connect that answer to this question. A few words about your view are enough—want to try again?

Hindi:

> मैं उस उत्तर को इस सवाल से नहीं जोड़ पाया। आपके दृष्टिकोण के बारे में कुछ शब्द ही काफ़ी हैं—क्या आप फिर से कोशिश करना चाहेंगे?

Back-translation (machine):

> I could not connect that answer to this question. Just a few words about your perspective are enough—would you like to try again?

### `prompt:root:clarification` (used by 47 questions)

Status: machine

English:

> I am not sure how to read that. Could you say a little more about what you mean?

Hindi:

> मुझे ठीक से समझ नहीं आया कि इसका क्या अर्थ निकालूँ। क्या आप अपनी बात के बारे में थोड़ा और बता सकते हैं?

Back-translation (machine):

> I did not understand exactly what meaning to draw from this. Can you tell me a little more about your point?

### `prompt:root:exhausted` (used by 47 questions)

Status: machine

English:

> Let’s pause here. You can try a different question, stop for now, or restart.

Hindi:

> आइए यहाँ रुकते हैं। आप कोई दूसरा सवाल आज़मा सकते हैं, अभी के लिए रुक सकते हैं या फिर से शुरू कर सकते हैं।

Back-translation (machine):

> Let us stop here. You can try another question, stop for now, or start again.

### `prompt:risk.cyber-balance:reask` (used by 3 questions)

Status: machine

English:

> Do you think AI will help cyberattackers or defenders more, and why?

Hindi:

> क्या आपको लगता है कि एआई साइबर हमलावरों या बचाव करने वालों में से किसकी अधिक मदद करेगी, और क्यों?

Back-translation (machine):

> Do you think AI will help cyber attackers or defenders more, and why?

### `Interview.failedTitle`

Status: machine

English:

> This step did not finish

Hindi:

> यह चरण पूरा नहीं हुआ

Back-translation (machine):

> This step was not completed

### `Interview.failure.providerRejected`

Status: machine

English:

> Our AI provider, TypeSafe (Jev), rejected this request. Your submission is saved. Please try again later.

Hindi:

> हमारे एआई प्रदाता, TypeSafe (Jev), ने इस अनुरोध को अस्वीकार कर दिया। आपका सबमिशन सेव है। कृपया बाद में फिर से कोशिश करें।

Back-translation (machine):

> Our AI provider, TypeSafe (Jev), rejected this request. Your submission is saved. Please try again later.

### `Interview.failure.saved`

Status: machine

English:

> Your submission is saved and your previous progress is unchanged. Please try again when you’re ready.

Hindi:

> आपका सबमिशन सेव है और आपकी पिछली प्रगति में कोई बदलाव नहीं हुआ है। जब आप तैयार हों, तो कृपया फिर से कोशिश करें।

Back-translation (machine):

> Your submission is saved and there has been no change to your previous progress. When you are ready, please try again.

### `Interview.retrySaved`

Status: machine

English:

> Retry saved submission

Hindi:

> सेव किया गया सबमिशन फिर से भेजें

Back-translation (machine):

> Send the saved submission again

### `Interview.recovery.paperclipsTitle`

Status: machine

English:

> We’ve made some paperclips.

Hindi:

> हमने कुछ पेपरक्लिप बना लिए हैं।

Back-translation (machine):

> We have made some paperclips.

### `Interview.recovery.chooseTitle`

Status: machine

English:

> Choose what to do next

Hindi:

> चुनें कि आगे क्या करना है

Back-translation (machine):

> Choose what to do next

### `Interview.recovery.retryTitle`

Status: machine

English:

> Another try?

Hindi:

> एक और कोशिश?

Back-translation (machine):

> One more try?

### `Interview.recovery.paperclips`

Status: machine

English:

> You found the easter egg! Now let's get back to business...

Hindi:

> आपको ईस्टर एग मिल गया! अब चलिए फिर से काम पर लौटते हैं...

Back-translation (machine):

> You found the Easter egg! Now let us get back to work again...

### `Interview.recovery.stopped`

Status: machine

English:

> Your progress is here whenever you want to return.

Hindi:

> जब भी आप लौटना चाहें, आपकी प्रगति यहीं मिलेगी।

Back-translation (machine):

> Whenever you want to return, your progress will be found here.

### `Interview.recovery.navigation`

Status: machine

English:

> Use the actions below to choose what happens next.

Hindi:

> आगे क्या होगा, यह चुनने के लिए नीचे दी गई कार्रवाइयों का उपयोग करें।

Back-translation (machine):

> Use the actions given below to choose what will happen next.

### `Interview.tryAgain`

Status: machine

English:

> Try again

Hindi:

> फिर से कोशिश करें

Back-translation (machine):

> Try again

### `Interview.differentQuestion`

Status: machine

English:

> Try a different question

Hindi:

> कोई दूसरा प्रश्न आज़माएँ

Back-translation (machine):

> Try another question

## Result claims

Rubric levels (`level:*`) and the claims built in code (`Claims.*`) describe what the participant’s answers suggest. They are interpretations, not facts, and must keep their hedges.

### `level:capability_trajectory:0`

Status: machine

English:

> Transformative capability is not expected, or a low ceiling is explicitly anticipated.

Hindi:

> परिवर्तनकारी क्षमता की उम्मीद नहीं है, या स्पष्ट रूप से इसकी अधिकतम सीमा कम रहने का अनुमान है।

Back-translation (machine):

> Transformative capability is not expected, or its maximum limit is explicitly estimated to remain low.

### `level:capability_trajectory:1`

Status: machine

English:

> Transformative capability is expected only on a long or indefinite horizon.

Hindi:

> परिवर्तनकारी क्षमता की उम्मीद केवल बहुत लंबे या अनिश्चित समय के बाद है।

Back-translation (machine):

> Transformative capability is expected only after a very long or uncertain time.

### `level:capability_trajectory:2`

Status: machine

English:

> Transformative capability is expected within decades, with timing conditional or uncertain.

Hindi:

> परिवर्तनकारी क्षमता की उम्मीद दशकों के भीतर है, लेकिन इसका समय कुछ शर्तों पर निर्भर या अनिश्चित है।

Back-translation (machine):

> Transformative capability is expected within decades, but its timing is dependent on some conditions or uncertain.

### `level:capability_trajectory:3`

Status: machine

English:

> Transformative capability is expected within years, with named milestones or timing.

Hindi:

> परिवर्तनकारी क्षमता की उम्मीद कुछ वर्षों के भीतर है, और इसके लिए खास पड़ाव या समय बताए गए हैं।

Back-translation (machine):

> Transformative capability is expected within a few years, and specific milestones or times have been stated for it.

### `level:transition_dynamics:0`

Status: machine

English:

> A gradual transition with substantial warning and broad diffusion is expected.

Hindi:

> पर्याप्त पूर्व-चेतावनी और व्यापक प्रसार के साथ धीरे-धीरे बदलाव होने की उम्मीद है।

Back-translation (machine):

> Change is expected to happen gradually, with sufficient advance warning and broad diffusion.

### `level:transition_dynamics:1`

Status: machine

English:

> Noticeable acceleration is expected but meaningful adaptation time remains.

Hindi:

> गति में साफ़ बढ़ोतरी की उम्मीद है, लेकिन उसके अनुरूप ढलने के लिए सार्थक समय फिर भी मिलेगा।

Back-translation (machine):

> A clear increase in speed is expected, but meaningful time to adapt accordingly will still be available.

### `level:transition_dynamics:2`

Status: machine

English:

> A fast transition with limited warning is expected.

Hindi:

> सीमित पूर्व-चेतावनी के साथ तेज़ बदलाव होने की उम्मीद है।

Back-translation (machine):

> Rapid change is expected to happen with limited advance warning.

### `level:transition_dynamics:3`

Status: machine

English:

> An abrupt self-reinforcing transition with very little warning is expected.

Hindi:

> बहुत कम पूर्व-चेतावनी के साथ अचानक ऐसा बदलाव होने की उम्मीद है जो खुद को और तेज़ करता जाए।

Back-translation (machine):

> A sudden change that keeps accelerating itself is expected to happen with very little advance warning.

### `level:beneficial_potential:0`

Status: machine

English:

> Little positive impact is expected even if advanced AI arrives.

Hindi:

> उन्नत एआई आ भी जाए, तब भी बहुत कम सकारात्मक प्रभाव की उम्मीद है।

Back-translation (machine):

> Even if advanced AI arrives, very little positive impact is expected.

### `level:beneficial_potential:1`

Status: machine

English:

> Limited or narrowly distributed gains are expected.

Hindi:

> सीमित लाभ या बहुत छोटे दायरे में बँटे लाभों की उम्मीद है।

Back-translation (machine):

> Limited benefits or benefits distributed within a very small scope are expected.

### `level:beneficial_potential:2`

Status: machine

English:

> Substantial benefits are expected, with important conditions or distribution limits.

Hindi:

> काफ़ी लाभ की उम्मीद है, लेकिन उनके साथ महत्वपूर्ण शर्तें या वितरण संबंधी सीमाएँ होंगी।

Back-translation (machine):

> Considerable benefits are expected, but they will come with significant conditions or distribution-related limitations.

### `level:beneficial_potential:3`

Status: machine

English:

> Transformative, broadly valuable gains are expected.

Hindi:

> व्यापक रूप से मूल्यवान और परिवर्तनकारी लाभों की उम्मीद है।

Back-translation (machine):

> Broadly valuable and transformative benefits are expected.

### `level:risk_landscape:0`

Status: machine

English:

> Little material adverse impact is expected.

Hindi:

> बहुत कम ठोस प्रतिकूल प्रभाव की उम्मीद है।

Back-translation (machine):

> Very little concrete adverse impact is expected.

### `level:risk_landscape:1`

Status: machine

English:

> Manageable or localized harms are expected.

Hindi:

> संभाले जा सकने वाले या स्थानीय स्तर तक सीमित नुकसानों की उम्मीद है।

Back-translation (machine):

> Harms that can be managed or are limited to the local level are expected.

### `level:risk_landscape:2`

Status: machine

English:

> Severe or widespread harm is a material expected part of the future.

Hindi:

> गंभीर या व्यापक नुकसान के भविष्य का एक ठोस और अपेक्षित हिस्सा होने की उम्मीद है।

Back-translation (machine):

> Serious or widespread harm is expected to be a concrete and expected part of the future.

### `level:risk_landscape:3`

Status: machine

English:

> Catastrophic or irreversible loss is central to the expected future.

Hindi:

> विनाशकारी या अपरिवर्तनीय क्षति अपेक्षित भविष्य का केंद्रीय हिस्सा है।

Back-translation (machine):

> Catastrophic or irreversible damage is a central part of the expected future.

### `level:technical_controllability:0`

Status: machine

English:

> Reliable technical control is expected to be infeasible.

Hindi:

> भरोसेमंद तकनीकी नियंत्रण को अव्यावहारिक माना गया है।

Back-translation (machine):

> Reliable technical control has been considered impractical.

### `level:technical_controllability:1`

Status: machine

English:

> Control is expected to be very difficult and unreliable.

Hindi:

> नियंत्रण के बहुत कठिन और अविश्वसनीय होने की उम्मीद है।

Back-translation (machine):

> Control is expected to be very difficult and unreliable.

### `level:technical_controllability:2`

Status: machine

English:

> Control is expected to be feasible under demanding conditions.

Hindi:

> कठिन शर्तों के तहत नियंत्रण के संभव होने की उम्मीद है।

Back-translation (machine):

> Control is expected to be possible under difficult conditions.

### `level:technical_controllability:3`

Status: machine

English:

> Reliable technical control is expected to be broadly feasible.

Hindi:

> भरोसेमंद तकनीकी नियंत्रण के व्यापक रूप से संभव होने की उम्मीद है।

Back-translation (machine):

> Reliable technical control is expected to be broadly possible.

### `level:institutional_competence:0`

Status: machine

English:

> Institutions are expected to fail to respond effectively.

Hindi:

> संस्थाओं से प्रभावी ढंग से प्रतिक्रिया देने में विफल रहने की उम्मीद है।

Back-translation (machine):

> Institutions are expected to fail to respond effectively.

### `level:institutional_competence:1`

Status: machine

English:

> Institutions are expected to respond too weakly or too late in many cases.

Hindi:

> कई मामलों में संस्थाओं की प्रतिक्रिया बहुत कमज़ोर या बहुत देर से आने की उम्मीद है।

Back-translation (machine):

> In many cases, institutions' response is expected to be very weak or to come very late.

### `level:institutional_competence:2`

Status: machine

English:

> Effective responses are expected under specific coordination conditions.

Hindi:

> समन्वय की खास शर्तें पूरी होने पर प्रभावी प्रतिक्रियाओं की उम्मीद है।

Back-translation (machine):

> Effective responses are expected when specific conditions of coordination are fulfilled.

### `level:institutional_competence:3`

Status: machine

English:

> Institutions are expected to adapt effectively and in time.

Hindi:

> संस्थाओं से समय रहते प्रभावी ढंग से अनुकूलन करने की उम्मीद है।

Back-translation (machine):

> Institutions are expected to adapt effectively in time.

### `level:human_agency:0`

Status: machine

English:

> The expected future undermines or eliminates the forms of agency/continuity the participant explicitly values.

Hindi:

> अपेक्षित भविष्य उन स्वायत्तता या निरंतरता के रूपों को कमज़ोर या समाप्त कर देता है जिन्हें प्रतिभागी ने स्पष्ट रूप से मूल्यवान माना है।

Back-translation (machine):

> The expected future weakens or eliminates the forms of autonomy or continuity that the participant has explicitly considered valuable.

### `level:human_agency:1`

Status: machine

English:

> Significant valued agency or continuity is expected to be lost.

Hindi:

> मूल्यवान स्वायत्तता या निरंतरता का एक बड़ा हिस्सा खो जाने की उम्मीद है।

Back-translation (machine):

> A large part of valuable autonomy or continuity is expected to be lost.

### `level:human_agency:2`

Status: machine

English:

> Valued agency/continuity is expected to be substantially preserved, with changes or conditions.

Hindi:

> बदलावों या शर्तों के साथ, मूल्यवान स्वायत्तता या निरंतरता के काफ़ी हद तक सुरक्षित रहने की उम्मीद है।

Back-translation (machine):

> With changes or conditions, valuable autonomy or continuity is expected to remain protected to a considerable extent.

### `level:human_agency:3`

Status: machine

English:

> Valued agency/continuity is expected to expand or flourish.

Hindi:

> मूल्यवान स्वायत्तता या निरंतरता के बढ़ने या फलने-फूलने की उम्मीद है।

Back-translation (machine):

> Valuable autonomy or continuity is expected to increase or flourish.

### `level:action_posture:0`

Status: machine

English:

> A broad pause or substantial slowing is preferred.

Hindi:

> व्यापक रोक या विकास को काफी धीमा करना बेहतर माना गया है।

Back-translation (machine):

> A broad halt or considerably slowing development has been considered better.

### `level:action_posture:1`

Status: machine

English:

> Restrained development and strong prior safeguards are preferred.

Hindi:

> संयमित विकास और पहले से मजबूत सुरक्षा उपाय बेहतर माने गए हैं।

Back-translation (machine):

> Restrained development and strong safety measures beforehand have been considered better.

### `level:action_posture:2`

Status: machine

English:

> Continued development with targeted safeguards is preferred.

Hindi:

> लक्षित सुरक्षा उपायों के साथ विकास जारी रखना बेहतर माना गया है।

Back-translation (machine):

> Continuing development with targeted safety measures has been considered better.

### `level:action_posture:3`

Status: machine

English:

> Rapid development or broad access is preferred.

Hindi:

> तेज विकास या व्यापक पहुँच बेहतर मानी गई है।

Back-translation (machine):

> Rapid development or broad access has been considered better.

### `level:causal_clarity:0`

Status: machine

English:

> An outcome is asserted without a supporting mechanism.

Hindi:

> परिणाम के समर्थन में कोई प्रक्रिया बताए बिना उसे सही मान लिया गया है।

Back-translation (machine):

> The outcome has been accepted as correct without stating any process in its support.

### `level:causal_clarity:1`

Status: machine

English:

> A causal factor is named but its connection to the outcome is not explained.

Hindi:

> एक कारण बताया गया है, लेकिन परिणाम से उसका संबंध समझाया नहीं गया है।

Back-translation (machine):

> A cause has been stated, but its relationship to the outcome has not been explained.

### `level:causal_clarity:2`

Status: machine

English:

> A coherent mechanism connects a cause to an outcome with a relevant condition.

Hindi:

> एक सुसंगत प्रक्रिया किसी प्रासंगिक शर्त के साथ कारण को परिणाम से जोड़ती है।

Back-translation (machine):

> A coherent process connects the cause to the outcome with a relevant condition.

### `level:causal_clarity:3`

Status: machine

English:

> A mechanism is developed with dependencies, limitations, or potential failure points.

Hindi:

> एक प्रक्रिया को उसकी निर्भरताओं, सीमाओं या विफलता के संभावित बिंदुओं के साथ विकसित किया गया है।

Back-translation (machine):

> A process has been developed along with its dependencies, limitations, or potential points of failure.

### `level:scope_discipline:0`

Status: machine

English:

> Materially different scopes are conflated without qualification.

Hindi:

> ठोस रूप से अलग-अलग दायरों को बिना किसी स्पष्टीकरण के एक मान लिया गया है।

Back-translation (machine):

> Concretely different scopes have been treated as one without any explanation.

### `level:scope_discipline:1`

Status: machine

English:

> Some scope is specified but material boundaries remain blurred.

Hindi:

> कुछ दायरा निर्धारित किया गया है, लेकिन महत्वपूर्ण सीमाएँ अस्पष्ट बनी हुई हैं।

Back-translation (machine):

> Some scope has been set, but important boundaries remain unclear.

### `level:scope_discipline:2`

Status: machine

English:

> Relevant actors, conditions, or horizons are distinguished.

Hindi:

> प्रासंगिक पक्षों, परिस्थितियों या समय-सीमाओं के बीच अंतर किया गया है।

Back-translation (machine):

> Distinctions have been made between relevant parties, circumstances, or time frames.

### `level:scope_discipline:3`

Status: machine

English:

> The boundaries needed to interpret consequential claims are clear, including relevant differences in actors, horizons or conditions. Every sentence need not restate those boundaries.

Hindi:

> महत्वपूर्ण दावों की व्याख्या के लिए आवश्यक सीमाएँ स्पष्ट हैं, जिनमें प्रासंगिक पक्षों, समय-सीमाओं या परिस्थितियों के बीच अंतर शामिल हैं। हर वाक्य में उन सीमाओं को दोहराना आवश्यक नहीं है।

Back-translation (machine):

> The boundaries necessary for interpreting important claims are clear, including distinctions between relevant parties, time frames, or circumstances. It is not necessary to repeat those boundaries in every sentence.

### `level:appropriate_uncertainty:0`

Status: machine

English:

> Certainty is asserted despite explicitly limited or conflicting evidence.

Hindi:

> स्पष्ट रूप से सीमित या परस्पर विरोधी साक्ष्य के बावजूद निश्चितता का दावा किया गया है।

Back-translation (machine):

> Certainty has been claimed despite clearly limited or conflicting evidence.

### `level:appropriate_uncertainty:1`

Status: machine

English:

> Uncertainty is acknowledged but the strength of the claim is poorly matched to its support.

Hindi:

> अनिश्चितता स्वीकार की गई है, लेकिन दावे की मजबूती उसके समर्थन से ठीक तरह मेल नहीं खाती।

Back-translation (machine):

> Uncertainty has been acknowledged, but the strength of the claim does not properly match its support.

### `level:appropriate_uncertainty:2`

Status: machine

English:

> Confidence is proportionate to the supplied evidence and important unknowns are preserved.

Hindi:

> विश्वास का स्तर दिए गए साक्ष्य के अनुपात में है और महत्वपूर्ण अज्ञात बातों को अज्ञात ही रखा गया है।

Back-translation (machine):

> The level of confidence is proportional to the evidence given, and important unknown matters have been kept unknown.

### `level:appropriate_uncertainty:3`

Status: machine

English:

> Uncertainty is differentiated across claims and linked to concrete evidence limitations.

Hindi:

> अलग-अलग दावों में अनिश्चितता के बीच अंतर किया गया है और उसे साक्ष्य की ठोस सीमाओं से जोड़ा गया है।

Back-translation (machine):

> Uncertainty has been distinguished across different claims and connected to concrete limitations of the evidence.

### `level:internal_coherence:0`

Status: machine

English:

> Related statements remain incompatible under the same stated assumptions after clarification.

Hindi:

> स्पष्टीकरण के बाद भी संबंधित कथन उन्हीं बताई गई मान्यताओं के तहत परस्पर असंगत बने हुए हैं।

Back-translation (machine):

> Even after explanation, the related statements remain mutually inconsistent under those same stated assumptions.

### `level:internal_coherence:1`

Status: machine

English:

> A material incompatibility remains possible but partially explained.

Hindi:

> एक महत्वपूर्ण असंगति संभव बनी हुई है, लेकिन उसे आंशिक रूप से समझाया गया है।

Back-translation (machine):

> An important inconsistency remains possible, but it has been partially explained.

### `level:internal_coherence:2`

Status: machine

English:

> Related positions fit under the stated assumptions.

Hindi:

> संबंधित दृष्टिकोण बताई गई मान्यताओं के तहत एक-दूसरे से मेल खाते हैं।

Back-translation (machine):

> The related viewpoints match one another under the stated assumptions.

### `level:internal_coherence:3`

Status: machine

English:

> The material claims fit together under their expressed assumptions and scopes; any apparent tensions are resolved by those distinctions. An already coherent account does not need to invent and then reconcile a contradiction.

Hindi:

> महत्वपूर्ण दावे अपनी व्यक्त मान्यताओं और दायरों के तहत एक-दूसरे से मेल खाते हैं; जो भी तनाव दिखाई देते हैं, वे इन अंतरों से सुलझ जाते हैं। पहले से सुसंगत विवरण में किसी विरोधाभास को गढ़कर फिर उसका समाधान करने की आवश्यकता नहीं है।

Back-translation (machine):

> Important claims match one another under their expressed assumptions and scopes; any tensions that appear are resolved by these differences. There is no need to invent a contradiction in an already coherent account and then resolve it.

### `level:counterargument_engagement:0`

Status: machine

English:

> An alternative is dismissed without engaging its actual claim.

Hindi:

> किसी वैकल्पिक दृष्टिकोण के वास्तविक दावे पर विचार किए बिना उसे खारिज कर दिया गया है।

Back-translation (machine):

> An alternative viewpoint has been dismissed without considering its actual claim.

### `level:counterargument_engagement:1`

Status: machine

English:

> An alternative is acknowledged but its strongest relevant basis is omitted.

Hindi:

> किसी वैकल्पिक दृष्टिकोण को स्वीकार किया गया है, लेकिन उसके सबसे मजबूत प्रासंगिक आधार को छोड़ दिया गया है।

Back-translation (machine):

> An alternative viewpoint has been acknowledged, but its strongest relevant basis has been omitted.

### `level:counterargument_engagement:2`

Status: machine

English:

> A serious alternative is represented fairly and addressed on its merits.

Hindi:

> एक गंभीर वैकल्पिक दृष्टिकोण को निष्पक्ष रूप से प्रस्तुत किया गया है और उसकी खूबियों के आधार पर उस पर विचार किया गया है।

Back-translation (machine):

> A serious alternative viewpoint has been presented fairly and considered on the basis of its merits.

### `level:counterargument_engagement:3`

Status: machine

English:

> The participant identifies when a serious alternative could outperform their account.

Hindi:

> प्रतिभागी यह पहचानते हैं कि किन परिस्थितियों में कोई गंभीर वैकल्पिक दृष्टिकोण उनके विवरण से बेहतर साबित हो सकता है।

Back-translation (machine):

> The participants identify the circumstances under which a serious alternative viewpoint could prove better than their account.

### `level:updateability:0`

Status: machine

English:

> The participant explicitly rules out revising the belief regardless of evidence.

Hindi:

> प्रतिभागी स्पष्ट रूप से कहते हैं कि साक्ष्य चाहे जो हो, वे अपने विश्वास में बदलाव नहीं करेंगे।

Back-translation (machine):

> The participants clearly say that regardless of the evidence, they will not change their belief.

### `level:updateability:1`

Status: machine

English:

> A vague update condition is given without specifying relevant evidence.

Hindi:

> प्रासंगिक साक्ष्य बताए बिना राय बदलने की एक अस्पष्ट शर्त दी गई है।

Back-translation (machine):

> A vague condition for changing the opinion has been given without stating relevant evidence.

### `level:updateability:2`

Status: machine

English:

> Identifiable evidence or a development could change the stated belief.

Hindi:

> पहचाने जा सकने वाले साक्ष्य या किसी घटनाक्रम से बताया गया विश्वास बदल सकता है।

Back-translation (machine):

> Identifiable evidence or a development could change the stated belief.

### `level:updateability:3`

Status: machine

English:

> A specific discriminating observation is tied to a particular belief change.

Hindi:

> अलग-अलग संभावनाओं में फर्क कर सकने वाले किसी विशिष्ट अवलोकन को विश्वास में किसी खास बदलाव से जोड़ा गया है।

Back-translation (machine):

> A specific observation capable of distinguishing between different possibilities has been linked to a particular change in belief.

### `level:grounded_understanding:0`

Status: machine

English:

> An explicitly supplied observation materially contradicts the claim it is used to support.

Hindi:

> स्पष्ट रूप से दिया गया कोई अवलोकन उस दावे का ठोस रूप से खंडन करता है, जिसके समर्थन में उसका उपयोग किया गया है।

Back-translation (machine):

> An explicitly given observation concretely contradicts the claim in support of which it was used.

### `level:grounded_understanding:1`

Status: machine

English:

> An offered observation or example has a weak or unexplained connection to the claim.

Hindi:

> दिए गए किसी अवलोकन या उदाहरण का दावे से संबंध कमजोर है या समझाया नहीं गया है।

Back-translation (machine):

> The connection of a given observation or example to the claim is weak or has not been explained.

### `level:grounded_understanding:2`

Status: machine

English:

> A clear connection links the offered basis to the claim, with relevant limitations.

Hindi:

> प्रासंगिक सीमाओं को ध्यान में रखते हुए, दिए गए आधार और दावे के बीच स्पष्ट संबंध स्थापित किया गया है।

Back-translation (machine):

> Taking the relevant boundaries into account, a clear connection has been established between the given basis and the claim.

### `level:grounded_understanding:3`

Status: machine

English:

> The account distinguishes observation, interpretation and uncertainty, explaining the limits of the offered basis.

Hindi:

> विवरण में अवलोकन, व्याख्या और अनिश्चितता के बीच अंतर किया गया है और दिए गए आधार की सीमाएँ समझाई गई हैं।

Back-translation (machine):

> The account distinguishes between observation, interpretation, and uncertainty, and the limitations of the given basis have been explained.

### `level:catastrophic_risk:0`

Status: machine

English:

> Catastrophic outcomes are expected to be negligible or effectively avoided under the participant’s stated assumptions.

Hindi:

> प्रतिभागी की बताई गई मान्यताओं के तहत विनाशकारी परिणामों की संभावना नगण्य रहने या उनसे प्रभावी रूप से बच निकलने की अपेक्षा है।

Back-translation (machine):

> Under the participant's stated assumptions, the probability of catastrophic outcomes is expected to remain negligible or they are expected to be effectively avoided.

### `level:catastrophic_risk:1`

Status: machine

English:

> Catastrophe is possible but expected to be a limited part of the outlook under stated conditions.

Hindi:

> बताई गई परिस्थितियों में विनाश संभव है, लेकिन दृष्टिकोण में इसकी भूमिका सीमित रहने की अपेक्षा है।

Back-translation (machine):

> Destruction is possible under the stated circumstances, but its role in the viewpoint is expected to remain limited.

### `level:catastrophic_risk:2`

Status: machine

English:

> Catastrophic outcomes are a material possibility in the participant’s outlook, with consequential uncertainty or conditions.

Hindi:

> प्रतिभागी के दृष्टिकोण में विनाशकारी परिणाम एक महत्वपूर्ण संभावना हैं, जिनसे जुड़ी अनिश्चितता या परिस्थितियों के गंभीर परिणाम हो सकते हैं।

Back-translation (machine):

> In the participant's viewpoint, catastrophic outcomes are a significant possibility, and the uncertainty or circumstances associated with them could have serious consequences.

### `level:catastrophic_risk:3`

Status: machine

English:

> Catastrophic outcomes dominate the participant’s expectation under stated assumptions.

Hindi:

> बताई गई मान्यताओं के तहत प्रतिभागी की अपेक्षा में विनाशकारी परिणाम प्रमुख हैं।

Back-translation (machine):

> Under the stated assumptions, catastrophic outcomes are prominent in the participant's expectation.

### `Claims.levels.overall_outlook.0`

Status: machine

English:

> Overwhelmingly harmful overall.

Hindi:

> कुल मिलाकर अत्यधिक नुकसानदेह।

Back-translation (machine):

> Overall, extremely harmful.

### `Claims.levels.overall_outlook.1`

Status: machine

English:

> More harmful than beneficial overall.

Hindi:

> कुल मिलाकर लाभदायक से अधिक नुकसानदेह।

Back-translation (machine):

> Overall, more harmful than beneficial.

### `Claims.levels.overall_outlook.2`

Status: machine

English:

> A broadly balanced or limited overall impact is expected.

Hindi:

> कुल मिलाकर व्यापक रूप से संतुलित या सीमित प्रभाव की अपेक्षा है।

Back-translation (machine):

> Overall, broadly balanced or limited impact is expected.

### `Claims.levels.overall_outlook.3`

Status: machine

English:

> More beneficial than harmful overall.

Hindi:

> कुल मिलाकर नुकसानदेह से अधिक लाभदायक।

Back-translation (machine):

> Overall, more beneficial than harmful.

### `Claims.levels.overall_outlook.4`

Status: machine

English:

> Overwhelmingly beneficial overall.

Hindi:

> कुल मिलाकर अत्यधिक लाभदायक।

Back-translation (machine):

> Overall, extremely beneficial.

### `Claims.levels.outlook_orientation.0`

Status: machine

English:

> Your outlook is strongly oriented toward catastrophe or overwhelming harm.

Hindi:

> आपका दृष्टिकोण विनाश या अत्यधिक नुकसान की ओर दृढ़ता से झुका हुआ है।

Back-translation (machine):

> Your viewpoint is strongly tilted toward destruction or extreme harm.

### `Claims.levels.outlook_orientation.1`

Status: machine

English:

> Your outlook leans toward concern about harmful futures, while allowing better outcomes.

Hindi:

> आपका दृष्टिकोण नुकसानदेह भविष्य की चिंता की ओर झुकता है, साथ ही बेहतर नतीजों की संभावना भी मानता है।

Back-translation (machine):

> Your viewpoint leans toward concern about a harmful future, while also allowing for the possibility of better outcomes.

### `Claims.levels.outlook_orientation.2`

Status: machine

English:

> Your outlook is mixed or undecided: neither hope nor worry clearly dominates. This is not a prediction of equal benefits and harms.

Hindi:

> आपका दृष्टिकोण मिला-जुला या अनिर्णीत है: न आशा और न ही चिंता स्पष्ट रूप से हावी है। यह लाभ और नुकसान बराबर होने की भविष्यवाणी नहीं है।

Back-translation (machine):

> Your viewpoint is mixed or undecided: neither hope nor concern clearly dominates. This is not a prediction that benefits and harms will be equal.

### `Claims.levels.outlook_orientation.3`

Status: machine

English:

> Your outlook leans toward beneficial futures, while allowing serious risks.

Hindi:

> आपका दृष्टिकोण लाभकारी भविष्य की ओर झुका हुआ है, साथ ही गंभीर जोखिमों की संभावना को भी स्वीकार करता है।

Back-translation (machine):

> Your viewpoint is tilted toward a beneficial future, while also acknowledging the possibility of serious risks.

### `Claims.levels.outlook_orientation.4`

Status: machine

English:

> Your outlook is strongly oriented toward transformative flourishing.

Hindi:

> आपका दृष्टिकोण बड़े बदलावों से आने वाली समृद्धि की ओर दृढ़ता से उन्मुख है।

Back-translation (machine):

> Your viewpoint is strongly oriented toward prosperity arising from major changes.

### `Claims.levels.capability_ceiling.0`

Status: machine

English:

> AI is expected to remain bounded tools.

Hindi:

> एआई के सीमित दायरे वाले साधन बने रहने की अपेक्षा है।

Back-translation (machine):

> AI is expected to remain a tool with limited scope.

### `Claims.levels.capability_ceiling.1`

Status: machine

English:

> AI is expected to match people across most cognitive work.

Hindi:

> एआई के अधिकांश संज्ञानात्मक कार्यों में लोगों की बराबरी करने की अपेक्षा है।

Back-translation (machine):

> AI is expected to equal people in most cognitive tasks.

### `Claims.levels.capability_ceiling.2`

Status: machine

English:

> AI is expected to substantially exceed people across cognitive work.

Hindi:

> एआई के संज्ञानात्मक कार्यों में लोगों से बहुत आगे निकल जाने की अपेक्षा है।

Back-translation (machine):

> AI is expected to surpass people by far in cognitive tasks.

### `Claims.levels.development_pace.0`

Status: machine

English:

> Stop or substantially slow development of more capable AI.

Hindi:

> अधिक सक्षम एआई का विकास रोकें या उसकी गति काफी धीमी करें।

Back-translation (machine):

> Stop the development of more capable AI or slow its pace considerably.

### `Claims.levels.development_pace.1`

Status: machine

English:

> Continue development under stated safeguards.

Hindi:

> बताए गए सुरक्षा उपायों के तहत विकास जारी रखें।

Back-translation (machine):

> Continue development under the stated safety measures.

### `Claims.levels.development_pace.2`

Status: machine

English:

> Speed up development of more capable AI.

Hindi:

> अधिक सक्षम एआई के विकास की गति बढ़ाएँ।

Back-translation (machine):

> Increase the pace of development of more capable AI.

### `Claims.levels.deployment_policy.0`

Status: machine

English:

> Restrict the AI uses discussed until prior protections or permission are in place.

Hindi:

> जिन सुरक्षा उपायों या अनुमति का पहले से होना ज़रूरी है, उनके लागू होने तक चर्चा किए गए एआई उपयोगों को प्रतिबंधित रखें।

Back-translation (machine):

> Keep the discussed AI uses restricted until the safety measures or permission that need to be in place beforehand are implemented.

### `Claims.levels.deployment_policy.1`

Status: machine

English:

> Allow the AI uses discussed with targeted accountability and protections.

Hindi:

> लक्षित जवाबदेही और सुरक्षा उपायों के साथ चर्चा किए गए एआई उपयोगों की अनुमति दें।

Back-translation (machine):

> Allow the discussed AI uses with targeted accountability and safety measures.

### `Claims.levels.deployment_policy.2`

Status: machine

English:

> Minimize restrictions on the AI uses discussed.

Hindi:

> चर्चा किए गए एआई उपयोगों पर प्रतिबंध कम से कम रखें।

Back-translation (machine):

> Keep restrictions on the discussed AI uses to a minimum.

### `Claims.levels.access_policy.0`

Status: machine

English:

> Restrict access to powerful AI.

Hindi:

> शक्तिशाली एआई तक पहुँच प्रतिबंधित करें।

Back-translation (machine):

> Restrict access to powerful AI.

### `Claims.levels.access_policy.1`

Status: machine

English:

> Allow access subject to capability or use restrictions.

Hindi:

> क्षमता या उपयोग संबंधी प्रतिबंधों के अधीन पहुँच की अनुमति दें।

Back-translation (machine):

> Allow access subject to capability or use-related restrictions.

### `Claims.levels.access_policy.2`

Status: machine

English:

> Favor broad or open access to powerful AI.

Hindi:

> शक्तिशाली एआई तक व्यापक या खुली पहुँच को प्राथमिकता दें।

Back-translation (machine):

> Prioritize broad or open access to powerful AI.

### `Claims.levels.influence.0`

Status: machine

English:

> Human choices have almost no influence over the eventual AI outcome.

Hindi:

> एआई के अंतिम परिणाम पर मानवीय विकल्पों का लगभग कोई प्रभाव नहीं है।

Back-translation (machine):

> Human choices have almost no effect on AI's final outcome.

### `Claims.levels.influence.1`

Status: machine

English:

> Human choices can make limited changes, but dominant forces constrain the outcome.

Hindi:

> मानवीय विकल्प सीमित बदलाव ला सकते हैं, लेकिन प्रभावशाली शक्तियाँ परिणाम को सीमित करती हैं।

Back-translation (machine):

> Human choices can bring limited changes, but influential forces constrain the outcome.

### `Claims.levels.influence.2`

Status: machine

English:

> Human choices have meaningful but substantially constrained influence.

Hindi:

> मानवीय विकल्पों का सार्थक, लेकिन काफी सीमित प्रभाव है।

Back-translation (machine):

> Human choices have a meaningful, but quite limited effect.

### `Claims.levels.influence.3`

Status: machine

English:

> Human choices can substantially redirect the AI trajectory.

Hindi:

> मानवीय विकल्प एआई की दिशा को काफी हद तक बदल सकते हैं।

Back-translation (machine):

> Human choices can change AI's direction to a considerable extent.

### `Claims.levels.influence.4`

Status: machine

English:

> Human choices are decisive: very different AI futures remain within collective reach.

Hindi:

> मानवीय विकल्प निर्णायक हैं: बहुत अलग-अलग तरह के एआई भविष्य अभी भी सामूहिक पहुँच के भीतर हैं।

Back-translation (machine):

> Human choices are decisive: very different kinds of AI futures are still within collective reach.

### `Claims.levels.transformation.0`

Status: machine

English:

> AI is expected to cause little lasting societal change.

Hindi:

> एआई से समाज में बहुत कम स्थायी बदलाव आने की अपेक्षा है।

Back-translation (machine):

> AI is expected to bring very little lasting change in society.

### `Claims.levels.transformation.1`

Status: machine

English:

> AI is expected to bring incremental improvements and disruptions within familiar institutions.

Hindi:

> एआई से परिचित संस्थानों के भीतर क्रमिक सुधार और व्यवधान आने की अपेक्षा है।

Back-translation (machine):

> AI is expected to bring gradual improvements and disruptions within familiar institutions.

### `Claims.levels.transformation.2`

Status: machine

English:

> AI is expected to substantially change several sectors of society.

Hindi:

> एआई से समाज के कई क्षेत्रों में काफी बदलाव आने की अपेक्षा है।

Back-translation (machine):

> AI is expected to bring considerable changes across many areas of society.

### `Claims.levels.transformation.3`

Status: machine

English:

> AI is expected to restructure economies, institutions and everyday life broadly.

Hindi:

> एआई से अर्थव्यवस्थाओं, संस्थानों और रोज़मर्रा के जीवन का व्यापक पुनर्गठन होने की अपेक्षा है।

Back-translation (machine):

> AI is expected to cause broad restructuring of economies, institutions, and everyday life.

### `Claims.levels.transformation.4`

Status: machine

English:

> AI is expected to fundamentally transform civilization or humanity’s continued existence.

Hindi:

> एआई से सभ्यता या मानवता के निरंतर अस्तित्व में मूलभूत बदलाव आने की अपेक्षा है।

Back-translation (machine):

> AI is expected to bring fundamental changes to civilization or humanity's continued existence.

### `Claims.uncertain`

Status: machine

English:

> You expressed uncertainty here rather than a directional expectation.

Hindi:

> आपने यहाँ किसी दिशा में अपेक्षा जताने के बजाय अनिश्चितता व्यक्त की।

Back-translation (machine):

> Here, instead of expressing an expectation in one direction, you expressed uncertainty.

### `Claims.unestablished`

Status: machine

English:

> A directional position is not yet established by these answers.

Hindi:

> इन उत्तरों से अभी तक किसी दिशा में स्थिति स्थापित नहीं हुई है।

Back-translation (machine):

> These answers have not yet established a position in any direction.

### `Claims.unresolved`

Status: machine

English:

> The interpretation of these answers still needs clarification.

Hindi:

> इन उत्तरों की व्याख्या के लिए अभी और स्पष्टता चाहिए।

Back-translation (machine):

> More clarity is still needed to interpret these answers.

### `Claims.readings`

Status: machine

English:

> Several readings remain plausible: {readings}

Hindi:

> कई व्याख्याएँ अब भी संभव हैं: {readings}

Back-translation (machine):

> Several interpretations are still possible: {readings}

### `Claims.unplacedUncertain.capability_trajectory`

Status: machine

English:

> You expressed uncertainty about whether or when transformative AI arrives.

Hindi:

> आपने इस बारे में अनिश्चितता व्यक्त की कि बड़े बदलाव लाने वाला एआई आएगा या नहीं, या कब आएगा।

Back-translation (machine):

> You expressed uncertainty about whether, or when, AI that brings major changes will arrive.

### `Claims.unplacedUncertain.transition_dynamics`

Status: machine

English:

> You expressed uncertainty about how quickly AI-driven change unfolds.

Hindi:

> आपने इस बारे में अनिश्चितता व्यक्त की कि एआई से प्रेरित बदलाव कितनी तेज़ी से सामने आएगा।

Back-translation (machine):

> You expressed uncertainty about how quickly AI-inspired change will emerge.

### `Claims.unplacedUncertain.beneficial_potential`

Status: machine

English:

> You expressed uncertainty about the positive impact you expect from AI.

Hindi:

> आपने एआई से अपेक्षित सकारात्मक प्रभाव के बारे में अनिश्चितता व्यक्त की।

Back-translation (machine):

> You expressed uncertainty about the positive impact expected from AI.

### `Claims.unplacedUncertain.risk_landscape`

Status: machine

English:

> You expressed uncertainty about the harm you expect from AI.

Hindi:

> आपने एआई से अपेक्षित नुकसान के बारे में अनिश्चितता व्यक्त की।

Back-translation (machine):

> You expressed uncertainty about the harm expected from AI.

### `Claims.unplacedUncertain.technical_controllability`

Status: machine

English:

> You expressed uncertainty about whether technical control of powerful AI will work.

Hindi:

> आपने इस बारे में अनिश्चितता व्यक्त की कि शक्तिशाली एआई पर तकनीकी नियंत्रण कारगर होगा या नहीं।

Back-translation (machine):

> You expressed uncertainty about whether technical control over powerful AI will be effective.

### `Claims.unplacedUncertain.institutional_competence`

Status: machine

English:

> You expressed uncertainty about how effectively institutions will respond.

Hindi:

> आपने इस बारे में अनिश्चितता व्यक्त की कि संस्थाएँ कितने प्रभावी ढंग से प्रतिक्रिया देंगी।

Back-translation (machine):

> You expressed uncertainty about how effectively institutions will respond.

### `Claims.unplacedUncertain.human_agency`

Status: machine

English:

> You expressed uncertainty about what happens to the forms of agency you value.

Hindi:

> आपने इस बारे में अनिश्चितता व्यक्त की कि आपके लिए अहम स्वायत्तता के रूपों का क्या होगा।

Back-translation (machine):

> You expressed uncertainty about what will happen to the forms of autonomy that matter to you.

### `Claims.unplacedUncertain.action_posture`

Status: machine

English:

> You expressed uncertainty about which development or policy response you prefer.

Hindi:

> आपने इस बारे में अनिश्चितता व्यक्त की कि विकास या नीति से जुड़ी कौन-सी प्रतिक्रिया आपको बेहतर लगती है।

Back-translation (machine):

> You expressed uncertainty about which response related to development or policy seems better to you.

### `Claims.unplacedUncertain.catastrophic_risk`

Status: machine

English:

> You expressed uncertainty about the prospect of catastrophic or irreversible harm.

Hindi:

> आपने विनाशकारी या अपरिवर्तनीय नुकसान की संभावना के बारे में अनिश्चितता व्यक्त की।

Back-translation (machine):

> You expressed uncertainty about the possibility of catastrophic or irreversible harm.

### `Claims.unplacedUnestablished.capability_trajectory`

Status: machine

English:

> These answers do not yet establish whether or when transformative AI arrives.

Hindi:

> ये उत्तर अभी तक यह स्थापित नहीं करते कि बड़े बदलाव लाने वाला एआई आएगा या नहीं, या कब आएगा।

Back-translation (machine):

> These answers do not yet establish whether, or when, AI that brings major changes will arrive.

### `Claims.unplacedUnestablished.transition_dynamics`

Status: machine

English:

> These answers do not yet establish how quickly AI-driven change unfolds.

Hindi:

> ये उत्तर अभी तक यह स्थापित नहीं करते कि एआई से प्रेरित बदलाव कितनी तेज़ी से सामने आएगा।

Back-translation (machine):

> These answers do not yet establish how quickly AI-inspired change will emerge.

### `Claims.unplacedUnestablished.beneficial_potential`

Status: machine

English:

> These answers do not yet establish the positive impact you expect from AI.

Hindi:

> इन उत्तरों से अभी यह तय नहीं होता कि आप एआई से किस सकारात्मक प्रभाव की अपेक्षा करते हैं।

Back-translation (machine):

> These answers do not yet determine what positive impact you expect from AI.

### `Claims.unplacedUnestablished.risk_landscape`

Status: machine

English:

> These answers do not yet establish the harm you expect from AI.

Hindi:

> इन उत्तरों से अभी यह तय नहीं होता कि आप एआई से किस नुकसान की अपेक्षा करते हैं।

Back-translation (machine):

> These answers do not yet determine what harm you expect from AI.

### `Claims.unplacedUnestablished.technical_controllability`

Status: machine

English:

> These answers do not yet establish whether technical control of powerful AI will work.

Hindi:

> इन उत्तरों से अभी यह तय नहीं होता कि शक्तिशाली एआई पर तकनीकी नियंत्रण कारगर होगा या नहीं।

Back-translation (machine):

> These answers do not yet determine whether technical control over powerful AI will be effective.

### `Claims.unplacedUnestablished.institutional_competence`

Status: machine

English:

> These answers do not yet establish how effectively institutions will respond.

Hindi:

> इन उत्तरों से अभी यह तय नहीं होता कि संस्थाएँ कितने प्रभावी ढंग से प्रतिक्रिया देंगी।

Back-translation (machine):

> These answers do not yet determine how effectively institutions will respond.

### `Claims.unplacedUnestablished.human_agency`

Status: machine

English:

> These answers do not yet establish what happens to the forms of agency you value.

Hindi:

> इन उत्तरों से अभी यह तय नहीं होता कि निर्णय लेने और कार्य करने की जिन क्षमताओं को आप महत्व देते हैं, उनका क्या होगा।

Back-translation (machine):

> These answers do not yet determine what will happen to the capacities for making decisions and acting that you value.

### `Claims.unplacedUnestablished.action_posture`

Status: machine

English:

> These answers do not yet establish which development or policy response you prefer.

Hindi:

> इन उत्तरों से अभी यह तय नहीं होता कि आप विकास या नीति से जुड़ी किस प्रतिक्रिया को प्राथमिकता देते हैं।

Back-translation (machine):

> These answers do not yet determine which response related to development or policy you prioritize.

### `Claims.unplacedUnestablished.catastrophic_risk`

Status: machine

English:

> These answers do not yet establish the prospect of catastrophic or irreversible harm.

Hindi:

> इन उत्तरों से अभी विनाशकारी या अपरिवर्तनीय नुकसान की आशंका तय नहीं होती।

Back-translation (machine):

> These answers do not yet determine the possibility of catastrophic or irreversible harm.

### `Claims.facetUnsettled`

Status: machine

English:

> You have not settled on a position here.

Hindi:

> आपने यहाँ अभी कोई स्थिति तय नहीं की है।

Back-translation (machine):

> You have not yet settled on any position here.

### `Claims.axisUnsettled`

Status: machine

English:

> You have not settled on this. The point marks the center of the open range, not a moderate belief.

Hindi:

> आपने इस पर अभी कोई स्थिति तय नहीं की है। यह बिंदु खुले दायरे के केंद्र को दर्शाता है, किसी मध्यम राय को नहीं।

Back-translation (machine):

> You have not yet settled on any position on this. This point represents the center of the open range, not a moderate opinion.

### `Claims.axisTentative`

Status: machine

English:

> A tentative estimate from your answers; the wider range shows other plausible readings.

Hindi:

> आपके उत्तरों पर आधारित एक अस्थायी अनुमान; विस्तृत दायरा अन्य संभावित व्याख्याएँ दिखाता है।

Back-translation (machine):

> A tentative estimate based on your answers; the wide range shows other possible interpretations.

### `Claims.timelineExpressed`

Status: machine

English:

> Timing expressed in answer {number}; see the full answer for its scope and uncertainty.

Hindi:

> उत्तर {number} में बताई गई समय-सीमा; इसके दायरे और अनिश्चितता के लिए पूरा उत्तर देखें।

Back-translation (machine):

> The timeframe stated in answer {number}; see the full answer for its range and uncertainty.

### `Claims.timelineUnsettled`

Status: machine

English:

> You have not settled on a timeline.

Hindi:

> आपने अभी कोई समय-सीमा तय नहीं की है।

Back-translation (machine):

> You have not yet settled on any timeframe.
