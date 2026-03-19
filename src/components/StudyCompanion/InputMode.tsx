'use client';

import { m } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface InputModeProps {
	inputValue: string;
	onInputChange: (value: string) => void;
	onSubmit: () => void;
	onCancel: () => void;
	isLoading: boolean;
}

export function InputMode({
	inputValue,
	onInputChange,
	onSubmit,
	onCancel,
	isLoading,
}: InputModeProps) {
	return (
		<m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
			<Button variant="ghost" size="sm" onClick={onCancel} className="mb-2">
				← Back
			</Button>

			<Card className="p-4 rounded-2xl border border-border">
				<textarea
					value={inputValue}
					onChange={(e) => onInputChange(e.target.value)}
					placeholder="Tell me more about what you need..."
					className="w-full h-32 bg-transparent border-none resize-none focus:outline-none text-foreground placeholder:text-muted-foreground"
				/>
			</Card>

			<div className="flex gap-3">
				<Button variant="outline" size="lg" className="flex-1 rounded-2xl" onClick={onCancel}>
					Cancel
				</Button>
				<Button
					size="lg"
					className="flex-1 rounded-2xl"
					disabled={!inputValue.trim() || isLoading}
					onClick={onSubmit}
				>
					{isLoading ? 'Starting...' : 'Get help'}
				</Button>
			</div>
		</m.div>
	);
}
