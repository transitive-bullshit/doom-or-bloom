'use client'

import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { WorldviewCta } from '@/components/worldview-cta'
import { WorldviewCtaCard } from '@/components/worldview-cta-card'
import { getPathname, Link } from '@/i18n/navigation'
import {
  useSyncExternalStore,
  useMemo,
  useRef,
  useState,
  type CSSProperties
} from 'react'
import { flushSync } from 'react-dom'
import './prism.css'
import { usePortraitHighlight } from './use-portrait-highlight'
import { usePortraitLayout } from './use-portrait-layout'
import { usePersonaPrefetch } from './use-persona-prefetch'
import { PersonaLink } from './persona-link'
import type { MapExample } from '@/components/landing/shared'
import { NativeSelect } from '@/components/ui/native-select'
import {
  compareUsers,
  directoryFilters,
  directoryPageSize,
  directorySorts,
  directoryValue,
  followerCount,
  followersCapturedLabel,
  matchesFilter,
  type DirectoryFilter,
  type DirectorySort
} from './directory-sort'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

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
// Most followed first, so the people visitors most likely know lead the list.
const defaultDirectoryPreferences: DirectoryPreferences = {
  sort: 'followers',
  direction: 'desc'
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
      (directorySorts as readonly string[]).includes(saved.sort)
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
  const t = useTranslations('Landing')
  const locale = useLocale()
  const userHref = (slug: string) =>
    getPathname({ href: `/users/${slug}`, locale })
  const storedPreferences = useSyncExternalStore(
    subscribePreferences,
    readPreferences,
    serverPreferences
  )
  const [selection, setSelection] = useState<DirectoryPreferences | null>(null)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<DirectoryFilter>('all')
  // The list grows by a page at a time; changing what it shows starts over.
  const [shown, setShown] = useState(directoryPageSize)
  const { sort, direction } = selection ?? parsePreferences(storedPreferences)
  const selectOrder = (
    nextSort: DirectorySort,
    nextDirection: 'asc' | 'desc'
  ) => {
    setSelection({ sort: nextSort, direction: nextDirection })
    setShown(directoryPageSize)
    try {
      localStorage.setItem(
        directoryPreferencesKey,
        JSON.stringify({ sort: nextSort, direction: nextDirection })
      )
    } catch {
      // Sorting still works when the browser disallows persistence.
    }
  }
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
  const search = query.trim().toLowerCase().replace(/^@/, '')
  const legend = useMemo(
    () =>
      [...examples]
        .filter(
          (person) =>
            !directory ||
            (matchesFilter(person, filter) &&
              `${person.name} ${person.shortName} ${person.slug}`
                .toLowerCase()
                .includes(search))
        )
        .sort((a, b) =>
          directory
            ? compareUsers(a, b, sort, direction)
            : rank(a.id) - rank(b.id)
        ),
    [examples, directory, filter, search, sort, direction]
  )
  const listed = useMemo(
    () => (directory ? legend.slice(0, shown) : legend),
    [directory, legend, shown]
  )
  const legendRef = useRef<HTMLDivElement>(null)
  // Listing every match removes the paging buttons, so focus on one moves to
  // the first newly listed person instead of falling back to the page.
  const showUpTo = (count: number, button: HTMLButtonElement) => {
    const first = listed.length
    const focused = document.activeElement === button
    const focusVisible = button.matches(':focus-visible')
    flushSync(() => setShown(count))
    if (focused && !button.isConnected)
      legendRef.current?.querySelectorAll('a')[first]?.focus({ focusVisible })
  }
  // The directory map shows portraits for the people listed and a dot for
  // everyone else, so a few hundred users stay readable.
  const pictured = useMemo(() => {
    const ids = new Set(listed.map((p) => p.id))
    return plotted.filter((p) => ids.has(p.id))
  }, [plotted, listed])
  const markers = useMemo(() => {
    if (!directory) return []
    const pictureIds = new Set(pictured.map((p) => p.id))
    const matchIds = new Set(legend.map((p) => p.id))
    return plotted
      .filter((p) => !pictureIds.has(p.id))
      .map((p) => ({ ...p, matches: matchIds.has(p.id) }))
  }, [directory, plotted, pictured, legend])
  const filterCounts = useMemo(
    () =>
      Object.fromEntries(
        directoryFilters.map((key) => [
          key,
          examples.filter((person) => matchesFilter(person, key)).length
        ])
      ) as Record<DirectoryFilter, number>,
    [examples]
  )
  const portraitsReady = pictured.every((p) => portraits[p.avatar])
  const chartRef = usePortraitLayout(
    pictured,
    portraitsReady,
    directory ? 'directory' : 'featured'
  )
  const highlightRef = usePortraitHighlight(pictured)
  const prefetch = usePersonaPrefetch(highlightRef)
  const settlePortrait = (src: string, status: 'loaded' | 'failed') => {
    setPortraits((current) =>
      current[src] === status ? current : { ...current, [src]: status }
    )
  }
  const metricText = {
    unavailable: t('metricUnavailable'),
    followers: (count: number) =>
      t('metricFollowers', { count: followerCount(count, locale) })
  }
  return (
    <section
      className='map-study study-prism prism-theme'
      ref={highlightRef}
      data-highlighting='false'
    >
      <header className='study-heading'>
        <h1>{directory ? t('directoryTitle') : t('title')}</h1>
        <div className='mt-6 sm:hidden'>
          <WorldviewCta />
        </div>
      </header>
      <div className='study-axis-top'>{t('axisTop')}</div>
      <div
        className='study-chart'
        ref={chartRef}
        data-portraits-ready={portraitsReady}
        role='group'
        aria-label={t('mapLabel')}
        aria-busy={!portraitsReady}
      >
        <div className='study-cross-x' />
        <div className='study-cross-y' />
        <span className='study-doom'>Doom</span>
        <span className='study-bloom'>Bloom</span>
        {markers.map((p) => (
          <PersonaLink
            key={p.id}
            intent={prefetch}
            prefetchKey={`marker:${p.slug}`}
            href={userHref(p.slug)}
            className='study-marker'
            style={{
              left: `${p.outlook! * 100}%`,
              top: `${(1 - p.transformation!) * 100}%`
            }}
            // The list reaches everyone, so markers stay out of the tab order.
            tabIndex={-1}
            data-matches={p.matches}
            aria-label={t('viewResults', { name: p.name })}
          >
            <span>{p.name}</span>
          </PersonaLink>
        ))}
        {pictured.map((p, i) => (
          <span
            key={p.id}
            className='study-dot'
            aria-hidden
            style={
              {
                left: `${p.outlook! * 100}%`,
                top: `${(1 - p.transformation!) * 100}%`,
                '--order': i / Math.max(1, pictured.length - 1)
              } as CSSProperties
            }
          />
        ))}
        {pictured.map((p) => (
          <PersonaLink
            key={p.id}
            intent={prefetch}
            prefetchKey={`map:${p.slug}`}
            href={userHref(p.slug)}
            className='study-point study-portrait'
            style={{
              left: `${p.outlook! * 100}%`,
              top: `${(1 - p.transformation!) * 100}%`
            }}
            data-person-id={p.id}
            data-portrait-failed={portraits[p.avatar] === 'failed'}
            aria-label={t('viewResults', { name: p.name })}
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
      <div className='study-axis-bottom'>{t('axisBottom')}</div>
      {directory && (
        <div className='directory-controls mt-8 flex w-full flex-col gap-2 text-left'>
          <ToggleGroup
            type='single'
            variant='outline'
            size='sm'
            spacing={2}
            value={filter}
            onValueChange={(value) => {
              if (!value) return
              setFilter(value as DirectoryFilter)
              setShown(directoryPageSize)
            }}
            aria-label={t('filterLabel')}
            className='directory-filters'
          >
            {directoryFilters.map((key) => (
              <ToggleGroupItem key={key} value={key}>
                {t(`filters.${key}`)}
                <span className='directory-filter-count'>
                  {filterCounts[key]}
                </span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <div className='directory-controls-row'>
            <div className='flex min-w-0 flex-1 flex-col gap-1'>
              <label htmlFor='user-search'>{t('search')}</label>
              <Input
                id='user-search'
                type='search'
                placeholder={t('searchPlaceholder')}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                  setShown(directoryPageSize)
                }}
                aria-controls='simulated-users'
              />
            </div>
            <div className='directory-selects'>
              <div className='flex flex-col gap-1'>
                <label htmlFor='user-sort' className='text-xs'>
                  {t('sortBy')}
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
                  {directorySorts.map((key) => (
                    <option key={key} value={key}>
                      {t(`sort.${key}`)}
                    </option>
                  ))}
                </NativeSelect>
              </div>
              <div className='flex flex-col gap-1'>
                <label htmlFor='user-sort-direction' className='text-xs'>
                  {t('order')}
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
                    {t(
                      sort === 'name'
                        ? 'nameAscending'
                        : sort === 'outlook'
                          ? 'doomFirst'
                          : 'lowToHigh'
                    )}
                  </option>
                  <option value='desc'>
                    {t(
                      sort === 'name'
                        ? 'nameDescending'
                        : sort === 'outlook'
                          ? 'bloomFirst'
                          : 'highToLow'
                    )}
                  </option>
                </NativeSelect>
              </div>
            </div>
          </div>
          <div className='directory-summary'>
            <p className='directory-count text-muted-foreground' role='status'>
              {t('count', { shown: listed.length, total: legend.length })}
            </p>
            <div className='directory-help'>
              <p
                className='directory-count text-muted-foreground'
                data-active={sort === 'followers'}
                aria-hidden={sort !== 'followers'}
              >
                {t('followersNote', {
                  date: followersCapturedLabel(examples)
                })}
              </p>
              <p
                className='directory-count text-muted-foreground'
                data-active={sort !== 'followers' && sort !== 'pdoom'}
                aria-hidden={sort === 'followers' || sort === 'pdoom'}
              >
                {t('scoresNote')}
              </p>
            </div>
          </div>
        </div>
      )}
      <div
        id='simulated-users'
        ref={legendRef}
        className='landing-map-legend study-legend'
        data-directory={directory}
      >
        {listed.map((p) => (
          <PersonaLink
            key={p.id}
            intent={prefetch}
            prefetchKey={`legend:${p.slug}`}
            href={userHref(p.slug)}
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
              {directory && directoryValue(p, sort, metricText) && (
                <span className='directory-metric'>
                  {directoryValue(p, sort, metricText)}
                </span>
              )}
            </span>
          </PersonaLink>
        ))}
      </div>
      {directory && listed.length < legend.length && (
        <div className='directory-more'>
          <Button
            variant='outline'
            onClick={(event) =>
              showUpTo(shown + directoryPageSize, event.currentTarget)
            }
          >
            {t('showMore', {
              count: Math.min(directoryPageSize, legend.length - listed.length)
            })}
          </Button>
          <Button
            variant='link'
            onClick={(event) => showUpTo(legend.length, event.currentTarget)}
          >
            {t('showAll', { count: legend.length })}
          </Button>
        </div>
      )}
      {directory && legend.length === 0 && (
        <p className='study-note'>{t('noMatches', { query })}</p>
      )}
      <p className='study-note'>{t('exampleNote')}</p>
      {directory && plotted.length < examples.length && (
        <p className='study-note'>
          {t('unplaced', { count: examples.length - plotted.length })}
        </p>
      )}
      {!directory && (
        <p className='study-note'>
          <Link href='/users' className='underline underline-offset-4'>
            {t('exploreAll')}
          </Link>
        </p>
      )}

      <WorldviewCtaCard className='mt-24' />
    </section>
  )
}
