'use client';

import { useState } from 'react';
import { BATTLE_SITES, REGIONAL_ZOOM } from '@/constants/map-data';
import type { BattleSite } from '@/types/map';
import { MapContainer } from '../MapContainer';

interface BattleSitesMapProps {
	className?: string;
}

export function BattleSitesMap({ className = '' }: BattleSitesMapProps) {
	const [selectedBattle, setSelectedBattle] = useState<BattleSite | null>(null);
	const [conflictFilter, setConflictFilter] = useState<string>('all');

	const conflicts = [...new Set(BATTLE_SITES.map((b) => b.conflict))];

	const filteredBattles =
		conflictFilter === 'all'
			? BATTLE_SITES
			: BATTLE_SITES.filter((b) => b.conflict === conflictFilter);

	return (
		<div className={`space-y-4 ${className}`}>
			<div className="flex flex-wrap gap-2">
				<button
					type="button"
					onClick={() => setConflictFilter('all')}
					className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
						conflictFilter === 'all'
							? 'bg-primary text-primary-foreground'
							: 'bg-muted hover:bg-muted/80'
					}`}
				>
					All Conflicts
				</button>
				{conflicts.map((conflict) => (
					<button
						type="button"
						key={conflict}
						onClick={() => setConflictFilter(conflict)}
						className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
							conflictFilter === conflict
								? 'bg-primary text-primary-foreground'
								: 'bg-muted hover:bg-muted/80'
						}`}
					>
						{conflict}
					</button>
				))}
			</div>

			<div className="rounded-lg overflow-hidden border">
				<MapContainer
					center={[-28.5, 28.0]}
					zoom={REGIONAL_ZOOM}
					markers={filteredBattles.map((battle) => ({
						id: battle.id,
						title: battle.name,
						description: `${battle.conflict} - ${battle.outcome}`,
						position: battle.position,
						year: battle.year,
						category: 'battle',
					}))}
					onMarkerClick={(marker) => {
						const battle = BATTLE_SITES.find((b) => b.id === marker.id);
						if (battle) setSelectedBattle(battle);
					}}
				/>
			</div>

			<div className="grid gap-2">
				{filteredBattles.map((battle) => (
					<button
						type="button"
						key={battle.id}
						onClick={() => setSelectedBattle(battle)}
						className={`p-3 rounded-lg text-left transition-all ${
							selectedBattle?.id === battle.id
								? 'bg-primary/10 border-primary'
								: 'bg-muted hover:bg-muted/80 border'
						}`}
					>
						<div className="flex justify-between items-start">
							<div>
								<h3 className="font-semibold">{battle.name}</h3>
								<p className="text-sm text-muted-foreground">{battle.conflict}</p>
							</div>
							<span className="text-sm font-medium text-muted-foreground">{battle.year}</span>
						</div>
					</button>
				))}
			</div>

			{selectedBattle && (
				<div className="p-4 rounded-lg bg-muted">
					<div className="flex items-start justify-between">
						<div>
							<h3 className="font-semibold">{selectedBattle.name}</h3>
							<p className="text-sm text-muted-foreground mt-1">{selectedBattle.conflict}</p>
						</div>
						<span className="text-sm font-medium">{selectedBattle.year}</span>
					</div>
					{selectedBattle.outcome && (
						<div className="mt-2">
							<span className="text-sm font-medium">Outcome: </span>
							<span className="text-sm">{selectedBattle.outcome}</span>
						</div>
					)}
				</div>
			)}
		</div>
	);
}

export default BattleSitesMap;
