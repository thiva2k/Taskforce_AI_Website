import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOMAIN = 'https://taskforceai.tech';

const staticRoutes = [
  '',
  '/book-demo',
  '/contact',
  '/about',
  '/blog'
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

const generateSitemap = () => {
  const serviceIds = getServiceIds();
  const routes = [
    ...staticRoutes,
    ...serviceIds.map(id => `/service/${id}`)
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
    .map(route => {
      return `  <url>
    <loc>${DOMAIN}${route}</loc>
    <changefreq>weekly</changefreq>
    <priority>${route === '' ? '1.0' : '0.8'}</priority>
  </url>`;
    })
    .join('\n')}
</urlset>`;

  const publicPath = path.join(__dirname, '../public/sitemap.xml');
  fs.writeFileSync(publicPath, sitemap);
  console.log(`Sitemap generated at ${publicPath}`);
};

generateSitemap();
