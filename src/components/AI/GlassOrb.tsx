'use client';

import { SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { AnimatePresence, m } from 'framer-motion';
import { Send, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export function GlassOrb() {
	const [isOpen, setIsOpen] = useState(false);
	const [isVisible, setIsVisible] = useState(false);
	const pathname = usePathname();
	const router = useRouter();

	// Hide on pages that already have intense AI focus to avoid clutter
	const hideOnPages = ['/study-companion', '/onboarding', '/sign-in', '/sign-up'];
	const shouldHide = hideOnPages.some((path) => pathname?.startsWith(path));

	useEffect(() => {
		// Delay visibility slightly to allow page load animations
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

			<div className="fixed bottom-32 right-4 md:bottom-8 md:right-8 z-50 flex flex-col items-end">
				<AnimatePresence>
					{isOpen && (
						<m.div
							initial={{ opacity: 0, y: 20, scale: 0.9, transformOrigin: 'bottom right' }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: 20, scale: 0.9 }}
							transition={{ type: 'spring', damping: 25, stiffness: 300 }}
							className={cn(
								'mb-4 w-[calc(100vw-2rem)] md:w-80 shadow-2xl rounded-3xl overflow-hidden border flex flex-col',
								'bg-background/80 backdrop-blur-xl border-border/50 text-foreground'
							)}
						>
							<div className="p-4 border-b border-border/50 bg-secondary/50 flex justify-between items-center">
								<div className="flex items-center gap-2">
									<div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
										<HugeiconsIcon
											icon={SparklesIcon}
											className="w-4 h-4 text-violet-600 dark:text-violet-400"
										/>
									</div>
									<h3 className="font-lexend font-bold text-sm">AI Companion</h3>
								</div>
								<button
									type="button"
									onClick={() => setIsOpen(false)}
									className="p-2 -mr-2 text-tiimo-gray-muted hover:text-foreground transition-colors"
								>
									<X className="w-5 h-5" />
								</button>
							</div>

							<div className="p-4 flex-1 min-h-[200px] flex flex-col bg-gradient-to-b from-transparent to-secondary/20">
								<div className="flex-1 space-y-4">
									<div className="bg-card border border-border/50 rounded-2xl p-3 shadow-sm inline-block max-w-[90%]">
										<p className="text-sm">Hi! How can I help you today?</p>
									</div>
								</div>
							</div>

							<div className="p-3 border-t border-border/50 bg-card">
								<div className="relative">
									<input
										type="text"
										readOnly
										placeholder="Go to full AI Tutor..."
										onClick={() => {
											setIsOpen(false);
											router.push('/study-companion');
										}}
										className="w-full bg-secondary/50 border border-border/50 focus:border-violet-500 rounded-full py-2.5 pl-4 pr-10 text-sm outline-none transition-all cursor-pointer"
									/>
									<button
										type="button"
										className="absolute right-1 top-1 w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center shadow-md hover:bg-violet-700 transition"
										onClick={() => {
											setIsOpen(false);
											router.push('/study-companion');
										}}
									>
										<Send className="w-4 h-4" />
									</button>
								</div>
							</div>
						</m.div>
					)}
				</AnimatePresence>

				<m.button
					onClick={() => setIsOpen(!isOpen)}
					initial={{ scale: 0 }}
					animate={{ scale: 1 }}
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					className={cn(
						'relative group flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-300',
						'bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-white/40 dark:border-white/10',
						isOpen ? 'rotate-90 scale-90' : 'rotate-0'
					)}
				>
					{/* Animated gradient border/glow */}
					<div className="absolute inset-0 rounded-full bg-gradient-to-tr from-violet-500 via-fuchsia-500 to-cyan-500 opacity-20 group-hover:opacity-40 blur-md transition-opacity duration-500" />
					<div className="absolute inset-[1px] rounded-full bg-background/90 backdrop-blur-md" />

					{isOpen ? (
						<X className="w-6 h-6 relative z-10 transition-colors duration-300 text-foreground" />
					) : (
						<HugeiconsIcon
							icon={SparklesIcon}
							className="w-6 h-6 relative z-10 transition-colors duration-300 text-violet-600 dark:text-violet-400"
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
							className="absolute inset-0 rounded-full bg-violet-500/10"
						/>
					)}
				</m.button>
			</div>
		</>
	);
}
