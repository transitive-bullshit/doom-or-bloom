import { loadExamples } from '../components/landing/data'
import { build as bundle } from 'esbuild'
import { build as frontend } from 'vite'
import { mkdir, writeFile, copyFile, rm, readFile } from 'node:fs/promises'
import path from 'node:path'
import { loadBundle } from '../lib/content/loader'
import { supportedContentVersions } from '../lib/assessment/schema'
import { runIndex, suiteSchema } from '../lib/journeys/schema'
import { withJourneyExperiments } from '../lib/journeys/experiments'
import { personas } from '../lib/journeys/catalog'
import { fixedUserPersona } from '../lib/journeys/fixed'

const root = process.cwd()
const output = path.join(root, 'dist')
const generated = path.join(root, 'sites/generated')
await rm(output, { recursive: true, force: true })
await mkdir(generated, { recursive: true })
const content = loadBundle()
// Publish committed snapshots, never machine-local ignored runs.
const suite = await withJourneyExperiments(
  root,
  suiteSchema.parse(
    JSON.parse(
      await readFile('eval/development/live-persona-journeys.json', 'utf8')
    )
  )
)
const json = (file: string, data: unknown) =>
  writeFile(file, JSON.stringify(data))
await json(path.join(generated, 'props.json'), {
  landing: (await loadExamples()).map(({ result, ...person }) => ({
    ...person,
    outlook: result.horizontal.value,
    transformation: result.experiment?.transformation.value ?? null
  })),
  interview: {
    model: 'jev-1.13.0',
    fixtureMode: false,
    debugDefault: true,
    debugAvailable: true,
    analyticsEnabled: false,
    analyticsCatalog: {
      prompts: Object.fromEntries(content.prompts.map((p) => [p.id, p.family])),
      resources: content.resources.map((r) => r.id)
    },
    dimensions: [
      ...content.rubric.dimensions.map(({ id, label, meaning }) => ({
        id,
        label,
        meaning
      })),
      { id: 'catastrophic_risk', ...content.rubric.catastrophicRisk }
    ],
    recoveryCopy: Object.fromEntries(
      content.prompts.map((p) => [p.id, p.recoveryVariants])
    )
  },
  journeys: {
    personas: [...personas, fixedUserPersona],
    runs: [runIndex(suite)],
    dimensions: content.rubric.dimensions,
    contentVersion: content.manifest.contentVersion
  }
})
await json(
  path.join(generated, 'bundles.json'),
  Object.fromEntries(supportedContentVersions.map((v) => [v, loadBundle(v)]))
)
await writeFile(
  path.join(generated, 'loader.ts'),
  `import bundles from './bundles.json'\nimport type { Bundle } from '../../lib/content/loader'\nexport function loadBundle(version = '${content.manifest.contentVersion}'): Bundle { const value = bundles[version as keyof typeof bundles]; if (!value) throw new Error('Unsupported content version'); return value as unknown as Bundle }\n`
)
await frontend({
  configFile: false,
  root: path.join(root, 'sites'),
  publicDir: path.join(root, 'public'),
  resolve: {
    alias: {
      '@': root,
      'next/link': path.join(root, 'sites/link.tsx'),
      'next/image': path.join(root, 'sites/image.tsx')
    }
  },
  define: {
    'process.env.NEXT_PUBLIC_ANALYTICS_ENABLED': '"false"',
    'process.env.NEXT_PUBLIC_POSTHOG_KEY': '""',
    'process.env.NEXT_PUBLIC_POSTHOG_HOST': '""'
  },
  build: {
    outDir: path.join(output, 'client'),
    emptyOutDir: false,
    target: 'es2022'
  },
  css: { postcss: root }
})
await copyFile(
  path.join(generated, 'props.json'),
  path.join(output, 'client/site-props.json')
)
await mkdir(path.join(output, 'client/journeys'), { recursive: true })
for (const journey of suite.journeys)
  await json(
    path.join(output, 'client/journeys', `${journey.personaId}.json`),
    { run: runIndex(suite), journey }
  )
await bundle({
  entryPoints: ['sites/worker.ts'],
  outfile: 'dist/server/index.js',
  bundle: true,
  format: 'esm',
  platform: 'neutral',
  target: 'es2022',
  conditions: ['workerd', 'worker', 'import'],
  mainFields: ['module', 'main'],
  external: ['node:*'],
  alias: {
    'server-only': path.join(root, 'sites/empty.ts'),
    '@/lib/content/loader': path.join(generated, 'loader.ts')
  },
  define: {
    'process.env.NODE_ENV': '"production"',
    'process.env.ASSESSMENT_PROVIDER': '"live"',
    'process.env.NEXT_PUBLIC_ASSESSMENT_DEBUG': '"true"',
    'process.env.NEXT_PUBLIC_ANALYTICS_ENABLED': '"false"'
  },
  plugins: [
    {
      name: 'wasm-modules',
      setup(build) {
        build.onResolve({ filter: /\.wasm$/ }, async (args) => {
          const file = path.resolve(args.resolveDir, args.path)
          const name = path.basename(file)
          await mkdir(path.join(output, 'server'), { recursive: true })
          await copyFile(file, path.join(output, 'server', name))
          return { path: './' + name, external: true }
        })
      }
    }
  ]
})
await mkdir(path.join(output, '.openai'), { recursive: true })
await copyFile(
  '.openai/hosting.json',
  path.join(output, '.openai/hosting.json')
)
console.log(
  'Built Sites client, live Jev worker, and current journey snapshots.'
)
