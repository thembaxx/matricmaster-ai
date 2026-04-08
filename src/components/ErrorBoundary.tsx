'use client';

import { Warning } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import * as Sentry from '@sentry/nextjs';
import { m } from 'framer-motion';
import { Component, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';

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

		// Send error to Sentry with component stack trace
		try {
			Sentry.captureException(error, {
				extra: {
					componentStack: errorInfo.componentStack,
				},
				tags: {
					errorBoundary: 'ErrorBoundary',
				},
			});
		} catch {
			// Sentry is optional
		}
	}

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback;
			}

			return (
				<div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background">
					<m.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						className="max-w-md w-full text-center space-y-6"
					>
						<div className="w-20 h-20 bg-destructive/10 rounded-3xl flex items-center justify-center mx-auto shadow-inner relative">
							<HugeiconsIcon icon={Warning} className="w-10 h-10 text-destructive" />
							<div className="absolute inset-0 rounded-full animate-ping bg-destructive/10" />
						</div>
						<div className="space-y-3">
							<h2 className="text-3xl font-black text-foreground tracking-tight font-display">
								Something went wrong
							</h2>
							<p className="text-sm text-muted-foreground leading-relaxed">
								{this.state.error?.message ||
									"We're sorry about that. Try refreshing the page or return home to start fresh."}
							</p>
						</div>
						<div className="flex gap-3 justify-center pt-4">
							<Button
								variant="outline"
								onClick={() => window.location.reload()}
								className="flex-1 rounded-xl h-12 font-bold transition-all active:scale-95"
							>
								Refresh Page
							</Button>
							<Button
								onClick={() => {
									this.setState({ hasError: false, error: null });
									window.location.href = '/';
								}}
								className="flex-1 rounded-xl h-12 font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
							>
								Return Home
							</Button>
						</div>
					</m.div>
				</div>
			);
		}

		return this.props.children;
	}
}
