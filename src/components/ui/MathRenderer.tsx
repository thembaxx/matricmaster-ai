'use client';

import { Component, type ReactNode } from 'react';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { type MathRenderMode, renderMathBlock, renderMathInline } from '@/lib/mathRenderer';

interface MathRendererProps {
	latex: string;
	displayMode?: boolean;
	className?: string;
	onRenderModeChange?: (mode: MathRenderMode) => void;
	fallbackMode?: MathRenderMode;
}

interface MathRendererState {
	error: Error | null;
	fallbackContent: string | null;
	showRaw: boolean;
}

function MathFallback({ latex }: { latex: string }) {
	const plain = latex
		.replace(/\$|\\|{|}/g, '')
		.replace(/_([^{])/g, '$1')
		.replace(/\^([^{])/g, ' to the power $1');

	return <code className="bg-muted px-2 py-1 rounded text-sm font-mono">{plain || latex}</code>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function MathErrorFallback({ error: _error, resetErrorBoundary }: FallbackProps) {
	return (
		<div className="inline-flex items-center gap-2 text-destructive">
			<span className="text-xs">math error</span>
			<button
				type="button"
				onClick={resetErrorBoundary}
				className="text-xs underline hover:no-underline"
			>
				retry
			</button>
		</div>
	);
}

class MathRendererInternal extends Component<MathRendererProps, MathRendererState> {
	constructor(props: MathRendererProps) {
		super(props);
		this.state = { error: null, fallbackContent: null, showRaw: false };
	}

	static getDerivedStateFromError(error: Error): Partial<MathRendererState> {
		return { error };
	}

	componentDidUpdate(prevProps: MathRendererProps) {
		if (prevProps.latex !== this.props.latex && this.state.error) {
			this.setState({ error: null, fallbackContent: null });
		}
	}

	render() {
		const { latex, displayMode = false, className = '' } = this.props;
		const { error, showRaw } = this.state;

		if (showRaw) {
			return (
				<code className={`bg-muted px-2 py-1 rounded font-mono text-sm ${className}`}>{latex}</code>
			);
		}

		if (error) {
			return <MathFallback latex={latex} />;
		}

		try {
			const html = displayMode ? renderMathBlock(latex) : renderMathInline(latex);

			return (
				<span
					className={`math-renderer ${displayMode ? 'block' : 'inline'} ${className}`}
					dangerouslySetInnerHTML={{ __html: html }}
				/>
			);
		} catch {
			return <MathFallback latex={latex} />;
		}
	}
}

export function MathRenderer(props: MathRendererProps) {
	return (
		<ErrorBoundary fallbackRender={MathErrorFallback}>
			<MathRendererInternal {...props} />
		</ErrorBoundary>
	);
}

interface MathBlockProps {
	latex: string;
	className?: string;
	showToggle?: boolean;
}

export function MathBlock({ latex, className = '', showToggle = true }: MathBlockProps) {
	const [showRaw, setShowRaw] = [false, (_v: boolean) => {}];

	return (
		<div className={`math-block ${className}`}>
			<div
				className="overflow-x-auto py-4 px-6 bg-muted/50 rounded-xl"
				dangerouslySetInnerHTML={{
					__html: renderMathBlock(latex),
				}}
			/>
			{showToggle && (
				<button
					type="button"
					onClick={() => setShowRaw(!showRaw)}
					className="text-[10px] text-muted-foreground hover:text-foreground transition-colors mt-2"
				>
					{showRaw ? 'hide raw latex' : 'show raw latex'}
				</button>
			)}
		</div>
	);
}

interface MathDisplayProps {
	children: ReactNode;
	className?: string;
}

export function MathDisplay({ children, className = '' }: MathDisplayProps) {
	const renderMath = (text: string) => {
		const lines = text.split('\n');
		return lines.map((line, i) => (
			<div key={i} className={i > 0 ? 'mt-2' : ''}>
				{line.includes('$') || line.includes('\\') ? <MathRenderer latex={line} /> : line}
			</div>
		));
	};

	if (typeof children === 'string') {
		return <div className={className}>{renderMath(children)}</div>;
	}

	return <div className={className}>{children}</div>;
}
