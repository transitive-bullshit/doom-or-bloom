---
{
  'id': 'publication.jailbroken-safety-training',
  'kind': 'publication',
  'title': 'Jailbroken: How Does LLM Safety Training Fail?',
  'aliases':
    [
      'Jailbroken: How Does LLM Safety Training Fail?',
      'arXiv:2307.02483',
      'Wei Haghtalab Steinhardt Jailbroken paper'
    ],
  'topics': ['risk', 'evaluation'],
  'date': '2023-07-05',
  'entities': [],
  'related': [],
  'content_version': '0.1.0-draft',
  'status': 'draft',
  'reviewer': null,
  'sources':
    [
      {
        'url': 'https://arxiv.org/abs/2307.02483',
        'type': 'primary',
        'accessed': '2026-09-17'
      }
    ]
}
---

## Neutral context

An attack study of refusal-training generalization.

## Reported facts

Wei, Haghtalab, and Steinhardt propose conflicting objectives and mismatched generalization as safety-training failure modes. They use these hypotheses to design and evaluate attacks against then-current GPT-4 and Claude v1.3, reporting persistent vulnerabilities on the tested unsafe-request collection.

## Interpretations

Refusal behavior can fail when generalization differs from training conditions.

## Known unknowns

Results concern specified model versions and attack/evaluation sets; they do not measure every later defense or deployment.

## Claim support

Supports limitations of tested refusal training and the importance of safety generalization. Does not establish that every safeguard fails, that scaling never helps safety, or that jailbreak success implies autonomous takeover.

## Related entries

Topic retrieval supplies context, not an attribution to the participant.

## Review notes

Agent-authored draft based on the accessible primary abstract and bibliographic metadata, accessed 2026-09-17. Human factual/editorial review pending. [Primary source](https://arxiv.org/abs/2307.02483).
