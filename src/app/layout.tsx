import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { LiveRegionProvider } from '@/components/Accessibility/LiveRegions';
import { DeferredAnalytics } from '@/components/DeferredAnalytics';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ClientOnlyProviders } from '@/components/Layout/ClientOnlyProviders';
import ClientProviders from '@/components/Layout/ClientProvidersDynamic';
import { NavigationProgress } from '@/components/NavigationProgress';
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration';
import { Toaster } from '@/components/Toaster';
import { ThemeProvider } from '@/components/theme-provider';
import '@/styles/index.css';
import { domAnimation, LazyMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { appConfig } from '../app.config';
import { atkinson, geistMono, geistSans, jetbrainsMono, notoSansMath, playfair } from './fonts';

/* Google fonts are already configured in fonts.ts - use them directly */
const geistHeading = playfair;
const jetbrainsMonoLocal = jetbrainsMono;
const atkinsonLocal = atkinson;

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lumni.ai';

export const metadata: Metadata = {
	title: {
		default: appConfig.name.toLowerCase(),
		template: `%s | ${appConfig.name.toLowerCase()}`,
	},
	description: appConfig.description.toLowerCase(),
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
		'nsc',
	],
	authors: [{ name: appConfig.name.toLowerCase() }],
	creator: appConfig.name.toLowerCase(),
	publisher: appConfig.name.toLowerCase(),
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
		title: appConfig.name.toLowerCase(),
	},
	openGraph: {
		type: 'website',
		locale: 'en_za',
		url: '/',
		title: `${appConfig.name.toLowerCase()} - master your matric exams`,
		description:
			'interactive past papers and step-by-step guides for south african grade 12 students.',
		siteName: appConfig.name.toLowerCase(),
		images: [
			{
				url: `/api/og?title=${appConfig.name.replace(' ', '+')}&description=Master+your+Matric+exams`,
				width: 1200,
				height: 630,
				alt: `${appConfig.name} - Master Your Matric Exams`,
			},
		],
	},
	twitter: {
		card: 'summary_large_image',
		title: appConfig.name.toLowerCase(),
		description: 'master your matric exams through interactive practice.',
		images: [
			`/api/og?title=${appConfig.name.toLowerCase().replace(' ', '+')}&description=master+your+matric+exams`,
		],
		creator: '@lumni',
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

const jsonLd = {
	'@context': 'https://schema.org',
	'@graph': [
		{
			'@type': 'Organization',
			name: appConfig.name.toLowerCase(),
			url: baseUrl,
			description: appConfig.description.toLowerCase(),
			logo: `${baseUrl}/icon-192.png`,
		},
		{
			'@type': 'WebApplication',
			name: appConfig.name.toLowerCase(),
			url: baseUrl,
			description:
				'interactive past papers and step-by-step guides for south african grade 12 students. personalized explanations and practice for nsc exams.',
			applicationCategory: 'EducationalApplication',
			operatingSystem: 'Any',
		},
	],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
			className={cn(
				geistMono.variable,
				geistSans.variable,
				playfair.variable,
				notoSansMath.variable,
				jetbrainsMonoLocal.variable,
				atkinsonLocal.variable,
				geistHeading.variable
			)}
		>
			<head>
				{process.env.NODE_ENV === 'development' && (
					<Script
						src="//unpkg.com/react-scan/dist/auto.global.js"
						strategy="lazyOnload"
						crossOrigin="anonymous"
					/>
				)}
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
				<link rel="dns-prefetch" href="https://images.unsplash.com" />
				<link rel="dns-prefetch" href="https://lh3.googleusercontent.com" />
				<script type="application/ld+json" suppressHydrationWarning>
					{JSON.stringify(jsonLd)}
				</script>
			</head>
			<body className="bg-background min-h-screen font-body">
				<a
					href="#main-content"
					className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-6 focus:py-3 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:shadow-lg transition-all duration-200"
				>
					skip to main content
				</a>
				<LazyMotion features={domAnimation}>
					<ErrorBoundary>
						<ThemeProvider defaultTheme="system" storageKey="matric-master-theme">
							<LiveRegionProvider>
								<NavigationProgress />
								<ClientProviders>{children}</ClientProviders>
								<Toaster />
								<ServiceWorkerRegistration />
								<ClientOnlyProviders />
							</LiveRegionProvider>
						</ThemeProvider>
					</ErrorBoundary>
				</LazyMotion>
				<DeferredAnalytics />
			</body>
		</html>
	);
}
