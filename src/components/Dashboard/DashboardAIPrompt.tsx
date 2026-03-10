'use client';

import { ArrowRight, Sparkle } from '@phosphor-icons/react';
import { AnimatePresence, m } from 'framer-motion';
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
				className="relative z-10 flex items-center gap-4 p-2 pl-6 bg-card/50 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-2xl focus-within:ring-2 focus-within:ring-primary/50 transition-all duration-500"
			>
				<Sparkle
					weight="fill"
					className={`h-6 w-6 transition-colors duration-500 ${isThinking ? 'text-primary animate-pulse' : 'text-muted-foreground'}`}
				/>
				<input
					type="text"
					value={value}
					onChange={(e) => setValue(e.target.value)}
					placeholder="Ask your AI Tutor anything..."
					className="flex-1 bg-transparent border-none outline-none text-lg font-medium placeholder:text-muted-foreground/50"
				/>
				<m.button
					whileTap={{ scale: 0.95 }}
					type="submit"
					className="h-12 w-12 flex items-center justify-center bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-primary/20 transition-all"
				>
					<ArrowRight weight="bold" className="h-5 w-5" />
				</m.button>
			</form>

			<div className="mt-4 flex flex-wrap justify-center gap-2">
				{['Create a study plan', 'Explain Calculus', 'Practice Quiz'].map((suggestion) => (
					<button
						key={suggestion}
						type="button"
						onClick={() => setValue(suggestion)}
						className="px-4 py-2 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 text-xs font-bold uppercase tracking-tight text-muted-foreground transition-all"
					>
						{suggestion}
					</button>
				))}
			</div>
		</div>
	);
}
