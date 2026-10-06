import { describe, expect, it } from 'vitest'
import {
  citationParts,
  citedKeys,
  footnoteRegistry,
  segments,
  withBylines,
  type Source
} from './citations'

const source = (url: string): Source => ({
  title: `Title of ${url}`,
  url,
  by: 'Nick Bostrom',
  year: 2002
})

describe('shared citations', () => {
  it('split prose into text, titles and markers', () => {
    expect(segments('See *Superintelligence*,[^bostrom-2014] page 4.')).toEqual(
      [
        { text: 'See ' },
        { emphasis: 'Superintelligence' },
        { text: ',' },
        { cite: 'bostrom-2014' },
        { text: ' page 4.' }
      ]
    )
    // Markdown already turned *emphasis* into markup, so only markers split.
    expect(citationParts('A *b* c.[^x-risk][^ai-2027]')).toEqual([
      { text: 'A *b* c.' },
      { cite: 'x-risk' },
      { cite: 'ai-2027' }
    ])
    expect(citationParts('[^Bad] and [^-no] stay text')).toEqual([
      { text: '[^Bad] and [^-no] stay text' }
    ])
  })

  it('list cited keys in order of first citation', () => {
    expect(citedKeys('a[^two] b[^one] c[^two]')).toEqual(['two', 'one'])
  })

  it('number each source once, by first citation', () => {
    const { cite, footnotes } = footnoteRegistry()
    expect(cite(source('https://a.example'))).toEqual({
      number: 1,
      id: 'cite-1'
    })
    expect(cite(source('https://b.example')).number).toBe(2)
    expect(cite(source('https://a.example'))).toEqual({ number: 1 })
    expect(footnotes.map(({ number, url }) => [number, url])).toEqual([
      [1, 'https://a.example'],
      [2, 'https://b.example']
    ])
    expect(withBylines(footnotes)[0]!.byline).toEqual([
      { text: 'Nick Bostrom' }
    ])
  })
})
