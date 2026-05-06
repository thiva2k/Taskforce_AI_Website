# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands

```bash
npm run dev          # Start Vite dev server
npm run build        # Generate sitemap + Vite production build + SSR prerender (output: dist/)
npm run prerender    # Run SSR prerender only (requires dist/ from vite build)
npm run preview      # Preview production build locally
```

No test framework is configured. No linter is configured.

## Deployment

**Auto-deploy via GitHub Actions** — push to `main` and the site deploys automatically.

```
git push origin main  # triggers build + deploy to Hostinger
```

- **Repo**: `github.com/ChrysFernando/Taskforce_AI_Website`
- **Workflow**: `.github/workflows/deploy.yml` — builds on Ubuntu, SCPs dist/ to Hostinger
- **Origin server**: Hostinger at `82.25.87.204` (port 65002, user `u700742565`)
- **Document root**: `~/domains/taskforceai.tech/public_html/`
- **DNS**: GoDaddy (registrar) → Cloudflare (DNS) → Hostinger (origin)
- **WordPress**: `wp.taskforceai.tech` — managed separately, not part of this repo

Manual deploy (fallback):
```bash
npm run build
scp -P 65002 -r dist/. u700742565@82.25.87.204:/home/u700742565/domains/taskforceai.tech/public_html/
```

## Architecture

**React 19 SPA** built with Vite 6, TypeScript, and **BrowserRouter** (not HashRouter). Deployed as pre-rendered static files to Hostinger (LiteSpeed) at `taskforceai.tech`.

### SSR / Prerender

`scripts/prerender.js` uses Puppeteer to visit each route and save static HTML to `dist/`. This runs as part of `npm run build`.

- **On Windows**: uses system Microsoft Edge (`C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe`) to avoid AppLocker blocking bundled Chrome
- **On Linux/CI**: uses Puppeteer's bundled Chromium (`puppeteer.executablePath()`)
- Blog routes are fetched from WordPress (engineering category ID = 5) and pre-rendered dynamically

### Data Sources

- **WordPress** (`wp.taskforceai.tech`) — sole CMS for all dynamic content. REST API client in `lib/wordpress.ts`. Custom post types registered via mu-plugin at `/home/u700742565/domains/wp.taskforceai.tech/public_html/wp-content/mu-plugins/taskforce-cpts.php`:
  - `team` — team members (uses `meta` fields: `name`, `role`, `description`, `image_url`, `linkedin`)
  - `service`, `office`, `process_steps`, `stat`
  - Blog posts use standard WP Posts with category-based filtering: public categories (`engineering`, `case-study`, `strategy`, `thought-leadership`, `report`) display on the blog page; internal categories (`how-it-works`, `use-cases`, `system-capabilities`) are used by service detail pages
- **Supabase** — contact form submissions and demo bookings only (`lib/supabase.ts`)
- **Static data** — `data/services.tsx` contains hardcoded service definitions used as fallback when WordPress is unavailable

### WordPress Setup Notes

- Application Passwords are enabled via priority-100 filter in the mu-plugin (overrides Hostinger's blocking filter)
- CORS headers in WordPress `.htaccess` allow requests from `https://taskforceai.tech`
- Authorization header passthrough added to WordPress `.htaccess`: `RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]`
- Team members use WordPress `meta` fields (not ACF) for `name`, `role`, `description` — the `Team.tsx` component reads `meta` fields with `acf` as primary fallback
- Seed script: `scripts/seed-wordpress.mjs` — run with `WP_USER=... WP_APP_PASSWORD=... node scripts/seed-wordpress.mjs`

### Styling

Tailwind CSS is loaded from CDN at runtime (`index.html` script tag), **not** as a build dependency. Theme config (colors, fonts, animations) is defined inline in `index.html`. The global stylesheet is `index.css`.

### i18n

i18next with three locales: `en`, `ar`, `fr`. Translation files at `public/locales/{lng}/translation.json`. Arabic triggers RTL mode. The `useServicesData` hook wraps static service data with i18n translations.

### Routing (BrowserRouter)

Routes use standard paths (no `/#/` prefix):
- `/` — Home (composed of section components from `components/sections/`)
- `/service/:id` — Service detail (static data + WordPress content merged)
- `/blog`, `/blog/:slug` — Blog listing and posts
- `/about`, `/contact`, `/book-demo` — Static pages

`.htaccess` handles SPA fallback so all routes serve `index.html`.

### Component Organization

- `components/pages/` — Full page components (route targets)
- `components/sections/` — Homepage sections (Hero, Services, Process, Offices, Stats, CTA, Team)
- `components/service-detail/` — Service detail sub-components
- `components/ui/` — Reusable UI (LoadingScreen, GlassCard, GlitchButton, MagneticButton, Chatbot, etc.)
- `components/layout/` — Header and Footer
- `components/seo/` — Helmet-based meta tags

### Chatbot

`components/ui/Chatbot.tsx` — ElevenAgents AI chat widget + WhatsApp button combined in a side rail.
- Agent ID: `agent_9001kpwd96apfrcvzaaeefkyz13f`
- WhatsApp: `+94776697566`
- Client tools: `contact_hq` and `book_demo` for in-app navigation

## Key Conventions

- `WP_API_BASE` from `lib/wordpress.ts` is the canonical WordPress endpoint — **never hardcode WordPress URLs**
- `VITE_WP_API` env var must be set at build time (in `.env` locally, as workflow env var in CI)
- Team members are managed entirely in `wp-admin → Team Members` — no code changes needed
- Blog posts go in `wp-admin → Posts` with the `engineering` category to appear on the blog page
- The 2.2-second LoadingScreen plays on every initial page load
- Noise texture overlay (`/noise.svg`) is used across many components for visual grain effect
- Sitemap is at `public/sitemap.xml` — update manually when new pages are added, then push to deploy
