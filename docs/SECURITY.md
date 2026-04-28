# Security headers and CSP decision

## Decision

Use a hash-based Content Security Policy. Do not use per-request nonces.

The app is served mostly as static assets from Cloudflare Workers Static Assets. Per-request nonces would force edge-specific HTML mutation, hurt cacheability, and make the Worker run before every static response. Static SHA-256 hashes preserve Cloudflare caching while still allowing the small number of build-generated inline scripts that React Router or Vite may emit.

`bun run build` runs `scripts/csp-hashes.ts` after Vite. The script scans built HTML, computes SHA-256 for inline `<script>` blocks, and replaces `__CSP_SCRIPT_HASHES__` in the built `_headers` file. If the build contains no inline scripts, the placeholder is removed and `script-src` remains hash-free and `unsafe-inline`-free.

## CSP policy

Current policy in `public/_headers`:

```text
default-src 'self'; script-src 'self' __CSP_SCRIPT_HASHES__ https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https://tiles.openfreemap.org https://*.cloudflareinsights.com; worker-src 'self' blob:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
```

- `default-src 'self'`: deny everything by default except same-origin resources.
- `script-src 'self' __CSP_SCRIPT_HASHES__ https://static.cloudflareinsights.com`: allow app scripts, build-time hashes for inline scripts, and Cloudflare Insights. No `unsafe-eval`; production Tailwind v4 does not require it.
- `style-src 'self' 'unsafe-inline'`: allow same-origin CSS and runtime style attributes inserted by UI/map libraries. This is limited to styles; script execution still requires self or hash.
- `img-src 'self' data: blob: https:`: allow generated local imagery, data/blob previews, and remote map/image assets.
- `font-src 'self' data:`: allow app fonts plus small data-font fallbacks.
- `connect-src 'self' https://tiles.openfreemap.org https://*.cloudflareinsights.com`: allow same-origin app requests, OpenFreeMap tiles/styles, and Cloudflare Insights telemetry.
- `worker-src 'self' blob:`: allow the PWA service worker and library-created blob workers.
- `frame-ancestors 'none'`: modern CSP 3 clickjacking protection. This is preferred over relying only on `X-Frame-Options`.
- `base-uri 'self'`: prevent injected `<base>` tags from rewriting relative URLs.
- `form-action 'self'`: forms may only post back to same origin.

## Other security headers

- `X-Frame-Options: DENY`: legacy browser defense-in-depth. `frame-ancestors 'none'` is authoritative for modern browsers.
- `X-Content-Type-Options: nosniff`: prevents MIME sniffing for app and immutable assets.
- `Referrer-Policy: strict-origin-when-cross-origin`: keeps full referrers for same-origin diagnostics but sends only origin to third-party hosts.
- `Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=()`: disables browser features the simulator does not use.

## Subresource Integrity

No externally loaded application scripts are planned. If a third-party script becomes necessary, it must have Subresource Integrity and a pinned versioned URL before adding its host to `script-src`.

Cloudflare Insights is the only allowed external script host. It is controlled by Cloudflare, loaded from `https://static.cloudflareinsights.com`, and isolated from app code by the CSP source list.

## Verification

- Build-time: `bun run build` must leave no `__CSP_SCRIPT_HASHES__` token in built `_headers`.
- Static checks: `script-src` must not contain `unsafe-eval` or bare `unsafe-inline`.
- Runtime smoke: `bash scripts/verify-csp.sh http://localhost:8787/en` fetches the deployed/preview URL and asserts the CSP header, OpenFreeMap `connect-src`, and negative `unsafe-eval` / script `unsafe-inline` checks.
