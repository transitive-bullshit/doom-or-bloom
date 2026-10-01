import { describe, expect, it } from 'vitest'
import { normalizeNumerals, percentValues, statedBounds } from './pdoom'
import {
  experimentCandidates,
  type ExperimentInput
} from './worldview-experiment'

const question =
  'What’s your rough gut-feel chance that AI causes human extinction or a similarly permanent catastrophe?'
const candidates = (...answers: string[]) =>
  Object.values(
    experimentCandidates({
      completeParticipantEvidence: answers.map((answer, index) => ({
        id: `a${index + 1}`,
        prompt: question,
        answer,
        correctionTarget: null
      })),
      activeSupport: []
    } satisfies ExperimentInput).probabilities
  ).map(({ token, bounds }) => ({ token, bounds }))

describe('stated P(doom) in English', () => {
  // The extractor before multilingual parsing, kept to prove English reads
  // exactly as it did.
  const before = {
    split: /(?<=[.!?])\s+|\n+/u,
    pattern:
      /(?:less than|more than|under|over|below|above|at most|at least|about|around|roughly|approximately|~|<|>)?\s*\d+(?:\.\d+)?\s*(?:%|percent)(?:\s*(?:to|[-–—]|±|\+\/-)\s*\d+(?:\.\d+)?\s*(?:%|percent))?|\d+(?:\.\d+)?\s*(?:to|[-–—])\s*\d+(?:\.\d+)?\s*(?:%|percent)/giu,
    bounds(token: string): [number, number] | undefined {
      if (/±|\+\/-/u.test(token)) return undefined
      const values = token.match(/\d+(?:\.\d+)?/gu)?.map(Number) ?? []
      if (!values.length || values.some((value) => value > 100))
        return undefined
      const low = Math.min(...values) / 100
      const high = Math.max(...values) / 100
      if (/^(?:less than|under|below|at most|<)/iu.test(token)) return [0, high]
      if (/^(?:more than|over|above|at least|>)/iu.test(token)) return [low, 1]
      return [low, high]
    },
    candidates(answer: string) {
      return answer.split(this.split).flatMap((sentence) =>
        [...sentence.trim().matchAll(this.pattern)].flatMap((match) => {
          const token = match[0].trim()
          const values = token.match(/\d+(?:\.\d+)?/gu)?.map(Number) ?? []
          if (values.some((value) => value > 100)) return []
          const bounds = this.bounds(token)
          return [bounds ? { token, bounds } : { token, bounds: undefined }]
        })
      )
    }
  }
  const english = [
    '30%',
    '25-30%',
    'Idk. 0%',
    '10 percent',
    'Maybe 5 percent, maybe less.',
    'less than 0.5%',
    'Less than 1%. Seriously.',
    'More than 50% if nobody coordinates!',
    'At least 20% and at most 40%.',
    'about 10%, around 12% or roughly 15 percent',
    'approximately 3%? ~4%? <1% honestly. >90% if we race.',
    'Under 2% this century, over 30% eventually.',
    'Below 1 percent. Above 70 percent in the worst case.',
    '10% ± 5%, or 10% +/- 5%.',
    '5 to 10 percent, 10–20%, 20—30%, 30 - 40 %',
    'I put extinction risk at 10–20% by 2100. Job loss could be 40%.',
    'The 2030 job loss is 40%, but 1000% growth is silly.',
    '0.1% or 0.01%, maybe 99.9%',
    'Between 10 and 20% feels right.',
    'from 10% to 20%',
    'A 1 in 10 chance, so 10%.',
    'No idea.\n\nMaybe 15%',
    'By 2050 a 10% chance.',
    'P(doom) = 35%',
    'Thunder 5% lol',
    '100% doom',
    '50/50, so 50%.'
  ]
  it('reads every token and bound exactly as before', () => {
    for (const answer of english)
      expect({ answer, found: candidates(answer) }).toEqual({
        answer,
        found: before.candidates(answer)
      })
  })
})

