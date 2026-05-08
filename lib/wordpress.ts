export const WP_API_BASE = import.meta.env.VITE_WP_API;

async function fetchWpResponse(path: string): Promise<Response> {
  const url = `${WP_API_BASE}${path}`;
  const response = await fetch(url);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('WP API FAILED URL:', url);
    console.error('WP API FAILED STATUS:', response.status);
    console.error('WP API FAILED RESPONSE:', errorText);
    throw new Error(`WordPress API error: ${response.status}`);
  }

  return response;
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
  return (
    post._embedded?.['wp:featuredmedia']?.[0]?.source_url ||
    post.yoast_head_json?.og_image?.[0]?.url ||
    ''
  );
}

function getAuthorName(post: WpPost): string {
  return (
    post.acf?.blog_author_name ||
    post.acf?.author_name ||
    post._embedded?.author?.[0]?.name ||
    'TaskForce Team'
  );
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

export async function fetchBlogPosts(): Promise<BlogListItem[]> {
  const posts = await fetchBlogPostsRaw();

  return posts
    .filter((post) => isPublicBlogPost(post))
    .map((post) => ({
      id: post.id,
      slug: post.slug,
      title: decodeHtmlEntities(post.title?.rendered || ''),
      excerpt: stripHtml(post.excerpt?.rendered || post.content?.rendered || ''),
      content: post.content?.rendered || '',
      category: getPostCategoryName(post),
      author: getAuthorName(post),
      date: getPublishDate(post, false),
      readTime: getReadTime(post),
      image: getFeaturedImage(post),
      status: 'published',
      tags: getPostTagNames(post),
      seoTitle: post.yoast_head_json?.title,
      seoDescription: post.yoast_head_json?.description,
      seoImage: post.yoast_head_json?.og_image?.[0]?.url,
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
    content: post.content?.rendered || '',
    category: getPostCategoryName(post),
    author: getAuthorName(post),
    date: getPublishDate(post, true),
    readTime: getReadTime(post),
    image: getFeaturedImage(post),
    status: 'published',
    tags: getPostTagNames(post),
    seoTitle: post.yoast_head_json?.title,
    seoDescription: post.yoast_head_json?.description,
    seoImage: post.yoast_head_json?.og_image?.[0]?.url,
  };
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