'use client'

import Image from 'next/image'
import { WorldviewCta } from '@/components/worldview-cta'
import { WorldviewCtaCard } from '@/components/worldview-cta-card'
import Link from 'next/link'
import { useSyncExternalStore, useMemo, useState } from 'react'
import './prism.css'
import { usePortraitHighlight } from './use-portrait-highlight'
import { usePortraitLayout } from './use-portrait-layout'
import { usePersonaPrefetch } from './use-persona-prefetch'
import { PersonaLink } from './persona-link'
import type { MapExample } from '@/components/landing/shared'
import { NativeSelect } from '@/components/ui/native-select'
import {
  compareUsers,
  directorySorts,
  directoryValue,
  type DirectorySort
} from './directory-sort'
import { Input } from '@/components/ui/input'

const featuredOrder = [
  'alignment-maximalist',
  'abundance-risk-taker',
  'cautious-builder',
  'frontier-pacer',
  'control-alarmist',
  'anti-doomer',
  'hands-on-agent-builder',
  'safe-superintelligence-researcher',
  'america-first-ai-booster',
  'democratic-ai-steward',
  'equitable-ai-philanthropist',
  'personal-superintelligence-builder',
  'abundance-advocate',
  'concerned-pioneer',
  'world-model-optimist',
  'scientific-steward',
  'democratic-moratorium',
  'practical-optimist',
  'empirical-skeptic',
  'human-centered-spatial-builder',
  'scientist-ai-advocate',
  'rationalist-safety-advocate',
  'alignment-philosopher',
  'institutional-growth-optimist',
  'bubble-critic',
  'competitive-decentralist',
  'biosecurity-abundance-optimist',
  'learning-bottleneck-investigator',
  'open-science-realist',
  'coordinated-scaler',
  'efficient-intelligence-builder',
  'reasoning-frontier-builder',
  'superintelligence-stop-advocate',
  'empirical-control-researcher',
  'takeoff-forecaster',
  'provable-control-advocate',
  'tool-ai-moratorium',
  'digital-succession-optimist',
  'community-ai-critic',
  'language-hype-critic',
  'normal-technology-realist',
  'pro-worker-economist',
  'open-frontier-idealist'
]

const featuredRanks = new Map(featuredOrder.map((id, index) => [id, index]))
const rank = (id: string) => featuredRanks.get(id) ?? featuredOrder.length

const directoryPreferencesKey = 'doom-or-bloom:directory-sort:v1'

type DirectoryPreferences = { sort: DirectorySort; direction: 'asc' | 'desc' }
const defaultDirectoryPreferences: DirectoryPreferences = {
  sort: 'name',
  direction: 'asc'
}
const subscribePreferences = (notify: () => void) => {
  window.addEventListener('storage', notify)
  return () => window.removeEventListener('storage', notify)
}
const readPreferences = () => {
  try {
    return localStorage.getItem(directoryPreferencesKey)
  } catch {
    return null
  }
}
const serverPreferences = () => null
function parsePreferences(raw: string | null): DirectoryPreferences {
  try {
    const saved = JSON.parse(raw ?? 'null')
    if (
      saved &&
      typeof saved.sort === 'string' &&
      Object.hasOwn(directorySorts, saved.sort)
    ) {
      return {
        sort: saved.sort as DirectorySort,
        direction:
          saved.direction === 'asc' || saved.direction === 'desc'
            ? saved.direction
            : saved.sort === 'followers'
              ? 'desc'
              : 'asc'
      }
    }
  } catch {
    /* Ignore stale or malformed browser preferences. */
  }
  return defaultDirectoryPreferences
}

