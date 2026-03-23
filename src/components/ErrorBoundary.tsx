'use client';

import { Warning } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Component, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ErrorBoundaryProps {
	children: ReactNode;
	fallback?: ReactNode;
}

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		console.error('ErrorBoundary caught an error:', error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback;
			}

			return (
				<div className="flex flex-col items-center justify-center min-h-screen p-6 bg-muted dark:bg-background">
					<Card className="p-8 max-w-md w-full text-center space-y-6">
						<div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
							<HugeiconsIcon icon={Warning} className="w-8 h-8 text-red-600 dark:text-red-400" />
						</div>
						<div className="space-y-2">
							<h2 className="text-2xl font-semibold text-foreground">Something went wrong</h2>
							<p className="text-sm text-muted-foreground dark:text-muted-foreground">
								{this.state.error?.message || 'An unexpected error occurred'}
							</p>
						</div>
						<div className="flex gap-4">
							<Button variant="outline" onClick={() => window.location.reload()} className="flex-1">
								Reload Page
							</Button>
							<Button
								onClick={() => {
									this.setState({ hasError: false, error: null });
									window.location.href = '/';
								}}
								className="flex-1"
							>
								Go Home
							</Button>
						</div>
					</Card>
				</div>
			);
		}

		return this.props.children;
	}
}
