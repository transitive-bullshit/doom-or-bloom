# Remote testing and deployment

| Option | Best use | Access | Lifetime / tradeoff |
| --- | --- | --- | --- |
| Portless + Tailscale Serve | Personal remote testing and trusted teammates | Devices on your tailnet | Exact live dev app and hot reload; Mac and dev process must stay running |
| Cloudflare Quick Tunnel | Temporary external testing | Public random HTTPS URL | No tester installation; URL changes when restarted; no built-in login gate |
| Vercel | Persistent previews and production | Configure access in the Vercel project | Independent of the Mac; deploy the Next.js app |

Use Tailscale for development and Vercel for persistent deployments. A public tunnel exposes the development inspector, including saved test answers, and the live paid evaluator; use it deliberately. Tailscale Funnel is a public alternative to Quick Tunnel, directly supported by Portless through `--funnel`.

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

## Persistent deployments

Vercel is the deployment target. Use the existing Next.js app and `pnpm build`; there is no separate frontend or worker build. Keep runtime credentials in the hosting environment. Deployment setup and publishing remain a separate task.
