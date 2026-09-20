# Remote testing and deployment

| Option | Best use | Access | Lifetime / tradeoff |
| --- | --- | --- | --- |
| Portless + Tailscale Serve | Personal remote testing and trusted teammates | Devices on your tailnet | Exact live dev app and hot reload; Mac and dev process must stay running |
| Cloudflare Quick Tunnel | Temporary external testing | Public random HTTPS URL | No tester installation; URL changes when restarted; no built-in login gate |
| ChatGPT Sites | Persistent demo | Owner-private by default; sharing managed in Sites | Independent of the Mac; code and journey snapshots update on deployment |

Default to Tailscale for development and Sites for a persistent demo. A public tunnel exposes the development inspector, including saved test answers, and the live paid evaluator; use it deliberately. Tailscale Funnel is a public alternative to Quick Tunnel, directly supported by Portless through `--funnel`. Vercel preview deployments are another persistent option with native Next.js support, if Sites-specific hosting is not required.

## Tailscale

Connect Tailscale on both devices, enable tailnet HTTPS certificates, then run:

```sh
pnpm dev:tailscale
```

Stop this project's existing `pnpm dev` first. Portless prints the local and tailnet URLs and removes its sharing registration on exit. Its injected `PORTLESS_TAILSCALE_URL` is accepted by the app's exact-origin check and Next's development asset check. Do not replace these checks with a wildcard.

## Cloudflare Quick Tunnel

For the current local Portless origin `http://doom-or-bloom.localhost:1355`, in one terminal:

```sh
cloudflared tunnel --url http://127.0.0.1:1355 --http-host-header doom-or-bloom.localhost:1355
```

The Host override is necessary for Portless to select this app. Copy the exact HTTPS URL printed by cloudflared. Restart this project's dev server in another terminal with:

```sh
DEV_TUNNEL_URL=https://THE-PRINTED-NAME.trycloudflare.com pnpm dev
```

`DEV_TUNNEL_URL` authorizes only that exact origin for API submissions and its hostname for Next dev assets. Stop cloudflared when finished. The app, Portless proxy, and tunnel must remain running. Quick Tunnels are temporary development infrastructure, not persistent deployment.

## ChatGPT Sites build

`pnpm build:sites` creates `dist/client`, `dist/server/index.js`, and `dist/.openai/hosting.json`. It reuses the React assessment/inspector components, the actual assessment API, and the live Jev engine. Build-time content loading replaces runtime filesystem access. The current recorded live journey suite and any matching experimental overlays are packaged as snapshots. The Takumi renderer uses its Worker/WebAssembly backend. Local Next development remains unchanged.

The private Sites entry includes the assessment, About, Privacy and read-only journey inspector. Local editorial mutation tools and journey regeneration stay local. Reports and per-answer traces stay in the visitor's browser. The TypeSafe key belongs in Sites runtime secrets, never source, generated assets or the hosting manifest. No OpenAI participant key is required for visitor assessments.

Local Worker check:

```sh
pnpm build:sites
pnpm exec wrangler dev --config sites/wrangler.jsonc --port 8799
```

A gitignored `sites/.dev.vars` can supply `TYPESAFE_API_KEY` for this local Worker check. Commit the exact source, build from it, push to the Sites source repository with a short-lived credential, save that commit and the build-output archive as a version, then deploy the saved version privately. `.openai/hosting.json` retains the project identity; reuse it rather than creating another site.

Sources: [Portless sharing](https://github.com/vercel-labs/portless#tailscale-sharing), [Cloudflare Quick Tunnels](https://try.cloudflare.com/), [ChatGPT Sites](https://learn.chatgpt.com/docs/sites), [Vercel previews](https://vercel.com/docs/deployments/environments#preview-environment-pre-production).
