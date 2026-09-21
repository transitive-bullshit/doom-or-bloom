'use client'

import { useState, type RefObject } from 'react'
import { CopyIcon, DownloadIcon, EllipsisIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu'
import { mapPng } from '@/lib/sharing/map-png'
import { downloadBlob } from '@/lib/sharing/report'

export function MapActions({
  svg,
  title,
  legend
}: {
  svg: RefObject<SVGSVGElement | null>
  title: string
  legend: string
}) {
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')
  const exportImage = async (copy: boolean) => {
    if (!svg.current || busy) return
    setBusy(true)
    setStatus('')
    try {
      if (
        copy &&
        (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined')
      ) {
        throw new Error(
          'Image copying is unavailable here. Choose Download PNG instead.'
        )
      }
      const png = mapPng(svg.current, title, legend)
      if (copy) {
        // Start the clipboard write inside the user gesture, including on Safari.
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': png })
        ])
      } else {
        downloadBlob(await png, 'doom-or-bloom-map.png')
      }
      setStatus(copy ? 'Map copied as PNG.' : 'Map downloaded as PNG.')
    } catch (err) {
      setStatus(
        err instanceof Error
          ? `${err.message} You can also try Download PNG.`
          : 'Image export failed. Please try again.'
      )
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className='relative'>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            size='icon'
            disabled={busy}
            aria-label='Map image actions'
          >
            <EllipsisIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={() => void exportImage(true)}>
              <CopyIcon />
              Copy PNG
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => void exportImage(false)}>
              <DownloadIcon />
              Download PNG
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      {status && (
        <p
          role='status'
          className='absolute top-full right-0 z-10 mt-2 w-60 rounded-lg border bg-popover p-3 text-xs text-popover-foreground shadow-md'
        >
          {status}
        </p>
      )}
    </div>
  )
}
