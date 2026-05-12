import React from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string; // url can be passed to dynamically generate canonical tag
}

// Always use the live domain for SEO, so it never points to localhost
const SITE_URL = 'https://www.taskforceai.tech'; // Hardcoded to live domain

// This function dynamically constructs the canonical URL for the current page.
const buildCanonicalUrl = (url?: string) => {
  // If `url` is provided, use that; otherwise, fallback to the current page path (window.location.pathname).
  const path =
    url || (typeof window !== 'undefined' ? window.location.pathname : '/');

  // Ensure the path starts with a '/' and clean it if necessary
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  // Always prepend the live domain (to avoid localhost issues)
  return `${SITE_URL}${cleanPath}`;
};

export const SEO: React.FC<SEOProps> = ({
  title = 'TaskForce AI - Intelligent Automation Agents',
  description = "Sri Lanka's Leading AI Automation Company. We build AI voice agents, AI call centre agents, and intelligent workflow automation for businesses in Colombo and across the Middle East. Book a free demo.",
  keywords = 'AI Sri Lanka, AI voice agent Sri Lanka, AI automation company Sri Lanka, AI voice receptionist Sri Lanka, AI calling agent Sri Lanka, AI customer service Sri Lanka, AI companies in Sri Lanka, Artificial Intelligence companies in Sri Lanka, Intelligent Automation agents Sri Lanka',
  image = new URL(
    '../../Logo_Files/Taskforce Ai logo - Master/Taskforce-Ai-logo---Master.png',
    import.meta.url
  ).href,
  url,
}) => {
  const canonicalUrl = buildCanonicalUrl(url); // Generate the canonical URL dynamically

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonicalUrl} /> {/* Correctly set the canonical URL */}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
    </Helmet>
  );
};
