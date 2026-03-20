'use client';

import { useState } from 'react';
import type { Character } from '@/data/setworks/types';
import { cn } from '@/lib/utils';

interface CharacterMapProps {
	characters: Character[];
}

const ROLE_COLORS: Record<string, string> = {
	protagonist: '#22c55e',
	antagonist: '#ef4444',
	supporting: '#818CF8',
};

export function CharacterMap({ characters }: CharacterMapProps) {
	const [hoveredId, setHoveredId] = useState<string | null>(null);
	const [selectedId, setSelectedId] = useState<string | null>(null);

	const radius = 120;
	const centerX = 200;
	const centerY = 200;
	const nodeRadius = 24;

	const positions = characters.map((char, i) => {
		const angle = (2 * Math.PI * i) / characters.length - Math.PI / 2;
		return {
			id: char.id,
			x: centerX + radius * Math.cos(angle),
			y: centerY + radius * Math.sin(angle),
		};
	});

	const getPos = (id: string) => positions.find((p) => p.id === id);
	const selectedChar = characters.find((c) => c.id === selectedId);

	const connections: { from: string; to: string; label: string }[] = [];
	for (const char of characters) {
		for (const rel of char.relationships) {
			if (
				characters.some((c) => c.id === rel.characterId) &&
				!connections.some(
					(c) =>
						(c.from === char.id && c.to === rel.characterId) ||
						(c.from === rel.characterId && c.to === char.id)
				)
			) {
				connections.push({
					from: char.id,
					to: rel.characterId,
					label: rel.relationship,
				});
			}
		}
	}

	return (
		<div className="space-y-4">
			<div className="overflow-x-auto">
				<svg
					viewBox="0 0 400 400"
					className="w-full max-w-md mx-auto"
					role="img"
					aria-label="Character relationship diagram"
				>
					{connections.map((conn, i) => {
						const from = getPos(conn.from);
						const to = getPos(conn.to);
						if (!from || !to) return null;

						const isHighlighted =
							hoveredId === conn.from ||
							hoveredId === conn.to ||
							selectedId === conn.from ||
							selectedId === conn.to;

						return (
							<g key={i}>
								<line
									x1={from.x}
									y1={from.y}
									x2={to.x}
									y2={to.y}
									stroke={isHighlighted ? '#818CF8' : '#e5e7eb'}
									strokeWidth={isHighlighted ? 2.5 : 1.5}
									className="transition-all"
								/>
								{isHighlighted && (
									<text
										x={(from.x + to.x) / 2}
										y={(from.y + to.y) / 2 - 6}
										textAnchor="middle"
										className="fill-primary text-[10px] font-medium"
									>
										{conn.label}
									</text>
								)}
							</g>
						);
					})}

					{characters.map((char) => {
						const pos = getPos(char.id);
						if (!pos) return null;
						const color = ROLE_COLORS[char.role] || '#818CF8';
						const isActive = hoveredId === char.id || selectedId === char.id;

						return (
							<g
								key={char.id}
								onMouseEnter={() => setHoveredId(char.id)}
								onMouseLeave={() => setHoveredId(null)}
								onClick={() => setSelectedId(selectedId === char.id ? null : char.id)}
								className="cursor-pointer"
								role="button"
								tabIndex={0}
								onKeyDown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										setSelectedId(selectedId === char.id ? null : char.id);
									}
								}}
							>
								<circle
									cx={pos.x}
									cy={pos.y}
									r={isActive ? nodeRadius + 4 : nodeRadius}
									fill={isActive ? color : `${color}20`}
									stroke={color}
									strokeWidth={isActive ? 3 : 1.5}
									className="transition-all"
								/>
								<text
									x={pos.x}
									y={pos.y + 1}
									textAnchor="middle"
									dominantBaseline="middle"
									className={cn(
										'text-[9px] font-medium transition-all',
										isActive ? 'fill-white' : 'fill-foreground'
									)}
								>
									{char.name.split(' ').length > 1
										? char.name.split(' ')[0]
										: char.name.slice(0, 6)}
								</text>
							</g>
						);
					})}
				</svg>
			</div>

			{selectedChar && (
				<div className="p-4 rounded-lg border bg-card">
					<div className="flex items-center gap-2 mb-2">
						<div
							className="w-3 h-3 rounded-full"
							style={{ backgroundColor: ROLE_COLORS[selectedChar.role] }}
						/>
						<h4 className="font-bold">{selectedChar.name}</h4>
						<span className="text-xs text-muted-foreground capitalize">{selectedChar.role}</span>
					</div>
					<p className="text-sm text-muted-foreground">{selectedChar.description}</p>
					{selectedChar.relationships.length > 0 && (
						<div className="mt-3 flex flex-wrap gap-1.5">
							{selectedChar.relationships.map((rel, i) => {
								const relatedChar = characters.find((c) => c.id === rel.characterId);
								return (
									<span key={i} className="text-xs bg-secondary px-2 py-1 rounded-full">
										{rel.relationship}: {relatedChar?.name || rel.characterId}
									</span>
								);
							})}
						</div>
					)}
				</div>
			)}

			<div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
				{Object.entries(ROLE_COLORS).map(([role, color]) => (
					<div key={role} className="flex items-center gap-1.5">
						<div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
						<span className="capitalize">{role}</span>
					</div>
				))}
			</div>
		</div>
	);
}
