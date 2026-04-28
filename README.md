# Asteroid Impact Simulator

[![CI](https://github.com/code-yeongyu/asteroid-impact-simulator/actions/workflows/ci.yml/badge.svg)](https://github.com/code-yeongyu/asteroid-impact-simulator/actions/workflows/ci.yml)
[![CodeQL](https://github.com/code-yeongyu/asteroid-impact-simulator/actions/workflows/codeql.yml/badge.svg)](https://github.com/code-yeongyu/asteroid-impact-simulator/actions/workflows/codeql.yml)

A scientifically grounded, visually striking, fully client-side asteroid impact simulator.
React 19 + Vite 7 + Base UI + Tailwind v4 + 28-language i18n + PWA + Cloudflare Workers.

## Status

Under active development per [`.sisyphus/plans/asteroid-impact-simulator.md`](./.sisyphus/plans/asteroid-impact-simulator.md).

## Stack

- React 19 · Vite 7 · TypeScript strict
- `@base-ui/react` · Tailwind CSS v4
- React Router v7 (framework mode, native SSG)
- Zustand 5 · React Hook Form · Zod 4
- i18next 26 · ICU MessageFormat
- MapLibre GL · visx · Recharts · React Three Fiber + drei
- vite-plugin-pwa (Workbox `injectManifest`)
- Cloudflare Workers Static Assets (`wrangler@4.85`)

## Targets

- Lighthouse 100 / 100 / 100 / 100 (Performance · A11y · Best Practices · SEO) on en/ar/ja/de
- 28 locales (3 RTL: ar/fa/he)
- Initial JS ≤ 100 KB gzip · Initial CSS ≤ 20 KB
- WCAG 2.2 AA across all pages

## Workflow

GitHub-orchestrated agile development:

- All work happens in isolated git worktrees
- Every change goes through a PR with reviewer approval + CI gate
- Comms follow `{name}: {content}` template on PRs and issues
- Real browser QA via Playwright before merge
