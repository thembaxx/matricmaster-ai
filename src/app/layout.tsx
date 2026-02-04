import type { Metadata } from 'next';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import MobileFrame from '@/components/Layout/MobileFrame';
import { ThemeProvider } from '@/components/theme-provider';
import '@/styles/index.css';
import { dmSans, inter, jakarta, lexend } from './fonts';

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
	metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://matricmaster.ai'),
	openGraph: {
		type: 'website',
		locale: 'en_ZA',
		url: '/',
		title: 'MatricMaster AI - Master Your Matric Exams',
		description:
			'Interactive past papers and step-by-step guides for South African Grade 12 students.',
		siteName: 'MatricMaster AI',
	},
	twitter: {
		card: 'summary_large_image',
		title: 'MatricMaster AI',
		description: 'Master your Matric exams through interactive practice.',
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
	viewport: {
		width: 'device-width',
		initialScale: 1,
		maximumScale: 5,
	},
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
			className={`${inter.variable} ${jakarta.variable} ${dmSans.variable} ${lexend.variable}`}
		>
			<head>
				<link
					href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
					rel="stylesheet"
				/>
			</head>
			<body className="bg-gray-100 dark:bg-zinc-950 min-h-screen font-inter">
				<ErrorBoundary>
					<ThemeProvider defaultTheme="light" storageKey="matric-master-theme">
						<MobileFrame>{children}</MobileFrame>
					</ThemeProvider>
				</ErrorBoundary>
			</body>
		</html>
	);
}
