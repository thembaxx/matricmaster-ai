'use client';

import { Check, Copy } from '@phosphor-icons/react';
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
		<div className="relative group my-6 overflow-hidden rounded-2xl border border-border/50 shadow-sm transition-all hover:shadow-md">
			<div className="flex items-center justify-between bg-muted px-4 py-2.5">
				<div className="flex items-center gap-2">
					<div className="flex gap-1">
						<div className="w-2 h-2 rounded-full bg-red-400/50" />
						<div className="w-2 h-2 rounded-full bg-amber-400/50" />
						<div className="w-2 h-2 rounded-full bg-green-400/50" />
					</div>
					<span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 font-mono ml-2">
						{language || 'code'}
					</span>
				</div>
				<Button
					variant="ghost"
					size="sm"
					className="h-7 px-3 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl transition-all duration-200"
					onClick={handleCopy}
				>
					{copied ? (
						<Check className="h-3.5 w-3.5 text-green-500" />
					) : (
						<Copy className="h-3.5 w-3.5" />
					)}
					<span className="ml-2 text-[10px] font-black uppercase tracking-widest">
						{copied ? 'Copied!' : 'Copy'}
					</span>
				</Button>
			</div>
			<pre className="bg-zinc-950 p-5 overflow-x-auto">
				<code className={cn('text-[13px] leading-relaxed font-mono text-zinc-300', className)}>
					{children}
				</code>
			</pre>
		</div>
	);
}

function InlineCode({ children }: { children: React.ReactNode }) {
	return (
		<code className="bg-primary/5 text-primary px-1.5 py-0.5 rounded-lg text-xs font-black font-mono border border-primary/10">
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
					p: ({ children }) => (
						<p className="mb-4 leading-relaxed text-sm md:text-base font-medium opacity-90">
							{children}
						</p>
					),
					ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>,
					ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>,
					li: ({ children }) => (
						<li className="text-sm md:text-[15px] font-medium opacity-90">{children}</li>
					),
					blockquote: ({ children }) => (
						<blockquote className="border-l-4 border-primary/30 pl-6 italic text-muted-foreground/80 my-6 py-1 bg-primary/5 rounded-r-2xl">
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
