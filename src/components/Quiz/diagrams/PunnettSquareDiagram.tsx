'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DiagramContainer } from './DiagramContainer';

interface PunnettSquareDiagramProps {
	className?: string;
}

export function PunnettSquareDiagram({ className }: PunnettSquareDiagramProps) {
	const [punnett, setPunnett] = useState<Record<string, string>>({});
	const cells = ['TL', 'TR', 'BL', 'BR'];

	return (
		<DiagramContainer className={className} label="Tap cells to cycle alleles (T/t)" hideSlider>
			<div className="grid grid-cols-3 gap-2 w-full max-w-[240px]">
				<div />
				<div className="flex items-center justify-center font-black text-primary">T</div>
				<div className="flex items-center justify-center font-black text-primary">t</div>
				<div className="flex items-center justify-center font-black text-primary py-4">T</div>
				{cells.map((cell) => (
					<Button
						key={cell}
						type="button"
						variant="ghost"
						onClick={() =>
							setPunnett((prev) => ({
								...prev,
								[cell]: prev[cell] === 'TT' ? 'Tt' : prev[cell] === 'Tt' ? 'tt' : 'TT',
							}))
						}
						className="aspect-square bg-card border-2 border-border rounded-xl flex items-center justify-center font-black text-lg hover:border-primary active:scale-95"
					>
						{punnett[cell] || '?'}
					</Button>
				))}
				<div className="flex items-center justify-center font-black text-primary py-4">t</div>
			</div>
		</DiagramContainer>
	);
}
