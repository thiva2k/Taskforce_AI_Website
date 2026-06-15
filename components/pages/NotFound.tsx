import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Home, BookOpen } from 'lucide-react';
import { SEO } from '../seo/SEO';
import { Footer } from '../layout/Footer';

export const NotFound: React.FC = () => {
  return (
    <div data-prerender="notfound" className="min-h-screen flex flex-col">
      <SEO title="Page Not Found (404) - TaskForce AI" />
      <Helmet>
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <main className="flex-1 flex items-center justify-center px-6 pt-32 pb-20">
        <div className="text-center max-w-xl">
          <p className="font-mono text-primary-light text-sm tracking-[0.3em] mb-4">
            ERROR 404
          </p>
          <h1 className="text-7xl md:text-9xl font-bold text-white mb-6 tracking-tighter">
            404
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            This page could not be found
          </h2>
          <p className="text-gray-400 mb-10">
            The page you&rsquo;re looking for doesn&rsquo;t exist or may have been moved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-gradient text-white font-medium hover:opacity-90 transition-opacity"
            >
              <Home className="w-4 h-4" /> Back to Home
            </Link>
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/15 text-gray-200 hover:bg-white/5 transition-colors"
            >
              <BookOpen className="w-4 h-4" /> Read the Blog
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
