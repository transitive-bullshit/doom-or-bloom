import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const types = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.map': 'application/json',
  '.woff2': 'font/woff2',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.wav': 'audio/wav',
  '.json': 'application/json'
}

/**
 * Static server: `/` → index.html, `/dist/*` → build output, `/personas/*` → the
 * app's own portraits (../public/personas), everything else → `public/*`.
 */
export function startServer(port = 0) {
  const server = createServer(async (req, res) => {
    const path = normalize(
      decodeURIComponent(new URL(req.url, 'http://x').pathname)
    )
    const file =
      path === '/'
        ? join(root, 'index.html')
        : path.startsWith('/dist/')
          ? join(root, path)
          : path.startsWith('/personas/')
            ? join(root, '..', 'public', path)
            : join(root, 'public', path)
    try {
      const body = await readFile(file)
      res.writeHead(200, {
        'content-type': types[extname(file)] ?? 'application/octet-stream',
        'cache-control': 'no-store'
      })
      res.end(body)
    } catch {
      res.writeHead(404).end('not found')
    }
  })
  return new Promise((resolve) =>
    server.listen(port, '127.0.0.1', () =>
      resolve({
        url: `http://127.0.0.1:${server.address().port}/`,
        close: () => server.close()
      })
    )
  )
}

export const chromeArgs = [
  '--use-angle=metal',
  '--enable-gpu',
  '--ignore-gpu-blocklist',
  '--disable-background-timer-throttling',
  '--disable-renderer-backgrounding',
  '--disable-backgrounding-occluded-windows'
]

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { url } = await startServer(Number(process.env.PORT ?? 4747))
  console.log(`Preview: ${url}?preview`)
}
