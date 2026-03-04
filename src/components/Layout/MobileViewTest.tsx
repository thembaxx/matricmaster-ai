'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';

export function MobileViewTest() {
	const isMobile = useIsMobile();
	const [testResults, setTestResults] = useState<{
		cssVariables: boolean;
		footerPositioning: boolean;
		spacing: boolean;
	}>({
		cssVariables: false,
		footerPositioning: false,
		spacing: false,
	});

	useEffect(() => {
		const runTests = () => {
			if (isMobile) {
				// Test CSS custom properties
				const root = document.documentElement;
				const navHeight = getComputedStyle(root).getPropertyValue('--mobile-nav-height');
				const safePadding = getComputedStyle(root).getPropertyValue('--mobile-safe-bottom-padding');

				const hasCSSVars = navHeight.trim() !== '' && safePadding.trim() !== '';

				// Test footer positioning
				const footer =
					document.querySelector('.mobile-footer-safe') || document.querySelector('footer');
				const hasFooter = !!footer;

				// Test spacing utilities
				const content = document.querySelector('.mobile-safe-bottom');
				const hasSpacing = !!content;

				setTestResults({
					cssVariables: hasCSSVars,
					footerPositioning: hasFooter,
					spacing: hasSpacing,
				});
			}
		};

		runTests();

		// Run tests again after a short delay to account for transitions/hydration
		const timeout = setTimeout(runTests, 1000);

		// Also run tests on any click as a simple way to re-verify during interaction
		window.addEventListener('click', runTests);

		return () => {
			clearTimeout(timeout);
			window.removeEventListener('click', runTests);
		};
	}, [isMobile]);

	if (!isMobile) {
		return null;
	}

	const allTestsPassed = Object.values(testResults).every(Boolean);

	return (
		<div className="fixed top-4 right-4 z-50 pointer-events-none">
			<Card className="p-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-border shadow-lg pointer-events-auto">
				<div className="flex items-center justify-between mb-2">
					<h3 className="font-bold text-sm">Mobile View Test</h3>
					<div className="flex gap-1">
						{Object.entries(testResults).map(([key, passed]) => (
							<div
								key={key}
								className={`w-3 h-3 rounded-full ${passed ? 'bg-green-500' : 'bg-red-500'}`}
								title={key}
							/>
						))}
					</div>
				</div>
				<div className="text-xs text-muted-foreground space-y-1">
					<div className="flex justify-between">
						<span>CSS Variables:</span>
						<span className={testResults.cssVariables ? 'text-green-600' : 'text-red-600'}>
							{testResults.cssVariables ? '✓' : '✗'}
						</span>
					</div>
					<div className="flex justify-between">
						<span>Footer Positioning:</span>
						<span className={testResults.footerPositioning ? 'text-green-600' : 'text-red-600'}>
							{testResults.footerPositioning ? '✓' : '✗'}
						</span>
					</div>
					<div className="flex justify-between">
						<span>Spacing Utilities:</span>
						<span className={testResults.spacing ? 'text-green-600' : 'text-red-600'}>
							{testResults.spacing ? '✓' : '✗'}
						</span>
					</div>
					<div className="border-t border-border mt-2 pt-2">
						<div className="flex justify-between items-center">
							<span className="font-bold text-xs">
								Status: {allTestsPassed ? 'All Tests Passed' : 'Some Issues Found'}
							</span>
							{!allTestsPassed && (
								<Button
									variant="outline"
									size="sm"
									onClick={() => window.location.reload()}
									className="text-xs"
								>
									Refresh
								</Button>
							)}
						</div>
					</div>
				</div>
			</Card>
		</div>
	);
}
