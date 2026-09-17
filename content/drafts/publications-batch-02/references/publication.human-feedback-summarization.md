---
{
  'id': 'publication.human-feedback-summarization',
  'kind': 'publication',
  'title': 'Learning to summarize from human feedback',
  'aliases':
    [
      'Learning to summarize from human feedback',
      'arXiv:2009.01325',
      'Stiennon 2020 summarization paper'
    ],
  'topics': ['architecture', 'evaluation'],
  'date': '2020-09-02',
  'entities': [],
  'related': [],
  'content_version': '0.1.0-draft',
  'status': 'draft',
  'reviewer': null,
  'sources':
    [
      {
        'url': 'https://arxiv.org/abs/2009.01325',
        'type': 'primary',
        'accessed': '2026-09-17'
      }
    ]
}
---

## Neutral context

A study of feedback-based summary training.

## Reported facts

Stiennon and colleagues train a preference predictor from human summary comparisons, then optimize a summarization policy with reinforcement learning. Human evaluations favor their Reddit TL;DR summaries over the tested supervised baselines and reference summaries. They also report transfer to CNN/Daily Mail without news-specific fine-tuning.

## Interpretations

Improvement in rated summaries need not settle fidelity or general alignment.

## Known unknowns

Preference judgments are task-dependent; the abstract does not establish complete factual fidelity or general alignment.

## Claim support

Supports improving evaluated summary quality with human-feedback training. Does not prove all generated summaries are accurate, or that satisfying raters guarantees safe objectives.

## Related entries

Topic retrieval supplies context, not an attribution to the participant.

## Review notes

Agent-authored draft based on the accessible primary abstract and bibliographic metadata, accessed 2026-09-17. Human factual/editorial review pending. [Primary source](https://arxiv.org/abs/2009.01325).
