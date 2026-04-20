# TypeScript Book (RU) — Docusaurus

Rebuild of [xsltdev/scriptdev.ru](https://github.com/xsltdev/scriptdev.ru)'s
TypeScript book (`docs/book/`) as a [Docusaurus](https://docusaurus.io/) site,
deployed to GitHub Pages.

Live site: https://AlexHaid.github.io/ts-book/

## Local development

```bash
npm install
npm run dev
```

Opens http://localhost:3000 with hot reload.

## Build

```bash
npm run build
npm run serve
```

## Deploy

Deployment is fully automated via
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml): every push to
`main` builds the site and publishes it to GitHub Pages.

### One-time repo setup

1. Push this repo to `github.com/AlexHaid/ts-book`.
2. In the repo, go to **Settings → Pages** and set **Source** to
   **GitHub Actions**.
3. Push to `main`. The workflow will build and deploy.

## Project structure

```
docs/                       Book markdown (ported from scriptdev.ru)
src/pages/index.tsx         Landing page
src/css/custom.css          Theme overrides
sidebars.ts                 Book navigation (mirrors the original .pages order)
docusaurus.config.ts        Site config (url, baseUrl, i18n: ru)
scripts/                    Build-time helper scripts
.github/workflows/          CI / Pages deploy
```

## Credits

Original content: [xsltdev/scriptdev.ru](https://github.com/xsltdev/scriptdev.ru).
