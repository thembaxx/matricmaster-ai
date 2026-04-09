'use client';

import { AnimatePresence, m } from 'framer-motion';
import { useCallback, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { VirtualLab } from './VirtualLab';

interface Element {
	symbol: string;
	name: string;
	group: 'metal' | 'nonmetal';
}

interface BondResult {
	compound: string;
	bondType: 'ionic' | 'covalent';
}

const ELEMENTS: Element[] = [
	{ symbol: 'Na', name: 'Sodium', group: 'metal' },
	{ symbol: 'Cl', name: 'Chlorine', group: 'nonmetal' },
	{ symbol: 'H', name: 'Hydrogen', group: 'nonmetal' },
	{ symbol: 'O', name: 'Oxygen', group: 'nonmetal' },
	{ symbol: 'C', name: 'Carbon', group: 'nonmetal' },
	{ symbol: 'N', name: 'Nitrogen', group: 'nonmetal' },
];

const COMBINATIONS: Record<string, BondResult> = {
	'Na+Cl': { compound: 'NaCl', bondType: 'ionic' },
	'H+Cl': { compound: 'HCl', bondType: 'covalent' },
	'H+O': { compound: 'H₂O', bondType: 'covalent' },
	'C+O': { compound: 'CO₂', bondType: 'covalent' },
	'C+H': { compound: 'CH₄', bondType: 'covalent' },
	'N+H': { compound: 'NH₃', bondType: 'covalent' },
	'C+N': { compound: 'CN', bondType: 'covalent' },
	'H+N': { compound: 'NH₃', bondType: 'covalent' },
};

function getCombinationKey(a: string, b: string): string {
	const sorted = [a, b].sort();
	return `${sorted[0]}+${sorted[1]}`;
}

export function ChemistryBonding() {
	const [selected, setSelected] = useState<Element[]>([]);
	const [result, setResult] = useState<BondResult | null>(null);
	const [animating, setAnimating] = useState(false);

	const handleSelect = useCallback(
		(el: Element) => {
			if (animating) return;

			if (selected.length === 0) {
				setSelected([el]);
				setResult(null);
				return;
			}

			if (selected.length === 1) {
				if (selected[0].symbol === el.symbol) {
					setSelected([]);
					setResult(null);
					return;
				}

				const key = getCombinationKey(selected[0].symbol, el.symbol);
				const combo = COMBINATIONS[key];

				setAnimating(true);
				setSelected([selected[0], el]);

				setTimeout(() => {
					if (combo) {
						setResult(combo);
					}
					setAnimating(false);
				}, 600);
			}
		},
		[selected, animating]
	);

	const handleReset = useCallback(() => {
		setSelected([]);
		setResult(null);
		setAnimating(false);
	}, []);

	return (
		<VirtualLab
			title="Chemical Bonding"
			subject="Chemistry"
			visualization={
				<div className="w-full h-full flex flex-col items-center justify-center p-8 gap-6">
					<AnimatePresence mode="wait" initial={false}>
						{result ? (
							<m.div
								key={result.compound}
								initial={{ scale: 0, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								exit={{ scale: 0, opacity: 0 }}
								transition={{ type: 'spring', stiffness: 300, damping: 20 }}
								className="flex flex-col items-center gap-3"
							>
								<span className="font-[family-name:var(--font-playfair)] text-3xl font-bold">
									{result.compound}
								</span>
								<Badge
									variant={result.bondType === 'ionic' ? 'default' : 'secondary'}
									className="rounded-2xl"
								>
									{result.bondType} bond
								</Badge>
							</m.div>
						) : (
							<m.div
								key="elements"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								className="flex items-center gap-4"
							>
								{selected.length >= 1 && (
									<m.div
										layoutId={`card-${selected[0].symbol}`}
										className={cn(
											'w-16 h-16 rounded-2xl border-2 flex flex-col items-center justify-center',
											selected[0].group === 'metal'
												? 'border-blue-400/50 bg-blue-500/10'
												: 'border-green-400/50 bg-green-500/10'
										)}
									>
										<span className="text-lg font-bold">{selected[0].symbol}</span>
										<span className="text-[8px] text-muted-foreground">{selected[0].name}</span>
									</m.div>
								)}

								{selected.length === 1 && (
									<m.span
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										className="text-muted-foreground text-sm"
									>
										+ ?
									</m.span>
								)}

								{selected.length === 2 && (
									<>
										<span className="text-muted-foreground">+</span>
										<m.div
											layoutId={`card-${selected[1].symbol}`}
											className={cn(
												'w-16 h-16 rounded-2xl border-2 flex flex-col items-center justify-center',
												selected[1].group === 'metal'
													? 'border-blue-400/50 bg-blue-500/10'
													: 'border-green-400/50 bg-green-500/10'
											)}
										>
											<span className="text-lg font-bold">{selected[1].symbol}</span>
											<span className="text-[8px] text-muted-foreground">{selected[1].name}</span>
										</m.div>
									</>
								)}

								{selected.length === 0 && (
									<span className="text-sm text-muted-foreground">
										Select two elements below to form a bond
									</span>
								)}
							</m.div>
						)}
					</AnimatePresence>
				</div>
			}
		>
			<div className="flex flex-wrap gap-2">
				{ELEMENTS.map((el) => {
					const isSelected = selected.some((s) => s.symbol === el.symbol);
					return (
						<m.button
							key={el.symbol}
							type="button"
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={() => handleSelect(el)}
							className={cn(
								'w-14 h-14 rounded-2xl border-2 flex flex-col items-center justify-center transition-colors cursor-pointer',
								el.group === 'metal'
									? 'border-blue-400/50 bg-blue-500/10 hover:bg-blue-500/20'
									: 'border-green-400/50 bg-green-500/10 hover:bg-green-500/20',
								isSelected && 'ring-2 ring-primary ring-offset-2 ring-offset-card'
							)}
						>
							<span className="text-sm font-bold">{el.symbol}</span>
							<span className="text-[7px] text-muted-foreground">{el.name}</span>
						</m.button>
					);
				})}
			</div>

			<div className="flex items-center gap-2 text-[10px] text-muted-foreground">
				<span className="inline-block w-3 h-3 rounded bg-blue-500/20 border border-blue-400/50" />
				Metals
				<span className="inline-block w-3 h-3 rounded bg-green-500/20 border border-green-400/50 ml-2" />
				Non-metals
			</div>

			{(selected.length > 0 || result) && (
				<button
					type="button"
					onClick={handleReset}
					className="text-xs text-muted-foreground hover:text-foreground transition-colors"
				>
					Reset
				</button>
			)}
		</VirtualLab>
	);
}
