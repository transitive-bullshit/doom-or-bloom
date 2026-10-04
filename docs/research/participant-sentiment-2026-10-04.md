# Participant sentiment with the 81k rubric — October 4, 2026

We scored every counted participant interview with the classification scheme Anthropic published for [What 81,000 people want from AI](https://www.anthropic.com/features/81k-interviews) (March 2026). The goals: check our outlook reading against an outside rubric, and compare our participants with Anthropic's Claude users. This is an internal analysis. Everything here is aggregate, as of October 4, 2026, and every count or share describes at least 10 people; smaller groups say "fewer than 10". The exact questions sent to Jev are in [participant-sentiment-taxonomy-2026-10-04.json](participant-sentiment-taxonomy-2026-10-04.json).

## Headlines

- **29.5% of our participants are net positive about AI** (5 or above on Anthropic's 1–7 scale; 95% interval 26.7–32.4%, n = 965). Anthropic reported 67% (n = 79,734 in its published chart data; see the note under the comparison table). The samples, questions and classifier model all differ: Anthropic's classifier was Claude, ours is Jev.
- **The rubric reproduces our outlook axis almost exactly** (Spearman 0.97 with the map's outlook position). Jev reads the same transcript for both, and the two constructs are close, so this agreement is not independent validation. Against participants' own pre-reveal guesses, sentiment and outlook do equally well (0.74 each), and sentiment adds nothing beyond the outlook.
- **Concerns differ in kind from the 81k.** Our most common are jobs and the economy (47%), loss of human autonomy (45%), existential risk (39%) and malicious use (31%). Concerns about AI products themselves (unreliability, sycophancy, overrestriction) are rare. Existential risk appears in 16% of opening answers, before any risk question, against 6.7% of Claude users in answer to a direct concerns question.
- **Hopes don't fit the 81k categories well.** Our interview asks about society, not a personal wish. 41% of primary hopes are societal transformation and 34% articulate none, against 9% and 1% in the 81k.
- **The launch waves differ sharply.** 20% of the Hacker News wave is net positive against 51% of the X wave.
- **The classifier is stable.** On a rerun of 50 people, 48 kept their sentiment level and all 50 stayed within one level; concern labels agreed 99% of the time.

## Method

- **Selection.** As in [BLOG.md](../BLOG.md#participant-data) and `scripts/blog-participant-data.ts`: one result per person (each owner's earliest assessment that reached a result, by the current version of that result), with no simulated users, forks or the owner's test account. Production was read with `default_transaction_read_only=on`. 965 people; 956 have a placed outlook. Median 4 accepted answers. All but fewer than 10 interviews open with "What do you think AI means for our future—and why?"; the rest open with a concrete-change question.
- **Inputs.** Each person's accepted answers with their prompts, in order. Answers in other languages were passed as written. A second request used the opening question and answer alone, for "raised before any follow-up" labels and a sentiment sensitivity check. From the database: the outlook coordinate x, scale y and outlook level reading, the shown P(doom) (typed or inferred), and the first self-placement guess (247 people, recorded since 0.7.0).
- **Model.** Jev `jev-1.13.0` through the TypeSafe API only, the processor the privacy policy names for answers. No answers went to any other provider. Transcripts and per-person labels stay in the git-ignored `work/sentiment-2026-10-04/`.
- **Spend.** 7.74 million input tokens, about **$0.33** at $42 per billion (cap $5): $0.28 for the main pass, $0.015 for the rerun and $0.03 for the opening-answer sentiment check.

### Sentiment rubric as sent

Anthropic's prompt asks for one integer from 1 to 7 over the full interview. Jev judges each Score level on its own and never sees level numbers or neighbouring levels, so we sent the anchors as an ordered seven-level Score. Levels 2–6 are Anthropic's text verbatim. Levels 1 and 7 ("Extremely negative." / "Extremely positive.") each carry one added clause so they are distinguishable from levels 2 and 6 when judged alone:

1. Extremely negative. Hostile to or alarmed about AI throughout; concerns dominate and essentially no real benefit is granted.
2. Negative: Concerns clearly dominate.
3. Lean negative: Overall more negative than positive, e.g. concerns weigh heavier.
4. Mixed/neutral: Genuinely in the middle—real benefits AND real concerns, roughly balanced, hard to find that this person leans towards one side or another, or they are simply neutral.
5. Lean positive: Overall more positive than negative.
6. Positive: Clearly enthusiastic. Concerns are minor, hypothetical, or mentioned only when directly asked.
7. Extremely positive. Unreservedly enthusiastic about AI throughout; essentially no concerns, even when asked.

The instructions: "Rate this person's overall sentiment toward AI based on the FULL interview in `interview`." Anthropic's three guidance lines follow, with numbers replaced by level names: "Note and weight what they emphasize and return to." / "Someone who lists benefits then pivots to a long passionate concern monologue is probably lean negative or mixed/neutral, not lean positive or positive." / "Most people have mixed feelings; don't default to the extremes. Use the full range."

A person's level is the Score's expected level, rounded. Net positive is 5 or above, as in the 81k. A seven-option Choice over the same anchors ran alongside as a check.

### Concerns and hopes as sent

- **Concerns.** One yes/no question (Noul) per category, with the 81k's 13 published definitions verbatim: "Does the participant express this `concern` about AI in `interview`?" Yes means "voices this as a worry, risk or harm they take seriously, now or in the future, in their own words", including treating it as a real possibility when asked directly. No means "does not raise it, mentions it only to dismiss it or call it unlikely or overblown, or only reports that other people worry about it." A label counts at 0.5 or more. An extra Noul asks whether the person expresses any concern at all; "no concern expressed" means that one is below 0.5.
- **Hopes.** One Choice over the 81k's nine visions (definitions verbatim) plus "none articulated": the person's primary positive vision, "the main thing they hope for or welcome AI doing, for themselves or for society". A separate Noul asks whether they express any hope or welcomed benefit at all.

## Results

### Sentiment

| Level                  | Whole interview        | Opening answer only    |
| ---------------------- | ---------------------- | ---------------------- |
| 1 Extremely negative   | 9.8%                   | 10.1%                  |
| 2 Negative             | 19.2%                  | 17.2%                  |
| 3 Lean negative        | 24.6%                  | 16.4%                  |
| 4 Mixed/neutral        | 16.9%                  | 27.4%                  |
| 5 Lean positive        | 16.4%                  | 13.7%                  |
| 6 Positive             | 10.5%                  | 9.9%                   |
| 7 Extremely positive   | 2.7%                   | 5.4%                   |
| **Net positive (5–7)** | **29.5% (26.7–32.4%)** | **29.0% (26.2–31.8%)** |
| Mean level             | 3.53                   | 3.69                   |

n = 965 in both columns. The opening answer comes before any question about impact, harms, control or P(doom).

- The net-positive share holds across readings: 30.4% by the Choice, 30.3% by the Score's most likely level, and 30.4% without the 73 people who gave fewer than three answers.
- The opening answer alone gives the same share. The whole interview moves people from the middle toward lean negative: 31% read at least one level lower over the whole interview, 20% at least one level higher, a mean shift of −0.16 levels. Our later risk questions do not create the low share; they sharpen mixed opening answers.

### Comparison with the 81k

|  | Doom or Bloom | 81k (Anthropic) |
| --- | --- | --- |
| Net positive | 29.5% (26.7–32.4%) | 66.9% |
| People | 965 participants since launch, one result each | 79,734 Claude.ai users, the global n in Anthropic's chart data for sentiment and concerns |
| How they arrived | Hacker News, X and later referrals to a site about AI doom or bloom | Opt-in invitation to all Claude.ai users, December 2025 |
| Questions | "What do you think AI means for our future—and why?", then adaptive follow-ups on impact, harms, control and P(doom) | Last use, a magic-wand wish, whether AI has helped, then ways AI could go against their values |
| Classifier | Jev 1.13, adapted rubric, LLM checks only | Claude, validated at 90% or more agreement with a human on 25 labels |

The 81k denominator is uncertain. Anthropic's chart data ([JSON](https://cdn.sanity.io/files/4zrzovbb/website/a9cde041d15765c23813279f5ccde115bd40f29a.json)) gives a global n of 79,734 beside the 66.9% sentiment and the concern shares. Its [appendix](https://cdn.sanity.io/files/4zrzovbb/website/99156863ed4a812569fe00a2adfb1c93f7e5a911.pdf) says interviews that never reached the concerns question were excluded from both analyses, and reports 9.7% of 80,508 as not reaching it, which would leave about 72,700. We cite Anthropic's published shares as they are; the gap changes no percentage reported here.

The gap is large, but these differences confound it. Anthropic's appendix itself expects its user sample to skew positive. Our audience came to a site framed around doom. The opening-answer check rules out one explanation, that our risk questions pull sentiment down, but not the others.

### Convergent validity

Spearman correlations with the sentiment level (expected value, 1–7), with bootstrap 95% intervals:

| Measure                             | n   | ρ                      |
| ----------------------------------- | --- | ---------------------- |
| Map outlook position x              | 956 | 0.97 (0.97–0.98)       |
| Outlook level reading (five levels) | 956 | 0.91 (0.89–0.92)       |
| Shown P(doom), typed or inferred    | 932 | −0.47 (−0.53 to −0.42) |
| Typed P(doom) only                  | 118 | −0.65 (−0.76 to −0.51) |
| Map scale y                         | 955 | −0.02 (−0.08 to 0.05)  |

Sentiment level by outlook level reading (counts; "<10" marks fewer than 10 people, including none):

| Outlook level       | n   | 1   | 2   | 3   | 4   | 5   | 6   | 7   | Mean |
| ------------------- | --- | --- | --- | --- | --- | --- | --- | --- | ---- |
| Catastrophe         | 63  | 46  | 13  | <10 | <10 | <10 | <10 | <10 | 1.43 |
| Mainly expects harm | 397 | 48  | 171 | 169 | <10 | <10 | <10 | <10 | 2.36 |
| Mixed               | 137 | <10 | <10 | 48  | 84  | <10 | <10 | <10 | 3.67 |
| Leans hopeful       | 242 | <10 | <10 | 15  | 66  | 132 | 29  | <10 | 4.71 |
| Enthusiastic        | 117 | <10 | <10 | <10 | <10 | 18  | 72  | 26  | 6.01 |

- **The two scales agree, and the rubric reads the middle more negatively.** At the mixed outlook level, 35% read lean negative and fewer than 10 people read lean positive. At leans hopeful, 27% read mixed/neutral and 6% lean negative. This follows the rubric's instruction to weight concerns: a balanced account that dwells on its worries scores below the middle. Within the mixed level the ordering still agrees: those read lean negative sit lower on the map (median x 0.38 against 0.49 for those read mixed/neutral).
- **Opposite-sign disagreements are rare.** 15 people (1.6%) read negative (1–3) while their outlook reads leans hopeful or enthusiastic. They sit at the middle of the axis (median x 0.49), one step apart on each scale. As a group, they open with benefits or call the overall effect positive, then spend the interview on concerns: jobs, skill loss, concentration of power, loss of control. The rubric weights what they dwell on; the outlook takes their stated balance.
- Fewer than 10 people read positive (5–7) while their outlook reads catastrophe or mainly harm, a group too small to describe further.
- **Shared method.** The outlook facet asks for "the participant's expressed leaning toward concern or hope about AI's future" ([ASSESSMENT.md](../ASSESSMENT.md)), from the same transcript and the same model. The 0.97 shows the outside rubric and our axis measure nearly the same thing when Jev reads both. It cannot show that Jev reads either correctly.
- **Against participants' own guesses** (247 self-placements made before the reveal): sentiment correlates 0.74 (0.65–0.81) with the guessed outlook, and the map's outlook 0.74 (0.65–0.82). In a rank regression, the outlook alone explains 55.1% of the guess, sentiment alone 54.1%, and both 55.4%.

### Concerns

| Concern | Whole interview (95% CI) | Opening answer | Of those raising it, share in the opening answer | 81k |
| --- | --- | --- | --- | --- |
| Jobs & economy | 46.9% (43.8–50.1) | 31.2% | 62% | 22.3% |
| Autonomy & agency | 45.4% (42.3–48.5) | 18.8% | 39% | 21.9% |
| Existential risk | 38.9% (35.8–42.0) | 16.2% (14.0–18.6) | 40% | 6.7% |
| Malicious use | 31.3% (28.4–34.3) | 10.7% | 29% | 13.0% |
| Governance | 23.7% (21.2–26.5) | 8.3% | 31% | 14.7% |
| Cognitive atrophy | 19.5% (17.1–22.1) | 10.4% | 52% | 16.3% |
| Meaning & creativity | 13.7% (11.7–16.0) | 8.5% | 57% | 11.7% |
| Misinformation | 12.5% (10.6–14.8) | 5.1% | 36% | 13.6% |
| Unreliability | 11.1% (9.3–13.2) | 4.2% | 35% | 26.7% |
| Surveillance & privacy | 10.8% (9.0–12.9) | 5.0% | 39% | 13.1% |
| Wellbeing & dependency | 9.0% (7.4–11.0) | 3.8% | 31% | 11.2% |
| Overrestriction | 1.9% (1.2–2.9) | <10 people | <10 people | 11.7% |
| Sycophancy | 1.8% (1.1–2.8) | <10 people | <10 people | 10.8% |

n = 965. The 81k column is Anthropic's published share (global n = 79,734 in its chart data) of people who answered "Are there any ways in which AI could be developed that would be contrary to your vision or what you value?"; Anthropic did not prompt any specific concern.

- **Concerns per person.** Ours averaged 2.66 of the 13 over the whole interview and 1.23 in the opening answer. Anthropic reports 2.3 distinct concerns per person, but its 13 headline shares sum to 1.9, so its count likely includes codes outside the 13.
- **No concern.** 5.9% expressed none at all (81k: 11.0%). Another 6.4% voiced a concern outside the 13. In the 30-person reading those were mostly environmental cost, an AI bubble or market crash, and distrust of the frontier labs. 12.3% had none of the 13; 31.3% raised no concern in the opening answer.
- **Existential risk, prompted and unprompted.** 16.2% raised it in the opening answer, under a neutral question; that is the closest comparison with the 81k's 6.7%. Asking directly raises it further. Among the 488 people asked a direct catastrophe or control question (extinction-level chance, unrecoverable harm, keeping control of smarter-than-human AI), 54.7% expressed it over the whole interview, against 22.6% of the 477 not asked. Their opening answers were similar beforehand: 17.2% against 15.1%. Routing chose those questions adaptively, so this is descriptive.
- Concerns about AI products are rare, presumably because our interview asks about society rather than personal use.

### Hopes

| Primary hope            | Doom or Bloom     | 81k   |
| ----------------------- | ----------------- | ----- |
| Societal transformation | 40.7% (37.7–43.9) | 9.4%  |
| None articulated        | 34.3% (31.4–37.4) | 1.1%  |
| Professional excellence | 14.6% (12.5–17.0) | 18.8% |
| Learning & growth       | 3.5% (2.5–4.9)    | 8.4%  |
| Time freedom            | 2.5% (1.7–3.7)    | 11.1% |
| Creative expression     | 1.6% (0.9–2.5)    | 5.6%  |
| Personal transformation | <10 people        | 13.7% |
| Life management         | <10 people        | 13.5% |
| Financial independence  | <10 people        | 9.7%  |
| Entrepreneurship        | <10 people        | 8.7%  |

- The 81k coded a personal magic-wand wish. We code the hope people volunteer about AI's future, so personal categories are nearly empty and societal transformation dominates.
- "Professional excellence" mostly captures people, many of them software engineers, who describe AI raising productivity in their own work.
- The separate presence question finds some hope or welcomed benefit in 76.2% of interviews. 10.7% of people chose "none articulated" on the Choice but have a hope on the Noul: the Choice treats a passing benefit as no primary vision.

### Launch waves

|  | Hacker News (Sep 25–26) | X (Sep 27–28) | Since Sep 29 |
| --- | --- | --- | --- |
| People | 655 | 263 | 47 |
| Net positive | 20.2% (17.3–23.4) | 50.6% (44.6–56.6) | 42.6% (29.5–56.7) |
| Mean sentiment level | 3.17 | 4.37 | 3.72 |
| Negative (1–3) | 63.4% | 30.4% | 46.8% |
| Existential risk, whole interview | 34.5% | 47.9% | 48.9% |
| Existential risk, opening answer | 15.0% | 17.9% | 23.4% |
| Jobs & economy | 53.3% | 31.9% | 42.6% |
| Autonomy & agency | 51.6% | 31.6% | 36.2% |
| Mean concerns | 2.96 | 2.02 | 2.17 |
| No concern at all | 3.5% | 11.8% | <10 people |
| Hope: societal transformation | 33.9% | 56.7% | 46.8% |
| Hope: none articulated | 39.5% | 20.2% | 40.4% |
| Hope: professional excellence | 17.6% | 8.0% | <10 people |

Waves are inferred from the UTC creation day, as in the existing aggregates. Net positive differs between Hacker News and X with Fisher p < 10⁻¹⁸; existential risk over the whole interview with p = 0.0002.

- **The sentiment gap tracks audience rather than interview version.** Within the X wave, the 52 people on the old interview (`0.6.1`, the same as the Hacker News wave) were 52% net positive, and the 211 on the new interview 50%.
- **The new interview's direct P(doom) question appears to raise existential-risk mentions.** 95% of new-interview X participants were asked it. 52% of them raised existential risk, against 33% of old-interview X participants and 34.5% of the Hacker News wave. In opening answers the waves are close: 15.0% and 17.9%.

### Classifier checks

These are LLM checks, not human validation.

- **Run-to-run.** A seeded random 50 were classified again. 96% kept their sentiment level and all stayed within one level; 96% kept their net-positive status. The mean change was 0.03 levels (largest 0.16). All kept their Choice level and primary hope. Concern labels agreed in 98.9% of decisions (κ 0.97; mean change 0.008 in probability), and opening-answer labels in 99.2%. 78% of people were identical on every label. Jev is near-deterministic, so the rerun mainly shows that labels near a threshold flip. 6.2% of concern decisions are within 0.1 of the threshold.
- **Score against Choice.** The same level for 84.7% of people, within one level for 99.8%, ρ = 0.98.
- **My reading of a stratified 30** (four per sentiment level, plus two at random), with transcripts beside labels:
  - Sentiment: 90% look right; the rest (fewer than 10) are one level off, each arguably, and none is off by two levels.
  - Concerns: mostly right, with fewer than 10 over-reads, typically triggered by figurative language or by an outcome mentioned as welcome rather than feared.
  - Hopes: fewer than 10 "none articulated" labels where the person named broad benefits, the Choice and Noul inconsistency above. Category assignments otherwise fit.
  - People who dismissed a risk as unlikely or unimportant were correctly left unlabelled.

## Limitations

- **The labels come from an LLM and are not validated by people.** The checks above are model reruns and one more LLM's reading; neither replaces human-coded labels.
- **One model reads both sides of the validity check.** That inflates the agreement with the outlook axis. A second model could not be used, because answers go only to Jev.
- **The rubric is adapted.** Score levels are judged one at a time, and the extremes carry added clauses. Anthropic's Claude saw the whole scale at once and returned one integer.
- **Samples, questions and procedures all differ from the 81k,** as set out above. No difference between the two studies can be attributed to any one of them.
- **The interview adapts.** Which follow-ups a person saw depends on their earlier answers, so comparisons by question asked are descriptive.
- **Waves are inferred from dates**, and the interview changed partway through the X wave.
- **Interviews are short** (median 4 answers). Anthropic dropped those who never reached its concerns question; we keep everyone with a result.
- **Non-English answers were passed as written.** Jev is English-first.
- **Self-placement covers 247 people**, those since 0.7.0.

## What this could support

- **A comparison of our participants with Claude users** on sentiment and concerns, carrying the caveats above. The opening-answer shares are the closest like-for-like figures, especially the 16% for existential risk against 6.7%.
- **Base rates for a "Your hopes and worries" result card.** The taxonomy JSON can be reused. In our interview, overrestriction and sycophancy almost never occur. Environmental cost, an AI bubble and distrust of AI companies fall outside the 13. A hope list built for a society-level interview would fit better than the 81k's personal visions. For a person-level card, the Noul probabilities are stable on reruns.
- **An outside anchor for the outlook axis.** Sentiment tracks the axis so closely that it adds little as a separate measure. It does give the axis a familiar reading ("net positive" ≈ the hopeful side). It also shows that the middle level absorbs accounts that dwell on concerns.
- **Independent validation, if wanted next,** needs human-coded labels on a sample. A second model cannot be used under the current processing rules.
