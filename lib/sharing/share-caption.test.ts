import { describe, expect, it } from 'vitest'
import { intentUrl, shareCaption, shareUrl } from './share-caption'

describe('shareCaption', () => {
  it('quotes a stated number as the participant wrote it', () => {
    expect(
      shareCaption({
        risk: { source: 'stated', token: 'less than 5%' },
        closest: 'Andrej Karpathy'
      })
    ).toBe(
      'My P(doom) is less than 5%, and my AI worldview lands closest to Andrej Karpathy\n\nWhere do you land?'
    )
  })

  it('credits the tool for an inferred number', () => {
    expect(shareCaption({ risk: { source: 'inferred', token: '≈8%' } })).toBe(
      'Doom or Bloom reads my P(doom) as ~8%\n\nWhere do you land?'
    )
    expect(
      shareCaption({ risk: { source: 'inferred', token: '<1%' } })
    ).toContain('as under 1%')
  })

  it('falls back when the number is unclear or missing', () => {
    expect(
      shareCaption({
        risk: { source: 'inferred', token: 'Unclear' },
        closest: 'Tyler Cowen'
      })
    ).toBe(
      'Just mapped my AI worldview. It lands closest to Tyler Cowen\n\nWhere do you land?'
    )
    expect(shareCaption({})).toBe(
      'Just mapped my AI worldview in about 3 minutes\n\nWhere do you land?'
    )
  })

  it('fits X and Bluesky limits with a link', () => {
    const caption = shareCaption({
      risk: { source: 'stated', token: 'somewhere between 10% and 20%' },
      closest: 'Jürgen Schmidhuber'
    })
    // X counts a link as 23 characters; Bluesky counts the whole URL.
    expect(caption.length + 25).toBeLessThanOrEqual(280)
    expect(
      caption.length +
        2 +
        'https://www.doom-or-bloom.com/?ref=share-bluesky'.length
    ).toBeLessThanOrEqual(300)
  })
})

describe('share links', () => {
  it('tags the link with the share surface', () => {
    expect(shareUrl('https://www.doom-or-bloom.com/', 'copy_link')).toBe(
      'https://www.doom-or-bloom.com/?ref=share-copy-link'
    )
    expect(
      shareUrl('https://www.doom-or-bloom.com/public/assessments/abc', 'x')
    ).toBe('https://www.doom-or-bloom.com/public/assessments/abc?ref=share-x')
  })

  it('builds each composer URL', () => {
    const link = 'https://www.doom-or-bloom.com/?ref=share-x'
    expect(intentUrl('x', 'Hi', link)).toBe(
      `https://x.com/intent/post?text=Hi&url=${encodeURIComponent(link)}`
    )
    expect(intentUrl('bluesky', 'Hi', link)).toContain(
      encodeURIComponent(`Hi\n\n${link}`)
    )
    expect(intentUrl('linkedin', 'Hi', link)).not.toContain('Hi')
  })
})
