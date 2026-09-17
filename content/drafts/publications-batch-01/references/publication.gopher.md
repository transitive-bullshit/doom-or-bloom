---
{
  'id': 'publication.gopher',
  'title': 'Scaling Language Models: Methods, Analysis & Insights from Training Gopher',
  'aliases':
    [
      'Gopher paper',
      'Scaling Language Models Methods Analysis Insights',
      'Gopher 280 billion paper'
    ],
  'topics': ['capabilities', 'architecture', 'evaluation'],
  'date': '2021-12-08',
  'kind': 'publication',
  'entities': [],
  'related': [],
  'content_version': '0.1.0-draft',
  'status': 'draft',
  'reviewer': null,
  'sources':
    [
      {
        'url': 'https://arxiv.org/abs/2112.11446',
        'type': 'primary',
        'accessed': '2026-09-17'
      }
    ]
}
---

## Neutral context

An empirical study of Transformer language models across model sizes, including Gopher.

## Reported facts

The authors evaluate models up to 280 billion parameters on 152 tasks. They report larger gains from scaling in some comprehension and fact-checking tasks than in logical and mathematical reasoning, alongside analysis of bias and toxicity.

## Interpretations

Scaling can improve measured performance unevenly across task families.

## Known unknowns

The findings do not establish how those relationships extend to all later architectures, datasets or deployment conditions.

## Claim support

Supports task-specific scaling observations and evaluation concerns. Does not show that every capability increases uniformly with parameters or that scale eliminates downstream harms.

## Related entries

Topic retrieval supplies context, not an attribution to the participant.

## Review notes

Agent-authored draft based on the authors’ abstract and arXiv submission metadata, accessed 2026-09-17. Human factual/editorial review pending. [Primary source](https://arxiv.org/abs/2112.11446).
