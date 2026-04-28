# Deployment

Production deploys use Cloudflare Workers Static Assets through `wrangler deploy`.

## Commands

```bash
bun run build
bun run deploy
DEPLOY_URL=https://asteroid-impact-simulator.<account>.workers.dev bun run verify:deploy
```

## GitHub Actions

`.github/workflows/deploy.yml` deploys `main` and manual `workflow_dispatch` runs.

Required repository secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

No application runtime secrets are required. If that changes, add them with `wrangler secret put <NAME>` and document the name here.

## Edge behavior

- `/api/health` returns JSON with `status: ok` and `Cache-Control: no-store`.
- Text, JSON, JavaScript, XML, manifest, and SVG asset responses receive `charset=utf-8` when Cloudflare omits it.
- `public/_headers` is copied into `dist/client/_headers`; build-time CSP hash replacement must remove `__CSP_SCRIPT_HASHES__` before deploy.
