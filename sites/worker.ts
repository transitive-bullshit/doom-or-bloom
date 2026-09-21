import { POST as assess } from '@/app/api/assessment/route'
import { POST as shareCard } from '@/app/api/share-card/route'

interface SiteEnv {
  ASSETS: { fetch: (request: Request) => Promise<Response> }
}

export default {
  async fetch(request: Request, env: SiteEnv) {
    const url = new URL(request.url)
    if (url.pathname === '/api/assessment' && request.method === 'POST')
      return assess(request)
    if (url.pathname === '/api/share-card' && request.method === 'POST')
      return shareCard(request)
    if (url.pathname === '/api/user-journeys' && request.method === 'GET') {
      const persona = url.searchParams.get('persona')
      if (!persona || !/^[a-z-]+$/.test(persona))
        return new Response('Invalid persona', { status: 400 })
      url.pathname = `/journeys/${persona}.json`
      url.search = ''
      return env.ASSETS.fetch(new Request(url, request))
    }
    if (url.pathname.startsWith('/api/'))
      return new Response('Not found', { status: 404 })
    const response = await env.ASSETS.fetch(request)
    if (response.status !== 404 || !['GET', 'HEAD'].includes(request.method))
      return response
    if (
      !['/', '/assessment', '/about', '/privacy', '/user-journeys'].includes(
        url.pathname
      ) &&
      !/^\/personas\/[a-z-]+$/.test(url.pathname)
    )
      return response
    url.pathname = '/'
    url.search = ''
    return env.ASSETS.fetch(new Request(url, request))
  }
}
