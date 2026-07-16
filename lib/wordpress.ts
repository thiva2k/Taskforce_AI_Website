export const WP_API_BASE = import.meta.env.VITE_WP_API;

// The WordPress backend (wp.taskforceai.tech) can be slow (~7s/request) and
// occasionally returns transient 5xx/429 under build-time load. Without a
// timeout + retry, a single hiccup throws and bakes a "Blog posts failed to
// load" error page into the prerendered HTML. These guards make the fetch
// resilient; genuine, persistent failures still throw (and the prerender step
// then fails the build rather than shipping a broken blog).
const WP_FETCH_TIMEOUT_MS = 20000;
const WP_FETCH_MAX_ATTEMPTS = 5;

function wpDelay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWpResponse(path: string): Promise<Response> {
  const url = `${WP_API_BASE}${path}`;
  let lastError: unknown;

  for (let attempt = 1; attempt <= WP_FETCH_MAX_ATTEMPTS; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), WP_FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);

      if (response.ok) {
        return response;
      }

      // Retry transient server-side failures; fail fast on 4xx.
      const isTransient = response.status >= 500 || response.status === 429;
      if (isTransient && attempt < WP_FETCH_MAX_ATTEMPTS) {
        lastError = new Error(`WordPress API error: ${response.status}`);
        console.warn(`WP fetch ${url} -> ${response.status} (attempt ${attempt}); retrying...`);
        await wpDelay(attempt * 2000);
        continue;
      }

      const errorText = await response.text();
      console.error('WP API FAILED URL:', url);
      console.error('WP API FAILED STATUS:', response.status);
      console.error('WP API FAILED RESPONSE:', errorText);
      throw new Error(`WordPress API error: ${response.status}`);
    } catch (error) {
      clearTimeout(timer);
      lastError = error;

      // An HTTP error we already decided not to retry — propagate immediately.
      const isThrownHttp =
        error instanceof Error && error.message.startsWith('WordPress API error:');
      if (isThrownHttp || attempt >= WP_FETCH_MAX_ATTEMPTS) {
        throw error;
      }

      // Timeout (AbortError) or network error — back off and retry.
      const reason = error instanceof Error ? error.message : String(error);
      console.warn(`WP fetch ${url} failed (attempt ${attempt}): ${reason}; retrying...`);
      await wpDelay(attempt * 2000);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('WordPress API request failed');
}

async function fetchWp<T>(path: string): Promise<T> {
  const response = await fetchWpResponse(path);
  return response.json();
}

export interface WpTitle {
  rendered: string;
}

export interface WpRenderedContent {
  rendered: string;
}

export interface WpExcerpt {
  rendered: string;
}

export interface WpPage {
  id: number;
  slug: string;
  title: WpTitle;
  acf?: Record<string, any>;
}

export interface WpFeaturedMedia {
  source_url?: string;
}

export interface WpOffice {
  id: number;
  slug: string;
  title: WpTitle;
  menu_order: number;
  acf?: {
    country?: string;
    city?: string;
  };
  _embedded?: {
    'wp:featuredmedia'?: WpFeaturedMedia[];
  };
}

export interface WpService {
  id: number;
  slug: string;
  title: WpTitle;
  menu_order: number;
  acf?: {
    short_description?: string;
    top_use_cases?: string;
    button_text?: string;
    button_link?: string;
    status_text?: string;
    unit_code?: string;
    icon_name?: string;

    inner_hero_title?: string;
    inner_hero_short_desc?: string;
    inner_hero_long_desc?: string;
    inner_primary_button_text?: string;
    inner_primary_button_link?: string;
    inner_secondary_button_text?: string;
    inner_secondary_button_link?: string;
  };
}

export interface WpProcessStep {
  id: number;
  slug: string;
  title: WpTitle;
  menu_order: number;
  acf?: {
    small_label?: string;
    step_number?: string;
    short_description?: string;
    icon_name?: string;
  };
}

export interface WpStat {
  id: number;
  slug: string;
  title: WpTitle;
  menu_order: number;
  acf?: {
    value?: string;
    title_text?: string;
    subtitle?: string;
  };
}

export interface WpCategory {
  id: number;
  name: string;
  slug: string;
}

export interface WpTag {
  id: number;
  name: string;
  slug: string;
}

export interface WpEmbeddedAuthor {
  name?: string;
}

export interface WpEmbeddedTerm {
  id: number;
  name: string;
  slug: string;
  taxonomy?: string;
}

export interface WpYoastHeadJson {
  title?: string;
  description?: string;
  og_image?: Array<{ url?: string }>;
}

