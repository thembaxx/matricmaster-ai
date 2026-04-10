import { GeistMono, GeistSans } from 'geist/font';
import {
	Atkinson_Hyperlegible,
	Crimson_Pro,
	EB_Garamond,
	IBM_Plex_Serif,
	JetBrains_Mono,
	Libre_Baskerville,
	Noto_Sans_Math,
	Playfair_Display,
} from 'next/font/google';

export const geistSans = GeistSans;

export const geistMono = GeistMono;

export const jetbrainsMono = JetBrains_Mono({
	weight: ['400'],
	subsets: ['latin'],
	display: 'optional',
	variable: '--font-jetbrains-mono',
	preload: false,
});

export const notoSansMath = Noto_Sans_Math({
	weight: ['400'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-noto-sans-math',
	preload: true,
});

export const playfair = Playfair_Display({
	weight: ['400', '500', '600', '700', '800'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-playfair',
	preload: true,
});

/* Literary font for poems & books */
export const ebGaramond = EB_Garamond({
	subsets: ['latin'],
	variable: '--font-eb-garamond',
	display: 'swap',
	preload: true,
});

/* Science/Math formula font */
export const crimsonPro = Crimson_Pro({
	subsets: ['latin'],
	variable: '--font-crimson-pro',
	display: 'swap',
	preload: true,
});

/* Chemistry formula font */
export const libreBaskerville = Libre_Baskerville({
	weight: ['400', '700'],
	subsets: ['latin'],
	variable: '--font-libre-baskerville',
	display: 'swap',
	preload: true,
});

/* Accounting/Finance formula font */
export const ibmPlexSerif = IBM_Plex_Serif({
	weight: ['400', '500', '600', '700'],
	subsets: ['latin'],
	variable: '--font-ibm-plex-serif',
	display: 'swap',
	preload: true,
});

/* Atkinson Hyperlegible - Best for educational content, questions, and accessibility */
export const atkinson = Atkinson_Hyperlegible({
	weight: ['400', '700'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-atkinson',
	preload: true,
});
