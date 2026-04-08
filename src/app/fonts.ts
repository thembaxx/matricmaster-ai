import { GeistMono, GeistSans } from 'geist/font';
import {
	Atkinson_Hyperlegible,
	JetBrains_Mono,
	Noto_Sans_Math,
	Playfair_Display,
} from 'next/font/google';

export const geistSans = GeistSans;

export const geistMono = GeistMono;

export const jetbrainsMono = JetBrains_Mono({
	weight: ['400', '500'],
	subsets: ['latin'],
	display: 'optional',
	variable: '--font-jetbrains-mono',
	preload: false,
});

export const notoSansMath = Noto_Sans_Math({
	weight: ['400', '500', '600', '700'],
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

/* Atkinson Hyperlegible - Best for educational content, questions, and accessibility */
export const atkinson = Atkinson_Hyperlegible({
	weight: ['400', '500', '600', '700'],
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-atkinson',
	preload: true,
});
