'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface ProjectileMotionProps {
	initialVelocity?: number;
	angle?: number;
	gravity?: number;
}

export function ProjectileMotion({
	initialVelocity = 20,
	angle = 45,
	gravity = 9.8,
}: ProjectileMotionProps) {
	const [isPlaying, setIsPlaying] = useState(false);
	const [time, setTime] = useState(0);
	const [position, setPosition] = useState({ x: 0, y: 0 });
	const [velocity, setVelocity] = useState(initialVelocity);
	const [theta, setTheta] = useState(angle);

	const angleRad = (theta * Math.PI) / 180;
	const vx = velocity * Math.cos(angleRad);
	const vy = velocity * Math.sin(angleRad);
	const flightTime = (2 * vy) / gravity;
	const maxHeight = (vy * vy) / (2 * gravity);

	const scale = 8;
	const width = 500;
	const height = 250;
	const groundY = height - 30;

	useEffect(() => {
		if (!isPlaying) return;
		const interval = setInterval(() => {
			setTime((t) => {
				const newTime = t + 0.05;
				if (newTime > flightTime) {
					setIsPlaying(false);
					return flightTime;
				}
				const newX = vx * newTime;
				const newY = vy * newTime - 0.5 * gravity * newTime * newTime;
				setPosition({ x: newX, y: Math.max(0, newY) });
				return newTime;
			});
		}, 50);
		return () => clearInterval(interval);
	}, [isPlaying, flightTime, vx, vy, gravity]);

	const reset = () => {
		setIsPlaying(false);
		setTime(0);
		setPosition({ x: 0, y: 0 });
	};

	const projectileX = 30 + position.x * scale;
	const projectileY = groundY - position.y * scale;

	return (
		<div className="bg-card rounded-2xl p-6 border border-border">
			<div className="flex items-center justify-between mb-4">
				<h3 className="font-semibold text-foreground">Projectile Motion</h3>
				<div className="flex gap-2">
					<Button type="button" onClick={() => setIsPlaying(!isPlaying)}>
						{isPlaying ? 'Pause' : 'Play'}
					</Button>
					<Button type="button" variant="outline" onClick={reset}>
						Reset
					</Button>
				</div>
			</div>

			<div className="relative mb-4">
				<svg
					width={width}
					height={height}
					className="bg-background rounded-xl w-full"
					role="img"
					aria-label="Projectile motion simulation"
				>
					<title>Projectile motion trajectory visualization</title>
					<line x1={30} y1={groundY} x2={width - 20} y2={groundY} stroke="#333" strokeWidth="2" />
					<line x1={30} y1={groundY} x2={30} y2={20} stroke="#333" strokeWidth="2" />

					<text x={width - 40} y={groundY + 20} fontSize="12" fill="#666">
						x
					</text>
					<text x={15} y={25} fontSize="12" fill="#666">
						y
					</text>

					{/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
					{[...Array(6)].map((_, i) => (
						<line
							key={`grid-${i}`}
							x1={30 + i * 60}
							y1={groundY - 5}
							x2={30 + i * 60}
							y2={groundY + 5}
							stroke="#ccc"
							strokeWidth="1"
						/>
					))}

					<circle cx={projectileX} cy={projectileY} r="8" fill="#8B5CF6" />

					{position.y > 0 && (
						<g>
							<text
								x={projectileX + 15}
								y={projectileY - 10}
								fontSize="10"
								fill="#8B5CF6"
								fontFamily="monospace"
							>
								vx: {vx.toFixed(1)} m/s
							</text>
							<text
								x={projectileX + 15}
								y={projectileY + 5}
								fontSize="10"
								fill="#8B5CF6"
								fontFamily="monospace"
							>
								vy: {(vy - gravity * time).toFixed(1)} m/s
							</text>
						</g>
					)}
				</svg>
			</div>

			<div className="grid grid-cols-2 gap-4 text-sm">
				<div className="bg-muted rounded-lg p-3">
					<div className="text-muted-foreground text-xs">Time</div>
					<div className="font-mono font-bold text-foreground">{time.toFixed(2)}s</div>
				</div>
				<div className="bg-muted rounded-lg p-3">
					<div className="text-muted-foreground text-xs">Range</div>
					<div className="font-mono font-bold text-foreground">{position.x.toFixed(2)}m</div>
				</div>
				<div className="bg-muted rounded-lg p-3">
					<div className="text-muted-foreground text-xs">Max Height</div>
					<div className="font-mono font-bold text-foreground">{maxHeight.toFixed(2)}m</div>
				</div>
				<div className="bg-muted rounded-lg p-3">
					<div className="text-muted-foreground text-xs">Flight Time</div>
					<div className="font-mono font-bold text-foreground">{flightTime.toFixed(2)}s</div>
				</div>
			</div>

			<div className="mt-4 flex gap-4 items-center">
				<span className="text-sm text-muted-foreground">Velocity:</span>
				<Slider
					min={5}
					max={50}
					value={[velocity]}
					className="flex-1"
					disabled={isPlaying}
					onValueChange={([v]) => setVelocity(v)}
				/>
				<span className="font-mono text-sm w-12">{velocity}m/s</span>
			</div>
			<div className="mt-2 flex gap-4 items-center">
				<span className="text-sm text-muted-foreground">Angle:</span>
				<Slider
					min={10}
					max={80}
					value={[theta]}
					className="flex-1"
					disabled={isPlaying}
					onValueChange={([v]) => setTheta(v)}
				/>
				<span className="font-mono text-sm w-12">{theta}°</span>
			</div>
		</div>
	);
}
