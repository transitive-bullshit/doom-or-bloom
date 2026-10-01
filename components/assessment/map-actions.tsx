'use client'

import { useState, type RefObject } from 'react'
import { toast } from 'sonner'
import { CopyIcon, DownloadIcon, EllipsisIcon } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
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

export function MapActions({ svg }: { svg: RefObject<SVGSVGElement | null> }) {
  const t = useTranslations('Map')
  const locale = useLocale()
  const [busy, setBusy] = useState(false)
  const exportImage = async (copy: boolean) => {
    if (!svg.current || busy) return
    setBusy(true)
    try {
      if (
        copy &&
        (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined')
      ) {
        throw new Error(
          'Image copying is unavailable here. Choose Download PNG instead.'
        )
      }
      const png = mapPng(svg.current, {
        title: t('question', { axis: 'transformation' }),
        locale
      })
      if (copy) {
        // Start the clipboard write inside the user gesture, including on Safari.
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': png })
        ])
      } else {
        downloadBlob(await png, 'doom-or-bloom-map.png')
      }
      toast.success(copy ? t('copied') : t('downloaded'))
    } catch {
      toast.error(copy ? t('copyFailed') : t('downloadFailed'))
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
            aria-label={t('actions')}
          >
            <EllipsisIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' side='top'>
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={() => void exportImage(true)}>
              <CopyIcon />
              {t('copyPng')}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => void exportImage(false)}>
              <DownloadIcon />
              {t('downloadPng')}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
