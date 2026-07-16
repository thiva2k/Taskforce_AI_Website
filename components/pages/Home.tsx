import React, { useEffect, useState } from 'react';
import { Hero } from '../sections/Hero';
import { Offices } from '../sections/Offices';
import { Process } from '../sections/Process';
import { Services } from '../sections/Services';
import { Stats } from '../sections/Stats';
import { CTA } from '../sections/CTA';
import { Footer } from '../layout/Footer';
import { SEO } from '../seo/SEO';
import { toPublicMedia, toRelativeInternalLinks } from '../../lib/wordpress';

// Organization + WebSite structured data so search engines can resolve the brand
// entity (name, logo, social profiles, contact) and site identity. Rendered as
// JSON-LD via <SEO schema>. Values are the real, public brand details.
const HOME_SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://www.taskforceai.tech/#organization',
      name: 'TaskForce AI',
      url: 'https://www.taskforceai.tech/',
      logo: 'https://www.taskforceai.tech/logo-icon.png',
      description:
        "Sri Lanka's Leading AI Automation Company. We build AI voice agents, AI call centre agents, and intelligent workflow automation for businesses in Colombo and across the Middle East.",
      sameAs: [
        'https://www.linkedin.com/company/taskforceai-tech/',
        'https://www.instagram.com/taskforce.ai.tech',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+94-77-669-7566',
        contactType: 'customer service',
        areaServed: ['LK', 'AE'],
        availableLanguage: ['en', 'ar', 'fr'],
      },
    },
    {
      '@type': 'WebSite',
      '@id': 'https://www.taskforceai.tech/#website',
      url: 'https://www.taskforceai.tech/',
      name: 'TaskForce AI',
      publisher: { '@id': 'https://www.taskforceai.tech/#organization' },
    },
  ],
};

export const Home: React.FC = () => {
  const [seoCards, setSeoCards] = useState<string[]>([]);
  const [latestBlogs, setLatestBlogs] = useState<any[]>([]);

  useEffect(() => {
    // Fetch SEO cards
    const fetchSeoCards = async () => {
      try {
        const wpApi = import.meta.env.VITE_WP_API;

        const response = await fetch(
          `${wpApi}/pages?slug=home&_=${Date.now()}`,
          {
            cache: 'no-store',
          }
        );

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
        ]
          .filter((card) => card && card.trim() !== '')
          // Fix media host and collapse absolute internal links to relative so
          // the cards never leak the backend subdomain or trigger redirect hops.
          .map((card) => toRelativeInternalLinks(toPublicMedia(card) || ''));

        setSeoCards(cards);
      } catch (error) {
        console.error('Failed to fetch SEO cards:', error);
      }
    };

    // Fetch latest blog posts
    const fetchLatestBlogs = async () => {
      try {
        const wpApi = import.meta.env.VITE_WP_API;

        const response = await fetch(
          `${wpApi}/posts?per_page=4&_embed&_=${Date.now()}`,
          {
            cache: 'no-store',
          }
        );

        const blogs = await response.json();

const formattedBlogs = blogs.map((blog: any) => ({
  title: blog.title.rendered,
  slug: blog.slug,
  excerpt:
    blog.excerpt?.rendered
      ?.replace(/<[^>]+>/g, '')
      ?.substring(0, 110) + '...',
  featured_image_url:
    toPublicMedia(blog._embedded?.['wp:featuredmedia']?.[0]?.source_url) || '',
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
      <SEO schema={HOME_SCHEMA} />

      <div className="relative z-10">
        {/* 1. Hero */}
<Hero />

{/* 2. Offices */}
<Offices />

{/* 3. Deployed AI Agents */}
<Services />

{/* 4. We Don't Just Build AI Automations */}
<Process />

{/* 5. Stats */}
<Stats />

{/* 6. SEO Cards */}
{seoCards.length > 0 && (
  <section className="container mx-auto px-6 py-20 md:py-28">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-10">
      {seoCards.map((cardContent, index) => (
        <article
          key={index}
          className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-dark-surface/60 p-6 md:p-8 backdrop-blur-xl hover:border-primary-DEFAULT/40 transition-all duration-300"
        >
          <div
            className="
              relative z-10
              [&_h1]:text-3xl [&_h1]:md:text-4xl
              [&_h2]:text-2xl [&_h2]:md:text-3xl
              [&_h3]:text-xl [&_h3]:md:text-2xl
              [&_h4]:text-lg [&_h4]:md:text-xl
              [&_h1]:text-transparent [&_h1]:bg-clip-text [&_h1]:bg-gradient-to-r [&_h1]:from-primary-light [&_h1]:to-accent
              [&_h2]:text-transparent [&_h2]:bg-clip-text [&_h2]:bg-gradient-to-r [&_h2]:from-primary-light [&_h2]:to-accent
              [&_h3]:text-primary-light
              [&_h4]:text-primary-light
              [&_p]:text-sm [&_p]:md:text-base [&_p]:text-gray-400
              [&_a]:text-primary-light
              [&_strong]:text-white
            "
            dangerouslySetInnerHTML={{ __html: cardContent }}
          />
        </article>
      ))}
    </div>
  </section>
)}

{/* 7. Blog */}
<section className="container mx-auto px-6 py-20 md:py-28">
  <div className="mb-14 text-center">
    <p className="text-sm md:text-base tracking-[0.3em] uppercase text-primary-light font-semibold mb-4">
      BLOG
    </p>

    <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tighter leading-tight">
      Latest Insights
    </h2>
  </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {latestBlogs.map((blog) => (
      <a
        key={blog.slug}
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
          <h3 className="text-lg font-bold text-white leading-snug group-hover:text-primary-light transition-colors">
            {blog.title}
          </h3>

<p className="text-sm text-gray-400 leading-relaxed mt-4 line-clamp-3">
  {blog.excerpt}
</p>

<p className="text-sm text-primary-light mt-5 font-medium">
  Read More
</p>
        
        </div>
      </a>
    ))}
  </div>
</section>

{/* 8. Ready to deploy your AI workforce */}
<CTA />

{/* 9. Footer */}
<Footer />
      </div>
    </div>
  );
};
