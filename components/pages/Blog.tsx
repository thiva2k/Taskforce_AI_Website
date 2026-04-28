import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, User, ArrowRight, BookOpen, Clock } from 'lucide-react';
import { Footer } from '../layout/Footer';
import { SEO } from '../seo/SEO';
import { TechPanel } from '../ui/TechPanel';
import { ScrambleText } from '../ui/ScrambleText';
import { GlitchButton } from '../ui/GlitchButton';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchBlogPosts, BlogListItem } from '../../lib/wordpress';

const CATEGORIES = [
  'All',
  'Engineering',
  'Case Study',
  'Strategy',
  'Thought Leadership',
  'Report',
];

const POSTS_PER_PAGE = 6;

const normalizeCategory = (value?: string) =>
  (value || '').trim().toLowerCase();

export const Blog: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState('All');
  const [allPosts, setAllPosts] = useState<BlogListItem[]>([]);
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadPosts = async () => {
      try {
        setLoading(true);
        setErrorMessage('');

        const posts = await fetchBlogPosts();

        console.log('BLOG POSTS FETCHED:', posts);
        console.log('BLOG POSTS COUNT:', posts.length);

        if (mounted) {
          setAllPosts(Array.isArray(posts) ? posts : []);
        }
      } catch (error) {
        console.error('Error fetching WordPress blog posts:', error);

        if (mounted) {
          setAllPosts([]);
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Unknown error while fetching blog posts'
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadPosts();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setVisibleCount(POSTS_PER_PAGE);
  }, [activeCategory]);

  const filteredPosts = useMemo(() => {
    if (activeCategory === 'All') return allPosts;

    return allPosts.filter(
      (post) =>
        normalizeCategory(post.category) === normalizeCategory(activeCategory)
    );
  }, [allPosts, activeCategory]);

  const visiblePosts = filteredPosts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPosts.length;

  const loadMore = () => {
    setVisibleCount((prev) => prev + POSTS_PER_PAGE);
  };

  return (
    <div className="min-h-screen overflow-x-hidden selection:bg-primary-DEFAULT selection:text-white relative">
      <SEO
        title={t('blog.title')}
        description={t('blog.desc')}
        url="/blog"
      />

      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-full h-[500px] bg-gradient-to-b from-secondary-DEFAULT/5 to-transparent" />
      </div>

      <div className="relative z-10 pt-32 md:pt-40 pb-20">
        <section className="container mx-auto px-6 mb-20">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-primary-light mb-6 backdrop-blur-md"
            >
              <BookOpen className="w-3 h-3" />
              <span>{t('blog.transmission_log')}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tighter"
            >
              {t('blog.hero_title')} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
                <ScrambleText text={t('blog.hero_scramble')} startDelay={500} />
              </span>
            </motion.h1>
          </div>
        </section>

        <section className="container mx-auto px-6 mb-12">
          <div className="flex flex-wrap gap-2 md:gap-4 border-b border-white/10 pb-6">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${
                  activeCategory === cat
                    ? 'bg-white text-black border-white'
                    : 'bg-transparent text-gray-400 border-transparent hover:bg-white/5 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-6 mb-32">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-primary-DEFAULT border-t-transparent rounded-full animate-spin" />
            </div>
          ) : errorMessage ? (
            <TechPanel
              className="p-12 text-center bg-[#0F1115]/50 border-dashed border-red-500/20"
              animateScan={false}
            >
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-red-300" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Blog posts failed to load
              </h3>
              <p className="text-gray-400 max-w-2xl mx-auto mb-2">
                React could not get blog data from WordPress.
              </p>
              <p className="text-red-300 text-sm break-all max-w-3xl mx-auto">
                {errorMessage}
              </p>
            </TechPanel>
          ) : filteredPosts.length === 0 ? (
            <TechPanel
              className="p-12 text-center bg-[#0F1115]/50 border-dashed border-white/10"
              animateScan={false}
            >
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {t('blog.empty.title')}
              </h3>
              <p className="text-gray-400 max-w-md mx-auto mb-3">
                {t('blog.empty.desc')}
              </p>

              <p className="text-xs text-gray-500 max-w-2xl mx-auto">
                Debug: WordPress returned {allPosts.length} total post(s), but
                category "{activeCategory}" matched {filteredPosts.length} post(s).
              </p>
            </TechPanel>
          ) : (
            <>
              <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                <AnimatePresence>
                  {visiblePosts.map((post, index) => (
                    <motion.div
                      layout
                      key={post.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      onClick={() => navigate(`/blog/${post.slug}`)}
                      className="cursor-pointer"
                    >
                      <TechPanel
                        className="h-full flex flex-col group p-0 overflow-hidden border-white/10 hover:border-primary-DEFAULT/30 rounded-2xl"
                        animateScan={true}
                      >
                        <div className="h-48 w-full relative overflow-hidden">
                          {post.image ? (
                            <img
                              src={post.image}
                              alt={post.title}
                              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                          )}

                          <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />

                          <div className="absolute top-4 left-4 z-10 flex gap-2">
                            <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-[10px] font-mono text-white border border-white/10">
                              {post.category || 'General'}
                            </span>
                          </div>
                        </div>

                        <div className="p-6 md:p-8 flex flex-col flex-1">
                          <div className="flex items-center gap-4 text-xs text-gray-500 font-mono mb-4 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> {post.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {post.readTime}
                            </span>
                          </div>

                          <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary-light transition-colors leading-tight">
                            {post.title}
                          </h3>

                          <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-1 line-clamp-3">
                            {post.excerpt}
                          </p>

                          <div className="pt-6 border-t border-white/5 flex items-center justify-between mt-auto">
                            <div className="flex items-center gap-2 text-xs font-medium text-white">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center">
                                <User className="w-3 h-3 text-white" />
                              </div>
                              {post.author || 'TaskForce Team'}
                            </div>

                            <button className="text-primary-light hover:text-white transition-colors">
                              <ArrowRight className="w-5 h-5 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                            </button>
                          </div>
                        </div>
                      </TechPanel>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              {hasMore && (
                <div className="flex justify-center mt-12">
                  <GlitchButton onClick={loadMore}>
                    Load More Transmissions
                  </GlitchButton>
                </div>
              )}
            </>
          )}
        </section>

        <section className="container mx-auto px-6">
          <TechPanel
            className="rounded-[2.5rem] bg-[#0F1115] overflow-hidden p-12 md:p-20 text-center"
            animateScan={false}
          >
            <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.03]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-DEFAULT/5 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold text-white mb-4">
                Stay in the loop
              </h2>
              <p className="text-gray-400 mb-8">
                Get the latest intelligence on autonomous agents, case studies,
                and engineering deep dives delivered to your inbox.
              </p>

              <form
                className="flex flex-col sm:flex-row gap-4"
                onSubmit={(e) => e.preventDefault()}
              >
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary-DEFAULT/50 focus:bg-white/10 transition-all"
                />
                <GlitchButton className="px-8 py-4 justify-center">
                  Subscribe
                </GlitchButton>
              </form>
            </div>
          </TechPanel>
        </section>
      </div>

      <Footer />
    </div>
  );
};