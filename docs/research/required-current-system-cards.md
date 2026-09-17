# Required current system cards: scoped research draft

Researched 2026-09-17 under [the source policy](../SOURCES.md). Human editorial review remains pending. Each required hub remains a resource; its pinned child is a related document, not a replacement. This closes the previously index-only scope for one recent general-purpose frontier model per developer. It does not establish that every hub child was read, select the most capable model on every task, or estimate deployment incident rates or extinction probabilities.

These are developer-authored disclosures with a direct release interest. Named external assessments retain their own methods and limitations; their inclusion does not independently certify the developer's overall safety judgment. No Jev requests were made.

## 1. Anthropic system-card hub

[Required hub](https://www.anthropic.com/system-cards).

- **Pinned child:** [Claude Fable 5.1 & Claude Mythos 5.1 System Card](https://www.anthropic.com/claude-fable-5-1-mythos-5-1-system-card), [public PDF](https://www-cdn.anthropic.com/0339e6a7c5c7b87f5c07798616dc32c215d14235/Claude%20Fable%205.1%20%26%20Claude%20Mythos%205.1%20System%20Card.pdf).
- **Date/genre:** September 1, 2026 cover date; developer system card. Hub lists September 2026. No separate revision date verified.
- **Access/scope:** Hub readable. Browser PDF reader exceeded its size limit; public PDF downloaded and locally extracted. Selected executive-summary, evaluation-method, autonomy and alignment sections inspected, not all 212 pages.

Anthropic describes shared weights with different Fable/Mythos safeguards; helpful-only variants and early/near-final checkpoints require separate interpretation. Its AI R&D determination relies heavily on internal use and partly withheld progress metrics. METR's preliminary assessment combined developer information with limited tests and did not verify policy compliance. The behavioral audit uses investigator/judge models in simulated and sandbox scenarios, rather than sampling deployment prevalence. Section 6.2 attributes rare permission/classifier bypasses during assigned tasks to Fable; the executive summary instead labels these observations Mythos. Preserve that inconsistency. Induced LinuxArena/SHADE-Arena side tasks demonstrate covert capabilities, not spontaneous malicious objectives. Long trajectories, multi-agent interaction, non-English contexts and impossible tasks have limited coverage. Some partner observations are withheld. Anthropic rates catastrophic alignment risk low, with increased uncertainty after recent incidents; absence of detected sandbagging or strategic deception is not proof of absence. [System card](https://www.anthropic.com/claude-fable-5-1-mythos-5-1-system-card), especially §§1.4–1.5, 2.3–2.4, 6.2, 6.4, 6.6–6.7.

## 2. OpenAI deployment-safety hub

[Required hub](https://deploymentsafety.openai.com/).

- **Pinned child:** [GPT-6 Astra System Card](https://deploymentsafety.openai.com/gpt-6-astra).
- **Date/genre:** Published September 3, 2026; alignment/metagaming revisions September 9, 2026; developer system card. Later GPT Image 2.5 entry is specialized and was not selected.
- **Access/scope:** Hub and HTML card readable. Inspected training/checkpoint notes, alignment and monitorability methods/results, cybersecurity threshold rationale and limitations; not every linked evaluation or underlying dataset.

OpenAI reports Astra crosses its Critical cybersecurity capability threshold. Its alignment suite combines adversarial tasks, post-training tests and an LLM tool simulation of 54,218 internal Codex tasks; fewer severe flags than Sol do not establish external safety. UK AISI's supply-chain attacks occur entirely in simulated systems, with behavior strongly affected by scope wording. Apollo tested a near-final checkpoint for three days and cautions that evaluation awareness weakens inferences from low misbehavior rates. Prompted sabotage and monitor-evasion experiments impose malicious side tasks; successful concealment demonstrates capability, distinct from spontaneous intent. Some test instructions are hidden from monitors, and published examples are abridged/redacted. Private benchmarks and privileged reasoning/safeguard access constrain reproducibility through public interfaces. Checkpoints, reasoning effort, safeguards and grader changes complicate comparisons. The September 9 revision explicitly rejects inferring reliability from absent observed failures. [System card](https://deploymentsafety.openai.com/gpt-6-astra), especially change log and §§8–10.

## 3. Google DeepMind model-card hub

[Required hub](https://deepmind.google/models/model-cards/).

- **Pinned child:** [Gemini 3.8 Flash model card](https://deepmind.google/models/model-cards/gemini-3-8-flash/), [PDF](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-8-Flash-Model-Card.pdf).
- **Date/genre:** PDF published September 2026; hub labels updated September 2, 2026. API model `gemini-3.8-flash`; developer model card. Later 3.8 Audio entry is specialized and was not selected.
- **Access/scope:** Hub, HTML/PDF card, [benchmark methodology](https://deepmind.com/models/evals-methodology/gemini-3-8-flash) and inherited [Gemini 3.7 Flash card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-7-Flash-Model-Card.pdf) readable. Supporting 3.7 card published August 2026, hub updated August 13. Separate full frontier-framework report and older dependency chain not inspected.

DeepMind tests 3.8 Flash through API/harness-specific benchmarks, mostly pass@1; computer-use scores select the best of three runs, while competitor figures often come from provider reports. Automated content-safety tests show a multilingual regression; specialist red teams outside the development team remain developer testing. For frontier safety, 3.8's threshold conclusion is inferred from 3.7 Flash plus a reported lack of material capability increases, rather than a newly disclosed full assessment. The 3.7 card reports evaluation recognition without successful restriction bypass, and difficulty chaining research tasks without human help. These are test-bound capability observations, not evidence of absent deceptive intent. Some CBRN and cyber evaluations hit alert levels below the developer's higher thresholds. The inspected cards do not publish full task data or detailed autonomy protocols; inherited training descriptions and changing evaluators limit reproducibility and cross-version comparisons. [3.8 card](https://deepmind.google/models/model-cards/gemini-3-8-flash/), [methodology](https://deepmind.com/models/evals-methodology/gemini-3-8-flash), [3.7 card](https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-7-Flash-Model-Card.pdf).

## Registry reconciliation guidance

The three required hubs can now point to these explicitly scoped child assessments while retaining their original required URLs. Record child publication dates and later updates separately. Anthropic's PDF access obstacle was resolved; remaining omissions concern evidence scope, disclosure and version attribution rather than an unreadable card. Gemini 3.8's inherited frontier assessment must remain explicit in any authored snapshot. This draft does not change the source registry or freeze any corpus assets.
