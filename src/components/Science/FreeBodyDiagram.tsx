'use client';

import { useState } from 'react';
import { VectorArrow } from './VectorArrow';

interface Force {
	id: string;
	name: string;
	magnitude: number;
	angle: number;
	color: string;
}

interface FreeBodyDiagramProps {
	forces?: Force[];
	objectMass?: number;
	showValues?: boolean;
}

export function FreeBodyDiagram({
	forces = [
		{ id: 'f1', name: 'Fg', magnitude: 98, angle: 270, color: '#8B5CF6' },
		{ id: 'f2', name: 'N', magnitude: 98, angle: 90, color: '#10B981' },
	],
	objectMass = 10,
	showValues = true,
}: FreeBodyDiagramProps) {
	const [selectedForce, setSelectedForce] = useState<string | null>(null);

	const centerX = 150;
	const centerY = 150;
	const scale = 1.5;

	const netForce = forces.reduce(
		(acc, f) => {
			const rad = (f.angle * Math.PI) / 180;
			return {
				x: acc.x + f.magnitude * Math.cos(rad),
				y: acc.y + f.magnitude * Math.sin(rad),
			};
		},
		{ x: 0, y: 0 }
	);

	const isBalanced = Math.abs(netForce.x) < 1 && Math.abs(netForce.y) < 1;

	return (
		<div className="bg-card rounded-2xl p-6 border border-border">
			<div className="flex items-center justify-between mb-4">
				<h3 className="font-semibold text-foreground">Free Body Diagram</h3>
				<div
					className={`px-3 py-1 rounded-full text-xs font-medium ${isBalanced ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}
				>
					{isBalanced ? 'Balanced' : 'Unbalanced'}
				</div>
			</div>

			<svg
				width={300}
				height={300}
				className="bg-background rounded-xl mx-auto"
				role="img"
				aria-label="Free body diagram visualization"
			>
				<title>Free Body Diagram showing forces on object</title>
				<circle cx={centerX} cy={centerY} r={30} fill="#E5E5E5" stroke="#666" strokeWidth="2" />
				<text x={centerX} y={centerY + 5} textAnchor="middle" fontSize="14" fill="#333">
					{objectMass}kg
				</text>

				{forces.map((force) => {
					const rad = (force.angle * Math.PI) / 180;
					const length = force.magnitude * scale;
					const endX = centerX + length * Math.cos(rad);
					const endY = centerY + length * Math.sin(rad);

					return (
						<g
							key={force.id}
							onClick={() => setSelectedForce(selectedForce === force.id ? null : force.id)}
							className="cursor-pointer"
							role="button"
							tabIndex={0}
							onKeyDown={(e) =>
								e.key === 'Enter' && setSelectedForce(selectedForce === force.id ? null : force.id)
							}
						>
							<VectorArrow
								startX={centerX}
								startY={centerY}
								endX={endX}
								endY={endY}
								color={force.color}
								strokeWidth={selectedForce === force.id ? 4 : 3}
								label={showValues ? `${force.name} = ${force.magnitude}N` : force.name}
								showHead={true}
							/>
						</g>
					);
				})}

				{!isBalanced && (
					<g opacity="0.6">
						<line
							x1={centerX}
							y1={centerY}
							x2={centerX + netForce.x * scale}
							y2={centerY + netForce.y * scale}
							stroke="#F97316"
							strokeWidth={3}
							strokeDasharray="6,3"
						/>
						<text
							x={centerX + netForce.x * scale + 10}
							y={centerY + netForce.y * scale - 10}
							fontSize="12"
							fill="#F97316"
							fontWeight="bold"
						>
							Fnet
						</text>
					</g>
				)}
			</svg>

			<div className="mt-4 grid grid-cols-2 gap-2">
				{forces.map((force) => (
					<button
						type="button"
						key={force.id}
						className={`p-2 rounded-lg border text-left ${selectedForce === force.id ? 'border-primary bg-primary/10' : 'border-border bg-muted'}`}
						onClick={() => setSelectedForce(selectedForce === force.id ? null : force.id)}
					>
						<div className="flex items-center gap-2">
							<div className="w-3 h-3 rounded-full" style={{ backgroundColor: force.color }} />
							<span className="text-sm font-medium">{force.name}</span>
						</div>
						<div className="text-xs font-mono text-muted-foreground mt-1">
							{force.magnitude}N @ {force.angle}°
						</div>
					</button>
				))}
			</div>

			<div className="mt-4 p-3 bg-muted rounded-lg">
				<div className="text-xs text-muted-foreground">
					<strong>Newton's 2nd Law:</strong> Fnet = ma
				</div>
				<div className="text-xs font-mono mt-1">
					Fnet = √({netForce.x.toFixed(1)}² + {netForce.y.toFixed(1)}²) ={' '}
					{Math.sqrt(netForce.x ** 2 + netForce.y ** 2).toFixed(1)}N
				</div>
			</div>
		</div>
	);
}