export interface WpPost {
  id: number;
  slug: string;
  date?: string;
  modified?: string;
  title: WpTitle;
  excerpt?: WpExcerpt;
  content: WpRenderedContent;
  categories: number[];
  tags?: number[];
  acf?: {
    service_slug?: string;
    item_order?: number | string;
    icon_name?: string;

    author_name?: string;
    blog_author_name?: string;
    publish_date?: string;
    blog_publish_date?: string;
    reading_time?: string;
    read_time?: string;
  };
  yoast_head_json?: WpYoastHeadJson;
  _embedded?: {
    author?: WpEmbeddedAuthor[];
    'wp:featuredmedia'?: WpFeaturedMedia[];
    'wp:term'?: WpEmbeddedTerm[][];
  };
}

export interface ServiceRepeatItemsResult {
  howItWorks: WpPost[];
  useCases: WpPost[];
  systemCapabilities: WpPost[];
}

export interface BlogListItem {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
  status: string;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  seoImage?: string;
  // ISO 8601 timestamps for structured data (Article datePublished/dateModified).
  datePublished?: string;
  dateModified?: string;
}

// Raw comment shape from the WordPress REST API (wp/v2/comments).
export interface WpComment {
  id: number;
  author_name: string;
  date: string;
  content: WpRenderedContent;
  parent: number;
}

// Cleaned comment used by the UI.
export interface BlogComment {
  id: number;
  authorName: string;
  date: string;
  content: string;
  parent: number;
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

export async function fetchHomePageAcf() {
  const pages = await fetchWp<WpPage[]>(
    `/pages?slug=home&_fields=id,slug,title,acf`
  );
  return pages[0]?.acf ?? {};
}

export async function fetchOffices() {
  return fetchWp<WpOffice[]>(`/office?_embed`);
}

export async function fetchServices() {
  return fetchWp<WpService[]>(
    `/service?_fields=id,slug,title,menu_order,acf`
  );
}

export async function fetchProcessSteps() {
  return fetchWp<WpProcessStep[]>(
    `/process_steps?_fields=id,slug,title,menu_order,acf`
  );
}

export async function fetchStats() {
  return fetchWp<WpStat[]>(
    `/stat?_fields=id,slug,title,menu_order,acf`
  );
}

export async function fetchCategories() {
  return fetchWp<WpCategory[]>(
    `/categories?per_page=100&_fields=id,name,slug`
  );
}

export async function fetchTags() {
  return fetchWp<WpTag[]>(
    `/tags?per_page=100&_fields=id,name,slug`
  );
}

export async function fetchPosts() {
  return fetchWp<WpPost[]>(
    `/posts?per_page=100&_fields=id,slug,title,content,categories,acf`
  );
}

export async function fetchBlogPostsRaw() {
  const firstResponse = await fetchWpResponse(
    `/posts?per_page=100&page=1&_embed`
  );
  const firstPagePosts = (await firstResponse.json()) as WpPost[];

  const totalPagesHeader = firstResponse.headers.get('X-WP-TotalPages');
  const totalPages = totalPagesHeader ? Number(totalPagesHeader) : 1;

  if (!Number.isFinite(totalPages) || totalPages <= 1) {
    return firstPagePosts;
  }

  const remainingPagePromises: Promise<WpPost[]>[] = [];

  for (let page = 2; page <= totalPages; page++) {
    remainingPagePromises.push(
      fetchWp<WpPost[]>(`/posts?per_page=100&page=${page}&_embed`)
    );
  }

  const remainingPages = await Promise.all(remainingPagePromises);

  return [firstPagePosts, ...remainingPages].flat();
}

export async function fetchBlogPostBySlugRaw(slug: string) {
  const posts = await fetchWp<WpPost[]>(
    `/posts?slug=${encodeURIComponent(slug)}&_embed`
  );
  return posts[0] ?? null;
}

export async function fetchServiceRepeatItems(
  serviceSlug: string
): Promise<ServiceRepeatItemsResult> {
  const [categories, posts] = await Promise.all([
    fetchCategories(),
    fetchPosts(),
  ]);

  const categoryIdMap = new Map<string, number>();
  categories.forEach((cat) => categoryIdMap.set(cat.slug, cat.id));

  const howItWorksId = categoryIdMap.get('how-it-works');
  const useCasesId = categoryIdMap.get('use-cases');
  const systemCapabilitiesId = categoryIdMap.get('system-capabilities');

  const normalizeOrder = (value?: number | string) => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = Number(value);
      return Number.isNaN(parsed) ? 9999 : parsed;
    }
    return 9999;
  };

  const filterAndSort = (categoryId?: number) => {
    if (!categoryId) return [];

    return posts
      .filter((post) => {
        const belongsToService = post.acf?.service_slug === serviceSlug;
        const belongsToCategory = post.categories?.includes(categoryId);
        return belongsToService && belongsToCategory;
      })
      .sort(
        (a, b) =>
          normalizeOrder(a.acf?.item_order) - normalizeOrder(b.acf?.item_order)
      );
  };

  return {
    howItWorks: filterAndSort(howItWorksId),
    useCases: filterAndSort(useCasesId),
    systemCapabilities: filterAndSort(systemCapabilitiesId),
  };
}

