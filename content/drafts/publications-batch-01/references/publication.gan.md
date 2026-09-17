---
{
  'id': 'publication.gan',
  'title': 'Generative Adversarial Networks',
  'aliases': ['Generative Adversarial Networks paper', 'Goodfellow GAN paper'],
  'topics': ['architecture', 'capabilities'],
  'date': '2014-06-10',
  'kind': 'publication',
  'entities': [],
  'related': [],
  'content_version': '0.1.0-draft',
  'status': 'draft',
  'reviewer': null,
  'sources':
    [
      {
        'url': 'https://arxiv.org/abs/1406.2661',
        'type': 'primary',
        'accessed': '2026-09-17'
      }
    ]
}
---

## Neutral context

A proposal for learning a generative model through an adversarial training objective.

## Reported facts

Goodfellow and colleagues train a generator and discriminator together. The discriminator distinguishes training examples from generated samples, while the generator aims to defeat that distinction. The paper describes a minimax formulation and reports generation experiments.

## Interpretations

Competing training objectives can provide a useful learning signal for generation.

## Known unknowns

Results from this formulation do not settle training stability, fidelity or suitability in every application.

## Claim support

Supports discussion of a generative-learning framework. The word adversarial describes training here; it is not evidence that the resulting model has hostile intentions.

## Related entries

Topic retrieval supplies context, not an attribution to the participant.

## Review notes

Agent-authored draft based on the authors’ abstract and arXiv submission metadata, accessed 2026-09-17. Human factual/editorial review pending. [Primary source](https://arxiv.org/abs/1406.2661).
