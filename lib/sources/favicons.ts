import previews from '@/lib/sharing/resource-previews.json'

// Favicons come from the committed resource previews (`pnpm resources:previews`,
// which also covers every source the hub, About and blog posts cite), never
// from third-party hosts at runtime.

type Preview = { icon?: string; iconKind?: 'publisher' | 'monogram' }
const catalog = previews as Record<string, Preview>
const host = (url: string) => new URL(url).hostname.replace(/^www\./, '')

const siteIcons = new Map<string, string>()
for (const [url, { icon, iconKind }] of Object.entries(catalog))
  if (icon && iconKind !== 'monogram' && !siteIcons.has(host(url)))
    siteIcons.set(host(url), icon)

/**
 * A local favicon for a linked page: its own publisher icon, else one from the
 * same site (X posts are never prefetched individually), else its monogram.
 */
export function sourceIcon(url: string): string | undefined {
  const own = catalog[url]
  if (own?.icon && own.iconKind !== 'monogram') return own.icon
  return siteIcons.get(host(url)) ?? own?.icon
}
