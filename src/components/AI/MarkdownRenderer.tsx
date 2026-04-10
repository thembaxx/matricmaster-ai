'use client';

import { CopyIcon, Tick01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { Button } from '@/components/ui/button';
import { InteractiveDiagram } from '@/components/ui/InteractiveDiagram';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
	content: string;
	className?: string;
	subject?: string;
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
					<span className="text-[10px] font-black  tracking-widest text-muted-foreground/70 font-mono ml-2">
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
						<HugeiconsIcon icon={Tick01Icon} className="h-3.5 w-3.5 text-green-500" />
					) : (
						<HugeiconsIcon icon={CopyIcon} className="h-3.5 w-3.5" />
					)}
					<span className="ml-2 text-[10px] font-black  tracking-widest">
						{copied ? 'Copied!' : 'Copy'}
					</span>
				</Button>
			</div>
			<pre className="bg-zinc-950 p-5 overflow-x-auto">
				<code
					className={cn('text-[13px] leading-relaxed font-mono text-muted-foreground', className)}
				>
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

export function MarkdownRenderer({ content, className, subject }: MarkdownRendererProps) {
	useEffect(() => {
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css';
		link.integrity = 'sha384-n8MVd4RsNIU0tAv4ct0nTaAbDJwPJzDEaqSD1odI+WdtXRGWt2kTvGFasHpSy3SV';
		link.crossOrigin = 'anonymous';
		document.head.appendChild(link);

		return () => {
			if (document.head.contains(link)) {
				document.head.removeChild(link);
			}
		};
	}, []);

	// Helper to determine subject-specific formula class
	const getFormulaClass = () => {
		if (!subject) return 'formula-math';
		const s = subject.toLowerCase();
		if (s.includes('phys')) return 'formula-physics';
		if (s.includes('chem')) return 'formula-chemistry';
		if (s.includes('acc') || s.includes('bus') || s.includes('econ')) return 'formula-accounting';
		return 'formula-math';
	};

	// Helper to determine if literature font should be used
	const isLiterature = () => {
		if (!subject) return false;
		const s = subject.toLowerCase();
		return (
			s.includes('lit') ||
			s.includes('poem') ||
			s.includes('book') ||
			s.includes('english') ||
			s.includes('afrikaans') ||
			s.includes('xhosa') ||
			s.includes('zulu') ||
			s.includes('setwork')
		);
	};

	// Split content by diagram shortcodes: [DIAGRAM:type] and video shortcodes: [VIDEO:id]
	const parts = content.split(/(\[DIAGRAM:\w+(?:-\w+)*\]|\[VIDEO:[\w-]+\])/g);

	return (
		<div
			className={cn(
				'prose prose-sm dark:prose-invert max-w-none',
				isLiterature() && 'font-literature',
				className
			)}
		>
			{parts.map((part, index) => {
				const diagramMatch = part.match(/\[DIAGRAM:(\w+(?:-\w+)*)\]/);
				if (diagramMatch) {
					const type = diagramMatch[1] as any;
					return (
						<div key={`markdown-render-diagram-${part}-${index}`} className="my-8 not-prose">
							<InteractiveDiagram type={type} />
						</div>
					);
				}

				const videoMatch = part.match(/\[VIDEO:([\w-]+)\]/);
				if (videoMatch) {
					const videoId = videoMatch[1];
					return (
						<div
							key={`markdown-render-video-${part}-${index}`}
							className="my-8 not-prose aspect-video rounded-3xl overflow-hidden border border-border/50 shadow-tiimo"
						>
							<iframe
								width="100%"
								height="100%"
								src={`https://www.youtube.com/embed/${videoId}`}
								title="YouTube video player"
								frameBorder="0"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
								allowFullScreen
							/>
						</div>
					);
				}

				return (
					<ReactMarkdown
						key={`markdown-render-content-${part.slice(0, 20)}-${index}`}
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
								<h1 className="text-xl font-heading mt-6 mb-3 text-foreground">{children}</h1>
							),
							h2: ({ children }) => (
								<h2 className="text-lg font-heading mt-5 mb-2 text-foreground">{children}</h2>
							),
							h3: ({ children }) => (
								<h3 className="text-base font-semibold mt-4 mb-2 text-foreground">{children}</h3>
							),
							p: ({ children }) => {
								const childrenArray = Array.isArray(children) ? children : [children];
								const text = childrenArray
									.map((c) => (typeof c === 'string' ? c : ''))
									.join('');
								const isFormula =
									text.toLowerCase().includes('formula:') ||
									(text.length < 100 &&
										(text.includes('=') || text.includes('≈')) &&
										!text.includes('.') && // Avoid sentences with periods
										text.trim().split(' ').length < 15);
								return (
									<p
										className={cn(
											'mb-4 leading-relaxed text-sm md:text-base font-medium opacity-90',
											isFormula && getFormulaClass()
										)}
									>
										{children}
									</p>
								);
							},
							ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>,
							ol: ({ children }) => (
								<ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>
							),
							li: ({ children }) => {
								const childrenArray = Array.isArray(children) ? children : [children];
								const text = childrenArray
									.map((c) => (typeof c === 'string' ? c : ''))
									.join('');
								const isFormula =
									text.toLowerCase().includes('formula:') ||
									(text.length < 100 &&
										(text.includes('=') || text.includes('≈')) &&
										!text.includes('.') &&
										text.trim().split(' ').length < 15);
								return (
									<li
										className={cn(
											'text-sm md:text-[15px] font-medium opacity-90',
											isFormula && getFormulaClass()
										)}
									>
										{children}
									</li>
								);
							},
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
									<table className="min-w-full border-collapse border border-border">
										{children}
									</table>
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
						{part}
					</ReactMarkdown>
				);
			})}
		</div>
	);
}
