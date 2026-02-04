import MobileFrame from '@/components/Layout/MobileFrame';
import { ThemeProvider } from '@/components/theme-provider';
import type { Metadata } from 'next';
import '@/styles/index.css';

export const metadata: Metadata = {
	title: 'MatricMaster AI',
	description: 'Master your Matrics through practice.',
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<link
					href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;500;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Lexend:wght@300;400;500;600;700&display=swap"
					rel="stylesheet"
				/>
				<link
					href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
					rel="stylesheet"
				/>
			</head>
			<body className="bg-gray-100 dark:bg-zinc-950 min-h-screen">
				<ThemeProvider defaultTheme="light" storageKey="matric-master-theme">
					<MobileFrame>{children}</MobileFrame>
				</ThemeProvider>
			</body>
		</html>
	);
}
