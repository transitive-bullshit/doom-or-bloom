# Indonesian review packet

Generated 2026-10-01 for `id` (id), content 0.4.0-draft and rubric 0.1.0-draft. Statuses: 140 machine.

Only these strings need a native speaker before they are treated as final: the root question, the recovery and retry copy, and the wording of result claims. Everything else may stay machine-translated. Check that each translation keeps the English meaning and degree, adds no loaded premise, reads neutrally and naturally, and leaves Doom, Bloom, Doom or Bloom and P(doom) untranslated. Placeholders such as `{readings}` and ICU syntax must stay as they are.

Send corrections as edits to `content/l10n/id/releases/0.4.0-draft.json`, `content/l10n/id/rubrics/0.1.0-draft.json` or `messages/id.json` (with their `content/l10n/id/messages.json` hashes refreshed by `pnpm l10n:translate --locale=id --only-stale`). Record the completed review with `pnpm l10n:review --locale=id --approve=<reviewer>`.

## Root question

### `prompt:root:text`

Status: machine

English:

> What do you think AI means for our future—and why?

Indonesian:

> Menurut Anda, apa arti AI bagi masa depan kita—dan mengapa?

Back-translation (machine):

> In your opinion, what does AI mean for our future—and why?

## Recovery and retry copy

### `prompt:root:reask` (used by 47 questions)

Status: machine

English:

> I could not connect that answer to this question. A few words about your view are enough—want to try again?

Indonesian:

> Saya tidak dapat menghubungkan jawaban itu dengan pertanyaan ini. Beberapa kata tentang pandangan Anda sudah cukup—ingin mencoba lagi?

Back-translation (machine):

> I cannot connect that answer with this question. A few words about your view are enough—want to try again?

### `prompt:root:clarification` (used by 47 questions)

Status: machine

English:

> I am not sure how to read that. Could you say a little more about what you mean?

Indonesian:

> Saya tidak yakin bagaimana memahami jawaban itu. Bisakah Anda menjelaskan sedikit lagi apa yang Anda maksud?

Back-translation (machine):

> I am not sure how to understand that answer. Could you explain a little more what you mean?

### `prompt:root:exhausted` (used by 47 questions)

Status: machine

English:

> Let’s pause here. You can try a different question, stop for now, or restart.

Indonesian:

> Mari berhenti sejenak di sini. Anda dapat mencoba pertanyaan lain, berhenti untuk saat ini, atau memulai kembali.

Back-translation (machine):

> Let us pause here for a moment. You can try another question, stop for now, or start again.

### `prompt:risk.cyber-balance:reask` (used by 3 questions)

Status: machine

English:

> Do you think AI will help cyberattackers or defenders more, and why?

Indonesian:

> Menurut Anda, apakah AI akan lebih membantu penyerang atau pembela siber, dan mengapa?

Back-translation (machine):

> In your opinion, will AI help cyber attackers or defenders more, and why?

### `Interview.failedTitle`

Status: machine

English:

> This step did not finish

Indonesian:

> Langkah ini tidak selesai

Back-translation (machine):

> This step was not completed

### `Interview.failure.providerRejected`

Status: machine

English:

> Our AI provider, TypeSafe (Jev), rejected this request. Your submission is saved. Please try again later.

Indonesian:

> Penyedia AI kami, TypeSafe (Jev), menolak permintaan ini. Jawaban Anda telah disimpan. Silakan coba lagi nanti.

Back-translation (machine):

> Our AI provider, TypeSafe (Jev), rejected this request. Your answer has been saved. Please try again later.

### `Interview.failure.saved`

Status: machine

English:

> Your submission is saved and your previous progress is unchanged. Please try again when you’re ready.

Indonesian:

> Jawaban Anda telah disimpan dan progres Anda sebelumnya tidak berubah. Silakan coba lagi saat Anda siap.

Back-translation (machine):

> Your answer has been saved and your previous progress is unchanged. Please try again when you are ready.

### `Interview.retrySaved`

Status: machine

English:

> Retry saved submission

Indonesian:

> Coba kirim kembali jawaban yang disimpan

Back-translation (machine):

> Try resubmitting the saved answer

### `Interview.recovery.paperclipsTitle`

Status: machine

English:

> We’ve made some paperclips.

Indonesian:

> Kami telah membuat beberapa penjepit kertas.

Back-translation (machine):

> We have made some paper clips.

### `Interview.recovery.chooseTitle`

Status: machine

English:

> Choose what to do next

Indonesian:

> Pilih tindakan selanjutnya

Back-translation (machine):

> Choose the next action

### `Interview.recovery.retryTitle`

Status: machine

English:

> Another try?

Indonesian:

> Coba lagi?

Back-translation (machine):

> Try again?

### `Interview.recovery.paperclips`

Status: machine

English:

> You found the easter egg! Now let's get back to business...

Indonesian:

> Anda menemukan easter egg! Sekarang mari kembali ke urusan utama...

Back-translation (machine):

> You found an easter egg! Now let us return to the main matter...

### `Interview.recovery.stopped`

Status: machine

English:

> Your progress is here whenever you want to return.

Indonesian:

> Progres Anda tersedia kapan pun Anda ingin kembali.

Back-translation (machine):

> Your progress is available whenever you want to return.

### `Interview.recovery.navigation`

Status: machine

English:

> Use the actions below to choose what happens next.

Indonesian:

> Gunakan tindakan di bawah untuk memilih langkah selanjutnya.

Back-translation (machine):

> Use the actions below to choose the next step.

### `Interview.tryAgain`

Status: machine

English:

> Try again

Indonesian:

> Coba lagi

Back-translation (machine):

> Try again

### `Interview.differentQuestion`

Status: machine

English:

> Try a different question

Indonesian:

> Coba pertanyaan lain

Back-translation (machine):

> Try another question

## Result claims

Rubric levels (`level:*`) and the claims built in code (`Claims.*`) describe what the participant’s answers suggest. They are interpretations, not facts, and must keep their hedges.

