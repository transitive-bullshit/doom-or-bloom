import { ImageResponse } from 'takumi-js/response'
import { ShareCard } from '@/lib/sharing/card'
export const runtime = 'nodejs'
export const alt = 'Doom or Bloom: map your AI worldview in three questions'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export default function Image() {
  return new ImageResponse(ShareCard({}), { ...size, emoji: 'from-font' })
}
