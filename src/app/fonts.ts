import { GeistMono, GeistSans } from 'geist/font';
import { Lexend, Outfit } from 'next/font/google';

export const geistSans = GeistSans;

export const geistMono = GeistMono;

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
