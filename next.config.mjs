/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	compiler: {
		removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
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
