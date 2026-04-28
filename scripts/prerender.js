import express from "express";
import serveStatic from "serve-static";
import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const distPath = path.resolve("dist");
const app = express();

app.use(serveStatic(distPath));

// React Router fallback
app.use((req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

const WP_API = process.env.VITE_WP_API;

// ONLY Engineering category = real blog
const ENGINEERING_CATEGORY_ID = 5;

async function getEngineeringBlogRoutes() {
  try {
    if (!WP_API) return [];

    const allPosts = [];
    let page = 1;

    while (true) {
      const res = await fetch(
        `${WP_API}/posts?per_page=100&page=${page}&categories=${ENGINEERING_CATEGORY_ID}&status=publish&_fields=slug`
      );

      if (!res.ok) break;

      const posts = await res.json();
      if (!posts.length) break;

      allPosts.push(...posts);

      const totalPages = Number(res.headers.get("x-wp-totalpages") || 1);
      if (page >= totalPages) break;

      page++;
    }

    return allPosts.map((post) => `/blog/${post.slug}`);
  } catch (err) {
    console.warn("Blog fetch failed:", err.message);
    return [];
  }
}

const server = app.listen(4173, async () => {
  console.log("Server running: http://localhost:4173");

  // Use system Edge to avoid AppLocker blocking the Puppeteer-managed Chrome DLL
  const EDGE_PATH = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: EDGE_PATH,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage"
    ]
  });

  // ✅ STATIC + SERVICE PAGES
  const staticRoutes = [
    "/",
    "/about",
    "/services",
    "/contact",
    "/book-demo",
    "/blog",

    // MATCH YOUR ACTUAL service IDs
    "/service/ai-workflows",
    "/service/voice-agents",
    "/service/document-processing",
    "/service/business-intelligence",
    "/service/custom-software",
    "/service/ai-micro-apps"
  ];

  const blogRoutes = await getEngineeringBlogRoutes();

  const routes = [...new Set([...staticRoutes, ...blogRoutes])];

  console.log("Routes:");
  console.log(routes);

  try {
    for (const route of routes) {
      const page = await browser.newPage();

      const url = `http://localhost:4173${route}`;
      console.log(`Rendering: ${url}`);

      await page.goto(url, {
        waitUntil: "networkidle0",
        timeout: 60000
      });

      await page.waitForFunction(
        () => document.body.innerText.length > 100,
        { timeout: 60000 }
      );

      const html = await page.content();

      const filePath =
        route === "/"
          ? path.join(distPath, "index.html")
          : path.join(distPath, route, "index.html");

      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, html, "utf8");

      await page.close();
    }

    console.log("✅ Pre-render complete");
  } catch (err) {
    console.error("❌ Pre-render failed:", err);
  } finally {
    await browser.close();
    server.close();
  }
});
