import type { HubSource } from './citations'

// A benchmark beside the curated table: what published AI researchers answered
// to nearly the hub's question. English prose, like the explainer; `[^key]`
// cites `surveySources[key]`. Survey results never become table rows, which
// list only named people's own numbers. Checked against the paper (Section
// 3.9, Table 4) on 2026-10-04: the wording without a time frame drew a 10.0%
// median, an 18.3% mean and 52.7% at 10% or more (2023: a 5.0% median);
// pooled with the survey's two narrower wordings, 10.0%, 18.2% and 51.1%.

export const surveySources = {
  'espai-2024': {
    title:
      'Advanced AI according to 1,580 researchers: uncertain, unsafe, and sooner than we thought',
    url: 'https://aiimpacts.org/wp-content/uploads/2026/09/ESPAI2024.pdf',
    by: 'Katja Grace et al., AI Impacts',
    year: 2026
  }
} satisfies Record<string, HubSource>

export const surveyComparison =
  'In AI Impacts’ 2024 Expert Survey on Progress in AI, researchers who had published at six leading AI venues were asked nearly the same question: the chance that future AI advances cause “human extinction or similarly permanent and severe disempowerment of the human species”, with no time frame. The 1,580 who responded, about one in ten of those invited, gave a median of 10% and a mean of 18%, and just over half said 10% or more.[^espai-2024] It was the first time the survey’s median reached 10%, up from 5% in 2023.'
