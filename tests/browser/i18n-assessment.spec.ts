import { readFileSync } from 'node:fs'
import type { Page } from '@playwright/test'
import { expect, test } from './fixtures'

// The Spanish interface, results, sharing and page bodies, and the authored
// questions and rubric levels from content/l10n.

const json = (file: string) => JSON.parse(readFileSync(file, 'utf8'))
const rubric = json('content/rubrics/0.1.0-draft/rubric.json') as {
  dimensions: { id: string; levels: string[] }[]
}
const spanishRubric = json('content/l10n/es/rubrics/0.1.0-draft.json') as {
  entries: Record<string, { text: string }>
}
/** The English and Spanish level texts of the result's impact dimensions. */
const impactLevels = rubric.dimensions
  .filter(({ id }) => ['beneficial_potential', 'risk_landscape'].includes(id))
  .flatMap(({ id, levels }) =>
    levels.map((english, index) => ({
      english,
      spanish: spanishRubric.entries[`level:${id}:${index}`]!.text
    }))
  )

/** Fails on any missing or malformed message in the rendered surfaces. */
function watchMessages(page: Page) {
  const problems: string[] = []
  page.on('console', (message) => {
    if (
      /MISSING_MESSAGE|FORMATTING_ERROR|INVALID_MESSAGE/u.test(message.text())
    )
      problems.push(message.text())
  })
  page.on('pageerror', (error) => problems.push(error.message))
  return problems
}

test('a Spanish interview starts, places a result and shares it in Spanish', async ({
  page,
  context
}) => {
  const problems = watchMessages(page)
  await page.goto('/es/assessment')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Mapea tu visión de la IA' })
  ).toBeVisible()
  await page
    .getByRole('link', { name: 'Mapea tu propia visión de la IA', exact: true })
    .last()
    .click()
  // The unsaved draft opens under the Spanish prefix.
  await expect(page).toHaveURL(/\/es\/assessments\/[a-f0-9-]+$/)
  const id = new URL(page.url()).pathname.split('/').at(-1)!
  await expect(page.locator('html')).toHaveAttribute('lang', 'es')
  await expect(
    page.getByText('Pregunta 1 de 4 · unos 3 minutos', { exact: true })
  ).toBeVisible()
  // The authored root question comes from the committed translation.
  await expect(page.getByRole('heading', { level: 2 }).first()).toHaveText(
    '¿Qué crees que significa la IA para nuestro futuro y por qué?'
  )

  // Fixture judgments place the map after one answer; this does not test live semantics.
  await page
    .getByRole('textbox', { name: 'Tu respuesta' })
    .fill('I expect useful tools and serious risks, depending on oversight.')
  await page.getByRole('button', { name: /^Continuar/u }).click()
  await expect(
    page.getByRole('progressbar', { name: 'Progreso de la entrevista' })
  ).toHaveAttribute('aria-valuetext', 'Pregunta 2 de 4')
  await page.getByRole('button', { name: 'Ver mis resultados' }).click()
  await expect(
    page.getByRole('heading', { name: 'Tus resultados están listos' })
  ).toBeVisible()
  await page.getByRole('button', { name: 'Omitir', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'Resultados', exact: true })
  ).toBeVisible()
  const results = page.getByRole('region', {
    name: 'Resultados de tu visión de la IA'
  })
  await expect(results).toContainText('Tu P(doom)')
  await expect(results).toContainText('Cambio civilizatorio')
  await expect(
    page.getByRole('heading', { name: '¿Cómo cambiará la IA el mundo?' })
  ).toBeVisible()
  await expect(
    page.getByRole('img', { name: /^Doom–Bloom: \d+ de 100\./u })
  ).toBeVisible()
  // "More details" quotes rubric levels, translated by ID.
  const details = page.getByRole('region', { name: 'Más detalles' })
  await expect(details).toBeVisible()
  const shown = await details.innerText()
  expect(impactLevels.some(({ spanish }) => shown.includes(spanish))).toBe(true)
  expect(impactLevels.some(({ english }) => shown.includes(english))).toBe(
    false
  )
  // The answered question in the conversation is translated too.
  await expect(
    page.getByRole('heading', {
      level: 4,
      name: '¿Qué crees que significa la IA para nuestro futuro y por qué?'
    })
  ).toBeVisible()

  const bar = page.getByRole('region', { name: 'Comparte tu resultado' })
  await expect(bar).toContainText('Tus respuestas permanecen privadas')
  await expect(bar).toContainText('¿Dónde te ubicas?')
  const x = new URL(
    (await bar
      .getByRole('link', { name: 'Publicar en X' })
      .getAttribute('href'))!
  )
  expect(x.searchParams.get('text')).toMatch(
    /visión de la IA[\s\S]*\n\n¿Dónde te ubicas\?$/u
  )
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await bar.getByRole('button', { name: 'Copiar enlace' }).click()
  await expect(
    page.getByText('Se copió el enlace.', { exact: true })
  ).toBeVisible()
  const copied = new URL(
    await page.evaluate(() => navigator.clipboard.readText())
  )
  // Shares keep the visitor's language: a card-only link under /es.
  expect(copied.pathname).toMatch(/^\/es\/s\/[A-Za-z0-9_-]{16}$/u)
  expect(copied.searchParams.get('ref')).toBe('share-copy-link')

  await bar.getByRole('button', { name: 'Publicar la evaluación' }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toContainText('¿Publicar la evaluación?')
  await dialog.getByRole('button', { name: 'Publicar la evaluación' }).click()
  await expect(bar).toContainText('Tus respuestas y resultados son públicos')
  await expect(
    bar.getByRole('link', { name: 'Ver la evaluación pública' })
  ).toHaveAttribute('href', `/es/public/assessments/${id}`)
  const published = new URL(
    (await bar
      .getByRole('link', { name: 'Publicar en X' })
      .getAttribute('href'))!
  ).searchParams.get('url')!
  expect(new URL(published).pathname).toBe(`/es/public/assessments/${id}`)

  // The Spanish public page and its social card.
  await page.goto(`/es/public/assessments/${id}`)
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Una visión de la IA compartida'
    })
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Conversación completa' })
  ).toBeVisible()
  const head = page.locator('head')
  await expect(head.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    'noindex, follow'
  )
  const image = new URL(
    (await head.locator('meta[property="og:image"]').getAttribute('content'))!
  )
  expect(image.pathname).toBe(`/es/public/assessments/${id}/social-image.png`)
  const card = await page.request.get(image.pathname)
  expect(card.status()).toBe(200)
  expect(card.headers()['content-type']).toBe('image/png')
  expect(problems).toEqual([])
})

