import type { Metadata } from 'next';
import MobileFrame from '@/components/Layout/MobileFrame';
import { ThemeProvider } from '@/components/theme-provider';
import '@/styles/index.css';
import { dmSans, inter, jakarta, lexend } from './fonts';

export const metadata: Metadata = {
	title: 'MatricMaster AI',
	description: 'Master your Matrics through practice.',
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
				<ThemeProvider defaultTheme="light" storageKey="matric-master-theme">
					<MobileFrame>{children}</MobileFrame>
				</ThemeProvider>
			</body>
		</html>
	);
}
