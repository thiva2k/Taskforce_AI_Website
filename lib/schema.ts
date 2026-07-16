// Shared JSON-LD builders for page-type structured data. Every page references
// the site-wide Organization and WebSite nodes defined in the homepage schema
// (see Home.tsx), so search engines resolve them into a single linked entity
// graph rather than isolated per-page blobs.
const SITE = 'https://www.taskforceai.tech';
const ORG_REF = { '@id': `${SITE}/#organization` };
const WEBSITE_REF = { '@id': `${SITE}/#website` };

type PageSchema = Record<string, unknown>;

function basePage(
  type: string,
  name: string,
  path: string,
  description?: string
): PageSchema {
  return {
    '@context': 'https://schema.org',
    '@type': type,
    name,
    url: `${SITE}${path}`,
    isPartOf: WEBSITE_REF,
    ...(description ? { description } : {}),
  };
}

export function aboutPageSchema(
  name: string,
  path: string,
  description?: string
): PageSchema {
  return { ...basePage('AboutPage', name, path, description), about: ORG_REF };
}

export function contactPageSchema(
  name: string,
  path: string,
  description?: string
): PageSchema {
  return { ...basePage('ContactPage', name, path, description), about: ORG_REF };
}

export function collectionPageSchema(
  name: string,
  path: string,
  description: string | undefined,
  items: Array<{ url: string; name: string }> = []
): PageSchema {
  const schema = basePage('CollectionPage', name, path, description);
  if (items.length) {
    schema.mainEntity = {
      '@type': 'ItemList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: item.url,
        name: item.name,
      })),
    };
  }
  return schema;
}
