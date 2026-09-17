---
{
  'id': 'publication.sparse-autoencoder-scaling',
  'kind': 'publication',
  'title': 'Scaling and evaluating sparse autoencoders',
  'aliases':
    [
      'Scaling and evaluating sparse autoencoders',
      'arXiv:2406.04093',
      'Gao 2024 sparse autoencoder scaling paper'
    ],
  'topics': ['architecture', 'evaluation'],
  'date': '2024-06-06',
  'entities': [],
  'related': [],
  'content_version': '0.1.0-draft',
  'status': 'draft',
  'reviewer': null,
  'sources':
    [
      {
        'url': 'https://arxiv.org/abs/2406.04093',
        'type': 'primary',
        'accessed': '2026-09-17'
      }
    ]
}
---

## Neutral context

An empirical study of scalable activation-feature extraction.

## Reported facts

Gao and colleagues use k-sparse autoencoders to control sparsity while reconstructing language-model activations. They report improved reconstruction/sparsity tradeoffs, fewer inactive latents, and feature-quality metrics generally improving with size. Their largest reported experiment trains 16 million latents on GPT-4 activations from 40 billion tokens.

## Interpretations

Scalable feature extraction is progress whose completeness still requires assessment.

## Known unknowns

Proposed feature metrics are incomplete proxies; recovering some interpretable features does not recover every important computation.

## Claim support

Supports scalable feature extraction and empirical interpretability progress. Does not certify comprehensive model transparency, eliminate deception, or establish safe deployment.

## Related entries

Topic retrieval supplies context, not an attribution to the participant.

## Review notes

Agent-authored draft based on the accessible primary abstract and bibliographic metadata, accessed 2026-09-17. Human factual/editorial review pending. [Primary source](https://arxiv.org/abs/2406.04093).
