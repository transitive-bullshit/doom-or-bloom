import { loadBundle } from '../lib/content/loader'
const bundle = loadBundle()
console.log(
  `Validated ${bundle.prompts.length} prompts, ${bundle.references.length} references, ${bundle.findings.length} findings, ${bundle.resources.length} resources. Status: ${bundle.manifest.status}.`
)
