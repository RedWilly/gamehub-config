import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

// Revalidate the sitemap at most once every 24 hours
export const revalidate = 86400; // 24 hours in seconds

/**
 * Generates the sitemap.xml file for the website.
 * @returns A promise that resolves to an array of sitemap entries.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!baseUrl) {
    throw new Error(
      'NEXT_PUBLIC_APP_URL environment variable is not set. Sitemap generation failed. Please set it in your .env file or environment configuration.'
    );
  }

  // Fetch all config posts
  //  Config model 'id' and 'updatedAt'
  const configs = await prisma.config.findMany({
    select: {
      id: true,
      updatedAt: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  const configUrls = configs.map((config) => ({
    url: `${baseUrl}/configs/${config.id}`,
    lastModified: config.updatedAt,
    changeFrequency: 'daily' as 'daily',
    priority: 0.8,
  }));

  // static routes
  const staticUrls = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as 'daily',
      priority: 1.0,
    },
    // other static pages here, e.g.:
    // {
    //   url: `${baseUrl}/about`,
    //   lastModified: new Date(),
    //   changeFrequency: 'monthly' as 'monthly',
    //   priority: 0.5,
    // },
  ];

  return [...staticUrls, ...configUrls];
}
