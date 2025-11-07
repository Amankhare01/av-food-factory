import type { MetadataRoute } from 'next';
import fs from 'node:fs';
import path from 'node:path';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
  'https://www.avfoodfactory.com';

const routeToFileMap: Record<string, string> = {
  '/': 'app/page.tsx',
  '/services': 'app/services/page.tsx',
  '/contact': 'app/contact/page.tsx',
  '/privacy': 'app/privacy/page.tsx',
  '/terms': 'app/terms/page.tsx',
  '/payment-success': 'app/payment-success/page.tsx',
  '/admin': 'app/admin/page.tsx',
  '/admin/login': 'app/admin/login/page.tsx',
};

const getLastModified = (filePath: string): Date => {
  try {
    const stats = fs.statSync(path.join(process.cwd(), filePath));
    return stats.mtime;
  } catch {
    return new Date();
  }
};

export default function sitemap(): MetadataRoute.Sitemap {
  return Object.entries(routeToFileMap).map(([route, filePath]) => ({
    url: new URL(route, `${SITE_URL}/`).toString(),
    lastModified: getLastModified(filePath),
    changeFrequency: route === '/' ? 'weekly' : 'monthly',
    priority: route === '/' ? 1 : route.startsWith('/admin') ? 0.3 : 0.6,
  }));
}
