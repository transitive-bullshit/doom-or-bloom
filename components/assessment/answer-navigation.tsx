'use client'

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode
} from 'react'

const AnswerNavigation = createContext<{
  answerIds: string[]
  request: { number: number } | null
  reveal: (number: number) => void
} | null>(null)

export function AnswerNavigationProvider({
  answerIds,
  children
}: {
  answerIds: string[]
  children: ReactNode
}) {
  const [request, setRequest] = useState<{ number: number } | null>(null)
  useEffect(() => {
    const readHash = () => {
      const match = /^#answer-(\d+)$/.exec(window.location.hash)
      const number = Number(match?.[1])
      if (number >= 1 && number <= answerIds.length) setRequest({ number })
    }
    readHash()
    window.addEventListener('hashchange', readHash)
    return () => window.removeEventListener('hashchange', readHash)
  }, [answerIds.length])
  return (
    <AnswerNavigation.Provider
      value={{ answerIds, request, reveal: (number) => setRequest({ number }) }}
    >
      {children}
    </AnswerNavigation.Provider>
  )
}

export function useAnswerNavigation() {
  return useContext(AnswerNavigation)
}

/** A new navigation request opens the disclosure; manual toggles remain independent. */
export function useAnswerDisclosure(defaultOpen: boolean, number?: number) {
  const navigation = useAnswerNavigation()
  const request =
    number === undefined || navigation?.request?.number === number
      ? (navigation?.request ?? null)
      : null
  const [state, setState] = useState({ open: defaultOpen, handled: request })
  const open = Boolean(request && request !== state.handled) || state.open
  return [
    open,
    (open: boolean) => setState({ open, handled: request })
  ] as const
}

export function AnswerLink({ number }: { number: number }) {
  const navigation = useAnswerNavigation()
  if (!navigation || number < 1 || number > navigation.answerIds.length)
    return (
      <span className='text-xs text-muted-foreground'>Answer {number}</span>
    )
  return (
    <a
      href={`#answer-${number}`}
      className='w-fit rounded-sm text-xs text-muted-foreground no-underline hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring'
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
          return
        event.preventDefault()
        const hash = `#answer-${number}`
        if (window.location.hash !== hash)
          window.history.pushState(window.history.state, '', hash)
        navigation.reveal(number)
      }}
    >
      Answer {number}
    </a>
  )
}

export function AnswerTarget({
  number,
  children
}: {
  number: number
  children: ReactNode
}) {
  const navigation = useAnswerNavigation()
  const ref = useRef<HTMLDivElement>(null)
  const request = navigation?.request
  useEffect(() => {
    if (request?.number !== number) return
    const frame = requestAnimationFrame(() => {
      ref.current?.focus({ preventScroll: true })
      ref.current?.scrollIntoView({
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'instant'
          : 'smooth',
        block: 'start'
      })
    })
    return () => cancelAnimationFrame(frame)
  }, [request, number])
  return (
    <div
      ref={ref}
      id={`answer-${number}`}
      tabIndex={-1}
      className='scroll-mt-6 rounded-sm focus:outline-none'
    >
      {children}
    </div>
  )
}
