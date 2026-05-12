import React from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
}

const SITE_URL =
  (import.meta.env.VITE_SITE_URL || 'https://www.taskforceai.tech').replace(/\/$/, '');

const normalizePath = (url?: string) => {
  if (!url) return '/';

  try {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return new URL(url).pathname || '/';
    }
  } catch {
    // Fall through to path handling
  }

  let path = url.startsWith('/') ? url : `/${url}`;

  // Canonicalize to trailing slash because prerendered routes become directories.
  if (path !== '/' && !path.endsWith('/')) {
    path += '/';
  }

  return path;
};

const buildCanonicalUrl = (url?: string) => {
  return `${SITE_URL}${normalizePath(url)}`;
};

export const SEO: React.FC<SEOProps> = ({
  title = 'TaskForce AI - Intelligent Automation Agents',
  description = "Sri Lanka's Leading AI Automation Company. We build AI voice agents, AI call centre agents, and intelligent workflow automation for businesses in Colombo and across the Middle East. Book a free demo.",
  keywords = 'AI Sri Lanka, AI voice agent Sri Lanka, AI automation company Sri Lanka, AI voice receptionist Sri Lanka, AI calling agent Sri Lanka, AI customer service Sri Lanka, AI companies in Sri Lanka, Artificial Intelligence companies in Sri Lanka, Intelligent Automation agents Sri Lanka',
  image = '/logo-icon.png',
  url,
}) => {
  const canonicalUrl = buildCanonicalUrl(url);

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
    </Helmet>
  );
};
