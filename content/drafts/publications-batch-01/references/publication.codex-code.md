---
{
  'id': 'publication.codex-code',
  'title': 'Evaluating Large Language Models Trained on Code',
  'aliases':
    [
      'Evaluating Large Language Models Trained on Code',
      '2021 Codex paper',
      'Chen HumanEval paper'
    ],
  'topics': ['capabilities', 'evaluation'],
  'date': '2021-07-07',
  'kind': 'publication',
  'entities': [],
  'related': [],
  'content_version': '0.1.0-draft',
  'status': 'draft',
  'reviewer': null,
  'sources':
    [
      {
        'url': 'https://arxiv.org/abs/2107.03374',
        'type': 'primary',
        'accessed': '2026-09-17'
      }
    ]
}
---

## Neutral context

A 2021 study of a language model fine-tuned on code and its functional-correctness evaluation.

## Reported facts

Chen and colleagues introduce Codex and the HumanEval evaluation. Their model solves 28.8% of the tested problems with one sample; using 100 samples per problem raises the reported rate to 70.2%. They describe limitations on more complicated instructions.

## Interpretations

Repeated sampling can improve success under an evaluation protocol while consuming additional attempts.

## Known unknowns

Benchmark success does not establish production security, maintenance quality or reliability for every programming task.

## Claim support

Supports a bounded code-generation milestone and sampling result. The 2021 model is historically distinct from current products using the Codex name; the multi-sample rate is not single-attempt reliability.

## Related entries

Topic retrieval supplies context, not an attribution to the participant.

## Review notes

Agent-authored draft based on the authors’ abstract and arXiv submission metadata, accessed 2026-09-17. Human factual/editorial review pending. [Primary source](https://arxiv.org/abs/2107.03374).
