# Remote development testing

| Option | Best use | Access | Lifetime / tradeoff |
| --- | --- | --- | --- |
| Portless + Tailscale Serve | Personal remote testing and trusted teammates | Devices on your tailnet | Exact live dev app and hot reload; Mac and dev process must stay running |
| Cloudflare Quick Tunnel | Temporary external testing | Public random HTTPS URL | No tester installation; URL changes when restarted; no built-in login gate |
| Vercel | Persistent previews and production | Configure access in the Vercel project | Independent of the Mac; deploy the Next.js app |

Use Tailscale for development and Vercel for persistent deployments. Sharing a development server also exposes its development inspectors and live paid evaluator; local journey inspectors can include recorded answers. The admin launcher rejects sharing flags and tunnel configuration. Tailscale Funnel is a public alternative to Quick Tunnel, supported by Portless through `--funnel`.

## Tailscale

Connect Tailscale on both devices, enable tailnet HTTPS certificates, then run:

```sh
pnpm dev:tailscale
```

Stop this project's existing `pnpm dev` first. Portless prints the local and tailnet URLs and removes its sharing registration on exit. Its injected `PORTLESS_TAILSCALE_URL` is accepted by the app's exact-origin check and Next's development asset check. Do not replace these checks with a wildcard.

## Cloudflare Quick Tunnel

Use the origin printed by `pnpm dev`. For the root checkout, `pnpm exec portless get doom-or-bloom --no-worktree` resolves it; linked worktrees use their branch-prefixed origin. For an HTTP proxy at `http://doom-or-bloom.localhost:1355`, run the following in one terminal; adjust the proxy port and Host header if the resolved origin differs:

```sh
cloudflared tunnel --url http://127.0.0.1:1355 --http-host-header doom-or-bloom.localhost:1355
```

The Host override is necessary for Portless to select this app. Copy the exact HTTPS URL printed by cloudflared into `.env.development.local` as `DEV_TUNNEL_URL`, then restart this project's server with `pnpm dev`. The saved development file takes precedence over exported shell values.

`DEV_TUNNEL_URL` authorizes only that exact origin for API submissions and its hostname for Next dev assets. Stop cloudflared and remove the temporary setting when finished. The app, Portless proxy, and tunnel must remain running. Quick Tunnels are temporary development infrastructure. X login additionally depends on the exact auth origin and registered callback; see [X setup](../CONTRIBUTING.md#optional-x-login).

## Persistent deployments

Vercel is the deployment target. Deployment, hosted migrations and publishing remain separate tasks; use [production readiness](production-readiness.md) for their configuration and verification. For a local production-mode check, use `pnpm build:local` / `pnpm start:local` as described in [Contributing](../CONTRIBUTING.md#environment-boundaries).
