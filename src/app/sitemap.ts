import type { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://matricmaster.ai';

export default function sitemap(): MetadataRoute.Sitemap {
	return [
		{
			url: `${baseUrl}/`,
			lastModified: new Date(),
			changeFrequency: 'daily',
			priority: 1,
		},
		{
			url: `${baseUrl}/dashboard`,
			lastModified: new Date(),
			changeFrequency: 'daily',
			priority: 0.9,
		},
		{
			url: `${baseUrl}/past-papers`,
			lastModified: new Date(),
			changeFrequency: 'weekly',
			priority: 0.8,
		},
		{
			url: `${baseUrl}/lessons`,
			lastModified: new Date(),
			changeFrequency: 'weekly',
			priority: 0.8,
		},
		{
			url: `${baseUrl}/study-plan`,
			lastModified: new Date(),
			changeFrequency: 'weekly',
			priority: 0.7,
		},
		{
			url: `${baseUrl}/leaderboard`,
			lastModified: new Date(),
			changeFrequency: 'daily',
			priority: 0.6,
		},
		{
			url: `${baseUrl}/achievements`,
			lastModified: new Date(),
			changeFrequency: 'weekly',
			priority: 0.6,
		},
		{
			url: `${baseUrl}/profile`,
			lastModified: new Date(),
			changeFrequency: 'monthly',
			priority: 0.5,
		},
		{
			url: `${baseUrl}/search`,
			lastModified: new Date(),
			changeFrequency: 'always',
			priority: 0.5,
		},
		{
			url: `${baseUrl}/sign-in`,
			lastModified: new Date(),
			changeFrequency: 'monthly',
			priority: 0.3,
		},
		{
			url: `${baseUrl}/sign-up`,
			lastModified: new Date(),
			changeFrequency: 'monthly',
			priority: 0.3,
		},
	];
}
