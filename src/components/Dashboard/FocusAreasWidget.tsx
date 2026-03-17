'use client';

import { ArrowRight01Icon, CheckmarkCircle02Icon, Layers01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
	generateFlashcardsFromWeakTopics,
	getWeakTopicsForUser,
	type WeakTopic,
} from '@/lib/db/learning-loop-actions';

export function FocusAreasWidget() {
	const router = useRouter();
	const [weakTopics, setWeakTopics] = useState<WeakTopic[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isGenerating, setIsGenerating] = useState(false);
	const [generationResult, setGenerationResult] = useState<{
		success: boolean;
		cardsCreated: number;
	} | null>(null);

	useEffect(() => {
		async function loadWeakTopics() {
			try {
				const topics = await getWeakTopicsForUser();
				setWeakTopics(topics);
			} catch (error) {
				console.debug('Failed to load weak topics:', error);
			} finally {
				setIsLoading(false);
			}
		}
		loadWeakTopics();
	}, []);

	const handleGenerateAll = async () => {
		setIsGenerating(true);
		try {
			const result = await generateFlashcardsFromWeakTopics();
			setGenerationResult(result);
		} catch (error) {
			console.debug('Failed to generate flashcards:', error);
		} finally {
			setIsGenerating(false);
		}
	};

	if (isLoading) {
		return (
			<Card className="p-6 rounded-3xl bg-card border border-border/50">
				<div className="animate-pulse space-y-4">
					<div className="h-6 bg-muted rounded w-1/3" />
					<div className="space-y-2">
						<div className="h-4 bg-muted rounded w-full" />
						<div className="h-4 bg-muted rounded w-2/3" />
					</div>
				</div>
			</Card>
		);
	}

	if (weakTopics.length === 0) {
		return (
			<Card className="p-6 rounded-3xl bg-card border border-border/50">
				<div className="flex items-center justify-between mb-4">
					<h3 className="font-bold text-lg text-foreground">Focus Areas</h3>
					<HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-5 h-5 text-green-500" />
				</div>
				<div className="text-center py-8">
					<div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
						<HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-8 h-8 text-green-500" />
					</div>
					<p className="font-bold text-foreground">Great job!</p>
					<p className="text-sm text-muted-foreground">No weak topics identified</p>
				</div>
			</Card>
		);
	}

	return (
		<Card className="p-6 rounded-3xl bg-card border border-border/50">
			<div className="flex items-center justify-between mb-4">
				<h3 className="font-bold text-lg text-foreground">Focus Areas</h3>
				<Button
					variant="ghost"
					size="sm"
					onClick={() => router.push('/flashcards')}
					className="text-muted-foreground hover:text-foreground"
				>
					View All
					<HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4 ml-1" />
				</Button>
			</div>

			{generationResult && (
				<div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
					<p className="text-sm font-medium text-green-600">
						{generationResult.cardsCreated > 0
							? `${generationResult.cardsCreated} flashcards created!`
							: 'All topics already have flashcards'}
					</p>
				</div>
			)}

			<div className="space-y-3 mb-4">
				{weakTopics.slice(0, 5).map((topic) => (
					<m.div
						key={topic.topic}
						whileTap={{ scale: 0.98 }}
						className="flex items-center justify-between p-3 rounded-xl bg-muted/30 cursor-pointer transition-colors hover:bg-muted/50"
					>
						<div className="flex-1 min-w-0">
							<p className="font-medium text-foreground truncate">{topic.topic}</p>
							<p className="text-xs text-muted-foreground">
								{topic.masteryLevel.toFixed(0)}% mastery
							</p>
						</div>
						<Button
							variant="ghost"
							size="sm"
							onClick={handleGenerateAll}
							disabled={isGenerating}
							className="shrink-0 ml-2"
						>
							<HugeiconsIcon icon={Layers01Icon} className="w-4 h-4 text-primary-orange" />
						</Button>
					</m.div>
				))}
			</div>

			<m.button
				type="button"
				className="w-full rounded-xl font-bold h-10 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center"
				onClick={handleGenerateAll}
				disabled={isGenerating}
				whileTap={{ scale: 0.98 }}
			>
				{isGenerating ? (
					<>
						<div className="w-4 h-4 border-2 border-primary-orange border-t-transparent rounded-full animate-spin mr-2" />
						Generating...
					</>
				) : (
					<>
						<HugeiconsIcon icon={Layers01Icon} className="w-4 h-4 mr-2" />
						Generate All as Flashcards
					</>
				)}
			</m.button>
		</Card>
	);
}
