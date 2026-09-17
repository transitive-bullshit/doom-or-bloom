---
{
  'id': 'report.deepmind-gemini-3-8-flash-card-2026',
  'kind': 'publication',
  'title': 'Gemini 3.8 Flash model card',
  'aliases':
    ['Gemini 3.8 Flash model card', 'gemini-3.8-flash safety assessment'],
  'topics': ['capability', 'control', 'evaluation', 'risk'],
  'date': '2026-09; exact PDF day unverified',
  'entities': ['entity.deepmind'],
  'related': ['hub.deepmind-model-cards-2026-09'],
  'content_version': '0.4.0-draft',
  'status': 'draft',
  'reviewer': null,
  'sources':
    [
      {
        'url': 'https://deepmind.google/models/model-cards/gemini-3-8-flash/',
        'type': 'primary',
        'accessed': '2026-09-17'
      },
      {
        'url': 'https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-8-Flash-Model-Card.pdf',
        'type': 'primary',
        'accessed': '2026-09-17'
      },
      {
        'url': 'https://deepmind.com/models/evals-methodology/gemini-3-8-flash',
        'type': 'primary',
        'accessed': '2026-09-17'
      },
      {
        'url': 'https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-7-Flash-Model-Card.pdf',
        'type': 'primary',
        'accessed': '2026-09-17'
      }
    ]
}
---

## Neutral context

Genre: Developer model card with inherited frontier assessment. Required-source draft or pinned child of a required hub; outside the current demo.

## Reported facts

The card uses harness/API-specific benchmarks, mostly pass@1; computer-use scores select the best of three runs. Frontier threshold conclusions inherit 3.7 Flash assessment plus the developer’s lack-of-material-increase judgment. Automated content-safety tests show a multilingual regression.

## Interpretations

Keep inherited conclusions explicit. Developer specialist red teams and provider-reported competitor scores are not an independent comparative audit.

## Known unknowns

The 3.7 tests report evaluation recognition and difficulty chaining research without human help, not absence of deceptive intent. Detailed autonomy protocols/task data and the full older dependency chain were not inspected; alert levels differ from higher policy thresholds.

## Claim support

Ground the API model and disclosed evaluation methodology without presenting a newly performed comprehensive 3.8 frontier assessment.

## Related entries

Relationships indicate shared subject matter or a hub/child dependency, not independent corroboration.

## Review notes

PDF September 2026; hub update 2026-09-02. Supporting 3.7 PDF August 2026, hub update August 13. Read scope: 3.8 card, methodology and selected inherited 3.7 material; full frontier-framework report not read. Accessed 2026-09-17. Research: docs/research/required-current-system-cards.md, section 3. Agent draft; human review pending.
