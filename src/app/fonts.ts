import { Inter, Outfit } from 'next/font/google';

export const inter = Inter({
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-inter',
	preload: true,
});

export const outfit = Outfit({
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-outfit',
	preload: true,
});
