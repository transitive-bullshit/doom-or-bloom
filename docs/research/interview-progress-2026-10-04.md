# Interview progress indicator — October 4, 2026

The interview replaced its text counter, per-question duration line and **What your result needs** checklist with a segmented progress bar ([PRODUCT.md](../PRODUCT.md#interview)). This records the production measurements and the options compared.

## Production measurements

Read-only aggregates of participant assessments created September 28 – October 4, 2026, after automatic results began waiting for four answers. Forks and simulations are excluded. 162 assessments had at least one accepted answer, and 150 of them had a result.

Accepted answers when the first result appeared (n = 150):

| Answers     | 1   | 3   | 4        | 5        | 6       | 7   | 8   |
| ----------- | --- | --- | -------- | -------- | ------- | --- | --- |
| Assessments | <10 | <10 | 98 (65%) | 26 (17%) | 14 (9%) | <10 | <10 |

- 4–6 answers covered 92% of first results. The counter still said "most people see results after 4–8", and the duration line said "4 short questions" under every question.
- The map was placed, unlocking results and completing the checklist's required items, after the first answer for 76% of assessments (123 of 162), and by the third for 98%. The checklist therefore read "Your results are available" while three or more questions remained.
- 93% of assessments with an answer reached a result. 10 of the 12 without one stopped after their first answer. Leaving before the first answer is not measurable: unsent drafts are not saved, and PostHog records no page views.

## Options compared

Four prototypes ran in the real interview behind a query parameter and were captured with fixture judgments at five stages and three widths:

- a hairline across the top of the viewport;
- four segments with a Results flag above the question;
- twelve ticks for the prompt cap, with the usual results range shaded;
- a bottom dock with a results button.

The owner chose the segments. Instead of adding dots for follow-ups after the flag, follow-ups fill the last segment without completing it, as a gentle nudge to answer them. Results stay one click away. Routing decides follow-ups one at a time, and the client does not know how many remain, so each follow-up fills half of what remains of that segment, up to 95%, which keeps a visible gap and the reported value below 100%. An exact per-follow-up fill would need routing to persist an estimate of remaining worthwhile questions; this was not built.

The checklist remains in debug mode.
