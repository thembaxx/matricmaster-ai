'use client';

import { useMemo } from 'react';
import type { ElementType } from '@/constants/periodic-table';
import type { ElementDetailState, ViewState } from '@/hooks/usePeriodicTableState';
import { ElementCard } from './ElementCard';

interface ElementGridProps {
	elements: ElementType[];
	viewState: ViewState;
	elementDetailState: ElementDetailState;
	onElementClick: (element: ElementType) => void;
	onCompareSelect: (element: ElementType) => void;
}

export function ElementGrid({
	elements,
	viewState,
	elementDetailState,
	onElementClick,
	onCompareSelect,
}: ElementGridProps) {
	const highlightedElements = useMemo(() => {
		if (viewState.searchQuery === '' && viewState.selectedGroup === 'all') return null;
		return new Set(elements.map((el) => el.num));
	}, [elements, viewState.searchQuery, viewState.selectedGroup]);

	return (
		<div className="flex flex-wrap justify-center gap-1">
			{elements.map((el, i) => (
				<ElementCard
					key={el.num}
					element={el}
					index={i}
					trendsMode={viewState.trendsMode}
					compareMode={viewState.compareMode}
					compareElements={viewState.compareElements}
					selectedElement={elementDetailState.selectedElement}
					highlightedElements={highlightedElements}
					onClick={viewState.compareMode ? onCompareSelect : onElementClick}
				/>
			))}
		</div>
	);
}
