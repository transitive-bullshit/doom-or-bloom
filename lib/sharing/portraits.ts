import { readFile } from 'node:fs/promises'
import path from 'node:path'

/** Embed checked-in profile photos so social rendering never needs a network fetch. */
export async function loadSocialPortrait(avatar: string): Promise<string> {
  const match = /^\/personas\/[a-z0-9-]+\.(jpg|png|webp)$/.exec(avatar)
  if (!match) throw new Error(`Invalid social portrait path: ${avatar}`)
  const bytes = await readFile(path.join(process.cwd(), 'public', avatar))
  const type = match[1] === 'jpg' ? 'jpeg' : match[1]
  return `data:image/${type};base64,${bytes.toString('base64')}`
}
