/** Shared viewport and export dimensions for the results map. */
export const resultMapLayout = {
  width: 680,
  height: 348,
  exportHeader: 55
} as const

export const resultMapExport = {
  width: resultMapLayout.width * 2,
  height: (resultMapLayout.height + resultMapLayout.exportHeader) * 2
} as const
