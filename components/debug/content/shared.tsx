'use client'

import { useId } from 'react'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { GraphEdge } from '@/lib/debug/relationships'
import { cn } from 'cn'

export function ReviewHeader({
  title,
  description,
  contentVersion
}: {
  title: string
  description: string
  contentVersion: string
}) {
  return (
    <header className='space-y-4'>
      <Badge variant='outline'>Internal · local development only</Badge>
      <h1>{title}</h1>
      <p className='max-w-3xl text-sm text-muted-foreground'>{description}</p>
      <div className='flex flex-wrap items-center gap-2'>
        <Button asChild variant='outline' size='sm'>
          <Link href='/questions'>Questions</Link>
        </Button>
        <Button asChild variant='outline' size='sm'>
          <Link href='/corpus'>Corpus</Link>
        </Button>
        <Button asChild variant='outline' size='sm'>
          <Link href='/user-journeys'>User Journeys</Link>
        </Button>
        <span className='text-xs text-muted-foreground'>{contentVersion}</span>
      </div>
    </header>
  )
}

export function MetadataList({
  rows
}: {
  rows: { label: string; value: string | number }[]
}) {
  return (
    <dl className='grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-3'>
      {rows.map((row) => (
        <div key={row.label} className='min-w-0'>
          <dt className='text-xs text-muted-foreground'>{row.label}</dt>
          <dd className='mt-1 wrap-anywhere'>
            {row.value === '' ? 'None' : row.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

type GraphNode = { id: string; label: string }
export function RelationshipGraph({
  nodes,
  edges,
  selectedId,
  onSelect,
  label
}: {
  nodes: GraphNode[]
  edges: GraphEdge[]
  selectedId: string
  onSelect: (id: string) => void
  label: string
}) {
  const marker = useId()
  const columns = Math.min(5, nodes.length)
  const positions = new Map(
    nodes.map((node, index) => [
      node.id,
      {
        x: 110 + (index % columns) * 200,
        y: 45 + Math.floor(index / columns) * 85
      }
    ])
  )
  return (
    <div className='space-y-3' data-slot='relationship-graph'>
      <p className='text-xs text-muted-foreground'>
        Select a node to inspect it. Lines show the selected entry’s
        relationships. The list below provides the same navigation on smaller
        screens.
      </p>
      <svg
        className='hidden w-full sm:block'
        viewBox={`0 0 ${columns * 200 + 20} ${Math.ceil(nodes.length / columns) * 85 + 5}`}
        role='group'
        aria-label={label}
      >
        <defs>
          <marker
            id={marker}
            markerWidth='7'
            markerHeight='7'
            refX='6'
            refY='3.5'
            orient='auto'
          >
            <path d='M0,0 L7,3.5 L0,7 Z' className='fill-muted-foreground' />
          </marker>
        </defs>
        {edges.map((edge) => {
          const from = positions.get(edge.source),
            to = positions.get(edge.target)
          if (!from || !to) return null
          const dx = to.x - from.x,
            dy = to.y - from.y
          if (dx === 0 && dy === 0) return null
          const inset = Math.min(94 / Math.abs(dx), 29 / Math.abs(dy))
          return (
            <line
              key={`${edge.source}:${edge.target}:${edge.label}`}
              x1={from.x + dx * inset}
              y1={from.y + dy * inset}
              x2={to.x - dx * inset}
              y2={to.y - dy * inset}
              className='stroke-muted-foreground'
              strokeOpacity='0.4'
              strokeWidth='1.5'
              markerEnd={`url(#${marker})`}
            >
              <title>{`${edge.source} to ${edge.target}: ${edge.label}`}</title>
            </line>
          )
        })}
        {nodes.map((node) => {
          const point = positions.get(node.id)!
          return (
            <a
              key={node.id}
              href='#review-entry'
              onClick={() => onSelect(node.id)}
              aria-label={`Inspect ${node.id}`}
            >
              <rect
                x={point.x - 90}
                y={point.y - 25}
                width='180'
                height='50'
                rx='8'
                className={cn(
                  'fill-card stroke-border',
                  node.id === selectedId && 'stroke-primary'
                )}
                strokeWidth={node.id === selectedId ? 3 : 1}
              />
              <text
                x={point.x}
                y={point.y - 2}
                textAnchor='middle'
                className='fill-foreground font-mono text-[11px]'
              >
                {node.label.length > 26
                  ? node.label.slice(0, 25) + '…'
                  : node.label}
              </text>
              <text
                x={point.x}
                y={point.y + 14}
                textAnchor='middle'
                className='fill-muted-foreground text-[10px]'
              >
                {node.id === selectedId ? 'Selected' : 'Inspect details'}
              </text>
            </a>
          )
        })}
      </svg>
      {edges.length === 0 && (
        <p className='text-sm text-muted-foreground'>
          No relationships of this type are authored for this entry.
        </p>
      )}
    </div>
  )
}
