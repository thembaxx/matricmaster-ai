'use client';

import { Button } from '@/components/ui/button';
import { CATEGORY_LABELS, type ElementType, GROUP_COLORS } from '@/constants/periodic-table';
import { ELEMENT_DETAILS } from '@/content/element-details';
import { cn } from '@/lib/utils';

interface ElementComparisonProps {
	elements: ElementType[];
	onClear: () => void;
}

export function ElementComparison({ elements, onClear }: ElementComparisonProps) {
	if (elements.length !== 2) return null;

	return (
		<div className="w-full max-w-4xl mx-auto mt-8">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-xl font-black text-center">Element Comparison</h2>
				<Button variant="ghost" size="sm" onClick={onClear} className="text-xs">
					Clear
				</Button>
			</div>
			<div className="grid grid-cols-2 gap-4">
				{elements.map((el) => {
					const details = ELEMENT_DETAILS[el.num];
					return (
						<div key={el.num} className="p-4 bg-card rounded-xl border">
							<div className="flex items-center gap-3 mb-4">
								<div
									className={cn(
										'w-16 h-16 rounded-lg border-2 flex flex-col items-center justify-center',
										GROUP_COLORS[el.group]
									)}
								>
									<span className="text-xs font-bold opacity-60">{el.num}</span>
									<span className="text-2xl font-black">{el.sym}</span>
								</div>
								<div>
									<h3 className="font-black">{el.name}</h3>
									<p className="text-xs text-muted-foreground">{el.mass} u</p>
								</div>
							</div>
							<div className="space-y-2 text-sm">
								<div className="flex justify-between">
									<span className="text-muted-foreground">Category</span>
									<span className="font-bold">{CATEGORY_LABELS[el.group] || el.category}</span>
								</div>
								{details && (
									<>
										<div className="flex justify-between">
											<span className="text-muted-foreground">Electronegativity</span>
											<span className="font-bold">{details.electronegativity ?? 'N/A'}</span>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground">Atomic Radius</span>
											<span className="font-bold">
												{details.atomicRadius ? `${details.atomicRadius} pm` : 'N/A'}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground">Ionization Energy</span>
											<span className="font-bold">
												{details.ionizationEnergy ? `${details.ionizationEnergy} kJ/mol` : 'N/A'}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground">Density</span>
											<span className="font-bold">
												{details.density !== 'Unknown' ? `${details.density} g/cm³` : 'N/A'}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground">Melting Point</span>
											<span className="font-bold">
												{details.meltingPoint !== 'Unknown' ? details.meltingPoint : 'N/A'}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground">Boiling Point</span>
											<span className="font-bold">
												{details.boilingPoint !== 'Unknown' ? details.boilingPoint : 'N/A'}
											</span>
										</div>
									</>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

interface TrendLegendProps {
	trendsMode: boolean;
}

export function TrendLegend({ trendsMode }: TrendLegendProps) {
	if (!trendsMode) return null;

	return (
		<div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-6 px-2">
			<div className="flex items-center gap-2">
				<div className="w-4 h-4 rounded-sm bg-blue-300" />
				<span className="text-[10px] font-bold">Low</span>
			</div>
			<div className="flex items-center gap-2">
				<div className="w-4 h-4 rounded-sm bg-blue-400" />
			</div>
			<div className="flex items-center gap-2">
				<div className="w-4 h-4 rounded-sm bg-yellow-400" />
			</div>
			<div className="flex items-center gap-2">
				<div className="w-4 h-4 rounded-sm bg-orange-500" />
			</div>
			<div className="flex items-center gap-2">
				<div className="w-4 h-4 rounded-sm bg-red-500" />
				<span className="text-[10px] font-bold">High</span>
			</div>
		</div>
	);
}

interface CategoryLegendProps {
	trendsMode: boolean;
}

export function CategoryLegend({ trendsMode }: CategoryLegendProps) {
	if (trendsMode) return null;

	const groups = [
		{ value: 'nonmetal', label: 'Nonmetal', color: 'bg-primary-violet' },
		{ value: 'noble', label: 'Noble Gas', color: 'bg-accent-blue' },
		{ value: 'alkali', label: 'Alkali Metal', color: 'bg-primary-orange' },
		{ value: 'alkaline', label: 'Alkaline Earth', color: 'bg-tiimo-yellow' },
		{ value: 'metalloid', label: 'Metalloid', color: 'bg-tiimo-green' },
		{ value: 'halogen', label: 'Halogen', color: 'bg-destructive' },
		{ value: 'transition', label: 'Transition Metal', color: 'bg-blue-500' },
		{ value: 'metal', label: 'Post-Transition', color: 'bg-zinc-400' },
		{ value: 'lanthanide', label: 'Lanthanide', color: 'bg-pink-400' },
		{ value: 'actinide', label: 'Actinide', color: 'bg-red-400' },
		{ value: 'synthetic', label: 'Synthetic', color: 'bg-gray-400' },
	];

	return (
		<div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-6 px-2">
			{groups.map((group) => (
				<div key={group.value} className="flex items-center gap-2">
					<div className={cn('w-3 h-3 rounded-sm border', group.color)} />
					<span className="text-[10px] font-bold ">{group.label}</span>
				</div>
			))}
		</div>
	);
}
