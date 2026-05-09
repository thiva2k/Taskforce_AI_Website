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

    fetchSeoCards();
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

        {/* 3. Deployed AI Agents (Services Section) */}
        <Services />

        {/* 4. Systematic Transformation (Process Section) */}
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

      <Tour />
      <LanguagePopup />
    </div>
  );
};