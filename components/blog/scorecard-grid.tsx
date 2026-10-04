'use client'

import { useState } from 'react'
import { LevelMark, type ScorecardLevel } from './level-mark'

type Column = { key: string; label: string; detail: string }
type Row = {
  key: string
  label: string
  detail?: string
  highlight?: boolean
  cells: Record<string, { level: ScorecardLevel; note: string }>
}

/**
 * The interactive half of DataScorecard. Wide screens get the full matrix,
 * whose cells open their note on hover, tap or focus. Phones pick one
 * approach at a time and read every criterion with its note.
 */
export function ScorecardGrid({
  columns,
  rows,
  levels,
  hint
}: {
  columns: Column[]
  rows: Row[]
  levels: Record<ScorecardLevel, string>
  hint: string
}) {
  const [selected, setSelected] = useState({
    row: rows[0]!.key,
    column: columns[0]!.key
  })
  const [hovered, setHovered] = useState<typeof selected | null>(null)
  const [phoneRow, setPhoneRow] = useState(rows[0]!.key)
  const active = hovered ?? selected
  const activeRow = rows.find((row) => row.key === active.row)!
  const activeColumn = columns.find((column) => column.key === active.column)!
  const activeCell = activeRow.cells[activeColumn.key]!
  const shownRow = rows.find((row) => row.key === phoneRow)!
  const overview = {
    gridTemplateColumns: `minmax(0, 1fr) repeat(${columns.length}, 1.375rem)`
  }

  return (
    <>
      <div className='hidden flex-col gap-3 md:flex'>
        <table className='w-full table-fixed border-collapse text-sm'>
          <colgroup>
            <col className='w-36' />
            {columns.map((column) => (
              <col key={column.key} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <td />
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope='col'
                  className={`px-0.5 pb-2 text-center align-bottom text-xs leading-tight font-semibold ${column.key === active.column ? 'text-foreground' : 'text-muted-foreground'}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.key}
                className={`border-t ${row.highlight ? 'bg-chart-coral/8' : ''}`}
              >
                <th
                  scope='row'
                  className={`py-2 pr-2 pl-2 text-left align-middle font-medium ${row.highlight ? 'border-l-4 border-chart-coral' : 'border-l-4 border-transparent'}`}
                >
                  {row.label}
                  {row.detail && (
                    <span className='block text-xs font-normal text-muted-foreground'>
                      {row.detail}
                    </span>
                  )}
                </th>
                {columns.map((column) => {
                  const cell = row.cells[column.key]!
                  const isActive =
                    row.key === active.row && column.key === active.column
                  const target = { row: row.key, column: column.key }
                  return (
                    <td key={column.key} className='p-0 text-center'>
                      <button
                        type='button'
                        aria-pressed={
                          row.key === selected.row &&
                          column.key === selected.column
                        }
                        aria-label={`${row.label}, ${column.label}: ${levels[cell.level]}. ${cell.note}`}
                        onPointerEnter={() => setHovered(target)}
                        onPointerLeave={() => setHovered(null)}
                        onFocus={() => setSelected(target)}
                        onClick={() => {
                          setSelected(target)
                          setHovered(null)
                        }}
                        className={`mx-auto flex size-9 items-center justify-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring ${isActive ? 'bg-muted ring-1 ring-foreground/30' : 'hover:bg-muted'}`}
                      >
                        <LevelMark
                          level={cell.level}
                          highlight={row.highlight}
                        />
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <p className='text-xs text-muted-foreground'>{hint}</p>
        <div
          aria-live='polite'
          className={`flex min-h-28 flex-col gap-1.5 rounded-xl border-l-4 bg-muted/60 p-4 text-sm ${activeRow.highlight ? 'border-chart-coral' : 'border-chart-ink'}`}
        >
          <p className='flex flex-wrap items-center gap-x-2 gap-y-1 font-semibold'>
            <LevelMark
              level={activeCell.level}
              highlight={activeRow.highlight}
            />
            <span>
              {activeRow.label} · {activeColumn.label}
            </span>
            <span className='font-normal text-muted-foreground'>
              {levels[activeCell.level]}
            </span>
          </p>
          <p className='text-body-foreground'>{activeCell.note}</p>
          <p className='text-xs text-muted-foreground'>{activeColumn.detail}</p>
        </div>
      </div>

      <div className='flex flex-col gap-4 md:hidden'>
        {/* A compact overview: every approach's marks, numbered by
            criterion. Tapping a row opens its reasons below. */}
        <div className='flex flex-col'>
          <div
            aria-hidden
            className='grid items-end gap-x-1 pb-1 text-center text-[11px] text-muted-foreground tabular-nums'
            style={overview}
          >
            <span />
            {columns.map((column, index) => (
              <span key={column.key}>{index + 1}</span>
            ))}
          </div>
          {rows.map((row) => (
            <button
              key={row.key}
              type='button'
              aria-pressed={row.key === phoneRow}
              onClick={() => setPhoneRow(row.key)}
              className={`grid items-center gap-x-1 border-t py-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring ${row.key === phoneRow ? 'bg-muted' : ''} ${row.highlight ? 'border-l-4 border-l-chart-coral pl-1.5' : 'pl-2.5'}`}
              style={overview}
            >
              <span
                className={`text-xs leading-tight ${row.key === phoneRow ? 'font-semibold' : ''}`}
              >
                {row.label}
              </span>
              {columns.map((column) => (
                <span key={column.key} className='flex justify-center'>
                  <LevelMark
                    level={row.cells[column.key]!.level}
                    highlight={row.highlight}
                  />
                </span>
              ))}
            </button>
          ))}
          <ol
            aria-hidden
            className='grid grid-cols-2 gap-x-3 gap-y-0.5 border-t pt-2 text-xs text-muted-foreground'
          >
            {columns.map((column, index) => (
              <li key={column.key} className='flex gap-1.5'>
                <span className='w-3 text-right tabular-nums'>{index + 1}</span>
                {column.label}
              </li>
            ))}
          </ol>
        </div>
        <div
          aria-live='polite'
          className={`flex flex-col gap-3 rounded-xl border-l-4 bg-muted/60 p-4 ${shownRow.highlight ? 'border-chart-coral' : 'border-chart-ink'}`}
        >
          <p className='text-sm font-semibold'>
            {shownRow.label}
            {shownRow.detail && (
              <span className='block text-xs font-normal text-muted-foreground'>
                {shownRow.detail}
              </span>
            )}
          </p>
          <ul className='flex flex-col gap-3'>
            {columns.map((column) => {
              const cell = shownRow.cells[column.key]!
              return (
                <li key={column.key} className='flex gap-2.5 text-sm'>
                  <span className='pt-0.5'>
                    <LevelMark
                      level={cell.level}
                      highlight={shownRow.highlight}
                    />
                  </span>
                  <span className='flex flex-col gap-0.5'>
                    <span className='font-medium'>
                      {column.label}
                      <span className='font-normal text-muted-foreground'>
                        {' · '}
                        {levels[cell.level]}
                      </span>
                    </span>
                    <span className='text-body-foreground'>{cell.note}</span>
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </>
  )
}
