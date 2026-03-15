'use client';

import { CheckmarkCircle02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PERSONALITIES, type Personality } from '@/lib/study-buddy/personalities';
import { setBuddyPersonality } from '@/services/buddyActions';

interface PersonalitySelectorProps {
	currentPersonality?: Personality;
	onSelect?: (personality: Personality) => void;
	compact?: boolean;
}

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
			<div className="flex gap-2 flex-wrap">
				{(Object.keys(PERSONALITIES) as Personality[]).map((p) => (
					<Button
						key={p}
						variant={selected === p ? 'default' : 'outline'}
						size="sm"
						onClick={() => handleSelect(p)}
						disabled={loading}
						className="rounded-full text-xs"
					>
						{PERSONALITIES[p].name}
					</Button>
				))}
			</div>
		);
	}

	return (
		<Card className="p-6 rounded-2xl">
			<h3 className="text-lg font-bold mb-4">Choose Your Study Buddy Style</h3>
			<div className="grid gap-3">
				{(Object.keys(PERSONALITIES) as Personality[]).map((p) => (
					<button
						type="button"
						key={p}
						onClick={() => handleSelect(p)}
						disabled={loading}
						className={`p-4 rounded-xl border-2 text-left transition-all ${
							selected === p
								? 'border-primary bg-primary/10'
								: 'border-border hover:border-primary/50'
						}`}
					>
						<div className="flex items-center justify-between">
							<div>
								<div className="font-semibold">{PERSONALITIES[p].name}</div>
								<div className="text-sm text-muted-foreground">{PERSONALITIES[p].description}</div>
							</div>
							{selected === p && (
								<HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-5 h-5 text-primary" />
							)}
						</div>
					</button>
				))}
			</div>
		</Card>
	);
}
