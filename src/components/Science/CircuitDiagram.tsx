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
						aria-label={`Select resistor${el.label ? ` ${el.label}` : el.value ? ` ${el.value}Ω` : ''}`}
						tabIndex={0}
						onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleClick(el.id)}
					>
						<rect
							x={x - 20}
							y={y - 10}
							width={40}
							height={20}
							fill={isSelected ? 'url(#resistorSelectedGradient)' : 'url(#resistorGradient)'}
							stroke={isSelected ? '#F97316' : '#64748b'}
							strokeWidth={isSelected ? 3 : 1.5}
							rx={4}
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
						aria-label={`Select battery${el.label ? ` ${el.label}` : el.value ? ` ${el.value}V` : ''}`}
						tabIndex={0}
						onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleClick(el.id)}
					>
						<rect
							x={x - 15}
							y={y - 20}
							width={30}
							height={40}
							fill={isSelected ? 'rgba(16, 185, 129, 0.1)' : 'none'}
							stroke={isSelected ? 'url(#batteryGradient)' : '#475569'}
							strokeWidth={isSelected ? 3 : 2}
							rx={6}
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
						aria-label={`Select bulb${el.label ? ` ${el.label}` : el.value ? ` ${el.value}W` : ''}`}
						tabIndex={0}
						onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleClick(el.id)}
					>
						<circle
							cx={x}
							cy={y}
							r={15}
							fill={isSelected ? 'url(#bulbSelectedGradient)' : 'url(#bulbGradient)'}
							stroke={isSelected ? '#f59e0b' : '#94a3b8'}
							strokeWidth={isSelected ? 3 : 1.5}
							className={isSelected ? 'animate-pulse' : ''}
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
		<div className="bg-card rounded-3xl p-6 border border-border shadow-soft-md">
			<svg
				viewBox="0 0 400 250"
				className="w-full h-auto"
				style={{ minHeight: '200px' }}
				role="img"
				aria-label="Circuit diagram"
			>
				<title>Circuit diagram</title>
				<defs>
					<linearGradient id="resistorGradient" x1="0%" y1="0%" x2="100%" y2="0%">
						<stop offset="0%" stopColor="#94a3b8" />
						<stop offset="50%" stopColor="#cbd5e1" />
						<stop offset="100%" stopColor="#94a3b8" />
					</linearGradient>
					<linearGradient id="resistorSelectedGradient" x1="0%" y1="0%" x2="100%" y2="0%">
						<stop offset="0%" stopColor="#f97316" />
						<stop offset="50%" stopColor="#fb923c" />
						<stop offset="100%" stopColor="#f97316" />
					</linearGradient>
					<linearGradient id="batteryGradient" x1="0%" y1="0%" x2="0%" y2="100%">
						<stop offset="0%" stopColor="#10b981" />
						<stop offset="100%" stopColor="#059669" />
					</linearGradient>
					<radialGradient id="bulbGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
						<stop offset="0%" stopColor="#fef3c7" />
						<stop offset="100%" stopColor="#fde68a" />
					</radialGradient>
					<radialGradient id="bulbSelectedGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
						<stop offset="0%" stopColor="#fef3c7" />
						<stop offset="70%" stopColor="#fbbf24" />
						<stop offset="100%" stopColor="#f59e0b" />
					</radialGradient>
				</defs>
				{elements.map(renderElement)}
			</svg>
		</div>
	);
}

export function useCircuitCalculation(voltage: number, resistors: { resistance: number }[]) {
	const totalResistance = useMemo(() => {
		return resistors.reduce((sum, r) => sum + r.resistance, 0);
	}, [resistors]);

	const current = voltage / totalResistance;
	const power = current * voltage;

	return { totalResistance, current, power };
}
