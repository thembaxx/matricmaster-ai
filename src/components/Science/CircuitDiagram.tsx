'use client';

import { useMemo, useState } from 'react';

interface CircuitElement {
	id: string;
	type: 'resistor' | 'battery' | 'bulb' | 'wire';
	value?: number;
	label?: string;
	position: { x: number; y: number };
	rotation?: number;
}

interface CircuitDiagramProps {
	elements: CircuitElement[];
	showValues?: boolean;
	onElementClick?: (id: string) => void;
}

export function CircuitDiagram({
	elements,
	showValues = true,
	onElementClick,
}: CircuitDiagramProps) {
	const [selected, setSelected] = useState<string | null>(null);

	const handleClick = (id: string) => {
		setSelected(id);
		onElementClick?.(id);
	};

	const renderElement = (el: CircuitElement) => {
		const { x, y } = el.position;
		const isSelected = selected === el.id;

		switch (el.type) {
			case 'resistor':
				return (
					<g
						key={el.id}
						onClick={() => handleClick(el.id)}
						className="cursor-pointer"
						role="button"
						tabIndex={0}
						onKeyDown={(e) => e.key === 'Enter' && handleClick(el.id)}
					>
						<rect
							x={x - 20}
							y={y - 10}
							width={40}
							height={20}
							fill={isSelected ? '#F97316' : '#E5E5E5'}
							stroke={isSelected ? '#F97316' : '#666'}
							strokeWidth={isSelected ? 3 : 2}
							rx={2}
						/>
						{showValues && el.value && (
							<text x={x} y={y - 15} textAnchor="middle" fontSize="10" fill="currentColor">
								{el.value}Ω
							</text>
						)}
						{el.label && (
							<text x={x} y={y + 30} textAnchor="middle" fontSize="10" fill="currentColor">
								{el.label}
							</text>
						)}
					</g>
				);

			case 'battery':
				return (
					<g
						key={el.id}
						onClick={() => handleClick(el.id)}
						className="cursor-pointer"
						role="button"
						tabIndex={0}
						onKeyDown={(e) => e.key === 'Enter' && handleClick(el.id)}
					>
						<rect
							x={x - 15}
							y={y - 20}
							width={30}
							height={40}
							fill="none"
							stroke={isSelected ? '#10B981' : '#333'}
							strokeWidth={isSelected ? 3 : 2}
							rx={2}
						/>
						<line
							x1={x - 5}
							y1={y - 10}
							x2={x + 5}
							y2={y - 10}
							stroke={isSelected ? '#10B981' : '#333'}
							strokeWidth={3}
						/>
						<line
							x1={x - 5}
							y1={y + 10}
							x2={x + 5}
							y2={y + 10}
							stroke={isSelected ? '#10B981' : '#333'}
							strokeWidth={1}
						/>
						{showValues && el.value && (
							<text
								x={x}
								y={y - 30}
								textAnchor="middle"
								fontSize="12"
								fill="#10B981"
								fontWeight="bold"
							>
								{el.value}V
							</text>
						)}
					</g>
				);

			case 'bulb':
				return (
					<g
						key={el.id}
						onClick={() => handleClick(el.id)}
						className="cursor-pointer"
						role="button"
						tabIndex={0}
						onKeyDown={(e) => e.key === 'Enter' && handleClick(el.id)}
					>
						<circle
							cx={x}
							cy={y}
							r={15}
							fill={isSelected ? '#FBBF24' : '#E5E5E5'}
							stroke={isSelected ? '#F59E0B' : '#666'}
							strokeWidth={isSelected ? 3 : 2}
						/>
						<path
							d={`M ${x - 10} ${y + 15} Q ${x} ${y + 25} ${x + 10} ${y + 15}`}
							fill="none"
							stroke={isSelected ? '#F59E0B' : '#666'}
							strokeWidth={2}
						/>
						{showValues && el.value && (
							<text
								x={x}
								y={y - 25}
								textAnchor="middle"
								fontSize="10"
								fill="#F59E0B"
								fontWeight="bold"
							>
								{el.value}W
							</text>
						)}
					</g>
				);

			case 'wire':
				return (
					<line
						key={el.id}
						x1={el.position.x}
						y1={el.position.y}
						x2={x + (el.value || 0)}
						y2={y}
						stroke="#666"
						strokeWidth={2}
					/>
				);

			default:
				return null;
		}
	};

	return (
		<div className="bg-card rounded-xl p-4 border border-border">
			<svg
				viewBox="0 0 400 250"
				className="w-full h-auto"
				style={{ minHeight: '200px' }}
				role="img"
				aria-label="Circuit diagram"
			>
				<title>Circuit diagram</title>
				{elements.map(renderElement)}
			</svg>
		</div>
	);
}

export function useCircuitCalculation(voltage: number, resistors: { resistance: number }[]) {
	const totalResistance = useMemo(() => {
		return resistors.reduce((sum, r) => sum + r.resistance, 0);
	}, [resistors]);

	const current = useMemo(() => {
		return voltage / totalResistance;
	}, [voltage, totalResistance]);

	const power = useMemo(() => {
		return current * voltage;
	}, [current, voltage]);

	return { totalResistance, current, power };
}
