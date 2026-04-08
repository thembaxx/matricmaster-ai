'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { VirtualLab } from './VirtualLab';

type LayerType = 'political' | 'topographic' | 'economic';

interface ProvinceData {
	id: string;
	name: string;
	path: string;
	political: string;
	topographic: string;
	economic: string;
	resource: string;
}

const PROVINCES: ProvinceData[] = [
	{
		id: 'gp',
		name: 'Gauteng',
		path: 'M185,95 L210,85 L225,95 L220,115 L195,115 Z',
		political: '#6366f1',
		topographic: '#fde68a',
		economic: '#f59e0b',
		resource: 'Gold, manufacturing',
	},
	{
		id: 'wc',
		name: 'Western Cape',
		path: 'M130,185 L155,175 L170,185 L165,210 L140,215 L125,200 Z',
		political: '#8b5cf6',
		topographic: '#86efac',
		economic: '#10b981',
		resource: 'Wine, tourism',
	},
	{
		id: 'kzn',
		name: 'KwaZulu-Natal',
		path: 'M260,130 L285,120 L295,145 L280,170 L255,165 L250,145 Z',
		political: '#ec4899',
		topographic: '#bef264',
		economic: '#06b6d4',
		resource: 'Coal, agriculture',
	},
	{
		id: 'ec',
		name: 'Eastern Cape',
		path: 'M215,170 L245,160 L255,175 L250,200 L225,210 L210,195 Z',
		political: '#f97316',
		topographic: '#a3e635',
		economic: '#84cc16',
		resource: 'Agriculture, automotive',
	},
	{
		id: 'lp',
		name: 'Limpopo',
		path: 'M195,30 L230,25 L245,50 L235,70 L205,75 L190,55 Z',
		political: '#14b8a6',
		topographic: '#fcd34d',
		economic: '#ef4444',
		resource: 'Platinum, mining',
	},
	{
		id: 'mp',
		name: 'Mpumalanga',
		path: 'M235,70 L260,65 L275,85 L265,105 L240,100 L235,80 Z',
		political: '#0ea5e9',
		topographic: '#d9f99d',
		economic: '#78716c',
		resource: 'Coal, wildlife',
	},
	{
		id: 'nw',
		name: 'North West',
		path: 'M145,60 L175,55 L185,75 L180,100 L155,105 L140,85 Z',
		political: '#a855f7',
		topographic: '#fef08a',
		economic: '#eab308',
		resource: 'Platinum, sunflower',
	},
	{
		id: 'fs',
		name: 'Free State',
		path: 'M155,115 L185,110 L200,125 L195,150 L170,155 L150,140 Z',
		political: '#f43f5e',
		topographic: '#dcfce7',
		economic: '#22c55e',
		resource: 'Gold, maize',
	},
	{
		id: 'nc',
		name: 'Northern Cape',
		path: 'M80,70 L135,55 L145,85 L155,115 L150,145 L130,165 L90,160 L70,120 Z',
		political: '#e11d48',
		topographic: '#fed7aa',
		economic: '#dc2626',
		resource: 'Diamonds, iron ore',
	},
];

export function GeographyLayerMap() {
	const [activeLayer, setActiveLayer] = useState<LayerType>('political');
	const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);

	const getColor = (province: ProvinceData) => {
		return province[activeLayer];
	};

	const layers: { key: LayerType; label: string }[] = [
		{ key: 'political', label: 'Political' },
		{ key: 'topographic', label: 'Topographic' },
		{ key: 'economic', label: 'Economic' },
	];

	return (
		<VirtualLab
			title="South Africa Layered Map"
			subject="Geography"
			visualization={
				<div className="w-full h-full relative p-4">
					<svg
						viewBox="0 0 360 250"
						className="w-full h-full"
						role="img"
						aria-label="Map of South Africa with toggleable layers"
					>
						<title>South Africa layered map</title>
						{PROVINCES.map((province) => (
							<path
								key={province.id}
								d={province.path}
								fill={getColor(province)}
								opacity={hoveredProvince === province.id ? 0.9 : 0.6}
								stroke="currentColor"
								strokeWidth="1"
								className="transition-all duration-300 cursor-pointer"
								role="button"
								tabIndex={-1}
								aria-label={`${province.name} province`}
								onMouseEnter={() => setHoveredProvince(province.id)}
								onMouseLeave={() => setHoveredProvince(null)}
							/>
						))}

						{hoveredProvince && (
							<g>
								{(() => {
									const prov = PROVINCES.find((p) => p.id === hoveredProvince);
									if (!prov) return null;
									const match = prov.path.match(/M(\d+),(\d+)/);
									if (!match) return null;
									return (
										<text
											x={Number.parseInt(match[1], 10)}
											y={Number.parseInt(match[2], 10) - 8}
											fontSize="8"
											fill="currentColor"
											textAnchor="middle"
											className="pointer-events-none"
										>
											{prov.name}
										</text>
									);
								})()}
							</g>
						)}
					</svg>

					{hoveredProvince && (
						<div className="absolute bottom-2 left-2 right-2 rounded-xl bg-card/90 backdrop-blur-sm border border-border/30 p-2 text-xs">
							{(() => {
								const prov = PROVINCES.find((p) => p.id === hoveredProvince);
								if (!prov) return null;
								return (
									<div className="flex items-center justify-between">
										<span className="font-medium">{prov.name}</span>
										{activeLayer === 'economic' && (
											<span className="text-muted-foreground">{prov.resource}</span>
										)}
									</div>
								);
							})()}
						</div>
					)}
				</div>
			}
		>
			<div className="flex gap-2">
				{layers.map((layer) => (
					<button
						key={layer.key}
						type="button"
						onClick={() => setActiveLayer(layer.key)}
						className={cn(
							'px-3 py-1.5 rounded-xl text-xs font-medium transition-colors',
							activeLayer === layer.key
								? 'bg-primary text-primary-foreground'
								: 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
						)}
					>
						{layer.label}
					</button>
				))}
			</div>

			{activeLayer === 'economic' && (
				<div className="text-[10px] text-muted-foreground">
					Hover over provinces to see their key economic resources
				</div>
			)}
		</VirtualLab>
	);
}
