'use client';

import { Card } from '@/components/ui/card';
import type { Character } from '@/data/setworks/types';

interface CharacterListProps {
	characters: Character[];
}

export function CharacterList({ characters }: CharacterListProps) {
	return (
		<div className="grid gap-4">
			{characters.map((char) => (
				<Card key={char.id} className="p-4">
					<div className="flex items-start justify-between">
						<div>
							<h4 className="font-bold">{char.name}</h4>
							<span
								className={`text-xs px-2 py-0.5 rounded-full ${
									char.role === 'protagonist'
										? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
										: char.role === 'antagonist'
											? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
											: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
								}`}
							>
								{char.role}
							</span>
						</div>
					</div>
					<p className="text-sm text-muted-foreground mt-2">{char.description}</p>
					{char.relationships.length > 0 && (
						<div className="mt-2 flex flex-wrap gap-2">
							{char.relationships.map((rel, i) => (
								<span key={`rel-${i}`} className="text-xs bg-secondary px-2 py-1 rounded">
									{rel.relationship}
								</span>
							))}
						</div>
					)}
				</Card>
			))}
		</div>
	);
}