describe('stated P(doom) in every enabled language', () => {
  const cases: Array<[string, string, string, [number, number] | undefined]> = [
    // Spanish
    ['es', 'Creo que un 30%.', '30%', [0.3, 0.3]],
    ['es', 'Menos del 5 %, sinceramente.', 'Menos del 5 %', [0, 0.05]],
    ['es', 'más de 50 por ciento', 'más de 50 por ciento', [0.5, 1]],
    ['es', 'Alrededor del 20%', 'Alrededor del 20%', [0.2, 0.2]],
    ['es', 'Entre 10 y 20 %', 'Entre 10 y 20 %', [0.1, 0.2]],
    ['es', 'Diría del 10 al 20%.', 'del 10 al 20%', [0.1, 0.2]],
    ['es', 'Un 0,5 % como mucho', '0,5 %', [0.005, 0.005]],
    ['es', 'como mucho 1%', 'como mucho 1%', [0, 0.01]],
    // Brazilian Portuguese
    ['pt', 'Uns 15 por cento', 'Uns 15 por cento', [0.15, 0.15]],
    ['pt', 'menos de 1%', 'menos de 1%', [0, 0.01]],
    ['pt', 'pelo menos 30%', 'pelo menos 30%', [0.3, 1]],
    ['pt', 'de 5 a 10%', 'de 5 a 10%', [0.05, 0.1]],
    // German
    ['de', 'Etwa 20 Prozent.', 'Etwa 20 Prozent', [0.2, 0.2]],
    ['de', 'weniger als 0,5 %', 'weniger als 0,5 %', [0, 0.005]],
    ['de', 'Über 60 %', 'Über 60 %', [0.6, 1]],
    ['de', 'mindestens 10%', 'mindestens 10%', [0.1, 1]],
    ['de', '10 bis 20 Prozent', '10 bis 20 Prozent', [0.1, 0.2]],
    // French
    ['fr', 'Moins de 1 %.', 'Moins de 1 %', [0, 0.01]],
    ['fr', 'environ 10 pour cent', 'environ 10 pour cent', [0.1, 0.1]],
    ['fr', 'au moins 25 %', 'au moins 25 %', [0.25, 1]],
    ['fr', 'plus de 50 %', 'plus de 50 %', [0.5, 1]],
    ['fr', 'entre 5 et 15 %', 'entre 5 et 15 %', [0.05, 0.15]],
    // Indonesian
    ['id', 'Sekitar 30 persen.', 'Sekitar 30 persen', [0.3, 0.3]],
    ['id', 'kurang dari 5%', 'kurang dari 5%', [0, 0.05]],
    ['id', 'lebih dari 50 persen', 'lebih dari 50 persen', [0.5, 1]],
    ['id', 'antara 10 dan 20 persen', 'antara 10 dan 20 persen', [0.1, 0.2]],
    // Japanese
    ['ja', '３０％くらいだと思います。', '３０％くらい', [0.3, 0.3]],
    ['ja', '1%未満です。', '1%未満', [0, 0.01]],
    ['ja', '10パーセント以上', '10パーセント以上', [0.1, 1]],
    ['ja', '約20％', '約20％', [0.2, 0.2]],
    ['ja', '10%から20%の間', '10%から20%', [0.1, 0.2]],
    ['ja', '５〜１０％', '５〜１０％', [0.05, 0.1]],
    // Simplified Chinese
    ['zh', '我觉得是百分之三十。', '百分之三十', [0.3, 0.3]],
    ['zh', '不到1%吧', '不到1%', [0, 0.01]],
    ['zh', '超过50%', '超过50%', [0.5, 1]],
    ['zh', '大约20%', '大约20%', [0.2, 0.2]],
    ['zh', '30%左右', '30%左右', [0.3, 0.3]],
    ['zh', '百分之零点五', '百分之零点五', [0.005, 0.005]],
    ['zh', '10%到20%', '10%到20%', [0.1, 0.2]],
    // Thai
    ['th', 'ประมาณ 30 เปอร์เซ็นต์', 'ประมาณ 30 เปอร์เซ็นต์', [0.3, 0.3]],
    ['th', 'น้อยกว่า 5%', 'น้อยกว่า 5%', [0, 0.05]],
    ['th', 'มากกว่า ๕๐%', 'มากกว่า ๕๐%', [0.5, 1]],
    ['th', 'ร้อยละ 10', 'ร้อยละ 10', [0.1, 0.1]],
    ['th', '๓๐%', '๓๐%', [0.3, 0.3]],
    // Hindi
    ['hi', 'लगभग ३० प्रतिशत।', 'लगभग ३० प्रतिशत', [0.3, 0.3]],
    ['hi', '५% से कम', '५% से कम', [0, 0.05]],
    ['hi', '20 प्रतिशत से अधिक', '20 प्रतिशत से अधिक', [0.2, 1]],
    ['hi', 'कम से कम 10%', 'कम से कम 10%', [0.1, 1]],
    ['hi', '10 से 20 प्रतिशत', '10 से 20 प्रतिशत', [0.1, 0.2]]
  ]
  it.each(cases)('%s: %s', (_locale, answer, token, bounds) => {
    expect(candidates(answer)).toEqual([bounds ? { token, bounds } : { token }])
  })

  it('reads a bare percentage in any script, however short', () => {
    for (const answer of ['30%', '３０％', '३०%', '๓๐%', '30 %', '30％'])
      expect(candidates(answer)).toEqual([
        { token: answer, bounds: [0.3, 0.3] }
      ])
  })

  it('splits sentences on 。！？ and the danda', () => {
    expect(
      candidates('仕事は40%減る。でも絶滅は1%未満！').map(({ token }) => token)
    ).toEqual(['40%', '1%未満'])
    const passages = Object.values(
      experimentCandidates({
        completeParticipantEvidence: [
          {
            id: 'a1',
            prompt: question,
            answer: 'नौकरियों पर असर बहुत बड़ा होगा। विलुप्ति का जोखिम ५% से कम है।',
            correctionTarget: null
          }
        ],
        activeSupport: []
      }).passages
    ).map(({ text }) => text)
    expect(passages).toEqual([
      'नौकरियों पर असर बहुत बड़ा होगा।',
      'विलुप्ति का जोखिम ५% से कम है।'
    ])
  })

  it('normalizes numerals and keeps margins of error unbounded', () => {
    expect(normalizeNumerals('３０％ ४५ ๑๒ 百分之三十五')).toBe(
      '30% 45 12 百分之35'
    )
    expect(percentValues('0,5 %')).toEqual([0.5])
    expect(percentValues('百分之一百')).toEqual([100])
    expect(statedBounds('10 % ± 5 %')).toBeUndefined()
    expect(statedBounds('百分之二百')).toBeUndefined()
  })
})