### `level:capability_trajectory:0`

Status: machine

English:

> Transformative capability is not expected, or a low ceiling is explicitly anticipated.

Indonesian:

> Kemampuan transformatif diperkirakan tidak akan terwujud, atau batas kemampuan yang rendah secara eksplisit diperkirakan.

Back-translation (machine):

> Transformative capabilities are expected not to materialize, or a low capability limit is explicitly expected.

### `level:capability_trajectory:1`

Status: machine

English:

> Transformative capability is expected only on a long or indefinite horizon.

Indonesian:

> Kemampuan transformatif diperkirakan hanya akan terwujud dalam jangka waktu yang panjang atau tidak pasti.

Back-translation (machine):

> Transformative capabilities are expected to materialize only over a long or uncertain time frame.

### `level:capability_trajectory:2`

Status: machine

English:

> Transformative capability is expected within decades, with timing conditional or uncertain.

Indonesian:

> Kemampuan transformatif diperkirakan akan terwujud dalam beberapa dekade, dengan waktunya bergantung pada kondisi tertentu atau tidak pasti.

Back-translation (machine):

> Transformative capabilities are expected to materialize within several decades, with the timing depending on certain conditions or being uncertain.

### `level:capability_trajectory:3`

Status: machine

English:

> Transformative capability is expected within years, with named milestones or timing.

Indonesian:

> Kemampuan transformatif diperkirakan akan terwujud dalam beberapa tahun, dengan tonggak pencapaian atau waktu yang disebutkan.

Back-translation (machine):

> Transformative capabilities are expected to materialize within several years, with milestones or timing mentioned.

### `level:transition_dynamics:0`

Status: machine

English:

> A gradual transition with substantial warning and broad diffusion is expected.

Indonesian:

> Transisi bertahap dengan peringatan yang memadai dan penyebaran luas diperkirakan akan terjadi.

Back-translation (machine):

> A gradual transition with adequate warning and broad diffusion is expected to occur.

### `level:transition_dynamics:1`

Status: machine

English:

> Noticeable acceleration is expected but meaningful adaptation time remains.

Indonesian:

> Percepatan yang nyata diperkirakan akan terjadi, tetapi masih tersedia waktu yang berarti untuk beradaptasi.

Back-translation (machine):

> Real acceleration is expected to occur, but meaningful time to adapt is still available.

### `level:transition_dynamics:2`

Status: machine

English:

> A fast transition with limited warning is expected.

Indonesian:

> Transisi cepat dengan peringatan terbatas diperkirakan akan terjadi.

Back-translation (machine):

> A rapid transition with limited warning is expected to occur.

### `level:transition_dynamics:3`

Status: machine

English:

> An abrupt self-reinforcing transition with very little warning is expected.

Indonesian:

> Transisi mendadak yang memperkuat dirinya sendiri dengan sangat sedikit peringatan diperkirakan akan terjadi.

Back-translation (machine):

> An abrupt, self-reinforcing transition with very little warning is expected to occur.

### `level:beneficial_potential:0`

Status: machine

English:

> Little positive impact is expected even if advanced AI arrives.

Indonesian:

> Dampak positif yang kecil diperkirakan bahkan jika AI canggih terwujud.

Back-translation (machine):

> Small positive impacts are expected even if advanced AI materializes.

### `level:beneficial_potential:1`

Status: machine

English:

> Limited or narrowly distributed gains are expected.

Indonesian:

> Manfaat yang terbatas atau hanya tersebar secara sempit diperkirakan akan terwujud.

Back-translation (machine):

> Limited or only narrowly distributed benefits are expected to materialize.

### `level:beneficial_potential:2`

Status: machine

English:

> Substantial benefits are expected, with important conditions or distribution limits.

Indonesian:

> Manfaat besar diperkirakan akan terwujud, dengan syarat penting atau keterbatasan distribusi.

Back-translation (machine):

> Large benefits are expected to materialize, with important conditions or distribution limitations.

### `level:beneficial_potential:3`

Status: machine

English:

> Transformative, broadly valuable gains are expected.

Indonesian:

> Manfaat transformatif yang bernilai luas diperkirakan akan terwujud.

Back-translation (machine):

> Transformative benefits of broad value are expected to materialize.

### `level:risk_landscape:0`

Status: machine

English:

> Little material adverse impact is expected.

Indonesian:

> Dampak merugikan yang berarti diperkirakan hanya sedikit.

Back-translation (machine):

> Meaningful harmful impacts are expected to be few.

### `level:risk_landscape:1`

Status: machine

English:

> Manageable or localized harms are expected.

Indonesian:

> Kerugian yang dapat dikelola atau bersifat lokal diperkirakan akan terjadi.

Back-translation (machine):

> Manageable or local harms are expected to occur.

### `level:risk_landscape:2`

Status: machine

English:

> Severe or widespread harm is a material expected part of the future.

Indonesian:

> Kerugian parah atau meluas merupakan bagian yang berarti dari masa depan yang diperkirakan.

Back-translation (machine):

> Severe or widespread harms are a meaningful part of the expected future.

### `level:risk_landscape:3`

Status: machine

English:

> Catastrophic or irreversible loss is central to the expected future.

Indonesian:

> Kehilangan yang katastrofik atau tidak dapat dipulihkan merupakan unsur utama masa depan yang diperkirakan.

Back-translation (machine):

> Catastrophic or irreversible loss is a major element of the expected future.

### `level:technical_controllability:0`

Status: machine

English:

> Reliable technical control is expected to be infeasible.

Indonesian:

> Kendali teknis yang andal diperkirakan tidak dapat diwujudkan.

Back-translation (machine):

> Reliable technical control is expected not to be achievable.

### `level:technical_controllability:1`

Status: machine

English:

> Control is expected to be very difficult and unreliable.

Indonesian:

> Kendali diperkirakan akan sangat sulit dan tidak andal.

Back-translation (machine):

> Control is expected to be very difficult and unreliable.

### `level:technical_controllability:2`

Status: machine

English:

