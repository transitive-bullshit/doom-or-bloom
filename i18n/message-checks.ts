// Structural checks for message catalogs, shared by the unit tests, content
// validation (`pnpm test:content`) and the translation tool.

export type Catalog = { [key: string]: string | Catalog }

/** Every message of a catalog by its dotted key. */
export function flattenMessages(
  catalog: Catalog,
  prefix = ''
): Map<string, string> {
  const entries = new Map<string, string>()
  for (const [key, value] of Object.entries(catalog)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'string') entries.set(path, value)
    else for (const entry of flattenMessages(value, path)) entries.set(...entry)
  }
  return entries
}

/**
 * The ICU arguments (with their select/plural type) and rich-text tags a
 * message uses, including those nested in select and plural branches. Branch
 * keys may differ between languages, but every select or plural needs `other`.
 */
export function messageSignature(message: string) {
  const args = new Set<string>()
  const tags = new Set<string>()
  const missingOther: string[] = []
  let i = 0
  const rest = () => message.slice(i)
  const skipSpace = () => {
    while (/\s/u.test(message[i] ?? '')) i++
  }
  function parseMessage() {
    while (i < message.length && message[i] !== '}') {
      if (message[i] === '{') parseArgument()
      else if (message[i] === '<') {
        const tag = /^<\/?([a-z][\w-]*)\s*\/?>/iu.exec(rest())
        if (tag) {
          tags.add(tag[1]!)
          i += tag[0].length
        } else i++
      } else i++
    }
  }
  function parseArgument() {
    i++
    const header = /^\s*(\w+)\s*(?:,\s*(\w+)\s*)?/u.exec(rest())
    if (!header) throw new Error(`Malformed argument in “${message}”`)
    const [matched, name, type] = header
    i += matched.length
    args.add(type ? `${name}:${type}` : name!)
    if (type === 'select' || type === 'plural' || type === 'selectordinal') {
      i++ // the comma before the branches
      const keys: string[] = []
      for (;;) {
        const branch = /^\s*(?:offset:\d+\s*)?(=?[\w-]+)\s*\{/u.exec(rest())
        if (!branch) break
        keys.push(branch[1]!)
        i += branch[0].length
        parseMessage()
        i++
      }
      if (!keys.includes('other')) missingOther.push(name!)
    } else while (i < message.length && message[i] !== '}') i++
    skipSpace()
    if (message[i] !== '}') throw new Error(`Unclosed argument in “${message}”`)
    i++
  }
  parseMessage()
  if (i < message.length) throw new Error(`Unbalanced braces in “${message}”`)
  return {
    empty: !message.trim(),
    arguments: [...args].toSorted(),
    tags: [...tags].toSorted(),
    missingOther
  }
}

/**
 * How a translated catalog differs structurally from English: missing or
 * extra keys, empty or unparsable messages, and different ICU arguments,
 * rich-text tags or a select/plural without `other`.
 */
export function messageProblems(english: Catalog, translated: Catalog) {
  const source = flattenMessages(english)
  const target = flattenMessages(translated)
  const problems: string[] = []
  for (const [key, message] of source) {
    const text = target.get(key)
    if (text === undefined) {
      problems.push(`missing ${key}`)
      continue
    }
    try {
      const expected = messageSignature(message)
      const actual = messageSignature(text)
      if (actual.empty) problems.push(`empty ${key}`)
      if (actual.missingOther.length) problems.push(`no other branch in ${key}`)
      if (
        actual.arguments.join() !== expected.arguments.join() ||
        actual.tags.join() !== expected.tags.join()
      )
        problems.push(`arguments or tags differ in ${key}`)
    } catch (err) {
      problems.push(`${key}: ${(err as Error).message}`)
    }
  }
  for (const key of target.keys())
    if (!source.has(key)) problems.push(`extra ${key}`)
  return problems
}
