/** @type {import('next').NextConfig} */
import bundleAnalyzer from '@next/bundle-analyzer';
import { withSentryConfig } from '@sentry/nextjs';

const withBundleAnalyzer = bundleAnalyzer({
	enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
	reactStrictMode: true,
	compiler: {
		removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
	},
	async headers() {
		return [
			{
				source: '/(.*)',
				headers: [
					{ key: 'X-Frame-Options', value: 'DENY' },
					{ key: 'X-Content-Type-Options', value: 'nosniff' },
					{ key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
					{ key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
					{
						key: 'Content-Security-Policy-Report-Only',
						value:
							"default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; connect-src 'self' wss://*.ably.com wss://main.realtime.ably.net https://*.ably.com https://main.realtime.ably.net https://api.iconify.design; frame-ancestors 'none'; report-uri /api/csp-report;",
					},
					{
						key: 'Strict-Transport-Security',
						value: 'max-age=31536000; includeSubDomains; preload',
					},
				],
			},
		];
	},
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
		],
		formats: ['image/avif', 'image/webp'],
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
	},
	experimental: {
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
		],
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

export default withSentryConfig(withBundleAnalyzer(nextConfig), {
	// For all available options, see:
	// https://www.npmjs.com/package/@sentry/webpack-plugin#options

	org: 'org1128',

	project: 'javascript-nextjs',

	// Only print logs for uploading source maps in CI
	silent: !process.env.CI,

	// For all available options, see:
	// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

	// Upload a larger set of source maps for prettier stack traces (increases build time)
	widenClientFileUpload: true,

	// Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
	// This can increase your server load as well as your hosting bill.
	// Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
	// side errors will fail.
	tunnelRoute: '/monitoring',

	webpack: {
		// Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
		// See the following for more information:
		// https://docs.sentry.io/product/crons/
		// https://vercel.com/docs/cron-jobs
		automaticVercelMonitors: true,

		// Tree-shaking options for reducing bundle size
		treeshake: {
			// Automatically tree-shake Sentry logger statements to reduce bundle size
			removeDebugLogging: true,
		},
	},
});
