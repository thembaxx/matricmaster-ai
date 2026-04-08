'use client';

import { useEffect, useState } from 'react';
import { DuelArena } from '@/components/Duel/DuelArena';
import { DuelLobby } from '@/components/Duel/DuelLobby';
import { DuelResults } from '@/components/Duel/DuelResults';
import { useDuelStore } from '@/stores/useDuelStore';

export default function DuelPage() {
	const { activeDuel, startDuel } = useDuelStore();
	const [stage, setStage] = useState<'lobby' | 'arena' | 'results'>('lobby');

	useEffect(() => {
		if (activeDuel?.status === 'completed') {
			setStage('results');
		} else if (activeDuel?.status === 'active') {
			setStage('arena');
		}
	}, [activeDuel]);

	return (
		<div className="min-h-screen bg-background">
			{stage === 'lobby' && <DuelLobby onStartDuel={startDuel} />}
			{stage === 'arena' && <DuelArena />}
			{stage === 'results' && <DuelResults />}
		</div>
	);
}
