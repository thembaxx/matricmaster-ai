/** @type {import('next').NextConfig} */
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
							"default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https://api.dicebear.com https://va.vercel-scripts.com wss://*.ably.com wss://main.realtime.ably.net https://*.ably.com https://main.realtime.ably.net https://api.iconify.design; frame-ancestors 'none'; report-uri /api/csp-report;",
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
				hostname: 'api.dicebear.com',
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
		],
		formats: ['image/avif', 'image/webp'],
	},
	experimental: {
		optimizePackageImports: [
			'lucide-react',
			'@radix-ui/react-icons',
			'@iconify/react',
			'recharts',
			'framer-motion',
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

export default nextConfig;
