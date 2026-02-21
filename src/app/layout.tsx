import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata, Viewport } from 'next';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { GamificationProvider } from '@/components/Gamification';
import AppLayout from '@/components/Layout/AppLayout';
import NotificationListener from '@/components/Notifications/NotificationListener';
import { Toaster } from '@/components/Toaster';
import { ThemeProvider } from '@/components/theme-provider';
import WebVitals from '@/components/WebVitals';
import { AblyClientProvider } from '@/lib/ably/provider';
import '@/styles/index.css';
import { inter, outfit } from './fonts';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://matricmaster.ai';

export const metadata: Metadata = {
	title: {
		default: 'MatricMaster AI',
		template: '%s | MatricMaster AI',
	},
	description:
		'Master your Matric exams through interactive practice. Access past papers, step-by-step guides, and AI-powered explanations for South African Grade 12 students.',
	keywords: [
		'matric',
		'grade 12',
		'south africa',
		'past papers',
		'study guide',
		'education',
		'math',
		'physics',
		'chemistry',
		'NSC',
	],
	authors: [{ name: 'MatricMaster AI' }],
	creator: 'MatricMaster AI',
	publisher: 'MatricMaster AI',
	formatDetection: {
		email: false,
		address: false,
		telephone: false,
	},
	metadataBase: new URL(baseUrl),
	manifest: '/manifest.json',
	appleWebApp: {
		capable: true,
		statusBarStyle: 'default',
		title: 'MatricMaster',
	},
	openGraph: {
		type: 'website',
		locale: 'en_ZA',
		url: '/',
		title: 'MatricMaster AI - Master Your Matric Exams',
		description:
			'Interactive past papers and step-by-step guides for South African Grade 12 students.',
		siteName: 'MatricMaster AI',
		images: [
			{
				url: '/api/og?title=MatricMaster+AI&description=Master+your+Matric+exams',
				width: 1200,
				height: 630,
				alt: 'MatricMaster AI - Master Your Matric Exams',
			},
		],
	},
	twitter: {
		card: 'summary_large_image',
		title: 'MatricMaster AI',
		description: 'Master your Matric exams through interactive practice.',
		images: ['/api/og?title=MatricMaster+AI&description=Master+your+Matric+exams'],
		creator: '@matricmaster',
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			'max-video-preview': -1,
			'max-image-preview': 'large',
			'max-snippet': -1,
		},
	},
	alternates: {
		canonical: '/',
	},
};

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning className={`${inter.variable} ${outfit.variable}`}>
			<head>
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
				<link rel="preconnect" href="https://api.dicebear.com" />
				<link rel="dns-prefetch" href="https://images.unsplash.com" />
				<link rel="dns-prefetch" href="https://lh3.googleusercontent.com" />
			</head>
			<body className="bg-background min-h-screen">
				<WebVitals />
				<a
					href="#main-content"
					className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:outline-none"
				>
					Skip to main content
				</a>
				<ErrorBoundary>
					<ThemeProvider defaultTheme="light" storageKey="matric-master-theme">
						<GamificationProvider>
							<AblyClientProvider>
								<NotificationListener>
									<AppLayout>{children}</AppLayout>
								</NotificationListener>
							</AblyClientProvider>
							<Toaster />
						</GamificationProvider>
					</ThemeProvider>
				</ErrorBoundary>
				<Analytics />
				<SpeedInsights />
			</body>
		</html>
	);
}
