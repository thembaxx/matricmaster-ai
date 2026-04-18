'use client';

import { motion as m } from 'motion/react';
import { useMemo, useState } from 'react';
import { VirtualLab } from './VirtualLab';

export function PhysicsLever() {
	const [leftWeight, setLeftWeight] = useState(10);
	const [rightWeight, setRightWeight] = useState(10);
	const [fulcrumPosition, setFulcrumPosition] = useState(50);

	const leftArm = fulcrumPosition;
	const rightArm = 100 - fulcrumPosition;
	const leftTorque = leftWeight * leftArm;
	const rightTorque = rightWeight * rightArm;
	const netTorque = leftTorque - rightTorque;
	const tiltAngle = useMemo(() => {
		const maxTilt = 25;
		const maxTorque = 1000;
		return Math.max(-maxTilt, Math.min(maxTilt, (netTorque / maxTorque) * maxTilt));
	}, [netTorque]);

	const isBalanced = Math.abs(netTorque) < 5;

	return (
		<VirtualLab
			title="Lever and Torque"
			subject="Physics"
			visualization={
				<svg
					viewBox="0 0 400 200"
					className="w-full h-full"
					role="img"
					aria-label="Lever simulation"
				>
					<title>Lever and fulcrum simulation</title>

					<m.g
						animate={{ rotate: tiltAngle }}
						transition={{ type: 'spring', stiffness: 120, damping: 20 }}
						style={{ transformOrigin: `${fulcrumPosition * 3.5 + 25}px 140px` }}
					>
						<rect x="25" y="132" width="350" height="8" rx="4" fill="currentColor" opacity="0.6" />

						<rect
							x={fulcrumPosition * 3.5 + 5}
							y="120"
							width={leftWeight * 1.5 + 10}
							height="14"
							rx="3"
							fill="var(--tiimo-blue)"
							opacity="0.7"
						/>
						<text
							x={fulcrumPosition * 3.5 + 5 + (leftWeight * 1.5 + 10) / 2}
							y="131"
							textAnchor="middle"
							fontSize="8"
							fill="white"
							fontFamily="var(--font-geist-mono)"
						>
							{leftWeight} kg
						</text>

						<rect
							x={
								fulcrumPosition * 3.5 +
								25 +
								(100 - fulcrumPosition) * 3.5 -
								(rightWeight * 1.5 + 10) / 2
							}
							y="120"
							width={rightWeight * 1.5 + 10}
							height="14"
							rx="3"
							fill="var(--tiimo-orange)"
							opacity="0.7"
						/>
						<text
							x={fulcrumPosition * 3.5 + 25 + (100 - fulcrumPosition) * 3.5}
							y="131"
							textAnchor="middle"
							fontSize="8"
							fill="white"
							fontFamily="var(--font-geist-mono)"
						>
							{rightWeight} kg
						</text>
					</m.g>

					<polygon
						points={`${fulcrumPosition * 3.5 + 25},140 ${fulcrumPosition * 3.5 + 15},168 ${fulcrumPosition * 3.5 + 35},168`}
						fill="currentColor"
						opacity="0.3"
					/>

					<line
						x1="25"
						y1="170"
						x2="375"
						y2="170"
						stroke="currentColor"
						strokeWidth="1"
						opacity="0.1"
					/>

					<text
						x={fulcrumPosition * 3.5 + 25}
						y="184"
						textAnchor="middle"
						fontSize="9"
						fill="currentColor"
						opacity="0.5"
						fontFamily="var(--font-geist-mono)"
					>
						fulcrum
					</text>
				</svg>
			}
		>
			<div className="space-y-4">
				<div className="space-y-1.5">
					<div className="flex justify-between">
						<label htmlFor="left-weight" className="text-xs text-muted-foreground">
							Left weight
						</label>
						<span className="text-xs font-[family-name:var(--font-geist-mono)]">
							{leftWeight} kg
						</span>
					</div>
					<input
						id="left-weight"
						type="range"
						min={1}
						max={50}
						value={leftWeight}
						onChange={(e) => setLeftWeight(Number(e.target.value))}
						className="w-full accent-[var(--tiimo-blue)]"
					/>
				</div>

				<div className="space-y-1.5">
					<div className="flex justify-between">
						<label htmlFor="right-weight" className="text-xs text-muted-foreground">
							Right weight
						</label>
						<span className="text-xs font-[family-name:var(--font-geist-mono)]">
							{rightWeight} kg
						</span>
					</div>
					<input
						id="right-weight"
						type="range"
						min={1}
						max={50}
						value={rightWeight}
						onChange={(e) => setRightWeight(Number(e.target.value))}
						className="w-full accent-[var(--tiimo-orange)]"
					/>
				</div>

				<div className="space-y-1.5">
					<div className="flex justify-between">
						<label htmlFor="fulcrum-position" className="text-xs text-muted-foreground">
							Fulcrum position
						</label>
						<span className="text-xs font-[family-name:var(--font-geist-mono)]">
							{fulcrumPosition}%
						</span>
					</div>
					<input
						id="fulcrum-position"
						type="range"
						min={10}
						max={90}
						value={fulcrumPosition}
						onChange={(e) => setFulcrumPosition(Number(e.target.value))}
						className="w-full accent-primary"
					/>
				</div>

				<div className="pt-2 border-t border-border/30">
					<div className="grid grid-cols-3 gap-3 text-center">
						<div>
							<div className="text-[9px] text-muted-foreground">Left torque</div>
							<div className="font-[family-name:var(--font-geist-mono)] text-sm font-bold text-[var(--tiimo-blue)]">
								{leftTorque.toFixed(0)}
							</div>
						</div>
						<div>
							<div className="text-[9px] text-muted-foreground">Net torque</div>
							<div
								className={`font-[family-name:var(--font-geist-mono)] text-sm font-bold ${
									isBalanced ? 'text-green-500' : 'text-destructive'
								}`}
							>
								{netTorque.toFixed(0)}
							</div>
						</div>
						<div>
							<div className="text-[9px] text-muted-foreground">Right torque</div>
							<div className="font-[family-name:var(--font-geist-mono)] text-sm font-bold text-[var(--tiimo-orange)]">
								{rightTorque.toFixed(0)}
							</div>
						</div>
					</div>
					{isBalanced && <div className="text-center text-xs text-green-500 mt-2">Balanced</div>}
				</div>
			</div>
		</VirtualLab>
	);
}
