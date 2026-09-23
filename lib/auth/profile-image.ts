export function profileImageUrl(image: string | null | undefined) {
  if (!image) return null
  try {
    const url = new URL(image)
    if (
      url.hostname === 'pbs.twimg.com' &&
      url.pathname.startsWith('/profile_images/')
    ) {
      url.pathname = url.pathname.replace(
        /_(normal|bigger|mini)(\.[^/.]+)$/,
        '_400x400$2'
      )
      return url.toString()
    }
  } catch {
    // Preserve other providers' URLs unchanged.
  }
  return image
}
