'use client';

import { GridIcon, RefreshIcon, ZoomIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@/components/ui/button';
import { useGraphingEngine } from '@/stores/useGraphingEngine';

export function GraphToolbar() {
	const { showGrid, toggleGrid, setViewport, viewport, clear } = useGraphingEngine();

	const handleZoom = (direction: 'in' | 'out') => {
		const factor = direction === 'in' ? 0.8 : 1.25;
		setViewport({
			xMin: viewport.xMin * factor,
			xMax: viewport.xMax * factor,
			yMin: viewport.yMin * factor,
			yMax: viewport.yMax * factor,
		});
	};

	const handleReset = () => {
		setViewport({ xMin: -10, xMax: 10, yMin: -10, yMax: 10 });
		clear();
	};

	return (
		<div className="flex items-center gap-2">
			<Button
				variant="ghost"
				size="icon"
				onClick={toggleGrid}
				title={showGrid ? 'Hide Grid' : 'Show Grid'}
			>
				<HugeiconsIcon icon={GridIcon} className="w-4 h-4" />
			</Button>
			<Button
				variant="ghost"
				size="icon"
				onClick={() => handleZoom('in')}
				title="Zoom In"
				aria-label="Zoom in"
			>
				<HugeiconsIcon icon={ZoomIcon} className="w-4 h-4" aria-hidden="true" />
			</Button>
			<Button
				variant="ghost"
				size="icon"
				onClick={() => handleZoom('out')}
				title="Zoom Out"
				aria-label="Zoom out"
			>
				<HugeiconsIcon icon={ZoomIcon} className="w-4 h-4 rotate-180" aria-hidden="true" />
			</Button>
			<Button variant="ghost" onClick={handleReset} title="Reset">
				<HugeiconsIcon icon={RefreshIcon} className="w-4 h-4 mr-2" />
				Reset
			</Button>
		</div>
	);
}