> Control is expected to be feasible under demanding conditions.

Indonesian:

> Kendali diperkirakan dapat diwujudkan dalam kondisi yang berat.

Back-translation (machine):

> Control is expected to be achievable under demanding conditions.

### `level:technical_controllability:3`

Status: machine

English:

> Reliable technical control is expected to be broadly feasible.

Indonesian:

> Kendali teknis yang andal diperkirakan secara luas dapat diwujudkan.

Back-translation (machine):

> Reliable technical control is broadly expected to be achievable.

### `level:institutional_competence:0`

Status: machine

English:

> Institutions are expected to fail to respond effectively.

Indonesian:

> Lembaga-lembaga diperkirakan akan gagal merespons secara efektif.

Back-translation (machine):

> Institutions are expected to fail to respond effectively.

### `level:institutional_competence:1`

Status: machine

English:

> Institutions are expected to respond too weakly or too late in many cases.

Indonesian:

> Lembaga-lembaga diperkirakan akan merespons terlalu lemah atau terlalu lambat dalam banyak kasus.

Back-translation (machine):

> Institutions are expected to respond too weakly or too slowly in many cases.

### `level:institutional_competence:2`

Status: machine

English:

> Effective responses are expected under specific coordination conditions.

Indonesian:

> Respons yang efektif diperkirakan akan terwujud dalam kondisi koordinasi tertentu.

Back-translation (machine):

> Effective responses are expected to materialize under certain coordination conditions.

### `level:institutional_competence:3`

Status: machine

English:

> Institutions are expected to adapt effectively and in time.

Indonesian:

> Lembaga-lembaga diperkirakan akan beradaptasi secara efektif dan tepat waktu.

Back-translation (machine):

> Institutions are expected to adapt effectively and in a timely manner.

### `level:human_agency:0`

Status: machine

English:

> The expected future undermines or eliminates the forms of agency/continuity the participant explicitly values.

Indonesian:

> Masa depan yang diperkirakan melemahkan atau menghilangkan bentuk-bentuk agensi/keberlanjutan yang secara eksplisit dianggap berharga oleh peserta.

Back-translation (machine):

> The expected future weakens or eliminates forms of agency/continuity that are explicitly considered valuable by the participant.

### `level:human_agency:1`

Status: machine

English:

> Significant valued agency or continuity is expected to be lost.

Indonesian:

> Agensi atau keberlanjutan yang dianggap berharga diperkirakan akan banyak hilang.

Back-translation (machine):

> Agency or continuity considered valuable is expected to be largely lost.

### `level:human_agency:2`

Status: machine

English:

> Valued agency/continuity is expected to be substantially preserved, with changes or conditions.

Indonesian:

> Agensi/keberlanjutan yang dianggap berharga diperkirakan akan tetap terjaga secara substansial, dengan perubahan atau syarat tertentu.

Back-translation (machine):

> Agency/continuity considered valuable is expected to remain substantially preserved, with certain changes or conditions.

### `level:human_agency:3`

Status: machine

English:

> Valued agency/continuity is expected to expand or flourish.

Indonesian:

> Agensi/keberlanjutan yang dianggap berharga diperkirakan akan berkembang atau bertumbuh subur.

Back-translation (machine):

> Agency/continuity considered valuable is expected to develop or flourish.

### `level:action_posture:0`

Status: machine

English:

> A broad pause or substantial slowing is preferred.

Indonesian:

> Jeda secara luas atau perlambatan yang substansial lebih diutamakan.

Back-translation (machine):

> A broad pause or substantial slowdown is preferred.

### `level:action_posture:1`

Status: machine

English:

> Restrained development and strong prior safeguards are preferred.

Indonesian:

> Pengembangan yang terkendali dan langkah pengamanan awal yang kuat lebih diutamakan.

Back-translation (machine):

> Controlled development and strong early safeguards are preferred.

### `level:action_posture:2`

Status: machine

English:

> Continued development with targeted safeguards is preferred.

Indonesian:

> Pengembangan berkelanjutan dengan langkah pengamanan yang terarah lebih diutamakan.

Back-translation (machine):

> Continued development with targeted safeguards is preferred.

### `level:action_posture:3`

Status: machine

English:

> Rapid development or broad access is preferred.

Indonesian:

> Pengembangan pesat atau akses luas lebih diutamakan.

Back-translation (machine):

> Rapid development or broad access is preferred.

### `level:causal_clarity:0`

Status: machine

English:

> An outcome is asserted without a supporting mechanism.

Indonesian:

> Suatu hasil dinyatakan tanpa mekanisme pendukung.

Back-translation (machine):

> An outcome is stated without a supporting mechanism.

### `level:causal_clarity:1`

Status: machine

English:

> A causal factor is named but its connection to the outcome is not explained.

Indonesian:

> Suatu faktor kausal disebutkan, tetapi kaitannya dengan hasil tersebut tidak dijelaskan.

Back-translation (machine):

> A causal factor is mentioned, but its connection to the outcome is not explained.

### `level:causal_clarity:2`

Status: machine

English:

> A coherent mechanism connects a cause to an outcome with a relevant condition.

Indonesian:

> Suatu mekanisme yang koheren menghubungkan sebab dengan hasil disertai kondisi yang relevan.

Back-translation (machine):

> A coherent mechanism connects the cause with the outcome, accompanied by relevant conditions.

### `level:causal_clarity:3`

Status: machine

English:

> A mechanism is developed with dependencies, limitations, or potential failure points.

Indonesian:

> Suatu mekanisme diuraikan beserta dependensi, keterbatasan, atau potensi titik kegagalannya.

Back-translation (machine):

> A mechanism is described along with its dependencies, limitations, or potential points of failure.

### `level:scope_discipline:0`

Status: machine

English:

> Materially different scopes are conflated without qualification.

Indonesian:

> Cakupan yang berbeda secara substantif dicampuradukkan tanpa kualifikasi.

Back-translation (machine):

> Substantively different scopes are conflated without qualification.

### `level:scope_discipline:1`

