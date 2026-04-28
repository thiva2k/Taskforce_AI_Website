#!/usr/bin/env node

/**
 * seed-wordpress.mjs
 *
 * Reads content from the source code and POSTs it to the WordPress REST API
 * to populate all content (offices, services, process steps, stats, pages, posts).
 *
 * Usage:
 *   node scripts/seed-wordpress.mjs <username> <password>
 *
 * Or via env vars:
 *   WP_USER=admin WP_APP_PASSWORD=xxxx node scripts/seed-wordpress.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const WP_USER = process.argv[2] || process.env.WP_USER;
const WP_PASS = process.argv[3] || process.env.WP_APP_PASSWORD;

if (!WP_USER || !WP_PASS) {
  console.error('Usage: node scripts/seed-wordpress.mjs <username> <password>');
  console.error('  Or set WP_USER and WP_APP_PASSWORD env vars.');
  process.exit(1);
}

const BASE = 'https://wp.taskforceai.tech/wp-json/wp/v2';
const AUTH = 'Basic ' + Buffer.from(WP_USER + ':' + WP_PASS).toString('base64');

// Counters
const counts = {
  categories: 0,
  offices: 0,
  services: 0,
  processSteps: 0,
  stats: 0,
  pagesUpdated: 0,
  posts: 0,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

async function wpFetch(endpoint, options = {}) {
  const url = `${BASE}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: AUTH,
      ...(options.headers || {}),
    },
  });

  let body;
  const text = await res.text();
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }

  if (!res.ok) {
    const code = body?.code || res.status;
    const msg = body?.message || text.slice(0, 200);
    throw new Error(`WP API ${res.status} (${code}): ${msg}`);
  }
  return body;
}

async function getBySlug(endpoint, slug) {
  try {
    const items = await wpFetch(`${endpoint}?slug=${encodeURIComponent(slug)}&per_page=1`);
    return Array.isArray(items) && items.length > 0 ? items[0] : null;
  } catch {
    return null;
  }
}

async function createOrUpdate(endpoint, slug, data, label) {
  const existing = await getBySlug(endpoint, slug);
  await delay(300);

  if (existing) {
    console.log(`  ${label} already exists (id: ${existing.id}), updating...`);
    try {
      const updated = await wpFetch(`${endpoint}/${existing.id}`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      console.log(`  Updated ${label} (id: ${updated.id})`);
      await delay(300);
      return updated;
    } catch (err) {
      console.error(`  ERROR updating ${label}: ${err.message}`);
      await delay(300);
      return existing;
    }
  }

  try {
    const created = await wpFetch(endpoint, {
      method: 'POST',
      body: JSON.stringify({ ...data, slug }),
    });
    console.log(`  Created ${label} (id: ${created.id})`);
    await delay(300);
    return created;
  } catch (err) {
    console.error(`  ERROR creating ${label}: ${err.message}`);
    await delay(300);
    return null;
  }
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function stripTags(text) {
  return text.replace(/<[^>]*\/?>/g, '').trim();
}

// ---------------------------------------------------------------------------
// Data loading
// ---------------------------------------------------------------------------

function loadTranslation() {
  const filePath = path.join(__dirname, '..', 'public', 'locales', 'en', 'translation.json');
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function parseServicesData() {
  const filePath = path.join(__dirname, '..', 'data', 'services.tsx');
  const content = fs.readFileSync(filePath, 'utf-8');

  // Find the array content between `servicesData: ServiceData[] = [` and the final `];`
  const arrayMatch = content.match(/servicesData:\s*ServiceData\[\]\s*=\s*\[([\s\S]*)\];/);
  if (!arrayMatch) {
    throw new Error('Could not find servicesData array in services.tsx');
  }
  const arrayContent = arrayMatch[1];

  // Split by top-level service objects. Each service starts with `  {\n` at indent level 2
  // We'll use a brace-counting state machine to find each top-level object.
  const objects = [];
  let depth = 0;
  let start = -1;
  for (let i = 0; i < arrayContent.length; i++) {
    const ch = arrayContent[i];
    if (ch === '{') {
      if (depth === 0) start = i;
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0 && start !== -1) {
        objects.push(arrayContent.slice(start, i + 1));
        start = -1;
      }
    }
  }

  // Icon mapping from import name to lucide name
  const iconMap = {
    Bot: 'bot',
    Headphones: 'headphones',
    FileText: 'file-text',
    BarChart3: 'bar-chart-3',
    Code2: 'code-2',
    AppWindow: 'app-window',
  };

  const services = objects.map((block, idx) => {
    const extract = (key) => {
      const re = new RegExp(`${key}:\\s*"([^"]*(?:\\\\.[^"]*)*)"`, 's');
      const m = block.match(re);
      return m ? m[1].replace(/\\"/g, '"').replace(/\\n/g, '\n') : '';
    };

    // Extract arrays of {title, description} objects
    const extractArray = (key) => {
      // Find the array for this key
      const re = new RegExp(`${key}:\\s*\\[([\\s\\S]*?)\\](?=,\\s*\\n\\s*\\w|\\s*\\n\\s*\\})`, 's');
      const m = block.match(re);
      if (!m) return [];
      const arrContent = m[1];
      // Extract each {title: "...", description: "..."} object
      const items = [];
      const objRe = /\{\s*title:\s*"([^"]*(?:\\.[^"]*)*)",\s*description:\s*"([^"]*(?:\\.[^"]*)*)"\s*\}/g;
      let objMatch;
      while ((objMatch = objRe.exec(arrContent)) !== null) {
        items.push({
          title: objMatch[1].replace(/\\"/g, '"'),
          description: objMatch[2].replace(/\\"/g, '"'),
        });
      }
      return items;
    };

    // Extract icon
    const iconMatch = block.match(/icon:\s*(\w+)/);
    const iconImportName = iconMatch ? iconMatch[1] : '';

    return {
      id: extract('id'),
      title: extract('title'),
      icon: iconMap[iconImportName] || iconImportName.toLowerCase(),
      shortDesc: extract('shortDesc'),
      fullDesc: extract('fullDesc'),
      primaryButtonText: extract('primaryButtonText'),
      primaryButtonLink: extract('primaryButtonLink'),
      secondaryButtonText: extract('secondaryButtonText'),
      secondaryButtonLink: extract('secondaryButtonLink'),
      features: extractArray('features'),
      workflow: extractArray('workflow'),
      useCasesList: extractArray('useCasesList'),
      index: idx,
    };
  });

  return services;
}

// ---------------------------------------------------------------------------
// 1. Categories
// ---------------------------------------------------------------------------

async function seedCategories() {
  console.log('\n=== 1. Creating Categories ===');
  const slugs = [
    'how-it-works',
    'use-cases',
    'system-capabilities',
    'engineering',
    'case-study',
    'strategy',
    'thought-leadership',
    'report',
  ];

  const categoryIds = {};

  for (const slug of slugs) {
    const result = await createOrUpdate(
      '/categories',
      slug,
      { name: slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()), status: 'publish' },
      `category: ${slug}`
    );
    if (result) {
      categoryIds[slug] = result.id;
      counts.categories++;
    }
  }

  return categoryIds;
}

// ---------------------------------------------------------------------------
// 2. Offices
// ---------------------------------------------------------------------------

async function seedOffices(t) {
  console.log('\n=== 2. Creating Offices ===');

  const offices = [
    { key: 'london', city: 'London', country: 'United Kingdom', order: 1 },
    { key: 'muscat', city: 'Muscat', country: 'Oman', order: 2 },
    { key: 'colombo', city: 'Colombo', country: 'Sri Lanka', order: 3 },
  ];

  for (const office of offices) {
    const loc = t.offices.locations[office.key];
    const result = await createOrUpdate(
      '/office',
      slugify(office.city),
      {
        title: loc.city,
        status: 'publish',
        menu_order: office.order,
        acf: {
          country: loc.region,
          city: loc.city,
        },
      },
      `office: ${office.city}`
    );
    if (result) counts.offices++;
  }
}

// ---------------------------------------------------------------------------
// 5. Services
// ---------------------------------------------------------------------------

async function seedServices(services, t) {
  console.log('\n=== 5. Creating Services ===');

  for (let i = 0; i < services.length; i++) {
    const svc = services[i];
    const tSvc = t.services.items[svc.id];

    // Top use cases: first 3 from useCasesList
    const topUseCases = (tSvc?.useCasesList || svc.useCasesList)
      .slice(0, 3)
      .map((uc) => uc.title)
      .join(', ');

    const unitNum = String(i + 1).padStart(1, '0');

    const result = await createOrUpdate(
      '/service',
      svc.id,
      {
        title: svc.title,
        status: 'publish',
        menu_order: i + 1,
        acf: {
          short_description: svc.shortDesc,
          top_use_cases: topUseCases,
          button_text: 'Full Specification',
          button_link: `/service/${svc.id}`,
          status_text: 'ONLINE',
          unit_code: `UNIT-0${i + 1}`,
          icon_name: svc.icon,
          inner_hero_title: svc.title,
          inner_hero_short_desc: svc.shortDesc,
          inner_hero_long_desc: svc.fullDesc,
          inner_primary_button_text: svc.primaryButtonText,
          inner_primary_button_link: svc.primaryButtonLink,
          inner_secondary_button_text: svc.secondaryButtonText,
          inner_secondary_button_link: svc.secondaryButtonLink,
        },
      },
      `service: ${svc.title}`
    );
    if (result) counts.services++;
  }
}

// ---------------------------------------------------------------------------
// 3. Process Steps
// ---------------------------------------------------------------------------

async function seedProcessSteps(t) {
  console.log('\n=== 3. Creating Process Steps ===');

  const iconNames = ['search', 'pen-tool', 'network', 'rocket', 'activity'];

  for (let i = 0; i < t.process.steps.length; i++) {
    const step = t.process.steps[i];
    const stepNum = String(i + 1).padStart(2, '0');
    const slug = slugify(step.title);

    const result = await createOrUpdate(
      '/process_steps',
      slug,
      {
        title: step.title,
        status: 'publish',
        menu_order: i + 1,
        acf: {
          small_label: step.highlight,
          step_number: stepNum,
          short_description: step.desc,
          icon_name: iconNames[i],
        },
      },
      `process step: ${step.title}`
    );
    if (result) counts.processSteps++;
  }
}

// ---------------------------------------------------------------------------
// 4. Stats
// ---------------------------------------------------------------------------

async function seedStats(t) {
  console.log('\n=== 4. Creating Stats ===');

  for (let i = 0; i < t.stats.items.length; i++) {
    const stat = t.stats.items[i];
    const slug = slugify(stat.label);

    const result = await createOrUpdate(
      '/stat',
      slug,
      {
        title: stat.label,
        status: 'publish',
        menu_order: i + 1,
        acf: {
          value: stat.value,
          title_text: stat.label,
          subtitle: stat.sub,
        },
      },
      `stat: ${stat.label}`
    );
    if (result) counts.stats++;
  }
}

// ---------------------------------------------------------------------------
// 7. Home Page ACF
// ---------------------------------------------------------------------------

async function seedHomePage(t) {
  console.log('\n=== 7. Updating Home Page ACF ===');

  const pages = await wpFetch('/pages?slug=home&per_page=1');
  await delay(300);

  if (!Array.isArray(pages) || pages.length === 0) {
    console.error('  ERROR: Home page not found. Create a page with slug "home" first.');
    return;
  }

  const pageId = pages[0].id;
  console.log(`  Found home page (id: ${pageId})`);

  // Hero title: "We build <1/> <2/> <4/> for Every Organization." → insert scramble_text where tags are
  // Result: "We build Multi-language AI Agents for Every Organization."
  const heroTitle = 'We build Multi-language AI Agents for Every Organization.';

  // Process section title: "Systematic <1/> <2/>" + "Transformation." → "Systematic Transformation."
  const processTitle = 'Systematic Transformation.';

  // CTA content
  const ctaTitle = stripTags(t.cta.title) + ' ' + t.cta.title_highlight;
  const ctaContent = [
    `badge: ${t.cta.badge}`,
    `title: ${ctaTitle}`,
    `description: ${t.cta.description}`,
    `button text: ${t.cta.button}`,
  ].join('\n');

  try {
    const updated = await wpFetch(`/pages/${pageId}`, {
      method: 'POST',
      body: JSON.stringify({
        acf: {
          hero_badge: t.hero.badge,
          hero_title: heroTitle,
          hero_description: t.hero.intro,
          hero_primary_button_text: t.hero.cta.book,
          hero_primary_button_link: '/book-demo',
          hero_secondary_button_text: t.hero.cta.contact,
          hero_secondary_button_link: '/contact',
          process_section_badge: t.process.subtitle,
          process_section_title: processTitle,
          process_section_description: t.process.description,
          cta_content: ctaContent,
          cta_button_link: '/book-demo',
        },
      }),
    });
    console.log(`  Updated home page ACF (id: ${updated.id})`);
    counts.pagesUpdated++;
  } catch (err) {
    console.error(`  ERROR updating home page: ${err.message}`);
  }
  await delay(300);
}

// ---------------------------------------------------------------------------
// 8. About Page ACF
// ---------------------------------------------------------------------------

async function seedAboutPage(t) {
  console.log('\n=== 8. Updating About Page ACF ===');

  const pages = await wpFetch('/pages?slug=about&per_page=1');
  await delay(300);

  if (!Array.isArray(pages) || pages.length === 0) {
    console.error('  ERROR: About page not found. Create a page with slug "about" first.');
    return;
  }

  const pageId = pages[0].id;
  console.log(`  Found about page (id: ${pageId})`);

  try {
    const updated = await wpFetch(`/pages/${pageId}`, {
      method: 'POST',
      body: JSON.stringify({
        acf: {
          section_tagline: t.about.architects,
          main_heading: t.about.hero_title_prefix + ' ' + t.about.hero_title_suffix,
          headquarters_description: t.about.hero_desc,
          company_overview: t.about.team_intro,
          augmentation_title: 'Augmentation, Not Replacement.',
          augmentation_description:
            "The narrative of AI replacing humans misses the point entirely. TaskForce AI exists to augment your existing team \u2014 giving every employee superpowers, not pink slips.\n\nOur AI agents handle the repetitive, time-consuming tasks that drain your team's energy and creativity. The result? Your people become dramatically more productive, more innovative, and more engaged in meaningful work.",
          augmentation_points:
            'Enterprise-Grade Security (SOC-2 Type II), Seamless Human-in-the-Loop Handoffs, Ethical AI Frameworks',
          core1_title: 'Sovereignty First',
          core1_desc:
            'Your data is your asset. Every deployment runs in isolated environments with zero data sharing across clients. Full compliance with GDPR, SOC-2, and regional regulations.',
          core2_title: 'Outcome Obsessed',
          core2_desc:
            "We don't bill for busywork. Every engagement is measured against concrete KPIs \u2014 hours saved, error reduction, revenue impact. If the numbers don't move, we pivot until they do.",
          core3_title: 'Velocity Matters',
          core3_desc:
            "Most AI consultancies spend months on 'discovery.' We deploy working automation within weeks, then iterate. Speed of deployment is a competitive advantage we pass to you.",
          stat1_label: 'Headquarters',
          stat1_value: 'Colombo, Sri Lanka',
          stat2_label: 'Operations',
          stat2_value: 'London \u00B7 Muscat \u00B7 Colombo',
          stat3_label: 'Active Clients',
          stat3_value: '500+',
          stat4_label: 'Tasks Processed',
          stat4_value: '1B+',
          cta_title: 'Ready to Augment Your Team?',
          cta_button1: 'Book a Strategy Session',
          cta_buttonlink1: '/book-demo',
          cta_button2: 'Contact HQ',
          cta_buttonlink2: '/contact',
        },
      }),
    });
    console.log(`  Updated about page ACF (id: ${updated.id})`);
    counts.pagesUpdated++;
  } catch (err) {
    console.error(`  ERROR updating about page: ${err.message}`);
  }
  await delay(300);
}

// ---------------------------------------------------------------------------
// 6. Service Detail Posts (how-it-works, use-cases, system-capabilities)
// ---------------------------------------------------------------------------

async function seedServiceDetailPosts(services, categoryIds) {
  console.log('\n=== 6. Creating Service Detail Posts ===');

  const mappings = [
    { arrayKey: 'workflow', category: 'how-it-works' },
    { arrayKey: 'useCasesList', category: 'use-cases' },
    { arrayKey: 'features', category: 'system-capabilities' },
  ];

  for (const svc of services) {
    for (const { arrayKey, category } of mappings) {
      const catId = categoryIds[category];
      if (!catId) {
        console.error(`  WARNING: Category "${category}" not found, skipping ${arrayKey} for ${svc.id}`);
        continue;
      }

      const items = svc[arrayKey] || [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const postSlug = slugify(`${svc.id}-${item.title}`);

        const result = await createOrUpdate(
          '/posts',
          postSlug,
          {
            title: `${svc.id}-${item.title}`,
            content: `<p>${item.description}</p>`,
            status: 'publish',
            categories: [catId],
            acf: {
              service_slug: svc.id,
              item_order: String(i + 1),
            },
          },
          `post: ${svc.id}/${category}/${item.title.slice(0, 40)}`
        );
        if (result) counts.posts++;
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('WordPress Seed Script');
  console.log('=====================');
  console.log(`Target: ${BASE}`);
  console.log(`User:   ${WP_USER}`);
  console.log('');

  // Verify connectivity
  try {
    await wpFetch('/types');
    console.log('Connected to WordPress REST API successfully.');
  } catch (err) {
    console.error(`Cannot connect to WordPress API: ${err.message}`);
    process.exit(1);
  }

  // Load source data
  const t = loadTranslation();
  const services = parseServicesData();
  console.log(`Parsed ${services.length} services from data/services.tsx`);

  // Execute seed steps (order matches spec)
  const categoryIds = await seedCategories();       // Step 1
  await seedOffices(t);                             // Step 2
  await seedProcessSteps(t);                        // Step 3
  await seedStats(t);                               // Step 4
  await seedServices(services, t);                  // Step 5
  await seedServiceDetailPosts(services, categoryIds); // Step 6
  await seedHomePage(t);                            // Step 7
  await seedAboutPage(t);                           // Step 8

  // Summary
  console.log('\n=====================');
  console.log('Seed complete!');
  console.log(`  Categories:    ${counts.categories}`);
  console.log(`  Offices:       ${counts.offices}`);
  console.log(`  Services:      ${counts.services}`);
  console.log(`  Process Steps: ${counts.processSteps}`);
  console.log(`  Stats:         ${counts.stats}`);
  console.log(`  Pages Updated: ${counts.pagesUpdated}`);
  console.log(`  Posts:         ${counts.posts}`);
  console.log('=====================');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
