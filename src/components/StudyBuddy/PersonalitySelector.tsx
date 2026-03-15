'use client';

import { CheckmarkCircle02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PERSONALITIES, type Personality } from '@/lib/study-buddy/personalities';
import { setBuddyPersonality } from '@/services/buddyActions';

interface PersonalitySelectorProps {
	currentPersonality?: Personality;
	onSelect?: (personality: Personality) => void;
	compact?: boolean;
}

const personalityColors: Record<Personality, string> = {
	mentor: 'from-blue-500 to-indigo-500',
	tutor: 'from-emerald-500 to-teal-500',
	friend: 'from-pink-500 to-rose-500',
};

export function PersonalitySelector({
	currentPersonality,
	onSelect,
	compact,
}: PersonalitySelectorProps) {
	const [selected, setSelected] = useState<Personality | null>(currentPersonality || null);
	const [loading, setLoading] = useState(false);

	const handleSelect = async (personality: Personality) => {
		setSelected(personality);
		setLoading(true);
		try {
			await setBuddyPersonality(personality);
			onSelect?.(personality);
		} catch (error) {
			console.error('Failed to set personality:', error);
		} finally {
			setLoading(false);
		}
	};

	if (compact) {
		return (
			<div className="flex flex-wrap gap-2">
				{(Object.keys(PERSONALITIES) as Personality[]).map((p) => (
					<Button
						key={p}
						variant={selected === p ? 'default' : 'outline'}
						size="sm"
						onClick={() => handleSelect(p)}
						disabled={loading}
						className={`rounded-full text-xs h-8 px-3 transition-all duration-200 ${
							selected === p ? `bg-gradient-to-r ${personalityColors[p]}` : ''
						}`}
					>
						{PERSONALITIES[p].name}
					</Button>
				))}
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div>
				<h3 className="font-display font-bold text-lg text-foreground">Choose Your Style</h3>
				<p className="text-sm text-muted-foreground mt-1">How should your buddy help you learn?</p>
			</div>
			<div className="grid gap-3">
				{(Object.keys(PERSONALITIES) as Personality[]).map((p) => (
					<button
						type="button"
						key={p}
						onClick={() => handleSelect(p)}
						disabled={loading}
						className={`relative p-4 rounded-2xl border-2 text-left transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] ${
							selected === p
								? 'border-primary/50 bg-primary/5 shadow-tiimo'
								: 'border-border/50 hover:border-primary/30 hover:bg-secondary/50'
						}`}
					>
						{selected === p && (
							<div
								className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${personalityColors[p]} opacity-5`}
							/>
						)}
						<div className="relative flex items-center justify-between">
							<div className="flex-1">
								<div className="font-semibold text-foreground">{PERSONALITIES[p].name}</div>
								<div className="text-sm text-muted-foreground mt-0.5">
									{PERSONALITIES[p].description}
								</div>
							</div>
							{selected === p && (
								<div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center ml-3">
									<HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-4 h-4 text-white" />
								</div>
							)}
						</div>
					</button>
				))}
			</div>
		</div>
	);
}