Status: machine

English:

> Some scope is specified but material boundaries remain blurred.

Indonesian:

> Sebagian cakupan ditentukan, tetapi batas-batas substantif masih kabur.

Back-translation (machine):

> Some scope is specified, but substantive boundaries remain vague.

### `level:scope_discipline:2`

Status: machine

English:

> Relevant actors, conditions, or horizons are distinguished.

Indonesian:

> Aktor, kondisi, atau rentang waktu yang relevan dibedakan.

Back-translation (machine):

> Relevant actors, conditions, or time spans are distinguished.

### `level:scope_discipline:3`

Status: machine

English:

> The boundaries needed to interpret consequential claims are clear, including relevant differences in actors, horizons or conditions. Every sentence need not restate those boundaries.

Indonesian:

> Batas-batas yang diperlukan untuk menafsirkan klaim yang berdampak penting dinyatakan dengan jelas, termasuk perbedaan yang relevan dalam hal aktor, rentang waktu, atau kondisi. Tidak setiap kalimat perlu menyatakan ulang batas-batas tersebut.

Back-translation (machine):

> The boundaries necessary to interpret consequential claims are stated clearly, including relevant differences in actors, time spans, or conditions. Not every sentence needs to restate those boundaries.

### `level:appropriate_uncertainty:0`

Status: machine

English:

> Certainty is asserted despite explicitly limited or conflicting evidence.

Indonesian:

> Kepastian dinyatakan meskipun bukti secara eksplisit terbatas atau saling bertentangan.

Back-translation (machine):

> Certainty is stated even though the evidence is explicitly limited or conflicting.

### `level:appropriate_uncertainty:1`

Status: machine

English:

> Uncertainty is acknowledged but the strength of the claim is poorly matched to its support.

Indonesian:

> Ketidakpastian diakui, tetapi kekuatan klaim kurang selaras dengan bukti pendukungnya.

Back-translation (machine):

> Uncertainty is acknowledged, but the strength of the claim is not well aligned with its supporting evidence.

### `level:appropriate_uncertainty:2`

Status: machine

English:

> Confidence is proportionate to the supplied evidence and important unknowns are preserved.

Indonesian:

> Tingkat keyakinan sebanding dengan bukti yang diberikan dan hal-hal penting yang belum diketahui tetap diakui.

Back-translation (machine):

> The level of confidence is proportionate to the evidence provided, and important unknowns continue to be acknowledged.

### `level:appropriate_uncertainty:3`

Status: machine

English:

> Uncertainty is differentiated across claims and linked to concrete evidence limitations.

Indonesian:

> Ketidakpastian dibedakan pada masing-masing klaim dan dikaitkan dengan keterbatasan bukti yang konkret.

Back-translation (machine):

> Uncertainty is distinguished for each claim and linked to concrete limitations of the evidence.

### `level:internal_coherence:0`

Status: machine

English:

> Related statements remain incompatible under the same stated assumptions after clarification.

Indonesian:

> Pernyataan-pernyataan yang berkaitan tetap tidak selaras berdasarkan asumsi yang sama sebagaimana dinyatakan, bahkan setelah klarifikasi.

Back-translation (machine):

> Related statements remain misaligned under the same assumptions as stated, even after clarification.

### `level:internal_coherence:1`

Status: machine

English:

> A material incompatibility remains possible but partially explained.

Indonesian:

> Ketidakselarasan yang substantif masih mungkin ada, tetapi telah dijelaskan sebagian.

Back-translation (machine):

> Substantive misalignment may still exist, but it has been partially explained.

### `level:internal_coherence:2`

Status: machine

English:

> Related positions fit under the stated assumptions.

Indonesian:

> Posisi-posisi yang berkaitan selaras berdasarkan asumsi yang dinyatakan.

Back-translation (machine):

> Related positions are aligned under the stated assumptions.

### `level:internal_coherence:3`

Status: machine

English:

> The material claims fit together under their expressed assumptions and scopes; any apparent tensions are resolved by those distinctions. An already coherent account does not need to invent and then reconcile a contradiction.

Indonesian:

> Klaim-klaim substantif saling selaras berdasarkan asumsi dan cakupan yang diungkapkan; setiap ketegangan yang tampak diselesaikan melalui pembedaan tersebut. Uraian yang sudah koheren tidak perlu menciptakan pertentangan lalu menyelaraskannya.

Back-translation (machine):

> Substantive claims are mutually aligned under the disclosed assumptions and scope; any apparent tension is resolved through those distinctions. An account that is already coherent does not need to create a conflict and then reconcile it.

### `level:counterargument_engagement:0`

Status: machine

English:

> An alternative is dismissed without engaging its actual claim.

Indonesian:

> Suatu alternatif ditolak tanpa menanggapi klaim sebenarnya.

Back-translation (machine):

> An alternative is rejected without addressing the actual claim.

### `level:counterargument_engagement:1`

Status: machine

English:

> An alternative is acknowledged but its strongest relevant basis is omitted.

Indonesian:

> Suatu alternatif diakui, tetapi dasar relevan terkuatnya diabaikan.

Back-translation (machine):

> An alternative is acknowledged, but its strongest relevant basis is ignored.

### `level:counterargument_engagement:2`

Status: machine

English:

> A serious alternative is represented fairly and addressed on its merits.

Indonesian:

> Suatu alternatif yang serius disajikan secara adil dan ditanggapi berdasarkan kekuatannya sendiri.

Back-translation (machine):

> A serious alternative is presented fairly and addressed on its own strengths.

### `level:counterargument_engagement:3`

Status: machine

English:

> The participant identifies when a serious alternative could outperform their account.

Indonesian:

> Peserta mengidentifikasi kapan suatu alternatif yang serius dapat memberikan penjelasan yang lebih baik daripada uraiannya.

Back-translation (machine):

> The participant identifies when a serious alternative could provide a better explanation than their account.

### `level:updateability:0`

Status: machine

English:

> The participant explicitly rules out revising the belief regardless of evidence.

