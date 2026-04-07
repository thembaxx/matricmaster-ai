import type React from 'react';

interface OnboardingLayoutProps {
	children: React.ReactNode;
	progress: number;
	onBack?: () => void;
	showBack?: boolean;
}

export function OnboardingLayout({
	children,
	progress,
	onBack,
	showBack = true,
}: OnboardingLayoutProps) {
	return (
		<div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
			{/* Progress Bar */}
			<div className="fixed top-0 left-0 right-0 h-1.5 bg-muted z-50">
				<div
					className="h-full bg-primary transition-all duration-500 ease-out"
					style={{ width: `${progress}%` }}
				/>
			</div>

			{/* Content Area */}
			<main className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-md mx-auto w-full">
				{children}
			</main>

			{/* Navigation Footer */}
			{showBack && onBack && (
				<div className="fixed bottom-8 left-0 right-0 flex justify-center px-6">
					<button
						type="button"
						onClick={onBack}
						className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
					>
						← Go back
					</button>
				</div>
			)}
		</div>
	);
}
