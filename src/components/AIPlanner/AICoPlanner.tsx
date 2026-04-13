'use client';

import { m } from 'framer-motion';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ROUTINE_TEMPLATES, type Routine, SUBJECTS } from '@/types/schedule';

const QUICK_PROMPTS = [
	'Plan my study session',
	'I need help starting',
	"What's next on my schedule?",
	'Make my plan for tomorrow',
];

interface AICoPlannerProps {
	onGeneratePlan?: (plan: Routine) => void;
}

export function AICoPlanner({ onGeneratePlan }: AICoPlannerProps) {
	const [input, setInput] = useState('');
	const [isGenerating, setIsGenerating] = useState(false);
	const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.trim()) return;

		setIsGenerating(true);
		await new Promise((resolve) => setTimeout(resolve, 1500));

		const routine = ROUTINE_TEMPLATES[Math.floor(Math.random() * ROUTINE_TEMPLATES.length)];
		setSelectedRoutine(routine);
		onGeneratePlan?.(routine);
		setIsGenerating(false);
		setInput('');
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-background to-background/80 pb-40">
			<div className="p-4 pt-8">
				<header className="mb-6">
					<h1 className="text-2xl font-bold text-foreground mb-2">Study Planner</h1>
					<p className="text-muted-foreground">
						Tell us what you need to study and we'll create a plan
					</p>
				</header>

				<form onSubmit={handleSubmit} className="mb-8">
					<div className="relative">
						<input
							type="text"
							value={input}
							onChange={(e) => setInput(e.target.value)}
							placeholder="e.g., I have a Math exam in 2 weeks..."
							className="w-full p-4 pr-12 rounded-2xl bg-card border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
						/>
						<button
							type="submit"
							disabled={!input.trim() || isGenerating}
							className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-primary text-white disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isGenerating ? (
								<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
							) : (
								<svg
									className="w-5 h-5"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									aria-label="Send message"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
									/>
								</svg>
							)}
						</button>
					</div>
				</form>

				<div className="mb-8">
					<h2 className="text-sm font-medium text-muted-foreground mb-4">Quick Prompts</h2>
					<div className="flex flex-wrap gap-2">
						{QUICK_PROMPTS.map((prompt) => (
							<button
								type="button"
								key={prompt}
								onClick={() => setInput(prompt)}
								className="px-4 py-2 rounded-full bg-card border border-border hover:border-primary/50 text-sm transition-colors"
							>
								{prompt}
							</button>
						))}
					</div>
				</div>

				{selectedRoutine && (
					<m.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="bg-card/80 backdrop-blur-sm rounded-3xl p-6 border border-border/50"
					>
						<h2 className="text-lg font-semibold mb-4">Your Study Plan</h2>
						<div className="space-y-3">
							{selectedRoutine.blocks.map((block, index) => {
								const subject = block.subject ? SUBJECTS[block.subject] : null;
								return (
									<div
										key={block.id}
										className="flex items-center gap-4 p-4 rounded-xl bg-muted/30"
									>
										<div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-medium">
											{index + 1}
										</div>
										<div className="flex-1">
											<h3 className="font-medium">{block.title}</h3>
											<p className="text-sm text-muted-foreground">
												{block.duration} min • {block.type}
											</p>
										</div>
										{subject && <span className="text-2xl">{subject.emoji}</span>}
									</div>
								);
							})}
						</div>
						<button
							type="button"
							className="w-full mt-4 py-3 rounded-xl bg-primary text-white font-medium"
						>
							Add to Schedule
						</button>
					</m.div>
				)}

				<div className="mt-8">
					<h2 className="text-sm font-medium text-muted-foreground mb-4">Popular Templates</h2>
					<div className="grid grid-cols-2 gap-3">
						{ROUTINE_TEMPLATES.map((routine) => (
							<button
								type="button"
								key={routine.id}
								onClick={() => setSelectedRoutine(routine)}
								className={cn(
									'p-4 rounded-2xl text-left transition-all',
									'bg-card border border-border hover:border-primary/50',
									selectedRoutine?.id === routine.id && 'border-primary ring-2 ring-primary/20'
								)}
							>
								<h3 className="font-medium mb-1">{routine.name}</h3>
								<p className="text-sm text-muted-foreground">
									{routine.blocks.length} blocks •{' '}
									{routine.blocks.reduce((acc, b) => acc + b.duration, 0)} min
								</p>
							</button>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
