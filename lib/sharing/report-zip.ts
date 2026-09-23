import { strToU8, zip } from 'fflate'
import type { serializeReport } from './report'

/** Package locally; detailed answers and diagnostics never leave the browser. */
export async function createReportZip(
  report: ReturnType<typeof serializeReport>,
  resultsImage: Blob,
  mapImage: Blob
): Promise<Blob> {
  const [results, map] = await Promise.all([
    resultsImage.arrayBuffer(),
    mapImage.arrayBuffer()
  ])
  return new Promise((resolve, reject) => {
    zip(
      {
        'interview.md': strToU8(report.interview),
        'assessment.md': strToU8(report.markdown),
        'diagnostics.json': strToU8(report.json),
        'results.png': [new Uint8Array(results), { level: 0 }],
        'worldview-map.png': [new Uint8Array(map), { level: 0 }]
      },
      { level: 6 },
      (error, bytes) => {
        if (error) reject(error)
        else
          resolve(
            new Blob([new Uint8Array(bytes)], { type: 'application/zip' })
          )
      }
    )
  })
}
