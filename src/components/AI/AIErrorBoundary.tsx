'use client';

import { RefreshDotIcon, WifiOffIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import Link from 'next/link';
import { Component, type ReactNode, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
	errorInfo: string;
	retryCount: number;
}

interface ErrorBoundaryProps {
	children: ReactNode;
	fallback?: ReactNode;
	componentName?: string;
	onError?: (error: Error) => void;
}

const MAX_RETRIES = 3;
const BASE_RETRY_DELAY = 1000;

function calculateRetryDelay(retryCount: number): number {
	return BASE_RETRY_DELAY * 2 ** retryCount;
}

export class AIErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = {
			hasError: false,
			error: null,
			errorInfo: '',
			retryCount: 0,
		};
	}

	static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
		this.setState({ errorInfo: errorInfo.componentStack || '' });
		this.props.onError?.(error);
	}

	handleRetry = (): void => {
		const { retryCount } = this.state;
		if (retryCount >= MAX_RETRIES) {
			return;
		}
		setTimeout(() => {
			this.setState((prev) => ({ hasError: false, retryCount: prev.retryCount + 1 }));
		}, calculateRetryDelay(retryCount));
	};

	handleContinueWithoutAI = (): void => {
		window.sessionStorage.setItem('ai_disabled_gracefully', 'true');
		this.setState({ hasError: false });
	};

	render(): ReactNode {
		const { hasError, retryCount } = this.state;
		const { children, fallback, componentName = 'AI Component' } = this.props;

		if (hasError) {
			if (fallback) {
				return fallback;
			}

			const shouldShowRetry = retryCount < MAX_RETRIES;

			return (
				<Card className="w-full max-w-md mx-auto">
					<CardContent className="p-6 space-y-4">
						<div className="flex items-center gap-3">
							<div className="p-2 rounded-full bg-destructive/10">
								<HugeiconsIcon icon={WifiOffIcon} className="w-6 h-6 text-destructive" />
							</div>
							<div>
								<h3 className="font-semibold">{componentName} Unavailable</h3>
								<p className="text-sm text-muted-foreground">
									{retryCount > 0
										? `Retry attempt ${retryCount + 1} of ${MAX_RETRIES}`
										: 'Connection issue'}
								</p>
							</div>
						</div>

						<p className="text-sm text-muted-foreground">
							We couldn't connect to the AI tutor. Your progress is saved locally and will sync when
							connection is restored.
						</p>

						<div className="flex gap-2">
							{shouldShowRetry && (
								<Button onClick={this.handleRetry} variant="default" className="flex-1 gap-2">
									<HugeiconsIcon icon={RefreshDotIcon} className="w-4 h-4" />
									Retry
								</Button>
							)}
							<Button onClick={this.handleContinueWithoutAI} variant="outline" className="flex-1">
								Continue Without AI
							</Button>
						</div>

						<div className="text-xs text-muted-foreground space-y-1">
							<p>Available offline:</p>
							<ul className="list-disc list-inside">
								<li>Review saved flashcards</li>
								<li>Practice with cached quizzes</li>
								<li>Continue study sessions</li>
							</ul>
						</div>

						<Button asChild variant="ghost" className="w-full">
							<Link href="/offline">View Offline Options</Link>
						</Button>
					</CardContent>
				</Card>
			);
		}

		return children;
	}
}

export function OfflineFallback({
	title = 'Offline',
	description = 'Continue learning without internet connection.',
}: {
	title?: string;
	description?: string;
}): ReactNode {
	return (
		<Card className="w-full max-w-md mx-auto">
			<CardContent className="p-6 space-y-4">
				<div className="flex items-center gap-3">
					<div className="p-2 rounded-full bg-primary/10">
						<HugeiconsIcon icon={WifiOffIcon} className="w-6 h-6 text-primary" />
					</div>
					<div>
						<h3 className="font-semibold">{title}</h3>
						<p className="text-sm text-muted-foreground">You&apos;re offline</p>
					</div>
				</div>

				<p className="text-sm text-muted-foreground">{description}</p>

				<div className="space-y-2">
					<Button asChild className="w-full">
						<Link href="/flashcards">Continue with Flashcards</Link>
					</Button>
					<Button asChild variant="outline" className="w-full">
						<Link href="/quiz">Review Saved Questions</Link>
					</Button>
				</div>

				<div className="flex items-center gap-2 text-xs text-muted-foreground">
					<div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
					<span>Will sync when online</span>
				</div>
			</CardContent>
		</Card>
	);
}

interface AIFeatureWrapperProps {
	children: ReactNode;
	componentName?: string;
	onError?: (error: Error) => void;
	showOfflineOption?: boolean;
}

export function AIFeatureWrapper({
	children,
	componentName = 'AI Feature',
	onError,
	showOfflineOption = true,
}: AIFeatureWrapperProps): ReactNode {
	const [isOffline, setIsOffline] = useState(false);

	useEffect(() => {
		const handleOnline = () => setIsOffline(false);
		const handleOffline = () => setIsOffline(true);

		window.addEventListener('online', handleOnline);
		window.addEventListener('offline', handleOffline);
		setIsOffline(!navigator.onLine);

		return () => {
			window.removeEventListener('online', handleOnline);
			window.removeEventListener('offline', handleOffline);
		};
	}, []);

	if (isOffline && showOfflineOption) {
		return <OfflineFallback />;
	}

	return (
		<AIErrorBoundary componentName={componentName} onError={onError}>
			{children}
		</AIErrorBoundary>
	);
}
