'use client';

import { FireIcon, StarIcon, TargetIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type SuggestionType = 'streak' | 'focus' | 'weak-topic' | 'flashcards' | 'quiz';

interface Suggestion {
	type: SuggestionType;
	title: string;
	description: string;
	action: string;
	priority: number;
}

interface SmartSuggestionsProps {
	streakDays?: number;
	focusMinutesToday?: number;
	weakAreas?: string[];
	accuracy?: number;
}

export function SmartSuggestions({
	streakDays = 0,
	focusMinutesToday = 0,
	weakAreas = [],
	accuracy = 0,
}: SmartSuggestionsProps) {
	const router = useRouter();

	const suggestions = useMemo<Suggestion[]>(() => {
		const result: Suggestion[] = [];

		if (streakDays > 0 && focusMinutesToday < 30) {
			result.push({
				type: 'streak',
				title: 'Keep your streak alive',
				description: `You've studied for ${focusMinutesToday} min today. A quick quiz would maintain your ${streakDays} day streak!`,
				action: 'Take a Quiz',
				priority: 1,
			});
		}

		if (weakAreas.length > 0) {
			result.push({
				type: 'weak-topic',
				title: `Focus on ${weakAreas[0]}`,
				description: "You've been struggling with this topic. A focused session could help.",
				action: 'Start Focus Session',
				priority: 2,
			});
		}

		if (focusMinutesToday === 0 && streakDays > 0) {
			result.push({
				type: 'focus',
				title: 'Start your daily focus',
				description: `Your streak is at ${streakDays} days. Don't break it!`,
				action: 'Begin Focus',
				priority: 3,
			});
		}

		if (accuracy > 0 && accuracy < 60) {
			result.push({
				type: 'quiz',
				title: 'Build your accuracy',
				description: 'Practice more to improve your score.',
				action: 'Start Practice',
				priority: 4,
			});
		}

		return result.sort((a, b) => a.priority - b.priority);
	}, [streakDays, focusMinutesToday, weakAreas, accuracy]);

	const getIcon = (type: SuggestionType) => {
		switch (type) {
			case 'streak':
				return FireIcon;
			case 'focus':
				return TargetIcon;
			case 'weak-topic':
			case 'quiz':
			case 'flashcards':
				return StarIcon;
		}
	};

	const handleSuggestionClick = (suggestion: Suggestion) => {
		switch (suggestion.type) {
			case 'streak':
			case 'quiz':
				router.push('/quiz');
				break;
			case 'focus':
			case 'weak-topic':
				router.push('/focus');
				break;
			case 'flashcards':
				router.push('/flashcards');
				break;
		}
	};

	if (suggestions.length === 0) return null;

	return (
		<Card className="p-4 rounded-2xl border-0 shadow-tiimo">
			<h3 className="font-display font-bold text-base text-foreground mb-3">Smart Suggestions</h3>
			<div className="space-y-3">
				{suggestions.slice(0, 2).map((suggestion) => (
					<Button
						key={suggestion.type}
						variant="outline"
						className="w-full justify-start h-auto py-3 px-4 rounded-xl border-border/50 hover:bg-secondary/50"
						onClick={() => handleSuggestionClick(suggestion)}
					>
						<div className="flex items-start gap-3">
							<div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
								<HugeiconsIcon icon={getIcon(suggestion.type)} className="w-4 h-4 text-primary" />
							</div>
							<div className="text-left">
								<p className="font-medium text-sm text-foreground">{suggestion.title}</p>
								<p className="text-xs text-muted-foreground mt-0.5">{suggestion.description}</p>
							</div>
						</div>
					</Button>
				))}
			</div>
		</Card>
	);
}
