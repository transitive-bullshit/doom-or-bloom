import { personas } from '../data/personas'

const images = new Map<string, HTMLImageElement>()

const fonts: [string, string, FontFaceDescriptors][] = [
  [
    'Inter Tight',
    'fonts/InterTight.woff2',
    { weight: '100 900', style: 'normal' }
  ],
  [
    'Inter Tight',
    'fonts/InterTight-Italic.woff2',
    { weight: '100 900', style: 'italic' }
  ],
  [
    'Instrument Serif',
    'fonts/InstrumentSerif-Regular.woff2',
    { weight: '400', style: 'normal' }
  ],
  [
    'Instrument Serif',
    'fonts/InstrumentSerif-Italic.woff2',
    { weight: '400', style: 'italic' }
  ],
  [
    'JetBrains Mono',
    'fonts/JetBrainsMono.woff2',
    { weight: '100 800', style: 'normal' }
  ]
]

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.decoding = 'sync'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load ${src}`))
    img.src = src
  })

export async function loadAssets() {
  await Promise.all(
    fonts.map(async ([family, url, desc]) => {
      const face = new FontFace(family, `url(${url})`, desc)
      await face.load()
      document.fonts.add(face)
    })
  )
  await Promise.all(
    personas.map(async (p) => {
      const img = await loadImage(`personas/${p.img}`)
      await img.decode()
      images.set(p.slug, img)
    })
  )
  // Warm up every font/weight combination so the first frame is not special.
  const c = document.createElement('canvas').getContext('2d')!
  for (const f of [
    '900 40px "Inter Tight"',
    '800 40px "Inter Tight"',
    '700 40px "Inter Tight"',
    '600 40px "Inter Tight"',
    '500 40px "Inter Tight"',
    '400 40px "Inter Tight"',
    'italic 400 40px "Instrument Serif"',
    '400 40px "Instrument Serif"',
    '500 40px "JetBrains Mono"',
    '700 40px "JetBrains Mono"'
  ]) {
    c.font = f
    c.fillText('Doom or Bloom?', 0, 40)
  }
  await document.fonts.ready
}

export const face = (slug: string) => {
  const img = images.get(slug)
  if (!img) throw new Error(`Missing portrait ${slug}`)
  return img
}
