const svgNamespace = 'http://www.w3.org/2000/svg'

/** Export the visible plot locally, resolving theme tokens before leaving the DOM. */
export async function mapPng(
  svg: SVGSVGElement,
  title: string,
  legend: string
): Promise<Blob> {
  const theme = getComputedStyle(svg)
  const clone = svg.cloneNode(true) as SVGSVGElement
  const originals = [svg, ...svg.querySelectorAll('*')]
  const copies = [clone, ...clone.querySelectorAll('*')]
  originals.forEach((element, index) => {
    const copy = copies[index] as SVGElement
    const style = getComputedStyle(element)
    // SVG presentation styles must survive without the page's CSS or fonts.
    for (const property of [
      'fill',
      'stroke',
      'stop-color',
      'font-size',
      'font-weight',
      'font-family',
      'opacity'
    ]) {
      let value = style.getPropertyValue(property)
      value = value.replace(/url\(["']?[^)]*#([^"')]+)["']?\)/g, 'url(#$1)')
      copy.style.setProperty(property, value)
    }
    copy.removeAttribute('class')
  })
  // SVGs drawn to canvas cannot load external image references. Embed portraits
  // so a persona's marker survives copying or downloading the map as a PNG.
  await Promise.all(
    [...clone.querySelectorAll('image')].map(async (portrait) => {
      const href = portrait.getAttribute('href')
      if (!href || href.startsWith('data:')) return
      const response = await fetch(href)
      if (!response.ok)
        throw new Error('Could not load the portrait for export.')
      const blob = await response.blob()
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = () =>
          reject(new Error('Could not read the portrait for export.'))
        reader.readAsDataURL(blob)
      })
      portrait.setAttribute('href', dataUrl)
    })
  )
  clone.setAttribute('xmlns', svgNamespace)
  clone.setAttribute('viewBox', '0 0 680 490')
  clone.setAttribute('width', '1360')
  clone.setAttribute('height', '980')
  const surface = theme.getPropertyValue('--map-surface').trim() || '#f7f6f2'
  const foreground = theme.getPropertyValue('--map-text').trim() || '#22252a'
  const muted = theme.getPropertyValue('--map-muted').trim() || '#646a71'
  const group = document.createElementNS(svgNamespace, 'g')
  group.setAttribute('transform', 'translate(0 55)')
  while (clone.firstChild) group.appendChild(clone.firstChild)
  const background = document.createElementNS(svgNamespace, 'rect')
  background.setAttribute('width', '680')
  background.setAttribute('height', '490')
  background.setAttribute('fill', surface)
  clone.append(background, group)
  const label = (text: string, y: number, size: number, fill: string) => {
    const node = document.createElementNS(svgNamespace, 'text')
    node.setAttribute('x', '30')
    node.setAttribute('y', String(y))
    node.setAttribute('font-family', 'sans-serif')
    node.setAttribute('font-size', String(size))
    node.setAttribute('fill', fill)
    node.textContent = text
    clone.appendChild(node)
  }
  label(title, 34, 21, foreground)
  label(legend, 457, 12, muted)
  label(
    'Doom or Bloom · Coordinates describe beliefs, not event probabilities',
    478,
    11,
    muted
  )
  const serialized = new XMLSerializer()
    .serializeToString(clone)
    .replace(/var\((--[\w-]+)\)/g, (_, token: string) =>
      theme.getPropertyValue(token).trim()
    )
  const url = URL.createObjectURL(
    new Blob([serialized], { type: 'image/svg+xml;charset=utf-8' })
  )
  try {
    const image = new Image()
    image.src = url
    await image.decode()
    const canvas = document.createElement('canvas')
    canvas.width = 1360
    canvas.height = 980
    const context = canvas.getContext('2d')
    if (!context)
      throw new Error('Image export is unavailable in this browser.')
    context.drawImage(image, 0, 0)
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (blob) =>
          blob
            ? resolve(blob)
            : reject(new Error('Could not create the image.')),
        'image/png'
      )
    )
  } finally {
    URL.revokeObjectURL(url)
  }
}
