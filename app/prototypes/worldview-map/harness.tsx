'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Prism } from './prism'
import { MapFirst } from '@/components/landing/map-first'

import type { Example } from '@/components/landing/shared'
import './picker.css'
import '@/components/landing/landing.css'

const variants = [MapFirst, Prism]
const names = ['Baseline', 'Prism']

export function Harness({
  examples,
  initialVariant
}: {
  examples: Example[]
  initialVariant: number
}) {
  const [active, setActive] = useState(initialVariant)
  const [replay, setReplay] = useState(0)
  const picker = useRef<HTMLElement>(null)
  const highlight = useRef<HTMLSpanElement>(null)
  const buttons = useRef<Array<HTMLButtonElement | null>>([])
  const choose = (index: number) => {
    setActive(index)
    setReplay((n) => n + 1)
    const url = new URL(window.location.href)
    url.searchParams.set('v', String(index + 1))
    window.history.replaceState(null, '', url)
  }
  useLayoutEffect(() => {
    const measure = () => {
      const button = buttons.current[active]
      if (button && highlight.current) {
        highlight.current.style.width = `${button.offsetWidth}px`
        highlight.current.style.transform = `translateX(${button.offsetLeft}px)`
      }
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [active])
  useEffect(() => {
    let second = 0
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() =>
        picker.current?.setAttribute('data-ready', '')
      )
    })
    return () => {
      cancelAnimationFrame(first)
      cancelAnimationFrame(second)
    }
  }, [])
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      if (
        /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) ||
        target.isContentEditable ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        event.shiftKey
      )
        return
      const number = Number(event.key)
      if (number >= 1 && number <= variants.length) choose(number - 1)
      else if (event.key === 'ArrowRight') {
        event.preventDefault()
        choose((active + 1) % variants.length)
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        choose((active - 1 + variants.length) % variants.length)
      } else if (event.key.toLowerCase() === 'r') setReplay((n) => n + 1)
    }
    document.addEventListener('keydown', keydown)
    return () => document.removeEventListener('keydown', keydown)
  }, [active])
  const Variant = variants[active]!
  return (
    <>
      <div className={active === 0 ? 'landing-stage' : 'map-lab-stage'}>
        <Variant key={`${active}-${replay}`} examples={examples} />
      </div>
      <nav
        className='proto-picker'
        aria-label='Prototype variants'
        ref={picker}
      >
        <span
          className='proto-picker-highlight'
          aria-hidden='true'
          ref={highlight}
        />
        {names.map((name, index) => (
          <button
            key={name}
            className='proto-picker-item'
            data-active={index === active ? '' : undefined}
            aria-current={index === active ? 'true' : undefined}
            ref={(el) => {
              buttons.current[index] = el
            }}
            onClick={() => choose(index)}
          >
            {name}
          </button>
        ))}
      </nav>
    </>
  )
}
