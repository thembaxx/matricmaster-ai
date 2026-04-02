/** @type {import('next').NextConfig} */

import withPWAInit from '@ducanh2912/next-pwa';
import bundleAnalyzer from '@next/bundle-analyzer';
import { withSentryConfig } from '@sentry/nextjs';

const withBundleAnalyzer = bundleAnalyzer({
	enabled: process.env.ANALYZE === 'true',
});

const withPWA = withPWAInit({
	dest: 'public',
	register: true,
	skipWaiting: true,
	disable: process.env.NODE_ENV === 'development',
	workboxOptions: {
		disableDevLogs: true,
		globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
		runtimeCaching: [
			{
				urlPattern: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i,
				handler: 'CacheFirst',
				options: {
					cacheName: 'google-fonts',
					expiration: {
						maxEntries: 20,
						maxAgeSeconds: 365 * 24 * 60 * 60,
					},
				},
			},
			{
				urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
				handler: 'StaleWhileRevalidate',
				options: {
					cacheName: 'static-font-assets',
					expiration: {
						maxEntries: 20,
						maxAgeSeconds: 7 * 24 * 60 * 60,
					},
				},
			},
			{
				urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
				handler: 'StaleWhileRevalidate',
				options: {
					cacheName: 'static-image-assets',
					expiration: {
						maxEntries: 64,
						maxAgeSeconds: 30 * 24 * 60 * 60,
					},
				},
			},
			{
				urlPattern: /\/_next\/static.+\.js$/i,
				handler: 'CacheFirst',
				options: {
					cacheName: 'next-static-js-assets',
					expiration: {
						maxEntries: 64,
						maxAgeSeconds: 24 * 60 * 60,
					},
				},
			},
			{
				urlPattern: /\.(?:json|xml|csv)$/i,
				handler: 'NetworkFirst',
				options: {
					cacheName: 'static-data-assets',
					expiration: {
						maxEntries: 32,
						maxAgeSeconds: 24 * 60 * 60,
					},
					networkTimeoutSeconds: 10,
				},
			},
			{
				urlPattern: ({ url }) => {
					const isSameOrigin = self.origin === url.origin;
					return isSameOrigin && url.pathname.startsWith('/api/');
				},
				handler: 'NetworkFirst',
				options: {
					cacheName: 'apis',
					expiration: {
						maxEntries: 32,
						maxAgeSeconds: 60 * 60,
					},
					networkTimeoutSeconds: 10,
				},
			},
			{
				urlPattern: ({ url }) => {
					const isSameOrigin = self.origin === url.origin;
					return isSameOrigin && url.pathname.startsWith('/past-papers/');
				},
				handler: 'CacheFirst',
				options: {
					cacheName: 'past-papers',
					expiration: {
						maxEntries: 50,
						maxAgeSeconds: 30 * 24 * 60 * 60,
					},
				},
			},
			{
				urlPattern: /\.(?:mp3|wav|ogg|mp4)$/i,
				handler: 'CacheFirst',
				options: {
					cacheName: 'static-media-assets',
					expiration: {
						maxEntries: 32,
						maxAgeSeconds: 24 * 60 * 60,
					},
				},
			},
			{
				urlPattern: /\.(?:pdf)$/i,
				handler: 'CacheFirst',
				options: {
					cacheName: 'pdf-documents',
					expiration: {
						maxEntries: 20,
						maxAgeSeconds: 7 * 24 * 60 * 60,
					},
				},
			},
			{
				urlPattern: /^https:\/\/registry\.npmmirror\.com\/@lobehub\/.*/i,
				handler: 'CacheFirst',
				options: {
					cacheName: 'fluent-emoji-cache',
					expiration: {
						maxEntries: 100,
						maxAgeSeconds: 30 * 24 * 60 * 60,
					},
				},
			},
			{
				urlPattern: /^https:\/\/unpkg\.com\/@lobehub\/.*/i,
				handler: 'CacheFirst',
				options: {
					cacheName: 'fluent-emoji-cache',
					expiration: {
						maxEntries: 100,
						maxAgeSeconds: 30 * 24 * 60 * 60,
					},
				},
			},
			{
				urlPattern: /\.(?:webp)$/i,
				handler: 'CacheFirst',
				options: {
					cacheName: 'webp-images-cache',
					expiration: {
						maxEntries: 100,
						maxAgeSeconds: 30 * 24 * 60 * 60,
					},
				},
			},
		],
	},
});