function formatWpDate(dateValue?: string, long = false): string {
  if (!dateValue) return 'Recently';

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return 'Recently';

  return parsed.toLocaleDateString('en-US', {
    month: long ? 'long' : 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function calculateReadTimeFromHtml(html?: string): string {
  const textContent = stripHtml(html);
  const wordCount = textContent.split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(wordCount / 200))} min read`;
}

function getEmbeddedTerms(post: WpPost): WpEmbeddedTerm[] {
  return post._embedded?.['wp:term']?.flat() ?? [];
}

function getEmbeddedCategories(post: WpPost): WpEmbeddedTerm[] {
  return getEmbeddedTerms(post).filter((term) =>
    post.categories?.includes(term.id)
  );
}

function getPostCategoryName(post: WpPost): string {
  const categories = getEmbeddedCategories(post);

  const publicCategory = categories.find((term) =>
    PUBLIC_BLOG_CATEGORY_SLUGS.has(term.slug)
  );

  if (publicCategory?.name) return publicCategory.name;

  const nonInternalCategory = categories.find(
    (term) => !INTERNAL_CATEGORY_SLUGS.has(term.slug)
  );

  return nonInternalCategory?.name || 'General';
}

function getPostTagNames(post: WpPost): string[] {
  const embeddedTerms = getEmbeddedTerms(post);

  return embeddedTerms
    .filter((term) => post.tags?.includes(term.id))
    .map((term) => term.name)
    .filter(Boolean);
}

function getFeaturedImage(post: WpPost): string {
  const url =
    post._embedded?.['wp:featuredmedia']?.[0]?.source_url ||
    post.yoast_head_json?.og_image?.[0]?.url ||
    '';
  return toPublicMedia(url) || '';
}

// Guard against ever surfacing an email address as a public byline. A WordPress
// author display name once leaked an email address into public post bylines;
// this keeps that PII off the site even if a WP field regresses to an email
// again.
function looksLikeEmail(value: string): boolean {
  return /\S+@\S+\.\S+/.test(value);
}

function getAuthorName(post: WpPost): string {
  const candidates = [
    post.acf?.blog_author_name,
    post.acf?.author_name,
    post._embedded?.author?.[0]?.name,
  ];

  for (const candidate of candidates) {
    const name = (candidate || '').trim();
    if (name && !looksLikeEmail(name)) return name;
  }

  return 'TaskForce AI';
}

function getPublishDate(post: WpPost, long = false): string {
  const acfDate = post.acf?.blog_publish_date || post.acf?.publish_date;
  if (acfDate && String(acfDate).trim() !== '') return String(acfDate);
  return formatWpDate(post.date, long);
}

function getReadTime(post: WpPost): string {
  return (
    post.acf?.reading_time ||
    post.acf?.read_time ||
    calculateReadTimeFromHtml(post.content?.rendered)
  );
}

function isPublicBlogPost(post: WpPost): boolean {
  const categories = getEmbeddedCategories(post);

  return categories.some((term) => PUBLIC_BLOG_CATEGORY_SLUGS.has(term.slug));
}

function getSortableTimestamp(post: WpPost): number {
  const parsedWpDate = new Date(post.date || 0);
  if (!Number.isNaN(parsedWpDate.getTime())) {
    return parsedWpDate.getTime();
  }
  return 0;
}

// Media (images/PDFs) uploaded to WordPress physically live on the backend
// origin, but the public www docroot serves the exact same files via a
// filesystem symlink at /wp-content/uploads. Rewriting upload URLs to the public
// host keeps the backend subdomain out of page source, og:image/twitter:image,
// and link previews — the bytes still resolve because www serves them too.
const WP_UPLOADS_HOST_RE =
  /https?:\/\/wp\.taskforceai\.tech(\/wp-content\/uploads\/)/gi;

export function toPublicMedia(url: string | undefined): string | undefined {
  if (!url) return url;
  return url.replace(WP_UPLOADS_HOST_RE, 'https://www.taskforceai.tech$1');
}

// Normalise absolute internal links (apex or www host) in WP-authored HTML to
// root-relative paths, so internal navigation never incurs a host-canonical 301
// redirect hop and stays correct regardless of the domain the page is served
// from. Only <a href> targets are touched; media URLs are left to toPublicMedia.
export function toRelativeInternalLinks(html: string): string {
  if (!html) return html;
  return html.replace(
    /href=(["'])https?:\/\/(?:www\.)?taskforceai\.tech(\/[^"']*|)\1/gi,
    (_match, quote, path) => `href=${quote}${path || '/'}${quote}`
  );
}

// Rewrite internal links in article HTML that point at the WordPress
// subdomain (wp.taskforceai.tech) so they point at the canonical frontend
// blog URL instead. This stops link equity leaking to the secondary domain.
//
// SAFETY: the [^"'/#?]+ slug group matches a SINGLE path segment only, so
// multi-segment media paths like /wp-content/uploads/photo.jpg can never
// match — images are never touched. The lookahead also skips WordPress
// system/archive paths. Only <a href="..."> targets are affected.
function rewriteInternalWpLinks(html: string): string {
  if (!html) return html;
  // Primary: <a href> targets -> canonical public blog path.
  let out = html.replace(
    /href=(["'])https?:\/\/wp\.taskforceai\.tech\/(?!wp-content|wp-admin|wp-includes|wp-json|feed|xmlrpc|category\/|tag\/|author\/)([^"'/#?]+)\/?\1/gi,
    (_match, quote, slug) => `href=${quote}/blog/${slug}${quote}`
  );
  // Catch-all: any remaining backend slug URL in the markup — e.g. the block
  // editor leaves the original URL in a junk `id="https://wp.../slug/"`
  // attribute even after the href is rewritten — so the subdomain never appears
  // in page source. Excludes wp system/media paths (media is handled by
  // toPublicMedia).
  out = out.replace(
    /https?:\/\/wp\.taskforceai\.tech\/(?!wp-content|wp-admin|wp-includes|wp-json|feed|xmlrpc|category\/|tag\/|author\/)([a-z0-9-]+)\/?/gi,
    (_match, slug) => `/blog/${slug}`
  );
  return out;
}

// Single sanitisation pass for any WordPress-authored HTML we inject into the
// page (blog article bodies, homepage/service SEO cards): fix the media host,
// rewrite backend slug links to public /blog/ paths, and collapse absolute
// internal links to relative. Keeps the backend subdomain and redirect-hop
// links out of every rendered surface.
export function sanitizeWpHtml(html: string): string {
  if (!html) return html;
  return toRelativeInternalLinks(rewriteInternalWpLinks(toPublicMedia(html) || html));
}

// Yoast builds titles as "{Post Title} - {Site Title}". If the WordPress Site
// Title is ever set to the backend subdomain (wp.taskforceai.tech), that string
// leaks into the public <title>. Normalise it to the brand name so the visible
// title never advertises the backend, regardless of the WordPress setting.
function cleanSeoTitle(title?: string): string | undefined {
  if (!title) return title;
  return title.replace(/wp\.taskforceai\.tech/gi, 'TaskForce AI');
}

export async function fetchBlogPosts(): Promise<BlogListItem[]> {
  const posts = await fetchBlogPostsRaw();

  return posts
    .filter((post) => isPublicBlogPost(post))
    .map((post) => ({
      id: post.id,
      slug: post.slug,
      title: decodeHtmlEntities(post.title?.rendered || ''),
      excerpt: stripHtml(post.excerpt?.rendered || post.content?.rendered || ''),
      content: sanitizeWpHtml(post.content?.rendered || ''),
      category: getPostCategoryName(post),
      author: getAuthorName(post),
      date: getPublishDate(post, false),
      readTime: getReadTime(post),
      image: getFeaturedImage(post),
      status: 'published',
      tags: getPostTagNames(post),
      seoTitle: cleanSeoTitle(post.yoast_head_json?.title),
      seoDescription: post.yoast_head_json?.description,
      seoImage: toPublicMedia(post.yoast_head_json?.og_image?.[0]?.url),
      datePublished: post.date,
      dateModified: post.modified || post.date,
    }))
    .sort((a, b) => {
      const postA = posts.find((p) => p.id === a.id);
      const postB = posts.find((p) => p.id === b.id);

      const dateA = postA ? getSortableTimestamp(postA) : 0;
      const dateB = postB ? getSortableTimestamp(postB) : 0;

      return dateB - dateA;
    });
}

export async function fetchBlogPostBySlug(
  slug: string
): Promise<BlogListItem | null> {
  const post = await fetchBlogPostBySlugRaw(slug);

  if (!post) return null;
  if (!isPublicBlogPost(post)) return null;

  return {
    id: post.id,
    slug: post.slug,
    title: decodeHtmlEntities(post.title?.rendered || ''),
    excerpt: stripHtml(post.excerpt?.rendered || post.content?.rendered || ''),
    content: sanitizeWpHtml(post.content?.rendered || ''),
    category: getPostCategoryName(post),
    author: getAuthorName(post),
    date: getPublishDate(post, true),
    readTime: getReadTime(post),
    image: getFeaturedImage(post),
    status: 'published',
    tags: getPostTagNames(post),
    seoTitle: cleanSeoTitle(post.yoast_head_json?.title),
    seoDescription: post.yoast_head_json?.description,
    seoImage: toPublicMedia(post.yoast_head_json?.og_image?.[0]?.url),
    datePublished: post.date,
    dateModified: post.modified || post.date,
  };
}

// ── Blog comments ──────────────────────────────────────────────────────────
// These run CLIENT-SIDE only (never during prerender), so comments are never
// baked into the SEO HTML and a slow/failed WordPress never blocks the page.

// Fetch the approved comments for a post. Uses a light direct fetch (no heavy
// retry) because comments are a non-critical enhancement — on any failure the
// caller simply hides the list. author_email is intentionally NOT requested.
export async function fetchComments(postId: number): Promise<BlogComment[]> {
  const res = await fetch(
    `${WP_API_BASE}/comments?post=${postId}&per_page=100&order=asc&_fields=id,author_name,date,content,parent`
  );
  if (!res.ok) {
    throw new Error(`Failed to load comments (${res.status})`);
  }
  const raw: WpComment[] = await res.json();
  return raw.map((c) => ({
    id: c.id,
    authorName: (c.author_name || 'Anonymous').trim(),
    date: c.date,
    content: c.content?.rendered || '',
    parent: c.parent || 0,
  }));
}

// Submit a new comment to WordPress. WordPress holds it for moderation (it will
// not appear until approved), and returns status 'approved' or 'hold'. Requires
// the WordPress side to allow anonymous REST comments (see setup notes).
export async function submitComment(params: {
  postId: number;
  authorName: string;
  authorEmail: string;
  content: string;
  parent?: number;
}): Promise<'approved' | 'hold'> {
  const res = await fetch(`${WP_API_BASE}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      post: params.postId,
      author_name: params.authorName,
      author_email: params.authorEmail,
      content: params.content,
      parent: params.parent || 0,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      (data && (data.message as string)) || `Failed to submit comment (${res.status})`
    );
  }
  return data?.status === 'approved' ? 'approved' : 'hold';
}