Indonesian:

> Peserta secara eksplisit menutup kemungkinan untuk merevisi keyakinannya apa pun buktinya.

Back-translation (machine):

> The participant explicitly closes off the possibility of revising their belief regardless of the evidence.

### `level:updateability:1`

Status: machine

English:

> A vague update condition is given without specifying relevant evidence.

Indonesian:

> Suatu kondisi pembaruan yang samar diberikan tanpa menentukan bukti yang relevan.

Back-translation (machine):

> A vague updating condition is given without specifying the relevant evidence.

### `level:updateability:2`

Status: machine

English:

> Identifiable evidence or a development could change the stated belief.

Indonesian:

> Bukti yang dapat diidentifikasi atau suatu perkembangan dapat mengubah keyakinan yang dinyatakan.

Back-translation (machine):

> Identifiable evidence or a development could change the stated belief.

### `level:updateability:3`

Status: machine

English:

> A specific discriminating observation is tied to a particular belief change.

Indonesian:

> Suatu pengamatan spesifik yang dapat membedakan dikaitkan dengan perubahan tertentu dalam keyakinan.

Back-translation (machine):

> A specific distinguishing observation is linked to a particular change in belief.

### `level:grounded_understanding:0`

Status: machine

English:

> An explicitly supplied observation materially contradicts the claim it is used to support.

Indonesian:

> Suatu pengamatan yang diberikan secara eksplisit bertentangan secara substantif dengan klaim yang hendak didukungnya.

Back-translation (machine):

> An explicitly provided observation substantively contradicts the claim it is intended to support.

### `level:grounded_understanding:1`

Status: machine

English:

> An offered observation or example has a weak or unexplained connection to the claim.

Indonesian:

> Suatu pengamatan atau contoh yang diajukan memiliki kaitan yang lemah atau tidak dijelaskan dengan klaim tersebut.

Back-translation (machine):

> A proposed observation or example has a weak or unexplained connection to the claim.

### `level:grounded_understanding:2`

Status: machine

English:

> A clear connection links the offered basis to the claim, with relevant limitations.

Indonesian:

> Suatu kaitan yang jelas menghubungkan dasar yang diajukan dengan klaim tersebut, disertai keterbatasan yang relevan.

Back-translation (machine):

> A clear connection links the proposed basis to the claim, along with relevant limitations.

### `level:grounded_understanding:3`

Status: machine

English:

> The account distinguishes observation, interpretation and uncertainty, explaining the limits of the offered basis.

Indonesian:

> Uraian tersebut membedakan pengamatan, penafsiran, dan ketidakpastian, serta menjelaskan keterbatasan dasar yang diajukan.

Back-translation (machine):

> The account distinguishes observation, interpretation, and uncertainty, and explains the limitations of the proposed basis.

### `level:catastrophic_risk:0`

Status: machine

English:

> Catastrophic outcomes are expected to be negligible or effectively avoided under the participant’s stated assumptions.

Indonesian:

> Hasil katastrofik diperkirakan dapat diabaikan atau secara efektif dihindari berdasarkan asumsi yang dinyatakan peserta.

Back-translation (machine):

> Catastrophic outcomes are expected to be negligible or effectively avoided under the participant's stated assumptions.

### `level:catastrophic_risk:1`

Status: machine

English:

> Catastrophe is possible but expected to be a limited part of the outlook under stated conditions.

Indonesian:

> Katastrofe mungkin terjadi, tetapi diperkirakan menjadi bagian terbatas dari pandangan tersebut berdasarkan kondisi yang dinyatakan.

Back-translation (machine):

> Catastrophe may occur, but is expected to be a limited part of the outlook under the stated conditions.

### `level:catastrophic_risk:2`

Status: machine

English:

> Catastrophic outcomes are a material possibility in the participant’s outlook, with consequential uncertainty or conditions.

Indonesian:

> Hasil katastrofik merupakan kemungkinan substantif dalam pandangan peserta, dengan ketidakpastian atau kondisi yang berdampak penting.

Back-translation (machine):

> Catastrophic outcomes are a substantive possibility in the participant's outlook, with consequential uncertainty or conditions.

### `level:catastrophic_risk:3`

Status: machine

English:

> Catastrophic outcomes dominate the participant’s expectation under stated assumptions.

Indonesian:

> Hasil katastrofik mendominasi perkiraan peserta berdasarkan asumsi yang dinyatakan.

Back-translation (machine):

> Catastrophic outcomes dominate the participant's forecast under the stated assumptions.

### `Claims.levels.overall_outlook.0`

Status: machine

English:

> Overwhelmingly harmful overall.

Indonesian:

> Secara keseluruhan sangat merugikan.

Back-translation (machine):

> Overall, very harmful.

### `Claims.levels.overall_outlook.1`

Status: machine

English:

> More harmful than beneficial overall.

Indonesian:

> Secara keseluruhan lebih merugikan daripada bermanfaat.

Back-translation (machine):

> Overall, more harmful than beneficial.

### `Claims.levels.overall_outlook.2`

Status: machine

English:

> A broadly balanced or limited overall impact is expected.

Indonesian:

> Dampak keseluruhan yang secara umum seimbang atau terbatas diperkirakan terjadi.

Back-translation (machine):

> An overall impact that is generally balanced or limited is expected to occur.

### `Claims.levels.overall_outlook.3`

Status: machine

English:

> More beneficial than harmful overall.

Indonesian:

> Secara keseluruhan lebih bermanfaat daripada merugikan.

Back-translation (machine):

> Overall, more beneficial than harmful.

### `Claims.levels.overall_outlook.4`

Status: machine

English:

> Overwhelmingly beneficial overall.

Indonesian:

> Secara keseluruhan sangat bermanfaat.

Back-translation (machine):

> Overall, very beneficial.

### `Claims.levels.outlook_orientation.0`

Status: machine

English:

> Your outlook is strongly oriented toward catastrophe or overwhelming harm.

Indonesian:

> Pandangan Anda sangat berorientasi pada katastrofe atau kerugian yang sangat besar.

