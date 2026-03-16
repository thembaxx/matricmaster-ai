import { GeistMono, GeistSans } from 'geist/font';
import {
	Crimson_Pro,
	DM_Sans,
	JetBrains_Mono,
	Lexend,
	Literata,
	Noto_Sans_Math,
	Outfit,
	Playfair_Display,
	Sora,
	Source_Serif_4,
	Space_Grotesk,
} from 'next/font/google';

export const geistSans = GeistSans;

export const geistMono = GeistMono;

export const notoSansMath = Noto_Sans_Math({
	weight: '400',
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-noto-sans-math',
	preload: true,
});

export const sourceSerif4 = Source_Serif_4({
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-source-serif4',
	preload: true,
});

export const literata = Literata({
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-literata',
	preload: true,
});

export const dmSans = DM_Sans({
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-dm-sans',
	preload: true,
});

export const jetbrainsMono = JetBrains_Mono({
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-jetbrains-mono',
	preload: true,
});

export const crimsonPro = Crimson_Pro({
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-crimson-pro',
	preload: true,
});

export const spaceGrotesk = Space_Grotesk({
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-space-grotesk',
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

export const sora = Sora({
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-sora',
	preload: true,
});

export const playfair = Playfair_Display({
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-playfair',
	preload: true,
});
