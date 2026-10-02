import { useTranslations } from 'next-intl'
import type { CitedProse } from '@/lib/p-doom/hub'
import type { MentionPart } from '@/lib/personas/mentions'
import { MentionText } from '@/components/mention-text'
import { CitedText } from './citation'

type CitedScenario = {
  id: string
  title: string
  summary: CitedProse
  proponents: { name: MentionPart[]; claim: CitedProse }[]
  disagreement: CitedProse
}

/** The ways P(doom) could come about, each with its advocates and critics. */
export function Scenarios({
  intro,
  scenarios,
  lang
}: {
  intro: CitedProse
  scenarios: CitedScenario[]
  /** The page's language, for translated labels inside the English prose. */
  lang: string
}) {
  const t = useTranslations('PdoomHub')
  return (
    <div lang='en' className='flex flex-col gap-10'>
      <p>
        <CitedText prose={intro} />
      </p>
      <ol className='flex flex-col gap-10'>
        {scenarios.map((scenario, index) => (
          <li key={scenario.id} className='flex flex-col gap-3'>
            <h3 id={`scenario-${scenario.id}`} className='scroll-mt-24'>
              <span className='text-coral tabular-nums'>{index + 1}.</span>{' '}
              {scenario.title}
            </h3>
            <p>
              <CitedText prose={scenario.summary} />
            </p>
            <h4 lang={lang} className='mt-2 text-body-foreground'>
              {t('proponents')}
            </h4>
            <ul className='flex list-disc flex-col gap-2 pl-6 marker:text-coral'>
              {scenario.proponents.map(({ name, claim }, index) => (
                <li key={index}>
                  <MentionText parts={name} /> <CitedText prose={claim} />
                </li>
              ))}
            </ul>
            <h4 lang={lang} className='mt-2 text-body-foreground'>
              {t('disagreement')}
            </h4>
            <p>
              <CitedText prose={scenario.disagreement} />
            </p>
          </li>
        ))}
      </ol>
    </div>
  )
}