Back-translation (machine):

> Your outlook is strongly oriented toward catastrophe or very great harm.

### `Claims.levels.outlook_orientation.1`

Status: machine

English:

> Your outlook leans toward concern about harmful futures, while allowing better outcomes.

Indonesian:

> Pandangan Anda cenderung mengkhawatirkan masa depan yang merugikan, tetapi tetap membuka kemungkinan hasil yang lebih baik.

Back-translation (machine):

> Your outlook tends to worry about a harmful future, but remains open to the possibility of better outcomes.

### `Claims.levels.outlook_orientation.2`

Status: machine

English:

> Your outlook is mixed or undecided: neither hope nor worry clearly dominates. This is not a prediction of equal benefits and harms.

Indonesian:

> Pandangan Anda beragam atau belum diputuskan: baik harapan maupun kekhawatiran tidak ada yang jelas lebih dominan. Ini bukan prediksi bahwa manfaat dan kerugian akan sama besar.

Back-translation (machine):

> Your outlook is mixed or undecided: neither hopes nor concerns are clearly more dominant. This is not a prediction that benefits and harms will be equal in magnitude.

### `Claims.levels.outlook_orientation.3`

Status: machine

English:

> Your outlook leans toward beneficial futures, while allowing serious risks.

Indonesian:

> Pandangan Anda condong ke masa depan yang bermanfaat, sembari mengakui adanya risiko serius.

Back-translation (machine):

> Your outlook leans toward a beneficial future, while acknowledging the existence of serious risks.

### `Claims.levels.outlook_orientation.4`

Status: machine

English:

> Your outlook is strongly oriented toward transformative flourishing.

Indonesian:

> Pandangan Anda sangat berorientasi pada kemajuan transformatif.

Back-translation (machine):

> Your outlook is strongly oriented toward transformative progress.

### `Claims.levels.capability_ceiling.0`

Status: machine

English:

> AI is expected to remain bounded tools.

Indonesian:

> AI diperkirakan akan tetap menjadi alat dengan kemampuan terbatas.

Back-translation (machine):

> AI is expected to remain a tool with limited capabilities.

### `Claims.levels.capability_ceiling.1`

Status: machine

English:

> AI is expected to match people across most cognitive work.

Indonesian:

> AI diperkirakan akan menyamai manusia dalam sebagian besar pekerjaan kognitif.

Back-translation (machine):

> AI is expected to equal humans in most cognitive tasks.

### `Claims.levels.capability_ceiling.2`

Status: machine

English:

> AI is expected to substantially exceed people across cognitive work.

Indonesian:

> AI diperkirakan akan jauh melampaui manusia dalam berbagai pekerjaan kognitif.

Back-translation (machine):

> AI is expected to far surpass humans in various cognitive tasks.

### `Claims.levels.development_pace.0`

Status: machine

English:

> Stop or substantially slow development of more capable AI.

Indonesian:

> Hentikan atau perlambat secara signifikan pengembangan AI yang lebih mampu.

Back-translation (machine):

> Stop or significantly slow the development of more capable AI.

### `Claims.levels.development_pace.1`

Status: machine

English:

> Continue development under stated safeguards.

Indonesian:

> Lanjutkan pengembangan dengan perlindungan yang telah ditetapkan.

Back-translation (machine):

> Continue development with established safeguards.

### `Claims.levels.development_pace.2`

Status: machine

English:

> Speed up development of more capable AI.

Indonesian:

> Percepat pengembangan AI yang lebih mampu.

Back-translation (machine):

> Accelerate the development of more capable AI.

### `Claims.levels.deployment_policy.0`

Status: machine

English:

> Restrict the AI uses discussed until prior protections or permission are in place.

Indonesian:

> Batasi penggunaan AI yang dibahas hingga perlindungan atau izin sebelumnya tersedia.

Back-translation (machine):

> Restrict the discussed use of AI until safeguards or prior permission are available.

### `Claims.levels.deployment_policy.1`

Status: machine

English:

> Allow the AI uses discussed with targeted accountability and protections.

Indonesian:

> Izinkan penggunaan AI yang dibahas dengan akuntabilitas dan perlindungan yang terarah.

Back-translation (machine):

> Allow the discussed use of AI with accountability and targeted safeguards.

### `Claims.levels.deployment_policy.2`

Status: machine

English:

> Minimize restrictions on the AI uses discussed.

Indonesian:

> Minimalkan pembatasan terhadap penggunaan AI yang dibahas.

Back-translation (machine):

> Minimize restrictions on the discussed use of AI.

### `Claims.levels.access_policy.0`

Status: machine

English:

> Restrict access to powerful AI.

Indonesian:

> Batasi akses ke AI yang berkemampuan tinggi.

Back-translation (machine):

> Restrict access to highly capable AI.

### `Claims.levels.access_policy.1`

Status: machine

English:

> Allow access subject to capability or use restrictions.

Indonesian:

> Izinkan akses dengan tunduk pada pembatasan kemampuan atau penggunaan.

Back-translation (machine):

> Allow access subject to capability or use restrictions.

### `Claims.levels.access_policy.2`

Status: machine

English:

> Favor broad or open access to powerful AI.

Indonesian:

> Utamakan akses yang luas atau terbuka ke AI yang berkemampuan tinggi.

Back-translation (machine):

> Prioritize broad or open access to highly capable AI.

### `Claims.levels.influence.0`

Status: machine

English:

> Human choices have almost no influence over the eventual AI outcome.

Indonesian:

> Pilihan manusia hampir tidak memiliki pengaruh terhadap hasil akhir AI.

Back-translation (machine):

> Human choices have almost no influence on the final outcomes of AI.

### `Claims.levels.influence.1`

Status: machine

English:

> Human choices can make limited changes, but dominant forces constrain the outcome.

Indonesian:

> Pilihan manusia dapat menghasilkan perubahan terbatas, tetapi kekuatan dominan membatasi hasilnya.

Back-translation (machine):

