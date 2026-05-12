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

const SITE_URL = (process.env.VITE_SITE_URL || "https://www.taskforceai.tech").replace(/\/$/, "");  // Set the live domain URL
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
  }

  return routes;
}

async function waitForRouteReady(page, route) {
  await page.waitForFunction(
    (route) => {
      const text = document.body.innerText || "";

      // Wait for key content to load for SEO (exclude "Loading..." and service-specific content markers)
      if (route.startsWith("/service/")) {
        return Boolean(document.querySelector('[data-prerender="service-detail"]'));
      }

      if (route === "/blog/") {
        return document.querySelectorAll('[data-prerender="blog-card"]').length > 0;
      }

      if (route.startsWith("/blog/")) {
        return Boolean(document.querySelector('[data-prerender="blog-post"]'));
      }

      return text.length > 500;  // Wait for enough content to be visible
    },
    { timeout: 90000 },
    route
  );
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

  try {
    const blogRoutes = await getPublicBlogRoutes();
    const routes = [...new Set([...staticRoutes, ...blogRoutes])];

    console.log("Prerender routes:");
    console.log(routes);

    for (const route of routes) {
      const page = await browser.newPage();

      const liveUrl = `${SITE_URL}${route}`;  // Use live URL (not localhost) for prerendering
      console.log(`Rendering: ${liveUrl}`);

      await page.goto(liveUrl, {
        waitUntil: "networkidle0",  // Wait until all network requests have completed
        timeout: 90000,  // 90 seconds to ensure full page load
      });

      await waitForRouteReady(page, route);

      const html = await page.content();  // Capture the fully rendered HTML

      const filePath =
        route === "/"
          ? path.join(distPath, "index.html")  // For homepage
          : path.join(distPath, route, "index.html");  // For other pages

      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, html, "utf8");  // Save the rendered HTML

      await page.close();
    }

    console.log("✅ Pre-render complete");
  } catch (err) {
    console.error("❌ Pre-render failed:", err);
    process.exitCode = 1;
  } finally {
    await browser.close();
    server.close();
  }
});
