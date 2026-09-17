---
{
  'id': 'publication.code-as-policies',
  'title': 'Code as Policies: Language Model Programs for Embodied Control',
  'aliases':
    [
      'Code as Policies',
      'Language Model Programs for Embodied Control',
      'Liang code as policies paper'
    ],
  'topics': ['capabilities', 'architecture'],
  'date': '2022-09-16',
  'kind': 'publication',
  'entities': [],
  'related': [],
  'content_version': '0.1.0-draft',
  'status': 'draft',
  'reviewer': null,
  'sources':
    [
      {
        'url': 'https://arxiv.org/abs/2209.07753',
        'type': 'primary',
        'accessed': '2026-09-17'
      }
    ]
}
---

## Neutral context

A robotics formulation in which language models generate code that calls existing control primitives.

## Reported facts

The authors demonstrate programs that process perception outputs and compose control APIs from natural-language instructions. They describe hierarchical code generation and experiments across several robot platforms.

## Interpretations

Combining language-model code generation with existing libraries and controllers can enable useful embodied behavior.

## Known unknowns

Performance depends on the supplied interfaces, demonstrations and environments; unfamiliar physical situations require separate evaluation.

## Claim support

Supports specific robot-policy demonstrations. Does not establish unconstrained physical autonomy, a replacement for safety engineering or dependable control in every real-world environment.

## Related entries

Topic retrieval supplies context, not an attribution to the participant.

## Review notes

Agent-authored draft based on the authors’ abstract and arXiv submission metadata, accessed 2026-09-17. Human factual/editorial review pending. [Primary source](https://arxiv.org/abs/2209.07753).
