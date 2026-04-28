
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
import { fetchHomePage, WpYoastHeadJson } from '../../lib/wordpress';

export const Home: React.FC = () => {
  const [yoast, setYoast] = useState<WpYoastHeadJson | null>(null);

  useEffect(() => {
    fetchHomePage().then((page) => {
      if (page?.yoast_head_json) setYoast(page.yoast_head_json);
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden selection:bg-primary-DEFAULT selection:text-white relative">
      <SEO
        title={yoast?.title || 'TaskForce AI - Intelligent Automation Agents'}
        description={yoast?.description || 'Deploy autonomous AI agents to automate workflows, voice calls, document processing, and business intelligence.'}
        image={yoast?.og_image?.[0]?.url || '/logo-horizontal.png'}
        url="/"
      />
      
      {/* Content Container */}
      <div className="relative z-10">
        {/* 1. Mission (Hero Section) */}
        <Hero />

        {/* 2. Offices/Bases Section */}
        <Offices />
        
        {/* 3. Deployed Agents (Services Section) */}
        <Services />
        
        {/* 4. Systematic Transformation (Process Section) */}
        <Process />
        
        {/* Supplemental Sections */}
        <Stats />
        <CTA />
        <Footer />
      </div>
      
      <Tour />
      <LanguagePopup />
    </div>
  );
};
