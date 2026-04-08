import { GeistMono, GeistSans } from 'geist/font';
import { JetBrains_Mono, Noto_Sans_Math, Playfair_Display } from 'next/font/google';

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
