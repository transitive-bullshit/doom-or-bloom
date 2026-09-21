# Explicit public P(doom): evidence for persona comparisons

Researched September 21, 2026. Target window: September 21, 2024–September 21, 2026. Machine-readable handoff: `/tmp/explicit-pdoom-sources.json`. This is an evidence pass, not a new scoring rule. Compare against the saved simulated answers and their actual P(doom) definition, not against a person's reputation or a required map position.

## Verified comparison candidates

| Persona | Public estimate | Date | What the number means | Comparison use |
| --- | --- | --- | --- | --- |
| Geoffrey Hinton | 10–20% | January 10, 2025 | AI-caused human extinction; answers a question framed around the next thirty years | Closest available endpoint match, but retain the date and substantial uncertainty |
| Gary Marcus | Approximately 3% | July 15, 2025 | Catastrophic AI danger, framed around misuse, concentrated power and reckless deployment | Approximate comparison; the essay does not precisely define an extinction-only endpoint |
| Dario Amodei | 25% | September 17, 2025 | Broad AI catastrophe | Endpoint qualification required |
| Max Tegmark | Over 90%, **conditional** | November 21, 2025 | Losing control after superintelligence deployment without safety regulation | Scenario comparison only; not an unconditional calibration target |
| Noah Smith | 10% collapse; 30% severe destruction | August 28, 2026 | Two distinct outcomes from AI-enabled bioterrorism | Neither number is automatically extinction or permanent loss of human control |

### Geoffrey Hinton

