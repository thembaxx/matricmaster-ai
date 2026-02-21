'use client';

import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

interface GlobalErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
	useEffect(() => {
		console.error('Application error:', error);
	}, [error]);

	return (
		<html lang="en">
			<body style={{ margin: 0, fontFamily: 'system-ui, sans-serif' }}>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
						minHeight: '100vh',
						padding: 24,
						background: 'var(--background, #fafafa)',
						color: 'var(--foreground, #18181b)',
					}}
				>
					<div
						style={{
							maxWidth: 448,
							width: '100%',
							textAlign: 'center',
							display: 'flex',
							flexDirection: 'column',
							gap: 24,
						}}
					>
						<div
							style={{
								width: 64,
								height: 64,
								background: 'rgba(239, 68, 68, 0.15)',
								borderRadius: '50%',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								margin: '0 auto',
							}}
						>
							<AlertTriangle size={32} style={{ color: '#dc2626' }} />
						</div>

						<div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
							<h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
								Something went wrong
							</h2>
							<p style={{ fontSize: 14, color: '#71717a', margin: 0 }}>
								{error.message || 'An unexpected error occurred. Please try again.'}
							</p>
							{error.digest && (
								<p style={{ fontSize: 12, color: '#a1a1aa', margin: 0 }}>
									Error ID: {error.digest}
								</p>
							)}
						</div>

						<div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
							<button
								type="button"
								onClick={() => reset()}
								style={{
									display: 'inline-flex',
									alignItems: 'center',
									gap: 8,
									padding: '10px 16px',
									borderRadius: 8,
									border: '1px solid #e4e4e7',
									background: '#fff',
									cursor: 'pointer',
									fontSize: 14,
									fontWeight: 500,
								}}
							>
								<RefreshCw size={16} />
								Try Again
							</button>
							<Link
								href="/"
								style={{
									display: 'inline-flex',
									alignItems: 'center',
									gap: 8,
									padding: '10px 16px',
									borderRadius: 8,
									background: '#2563eb',
									color: '#fff',
									textDecoration: 'none',
									fontSize: 14,
									fontWeight: 500,
								}}
							>
								<Home size={16} />
								Go Home
							</Link>
						</div>
					</div>
				</div>
			</body>
		</html>
	);
}
