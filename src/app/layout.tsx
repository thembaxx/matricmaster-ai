import type { Metadata, Viewport } from 'next';
import { OfflineIndicator } from '@/components/AI/OfflineIndicator';
import { WebLLMDownloader } from '@/components/AI/WebLLMDownloader';
import { DeferredAnalytics } from '@/components/DeferredAnalytics';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import ClientProviders from '@/components/Layout/ClientProvidersDynamic';
import { NavigationProgress } from '@/components/NavigationProgress';
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration';
import { Toaster } from '@/components/Toaster';
import { ThemeProvider } from '@/components/theme-provider';
import '@/styles/index.css';
import { appConfig } from '../app.config';
import { geistMono, geistSans, notoSansMath, playfair } from './fonts';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://matricmaster.ai';

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
	creator: appConfig.name,
	publisher: appConfig.name,
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
	maximumScale: 1,
	userScalable: false,
};

const jsonLd = {
	'@context': 'https://schema.org',
	'@graph': [
		{
			'@type': 'Organization',
			name: appConfig.name,
			url: baseUrl,
			description: appConfig.description,
			logo: `${baseUrl}/icon-192.png`,
		},
		{
			'@type': 'WebApplication',
			name: appConfig.name,
			url: baseUrl,
			description:
				'Interactive past papers and step-by-step guides for South African Grade 12 students. Personalized explanations and practice for NSC exams.',
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
			className={`${geistMono.variable} ${geistSans.variable} ${playfair.variable} ${notoSansMath.variable}`}
		>
			<head>
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
				<link rel="dns-prefetch" href="https://images.unsplash.com" />
				<link rel="dns-prefetch" href="https://lh3.googleusercontent.com" />
				<script type="application/ld+json" suppressHydrationWarning>
					{JSON.stringify(jsonLd)}
				</script>
			</head>
			<body className="bg-background min-h-screen">
				<a
					href="#main-content"
					className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:outline-none"
				>
					skip to main content
				</a>
				<ErrorBoundary>
					<ThemeProvider defaultTheme="system" storageKey="matric-master-theme">
						<NavigationProgress />
						<ClientProviders>{children}</ClientProviders>
						<Toaster />
						<ServiceWorkerRegistration />
						<OfflineIndicator />
						<WebLLMDownloader />
					</ThemeProvider>
				</ErrorBoundary>
				<DeferredAnalytics />
			</body>
		</html>
	);
}