> Human choices can produce limited changes, but dominant forces constrain the outcomes.

### `Claims.levels.influence.2`

Status: machine

English:

> Human choices have meaningful but substantially constrained influence.

Indonesian:

> Pilihan manusia memiliki pengaruh yang berarti, tetapi sangat dibatasi.

Back-translation (machine):

> Human choices have meaningful influence, but are highly constrained.

### `Claims.levels.influence.3`

Status: machine

English:

> Human choices can substantially redirect the AI trajectory.

Indonesian:

> Pilihan manusia dapat mengarahkan ulang lintasan AI secara signifikan.

Back-translation (machine):

> Human choices can significantly redirect the trajectory of AI.

### `Claims.levels.influence.4`

Status: machine

English:

> Human choices are decisive: very different AI futures remain within collective reach.

Indonesian:

> Pilihan manusia menentukan: masa depan AI yang sangat berbeda masih dapat dicapai secara kolektif.

Back-translation (machine):

> Human choices are decisive: very different AI futures can still be achieved collectively.

### `Claims.levels.transformation.0`

Status: machine

English:

> AI is expected to cause little lasting societal change.

Indonesian:

> AI diperkirakan hanya akan menyebabkan sedikit perubahan sosial yang bertahan lama.

Back-translation (machine):

> AI is expected to cause only a small amount of lasting social change.

### `Claims.levels.transformation.1`

Status: machine

English:

> AI is expected to bring incremental improvements and disruptions within familiar institutions.

Indonesian:

> AI diperkirakan akan menghadirkan perbaikan dan disrupsi bertahap dalam lembaga-lembaga yang sudah dikenal.

Back-translation (machine):

> AI is expected to bring gradual improvements and disruptions within familiar institutions.

### `Claims.levels.transformation.2`

Status: machine

English:

> AI is expected to substantially change several sectors of society.

Indonesian:

> AI diperkirakan akan mengubah beberapa sektor masyarakat secara signifikan.

Back-translation (machine):

> AI is expected to significantly change some sectors of society.

### `Claims.levels.transformation.3`

Status: machine

English:

> AI is expected to restructure economies, institutions and everyday life broadly.

Indonesian:

> AI diperkirakan akan merombak perekonomian, lembaga, dan kehidupan sehari-hari secara luas.

Back-translation (machine):

> AI is expected to broadly reshape the economy, institutions, and daily life.

### `Claims.levels.transformation.4`

Status: machine

English:

> AI is expected to fundamentally transform civilization or humanity’s continued existence.

Indonesian:

> AI diperkirakan akan mentransformasi peradaban atau keberlanjutan eksistensi manusia secara mendasar.

Back-translation (machine):

> AI is expected to fundamentally transform civilization or the continuation of human existence.

### `Claims.uncertain`

Status: machine

English:

> You expressed uncertainty here rather than a directional expectation.

Indonesian:

> Anda mengungkapkan ketidakpastian di sini, alih-alih ekspektasi yang mengarah ke sisi tertentu.

Back-translation (machine):

> You express uncertainty here, rather than an expectation that leans toward a particular side.

### `Claims.unestablished`

Status: machine

English:

> A directional position is not yet established by these answers.

Indonesian:

> Posisi yang mengarah ke sisi tertentu belum ditetapkan oleh jawaban-jawaban ini.

Back-translation (machine):

> A position that leans toward a particular side has not yet been established by these answers.

### `Claims.unresolved`

Status: machine

English:

> The interpretation of these answers still needs clarification.

Indonesian:

> Penafsiran atas jawaban-jawaban ini masih perlu diperjelas.

Back-translation (machine):

> The interpretation of these answers still needs to be clarified.

### `Claims.readings`

Status: machine

English:

> Several readings remain plausible: {readings}

Indonesian:

> Beberapa penafsiran masih mungkin: {readings}

Back-translation (machine):

> Several interpretations are still possible: {readings}

### `Claims.unplacedUncertain.capability_trajectory`

Status: machine

English:

> You expressed uncertainty about whether or when transformative AI arrives.

Indonesian:

> Anda mengungkapkan ketidakpastian tentang apakah atau kapan AI transformatif akan hadir.

Back-translation (machine):

> You express uncertainty about whether or when transformative AI will arrive.

### `Claims.unplacedUncertain.transition_dynamics`

Status: machine

English:

> You expressed uncertainty about how quickly AI-driven change unfolds.

Indonesian:

> Anda mengungkapkan ketidakpastian tentang seberapa cepat perubahan yang didorong AI berlangsung.

Back-translation (machine):

> You express uncertainty about how quickly AI-driven change takes place.

### `Claims.unplacedUncertain.beneficial_potential`

Status: machine

English:

> You expressed uncertainty about the positive impact you expect from AI.

Indonesian:

> Anda mengungkapkan ketidakpastian tentang dampak positif yang Anda harapkan dari AI.

Back-translation (machine):

> You express uncertainty about the positive impact you expect from AI.

### `Claims.unplacedUncertain.risk_landscape`

Status: machine

English:

> You expressed uncertainty about the harm you expect from AI.

Indonesian:

> Anda mengungkapkan ketidakpastian tentang kerugian yang Anda perkirakan dari AI.

Back-translation (machine):

> You express uncertainty about the harms you anticipate from AI.

### `Claims.unplacedUncertain.technical_controllability`

Status: machine

English:

> You expressed uncertainty about whether technical control of powerful AI will work.

Indonesian:

> Anda mengungkapkan ketidakpastian tentang apakah kendali teknis atas AI yang berkemampuan tinggi akan berfungsi.

Back-translation (machine):

> You express uncertainty about whether technical control over highly capable AI will work.

### `Claims.unplacedUncertain.institutional_competence`

Status: machine

English:

> You expressed uncertainty about how effectively institutions will respond.

Indonesian:

> Anda mengungkapkan ketidakpastian tentang seberapa efektif lembaga-lembaga akan merespons.

Back-translation (machine):

> You express uncertainty about how effectively institutions will respond.

