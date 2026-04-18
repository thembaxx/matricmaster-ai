'use client';

import { ArrowRight02Icon, SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { AnimatePresence, motion as m } from 'motion/react';
import { useState } from 'react';
import { ThinkingAnimation } from '@/components/AI/ThinkingAnimation';

export function DashboardAIPrompt() {
	const [isThinking, setIsThinking] = useState(false);
	const [value, setValue] = useState('');

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!value.trim()) return;
		setIsThinking(true);
		// Simulate thinking
		setTimeout(() => setIsThinking(false), 3000);
	};

	return (
		<div className="relative w-full max-w-2xl mx-auto">
			<AnimatePresence>
				{isThinking && <ThinkingAnimation className="absolute inset-0 z-0" />}
			</AnimatePresence>

			<form
				onSubmit={handleSubmit}
				className="relative z-10 flex items-center gap-4 p-2 pl-6 bg-card/50 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-elevation-3 focus-within:ring-2 focus-within:ring-primary/50 transition-all duration-500"
			>
				<HugeiconsIcon
					icon={SparklesIcon}
					className={`h-6 w-6 transition-colors duration-500 ${isThinking ? 'text-primary animate-pulse' : 'text-muted-foreground'}`}
				/>
				<input
					type="text"
					value={value}
					onChange={(e) => setValue(e.target.value)}
					placeholder="Ask anything about your studies..."
					aria-label="Ask a question"
					disabled={isThinking}
					className="flex-1 bg-transparent border-none outline-none text-lg font-medium placeholder:text-muted-foreground/50 disabled:opacity-50 disabled:cursor-not-allowed"
				/>
				<m.button
					whileTap={{ scale: 0.95 }}
					type="submit"
					disabled={isThinking || !value.trim()}
					aria-disabled={isThinking || !value.trim()}
					aria-label={isThinking ? 'Thinking...' : 'Submit question'}
					className={`h-12 w-12 flex items-center justify-center rounded-full shadow-lg transition-all ${
						isThinking || !value.trim()
							? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
							: 'bg-primary text-primary-foreground hover:shadow-primary/20'
					}`}
				>
					<HugeiconsIcon icon={ArrowRight02Icon} className="h-5 w-5" />
				</m.button>
			</form>

			<div className="mt-4 flex flex-wrap justify-center gap-2">
				{['Create a study plan', 'Explain Calculus', 'Practice Quiz'].map((suggestion) => (
					<button
						key={suggestion}
						type="button"
						onClick={() => setValue(suggestion)}
						className="px-4 py-2 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 text-xs font-bold  tracking-tight text-muted-foreground transition-all"
					>
						{suggestion}
					</button>
				))}
			</div>
		</div>
	);
}
