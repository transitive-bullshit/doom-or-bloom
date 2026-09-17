---
{
  'id': 'publication.toolformer',
  'kind': 'publication',
  'title': 'Toolformer: Language Models Can Teach Themselves to Use Tools',
  'aliases':
    [
      'Toolformer: Language Models Can Teach Themselves to Use Tools',
      'arXiv:2302.04761',
      'Toolformer paper'
    ],
  'topics': ['capabilities', 'architecture'],
  'date': '2023-02-09',
  'entities': [],
  'related': [],
  'content_version': '0.1.0-draft',
  'status': 'draft',
  'reviewer': null,
  'sources':
    [
      {
        'url': 'https://arxiv.org/abs/2302.04761',
        'type': 'primary',
        'accessed': '2026-09-17'
      }
    ]
}
---

## Neutral context

A study of learning when and how to call tools.

## Reported facts

Schick and colleagues train a language model to choose API calls, arguments, timing, and incorporation of tool outputs using a self-supervised procedure with a few demonstrations. Tools include calculation, search, translation, question answering, and a calendar. They report improved zero-shot downstream performance without sacrificing core language-modeling ability.

## Interpretations

External interfaces can extend task capabilities beyond unaided text prediction.

## Known unknowns

Demonstrated tools and tasks are bounded; security, arbitrary API reliability, and long-horizon autonomous operation are unestablished.

## Claim support

Supports learned tool use improving tested capabilities. Does not prove unrestricted agency, perfect factual accuracy, or safe authorization handling.

## Related entries

Topic retrieval supplies context, not an attribution to the participant.

## Review notes

Agent-authored draft based on the accessible primary abstract and bibliographic metadata, accessed 2026-09-17. Human factual/editorial review pending. [Primary source](https://arxiv.org/abs/2302.04761).
