import { useTranslations } from 'next-intl'

const steps = ['opening', 'map', 'followUps', 'result'] as const
const jevItems = ['usable', 'fit', 'useful'] as const
const codeItems = ['next', 'ready', 'result'] as const

function Lane({ title, items }: { title: string; items: string[] }) {
  return (
    <div className='flex flex-col gap-1.5'>
      <p className='font-semibold'>{title}</p>
      <ul className='flex list-disc flex-col gap-1 pl-5 text-body-foreground marker:text-coral'>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

/**
 * The interview's steps, then the split of work after every answer: what Jev
 * judges and what code decides.
 */
export function InterviewFlow() {
  const t = useTranslations('About.methodology.flow')
  return (
    <figure aria-label={t('label')} className='flex flex-col gap-2 text-sm'>
      <ol className='grid grid-cols-1 gap-2 sm:grid-cols-4'>
        {steps.map((step, index) => (
          <li
            key={step}
            className='flex gap-3 rounded-xl border bg-card p-3 sm:flex-col sm:gap-2'
          >
            <span
              aria-hidden
              className='flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-coral text-xs font-semibold tabular-nums'
            >
              {index + 1}
            </span>
            <span className='flex flex-col gap-0.5'>
              <span className='font-semibold'>{t(`steps.${step}.title`)}</span>
              <span className='text-muted-foreground'>
                {t(`steps.${step}.text`)}
              </span>
            </span>
          </li>
        ))}
      </ol>
      <div className='flex flex-col gap-3 rounded-xl border p-3'>
        <p className='text-xs font-semibold tracking-wide text-muted-foreground uppercase'>
          {t('afterEach')}
        </p>
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-6'>
          <Lane
            title={t('jev')}
            items={jevItems.map((item) => t(`jevItems.${item}`))}
          />
          <Lane
            title={t('code')}
            items={codeItems.map((item) => t(`codeItems.${item}`))}
          />
        </div>
      </div>
    </figure>
  )
}
