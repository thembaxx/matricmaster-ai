import { GeistMono, GeistSans } from 'geist/font';
import { Inter, Lexend, Outfit, Space_Grotesk } from 'next/font/google';

export const geistSans = GeistSans;

export const geistMono = GeistMono;

export const inter = Inter({
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-inter',
	preload: true,
});

export const lexend = Lexend({
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-lexend',
	preload: true,
});

export const outfit = Outfit({
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-outfit',
	preload: true,
});

export const spaceGrotesk = Space_Grotesk({
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-space-grotesk',
	preload: true,
});
