---
{
  'id': 'publication.instructgpt',
  'title': 'Training language models to follow instructions with human feedback',
  'aliases':
    [
      'InstructGPT paper',
      'Training language models to follow instructions with human feedback',
      'Ouyang human feedback paper'
    ],
  'topics': ['architecture', 'evaluation', 'risk'],
  'date': '2022-03-04',
  'kind': 'publication',
  'entities': [],
  'related': [],
  'content_version': '0.1.0-draft',
  'status': 'draft',
  'reviewer': null,
  'sources':
    [
      {
        'url': 'https://arxiv.org/abs/2203.02155',
        'type': 'primary',
        'accessed': '2026-09-17'
      }
    ]
}
---

## Neutral context

A study of supervised instruction demonstrations and reinforcement learning from human feedback.

## Reported facts

The authors use demonstrations and ranked outputs to fine-tune GPT-3 into InstructGPT. On their prompt distribution, evaluators prefer a 1.3-billion-parameter InstructGPT model to the 175-billion-parameter GPT-3 model. They report truthfulness and toxicity improvements while acknowledging mistakes.

## Interpretations

Training for user intent can affect measured helpfulness independently of model size.

## Known unknowns

Preference on this distribution does not establish agreement with every user's values or general reliability outside the tested tasks.

## Claim support

Supports an empirical human-feedback training result. Does not establish that alignment is solved, mistakes are eliminated or a preferred assistant remains controllable under arbitrary autonomy.

## Related entries

Topic retrieval supplies context, not an attribution to the participant.

## Review notes

Agent-authored draft based on the authors’ abstract and arXiv submission metadata, accessed 2026-09-17. Human factual/editorial review pending. [Primary source](https://arxiv.org/abs/2203.02155).
