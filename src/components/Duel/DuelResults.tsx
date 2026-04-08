'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useDuelStore } from '@/stores/useDuelStore';

export function DuelResults() {
	const router = useRouter();
	const { activeDuel } = useDuelStore();

	useEffect(() => {
		if (!activeDuel || activeDuel.status !== 'completed') {
			router.push('/duel');
		}
	}, [activeDuel, router]);

	if (!activeDuel || activeDuel.status !== 'completed') return null;

	const playerWon = activeDuel.playerScore > activeDuel.opponentScore;
	const isTie = activeDuel.playerScore === activeDuel.opponentScore;

	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4">
			<div className="bg-card rounded-2xl border border-border/30 p-8 shadow-lg text-center max-w-md">
				<div className="text-4xl mb-4">{isTie ? '🤝' : playerWon ? '🏆' : '💪'}</div>

				<h2 className="text-xl font-semibold mb-2">
					{isTie ? "it's a tie!" : playerWon ? 'you won!' : 'good try!'}
				</h2>

				<div className="flex justify-center gap-8 mb-6">
					<div className="text-center">
						<p className="text-sm text-muted-foreground">your score</p>
						<p className="text-2xl font-bold">{activeDuel.playerScore}</p>
					</div>
					<div className="text-center">
						<p className="text-sm text-muted-foreground">{activeDuel.opponentName}</p>
						<p className="text-2xl font-bold">{activeDuel.opponentScore}</p>
					</div>
				</div>

				<div className="flex gap-3">
					<Button variant="outline" onClick={() => router.push('/duel')} className="flex-1">
						new duel
					</Button>
					<Button onClick={() => router.push('/dashboard')} className="flex-1">
						dashboard
					</Button>
				</div>
			</div>
		</div>
	);
}
