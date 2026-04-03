'use client';

import { AlertTriangle, Loader2, TrendingDown, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { getAdaptationHistory, type PlanAdaptation } from '@/services/progressService';

interface StudyPlanAdaptationsProps {
	planId: string;
}

export function StudyPlanAdaptations({ planId }: StudyPlanAdaptationsProps) {
	const [adaptations, setAdaptations] = useState<PlanAdaptation[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function loadAdaptations() {
			if (!planId) return;
			try {
				const data = await getAdaptationHistory(planId);
				setAdaptations(data);
			} catch (error) {
				console.error('Failed to load adaptations:', error);
			} finally {
				setLoading(false);
			}
		}
		loadAdaptations();
	}, [planId]);

	if (loading) {
		return (
			<Card className="p-4">
				<div className="flex items-center justify-center py-4">
					<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
				</div>
			</Card>
		);
	}

	if (adaptations.length === 0) {
		return (
			<Card className="p-4">
				<div className="flex items-center gap-2 text-muted-foreground">
					<TrendingUp className="h-4 w-4" />
					<span className="text-sm">
						No adaptations yet. Complete quizzes to see recommendations.
					</span>
				</div>
			</Card>
		);
	}

	return (
		<Card className="p-4 space-y-3">
			<div className="flex items-center gap-2">
				<TrendingUp className="h-4 w-4 text-primary" />
				<h3 className="font-medium">Recent Adaptations</h3>
				<Badge variant="secondary">{adaptations.length}</Badge>
			</div>
			<div className="space-y-2">
				{adaptations.slice(0, 5).map((adaptation) => (
					<div
						key={`${adaptation.topic}-${adaptation.adaptedAt?.getTime()}`}
						className="flex items-center justify-between rounded-lg bg-muted/50 p-2 text-sm"
					>
						<div className="flex items-center gap-2">
							{adaptation.newPriority > adaptation.oldPriority ? (
								<TrendingUp className="h-4 w-4 text-destructive" />
							) : adaptation.newPriority < adaptation.oldPriority ? (
								<TrendingDown className="h-4 w-4 text-primary" />
							) : (
								<AlertTriangle className="h-4 w-4 text-muted-foreground" />
							)}
							<span className="font-medium">{adaptation.topic}</span>
						</div>
						<div className="flex items-center gap-2 text-muted-foreground">
							<span className="text-xs">
								{adaptation.oldPriority} → {adaptation.newPriority}
							</span>
						</div>
					</div>
				))}
			</div>
		</Card>
	);
}

interface WeakTopicsDisplayProps {
	weakTopics: string[];
}

export function WeakTopicsDisplay({ weakTopics }: WeakTopicsDisplayProps) {
	if (!weakTopics || weakTopics.length === 0) {
		return (
			<Card className="p-4">
				<div className="flex items-center gap-2 text-primary">
					<TrendingUp className="h-4 w-4" />
					<span className="text-sm font-medium">No weak topics! Keep practicing.</span>
				</div>
			</Card>
		);
	}

	return (
		<Card className="p-4 space-y-3">
			<div className="flex items-center gap-2">
				<AlertTriangle className="h-4 w-4 text-destructive" />
				<h3 className="font-medium">Focus Areas</h3>
			</div>
			<div className="flex flex-wrap gap-2">
				{weakTopics.map((topic, index) => (
					<Badge key={index} variant="destructive" className="text-xs">
						{topic}
					</Badge>
				))}
			</div>
		</Card>
	);
}
