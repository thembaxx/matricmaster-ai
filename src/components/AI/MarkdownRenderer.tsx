'use client';

import { Check, Copy } from 'lucide-react';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
	content: string;
	className?: string;
}

function CodeBlock({ children, className }: { children: React.ReactNode; className?: string }) {
	const [copied, setCopied] = useState(false);
	const match = /language-(\w+)/.exec(className || '');
	const language = match ? match[1] : '';
	const codeString = typeof children === 'string' ? children : String(children);

	const handleCopy = async () => {
		await navigator.clipboard.writeText(codeString.replace(/\n$/, ''));
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className="relative group my-4">
			<div className="flex items-center justify-between bg-zinc-800 dark:bg-zinc-900 rounded-t-lg px-4 py-2">
				<span className="text-xs text-zinc-400 font-mono">{language || 'code'}</span>
				<Button
					variant="ghost"
					size="sm"
					className="h-6 px-2 text-zinc-400 hover:text-zinc-100"
					onClick={handleCopy}
				>
					{copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
					<span className="ml-1 text-xs">{copied ? 'Copied!' : 'Copy'}</span>
				</Button>
			</div>
			<pre className="bg-zinc-900 dark:bg-zinc-950 rounded-b-lg p-4 overflow-x-auto">
				<code className={cn('text-sm', className)}>{children}</code>
			</pre>
		</div>
	);
}

function InlineCode({ children }: { children: React.ReactNode }) {
	return (
		<code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary">
			{children}
		</code>
	);
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
	useEffect(() => {
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css';
		link.integrity = 'sha384-n8MVd4RsNIU0tAv4ct0nTaAbDJwPJzDEaqSD1odI+WdtXRGWt2kTvGFasHpSy3SV';
		link.crossOrigin = 'anonymous';
		document.head.appendChild(link);

		return () => {
			document.head.removeChild(link);
		};
	}, []);

	return (
		<div className={cn('prose prose-sm dark:prose-invert max-w-none', className)}>
			<ReactMarkdown
				remarkPlugins={[remarkGfm, remarkMath]}
				rehypePlugins={[rehypeKatex]}
				components={{
					code: ({ className, children }) => {
						const isInline = !className;
						if (isInline) {
							return <InlineCode>{children}</InlineCode>;
						}
						return <CodeBlock className={className}>{children}</CodeBlock>;
					},
					pre: ({ children }) => <>{children}</>,
					h1: ({ children }) => (
						<h1 className="text-xl font-bold mt-6 mb-3 text-foreground">{children}</h1>
					),
					h2: ({ children }) => (
						<h2 className="text-lg font-bold mt-5 mb-2 text-foreground">{children}</h2>
					),
					h3: ({ children }) => (
						<h3 className="text-base font-semibold mt-4 mb-2 text-foreground">{children}</h3>
					),
					p: ({ children }) => <p className="mb-3 leading-relaxed">{children}</p>,
					ul: ({ children }) => <ul className="list-disc pl-6 mb-3 space-y-1">{children}</ul>,
					ol: ({ children }) => <ol className="list-decimal pl-6 mb-3 space-y-1">{children}</ol>,
					li: ({ children }) => <li className="text-sm">{children}</li>,
					blockquote: ({ children }) => (
						<blockquote className="border-l-4 border-primary/50 pl-4 italic text-muted-foreground my-3">
							{children}
						</blockquote>
					),
					a: ({ href, children }) => (
						<a
							href={href}
							target="_blank"
							rel="noopener noreferrer"
							className="text-primary hover:underline"
						>
							{children}
						</a>
					),
					table: ({ children }) => (
						<div className="overflow-x-auto my-4">
							<table className="min-w-full border-collapse border border-border">{children}</table>
						</div>
					),
					th: ({ children }) => (
						<th className="border border-border px-3 py-2 bg-muted font-semibold text-left">
							{children}
						</th>
					),
					td: ({ children }) => <td className="border border-border px-3 py-2">{children}</td>,
				}}
			>
				{content}
			</ReactMarkdown>
		</div>
	);
}

export default MarkdownRenderer;
