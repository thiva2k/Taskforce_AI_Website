import express from "express";
import serveStatic from "serve-static";
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const distPath = path.resolve("dist");
const app = express();

app.use(serveStatic(distPath));

app.use((req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

const WP_API = process.env.VITE_WP_API;

const PUBLIC_BLOG_CATEGORY_SLUGS = new Set([
  "engineering",
  "case-study",
  "strategy",
  "thought-leadership",
  "report",
]);

const staticRoutes = [
  "/",
  "/about/",
  "/contact/",
  "/book-demo/",
  "/blog/",
  "/service/ai-workflows/",
  "/service/ai-voice-agents/",
  "/service/ai-document-processing/",
  "/service/business-intelligence/",
  "/service/custom-ai-software/",
  "/service/ai-booking-agents/",
];

async function getPublicBlogRoutes() {
  if (!WP_API) {
    console.warn("VITE_WP_API is missing. Blog post routes will not be prerendered.");
    return [];
  }

  const routes = [];
  let page = 1;

  while (true) {
    try {
      const res = await fetch(`${WP_API}/posts?per_page=100&page=${page}&_embed`);

      if (!res.ok) {
        console.warn(`WordPress fetch failed: ${res.status}`);
        break;
      }

      const posts = await res.json();

      for (const post of posts) {
        const terms = post._embedded?.["wp:term"]?.flat() || [];
        const isPublicBlogPost = terms.some((term) =>
          PUBLIC_BLOG_CATEGORY_SLUGS.has(term.slug)
        );

        if (isPublicBlogPost && post.slug) {
          routes.push(`/blog/${post.slug}/`);
        }
      }

      const totalPages = Number(res.headers.get("x-wp-totalpages") || 1);
      if (page >= totalPages) break;
      page++;
    } catch (err) {
      console.warn(`Error fetching blog routes (page ${page}):`, err.message);
      break;
    }
  }

  return routes;
}

async function renderRoute(browser, route) {
  const page = await browser.newPage();
  // ?prerender=1 tells the app to skip its 2200ms loading screen
  const url = `http://localhost:4173${route}?prerender=1`;

  try {
    await page.goto(url, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    // Route-specific content signals
    try {
      if (route === "/blog/" || route === "/blog") {
        // Wait for blog post cards — Blog.tsx has data-prerender="blog-card" on each card
        await page.waitForFunction(
          () => document.querySelectorAll('[data-prerender="blog-card"]').length > 0,
          { timeout: 25000 }
        );
      } else if (route.startsWith("/service/")) {
        // Service pages render static content immediately — just wait for h1
        await page.waitForFunction(
          () => {
            const h1 = document.querySelector("h1");
            return h1 && !h1.textContent.includes("Loading Service") && h1.textContent.trim().length > 3;
          },
          { timeout: 20000 }
        );
      } else {
        // Generic pages — wait for substantial text
        await page.waitForFunction(
          () => document.body.innerText.replace(/\s+/g, " ").trim().length > 300,
          { timeout: 20000 }
        );
      }
    } catch {
      console.warn(`  ⚠ Content wait timed out for ${route} — saving what we have`);
    }

    const html = await page.content();

    const filePath =
      route === "/"
        ? path.join(distPath, "index.html")
        : path.join(distPath, route, "index.html");

    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, html, "utf8");
    console.log(`  ✓ ${route}`);
    return { route, ok: true };
  } catch (err) {
    console.error(`  ✗ Failed to render ${route}:`, err.message);
    return { route, ok: false };
  } finally {
    await page.close();
  }
}

// Run up to `concurrency` routes at the same time
async function renderAll(browser, routes, concurrency = 4) {
  const results = [];
  let index = 0;

  async function worker() {
    while (index < routes.length) {
      const route = routes[index++];
      results.push(await renderRoute(browser, route));
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);
  return results;
}

const server = app.listen(4173, async () => {
  console.log(`Local prerender server running at: http://127.0.0.1:4173`);

  const isWindows = process.platform === "win32";
  const executablePath = isWindows
    ? "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
    : puppeteer.executablePath();

  const browser = await puppeteer.launch({
    headless: true,
    executablePath,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
    ],
  });

  const blogRoutes = await getPublicBlogRoutes();
  const routes = [...new Set([...staticRoutes, ...blogRoutes])];

  console.log(`\nPrerendering ${routes.length} routes (4 at a time)...`);

  const results = await renderAll(browser, routes, 4);

  const successCount = results.filter((r) => r.ok).length;
  const failCount = results.filter((r) => !r.ok).length;

  console.log(`\n✅ Pre-render complete: ${successCount} succeeded, ${failCount} failed`);

  await browser.close();
  server.close();
});
