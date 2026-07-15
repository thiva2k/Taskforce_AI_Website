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

// Resilience switch: by default a WP outage from CI does NOT fail the deploy —
// blog routes are skipped (they client-render at runtime; see the /blog SPA
// fallback in public/.htaccess). Set STRICT_BLOG_PRERENDER=1 to restore the old
// hard-fail behavior (abort rather than ship a non-prerendered blog).
const STRICT_BLOG = process.env.STRICT_BLOG_PRERENDER === "1";

// Set when the WP route-list fetch can't reach WordPress after all retries. Used
// to decide whether blog render failures are tolerable (WP outage) vs a real bug
// (WP reachable but a blog page rendered broken — that should still hard-fail).
let wpUnreachable = false;

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

async function fetchWpWithRetry(url, maxAttempts = 8) {
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);
    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);
      if (res.ok) return res;

      lastError = new Error(`HTTP ${res.status}`);
      const transient = res.status >= 500 || res.status === 429;
      if (!transient || attempt >= maxAttempts) throw lastError;
      console.warn(`  WP route fetch ${url} -> ${res.status} (attempt ${attempt}); retrying...`);
    } catch (err) {
      clearTimeout(timer);
      lastError = err;
      if (attempt >= maxAttempts) throw err;
      console.warn(`  WP route fetch ${url} failed (attempt ${attempt}): ${err.message}; retrying...`);
    }
    // Capped backoff + jitter so an intermittent WP/CI network blip (seen from
    // GitHub runners) is ridden out over a few minutes instead of failing fast.
    const backoff = Math.min(attempt * 4000, 20000) + Math.floor(Math.random() * 1000);
    await new Promise((r) => setTimeout(r, backoff));
  }
  throw lastError || new Error("WP fetch failed");
}

