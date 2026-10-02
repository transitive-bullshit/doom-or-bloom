# Doom or Bloom search keyword study

Research date: 2 October 2026. Scope: which queries doom-or-bloom.com should target, how to title pages, and how to win name + topic searches for the 169 profiles, without giving up the home page's neutrality. The raw signals (autocomplete dumps, Trends comparisons, Ahrefs buckets, results-page notes and Wikipedia pageviews for all simulated users) were kept outside the repository.

## Decisions (October 2, 2026)

- **Adopted:**
  - Home title "How will AI change our future? Take the 3-minute quiz", with the recommended description.
  - `/p-doom` title "What is P(doom)? Estimates from Hinton, Musk, LeCun and more".
  - A `/users` title without a catalog count.
  - The profile JSON-LD changes.
- **Profile titles (decided October 2, built October 3):** titles from what people search for each person, phrased as a plain list ("Geoffrey Hinton on AI safety, risk and P(doom)") rather than after a colon, with positive and neutral topics such as jobs, regulation and the future where people search them; otherwise by map position; otherwise "<Name> on AI". The rule is in [SEO.md](../SEO.md#profile-titles). On profiles with sourced statements, the simulated answers start collapsed.
  - The October 3 autocomplete run for the 42 priority profiles (Google, Bing and DuckDuckGo; "<name> ai" and "<name> on ai", each with a–z) found strong evidence for these positive or neutral topics: jobs for 16 people, the AI bubble for 15, the future of AI for 14, regulation and AGI for 9 each, consciousness for 6, ethics, policy and superintelligence for 3 each, healthcare for Gates and education for Cowen. They fill the places P(doom), safety and risk leave, for example "Marc Andreessen on AI regulation and jobs", "Andrew Ng on the AI bubble and jobs", "Donald Trump on AI risk, regulation and policy" and "Timnit Gebru on AI safety and ethics". Andreessen's most searched AI pages are his own essays ("why AI will save the world", the techno-optimist manifesto), which name a stance rather than a topic, so optimism is not in the vocabulary.
- **Not now:** a separate `/ai-risk` hub. Internal links from `/p-doom`, `/users` and profiles come first.
- **Follow-up post:** comparing political leaders (Trump, Obama, Sanders and others) for a non-technical audience.

## Summary

- **The best opportunity is name + topic searches, not head terms.**
  - Google's first suggestion for "<name> p d" is "<name> p doom" for 17 catalog names: Musk, Altman, Amodei, Huang, Hassabis, Hinton, Sutskever, Karpathy, LeCun, Yudkowsky, Bengio, Tegmark, Marcus, Dwarkesh Patel, Scott Alexander, Kokotajlo and Russell.
  - Among the 40 priority names, "<name> ai safety" completes for 22, "ai risk" for 15, "ai warning" for 14 and "on ai" for 33.
  - These results pages are thin: across 20 person + topic searches, 42% of page-one results are social posts, forum threads or small blogs.
- **P(doom) is mainstream right now, but it's still small.**
  - September events drove a spike: Jacob Coxon's resignation thread (8–9 Sep), Evan Hubinger's ">10% within the next decade", and Anthropic's leaked IPO filing (29 Sep).
  - Wikipedia views of P(doom) went from about 5,700 a month (Jan–Aug) to 43,736 in September.
  - In Google Trends, "p doom" plus "p(doom)" still averages only about 4% of "future of ai" over 12 months.
- **Don't put P(doom) in the home title.** Give it its own landing page (`/p-doom`, a 404 in production today) and mention it once in the home description.
- **The current home title wording has no measurable search demand.** "How will AI change our future" and "ai worldview" both read 0 in Trends. Keep the question as the headline, but replace "Map your AI worldview" with quiz or test wording.
- **Head terms aren't winnable for this site.** "ai safety", "risks of ai", "future of ai" and "will ai take over the world" have news, jobs or institutional intent and incumbents. Reach them through an editorial explainer and a hub.
- **Profile JSON-LD uses `ProfilePage`.** Google reserves that type for people affiliated with the site, so switch to `WebPage` with `about` and `mainEntity` set to the `Person`.

## Relative demand

Chained through 12-month exact-phrase worldwide Google Trends averages, with "will ai take over the world" as W = 1. Ahrefs buckets are US monthly estimates.

| Phrase | Relative to W | Ahrefs US bucket |
| --- | --- | --- |
| "ai safety" (mostly news and jobs intent) | about 38 | >1000 |
| "future of ai" | 9.6 | >1000, Hard |
| "political compass test" (format analog) | 9.2 | n/a |
| "ai 2027" | 5.3 | >100 |
| "ai risks" / "risks of ai" / "dangers of ai" | 5 / 2 / 1 | >100 / >100 / >1000 |
| "will ai take over the world" | 1 | >1000, Hard |
| "e/acc" | 0.8 (peaked Nov 2023) | n/a |
| "p doom" + "p(doom)" | 0.39 (0.2 in the US) | >100, Easy |
| "ai doomer" | 0.06 | >100, Easy |
| "will ai destroy humanity" | 0.06 | >100, Hard |
| "how will ai change our future", "ai worldview", "ai personality test" | 0 | n/a |

## Ranked keyword map

| # | Query and variants | Demand signal | Competition | Best page |
| --- | --- | --- | --- | --- |
| 1 | "<name> p doom" | First suggestion for 17 catalog names; People also ask "What is Elon Musk's P-doom?" | Thin: Wikipedia list, PauseAI, Reddit, Hacker News, X | Profiles (a "{Name}'s P(doom)" H2), with `/p-doom` rows linking to them |
| 2 | "p doom", "p(doom)" | 0.39 W; Ahrefs >100, Easy; Wikipedia 43,736 in September | Wikipedia, PauseAI, Reddit, P Doom Records, FT; AI Overview | `/p-doom` |
| 3 | "what is p doom", "p doom meaning" | Top related query for "p doom" | Wikipedia, Reddit, PauseAI, small sites; AI Overview cites calcuja.com | `/p-doom` |
| 4 | "p doom calculator", "p doom test", "what is my p doom" | Autocomplete; People also ask on 3 results pages | Small single-purpose tools | Home, plus the `/p-doom` call to action |
| 5 | "<name> ai safety / ai risk / ai warning" | 22, 15 and 14 of 40 names | News-heavy for Altman, Musk, Zuckerberg and Huang; open for LeCun, Yudkowsky, Hassabis, Sutskever, Tegmark, Andreessen and Ng | Profiles |
| 6 | "<name> on ai", "what does <name> think about ai" | 33 of 40 | Podcasts, NCSL, Reddit, Medium | Profiles (H1 "{Name} on AI") |
| 7 | "p doom list", "p(doom) estimates" | Autocomplete; People also ask | PauseAI #1, Reddit, Wikipedia, calcuja.com | `/p-doom` |
| 8 | "will ai take over the world", "will ai destroy humanity" | W = 1, Hard | News | A neutral explainer, "what AI leaders say" |
| 9 | "ai doomer", "ai doomers list" | >100, Easy | Atlantic, WSJ, aisafety.info | Hub, plus a glossary post |
| 10 | "ai safety experts", "what do experts think about the future of ai", "ai experts warn" | Autocomplete present | No synthesized "who thinks what" page | New hub |
| 11 | "ai doomer quiz", "doomer gloomer zoomer bloomer" | Very low, but a perfect fit | Bloomberg interactive, idrlabs, wikiHow | Home description, plus a four-camps post |
| 12 | "ai 2027" | 5.3 W | ai-2027.com, news | Kokotajlo, Scott Alexander and Lifland profiles |

## Home title candidates

| # | Title | Keeps the headline | Trade-off |
| --- | --- | --- | --- |
| A (current #24) | How will AI change our future? Map your AI worldview | Yes | Most neutral; no phrase with search demand |
| **B (recommended)** | How will AI change our future? Take the 3-minute quiz | Yes | Same neutrality; matches the titles that rank in the quiz niche |
| C | Doom or Bloom: a 3-minute quiz on the future of AI | No | Uses "future of AI" verbatim; loses the headline |
| D | Will AI save us or doom us? Take the 3-minute AI quiz | No | Matches the biggest question family; more dramatic |
| E | AI doomer, optimist or in between? Find out in 3 minutes | No | Uses demand terms; leads with "doomer" |

Recommended description: "Free 3-minute quiz on the future of AI. See if you lean doom or bloom, get a rough P(doom), and compare your views with Hinton, LeCun, Altman and more."

**P(doom) on the home page: not in the title; yes once, in the description.** Demand is about 4% of "future of ai". The term collides with P Doom Records, and its intents (definition, list, "<name>'s number") are better served by `/p-doom`.

## Per-page titles

- **`/p-doom`**: "What is P(doom)? Estimates from Hinton, Musk, LeCun and more". Add an H2 "P(doom) estimates by AI leader". Ship it: it's a 404 in production today.
- **Blog post "What is P(doom)?"**: it duplicates `/p-doom`. Re-angle it as "P(doom) explained: why estimates run from 0% to 99%", and make its first link point to `/p-doom`.
- **`/blog`**: "Data and explainers on AI risk and the future of AI".
- **`/users`**: "Where 169 thought leaders stand on AI risk and safety" (H1 "AI risk and the future: where 169 thought leaders stand").
- **Profiles**: "{Name} on AI safety, risk and P(doom)", once the page opens with sourced statements. For developers and economists, use the variant "{Name} on AI: views on the future, risk and P(doom)".

## Profile page recommendation

1. **H1** "{Name} on AI", with a one-line dek.
2. **H2 "What {Name} has said about AI safety and risk"**: 3–6 verbatim, dated, linked quotes, opening with a neutral one-sentence summary.
3. **H2 "{Name}'s P(doom)"**: the stated number or the reason for declining, with the simulated estimate labelled separately.
4. **H2 "Where {Name} lands between doom and bloom"** (the simulation), then "How {Name}'s views compare", then "Sources".
5. **Start with the top 40 by demand**, plus the September risers Kokotajlo, Leahy and Roose.
6. **JSON-LD**: `WebPage`, with `about`/`mainEntity` pointing to the `Person`; Wikipedia and Wikidata in `sameAs`; topic `about`s (AI safety, existential risk, P(doom)); `citation`s for the quotes.
7. **Internal links**: `/p-doom` ↔ profiles, 3–5 map neighbours per profile, and a new `/ai-risk` hub grouping people by map region and stated P(doom) band (not by labels like "doomer").

## What would move the needle most

1. Ship `/p-doom` and the blog to production now, link them from home, and request indexing.
2. Upgrade the top 40 profiles (plus Kokotajlo, Leahy and Roose) with the new title and H1, a sourced statements section and a P(doom) section.
3. Fix profile JSON-LD.
4. Re-angle the duplicate "What is P(doom)?" post.
5. Build the `/ai-risk` hub, or retitle and section `/users`.
6. Change the home title to "How will AI change our future? Take the 3-minute quiz".
7. Bing Webmaster Tools, IndexNow, and outreach with the sourced P(doom) table.
8. Optional timely posts: "Will AI destroy humanity? What 169 AI thought leaders say", and "Doomers, gloomers, zoomers and bloomers".

## Method notes

- Every number is relative or bucketed; no free tool gives absolute Google volumes.
- The Trends window includes a spike, so treat the numbers as order-of-magnitude.
- Results pages were checked once, during a news cycle.
- People demand is monthly English Wikipedia pageviews (12-month average); 68 of 169 people have articles. Full table in `people-demand.json`.
