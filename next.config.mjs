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
		],
	},
	experimental: {
		optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
	},
};

export default nextConfig;