// Throws (rather than silently returning a partial list) if WordPress cannot be
// reached after retries, so the caller can abort the build instead of shipping
// an incomplete set of blog routes.
async function getPublicBlogRoutes() {
  if (!WP_API) {
    console.warn("VITE_WP_API is missing. Blog post routes will not be prerendered.");
    return [];
  }

  // Map public category slugs -> ids once (tiny payload), so we can detect
  // public posts from their category ids without pulling the heavy ~6 MB
  // _embed payload for every page of posts.
  const catRes = await fetchWpWithRetry(`${WP_API}/categories?per_page=100&_fields=id,slug`);
  const categories = await catRes.json();
  const publicCategoryIds = new Set(
    categories
      .filter((c) => PUBLIC_BLOG_CATEGORY_SLUGS.has(c.slug))
      .map((c) => c.id)
  );

  const routes = [];
  let page = 1;

  while (true) {
    // _fields keeps this light (slug + category ids only) instead of ~6 MB/_embed.
    const res = await fetchWpWithRetry(
      `${WP_API}/posts?per_page=100&page=${page}&_fields=slug,categories`
    );
    const posts = await res.json();

    for (const post of posts) {
      const isPublicBlogPost = (post.categories || []).some((id) =>
        publicCategoryIds.has(id)
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

async function renderRoute(browser, route) {
  const page = await browser.newPage();

  try {
    // ── KEY FIX ──────────────────────────────────────────────────────────────
    // evaluateOnNewDocument runs BEFORE any JavaScript on the page executes.
    // This means window.__IS_PRERENDER__ = true is set before React even loads.
    // When Hero.tsx mounts and reads window.__IS_PRERENDER__, it is already true.
    // This is guaranteed — no race condition, no URL parsing issues.
    // ─────────────────────────────────────────────────────────────────────────
    await page.evaluateOnNewDocument(() => {
      window.__IS_PRERENDER__ = true;
    });

    const isBlogList = route === "/blog/" || route === "/blog";
    const isBlogPost = route.startsWith("/blog/") && !isBlogList;

    const url = `http://localhost:4173${route}`;

    await page.goto(url, {
      waitUntil: "networkidle0",
      timeout: 60000,
    });

    // Route-specific content signals. contentOk tracks whether the page reached
    // its real, data-loaded state (vs a loading spinner or error placeholder).
    let contentOk = true;
    try {
      if (isBlogList) {
        // Blog listing — Blog.tsx puts data-prerender="blog-card" on each card.
        await page.waitForFunction(
          () => document.querySelectorAll('[data-prerender="blog-card"]').length > 0,
          { timeout: 45000 }
        );
      } else if (isBlogPost) {
        // Blog post detail — BlogPost.tsx puts data-prerender="blog-post" on the
        // <article>, which only renders once the post has loaded successfully.
        await page.waitForFunction(
          () => document.querySelector('[data-prerender="blog-post"]') !== null,
          { timeout: 45000 }
        );
      } else if (route.startsWith("/blog/")) {
        // Individual blog post — the article title arrives asynchronously from
        // WordPress. Wait for the post's <h1> (data-prerender="blog-post") to
        // render real text so the correct <title>/meta are captured, instead of
        // falling through to the homepage check below and timing out.
        await page.waitForFunction(
          () => {
            const el = document.querySelector('[data-prerender="blog-post"]');
            return el && (el.textContent || "").trim().length > 3;
          },
          { timeout: 25000 }
        );
      } else if (route.startsWith("/service/")) {
        // Service pages — wait for h1 to contain real content
        await page.waitForFunction(
          () => {
            const h1 = document.querySelector("h1");
            return (
              h1 &&
              !h1.textContent.includes("Loading Service") &&
              h1.textContent.trim().length > 3
            );
          },
          { timeout: 20000 }
        );
      } else {
        // Homepage and all other pages — wait for H1 to contain the clean title text.
        // Because __IS_PRERENDER__ is true, ScrambleText is skipped and the plain
        // text span renders immediately. We wait for it to appear in the DOM.
        await page.waitForFunction(
          () => {
            const h1 = document.querySelector("h1");
            if (!h1) return false;
            const text = (h1.textContent || "").trim();
            // Must contain readable words — no scramble chars like [ ] ^ { }
            return text.includes("We Build AI Voice Agents and Automation");
          },
          { timeout: 10000 }
        );
      }
    } catch {
      contentOk = false;
      console.warn(`  ⚠ Content wait timed out for ${route}`);
    }

    // Let React effects flush so react-helmet's <title>/meta updates are
    // committed to <head> before we serialize. Without this, the capture can
    // race ahead of Helmet and bake the stale default <head> into every page.
    await page.evaluate(
      () =>
        new Promise((resolve) =>
          requestAnimationFrame(() =>
            requestAnimationFrame(() => setTimeout(resolve, 100))
          )
        )
    );

    const html = await page.content();

    // Never ship a broken blog page. If a blog route didn't reach its loaded
    // state, or rendered the explicit WordPress error, treat it as a failure and
    // DO NOT write the file — the build aborts below instead of deploying it.
    const hasBlogError = html.includes("Blog posts failed to load");
    if ((isBlogList || isBlogPost) && (!contentOk || hasBlogError)) {
      console.error(
        `  ✗ Blog route ${route} rendered without content ` +
          `(contentOk=${contentOk}, wpError=${hasBlogError}) — not writing file`
      );
      return { route, ok: false, blogError: true };
    }

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
    return { route, ok: false, blogError: route.startsWith("/blog") };
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
      // WordPress hardcodes Access-Control-Allow-Origin: https://taskforceai.tech
      // for every origin, so the prerender server's origin (http://localhost:4173)
      // is CORS-blocked and all blog fetches fail in-browser. This is a controlled,
      // throwaway headless browser, so it's safe to disable web security here to let
      // the blog data load and be baked into the static HTML.
      "--disable-web-security",
      "--disable-features=IsolateOrigins,site-per-process",
    ],
  });

  let blogRoutes = [];
  try {
    blogRoutes = await getPublicBlogRoutes();
  } catch (err) {
    console.error(`
⚠ Could not fetch blog routes from WordPress: ${err.message}`);
    wpUnreachable = true;
    if (STRICT_BLOG) {
      console.error(`STRICT_BLOG_PRERENDER=1 — aborting so an incomplete blog is NOT deployed.`);
      await browser.close();
      server.close();
      process.exit(1);
    }
    console.warn(
      `Continuing WITHOUT blog prerendering — static + service routes still deploy; ` +
      `blog pages fall back to client-side rendering via the /blog .htaccess rule. ` +
      `(Set STRICT_BLOG_PRERENDER=1 to hard-fail instead.)`
    );
    blogRoutes = [];
  }
  const routes = [...new Set([...staticRoutes, ...blogRoutes])];

  console.log(`\nPrerendering ${routes.length} routes (2 at a time)...`);

  const results = await renderAll(browser, routes, 2);

  const successCount = results.filter((r) => r.ok).length;
  const failCount = results.filter((r) => !r.ok).length;
  const blogFailures = results.filter((r) => r.blogError);

  console.log(`\n✅ Pre-render complete: ${successCount} succeeded, ${failCount} failed`);

  // Prerender the NotFound page -> dist/404.html (served via ErrorDocument 404,
  // so unknown URLs return a real 404 instead of a soft 200 SPA shell).
  try {
    const p404 = await browser.newPage();
    await p404.evaluateOnNewDocument(() => { window.__IS_PRERENDER__ = true; });
    await p404.goto("http://localhost:4173/__not_found__", {
      waitUntil: "networkidle0",
      timeout: 30000,
    });
    try {
      await p404.waitForFunction(
        () => document.querySelector('[data-prerender="notfound"]') !== null,
        { timeout: 15000 }
      );
    } catch {
      console.warn("  404 content wait timed out");
    }
    fs.writeFileSync(path.join(distPath, "404.html"), await p404.content(), "utf8");
    await p404.close();
    console.log("  generated /404.html");
  } catch (err) {
    console.error("  Failed to render 404.html:", err.message);
  }

  await browser.close();
  server.close();

  // Layer A: fail the build if any blog route rendered without real content, so a
  // transient WordPress outage during the build can't ship a broken blog to prod.
  if (blogFailures.length > 0) {
    console.error(`
⚠ ${blogFailures.length} blog route(s) failed to render real content:`);
    blogFailures.forEach((r) => console.error(`   - ${r.route}`));
    // Tolerate blog render failures ONLY when WordPress was unreachable (the
    // timeout/outage case this resilience targets). If WP WAS reachable but a
    // blog page still rendered broken, that's a likely real bug — hard-fail so it
    // isn't shipped. STRICT_BLOG_PRERENDER=1 always hard-fails.
    const tolerate = !STRICT_BLOG && wpUnreachable;
    if (!tolerate) {
      console.error(
        `Aborting build so a broken blog is NOT deployed ` +
          `(WordPress was reachable, so this looks like a real render failure, ` +
          `not a transient outage). Set STRICT_BLOG_PRERENDER=1 to always hard-fail.`
      );
      process.exit(1);
    }
    console.warn(
      `Not writing those blog pages (no static file → they client-render at ` +
        `runtime via the /blog .htaccess fallback). Continuing the deploy because ` +
        `WordPress was unreachable during the build. ` +
        `(Set STRICT_BLOG_PRERENDER=1 to hard-fail instead.)`
    );
  }
});
