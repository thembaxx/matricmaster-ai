'use client';

import { SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Send, X } from 'lucide-react';
import { AnimatePresence, motion as m } from 'motion/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useAiContextStore } from '@/stores/useAiContextStore';

const CONTEXT_PROMPTS: Record<string, string[]> = {
	quiz: ['Explain this question', 'Give me a hint', 'Similar question'],
	pastPaper: ['Explain this answer', 'Find more like this', 'Mark my answer'],
	snapAndSolve: ['Show me the steps', 'More practice problems', 'Create a flashcard'],
	lesson: ['Summarize this', 'Quiz me', 'Add to study plan'],
	curriculumMap: ['What topics are next?', 'Find practice for this', 'Show related concepts'],
	idle: ['Help me study', 'Quiz me', 'Explain a concept'],
};

export function GlassOrb() {
	const [isOpen, setIsOpen] = useState(false);
	const [isVisible, setIsVisible] = useState(false);
	const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>(CONTEXT_PROMPTS.idle);

	const pathname = usePathname();
	const router = useRouter();
	const context = useAiContextStore((s) => s.context);

	const hideOnPages = ['/study-companion', '/onboarding', '/login', '/register'];
	const shouldHide = hideOnPages.some((path) => pathname?.startsWith(path));

	useEffect(() => {
		const prompts = CONTEXT_PROMPTS[context.type] || CONTEXT_PROMPTS.idle;
		setSuggestedPrompts(prompts);
	}, [context.type]);

	const getContextGreeting = () => {
		switch (context.type) {
			case 'quiz':
				return `Need help with ${context.topic || 'this question'}?`;
			case 'pastPaper':
				return `Working on ${context.subject || 'past paper'}`;
			case 'snapAndSolve':
				return `Solving ${context.subject || 'math problem'}`;
			case 'lesson':
				return `Learning about ${context.topic || context.subject || 'this'}`;
			case 'curriculumMap':
				return `Exploring ${context.subject || 'curriculum'}`;
			default:
				return 'Hi! How can I help you study?';
		}
	};

	useEffect(() => {
		const timer = setTimeout(() => setIsVisible(true), 1000);
		return () => clearTimeout(timer);
	}, []);

	if (shouldHide || !isVisible) return null;

	return (
		<>
			<AnimatePresence>
				{isOpen && (
					<m.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={() => setIsOpen(false)}
						className="fixed inset-0 z-40 bg-background/40 backdrop-blur-sm"
					/>
				)}
			</AnimatePresence>

			<div className="fixed bottom-40 right-4 md:bottom-8 md:right-8 z-50 flex flex-col items-end">
				<AnimatePresence>
					{isOpen && (
						<m.div
							initial={{ opacity: 0, y: 20, scale: 0.9, transformOrigin: 'bottom right' }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: 20, scale: 0.9 }}
							transition={{ type: 'spring', damping: 25, stiffness: 300 }}
							className={cn(
								'mb-4 w-full sm:max-w-sm md:w-80 shadow-soft-lg rounded-3xl overflow-hidden border flex flex-col',
								'bg-background/80 backdrop-blur-xl border-border/50 text-foreground'
							)}
						>
							{context.type !== 'idle' && (
								<div className="px-4 py-2 bg-primary/5 dark:bg-primary/10 border-b border-border/50 dark:border-border/50">
									<p className="text-xs text-foreground flex items-center gap-1">
										<span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
										{getContextGreeting()}
									</p>
								</div>
							)}

							<div className="p-4 border-b border-border/50 bg-secondary/50 flex justify-between items-center">
								<div className="flex items-center gap-2">
									<div className="w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
										<HugeiconsIcon icon={SparklesIcon} className="w-4 h-4 text-primary" />
									</div>
									<h3 className="font-bold text-sm font-display">AI Companion</h3>
								</div>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									onClick={() => setIsOpen(false)}
									aria-label="Close AI companion"
									className="p-2 -mr-2 text-tiimo-gray-muted hover:text-foreground"
								>
									<X className="w-5 h-5" />
								</Button>
							</div>

							<div className="px-4 py-2 border-b border-border/30 flex gap-2 overflow-x-auto">
								{suggestedPrompts.map((prompt) => (
									<Button
										key={prompt}
										type="button"
										variant="ghost"
										onClick={() => {
											setIsOpen(false);
											router.push(`/study-companion?prompt=${encodeURIComponent(prompt)}`);
										}}
										className="whitespace-nowrap px-3 py-1 h-auto text-xs bg-secondary hover:bg-secondary/80 rounded-full"
									>
										{prompt}
									</Button>
								))}
							</div>

							<div className="p-4 flex-1 min-h-[200px] flex flex-col bg-gradient-to-b from-transparent to-secondary/20">
								<div className="flex-1 space-y-4">
									<div className="bg-card border border-border/50 rounded-2xl p-3 shadow-sm inline-block max-w-[90%]">
										<p className="text-sm">{getContextGreeting()}</p>
									</div>
								</div>
							</div>

							<div className="p-3 border-t border-border/50 bg-card">
								<div className="relative">
									<Input
										type="text"
										readOnly
										placeholder="Ask anything..."
										onClick={() => {
											setIsOpen(false);
											router.push('/study-companion');
										}}
										className="w-full bg-secondary/50 border border-border/50 focus:border-primary rounded-full py-2.5 pl-4 pr-10 text-sm outline-none transition-all cursor-pointer"
									/>
									<Button
										type="button"
										size="icon"
										aria-label="Open study companion"
										className="absolute right-1 top-1 w-8 h-8 rounded-full bg-primary text-primary-foreground shadow-soft-md hover:bg-primary/90"
										onClick={() => {
											setIsOpen(false);
											router.push('/study-companion');
										}}
									>
										<Send className="w-4 h-4" />
									</Button>
								</div>
							</div>
						</m.div>
					)}
				</AnimatePresence>

				<m.button
					onClick={() => setIsOpen(!isOpen)}
					aria-label={isOpen ? 'Close AI companion' : 'Open AI companion'}
					initial={{ scale: 0.95, opacity: 0 }}
					animate={{ scale: 1 }}
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					className={cn(
						'relative group flex items-center justify-center w-14 h-14 rounded-full shadow-soft-lg transition-all duration-300',
						'bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-white/40 dark:border-white/10',
						isOpen ? 'rotate-90 scale-90' : 'rotate-0'
					)}
				>
					<div className="absolute inset-0 rounded-full bg-primary/10 dark:bg-primary/20" />
					<div className="absolute inset-[1px] rounded-full bg-background/90 backdrop-blur-md" />

					{isOpen ? (
						<X className="w-6 h-6 relative z-10 transition-colors duration-300 text-foreground" />
					) : (
						<HugeiconsIcon
							icon={SparklesIcon}
							className="w-6 h-6 relative z-10 transition-colors duration-300 text-primary"
						/>
					)}

					{!isOpen && (
						<m.div
							animate={{
								scale: [1, 1.2, 1],
								opacity: [0.5, 0.8, 0.5],
							}}
							transition={{
								duration: 2,
								repeat: Number.POSITIVE_INFINITY,
								ease: 'easeInOut',
							}}
							className="absolute inset-0 rounded-full bg-primary/5"
						/>
					)}
				</m.button>
			</div>
		</>
	);
}
