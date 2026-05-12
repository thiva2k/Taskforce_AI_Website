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

async function getBlogSlugs() {
  if (!WP_API) {
    console.warn('VITE_WP_API not set — blog posts excluded from sitemap');
    return [];
  }

  const slugs = [];
  let page = 1;

  while (true) {
    try {
      const res = await fetch(`${WP_API}/posts?per_page=100&page=${page}&_embed`);
      if (!res.ok) {
        console.warn(`WP blog fetch failed: ${res.status}`);
        break;
      }

      const posts = await res.json();

      for (const post of posts) {
        const terms = post._embedded?.['wp:term']?.flat() || [];
        const isPublic = terms.some((t) => PUBLIC_BLOG_CATEGORY_SLUGS.has(t.slug));
        if (isPublic && post.slug) {
          slugs.push(post.slug);
        }
      }

      const totalPages = Number(res.headers.get('x-wp-totalpages') || 1);
      if (page >= totalPages) break;
      page++;
    } catch (err) {
      console.warn('Error fetching blog slugs:', err.message);
      break;
    }
  }

  return slugs;
}

const generateSitemap = async () => {
  const serviceIds = getServiceIds();
  const blogSlugs = await getBlogSlugs();

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
