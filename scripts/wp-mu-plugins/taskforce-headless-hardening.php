<?php
/**
 * Plugin Name: TaskForce Headless Hardening
 * Description: Enforces the "private headless backend" posture for wp.taskforceai.tech
 *              (Option A). Blocks all crawling, disables XML sitemaps and author
 *              archives, prevents author enumeration, and sends a site-wide noindex
 *              header as defence-in-depth beside blog_public=0 — while keeping
 *              /wp-json post reads and /wp-content/uploads media publicly readable so
 *              the React front end at www.taskforceai.tech keeps working.
 *
 * This file is version-controlled in the front-end repo under
 * scripts/wp-mu-plugins/ and must be copied to
 * wp-content/mu-plugins/ on the wp.taskforceai.tech install (deploys only push the
 * static site to the www docroot, not WordPress).
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

/* 1. robots.txt -> disallow everything. This subdomain must never be crawled;
 *    the public sitemap lives on www.taskforceai.tech. Priority PHP_INT_MAX so we
 *    run last and discard whatever earlier hooks (incl. Yoast's default allow-all
 *    block) put in $output. */
add_filter( 'robots_txt', function () {
	return "# wp.taskforceai.tech is a private headless CMS backend.\n"
		. "User-agent: *\nDisallow: /\n";
}, PHP_INT_MAX );

/* 2. Disable Yoast XML sitemaps entirely, and hard-block any sitemap URL that
 *    still resolves (Yoast Premium / cached rewrites) so back-end URLs stop
 *    leaking (sitemap_index.xml, post-sitemap.xml, author-sitemap.xml, etc.). */
add_filter( 'wpseo_enable_xml_sitemap', '__return_false' );
add_action( 'template_redirect', function () {
	$uri = isset( $_SERVER['REQUEST_URI'] ) ? $_SERVER['REQUEST_URI'] : '';
	if ( preg_match( '#sitemap([_-][a-z0-9_]*)?\.xml#i', $uri ) ) {
		wp_safe_redirect( home_url( '/' ), 301 );
		exit;
	}
}, 0 );

/* 3. Site-wide noindex header on every PHP-served response (HTML + REST),
 *    belt-and-suspenders beside the blog_public=0 meta tag. Static files under
 *    /wp-content/uploads are served by the web server and are unaffected, so
 *    images continue to load on the public site. */
add_action( 'send_headers', function () {
	header( 'X-Robots-Tag: noindex, nofollow', true );
} );

/* 4. Kill author archives and ?author= enumeration. Runs at priority 0 so it
 *    preempts core's canonical redirect, which would otherwise leak the author
 *    slug in a Location header before the page renders. */
add_action( 'template_redirect', function () {
	if ( is_author() || isset( $_GET['author'] ) ) {
		wp_safe_redirect( home_url( '/' ), 301 );
		exit;
	}
}, 0 );

/* 5. Remove WordPress head discovery links that advertise the back-end
 *    (RSD/WLW manifest). REST and oEmbed author embeds are intentionally left
 *    intact so the front end can still resolve post authors at runtime. */
remove_action( 'wp_head', 'rsd_link' );
remove_action( 'wp_head', 'wlwmanifest_link' );