export function parseCommaList(value?: string): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseCtaContent(content?: string) {
  const result: Record<string, string> = {};

  if (!content) {
    return {
      badge: '',
      title: '',
      description: '',
      buttonText: '',
    };
  }

  content.split(/\r?\n/).forEach((line) => {
    const separatorIndex = line.indexOf(':');
    if (separatorIndex === -1) return;

    const key = line.slice(0, separatorIndex).trim().toLowerCase();
    const value = line.slice(separatorIndex + 1).trim();

    result[key] = value;
  });

  return {
    badge: result['badge'] ?? '',
    title: result['title'] ?? '',
    description: result['description'] ?? '',
    buttonText: result['button text'] ?? '',
  };
}

export function decodeHtmlEntities(text?: string): string {
  if (!text) return '';
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

export function stripHtml(html?: string): string {
  if (!html) return '';
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

export function cleanServiceItemTitle(title: string, serviceSlug: string): string {
  const decoded = decodeHtmlEntities(title).trim();

  const patterns = [
    new RegExp(`^${serviceSlug}-`, 'i'),
    new RegExp(`^${serviceSlug}\\s*-\\s*`, 'i'),
    new RegExp(`^${serviceSlug.replace(/-/g, '\\s*[- ]\\s*')}\\s*`, 'i'),
  ];

  let cleaned = decoded;
  patterns.forEach((pattern) => {
    cleaned = cleaned.replace(pattern, '');
  });

  return cleaned.trim();
}