const nextConfig = {
	reactStrictMode: true,
	transpilePackages: ['@lobehub/fluent-emoji'],
	experimental: {
		viewTransition: true,
		optimizePackageImports: [
			'lucide-react',
			'@radix-ui/react-icons',
			'@iconify/react',
			'recharts',
			'framer-motion',
			'@vercel/ai',
			'@ai-sdk/google',
			'@hugeicons/core-free-icons',
			'@hugeicons/react',
			'@lobehub/fluent-emoji',
		],
	},
	compiler: {
		removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
	},
	logging: {
		browserToTerminal: true,
	},
	// async headers() {
	// 	const securityHeaders = [
	// 		{ key: 'X-Frame-Options', value: 'DENY' },
	// 		{ key: 'X-Content-Type-Options', value: 'nosniff' },
	// 		{ key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
	// 		{ key: 'X-DNS-Prefetch-Control', value: 'on' },
	// 		{
	// 			key: 'Strict-Transport-Security',
	// 			value: 'max-age=63072000; includeSubDomains; preload',
	// 		},
	// 		{
	// 			key: 'Permissions-Policy',
	// 			value: 'camera=(), microphone=(https://customer-eu.daily.co), geolocation=()',
	// 		},
	// 		{
	// 			key: 'Content-Security-Policy',
	// 			value: [
	// 				"default-src 'self'",
	// 				"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://apis.google.com https://js.hcaptcha.com https://www.gstatic.com https://vercel.live https://*.vercel.com https://unpkg.com",
	// 				"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
	// 				"font-src 'self' https://fonts.gstatic.com",
	// 				"img-src 'self' data: https: blob:",
	// 				"media-src 'self' https://daily.co https://customer-eu.daily.co",
	// 				"connect-src 'self' https://*.ably.com https://*.googleapis.com https://*.upstash.io https://*.sentry.io https://api.uploadthing.com https://api.resend.com https://api.paystack.co https://*.vercel.com",
	// 				"worker-src 'self' blob:",
	// 				'frame-src https://www.google.com https://js.hcaptcha.com https://customer-eu.daily.co https://accounts.google.com',
	// 				'report-uri /api/csp-report',
	// 			].join('; '),
	// 		},
	// 	];

	// 	return [
	// 		{
	// 			source: '/(.*)',
	// 			headers: securityHeaders,
	// 		},
	// 	];
	// },
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'cdn3d.iconscout.com',
			},
			{
				protocol: 'https',
				hostname: 'images.unsplash.com',
			},
			{
				protocol: 'https',
				hostname: 'lh3.googleusercontent.com',
			},
			{
				protocol: 'https',
				hostname: 'ufs.sh',
			},
			{
				protocol: 'https',
				hostname: '*.supabase.co',
			},
			{
				protocol: 'https',
				hostname: 'registry.npmmirror.com',
			},
			{
				protocol: 'https',
				hostname: 'unpkg.com',
			},
		],
		formats: ['image/avif', 'image/webp'],
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
	},
	turbopack: {
		resolveAlias: {
			fs: { browser: 'empty-object' },
			net: { browser: 'empty-object' },
			tls: { browser: 'empty-object' },
			perf_hooks: { browser: 'empty-object' },
			crypto: { browser: 'empty-object' },
			stream: { browser: 'empty-object' },
			os: { browser: 'empty-object' },
			zlib: { browser: 'empty-object' },
		},
	},
};

const config = withPWA(
	withSentryConfig(withBundleAnalyzer(nextConfig), {
		org: 'org1128',
		project: 'javascript-nextjs',
		silent: !process.env.CI,
		widenClientFileUpload: true,
		tunnelRoute: '/monitoring',
		sourcemaps: {
			deleteSourcemapsAfterUpload: true,
		},
		webpack: {
			automaticVercelMonitors: true,
			treeshake: {
				removeDebugLogging: true,
			},
		},
	})
);

export default config;
