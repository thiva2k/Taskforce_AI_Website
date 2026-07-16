import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar,
  User,
  ArrowLeft,
  Clock,
  Twitter,
  Linkedin,
  Facebook,
  Link as LinkIcon,
} from 'lucide-react';
import { SEO } from '../seo/SEO';
import { Footer } from '../layout/Footer';
import { BlogComments } from '../blog/BlogComments';
import { fetchBlogPostBySlug, fetchBlogPosts, BlogListItem } from '../../lib/wordpress';

// Every blog page title must end in the single canonical "- TaskForce AI".
// WordPress/Yoast titles have been inconsistent: some ended in
// "- wp.taskforceai.tech" (backend subdomain leak), some had no brand suffix at
// all, and the old fallback used the reversed "AI TaskForce". Normalize by
// stripping any existing brand/backend suffix (repeatedly, to catch doubles)
// then appending the canonical one.
const BRAND = 'TaskForce AI';
const BRAND_SUFFIX_RE =
  /\s*[-–|]\s*(TaskForce AI|AI TaskForce|Taskforce AI|Taskforce Ai|wp\.taskforceai\.tech)\s*$/i;

const buildBlogTitle = (post: BlogListItem): string => {
  let base = (post.seoTitle || post.title || '').trim();
  let previous: string;
  do {
    previous = base;
    base = base.replace(BRAND_SUFFIX_RE, '').trim();
  } while (base !== previous);

  return `${base || BRAND} - ${BRAND}`;
};

