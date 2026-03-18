'use client';

import { m } from 'framer-motion';
import { type ElementType, GROUP_COLORS, type TrendMode } from '@/constants/periodic-table';
import { cn } from '@/lib/utils';

interface ElementCardProps {
	element: ElementType;
	index: number;
	trendsMode: TrendMode;
	compareMode: boolean;
	compareElements: ElementType[];
	selectedElement: ElementType | null;
	highlightedElements: Set<number> | null;
	onClick: (element: ElementType) => void;
}

function getTrendColor(elementNum: number, mode: TrendMode): string {
	const trendData: Record<number, Record<string, number>> = {
		1: { electronegativity: 2.2, atomicRadius: 53, ionizationEnergy: 1312, density: 0.09 },
		2: { electronegativity: 0, atomicRadius: 31, ionizationEnergy: 2372, density: 0.18 },
		3: { electronegativity: 0.98, atomicRadius: 167, ionizationEnergy: 520, density: 0.53 },
		4: { electronegativity: 1.57, atomicRadius: 156, ionizationEnergy: 900, density: 1.85 },
		5: { electronegativity: 2.04, atomicRadius: 151, ionizationEnergy: 801, density: 2.34 },
		6: { electronegativity: 2.55, atomicRadius: 148, ionizationEnergy: 1086, density: 2.27 },
		7: { electronegativity: 3.04, atomicRadius: 146, ionizationEnergy: 1402, density: 1.25 },
		8: { electronegativity: 3.44, atomicRadius: 145, ionizationEnergy: 1314, density: 1.43 },
		9: { electronegativity: 3.98, atomicRadius: 144, ionizationEnergy: 1681, density: 1.7 },
		10: { electronegativity: 0, atomicRadius: 154, ionizationEnergy: 2081, density: 0.9 },
		11: { electronegativity: 0.93, atomicRadius: 190, ionizationEnergy: 496, density: 0.97 },
		12: { electronegativity: 1.31, atomicRadius: 175, ionizationEnergy: 738, density: 1.74 },
		13: { electronegativity: 1.61, atomicRadius: 172, ionizationEnergy: 578, density: 2.7 },
		14: { electronegativity: 1.9, atomicRadius: 170, ionizationEnergy: 786, density: 2.33 },
		15: { electronegativity: 2.19, atomicRadius: 168, ionizationEnergy: 1012, density: 1.82 },
		16: { electronegativity: 2.58, atomicRadius: 165, ionizationEnergy: 1000, density: 2.07 },
		17: { electronegativity: 3.16, atomicRadius: 164, ionizationEnergy: 1251, density: 3.21 },
		18: { electronegativity: 0, atomicRadius: 176, ionizationEnergy: 1521, density: 1.78 },
		19: { electronegativity: 0.82, atomicRadius: 243, ionizationEnergy: 419, density: 0.86 },
		20: { electronegativity: 1.0, atomicRadius: 215, ionizationEnergy: 590, density: 1.55 },
		26: { electronegativity: 1.83, atomicRadius: 156, ionizationEnergy: 763, density: 7.87 },
		29: { electronegativity: 1.9, atomicRadius: 145, ionizationEnergy: 746, density: 8.96 },
		47: { electronegativity: 1.93, atomicRadius: 165, ionizationEnergy: 731, density: 10.49 },
		79: { electronegativity: 2.54, atomicRadius: 174, ionizationEnergy: 890, density: 19.32 },
	};

	const data = trendData[elementNum];
	if (!data || !mode) return '';

	const value = data[mode];
	if (value === undefined || value === 0) return '';

	const ranges: Record<string, { min: number; max: number }> = {
		electronegativity: { min: 0.7, max: 4.0 },
		atomicRadius: { min: 30, max: 250 },
		ionizationEnergy: { min: 400, max: 2500 },
		density: { min: 0.05, max: 20 },
	};

	const range = ranges[mode];
	if (!range) return '';

	const normalized = (value - range.min) / (range.max - range.min);

	if (normalized < 0.25) return 'bg-blue-300';
	if (normalized < 0.5) return 'bg-blue-400';
	if (normalized < 0.75) return 'bg-yellow-400';
	if (normalized < 0.9) return 'bg-orange-500';
	return 'bg-red-500';
}

export function ElementCard({
	element,
	index,
	trendsMode,
	compareMode,
	compareElements,
	selectedElement,
	highlightedElements,
	onClick,
}: ElementCardProps) {
	return (
		<m.button
			key={element.num}
			initial={{ opacity: 0, scale: 0.9 }}
			animate={{
				opacity: highlightedElements && !highlightedElements.has(element.num) ? 0.15 : 1,
				scale: 1,
			}}
			transition={{ delay: Math.min(index * 0.01, 1) }}
			whileHover={
				highlightedElements && !highlightedElements.has(element.num)
					? {}
					: { scale: 1.1, zIndex: 10 }
			}
			whileTap={highlightedElements && !highlightedElements.has(element.num) ? {} : { scale: 0.95 }}
			onClick={() => {
				if (highlightedElements && !highlightedElements.has(element.num)) return;
				onClick(element);
			}}
			className={cn(
				'w-16 h-20 sm:w-16 sm:h-20 rounded-sm border flex flex-col items-center justify-between py-2 transition-all shadow-sm bg-card cursor-pointer',
				trendsMode && getTrendColor(element.num, trendsMode),
				!trendsMode && element.num >= 57 && element.num <= 71 && 'row-start-1 row-end-1',
				!trendsMode && element.num >= 89 && element.num <= 103 && 'row-start-1 row-end-1',
				compareMode &&
					compareElements.find((e) => e.num === element.num) &&
					'ring-2 ring-primary border-primary',
				!compareMode && selectedElement?.num === element.num
					? 'ring-2 ring-primary border-primary shadow-primary/30 scale-110 z-10'
					: highlightedElements && !highlightedElements.has(element.num)
						? 'opacity-20'
						: !trendsMode && GROUP_COLORS[element.group]
			)}
		>
			<span className="text-[10px] sm:text-[10px] font-bold self-start ml-1 opacity-50">
				{element.num}
			</span>
			<span className="text-[13px] sm:text-sm font-black">{element.sym}</span>
			<span className="text-[7px] sm:text-[7px] font-bold uppercase tracking-wider truncate w-full text-center max-w-full px-0.5">
				{element.name.length > 6 ? `${element.name.slice(0, 5)}.` : element.name}
			</span>
		</m.button>
	);
}

export { getTrendColor };
