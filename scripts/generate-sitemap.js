import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOMAIN = 'https://www.taskforceai.tech';
const WP_API = process.env.VITE_WP_API;

const PUBLIC_BLOG_CATEGORY_SLUGS = new Set([
  'engineering',
  'case-study',
  'strategy',
  'thought-leadership',
  'report',
]);

const staticRoutes = [
  '/',
  '/about/',
  '/contact/',
  '/book-demo/',
  '/blog/',
];

const getServiceIds = () => {
  try {
    const servicesPath = path.join(__dirname, '../data/services.tsx');
    if (!fs.existsSync(servicesPath)) {
      console.warn('Warning: data/services.tsx not found, skipping service routes');
      return [];
    }
    const content = fs.readFileSync(servicesPath, 'utf-8');
    const regex = /id:\s*["']([^"']+)["']/g;
    const ids = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
      ids.push(match[1]);
    }
    return ids;
  } catch (error) {
    console.error('Error reading services:', error);
    return [];
  }
};

async function fetchWpWithRetry(url, maxAttempts = 8) {
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);
    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);
      if (res.ok) return res;
      lastError = new Error(`HTTP ${res.status}`);
      const transient = res.status >= 500 || res.status === 429;
      if (!transient || attempt >= maxAttempts) throw lastError;
      console.warn(`  sitemap WP fetch ${url} -> ${res.status} (attempt ${attempt}); retrying...`);
    } catch (err) {
      clearTimeout(timer);
      lastError = err;
      if (attempt >= maxAttempts) throw err;
      console.warn(`  sitemap WP fetch ${url} failed (attempt ${attempt}): ${err.message}; retrying...`);
    }
    // Capped backoff + jitter so an intermittent WP/CI network blip (seen from
    // GitHub runners) is ridden out over a few minutes instead of failing fast.
    const backoff = Math.min(attempt * 4000, 20000) + Math.floor(Math.random() * 1000);
    await new Promise((r) => setTimeout(r, backoff));
  }
  throw lastError || new Error('WP fetch failed');
}

async function getBlogSlugs() {
  if (!WP_API) {
    console.warn('VITE_WP_API not set — blog posts excluded from sitemap');
    return [];
  }

  // Light category map (slug -> id) so public posts can be detected without the
  // heavy ~6 MB _embed payload, which intermittently fails from CI runners.
  const catRes = await fetchWpWithRetry(`${WP_API}/categories?per_page=100&_fields=id,slug`);
  const categories = await catRes.json();
  const publicCategoryIds = new Set(
    categories
      .filter((c) => PUBLIC_BLOG_CATEGORY_SLUGS.has(c.slug))
      .map((c) => c.id)
  );

  const slugs = [];
  let page = 1;

  while (true) {
    const res = await fetchWpWithRetry(
      `${WP_API}/posts?per_page=100&page=${page}&_fields=slug,categories`
    );
    const posts = await res.json();

    for (const post of posts) {
      const isPublic = (post.categories || []).some((id) => publicCategoryIds.has(id));
      if (isPublic && post.slug) slugs.push(post.slug);
    }

    const totalPages = Number(res.headers.get('x-wp-totalpages') || 1);
    if (page >= totalPages) break;
    page++;
  }

  return slugs;
}

const generateSitemap = async () => {
  const serviceIds = getServiceIds();
  // Resilience: a WP outage from CI must not fail the whole deploy. On fetch
  // failure, generate the sitemap WITHOUT blog posts (static + service routes).
  // Set STRICT_BLOG_PRERENDER=1 to restore hard-fail behavior.
  let blogSlugs = [];
  try {
    blogSlugs = await getBlogSlugs();
  } catch (err) {
    if (process.env.STRICT_BLOG_PRERENDER === '1') {
      console.error(`\n❌ Sitemap: WordPress unreachable (${err.message}) — aborting (STRICT_BLOG_PRERENDER=1).`);
      process.exit(1);
    }
    console.warn(
      `\n⚠ Sitemap: WordPress unreachable (${err.message}) — generating sitemap ` +
      `WITHOUT blog posts. Blog URLs will return on the next successful deploy. ` +
      `(Set STRICT_BLOG_PRERENDER=1 to hard-fail instead.)`
    );
    blogSlugs = [];
  }

  const routes = [
    ...staticRoutes,
    ...serviceIds.map((id) => `/service/${id}/`),
    ...blogSlugs.map((slug) => `/blog/${slug}/`),
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
    .map(
      (route) => `  <url>
    <loc>${DOMAIN}${route}</loc>
    <changefreq>weekly</changefreq>
    <priority>${route === '/' ? '1.0' : '0.8'}</priority>
  </url>`
    )
    .join('\n')}
</urlset>`;

  const publicPath = path.join(__dirname, '../public/sitemap.xml');
  fs.writeFileSync(publicPath, sitemap);
  console.log(`✅ Sitemap generated with ${routes.length} URLs`);
  console.log(`   ${serviceIds.length} service pages, ${blogSlugs.length} blog posts`);
};

generateSitemap();
