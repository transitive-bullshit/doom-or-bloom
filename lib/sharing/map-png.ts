import { resultMapExport, resultMapLayout } from './map-layout'

const svgNamespace = 'http://www.w3.org/2000/svg'

/** Prepare the visible plot for Takumi, resolving theme tokens before leaving the DOM. */
export async function mapPng(svg: SVGSVGElement): Promise<Blob> {
  const theme = getComputedStyle(svg)
  // Takumi's SVG decoder needs sRGB colors rather than browser-only color syntax.
  const colorCanvas = document.createElement('canvas')
  colorCanvas.width = colorCanvas.height = 1
  const colorContext = colorCanvas.getContext('2d')!
  const color = (value: string) => {
    if (!CSS.supports('color', value)) return value
    colorContext.clearRect(0, 0, 1, 1)
    colorContext.fillStyle = value
    colorContext.fillRect(0, 0, 1, 1)
    const [r, g, b, a] = colorContext.getImageData(0, 0, 1, 1).data
    return `rgba(${r}, ${g}, ${b}, ${a! / 255})`
  }
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
      'stop-opacity',
      'font-size',
      'font-weight',
      'font-family',
      'opacity'
    ]) {
      let value = style.getPropertyValue(property)
      // Export at a fixed size, independent of responsive on-screen label scaling.
      if (
        property === 'font-size' &&
        element.matches(
          '.map-axis-tick, .map-axis-caption, .map-pole, .prism-axis-label, .prism-pole'
        )
      ) {
        value = `${element.getAttribute('font-size') ?? 12}px`
      }
      value = value.replace(/url\(["']?[^)]*#([^"')]+)["']?\)/g, 'url(#$1)')
      copy.style.setProperty(
        property,
        ['fill', 'stroke', 'stop-color'].includes(property)
          ? color(value)
          : value
      )
    }
    // Restore the field's standard radius at the fixed export size.
    if (element.matches('[data-prism-field] > rect'))
      copy.setAttribute('rx', '8')
    copy.removeAttribute('class')
  })
  // SVGs drawn to canvas cannot load external image references. Embed portraits
  // so a persona's marker survives copying or downloading the map as a PNG.
  await Promise.all(
    [...clone.querySelectorAll('image')].map(async (portrait) => {
      // The displayed portrait is optimized for the small on-screen marker.
      // Use the original for our larger PNG so exports keep their resolution.
      const href =
        portrait.getAttribute('data-export-src') ??
        portrait.getAttribute('href')
      portrait.removeAttribute('data-export-src')
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
  const exportHeight = svg.viewBox.baseVal.height + resultMapLayout.exportHeader
  clone.setAttribute('viewBox', `0 0 680 ${exportHeight}`)
  clone.setAttribute('width', String(resultMapExport.width))
  clone.setAttribute('height', String(exportHeight * 2))
  const surface = theme.getPropertyValue('--map-surface').trim() || '#f7f6f2'
  const foreground = theme.getPropertyValue('--map-text').trim() || '#22252a'
  const group = document.createElementNS(svgNamespace, 'g')
  group.setAttribute(
    'transform',
    `translate(0 ${resultMapLayout.exportHeader})`
  )
  while (clone.firstChild) group.appendChild(clone.firstChild)
  const background = document.createElementNS(svgNamespace, 'rect')
  background.setAttribute('width', '680')
  background.setAttribute('height', String(exportHeight))
  background.setAttribute('fill', color(surface))
  clone.append(background, group)
  const label = (text: string, y: number, size: number, fill: string) => {
    const node = document.createElementNS(svgNamespace, 'text')
    node.setAttribute('x', '340')
    node.setAttribute('text-anchor', 'middle')
    node.setAttribute('y', String(y))
    node.setAttribute('font-family', 'sans-serif')
    node.setAttribute('font-size', String(size))
    node.setAttribute('font-weight', '500')
    node.setAttribute('fill', color(fill))
    node.textContent = text
    clone.appendChild(node)
  }
  label('How will AI change the world?', 34, 22, foreground)
  const serialized = new XMLSerializer()
    .serializeToString(clone)
    .replace(/var\((--[\w-]+)\)/g, (_, token: string) =>
      color(theme.getPropertyValue(token).trim())
    )
  const response = await fetch('/api/map-png', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ svg: serialized })
  })
  if (!response.ok)
    throw new Error('The graph could not be exported. Please try again.')
  return response.blob()
}
