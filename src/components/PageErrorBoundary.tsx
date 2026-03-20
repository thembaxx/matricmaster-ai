'use client';

import { useRouter } from 'next/navigation';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
}

interface State {
	hasError: boolean;
	error?: Error;
}

export class PageErrorBoundary extends Component<Props, State> {
	public state: State = { hasError: false };

	public static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
		console.error('PageErrorBoundary caught an error:', error, errorInfo);
	}

	private handleReset = (): void => {
		this.setState({ hasError: false, error: undefined });
	};

	public render(): ReactNode {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback;
			}

			return <ErrorFallback error={this.state.error} onReset={this.handleReset} />;
		}

		return this.props.children;
	}
}

function ErrorFallback({ error, onReset }: { error?: Error; onReset: () => void }) {
	const router = useRouter();

	const handleGoHome = () => {
		router.push('/');
	};

	return (
		<div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
			<div className="max-w-md space-y-4">
				<h2 className="text-2xl font-bold text-foreground">Something went wrong</h2>
				<p className="text-muted-foreground">
					{error?.message || 'An unexpected error occurred. Please try again.'}
				</p>
				<div className="flex gap-3 justify-center pt-4">
					<Button onClick={onReset}>Try again</Button>
					<Button variant="outline" onClick={handleGoHome}>
						Go to home
					</Button>
				</div>
			</div>
		</div>
	);
}
