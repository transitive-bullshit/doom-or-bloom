# Anthropic Interviewer and prior art in AI-sentiment research (2026-10-04)

Read-only research spike. No product code changed, no paid calls, no participant answers sent anywhere. Our own numbers come from the committed aggregates in `content/blog/aggregates/participants.json` (as of 2026-10-03). Claims about other projects cite their primary sources; anything not verified is marked.

The full source catalogs (about 60 surveys with exact wording, the method and tool survey, the Anthropic deep dig, and the page texts) are in the git-ignored `work/research/anthropic-interviewer-2026-10-04/` of the main checkout. The owner-facing summary is the private artifact [Lessons from Anthropic Interviewer](https://claude.ai/artifact/DGB6oPKysUcJRegFBAEZXA).

Question: how does Anthropic's Interviewer work, what did its 81k study find, what other prior art matters, and what should Doom or Bloom change in its interview, results, analysis and articles as a result, within our cost and neutrality constraints?

## Recommendations

Ranked by value for effort. None is implemented; each needs the owner's decision unless marked otherwise.

| # | Change | Why (evidence below) | Cost | Status |
| --- | --- | --- | --- | --- |
| 1 | **Ask about the person, not only the future.** Add two authored prompts, routed once when answers stay abstract and replacing an ordinary follow-up: "How do you expect AI to affect your own work or livelihood?" and "If AI goes really well, what would be different in your own life?", plus an authored values probe ("Why does that matter to you?") | None of our 48 prompts asks about the participant's own work or life; only the two grounding prompts ask what shaped their view. Jobs worry was the strongest predictor of overall sentiment in the 81k study, and 64–79% of Americans worry about or expect AI job losses (Anthropic Public Record, Pew, Bentley-Gallup). Anthropic's depth came from laddering a concrete wish down to a value, and its participants' hopes came mostly from lived experience | Authored content and a routing rule; no extra Jev calls | Needs decision |
| 2 | **A "Your hopes and worries" result card.** One Jev multi-label call at result time tags the hopes and concerns a participant raised, with a taxonomy adapted from the 81k study (9 hopes, 13 concerns) plus our catastrophe category, marking whether each came up unprompted. Show chips with the share of participants who raised each (groups of 10+), and say so when someone expects both large benefits and serious harm | The 81k headline is that hope and alarm coexist within each person (2.3 concerns each). Our map nets them into one outlook. Surveys show catastrophe is rarely raised unprompted but widely endorsed when asked (6.7% of the 81k raised it; 9% of Britons named AI unprompted vs 17% from a list), so "raised it yourself" vs "agreed when asked" is a finding in itself. Makes our data comparable with the largest qualitative AI study | About one Jev call per result | Needs decision |
| 3 | **Keep the authored interviewer; don't move to an LLM-led one.** Record the reasoning in the architecture decisions | Cost isn't what rules it out: a Claude-led interview like Anthropic's would cost about 3–8 cents against our couple of cents (Jev runs about $0.003 per answer). The reasons are validity. AAPOR rates generated questions and flow as high risk. Anthropic's interviewer said "really interesting" in 61% of its public transcripts despite an "avoid sycophancy" rule. An AI interview measurably shifted and polarized answers in a 2026 experiment. And everyone, participants and simulated users alike, answering the same authored questions is what makes comparisons meaningful | None | Recommend keeping |
| 4 | **One verbatim benchmark question.** Ask Pew's tracker item ("more excited than concerned, more concerned than excited, or equally") as a skippable one-tap warm-up before the root question | Pew asks it of a probability sample (52% / 37% / 9% in June 2026; 37-country median 37% / 41% / 13%). Adaptive interviews give each person a different question order, so nothing we ask today compares cleanly with a poll. Asking it first keeps the interview from moving the answer (Austin et al.) and doubles as a warm-up, as Anthropic's interview opened with one. It also gives a self-report to set beside our outlook reading | No Jev calls; one tap of friction | Needs decision |
| 5 | **Make the 2024 AI researcher survey the `/p-doom` benchmark.** AI Impacts' ESPAI 2024 (published Sept 25, 2026; 1,580 researchers; median 10%, mean 18%, 52.7% at 10% or more) asks almost exactly our `risk.chance` question. The page cites only the 2023 wave | Fresh, authoritative, and the one outside number that lines up with ours word for word: participants who typed a number have a median of 12.5% (n = 117) | Minutes | Can do now |
| 6 | **A synthesis page: "Will AI end humanity? What the public, AI researchers and thought leaders say."** Public polls, researcher and forecaster surveys, sourced thought leaders and our own aggregates side by side, each with its exact wording | The "how many people think AI will…" question family autocompletes widely, and its results pages are news, Reddit and thin stats pages. Wording swings "worried about AI extinction" from 4% to 77%, so a page that shows the wording beside each number is genuinely useful. Avoid "AI survey" wording, which means survey tools and paid surveys | One post | Needs decision |
| 7 | **A methods page in the 81k appendix's mold**: the questions, excerpts of the Jev rubric, validation numbers, a per-question answer-quality table, sample skew (Hacker News and X waves), limitations and a corrections log. Say plainly that simulated users are prototypes, and that the 85% "Does this feel right? Yes" rate is an upper bound | Critics of the 81k study focused on undisclosed prompts, thin validation (90% agreement on 25 labels) and Claude grading answers about Claude. Pew's Sept 30, 2026 study of synthetic respondents will be cited against any simulated person. People confirm AI codings about 20% more often than independent coders do | Writing only | Can start now |
| 8 | **Cross-check our outlook reading against Anthropic's published sentiment rubric**, and curate the human gold set the evaluation protocol already specifies | Anthropic published its 1–7 sentiment prompt. Scoring our ~950 transcripts with it is an outside check on the outlook axis and gives a "net positive" share comparable with the 81k study's 67% | About $3 of inference; sends participant answers to a model | Needs OK to send answers |
| 9 | **Pilot a second interview as an add-on, not a new site.** If #1's work question draws rich answers, offer an optional "AI and your work" module after results that reuses the engine | A new interview needs its own rubric, projection, simulated answers and translations. #1 tests demand first at almost no cost | Later | Later |

Also: watch for Anthropic's public transcripts from the September study. An aggregate-only reading of a large outside sample would support comparison posts without headlining our own sample size.


## 1. Anthropic Interviewer

### The tool

Anthropic Interviewer is "a research tool, powered by Claude, that runs detailed conversational interviews at scale" ([about page](https://www.anthropic.com/about-anthropic-interviewer)). It works in three stages:

1. **Planning.** Researchers set the study's questions and goals; Claude drafts an interview guide (strategy plus question list), which researchers refine.
2. **Interviewing.** Claude holds a real-time conversation, adapting follow-ups to what the participant says, in the participant's own language.
3. **Analysis.** The tool synthesizes responses against the research plan, finds emergent themes and surfaces quotes, with researchers validating throughout.

Participants are told how responses will be used before they agree. Studies so far: a December 2025 test study of 1,250 professionals, the December 2025 global study published as "What 81,000 people want from AI" (2026-03-18), and the study now running (below).

### "What 81,000 people want from AI" (December 2025 interviews, published 2026-03-18)

Sources: [feature](https://www.anthropic.com/features/81k-interviews), [methods appendix PDF](https://cdn.sanity.io/files/4zrzovbb/website/99156863ed4a812569fe00a2adfb1c93f7e5a911.pdf).

**Sample.** Every Claude.ai account holder was invited for one week in December 2025. Anthropic received 112,846 interviews; 80,508 met a quality bar (spammy, unserious or extremely minimal ones removed; people who engaged earnestly and then dropped out were kept). 159 countries, 70 languages. Anthropic calls it the largest and most multilingual qualitative study ever conducted; the prior largest it found were the USC Shoah Foundation archive and the World Bank "Voices of the Poor", about 60,000 each. Regions: North America 29.5%, Western Europe 19.0%, East Asia 12.7%, Southern and Eastern Europe 11.7%, Latin America 10.1%, South Asia 5.7%, the rest under 4% each. Representativeness was checked against Claude.ai's own user base (usage mix, tier, region), not the public: the warm-up question's answers matched the Anthropic Economic Index (34% software development vs 36% of Claude.ai conversations).

**The interview.** Four core questions, each followed by adaptive probes "for the underlying values and experiences" (appendix):

1. What's the last thing you used an AI chatbot for? (warm-up, and a representativeness check)
2. If you could wave a magic wand, what would AI do for you?
3. Has AI ever taken a step towards that vision for you?
4. Are there ways AI might be developed that would be contrary to your vision or what you value?

The feature gives a concrete example of the probing: people who opened with productivity were asked what realizing the vision would enable, and "automate e-mails" became "spend more time with family".

**Analysis.** Transcripts went through "hand-validated Claude-powered classifiers", each extracting one dimension: primary vision (single label), realized experiences, concerns (multi-label), job domain and employment structure (72% volunteered job information), and overall sentiment. Some taxonomies, such as concerns, were first derived bottom-up by a clustering algorithm. Each classifier was validated at 90% or better agreement with a human on 25 labels. People who never reached a question were excluded from that question's analysis. The appendix publishes two classifier prompts in full. The sentiment prompt rates "overall sentiment toward AI on a 1-7 scale based on the FULL interview", with guidance to weight what people emphasize and return to, to treat a benefits-then-long-concern answer as 3-4, and not to default to extremes; net positive means 5 or higher.

**Response quality** (appendix): substantive answers were 97.6%, 92.5% and 88.1% for the three main questions; refusals about 1%; "not reached" (dropped off) 0.9%, 6.3% and 9.7%. Anthropic attributes the high quality partly to the conversational format and partly to novelty, and notes unusual candor (grief, mental health, money) because "there's little social cost to vulnerability" with an AI interviewer, which can also make people more hostile or dismissive.

**Findings.**

- Visions (single label): professional excellence 18.8%, personal transformation 13.7%, life management 13.5%, time freedom 11.1%, financial independence 9.7%, societal transformation 9.4%, entrepreneurship 8.7%, learning and growth 8.4%, creative expression 5.6%; 1% gave none.
- 81% said AI had already taken a step toward their vision. Realized: productivity 32.0%, "AI hasn't delivered" 18.9%, cognitive partnership 17.2%, learning 9.9%, technical accessibility 8.7%, research synthesis 7.2%, emotional support 6.1%.
- Concerns (multi-label, 2.3 per person on average; 11% voiced none): unreliability 26.7%, jobs and economy 22.3%, autonomy and agency 21.9%, cognitive atrophy 16.3%, governance 14.7%, misinformation 13.6%, surveillance and privacy 13.1%, malicious use 13.0%, meaning and creativity 11.7%, overrestriction 11.7%, wellbeing and dependency 11.2%, sycophancy 10.8%, existential risk 6.7%. Long tail: bias 5%, IP and data rights 4%, environment 4%, harm to children 3%, democracy 3%, geopolitics 2%.
- Concern about jobs and the economy was "the strongest predictor of overall AI sentiment".
- 67% of interviewees expressed net positive sentiment (5+ of 7). (A March 19 correction changed "67% of people view AI positively" to this wording.) No country fell below 60%. Lower- and middle-income regions were more positive; Sub-Saharan Africa, Central Asia and South Asia were about twice as likely as North America, Oceania and Western Europe to name no concern (17-18% vs 8-9%).
- **"Light and shade."** Hope and alarm "didn't divide people into camps, so much as coexist as tensions within each person". Across five benefit/harm pairs (learning vs cognitive atrophy, better decisions vs unreliability, emotional support vs dependence, time saving vs illusory productivity, economic empowerment vs displacement), raising one side made raising the other 1.6-3.0 times more likely (emotional support and dependence: 3.0x; average phi +0.25).
- **Experienced vs anticipated.** Each mention was coded as lived experience or anticipation. Benefits were mostly lived, harms mostly anticipated (e.g. 91% of people citing learning benefits had realized them; 46% of those worried about cognitive atrophy had seen it). The benefit/harm link was more than twice as strong among people speaking from experience (phi +0.20 vs +0.07): "tensions are discovered through use".
- Regional and occupational texture: educators were 2.5-3x more likely than average to report cognitive atrophy firsthand; independent workers reported real economic gains at more than three times the rate of institutional employees (47% vs 14%); North America and Oceania stressed governance, Western Europe surveillance, East Asia cognitive atrophy and meaning.

**Limitations Anthropic names:** Claude.ai users who opted in skew toward people who found AI valuable; the interview asks for hopes before concerns, which can prime and inflate co-occurrence; dropout and less elaboration later in the interview; job categories inferred from self-description; label ambiguity.

**Presentation.** A long scrollytelling feature (a dot per four respondents, slope charts by region, paired bar charts for each tension), a filterable Quote Wall (by region, concern, vision; quotes attributed to occupation and country), the PDF appendix with prompts and limitations, a dated correction, and a BibTeX citation. Responses were de-identified before a small research team read them, and published quotes had a further manual review.

### "What do you want from AI?" (running 2026-09-29 to 2026-10-06)

Source: [announcement and FAQ](https://www.anthropic.com/research/your-thoughts-on-ai).

- Open to Free, Pro and Max users of Claude and Claude Code whose accounts are at least two weeks old. About 15 minutes.
- Three big questions: the most meaningful positive and negative experiences with AI; what about how the world works (work, school, healthcare, government) people would like AI to help change; and what people want from the companies developing AI, Anthropic included.
- **New: optional public release.** After finishing, a participant can publish the complete, unedited interview with only their country attached. The flow explains the risks before the interview, shows examples of information not to share during it, lets the participant reread everything, reminds them of benefits and risks, and confirms once more. Anthropic warns that details like age, job or city can re-identify someone and cites a paper showing this works on Interviewer transcripts ([arXiv 2602.16800](https://arxiv.org/abs/2602.16800)). Public interviews will be published after the study and initial analysis; non-public ones are still analyzed.
- Rationale: "For the previous study, only the high-level results and a small number of quotes were made public." Public transcripts let anyone "check whether our published findings actually reflect what participants said".
- The 81k study "shaped the Anthropic Institute's agenda", was presented at the World Economic Forum, and feeds Anthropic's Societal Impacts and Economics research.

### Script, dataset and other studies

- **The interview script.** A system prompt titled "Anthropic Interviewer" in a public prompt-leak repository ([GitHub](https://github.com/sachin7x/system_prompts_leaks/blob/93c99911/Anthropic/anthropic-interviewer.md)) is unofficial, but its opening message matches the screenshot Anthropic published word for word, its four questions match the appendix, and its "we are about halfway through" signpost appears in the public transcripts. In paraphrase, it casts the model as a neutral "host and student" in discovery mode, asks one question per message, forbids leading and yes/no questions, says to stay "neutral but warm (i.e. avoid sycophancy)", allows at most two follow-ups per question, probes a narrow wish toward "the larger hope or vision", ends trolling after three redirects, and closes with a reflective summary. The participant UI is a text chat in a modal over claude.ai, with no progress bar.
- **The 1,250-professional study** ([post](https://www.anthropic.com/research/anthropic-interviewer), December 2025) recruited crowdworkers with other main jobs (1,000 general workforce, 125 creatives, 125 scientists) for 10–15 minute interviews, and released all transcripts on [Hugging Face](https://huggingface.co/datasets/Anthropic/AnthropicInterviewer): two columns (`transcript_id`, `text`), three splits; the card says CC-BY for data while the metadata tag says MIT. In those transcripts the median interview has 11 participant turns (10th–90th percentile 9–14) and about 690 participant words; "really interesting" appears 888 times across 61% of transcripts. A post-interview survey found 97.6% rated satisfaction 5+ of 7.
- **Re-identification.** Tianshi Li linked 6 of 24 scientist transcripts that mentioned published work to specific papers for under $0.50 each ([arXiv 2601.05918](https://arxiv.org/abs/2601.05918)); Anthropic replied that participants had consented to raw release and that redaction was "a courtesy, not a privacy safeguard". Lermen et al., with an Anthropic co-author, identified 9 of 33 at 82% precision ([arXiv 2602.16800](https://arxiv.org/abs/2602.16800)).
- **Quote Wall.** 620 quotes, grouped by region, vision, experience or concern, searchable, credited as "Occupation, Country"; each group's featured quote is the most "memorable" (a model score) of its six shortest.
- **Other studies on the same tool.** A monthly Anthropic Economic Index Survey has run inside Interviewer since April 2026, mixing banded multiple-choice items (share of tasks AI can do, likelihood of job loss) with open questions ([announcement](https://www.anthropic.com/research/economic-index-survey-announcement)): a hybrid of fixed choices and open text, like ours. A re-analysis of the 81k transcripts for economics reworked a productivity scale that had a ceiling effect ([81k economics](https://www.anthropic.com/research/81k-economics)). A wellbeing study was announced; no results found.
- **Anthropic Public Record** (YouGov, not Interviewer): 51,993 US residents, weighted, November–December 2025. 64% worry about job loss; 27% worry AI will "go rogue and end civilization", the lowest of 20 fears listed; 15% trust AI companies to make decisions about AI ([Anthropic](https://www.anthropic.com/news/anthropic-public-record)).

### Criticism

- **Circularity.** Claude wrote the guide, ran the interviews, coded them and picked the quotes; critics call it a study of Claude enthusiasts run by Claude ([Hayes](https://www.linkedin.com/posts/joshua-hayes-83887923_anthropic-just-claimed-the-largest-qualitative-activity-7440547501448900608-LoHW), [Ottenheimer](https://www.flyingpenguin.com/anthropic-says-claude-scores-itself-best-claude/)).
- **Question order.** Hopes, then progress toward them, then concerns; Anthropic itself names the priming risk.
- **"Don't quant the qual."** Classifiers that both define categories and count them, reported as population percentages ([Carl Pearson](https://carljpearson.com/ai-moderated-interviews-methodological-error-amplified/)). Qualitative researchers say an AI interviewer yields "data, not meaning" ([The Conversation](https://theconversation.com/ai-interviewers-cant-connect-with-people-the-way-human-researchers-can-they-can-produce-only-data-not-meaning-279437)); market researchers call it an "interview-shaped quantitative survey" ([Cascade Insights](https://www.cascadeinsights.com/a-market-researchers-review-anthropic-interviewer-claude-interviewer/)).
- **Sycophancy.** A competing vendor's audit of the 1,250 transcripts complained of constant praise and dropped threads (commercial conflict of interest, but the phrase counts above support it).
- **Thin validation.** 90% agreement with one human on 25 labels per classifier; no external review.

### What participants get

Nothing personal in the 81k study beyond the interviewer's closing recap and a later email with published findings. The value exchange is being heard and contributing; the 1,250 study's satisfaction ratings suggest that alone is rewarding.

## 2. Side by side

| | Anthropic Interviewer (81k) | Doom or Bloom |
| --- | --- | --- |
| Question | What do you want from AI, and what do you fear? (personal, experiential) | What does AI mean for our future, and why? (societal, predictive) |
| Format | Claude-led conversation, 4 core questions plus free probes, ~15 min | 1 fixed root plus authored adaptive prompts chosen by code, 12-prompt cap, ~3 min |
| Follow-ups | Generated per answer, steered by an interview guide | Authored families; Jev judges answers against authored choices |
| Who | 80,508 Claude.ai users, 159 countries, 70 languages | 953 placed results as of Oct 3, mostly a Hacker News wave and an X wave, 10 languages since Oct 2 |
| Answer depth | Rich (quotes run to paragraphs) | Median 21-24 words per answer, median 4 answers |
| Analysis | After the fact: classifiers over whole transcripts, taxonomies from clustering | Live: per-answer judgments feed a map, P(doom) and closest thought leaders |
| What people get back | Nothing personal; contribution to research | A personal map, P(doom), findings, comparison with ~180 simulated thought leaders, a share card |
| Openness | 81k: aggregates and selected quotes. Now: opt-in full public transcripts | Opt-in publication of the full frozen conversation; blog aggregates with k >= 10 |
| Headline sentiment | 67% net positive (1-7 sentiment of 5+) | 33.5% bloom side, 16.7% middle, 49.8% doom side of the outlook axis (a different measure; see section 5) |

## 3. Prior art: public and expert opinion surveys

About 60 surveys were catalogued; the ones below are those a Doom or Bloom article or comparison would lean on. Prefer probability panels (Pew ATP, Gallup Panel, AP-NORC AmeriSpeak, Ipsos KnowledgePanel) for headline public numbers, and name the sponsor and fielding firm for advocacy polls (AIPI, FLI and others).

**Public mood is net negative and worsening.** Pew's "more concerned than excited" rose from 37% (2021) to 52% (June 22–28, 2026, n = 3,488; 37% equally, 9% more excited) ([Pew](https://www.pewresearch.org/short-reads/2026/09/16/democrats-are-now-more-worried-than-republicans-about-ai-and-its-impact-on-jobs/)). Across 37 countries the median is 37% more concerned and 41% equally ([Pew global](https://www.pewresearch.org/global/2026/09/17/globally-more-people-expect-ai-to-cause-job-loss-than-growth/)); Israel is the only country where excitement leads. Bentley-Gallup's "more harm than good" went from 31% to 39% in a year (May 2026) ([Gallup](https://news.gallup.com/poll/712751/americans-cool-toward.aspx)). Democrats are now more concerned than Republicans (56% vs 49%), and a majority of under-30s are more concerned than excited for the first time.

**Experts vs the public.** 56% of AI experts vs 17% of US adults expect a positive impact on the US over 20 years ([Pew, April 2025](https://www.pewresearch.org/internet/2025/04/03/how-the-us-public-and-ai-experts-view-artificial-intelligence/)). On catastrophe the order flips: FRI's LEAP panel (2026) puts an AI catastrophe killing over 10% of people by 2100 at 5% for experts, 2.4% for superforecasters and 7% for the US public ([LEAP Wave 9](https://leap.forecastingresearch.org/reports/wave9)).

**AI researchers on extinction.** ESPAI 2024 (fielded December 2024, published September 2026; 1,580 authors at six top venues, 10% response rate): median 10%, mean 18%, 52.7% at 10% or more for "human extinction or similarly permanent and severe disempowerment", the first edition with a 10% median ([PDF](https://aiimpacts.org/wp-content/uploads/2026/09/ESPAI2024.pdf)). ESPAI 2023: median 5%. The Existential Risk Persuasion Tournament (2022): AI-caused extinction by 2100 at 3% for domain experts vs 0.38% for superforecasters ([FRI](https://forecastingresearch.org/pdf/existential-risk-persuasion-tournament.pdf)).

**A September 2026 spike.** YouGov's "end of the human race" concern reached 50%, its series high; Quinnipiac found 73% concerned future AI could threaten human survival; 30% said AI companies should stop until safety is evaluated and another 47% that they should slow down. Doom or Bloom launched on September 25, inside this news cycle, so date-stamp every comparison.

**Wording and format dominate.** The share "worried about AI extinction" ranges from about 4% (single most likely extinction cause) to 77% ("threat to humanity") across US polls. The same college-graduate sample gave AI extinction by 2100 a 2% median in a text box and 1 in 30 million on a "1-in-X" scale with reference events. Concern items run far above likelihood items (YouGov GB, September 2026: 66% say AI could end civilization, 23% think it likely). Unprompted, 9% of Britons named AI as an extinction risk; from a list, 17%. Explicit middle options absorb 37–57% of respondents; Doom or Bloom's middle holds 16.7%.

**Samples.** Self-selected samples differ systematically, and not always toward worry: a Prolific sample perceived lower AI risk than a representative Ipsos sample on the same items ([AIMS 2024](https://www.sentienceinstitute.org/aims-survey-2024)), while an audience at a talk on *If Anyone Builds It, Everyone Dies* started at a 50% median. Our own Hacker News and X waves differed by 0.36 on the outlook axis. AAPOR's rule: a margin of sampling error applies only to probability samples; report bootstrap intervals as within-sample uncertainty only.

## 4. Prior art: methods, deliberation platforms and interactive tools

### AI-led interviews and LLM coding

- **AAPOR task force, May 2026** ([PDF](https://aapor.org/wp-content/uploads/2026/05/Responsible-AI-Integration-In-Survey-Research.pdf)): risk is "relatively low" when AI is limited to modality switching, moderate with translation or paraphrase, and "high when they are authorized to generate new questions, alter question wording, or influence survey logic and flow". Doom or Bloom's design (authored questions, code routing, an LLM that only classifies) sits at the low end; our translated questions are the moderate part.
- **Barari et al. (NORC), Survey Research Methods 2026** ([arXiv 2504.13908](https://arxiv.org/abs/2504.13908)): 1,800 panelists; an LLM live-coded open answers into categories and asked respondents to confirm. Precision judged by human coders was "on average, 20% lower" than respondents' confirmations, and respondents chose "None of the above" under 5% of the time though coders used it 10–40%. Confirmation probing doubled dropout. The closest published analogue to our design; it means a "Does this feel right?" Yes rate overstates accuracy.
- **Austin et al., Public Opinion Quarterly, August 2026** ([POQ](https://academic.oup.com/poq/advance-article/doi/10.1093/poq/nfag063/8762750)): 2,243 respondents in five randomized arms. AI-led semi-structured interviews drew 57–70 more words and more reasons than fixed follow-ups, with no satisfaction penalty, but when the AI interview came after a closed question it shifted and polarized later closed answers. The interview can move what it measures.
- **Geiecke & Jaravel (LSE), Chopra & Haaland, Xiao et al. (TOCHI 2020)**: AI interviewers are rated well by respondents and elicit more self-disclosure than forms (people see them as non-judgmental); most of the gain over plain open text comes from probing what the respondent already said. Cuevas et al. (PACM HCI 2025) found generic LLM follow-ups rarely capture specific motives or personal examples.
- **Pasted answers.** 34% of online-panel respondents report using an LLM to answer open-ended questions, and those answers are more homogeneous and positive (Zhang, Xu & Alvero, Sociological Methods & Research 2025).
- **Simulated people.** Pew's Sept 30, 2026 study found synthetic respondents missed real answers by 12 points on average across nearly 300 questions and chose "not sure" four times less often ([Pew](https://www.pewresearch.org/data-labs/2026/09/30/can-ai-stand-in-for-human-survey-takers-not-really/)). Interview-based digital twins (Park et al. 2024) do better than demographic prompts, but personas built from public text lean on group stereotypes. Expect this critique of our simulated users; label them as prototypes and validate them against held-out public statements.

### Public input on AI

| Project | Scale and method | Lesson |
| --- | --- | --- |
| [Polis](https://compdemocracy.org/opinion-groups/) and Anthropic + CIP [Collective Constitutional AI](https://www.anthropic.com/research/collective-constitutional-ai-aligning-a-language-model-with-public-input) (2023) | ~1,000 Americans voting on statements; opinion clusters plus cross-group consensus | Pair "where you sit" with "what different camps agree on" |
| CIP [Global Dialogues](https://globaldialogues.ai/) (2025–2026) | about 1,000 recruited people per round across about 70 countries, open data | Print a representativeness note with every round; keep a fixed core for trends |
| AI Objectives Institute [Talk to the City](https://ai.objectives.institute/talk-to-the-city) | LLM summaries of open text, each claim linked to the person's words | Tie every interpretation back to the participant's own answer |
| DeepMind [Habermas Machine](https://www.science.org/doi/10.1126/science.adq2852) (Science 2024) | LLM drafts group statements; people critique and it revises | A "this is wrong" control yields both a better result and an error rate |
| MIT [Moral Machine](https://www.nature.com/articles/s41586-018-0637-6) (Nature 2018) | ~40M decisions from ~4M people in 233 countries, 10 languages | The closest analogue for virality: a playful personal result plus a published global dataset; its forced choices later proved to overstate preferences |
| [The Hall of AI Fears and Hopes](https://arxiv.org/abs/2504.06016) (2025) | 330 census-stratified Americans rated fear and hope separately and were placed among TIME's 100 AI influencers | The closest academic analogue to Doom or Bloom. Headline: the public fears loss of control, while influencers emphasize regulation |
| Vael Gates, [AI Risk Discussions](https://www.lesswrong.com/posts/g4nEtPFECTQW9tcff/ai-risk-discussions-website-exploring-interviews-from-97-ai) (2022) | 97 interviews with ML researchers (2022), published transcripts and an interactive argument walkthrough | Researchers' reactions to risk arguments; the site went dark when its host organization closed, so keep pages static and archivable |

### Interactive "what's your AI view" tools

No other public tool found starts from free text and adapts its questions. Competitors are multiple choice, sliders or static lists:

- **Bloomberg Opinion, "What's Your AI-dentity?"** (October 2025): multiple choice; one of six types (Doomer, Pragmatist, Accelerationist, …), how your answers drove the result, and real-life "fellow travelers". The closest mainstream match; English only, no published aggregates found.
- **Reid Hoffman's Superagency quiz** (February 2025): Doomer, Gloomer, Zoomer or Bloomer.
- **P(doom) calculators** (neoneye, Calcuja, Fleeson, Veksler, and others): sliders that multiply stages into a number. The one that publishes its data logged 365 submissions in a year; defaults anchor answers.
- **P(doom) lists** (PauseAI, AGI Strategies, Doom Debates' scoreboard): expert numbers, no visitor input, mostly run by advocacy groups.
- **Knowledge quizzes** (Pew's AI-in-daily-life quiz, ClearerThinking, Stanford HAI): a score against the public.
- **Format analogues with known scale**: Pew's Political Typology quiz (1.5M+), Vote Compass (1.2M+ in Australia 2025 via broadcasters), Wahl-O-Mat (21.5M uses in 2025), 16Personalities. What spreads: a named identity, a "compare with everyone" view, group links, and tie-ins to big moments.

## 5. Comparable numbers

| Group | Question | Number | Frame |
| --- | --- | --- | --- |
| Doom or Bloom, typed P(doom) | `risk.chance`: "gut-feel chance that AI causes human extinction or a similarly permanent catastrophe" | Median 12.5%, mean 23.6%, 61.5% at 10%+ | 117 people who typed a number, of a self-selected sample; 84% round numbers |
| Doom or Bloom, inferred P(doom) | Read from the whole interview | Median 5.6%, 35.4% at 10%+ | n = 813; an interpretation, never pooled with typed values |
| AI researchers, ESPAI 2024 | "human extinction or similarly permanent and severe disempowerment" (no horizon) | Median 10%, mean 18%, 52.7% at 10%+ | 1,580 authors, 10% response rate |
| US public, Rethink Priorities 2023 | Chance AI causes extinction by 2100 | Median 15%, mean 26% | 2,407 via Prolific, modeled to the US |
| US public, LEAP 2026 | AI catastrophe killing over 10% of people by 2100 | Median 7% (experts 5%, superforecasters 2.4%) | 612, reweighted |
| Anthropic Public Record | Worried AI will "go rogue and end civilization" | 27% | 51,993 US residents, YouGov, weighted |
| Claude users, 81k | Raised existential risk unprompted | 6.7% | 80,508 Claude.ai users |
| Doom or Bloom outlook | Map position | 49.8% doom side, 16.7% middle, 33.5% bloom side | n = 953 |
| Claude users, 81k | Overall sentiment toward AI, 5+ of 7 | 67% net positive | n = 79,734 |
| US public, Pew June 2026 | Feelings about AI in daily life | 52% more concerned, 37% equally, 9% more excited | 3,488, probability panel |
| AI experts, Pew 2024 | Same item | 15% more concerned, 47% more excited | 1,013, opt-in, unweighted |

Two reads. Typed P(doom) on almost the same wording sits slightly above AI researchers' (12.5% vs 10%), but the typed group is self-selected twice. On mood, the ratio of negative to positive is about 1.5 to 1 for our participants, 5.8 to 1 for the US public and 1 to 3 for AI experts: our participants sit between the public and the experts, and far below Claude users' positivity.

## 6. Articles and SEO

This pass extends the [October 2 keyword study](seo-keywords-2026-10-02.md) to poll and public-opinion queries. Method on 2026-10-04: Google autocomplete for about 110 seed phrases (cross-checked on Bing and DuckDuckGo), Google Trends anchored as in the October 2 study ("will ai take over the world" = W = 1), and logged-out results pages for 10 queries. Treat demand as order-of-magnitude: September's extinction-risk news inflated everything in this area.

| Query family | Signal | Who ranks | Verdict |
| --- | --- | --- | --- |
| "how many people think AI will take over the world / end humanity", "what percent of people think AI is dangerous / bad", "do most people hate AI", "chance of AI extinction" | Broad autocomplete question family; "ai extinction" about 1.2 W and rising | September news, Reddit, YouTube, statistics-aggregator pages; nothing synthesizes polls, researchers and named people | **Best opening.** Recommendation 7 |
| "p doom survey", "what is the current p doom" | Small; People also ask | Wikipedia, PauseAI, Calcuja (a compilation, not a survey), Reddit | Fold into `/p-doom` (recommendation 6) rather than a new post |
| "ai experts vs public opinion" | Weak | Pew's April 2025 report holds #1 | Not winnable head-on; use as a source and a section |
| "public opinion on ai", "ai approval rating" | Small | Gallup, Pew, Stanford AI Index, POLITICO | Not winnable |
| "ai survey(s)" | About 8.5 W, but the intent is survey tools and paid surveys | Vendors | **Avoid this wording** |
| "anthropic 81k interviews", "what 81000 people want from ai" | Recognized in autocomplete; volume rounds to 0 | Anthropic owns page one | Not worth chasing for traffic |
| "ai doomers vs accelerationists" | Autocomplete present | Forbes, NPR's Sept 26, 2026 guide to AI-safety factions, Reddit | Merge into the planned doomers/gloomers/zoomers/bloomers post |

Fresh citable numbers for these pieces: AI Impacts' 2024 researcher survey (published Sept 25, 2026: 1,580 respondents, 10% response rate, mean 18% for "human extinction or similarly permanent and severe disempowerment", over half at 10% or more; [AI Impacts](https://blog.aiimpacts.org/p/what-did-ai-researchers-think-at)); Survey 160's small public P(doom) poll (February 2025, mean 35.6, median 20, ±9.8 points; [Survey 160](https://www.survey160.com/methodological-research-blog/the-publics-concerns-about-ai-and-probability-of-doom)); NBC News (February–March 2026, 1,000 registered voters: 57% say risks outweigh benefits; [NBC](https://www.nbcnews.com/politics/politics-news/poll-majority-voters-say-risks-ai-outweigh-benefits-rcna262196)).

Hold a post arguing for or against simulated people as survey stand-ins; it would undercut the product while the simulated users are still being validated. Put that substance on the methods page instead.

## 7. More than one interview

Anthropic runs several studies on one tool: professionals at work, what people want from AI, wellbeing, a monthly economics survey, and now experiences with AI. Each reuses the interviewer and the classifier pipeline, and each has its own guide and taxonomy.

For Doom or Bloom, a second interview is more expensive than it looks, because the per-interview pieces are authored: a rubric, a projection and result views, answers from ~180 simulated users so people have someone to compare with, translations into 10 languages, and evaluation. Candidates, in order:

1. **AI and your work.** Job loss is among the most widely shared worries in every major poll (64–79% of Americans) and was the best predictor of overall sentiment in the 81k study. A result could place people on "how exposed is my work" against "how I feel about it", compared with occupations rather than thought leaders.
2. **What do you want from AI?** Anthropic's own question. It overlaps their study directly; ours would add a personal result.
3. **What should we do about AI?** The action-posture dimension already modeled internally (pace, safeguards, regulation, access). Policy questions risk reading as an ideological sorting test, which the product contract rules out.

The cheapest path is recommendation 1: add the work question to the existing pool, measure how people answer it, and only then build an optional post-results module that reuses the same assessment, budget and engine. Group links (a class or team sees its aggregate once 10 people finish) are a separate scale lever, already deferred on October 1.
