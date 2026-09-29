# Engine design review — September 29, 2026

With real participant data in hand, we tested whether Doom or Bloom should change how it reads interviews:

- Jev against stronger models, and fine-tuning a model of our own;
- how long interviews should run;
- which dimensions the model keeps.

This note records the evidence and the decisions so the questions can be revisited. Everything here is aggregate. The accompanying analysis page is private.

## Decisions

- **Keep Jev as the evaluator.** No frontier model goes into the reading path, and nothing is fine-tuned.
- **Fix dropped typed P(doom) numbers.** Algorithm `0.7.2` fixes this; the 45 affected production results are re-evaluated after deploy.
- **Keep showing inferred P(doom).** It is rough, but participants value the detail.
- **Keep the richer worldview model.** The eight components and the facets stay, even though real interviews fill them sparsely. They serve the longer-term direction (Socratic follow-up, counter-evidence, pressure-testing a view) as well as today's map. Revisit trimming only with that direction in view.
- **Consider a targeted follow-up question** as the next experiment ([below](#next-experiment-a-targeted-follow-up-question)).

## Data and method

- **Data.** A read-only extract of all 962 production participant results on September 29:
  - 219 self-placements made before the result was revealed;
  - 77 agreement ratings;
  - 113 typed P(doom) numbers: 65 that results showed, and 48 that the extractor had dropped.
- **Readers.** Jev (`jev-1.13.0`), plus OpenAI gpt-5.6-luna, gpt-5.6-terra and gpt-5.6-sol with reasoning effort `low`.
  - Each read the same transcript and answered the exact projection questions of engine `0.7.1`, copied from a stored projection.
  - The OpenAI models returned a probability for every option.
  - Every reader's answers went through the production math:
    - the outlook from its five levels (at least 0.7 level mass);
    - the transformation axis rules;
    - P(doom) as the log-odds band mean with the basis gate.
  - terra and sol answered the six map and P(doom) questions. Jev and luna also answered the 24 worldview-component questions.
- **Variants.**
  - Free-form: gpt-5.6-sol placing people directly on 0–100 scales, without the rubric.
  - Tiny model: a ridge regression on `text-embedding-3-large` embeddings (1024 dimensions), trained on Jev's readings of other participants.
- **Self-placement is a guide, not ground truth.** A person's self-image can differ from the worldview their answers express. It serves as a shared yardstick: a reader that read the answers better would move closer to it.
- **Privacy and cost.** Transcripts went to Jev and to the OpenAI API with storage disabled, for this study only. Spend was $17.77:

  | Model         | Spend  |
  | ------------- | ------ |
  | gpt-5.6-sol   | $10.18 |
  | gpt-5.6-terra | $3.47  |
  | gpt-5.6-luna  | $2.53  |
  | Jev           | $1.54  |
  | Embeddings    | $0.04  |

## Jev reads as well as stronger models

Distance is the mean absolute distance on the 0–1 axes from the 219 self-placements. Paired against Jev, gpt-5.6-terra and gpt-5.6-sol differ by less than the noise (95% intervals about ±0.01). The free-form variant is closest, 0.010 closer on outlook and 0.008 on scale, both at the edge of the noise. gpt-5.6-luna is 0.014 further on scale, and the tiny model 0.030 further on outlook.

| Reader | Questions | Per 1,000 readings | Median wait | Outlook distance | Scale distance |
| --- | --- | --- | --- | --- | --- |
| Same guess for everyone | – | – | – | 0.233 | 0.181 |
| Jev (values production shows) | 30 | $0.66 | 0.5 s | 0.141 | 0.136 |
| Tiny model trained on Jev | – | $0.04 | – | 0.172 | 0.143 |
| gpt-5.6-luna | 30 | $2.16 | 12.1 s | 0.139 | 0.150 |
| gpt-5.6-terra | 6 | $8.09 | 6.8 s | 0.135 | 0.136 |
| gpt-5.6-sol | 6 | $13.89 | 6.6 s | 0.135 | 0.136 |
| gpt-5.6-sol, free-form | 3 | $4.61 | 2.6 s | 0.132 | 0.128 |

Mean difference in the outlook reading between pairs of readings:

| Comparison                                | Difference |
| ----------------------------------------- | ---------- |
| Jev, same answers twice                   | 0.007      |
| Jev, same answers reworded                | 0.019      |
| Jev against gpt-5.6-sol                   | 0.060      |
| Reading against the person's own guess    | 0.141      |
| A constant against the person's own guess | 0.233      |

Readers agree with each other far more closely than with self-placements. The remaining gap therefore lies mostly between what people write and how they see themselves; a stronger reader cannot close it. Jev reproduces the values production shows within 0.015 from the transcript alone.

Jev's confidence tracks its error. When the top outlook level carries at least 0.95 probability, the median distance from the guess is 0.06; below 0.6 it is 0.13. Readings between two outlook levels miss by more (0.160) than readings on a level (0.117). More words or more answers did not reduce the error.

## P(doom) inference

Every answer containing a percentage was removed, and the reading was compared with each of the 113 typed numbers:

| Reader | Readings | Within 2× in odds | Rank correlation | Mean bias (log-odds) |
| --- | --- | --- | --- | --- |
| Jev | 96 | 22% | 0.58 | −0.39 |
| gpt-5.6-sol | 103 | 28% | 0.48 | −1.85 |
| gpt-5.6-sol, free-form | 113 | 24% | 0.51 | −0.48 |
| Constant 12.5% | 113 | 32% | – | – |

- **Coarse bands don't help.** Three bands (under 5%, 5–30%, over 30%) matched 45–49% of typed bands, against 48–51% for always answering 5–30%.
- **The ordering is informative.** Grouped by Jev's reading, people typed these medians:

  | Jev's reading | Typed median |
  | ------------- | ------------ |
  | Under 2%      | 4%           |
  | 2–10%         | 11%          |
  | 10–30%        | 25%          |
  | Over 30%      | 40%          |

- **The number isn't in the conversation.** A stronger reader cannot recover it: gpt-5.6-sol answering the production rubric read people about 6× lower in odds than they said.

## Typed numbers were being dropped

`experimentCandidates` skipped every sentence under 8 characters before looking for a percentage. So a bare "30%", "2-5%" or "0%", the most direct answers to the P(doom) question, never became candidates, and the result showed an inferred value instead.

Of 114 answers to that question containing a percent sign, 62 were shown as typed. Of the 52 misses:

- 37 were this filter;
- 11 were read but not selected;
- 4 failed verification.

Algorithm `0.7.2` applies the minimum length to excerpts only. A read-only re-evaluation plan of the 45 affected production results found:

- 38 of the 40 that showed an inferred value now show the typed one;
- the other two stay inferred;
- the five already showing a typed value keep it;
- the map points moved 0.007 on average.

Six more answers used odds forms such as "1 in 10", which the extractor does not read.

## Interview length

Readings are from Jev on each interview's first answers, for current-engine interviews (September 27 onwards):

| Answers read | Interviews | Outlook still moves > 0.15 | Scale still moves > 0.15 | Median P(doom) change (log-odds) |
| --- | --- | --- | --- | --- |
| 1 | 274 | 24% | 27% | 1.21 |
| 2 | 269 | 11% | 11% | 0.98 |
| 3 | 254 | 5% | 2% | 0.12 |
| 4 | 111 | 4% | 0% | 0.05 |
| 6 | 30 | 0% | 0% | 0.08 |

For people with at least five answers (86), the distance from their own guess on the outlook was:

| Answers read | Distance |
| ------------ | -------- |
| 1            | 0.179    |
| 2            | 0.165    |
| 3            | 0.156    |
| 4            | 0.144    |
| All          | 0.137    |

- **The direct scale question helps.** Answering it moved the scale reading from 0.161 to 0.134 from people's guesses (206 people).
- **The direct P(doom) question comes third or fourth.** It is usually answered third (135 interviews) or fourth (82), and it reaches 79% of current interviews.

## Dimensions

These are production readings of the eight worldview components over the 962 results. Luna's reading of the same transcripts is in brackets.

| Component               | Placed for | Rank correlation with outlook |
| ----------------------- | ---------- | ----------------------------- |
| Expected harm           | 95%        | −0.74 (−0.52)                 |
| Expected benefit        | 81%        | 0.79 (0.73)                   |
| Human agency            | 53%        | 0.84 (0.77)                   |
| Transition dynamics     | 46%        | −0.15 (0.04)                  |
| Institutions            | 42%        | 0.50 (0.54)                   |
| Technical control       | 37%        | 0.51 (0.49)                   |
| Capability trajectory   | 35%        | 0.20 (0.20)                   |
| Action posture          | 13%        | 0.70 (0.78)                   |
| Overall outlook (facet) | 85%        | 0.98                          |

- **The two map axes are independent.** Outlook and scale have a rank correlation of −0.07. P(doom) correlates −0.53 with the outlook.
- **One factor dominates.** A principal-component analysis took outlook, scale, human influence, P(doom), expected benefit, expected harm and human agency, using results that had all of them. It explained 55%, 20% and 12% of the variation with a doom–bloom factor, scale and human influence.
- **The finer model is sparse.** It is thinly filled in real four-answer interviews, and the filled components largely track the outlook.
- **This is how people answer, not a Jev quirk.** Jev and luna agree on each component (rank correlation 0.80–0.95).

This supports asking targeted questions for the components a result or a future Socratic step relies on. It does not justify removing them.

## Fine-tuning

The tiny model trained on Jev's readings, with distance from own guess by training examples:

| Examples        | Outlook | Scale |
| --------------- | ------- | ----- |
| 25              | 0.234   | 0.203 |
| 100             | 0.202   | 0.165 |
| 400             | 0.180   | 0.146 |
| All (about 735) | 0.172   | 0.143 |
| Jev             | 0.141   | 0.136 |

The curve had not flattened. A fine-tuned small language model trained on Jev's own readings, which need no new labels, would likely close most of the rest. It is a fallback if Jev's price or availability changes, not a current need.

## Robustness

gpt-5.6-terra rewrote 60 transcripts, stratified by outlook level:

- **Reworded:** every claim and the length kept.
- **Shortened:** the claims kept, at about 60% of the words.

The table shows mean change in outlook, scale and P(doom) (log-odds), and the share of outlook changes above 0.1:

| Reader | Same answers again | Reworded | Shortened |
| --- | --- | --- | --- |
| Jev | 0.007, 0.005, 0.05; 0% | 0.019, 0.016, 0.24; 0% | 0.028, 0.014, 0.18; 5% |
| gpt-5.6-sol | 0.013, 0.020, 0.26; 0% | 0.024, 0.028, 0.38; 3% | 0.029, 0.023, 0.29; 10% |
| gpt-5.6-luna | 0.035, 0.039, 0.37; 7% | 0.036, 0.054, 0.41; 8% | 0.043, 0.059, 0.50; 15% |

The [evaluation protocol](../evaluation-protocol.md) limit for a same-meaning pair is 0.10.

## Next experiment: a targeted follow-up question

Both questions below ship in algorithm `0.7.3`: the split-outlook question in routing and the placement question on the result page ([assessment methodology](../ASSESSMENT.md#participant-facing-projections)). Measure them against interviews from before the release and interviews where they did not trigger.

The remaining map error is concentrated in two places a single question could address.

1. **A split reading, before results.** After the core map questions, suppose the latest outlook judgment gives its top level less than 0.6 and the runner-up is an adjacent level. Then ask one contrastive question that names the two readings, in place of an ordinary follow-up.
   - This fires for about 19% of results, whose readings sit 0.161 from people's guesses against 0.135 for the rest.
   - The existing direct question ("mostly good or mostly bad?") already shows the effect. Answering it mid-interview cut the distance by 0.036 (0.209 to 0.173, 71 people) and raised the top-level probability from 0.72 to 0.80. One more ordinary follow-up gains about half as much for unsure readings (0.018).
   - These are the most common adjacent splits, counting a runner-up of at least 0.25:

     | Split | Count | Proposed question |
     | --- | --- | --- |
     | Concerned and mixed | 108 | "Are you mainly worried about where AI is heading, or do the good and the bad feel roughly balanced?" |
     | Mixed and hopeful | 81 | "If you had to lean one way, do you expect AI to turn out more good than bad, or are you genuinely torn?" |
     | Hopeful and enthusiastic | 61 | "Do you think the upside will clearly outweigh the risks, or is it good on balance with real risks to manage?" |
     | Catastrophe and concerned | 39 | "Do you think catastrophe is the most likely outcome, or a serious risk among others?" |

   - Scale splits in 41% of results, most often between "substantially changes several sectors" and "restructures economies and everyday life" (181). A matching question: "Do you think AI will mostly change particular industries, or reshape how society works in general?"
2. **A gap at the reveal.** The guess and the reading differ by more than 0.25 on an axis for 27% of self-placements:
   - outlook in 15%, split evenly between reading more hopeful and more worried;
   - scale in 16%, mostly reading more change than people guessed.

   In those cases, offer one optional question about the difference, alongside the existing "both can be true" framing:

   | Where the reading differs | Proposed question |
   | --- | --- |
   | More worried than the guess | "You placed yourself as more hopeful than your answers read. What makes you hopeful that your answers didn't show?" |
   | More hopeful than the guess | "You placed yourself as more worried than your answers read. What worries you that we may have missed?" |
   | More change than the guess | "Your answers suggest bigger changes than you expect. What do you think will stay the same?" |

   The answer is appended like any continued answer and the result is projected again. This is also the first Socratic step: it surfaces a tension between self-image and expressed view without resolving it for the person.

Measure the distance from self-placement, the "Not quite" rate and a qualitative review of triggered interviews against comparable untriggered ones. Confirm there are no regressions on the [regression benchmark](../benchmark.md). For the reveal question, distance shrinks partly by construction, so weigh the ratings and review more heavily.
