# CASP intelligence-explosion report — October 3, 2026

## Source and access scope

User-requested inclusion of [What if automating AI R&D triggers an intelligence explosion?](https://casp.ac/reports/intelligence-explosion), Frontier AI Working Paper Series No. 2/2026, dated **September 2026**. No exact publication day or material revision date was established. Access date: October 3, 2026.

The source read was the user-supplied `CASP_Intelligence_Explosion.pdf`: 15 physical pages comprising a cover and numbered pages 1–14. SHA-256: `bf18b0ea5879db349e8af3836593bf08f8060432156ea13abac4700c217288f9`. The entire extracted text was read, including author affiliations and disclaimer, body, bibliography, **Supplementary Materials on numbered pages 12–13**, and endnotes through numbered page 14. The supplement is part of this PDF; no separately linked supplement was fetched. Bibliography entries were inspected as citations, not treated as independently read or verified studies. The canonical landing URL identifies the publication; claims here derive from the supplied PDF. PDF extraction contains glyph artifacts, so equations are summarized conceptually instead of copied from damaged mathematical text.

## Authorship and attribution

The title page lists 22 coauthors: Alan Chan, Christoph Winter, Andrew Barto, Jakub Pachocki, Geoffrey Hinton, Eric Horvitz, Yoshua Bengio, Dawn Song, Jack Clark, Hilary Greaves, Anton Korinek, Samuel Hammond, Thore Graepel, Ben Bariach, Philip H. S. Torr, Sheila A. McIlraith, Jeff Clune, Sam Manning, Girish Sastry, Tom Davidson, Daniel Eth and Sören Mindermann. Its disclaimer says their views need not represent their affiliated organizations. The affiliations span frontier developers, universities and policy organizations; they establish context, not independent certification. [Report, numbered p. 1](https://casp.ac/reports/intelligence-explosion).

Bengio, Hinton, Clark and Korinek are named coauthors. Only Bengio and Hinton have existing personas in the current catalog, so only their briefs receive this source addition. Coauthorship supports the jointly presented mechanism, uncertainty and policy argument. It does not establish identical personal timelines, catastrophe probabilities or endorsement of every claim in the bibliography. This source must not prescribe persona assessment scores. [Report, numbered pp. 1–8](https://casp.ac/reports/intelligence-explosion).

## Findings and transfer limits

The paper studies a software-driven feedback loop: improved AI researchers expand effective research labor and develop better successors, with faster redeployment than hardware manufacturing permits. It characterizes the evidence as preliminary, mixed in places and sometimes indirect. Developer automation disclosures and research benchmarks are cited alongside failures, unreliable behavior and benchmark-to-workplace transfer limits. These are the authors' synthesis of other evidence, not an independently replicated experiment. [Report, numbered pp. 2–5](https://casp.ac/reports/intelligence-explosion).

Diminishing returns, experimental compute, data, hard-to-automate tasks and lengthy processes may interrupt the loop. The paper's historical returns-to-effort estimates of 1.2–1.9 are central estimates with substantial uncertainty; two of the three reported credible intervals cross the acceleration threshold. The illustrative tenfold acceleration over roughly 1.5 years assumes full automation, continuing parameters and no new bottlenecks. It is neither an unconditional forecast nor a date measured from publication. The supplement discusses compute confounding, ambiguous measures of software quality, imperfect labor proxies and failure of the models at physical limits. Its effective workforce range is conditional on expert-level AI at comparable runtime costs, not a measured workforce already operating. [Report, numbered pp. 4–5, 12–14](https://casp.ac/reports/intelligence-explosion).

The task-horizon extrapolation toward months-long tasks by mid-2028 is explicitly tentative. A workshop-reviewed automated paper is qualified in the notes because workshop standards may differ from the main conference. Superhuman performance need not arrive simultaneously across domains. Even digital defense depends partly on slower human organizations. These qualifications prevent turning selective capability demonstrations into universal automation or a fixed takeoff deadline. [Report, numbered pp. 3, 13–14](https://casp.ac/reports/intelligence-explosion).

The authors discuss earlier medical/scientific benefits alongside adaptation lag, loss of oversight/control and erosion of checks on power. Countervailing factors include narrow capabilities, physical experimentation and supply-chain constraints, faster safety work, diffusion and defense advantages. Policy priorities are visibility, steering/constraints and adaptation; proposed tools include reporting, audits, safe deployment environments, incident response, international coordination, support for beneficial and safety work, institutional safeguards and civil-society capacity. They recognize delayed-progress costs and potential abuse, including favoritism. These are proposals and conditional mechanisms, not demonstrated policy effectiveness. [Report, numbered pp. 5–8](https://casp.ac/reports/intelligence-explosion).

## Local integration and verification

The [draft snapshot](../../content/releases/0.4.0-draft/references/report.casp-intelligence-explosion-2026.md) incorporates the source into the active draft corpus with seven authoring sections, retrieval aliases and a required intake mapping. The current and pinned draft manifests record the addition. No reading recommendation is added. Earlier release assets and provenance remain historical records; the new snapshot is not human-reviewed, runtime corpus grounding remains paused and no saved assessment is reinterpreted.

Existing Bengio and Hinton source briefs now cite the canonical report with its month-level date and a joint, conditional summary. No other coauthor has an existing persona in the current catalog, and no new persona is created for this addition. The source preview was cached and its title-card fallback visually checked. No paid simulation regeneration or database update was performed. Historical benchmark references retain their recorded source-brief hashes and are intentionally stale relative to the updated briefs; they do not represent new runs.

Verification on the existing dirty working tree:

- `pnpm test:content` passed: 141 active references, 15 resources and 378 intake records, plus existing authored-content translation checks.
- `pnpm content:coverage` regenerated the source-coverage index from authoritative records.
- Current and pinned draft manifests contain the same addition. `pnpm fix:format` formatted the seven corpus/doc assets and `git diff --check` passed. The registry has 120 required URLs, of which 114 have mappings; both manifests and source guidance use those derived counts.

- Formatting, lint and unused-code checks passed. Type checking passed with `SWC_NATIVE_BINDING_CACHE=/private/tmp/doom-casp-swc-cache` after the default native cache was blocked by sandbox permissions.
- `pnpm test:unit --testTimeout=15000` passed 563 of 564 tests. The remaining test incorrectly required Hinton’s historical benchmark hash to equal the latest brief; its assertion now preserves the recorded historical hash. All six tests in `lib/benchmark/references.test.ts` then passed. Historical reference data was not rewritten.
- `pnpm resources:previews --url=https://casp.ac/reports/intelligence-explosion --concurrency=1` cached the report bookmark; all 778 source images are present. The generated title card and PDF author page were visually inspected.

No content review, frozen release, deployment or publication is implied.