export function Prism({
  examples,
  directory = false
}: {
  examples: MapExample[]
  directory?: boolean
}) {
  const storedPreferences = useSyncExternalStore(
    subscribePreferences,
    readPreferences,
    serverPreferences
  )
  const [selection, setSelection] = useState<DirectoryPreferences | null>(null)
  const { sort, direction } = selection ?? parsePreferences(storedPreferences)
  const selectOrder = (
    nextSort: DirectorySort,
    nextDirection: 'asc' | 'desc'
  ) => {
    setSelection({ sort: nextSort, direction: nextDirection })
    try {
      localStorage.setItem(
        directoryPreferencesKey,
        JSON.stringify({ sort: nextSort, direction: nextDirection })
      )
    } catch {
      // Sorting still works when the browser disallows persistence.
    }
  }
  const [query, setQuery] = useState('')
  const [portraits, setPortraits] = useState<
    Record<string, 'loaded' | 'failed'>
  >({})
  const plotted = useMemo(
    () =>
      examples
        .filter((p) => p.outlook !== null && p.transformation !== null)
        .sort((a, b) => a.outlook! - b.outlook!),
    [examples]
  )
  const chartRef = usePortraitLayout(plotted)
  const highlightRef = usePortraitHighlight(plotted)
  const prefetch = usePersonaPrefetch(highlightRef)
  const portraitsReady = plotted.every((p) => portraits[p.avatar])
  const settlePortrait = (src: string, status: 'loaded' | 'failed') => {
    setPortraits((current) =>
      current[src] === status ? current : { ...current, [src]: status }
    )
  }
  const search = query.trim().toLowerCase().replace(/^@/, '')
  const legend = useMemo(
    () =>
      [...examples]
        .filter(
          (person) =>
            !directory ||
            `${person.name} ${person.shortName} ${person.slug}`
              .toLowerCase()
              .includes(search)
        )
        .sort((a, b) =>
          directory
            ? compareUsers(a, b, sort, direction)
            : rank(a.id) - rank(b.id)
        ),
    [examples, directory, search, sort, direction]
  )
  return (
    <section
      className='map-study study-prism prism-theme'
      ref={highlightRef}
      data-highlighting='false'
    >
      <header className='study-heading'>
        <h1>
          {directory
            ? 'Explore simulated users'
            : 'How will AI change our future?'}
        </h1>
        <div className='mt-6 sm:hidden'>
          <WorldviewCta />
        </div>
      </header>
      <div className='study-axis-top'>Civilizational change</div>
      <div
        className='study-chart'
        ref={chartRef}
        data-portraits-ready={portraitsReady}
        role='group'
        aria-label='AI outlook and scale of transformation. Open a portrait to explore their simulated worldview.'
      >
        <div className='study-cross-x' />
        <div className='study-cross-y' />
        <span className='study-doom'>Doom</span>
        <span className='study-bloom'>Bloom</span>
        {plotted.map((p) => (
          <PersonaLink
            key={p.id}
            intent={prefetch}
            prefetchKey={`map:${p.slug}`}
            href={`/users/${p.slug}`}
            className='study-point study-portrait'
            style={{
              left: `${p.outlook! * 100}%`,
              top: `${(1 - p.transformation!) * 100}%`
            }}
            data-person-id={p.id}
            data-portrait-failed={portraits[p.avatar] === 'failed'}
            aria-label={`View ${p.name} results`}
          >
            <Image
              src={p.avatar}
              alt=''
              width={40}
              height={40}
              sizes='(max-width: 520px) 30px, 40px'
              quality={90}
              loading='eager'
              // Next Image fires onLoad after decoding, including cached images.
              onLoad={() => settlePortrait(p.avatar, 'loaded')}
              onError={() => settlePortrait(p.avatar, 'failed')}
            />
            <span>{p.name}</span>
          </PersonaLink>
        ))}
      </div>
      <div className='study-axis-bottom'>Incremental change</div>
      {directory && (
        <div className='directory-controls mt-8 flex w-full flex-col gap-2 text-left'>
          <div className='directory-controls-row'>
            <div className='flex min-w-0 flex-1 flex-col gap-1'>
              <label htmlFor='user-search'>Find a simulated user</label>
              <Input
                id='user-search'
                type='search'
                placeholder='Search names or @handles'
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-controls='simulated-users'
              />
            </div>
            <div className='directory-selects'>
              <div className='flex flex-col gap-1'>
                <label htmlFor='user-sort' className='text-xs'>
                  Sort by
                </label>
                <NativeSelect
                  id='user-sort'
                  value={sort}
                  onChange={(event) => {
                    const nextSort = event.target.value as DirectorySort
                    selectOrder(
                      nextSort,
                      nextSort === 'followers' ? 'desc' : 'asc'
                    )
                  }}
                  aria-controls='simulated-users'
                >
                  {Object.entries(directorySorts).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </NativeSelect>
              </div>
              <div className='flex flex-col gap-1'>
                <label htmlFor='user-sort-direction' className='text-xs'>
                  Order
                </label>
                <NativeSelect
                  id='user-sort-direction'
                  value={direction}
                  onChange={(event) =>
                    selectOrder(sort, event.target.value as 'asc' | 'desc')
                  }
                  aria-controls='simulated-users'
                >
                  <option value='asc'>
                    {sort === 'name'
                      ? 'A–Z'
                      : sort === 'outlook'
                        ? 'Doom first'
                        : 'Low to high'}
                  </option>
                  <option value='desc'>
                    {sort === 'name'
                      ? 'Z–A'
                      : sort === 'outlook'
                        ? 'Bloom first'
                        : 'High to low'}
                  </option>
                </NativeSelect>
              </div>
            </div>
          </div>
          <div className='directory-summary'>
            <p className='directory-count text-muted-foreground' role='status'>
              {legend.length} of {examples.length} simulated users
            </p>
            <div className='directory-help'>
              <p
                className='directory-count text-muted-foreground'
                data-active={sort === 'followers'}
                aria-hidden={sort !== 'followers'}
              >
                X counts captured{' '}
                {examples[0]?.followersCapturedAt?.slice(0, 10)}. Unavailable
                counts appear last.
              </p>
              <p
                className='directory-count text-muted-foreground'
                data-active={sort !== 'followers' && sort !== 'pdoom'}
                aria-hidden={sort === 'followers' || sort === 'pdoom'}
              >
                Scores describe simulated answers. Missing scores appear last.
              </p>
            </div>
          </div>
        </div>
      )}
      <div
        id='simulated-users'
        className='landing-map-legend study-legend'
        data-directory={directory}
      >
        {legend.map((p) => (
          <PersonaLink
            key={p.id}
            intent={prefetch}
            prefetchKey={`legend:${p.slug}`}
            href={`/users/${p.slug}`}
            data-person-id={p.id}
          >
            <Image
              className='landing-legend-avatar'
              src={p.avatar}
              alt=''
              width={30}
              height={30}
              sizes='(max-width: 640px) 42px, 30px'
              quality={90}
            />
            <span className='study-person-name'>
              {p.shortName}
              {directory && directoryValue(p, sort) && (
                <span className='directory-metric'>
                  {directoryValue(p, sort)}
                </span>
              )}
            </span>
          </PersonaLink>
        ))}
      </div>
      {directory && legend.length === 0 && (
        <p className='study-note'>
          No users match “{query}”. Try another name or handle.
        </p>
      )}
      <p className='study-note'>Example results based on simulated users</p>
      {directory && plotted.length < examples.length && (
        <p className='study-note'>
          {examples.length - plotted.length} users have insufficient evidence
          for a map position. Their results are available in the grid.
        </p>
      )}
      {!directory && (
        <p className='study-note'>
          <Link href='/users' className='underline underline-offset-4'>
            Explore all simulated users
          </Link>
        </p>
      )}

      <WorldviewCtaCard className='mt-24' />
    </section>
  )
}
