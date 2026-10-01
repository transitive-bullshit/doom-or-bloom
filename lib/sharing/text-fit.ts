// SVG labels are laid out before any text is measured (server rendering, PNG
// export and Takumi cards), so translated labels are sized from an estimate.
// Advance widths in ems, close to Arial and Helvetica and rounded up, so a
// label's box never clips its text.
const narrow = /[iljtfr.,:;'’|!()[\]\s·]/u
const wide = /[mwMW@%]/u
// CJK, Hangul and full-width forms take a full em.
const fullWidth = /[ᄀ-ᇿ⺀-鿿가-힯豈-﫿＀-￯]/u

/** Estimated rendered width of `text` in the units of `fontSize`. */
export function textWidth(text: string, fontSize: number, bold = false) {
  let ems = 0
  for (const char of text)
    ems += fullWidth.test(char)
      ? 1
      : narrow.test(char)
        ? 0.28
        : wide.test(char)
          ? 0.83
          : /\p{Lu}/u.test(char)
            ? 0.67
            : 0.54
  return ems * fontSize * (bold ? 1.05 : 1)
}

/** The largest font size up to `fontSize` at which `text` fits `maxWidth`. */
export function fitFontSize(
  text: string,
  fontSize: number,
  maxWidth: number,
  bold = false
) {
  const width = textWidth(text, fontSize, bold)
  return width <= maxWidth ? fontSize : (fontSize * maxWidth) / width
}

/** Width of a pill that holds `text` with `padding` on each side. */
export function pillWidth(
  text: string,
  fontSize: number,
  { padding = 12, minimum = 0, bold = true } = {}
) {
  return Math.max(
    minimum,
    Math.ceil(textWidth(text, fontSize, bold)) + 2 * padding
  )
}