The [WBUR On Point transcript](https://www.wbur.org/onpoint/2025/01/10/ai-geoffrey-hinton-physics-nobel-prize) labels Hinton's own response. He endorses the range while stressing that a phenomenon without precedent does not justify precision. The approximate thirty-year horizon comes from the question he answers. Do not substitute the broader bounds he uses to reject extreme estimates for his 10–20% range.

Later context matters: in [CNN's August 12, 2026 interview](https://transcripts.cnn.com/show/cg/date/2026-08-12/segment/02), at roughly 18:30, the host repeats that range. Hinton emphasizes intuitive uncertainty and says the possibility of building AI that cares about humans has made him somewhat less scared. He supplies no replacement percentage. Therefore label 10–20% as his **January 2025 statement**, not his measured or reaffirmed September 2026 forecast. The recent CNN interviews in the separate Hinton research note remain useful qualitative grounding.

### Gary Marcus

[His own July 15, 2025 essay](https://garymarcus.substack.com/p/why-my-pdoom-has-risen-dramatically) gives approximately 3% as an upward revision. It focuses on dangerous deployment and actors rather than assuming current LLM scaling necessarily produces autonomous superintelligence. The number is explicitly his, but its event definition and horizon are underspecified. It can reveal whether our proxy overstates his existential pessimism; it cannot supply a precision ground truth for extinction.

### Dario Amodei

[Axios's first-party event report](https://www.axios.com/2025/09/17/anthropic-dario-amodei-p-doom-25-percent) supplies the dated 25% statement. Preserve the broad endpoint.

### Max Tegmark

The [host-published debate transcript](https://lironshapira.substack.com/p/max-tegmark-vs-dean-ball-debate-ban-superintelligence) separates Max, Dean Ball and Liron Shapira. At 01:17:05 Tegmark gives greater than 90% for loss of control under continued unregulated superintelligence deployment. At 01:27:58 he explicitly reasserts that condition and expresses optimism that regulation might prevent the scenario. A model can correctly simulate both his extreme warning and his hope for intervention. Calling a lower unconditional result an error solely because it falls below 90% would discard the condition.

### Noah Smith

[Smith's August 28, 2026 essay](https://www.noahpinion.blog/p/heres-how-were-all-going-to-die) distinguishes collapse (10%) from severe destruction (30%). These are AI-enabled bioterrorism estimates. Its illustrative 2029 scenario is not a formally stated forecast deadline. Do not silently relabel either endpoint as total extinction.

The [March 17, 2026 Doom Debates interview](https://lironshapira.substack.com/p/this-top-economists-pdoom-just-shot), particularly 00:05:14–00:10:18, clarifies the difference between collapse with survivors, full extinction and inability to rebuild. The host proposes a 5% permanent-doom number; that suggestion is not Smith's own estimate. Also distinguish his low probability for a long-term machine-god pathway from his greater concern about powerful tools misused by humans. The episode's sensational title is insufficient evidence by itself.

## Exclusions and unresolved leads

- **Elon Musk:** the [official February 28, 2025 JRE episode](https://www.youtube.com/watch?v=sSOxPJD-VNo) is a strong lead for the widely reported 20% annihilation remark. This pass verified the original episode's existence, but could not inspect its own transcript or the relevant audio. Excluded from the verified machine-readable comparison rather than presenting secondary repetition as primary verification. An older 2024 quotation must not acquire a 2025 date simply because it is repeated in reporting.
- **Sam Altman:** do not use a host's suggested 2% as a precise personal estimate. The [Sam interview research note](persona-interviews-sam-2026-09-21.md) already distinguishes interviewer hypotheticals from Altman's own responses. A qualitative low-but-nonzero belief can ground the persona without a fabricated exact percentage.
- **Yoshua Bengio:** the widely repeated 20% figure traces to 2023, outside this window. A recent interview recalling it is not automatically a new numerical endorsement.
- **Eliezer Yudkowsky:** a near-certain qualitative prediction and the title of his 2025 book are strong worldview evidence, but this pass did not establish a recent primary statement of precisely 99%. Do not turn that expectation into a purported quotation.
- **Stuart Russell:** numbers he attributes to industry leaders are not necessarily his own estimate.
- **Yann LeCun / Marc Andreessen:** common tables repeat near-zero numbers with inconsistent provenance and dates. No qualifying recent primary numerical statement was verified here.
- Targeted searches also did not establish a qualifying recent own numerical statement for Nathan Lambert or Dwarkesh Patel. This bounded pass does not prove that these people, or the remaining public personas, have never given one.

## How to read the simulation comparison

Report the public percentage, date, outcome definition and condition beside the simulated estimate and interpretation range. Label the saved run date and whether it predates the source additions. For Hinton, show distance from the **range**, not an invented 15% target. For Tegmark and Smith, show the numbers side by side with the differing conditions/endpoints rather than compute a misleading error score.

Adding explicit percentages to participant grounding and rerunning measures whether the participant preserves them and our engine recovers them. That is useful, but it is not an independent test of inferring P(doom) from qualitative beliefs. Preserve that distinction when interpreting improvements. Jev should still see only the simulated participant's actual answers, not the persona identity or an external benchmark.

## Comparison with saved simulations

Existing simulations were retained, not rerun after adding these numerical statements. Noah is a newly generated live journey whose brief already includes the numbers. Collection: `1790008875538-a68e2f0e-f19d-4dce-9ca1-bd52f1ce1890`. These are interpretation ranges, not statistical confidence intervals.

| Person | Public statement | Simulation | Interpretation range |
| --- | --- | --- | --- |
| Geoffrey Hinton | [10–20%](https://www.wbur.org/onpoint/2025/01/10/ai-geoffrey-hinton-physics-nobel-prize) | 42.9% | 0–85% |
| Gary Marcus | [approximately 3%](https://garymarcus.substack.com/p/why-my-pdoom-has-risen-dramatically) | 16.3% | 0–52% |
| Dario Amodei | [25%](https://www.axios.com/2025/09/17/anthropic-dario-amodei-p-doom-25-percent) | 41.6% | 10–70% |
| Max Tegmark | [>90%, conditional on no regulation](https://lironshapira.substack.com/p/max-tegmark-vs-dean-ball-debate-ban-superintelligence) | 42.0% | 0–89% |
| Noah Smith | [10% civilization collapse; 30% world-changing destruction](https://www.noahpinion.blog/p/heres-how-were-all-going-to-die) | 31.3% | 10–50% |

Hinton is the clearest candidate for an overestimate: the simulation is 42.9%, well above his dated 10–20% extinction estimate. Marcus and Dario are also numerically higher, but their outcome definitions are broader or underspecified. Tegmark’s conditional >90% is not directly comparable to an unconditional 42%. Noah’s collapse and destruction estimates must remain distinct from extinction or permanent disempowerment.

Noah’s new answer explicitly distinguishes collapse from extinction, yet the result reports an inferred 31.3% P(doom). The UI says this applies to the outcomes and conditions in his answers, but the single P(doom) label does not distinguish the two outcomes. Review whether the projection is blending their probabilities, and retain the endpoint alongside each estimate. Do not “fix” this by copying his 10% or 30% into an extinction-only interpretation. The next experiment should test endpoint-aware extraction and conditional scenarios separately from qualitative risk inference.

A source-grounded persona can repeat a supplied percentage. Agreement after this refresh tests persona fidelity and extraction, not independent calibration. Preserve a separate qualitative-only evaluation when testing inference quality. No scoring rules were changed in this source pass.
