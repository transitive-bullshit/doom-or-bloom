'use client'

import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'
import { Map } from '@/components/assessment/worldview-map'
import { api } from '@/lib/assessments/client'
import type { OwnedAssessment } from '@/lib/assessments/repository'
import { emptyComponent } from '@/lib/assessment/projections'
import { experimentalAxes } from '@/lib/assessment/worldview-experiment'
import { loadDebugOperations } from '@/lib/debug/trace-storage'
import { mapPng } from './map-png'
import { serializeReport } from './report'
import { createReportZip } from './report-zip'

/** Render the same map used on the detail page, only while exporting. */
export async function savedReport(id: string, resultsImage: Promise<Blob>) {
  const [{ assessment }, operations] = await Promise.all([
    api<OwnedAssessment>(`/api/assessments/${id}`),
    loadDebugOperations(id).catch(() => [])
  ])
  if (!assessment.result) throw new Error('Results are not ready.')
  const container = document.createElement('div')
  container.style.cssText =
    'position:fixed;left:-10000px;top:0;width:720px;pointer-events:none'
  container.setAttribute('aria-hidden', 'true')
  container.inert = true
  document.body.append(container)
  const root = createRoot(container)
  try {
    flushSync(() =>
      root.render(
        <Map
          horizontal={assessment.result!.horizontal}
          vertical={
            assessment.result!.experiment?.transformation ??
            emptyComponent(
              'transformation',
              experimentalAxes.transformation.label
            )
          }
          axis='transformation'
          layout='contained'
        />
      )
    )
    const svg = container.querySelector<SVGSVGElement>(
      '[data-slot="worldview-map-svg"]'
    )!
    const [image, map] = await Promise.all([resultsImage, mapPng(svg)])
    return await createReportZip(
      serializeReport(assessment, operations),
      image,
      map
    )
  } finally {
    root.unmount()
    container.remove()
  }
}
