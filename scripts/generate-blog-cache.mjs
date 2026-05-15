import fs from 'fs';

const WP_API = process.env.VITE_WP_API;

const res = await fetch(`${WP_API}/posts?per_page=100&_embed`);
const posts = await res.json();

fs.writeFileSync(
  './public/blog-cache.json',
  JSON.stringify(posts, null, 2)
);

console.log('Blog cache generated');
