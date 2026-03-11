'use client';

import { Loading03Icon as CircleNotch, Sent01Icon as PaperPlaneRight, SparklesIcon as Sparkle } from 'hugeicons-react';
import { AnimatePresence, m } from 'framer-motion';
import type React from 'react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface TutorPromptProps {
	onSend: (message: string) => void;
	isLoading?: boolean;
	placeholder?: string;
	className?: string;
}

export function TutorPrompt({
	onSend,
	isLoading = false,
	placeholder = 'Ask anything...',
	className,
}: TutorPromptProps) {
	const [input, setInput] = useState('');
	const inputRef = useRef<HTMLInputElement>(null);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (input.trim() && !isLoading) {
			onSend(input);
			setInput('');
		}
	};

	return (
		<div className={cn('w-full space-y-4', className)}>
			<form onSubmit={handleSubmit} className="relative group flex items-center gap-2">
				<div className="relative flex-1">
					<div className="absolute left-4 top-1/2 -translate-y-1/2">
						<Sparkle
							weight="bold"
							className={cn(
								'h-5 w-5 transition-colors duration-300',
								input.trim() ? 'text-primary' : 'text-muted-foreground/50'
							)}
						/>
					</div>
					<Input
						ref={inputRef}
						value={input}
						onChange={(e) => setInput(e.target.value)}
						placeholder={placeholder}
						className="pl-12 pr-4 h-14 bg-surface-elevated/50 backdrop-blur-xl border-border/50 rounded-2xl shadow-sm transition-all focus:shadow-md focus:bg-surface-elevated"
						disabled={isLoading}
						aria-label="Ask a question"
					/>
				</div>
				<AnimatePresence>
					{(input.trim() || isLoading) && (
						<m.div
							initial={{ opacity: 0, scale: 0.8, x: 10 }}
							animate={{ opacity: 1, scale: 1, x: 0 }}
							exit={{ opacity: 0, scale: 0.8, x: 10 }}
						>
							<Button
								type="submit"
								size="icon"
								disabled={isLoading || !input.trim()}
								className={cn(
									'h-14 w-14 rounded-2xl shadow-lg transition-all active:scale-95',
									isLoading ? 'bg-muted' : 'bg-primary hover:bg-primary/90'
								)}
								aria-label="Send message"
							>
								{isLoading ? (
									<CircleNotch className="h-6 w-6 animate-spin" />
								) : (
									<PaperPlaneRight className="h-6 w-6" />
								)}
							</Button>
						</m.div>
					)}
				</AnimatePresence>
			</form>
		</div>
	);
}
