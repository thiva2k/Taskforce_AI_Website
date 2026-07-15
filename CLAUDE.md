# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands

```bash
npm run dev          # Start Vite dev server on port 3000
npm run build        # Generate sitemap + production build (output: dist/)
npm run preview      # Preview production build locally
```

No test framework is configured. No linter is configured.

## Architecture

**React 19 SPA** built with Vite 6, TypeScript, and HashRouter. Deployed as static files to Hostinger (LiteSpeed) at `taskforceai.tech`.

### Data Sources

- **WordPress** (`wp.taskforceai.tech`) — sole CMS for all dynamic content. REST API client in `lib/wordpress.ts`. Custom post types: `service`, `office`, `process_steps`, `stat`, `team`. ACF fields exposed via mu-plugin (`scripts/acf-field-groups.php`). Blog posts use category-based filtering: public categories (`engineering`, `case-study`, `strategy`, `thought-leadership`, `report`) display on the blog page; internal categories (`how-it-works`, `use-cases`, `system-capabilities`) are used by service detail pages via the `service_slug` ACF field.
- **Supabase** — contact form submissions and demo bookings only (`lib/supabase.ts`).
- **Static data** — `data/services.tsx` contains hardcoded service definitions used as fallback when WordPress is unavailable.

### Styling

Tailwind CSS is loaded from CDN at runtime (`index.html` script tag), **not** as a build dependency. Theme config (colors, fonts, animations) is defined inline in `index.html`. The global stylesheet is `index.css`.

### i18n

i18next with three locales: `en`, `ar`, `fr`. Translation files at `public/locales/{lng}/translation.json`. Arabic triggers RTL mode. The `useServicesData` hook wraps static service data with i18n translations.

### Routing (HashRouter)

All routes use `/#/` prefix:
- `/` — Home (composed of section components from `components/sections/`)
- `/service/:id` — Service detail (static data + WordPress content merged)
- `/blog`, `/blog/:slug` — Blog listing and posts
- `/about`, `/contact`, `/book-demo` — Static pages

### Component Organization

- `components/pages/` — Full page components (route targets)
- `components/sections/` — Homepage sections (Hero, Services, Process, Offices, Stats, CTA, Team)
- `components/service-detail/` — Service detail sub-components
- `components/ui/` — Reusable UI (LoadingScreen, GlassCard, GlitchButton, MagneticButton, etc.)
- `components/layout/` — Header and Footer
- `components/seo/` — Helmet-based meta tags

### WordPress Content Seeding

`scripts/seed-wordpress.mjs` populates WordPress with content from `data/services.tsx` and `public/locales/en/translation.json` via REST API using Application Passwords.

## Deployment

- **Hosting**: Hostinger (LiteSpeed). Deploys run via GitHub Actions
  (`.github/workflows/deploy.yml`) on push to `main`: build `dist/`, then SCP to
  the web docroot. Server host/path and SSH credentials live in the repo's GitHub
  Actions secrets and the private ops notes — **not** in this public repo.
- **DNS**: registrar → Cloudflare (DNS/proxy) → Hostinger (origin).
- **WordPress**: headless CMS at the `wp.taskforceai.tech` subdomain (see the
  headless posture section above).
- `.htaccess` in `public/` provides SPA fallback routing, compression, and cache headers.

## WordPress headless posture (Option A — private backend)

`wp.taskforceai.tech` is a **private headless CMS**, never a public site — the
React front end is the only public face. Enforcement lives in a
`taskforce-headless-hardening.php` mu-plugin on the WordPress install, whose
source of truth is tracked here at
`scripts/wp-mu-plugins/taskforce-headless-hardening.php`. **The deploy pipeline
only publishes the static site — it does NOT install mu-plugins**, so after
editing that file it must be copied into the WordPress `mu-plugins` directory on
the server and the caches flushed. (Server host and credentials live in the
private ops notes, not this repo.)

The plugin forces `robots.txt` to `Disallow: /`, sends a site-wide
`X-Robots-Tag: noindex`, blocks author archives + `?author=` enumeration, and
redirects XML sitemap URLs. Complementary WordPress settings that must stay put:
`blog_public = 0`, Yoast `enable_xml_sitemap = false`, and the admin user's
`display_name`/author slug must **never** be an email address (a leaked
admin-email byline was the original bug). `/wp-json` post reads and
`/wp-content/uploads` media are intentionally left public so the SPA and images
keep working. `getAuthorName()` in `lib/wordpress.ts` also refuses to render any
email as a byline, as defence-in-depth.

**HTTP Basic Auth** additionally hides all wp HTML from humans, via a
`# BEGIN TaskForce Basic Auth` block in the wp `.htaccess` that exempts
`/wp-json`, `/wp-content/uploads/`, `/wp-admin`, `/wp-login.php`, and
`/wp-cron.php` so the SPA, images, admin, and cron still work. Use a **bcrypt**
htpasswd hash — LiteSpeed rejects `$apr1$` (MD5) — and ensure the `AuthUserFile`
is readable by the web-server process, or auth silently fails. Credentials
themselves live only on the server / in the private ops notes.

## Key Conventions

- The `@` import alias resolves to the project root (configured in `vite.config.ts`)
- `WP_API_BASE` from `lib/wordpress.ts` is the canonical WordPress endpoint — never hardcode WordPress URLs
- Service detail pages assemble content from both static `data/services.tsx` and WordPress posts filtered by `service_slug` ACF field
- The 2.2-second LoadingScreen plays on every initial page load
- Noise texture overlay (`/noise.svg`) is used across many components for visual grain effect
