import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const WP_API_BASE = process.env.VITE_WP_API;

if (!WP_API_BASE) {
  console.error('❌ VITE_WP_API is missing in .env');
  process.exit(1);
}

const INTERNAL_CATEGORY_SLUGS = new Set([
  'how-it-works',
  'use-cases',
  'system-capabilities',
]);

const PUBLIC_BLOG_CATEGORY_SLUGS = new Set([
  'engineering',
  'case-study',
  'strategy',
  'thought-leadership',
  'report',
]);

function stripHtml(html = '') {
  return html.replace(/<[^>]*>/g, '').trim();
}

function decodeHtmlEntities(text = '') {
  return text
    .replace(/&#8217;/g, "'")
    .replace(/&#8211;/g, '–')
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#038;/g, '&');
}

function calculateReadTimeFromHtml(html = '') {
  const text = stripHtml(html);
  const words = text.split(/\s+/).filter(Boolean).length;

  return `${Math.max(1, Math.ceil(words / 200))} min read`;
}

function getEmbeddedTerms(post) {
  return post?._embedded?.['wp:term']?.flat() || [];
}

function getEmbeddedCategories(post) {
  return getEmbeddedTerms(post).filter((term) =>
    post.categories?.includes(term.id)
  );
}

function getPostCategoryName(post) {
  const categories = getEmbeddedCategories(post);

  const publicCategory = categories.find((term) =>
    PUBLIC_BLOG_CATEGORY_SLUGS.has(term.slug)
  );

  if (publicCategory?.name) {
    return publicCategory.name;
  }

  const nonInternalCategory = categories.find(
    (term) => !INTERNAL_CATEGORY_SLUGS.has(term.slug)
  );

  return nonInternalCategory?.name || 'General';
}

function getPostTagNames(post) {
  const embeddedTerms = getEmbeddedTerms(post);

  return embeddedTerms
    .filter((term) => post.tags?.includes(term.id))
    .map((term) => term.name)
    .filter(Boolean);
}

function getFeaturedImage(post) {
  return (
    post?._embedded?.['wp:featuredmedia']?.[0]?.source_url ||
    post?.yoast_head_json?.og_image?.[0]?.url ||
    ''
  );
}

function getAuthorName(post) {
  return (
    post?.acf?.blog_author_name ||
    post?.acf?.author_name ||
    post?._embedded?.author?.[0]?.name ||
    'TaskForce Team'
  );
}

function formatWpDate(dateValue) {
  if (!dateValue) return 'Recently';

  const parsed = new Date(dateValue);

  if (Number.isNaN(parsed.getTime())) {
    return 'Recently';
  }

  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getReadTime(post) {
  return (
    post?.acf?.reading_time ||
    post?.acf?.read_time ||
    calculateReadTimeFromHtml(post?.content?.rendered || '')
  );
}

function isPublicBlogPost(post) {
  const categories = getEmbeddedCategories(post);

  return categories.some((term) =>
    PUBLIC_BLOG_CATEGORY_SLUGS.has(term.slug)
  );
}

async function fetchAllPosts() {
  const firstResponse = await fetch(
    `${WP_API_BASE}/posts?per_page=100&page=1&_embed`
  );

  if (!firstResponse.ok) {
    throw new Error(
      `WordPress API failed: ${firstResponse.status}`
    );
  }

  const firstPagePosts = await firstResponse.json();

  const totalPagesHeader =
    firstResponse.headers.get('X-WP-TotalPages');

  const totalPages = totalPagesHeader
    ? Number(totalPagesHeader)
    : 1;

  if (!Number.isFinite(totalPages) || totalPages <= 1) {
    return firstPagePosts;
  }

  const remainingRequests = [];

  for (let page = 2; page <= totalPages; page++) {
    remainingRequests.push(
      fetch(
        `${WP_API_BASE}/posts?per_page=100&page=${page}&_embed`
      ).then((res) => res.json())
    );
  }

  const remainingPages = await Promise.all(remainingRequests);

  return [firstPagePosts, ...remainingPages].flat();
}

async function generateBlogCache() {
  try {
    console.log('🚀 Fetching WordPress blog posts...');

    const rawPosts = await fetchAllPosts();

    const posts = rawPosts
      .filter((post) => isPublicBlogPost(post))
      .map((post) => ({
        id: post.id,
        slug: post.slug,

        title: decodeHtmlEntities(
          post?.title?.rendered || ''
        ),

        excerpt: stripHtml(
          post?.excerpt?.rendered ||
            post?.content?.rendered ||
            ''
        ),

        content: post?.content?.rendered || '',

        category: getPostCategoryName(post),

        author: getAuthorName(post),

        date: formatWpDate(post?.date),

        readTime: getReadTime(post),

        image: getFeaturedImage(post),

        status: 'published',

        tags: getPostTagNames(post),

        seoTitle: post?.yoast_head_json?.title || '',

        seoDescription:
          post?.yoast_head_json?.description || '',

        seoImage:
          post?.yoast_head_json?.og_image?.[0]?.url || '',
      }))
      .sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      });

    fs.writeFileSync(
      './public/blog-cache.json',
      JSON.stringify(posts, null, 2)
    );

    console.log(
      `✅ Blog cache generated successfully (${posts.length} posts)`
    );
  } catch (error) {
    console.error(
      '❌ Failed to generate blog cache:',
      error
    );

    fs.writeFileSync(
      './public/blog-cache.json',
      JSON.stringify([], null, 2)
    );

    process.exit(1);
  }
}

generateBlogCache();
