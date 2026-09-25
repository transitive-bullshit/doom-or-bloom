const escape = (text: string) =>
  text.replace(
    /[&<>"']/g,
    (char) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&apos;'
      })[char]!
  )

/** Honest local fallback: typography and site identity, never a fabricated article image. */
export function bookmarkTitleCard(title: string, url: string) {
  const hostname = new URL(url).hostname.replace(/^www\./, '')
  const lines: string[] = []
  let line = ''
  for (const word of title.split(/\s+/)) {
    if (line && `${line} ${word}`.length > 31) {
      lines.push(line)
      line = ''
    }
    line = line ? `${line} ${word}` : word
  }
  if (line) lines.push(line)
  const visible = lines.slice(0, 5)
  if (lines.length > 5) visible[4] = `${visible[4]!.slice(0, 28)}…`
  return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400"><rect width="640" height="400" fill="#eeeae2"/><rect x="0" y="0" width="10" height="400" fill="#68856d"/><text x="40" y="46" font-family="sans-serif" font-size="16" letter-spacing="2" fill="#667066">SOURCE</text>${visible.map((text, index) => `<text x="40" y="${103 + index * 44}" font-family="sans-serif" font-size="30" font-weight="600" fill="#20261f">${escape(text)}</text>`).join('')}<line x1="40" y1="338" x2="600" y2="338" stroke="#c6cbc0"/><text x="40" y="372" font-family="sans-serif" font-size="20" fill="#52604f">${escape(hostname)}</text></svg>`
}

export function bookmarkSiteMark(url: string) {
  const initial = new URL(url).hostname
    .replace(/^www\./, '')
    .charAt(0)
    .toUpperCase()
  return `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" rx="12" fill="#e1e7dc"/><text x="32" y="44" text-anchor="middle" font-family="sans-serif" font-weight="600" font-size="38" fill="#344733">${escape(initial)}</text></svg>`
}
