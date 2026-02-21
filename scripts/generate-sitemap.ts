import fs from 'fs';
import path from 'path';

import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const staticRoutes = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/reviews', changefreq: 'daily', priority: '0.9' },
  { path: '/about', changefreq: 'monthly', priority: '0.6' },
];

const { NEXT_PUBLIC_SITE_URL: baseUrl } = process.env;

async function getPublishedSlugs(): Promise<string[]> {
  const sql = neon(process.env.POSTGRES_URL!);
  const rows = await sql`SELECT slug FROM posts WHERE published = true ORDER BY created_at DESC`;
  return rows.map((row) => row.slug as string);
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function buildSitemap(slugs: string[]): string {
  const today = formatDate(new Date());

  const staticEntries = staticRoutes
    .map(
      (route) => `
  <url>
    <loc>${baseUrl}${route.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
    )
    .join('');

  const reviewEntries = slugs
    .map(
      (slug) => `
  <url>
    <loc>${baseUrl}/reviews/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${staticEntries}${reviewEntries}
</urlset>`;
}

async function generateSitemap() {
  console.log('Fetching published review slugs…');
  const slugs = await getPublishedSlugs();
  console.log(`Found ${slugs.length} published review(s).`);

  const sitemap = buildSitemap(slugs);

  const outputPath = path.join(process.cwd(), 'public', 'sitemap.xml');
  fs.writeFileSync(outputPath, sitemap, 'utf-8');

  console.log(
    `Sitemap written to public/sitemap.xml (${staticRoutes.length} static + ${slugs.length} review URLs).`
  );
}

generateSitemap().catch((err) => {
  console.error('Failed to generate sitemap:', err);
  process.exit(1);
});