test('the Spanish library and simulated users keep the Spanish interface', async ({
  page
}) => {
  const problems = watchMessages(page)
  await page.goto('/es/assessments')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Mis evaluaciones' })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Crear una evaluación nueva' })
  ).toBeVisible()

  await page.goto('/es/users/jensenhuang')
  const name = (await page.getByRole('heading', { level: 1 }).textContent())!
  await expect(
    page.getByRole('region', {
      name: `Resultados de la visión simulada de ${name.trim()}`
    })
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Evaluación simulada' })
  ).toBeVisible()
  await expect(page.locator('head meta[property="og:image"]')).toHaveAttribute(
    'content',
    /\/opengraph-image\?v=png-1&locale=es$/u
  )
  expect(problems).toEqual([])
})

test('About and Privacy read in Spanish and link within Spanish', async ({
  page
}) => {
  const problems = watchMessages(page)
  await page.goto('/es/about')
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Una conversación más clara sobre los futuros de la IA'
    })
  ).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'política de privacidad' })
  ).toHaveAttribute('href', '/es/privacy')
  await expect(
    page.getByRole('link', { name: 'código abierto' })
  ).toHaveAttribute(
    'href',
    'https://github.com/transitive-bullshit/doom-or-bloom'
  )

  await page.goto('/es/privacy')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Privacidad' })
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Adónde van las respuestas' })
  ).toBeVisible()
  await expect(
    page.getByText(/La analítica de páginas de Vercel está/u)
  ).toBeVisible()
  expect(problems).toEqual([])
})
