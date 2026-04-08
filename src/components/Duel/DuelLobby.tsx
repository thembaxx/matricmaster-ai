'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDuelStore } from '@/stores/useDuelStore';

const SUBJECTS = [
	{ id: 'Mathematics', label: 'mathematics' },
	{ id: 'Physical Sciences', label: 'physical sciences' },
	{ id: 'Chemistry', label: 'chemistry' },
	{ id: 'Life Sciences', label: 'life sciences' },
	{ id: 'Geography', label: 'geography' },
	{ id: 'Accounting', label: 'accounting' },
];

interface DuelLobbyProps {
	onStartDuel: (subject: string) => void;
}

export function DuelLobby({ onStartDuel }: DuelLobbyProps) {
	const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
	const { isSearching } = useDuelStore();

	const handleFindOpponent = async () => {
		if (!selectedSubject) return;
		await onStartDuel(selectedSubject);
	};

	return (
		<div className="mx-auto max-w-lg space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>choose your arena</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-2 gap-2">
						{SUBJECTS.map((subject) => (
							<button
								key={subject.id}
								type="button"
								onClick={() => setSelectedSubject(subject.id)}
								className={`rounded-xl border px-3 py-2.5 text-xs transition-colors ${
									selectedSubject === subject.id
										? 'border-primary bg-primary text-primary-foreground'
										: 'border-border bg-background hover:bg-muted'
								}`}
							>
								{subject.label}
							</button>
						))}
					</div>

					{isSearching ? (
						<div className="flex flex-col items-center gap-3 py-4">
							<div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
							<p className="text-xs text-muted-foreground">finding opponent...</p>
						</div>
					) : (
						<Button className="w-full" disabled={!selectedSubject} onClick={handleFindOpponent}>
							start duel
						</Button>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
