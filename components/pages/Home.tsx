import React, { useEffect, useState } from 'react';
import { Hero } from '../sections/Hero';
import { Offices } from '../sections/Offices';
import { Process } from '../sections/Process';
import { Services } from '../sections/Services';
import { Stats } from '../sections/Stats';
import { CTA } from '../sections/CTA';
import { Tour } from '../ui/Tour';
import { Footer } from '../layout/Footer';
import { SEO } from '../seo/SEO';
import { LanguagePopup } from '../ui/LanguagePopup';

export const Home: React.FC = () => {
  const [seoCards, setSeoCards] = useState<string[]>([]);
  const [latestBlogs, setLatestBlogs] = useState<any[]>([]); // State for storing blog posts

  useEffect(() => {
    const fetchSeoCards = async () => {
      try {
        const wpApi = import.meta.env.VITE_WP_API;

        const response = await fetch(`${wpApi}/pages?slug=home&_=${Date.now()}`, {
          cache: 'no-store',
        });

        const pages = await response.json();

        const acf = pages?.[0]?.acf;

        if (!acf) return;

        const cards = [
          acf.seo_card_1_content,
          acf.seo_card_2_content,
          acf.seo_card_3_content,
          acf.seo_card_4_content,
          acf.seo_card_5_content,
          acf.seo_card_6_content,
        ].filter((card) => card && card.trim() !== '');

        setSeoCards(cards);
      } catch (error) {
        console.error('Failed to fetch SEO cards:', error);
      }
    };

    const fetchLatestBlogs = async () => {
      try {
        const wpApi = import.meta.env.VITE_WP_API;
        const response = await fetch(`${wpApi}/posts?_limit=4&_sort=publish_date:desc&_=${Date.now()}`, {
          cache: 'no-store',
        });
        const blogs = await response.json();
        console.log('Fetched Blogs:', blogs); // Log to see the response structure

        // Map the fetched blogs to ensure they have the necessary fields
        const formattedBlogs = blogs.map(blog => ({
          title: blog.title.rendered,
          slug: blog.slug,
          date: blog.date,
          featured_image_url: blog._embedded?.['wp:featuredmedia']?.[0]?.source_url || 'default_image_url.jpg', // Update based on the response structure
        }));

        setLatestBlogs(formattedBlogs);
      } catch (error) {
        console.error('Failed to fetch blogs:', error);
      }
    };

    fetchSeoCards();
    fetchLatestBlogs();
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden selection:bg-primary-DEFAULT selection:text-white relative">
      <SEO />

      {/* Content Container */}
      <div className="relative z-10">
        {/* 1. Mission (Hero Section) */}
        <Hero />

        {/* 2. Offices/Bases Section */}
        <Offices />

        {/* 3. Latest Insights Section */}
        <section className="container mx-auto px-6 py-20 md:py-28">
          <div className="mb-12 text-center">
            <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tighter leading-tight">
              Latest Insights
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {latestBlogs.map((blog) => (
              <a
                key={blog.id}
                href={`/blog/${blog.slug}`}
                className="group block overflow-hidden rounded-2xl border border-white/10 bg-dark-surface/60 backdrop-blur-xl hover:border-primary-DEFAULT/40 transition-all duration-300"
              >
                <div className="h-44 w-full overflow-hidden bg-white/5">
                  {blog.featured_image_url ? (
                    <img
                      src={blog.featured_image_url}
                      alt={blog.title}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
                  )}
                </div>

                <div className="p-5">
                  <p className="text-xs font-mono text-primary-light mb-3">
                    {blog.category || 'Blog'}
                  </p>

                  <h3 className="text-lg font-bold text-white leading-snug group-hover:text-primary-light transition-colors">
                    {blog.title}
                  </h3>

                  <p className="text-xs text-gray-500 font-mono mt-4">
                    {new Date(blog.date).toLocaleDateString()}
                  </p>

                  <p className="text-sm text-primary-light mt-4">
                    Read More
                  </p>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* 4. Deployed AI Agents (Services Section) */}
        <Services />

        {/* 5. Systematic Transformation (Process Section) */}
        <Process />

        {/* Supplemental Sections */}
        <Stats />

        {/* WordPress Editable SEO Cards */}
        {seoCards.length > 0 && (
          <section className="container mx-auto px-6 py-20 md:py-28">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-10">
              {seoCards.map((cardContent, index) => (
                <article
                  key={index}
                  className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-dark-surface/60 p-6 md:p-8 backdrop-blur-xl hover:border-primary-DEFAULT/40 transition-all duration-300"
                >
                  {/* Grid background */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

                  {/* Glow */}
                  <div className="absolute -top-16 -right-16 w-40 h-40 bg-primary-DEFAULT/10 rounded-full blur-[70px] pointer-events-none" />

                  <div
                    className="
                      relative z-10
                      [&_h1]:text-3xl [&_h1]:md:text-4xl [&_h1]:font-bold [&_h1]:leading-tight [&_h1]:mb-5
                      [&_h2]:text-2xl [&_h2]:md:text-3xl [&_h2]:font-bold [&_h2]:leading-tight [&_h2]:mb-5
                      [&_h3]:text-xl [&_h3]:md:text-2xl [&_h3]:font-semibold [&_h3]:leading-snug [&_h3]:mb-4
                      [&_h4]:text-lg [&_h4]:md:text-xl [&_h4]:font-semibold [&_h4]:leading-snug [&_h4]:mb-3
                      [&_h1]:text-transparent [&_h1]:bg-clip-text [&_h1]:bg-gradient-to-r [&_h1]:from-primary-light [&_h1]:to-accent
                      [&_h2]:text-transparent [&_h2]:bg-clip-text [&_h2]:bg-gradient-to-r [&_h2]:from-primary-light [&_h2]:to-accent
                      [&_h3]:text-primary-light
                      [&_h4]:text-primary-light
                      [&_p]:text-sm [&_p]:md:text-base [&_p]:text-gray-400 [&_p]:leading-relaxed [&_p]:mb-4 [&_p]:text-justify
                      [&_a]:text-primary-light [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-white
                      [&_strong]:text-white
                    "
                    dangerouslySetInnerHTML={{ __html: cardContent }}
                  />
                </article>
              ))}
            </div>
          </section>
        )}

        <CTA />
        <Footer />
      </div>

      <LanguagePopup />
    </div>
  );
};
