'use client'

/**
 * Copies text that may still be loading, such as a share link created by the
 * click. Safari keeps the click's permission only for a write started during
 * it, which a ClipboardItem with a pending value allows; elsewhere the text is
 * written once it resolves. A rejected text rejects with its own error.
 */
export async function copyText(text: Promise<string>) {
  if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/plain': text.then(
            (value) => new Blob([value], { type: 'text/plain' })
          )
        })
      ])
      return
    } catch {
      /* Fall back to writing the resolved text. */
    }
  }
  await navigator.clipboard.writeText(await text)
}