// BlogPosting structured data so search engines can render the article as rich
// content (headline, image, publisher). Rendered as JSON-LD via <SEO schema>.
const buildBlogSchema = (post: BlogListItem) => {
  const url = `https://www.taskforceai.tech/blog/${post.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.seoDescription || post.excerpt || undefined,
    image: post.seoImage || post.image || undefined,
    datePublished: post.datePublished || undefined,
    dateModified: post.dateModified || post.datePublished || undefined,
    author: { '@type': 'Organization', name: post.author || BRAND },
    publisher: {
      '@type': 'Organization',
      name: BRAND,
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.taskforceai.tech/logo-icon.png',
      },
    },
    mainEntityOfPage: url,
    url,
  };
};

export const BlogPost: React.FC = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogListItem | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadPost = async () => {
      if (!slug) return;

      try {
        setLoading(true);

        const currentPost = await fetchBlogPostBySlug(slug);

        if (!currentPost) {
          navigate('/blog');
          return;
        }

        // Render the article immediately from the cheap single-post fetch
        // (~1.7s). Do NOT block on the heavy related-posts list first.
        if (mounted) {
          setPost(currentPost);
          setLoading(false);
        }

        // Related posts need the full post list (~6 MB with _embed). Skip it
        // entirely during the prerender build — pulling 6 MB on every one of
        // ~158 post pages is what overwhelms WordPress. Real visitors still get
        // related posts when the hydrated page fetches them client-side.
        const isPrerender =
          typeof window !== 'undefined' && (window as any).__IS_PRERENDER__ === true;

        if (!isPrerender) {
          try {
            const allPosts = await fetchBlogPosts();
            const related = allPosts
              .filter(
                (item) =>
                  item.slug !== currentPost.slug &&
                  item.category === currentPost.category
              )
              .slice(0, 3);
            if (mounted) setRelatedPosts(related);
          } catch (relatedError) {
            console.warn('Related posts unavailable:', relatedError);
          }
        }
      } catch (error) {
        console.error('Error fetching WordPress blog post:', error);
        navigate('/blog');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadPost();

    return () => {
      mounted = false;
    };
  }, [slug, navigate]);

  // Set the document <title> explicitly once the post loads. react-helmet
  // (via <SEO>) also sets it, but the blog post title arrives asynchronously
  // from WordPress, so this guarantees the correct per-article title is in the
  // DOM (and captured by the prerenderer) instead of the site-wide default.
  useEffect(() => {
    if (post) {
      document.title = buildBlogTitle(post);
    }
  }, [post]);

  const handleShare = (platform: 'twitter' | 'linkedin' | 'facebook' | 'copy') => {
    const url = window.location.href;
    const text = post?.title || 'Check out this article';

    switch (platform) {
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
          '_blank'
        );
        break;
      case 'linkedin':
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
          '_blank'
        );
        break;
      case 'facebook':
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          '_blank'
        );
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
        break;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-DEFAULT border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="min-h-screen selection:bg-primary-DEFAULT selection:text-white relative">
      <SEO
        title={buildBlogTitle(post)}
        description={post.seoDescription || post.excerpt}
        url={`/blog/${post.slug}`}
        image={post.seoImage || post.image}
        keywords={post.tags?.join(', ')}
        schema={buildBlogSchema(post)}
      />

      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-full h-[500px] bg-gradient-to-b from-secondary-DEFAULT/5 to-transparent" />
      </div>

      <article data-prerender="blog-post" className="relative z-10 pt-32 md:pt-40 pb-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/blog')}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Transmission Log
          </motion.button>

          <header className="mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap items-center gap-4 mb-6"
            >
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-primary-light">
                {post.category}
              </span>
              <div className="flex items-center gap-2 text-gray-400 text-sm font-mono">
                <Calendar className="w-4 h-4" />
                <span>{post.date}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm font-mono">
                <Clock className="w-4 h-4" />
                <span>{post.readTime}</span>
              </div>
            </motion.div>

            <motion.h1
              data-prerender="blog-post"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight"
            >
              {post.title}
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-between border-y border-white/10 py-6"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-white font-medium">{post.author}</div>
                  <div className="text-xs text-gray-500">Author</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => handleShare('twitter')} className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors" title="Share on Twitter">
                  <Twitter className="w-4 h-4" />
                </button>
                <button onClick={() => handleShare('linkedin')} className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors" title="Share on LinkedIn">
                  <Linkedin className="w-4 h-4" />
                </button>
                <button onClick={() => handleShare('facebook')} className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors" title="Share on Facebook">
                  <Facebook className="w-4 h-4" />
                </button>
                <button onClick={() => handleShare('copy')} className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors" title="Copy Link">
                  <LinkIcon className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </header>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-12 rounded-2xl overflow-hidden border border-white/10"
          >
            {post.image ? (
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-auto object-cover max-h-[500px]"
              />
            ) : (
              <div className="w-full h-[400px] bg-gradient-to-br from-gray-800 to-gray-900" />
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="prose prose-invert prose-lg max-w-none"
          >
            <div
              className="text-gray-300 leading-relaxed font-light [&>p]:mb-6 [&>h1]:text-4xl [&>h1]:font-bold [&>h1]:text-white [&>h1]:mb-8 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-white [&>h2]:mt-12 [&>h2]:mb-6 [&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-white [&>h3]:mt-8 [&>h3]:mb-4 [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-6 [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-6 [&>blockquote]:border-l-4 [&>blockquote]:border-primary-DEFAULT [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-gray-400 [&>img]:rounded-xl [&>img]:my-8 [&>a]:text-primary-light hover:[&>a]:text-white"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </motion.div>

          {relatedPosts.length > 0 && (
            <div className="mt-20 border-t border-white/10 pt-12">
              <h2 className="text-2xl font-bold text-white mb-8">Related Transmissions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <div
                    key={relatedPost.id}
                    onClick={() => navigate(`/blog/${relatedPost.slug}`)}
                    className="group cursor-pointer"
                  >
                    <div className="aspect-video rounded-xl overflow-hidden mb-4 relative">
                      {relatedPost.image ? (
                        <img
                          src={relatedPost.image}
                          alt={relatedPost.title}
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
                      )}
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-1 rounded bg-black/50 backdrop-blur text-[10px] text-white border border-white/10">
                          {relatedPost.category}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary-light transition-colors line-clamp-2">
                      {relatedPost.title}
                    </h3>
                    <div className="flex items-center gap-4 text-xs text-gray-500 font-mono">
                      <span>{relatedPost.date}</span>
                      <span>{relatedPost.readTime}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <BlogComments postId={post.id} />
        </div>
      </article>

      <Footer />
    </div>
  );
};