### `Claims.unplacedUncertain.human_agency`

Status: machine

English:

> You expressed uncertainty about what happens to the forms of agency you value.

Indonesian:

> Anda mengungkapkan ketidakpastian tentang apa yang akan terjadi pada bentuk-bentuk agensi yang Anda hargai.

Back-translation (machine):

> You express uncertainty about what will happen to the forms of agency you value.

### `Claims.unplacedUncertain.action_posture`

Status: machine

English:

> You expressed uncertainty about which development or policy response you prefer.

Indonesian:

> Anda mengungkapkan ketidakpastian tentang tanggapan pengembangan atau kebijakan mana yang Anda pilih.

Back-translation (machine):

> You express uncertainty about which development or policy response you choose.

### `Claims.unplacedUncertain.catastrophic_risk`

Status: machine

English:

> You expressed uncertainty about the prospect of catastrophic or irreversible harm.

Indonesian:

> Anda mengungkapkan ketidakpastian tentang kemungkinan kerugian katastrofik atau yang tidak dapat dipulihkan.

Back-translation (machine):

> You express uncertainty about the possibility of catastrophic or irreversible harm.

### `Claims.unplacedUnestablished.capability_trajectory`

Status: machine

English:

> These answers do not yet establish whether or when transformative AI arrives.

Indonesian:

> Jawaban-jawaban ini belum menetapkan apakah atau kapan AI transformatif akan hadir.

Back-translation (machine):

> These answers have not yet established whether or when transformative AI will arrive.

### `Claims.unplacedUnestablished.transition_dynamics`

Status: machine

English:

> These answers do not yet establish how quickly AI-driven change unfolds.

Indonesian:

> Jawaban-jawaban ini belum menetapkan seberapa cepat perubahan yang didorong AI berlangsung.

Back-translation (machine):

> These answers have not yet established how quickly AI-driven change takes place.

### `Claims.unplacedUnestablished.beneficial_potential`

Status: machine

English:

> These answers do not yet establish the positive impact you expect from AI.

Indonesian:

> Jawaban-jawaban ini belum menetapkan dampak positif yang Anda perkirakan dari AI.

Back-translation (machine):

> These answers have not yet established the positive impact you anticipate from AI.

### `Claims.unplacedUnestablished.risk_landscape`

Status: machine

English:

> These answers do not yet establish the harm you expect from AI.

Indonesian:

> Jawaban-jawaban ini belum menetapkan kerugian yang Anda perkirakan dari AI.

Back-translation (machine):

> These answers have not yet established the harms you anticipate from AI.

### `Claims.unplacedUnestablished.technical_controllability`

Status: machine

English:

> These answers do not yet establish whether technical control of powerful AI will work.

Indonesian:

> Jawaban-jawaban ini belum menetapkan apakah kontrol teknis terhadap AI yang kuat akan berhasil.

Back-translation (machine):

> These answers have not yet established whether technical control over powerful AI will succeed.

### `Claims.unplacedUnestablished.institutional_competence`

Status: machine

English:

> These answers do not yet establish how effectively institutions will respond.

Indonesian:

> Jawaban-jawaban ini belum menetapkan seberapa efektif lembaga-lembaga akan merespons.

Back-translation (machine):

> These answers have not yet established how effectively institutions will respond.

### `Claims.unplacedUnestablished.human_agency`

Status: machine

English:

> These answers do not yet establish what happens to the forms of agency you value.

Indonesian:

> Jawaban-jawaban ini belum menetapkan apa yang akan terjadi pada bentuk-bentuk agensi yang Anda hargai.

Back-translation (machine):

> These answers have not yet established what will happen to the forms of agency that you value.

### `Claims.unplacedUnestablished.action_posture`

Status: machine

English:

> These answers do not yet establish which development or policy response you prefer.

Indonesian:

> Jawaban-jawaban ini belum menetapkan respons pengembangan atau kebijakan mana yang Anda pilih.

Back-translation (machine):

> These answers have not yet established which development or policy response you choose.

### `Claims.unplacedUnestablished.catastrophic_risk`

Status: machine

English:

> These answers do not yet establish the prospect of catastrophic or irreversible harm.

Indonesian:

> Jawaban-jawaban ini belum menetapkan kemungkinan kerugian katastrofik atau yang tidak dapat dipulihkan.

Back-translation (machine):

> These answers have not yet established the possibility of catastrophic or irrecoverable harm.

### `Claims.facetUnsettled`

Status: machine

English:

> You have not settled on a position here.

Indonesian:

> Anda belum menetapkan posisi di sini.

Back-translation (machine):

> You have not yet established a position here.

### `Claims.axisUnsettled`

Status: machine

English:

> You have not settled on this. The point marks the center of the open range, not a moderate belief.

Indonesian:

> Anda belum menetapkan posisi mengenai hal ini. Titik tersebut menandai titik tengah rentang yang masih terbuka, bukan keyakinan yang moderat.

Back-translation (machine):

> You have not yet established a position regarding this. The point marks the midpoint of the range that is still open, not a moderate belief.

### `Claims.axisTentative`

Status: machine

English:

> A tentative estimate from your answers; the wider range shows other plausible readings.

Indonesian:

> Estimasi sementara dari jawaban Anda; rentang yang lebih lebar menunjukkan penafsiran lain yang masuk akal.

Back-translation (machine):

> A provisional estimate from your answers; a wider range indicates other reasonable interpretations.

### `Claims.timelineExpressed`

Status: machine

English:

> Timing expressed in answer {number}; see the full answer for its scope and uncertainty.

Indonesian:

> Waktu yang diungkapkan dalam jawaban {number}; lihat jawaban lengkap untuk cakupan dan ketidakpastiannya.

Back-translation (machine):

> Time expressed in answer {number}; see the full answer for its scope and uncertainty.

### `Claims.timelineUnsettled`

Status: machine

English:

> You have not settled on a timeline.

Indonesian:

> Anda belum menetapkan linimasa.

Back-translation (machine):

> You have not yet established a timeline.
