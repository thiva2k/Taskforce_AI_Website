import React from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
}
console.log('Canonical URL:', canonicalUrl);  // Log the canonical URL for debugging
const SITE_URL = 'https://www.taskforceai.tech';

const buildCanonicalUrl = (url?: string) => {
  const path =
    url ||
    (typeof window !== 'undefined' ? window.location.pathname : '/');

  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  return `${SITE_URL}${cleanPath}`;
};

export const SEO: React.FC<SEOProps> = ({
  title = 'AI TaskForce - Intelligent Automation Agents',
  description = 'Deploy autonomous AI agents to automate workflows, voice calls, document processing, and business intelligence. Scale your workforce instantly with AI TaskForce.',
  keywords = 'AI agents, automation, business intelligence, voice ai, document processing, workflow automation, enterprise AI',
  image = new URL(
    '../../Logo_Files/Taskforce Ai logo - Master/Taskforce-Ai-logo---Master.png',
    import.meta.url
  ).href,
  url,
}) => {
  const canonicalUrl = buildCanonicalUrl(url);

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonicalUrl} />

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
