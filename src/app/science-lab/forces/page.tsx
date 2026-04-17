'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface PhysicsObject {
	x: number;
	y: number;
	vx: number;
	vy: number;
	mass: number;
	color: string;
}

export default function ForcesPage() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const animationRef = useRef<number>(0);

	const [gravity, setGravity] = useState(9.8);
	const [appliedForce, setAppliedForce] = useState(0);
	const [friction, setFriction] = useState(0.1);
	const [isRunning, setIsRunning] = useState(false);
	const [objects, setObjects] = useState<PhysicsObject[]>([
		{ x: 200, y: 150, vx: 0, vy: 0, mass: 2, color: '#3b82f6' },
	]);
	const [showForces, setShowForces] = useState(true);
	const [trails, setTrails] = useState<{ x: number; y: number }[][]>([]);

	const resetSimulation = useCallback(() => {
		setObjects([{ x: 200, y: 150, vx: 0, vy: 0, mass: 2, color: '#3b82f6' }]);
		setTrails([]);
	}, []);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const update = () => {
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			ctx.fillStyle = '#f5f5f5';
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			ctx.strokeStyle = '#e5e5e5';
			ctx.lineWidth = 1;
			for (let i = 0; i < canvas.width; i += 40) {
				ctx.beginPath();
				ctx.moveTo(i, 0);
				ctx.lineTo(i, canvas.height);
				ctx.stroke();
			}
			for (let i = 0; i < canvas.height; i += 40) {
				ctx.beginPath();
				ctx.moveTo(0, i);
				ctx.lineTo(canvas.width, i);
				ctx.stroke();
			}

			ctx.strokeStyle = '#3d3d3d';
			ctx.lineWidth = 3;
			ctx.beginPath();
			ctx.moveTo(0, canvas.height - 50);
			ctx.lineTo(canvas.width, canvas.height - 50);
			ctx.stroke();

			objects.forEach((obj, idx) => {
				const radius = obj.mass * 15;

				if (trails[idx]) {
					ctx.beginPath();
					ctx.strokeStyle = `${obj.color}40`;
					ctx.lineWidth = 2;
					trails[idx].forEach((point, i) => {
						if (i === 0) ctx.moveTo(point.x, point.y);
						else ctx.lineTo(point.x, point.y);
					});
					ctx.stroke();
				}

				ctx.beginPath();
				ctx.arc(obj.x, obj.y, radius, 0, Math.PI * 2);
				ctx.fillStyle = obj.color;
				ctx.fill();
				ctx.strokeStyle = '#1e3a8a';
				ctx.lineWidth = 2;
				ctx.stroke();

				if (showForces) {
					const gravityY = gravity * obj.mass * 3;
					ctx.beginPath();
					ctx.strokeStyle = '#dc2626';
					ctx.lineWidth = 2;
					ctx.moveTo(obj.x, obj.y);
					ctx.lineTo(obj.x, obj.y + gravityY);
					ctx.stroke();
					ctx.fillStyle = '#dc2626';
					ctx.beginPath();
					ctx.moveTo(obj.x, obj.y + gravityY + 10);
					ctx.lineTo(obj.x - 5, obj.y + gravityY);
					ctx.lineTo(obj.x + 5, obj.y + gravityY);
					ctx.closePath();
					ctx.fill();

					if (appliedForce !== 0) {
						const forceX = appliedForce * 5;
						ctx.beginPath();
						ctx.strokeStyle = '#16a34a';
						ctx.lineWidth = 2;
						ctx.moveTo(obj.x, obj.y);
						ctx.lineTo(obj.x + forceX, obj.y);
						ctx.stroke();
						ctx.fillStyle = '#16a34a';
						ctx.beginPath();
						if (appliedForce > 0) {
							ctx.moveTo(obj.x + forceX + 10, obj.y);
							ctx.lineTo(obj.x + forceX, obj.y - 5);
							ctx.lineTo(obj.x + forceX, obj.y + 5);
						} else {
							ctx.moveTo(obj.x + forceX - 10, obj.y);
							ctx.lineTo(obj.x + forceX, obj.y - 5);
							ctx.lineTo(obj.x + forceX, obj.y + 5);
						}
						ctx.closePath();
						ctx.fill();
					}
				}

				ctx.fillStyle = '#1e1e1e';
				ctx.font = '12px Geist, sans-serif';
				ctx.textAlign = 'center';
				ctx.fillText(`m=${obj.mass}kg`, obj.x, obj.y - radius - 10);
			});
		};

		if (isRunning) {
			const animate = () => {
				setObjects((prev) =>
					prev.map((obj) => {
						const groundY = canvas.height - 50;
						const radius = obj.mass * 15;

						let newVy = obj.vy + gravity * 0.016;
						let newVx = obj.vx;

						if (appliedForce !== 0) {
							newVx += (appliedForce / obj.mass) * 0.016;
						}

						newVx *= 1 - friction * 0.1;
						newVy *= 1 - friction * 0.05;

						let newY = obj.y + newVy;
						let newX = obj.x + newVx;

						if (newY + radius >= groundY) {
							newY = groundY - radius;
							newVy = -newVy * 0.6;
							if (Math.abs(newVy) < 0.5) newVy = 0;
						}

						if (newX - radius < 0) {
							newX = radius;
							newVx = -newVx * 0.8;
						}
						if (newX + radius > canvas.width) {
							newX = canvas.width - radius;
							newVx = -newVx * 0.8;
						}

						return { ...obj, x: newX, y: newY, vx: newVx, vy: newVy };
					})
				);

				setTrails((prev) => {
					const newTrails = [...prev];
					newTrails[0] = [...(newTrails[0] || []), { x: objects[0].x, y: objects[0].y }];
					if (newTrails[0].length > 50) newTrails[0].shift();
					return newTrails;
				});

				update();
				animationRef.current = requestAnimationFrame(animate);
			};
			animate();
		} else {
			update();
		}

		return () => {
			if (animationRef.current) {
				cancelAnimationFrame(animationRef.current);
			}
		};
	}, [isRunning, objects, gravity, appliedForce, friction, showForces, trails]);

	const currentAcceleration = gravity + appliedForce / objects[0].mass;
	const netForce = gravity * objects[0].mass + appliedForce;

	return (
		<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<div className="lg:col-span-2">
				<Card>
					<CardHeader>
						<CardTitle>Forces & Motion Simulation</CardTitle>
					</CardHeader>
					<CardContent>
						<canvas
							ref={canvasRef}
							width={600}
							height={400}
							className="w-full rounded-lg border border-border"
						/>
						<div className="flex gap-2 mt-4">
							<Button onClick={() => setIsRunning(!isRunning)} variant="default">
								{isRunning ? 'Pause' : 'Start'}
							</Button>
							<Button onClick={resetSimulation} variant="outline">
								Reset
							</Button>
							<Button
								onClick={() => setShowForces(!showForces)}
								variant={showForces ? 'default' : 'outline'}
							>
								Show Forces
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>

			<div className="space-y-4">
				<Card>
					<CardHeader>
						<CardTitle>Parameters</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						<div>
							<Label>Gravity: {gravity.toFixed(1)} m/s²</Label>
							<Slider
								value={[gravity]}
								onValueChange={(v) => setGravity(v[0])}
								min={0}
								max={20}
								step={0.1}
							/>
						</div>

						<div>
							<Label>Applied Force: {appliedForce} N</Label>
							<Slider
								value={[appliedForce + 10]}
								onValueChange={(v) => setAppliedForce(v[0] - 10)}
								min={0}
								max={20}
								step={1}
							/>
						</div>

						<div>
							<Label>Friction: {friction.toFixed(2)}</Label>
							<Slider
								value={[friction * 100]}
								onValueChange={(v) => setFriction(v[0] / 100)}
								min={0}
								max={50}
								step={1}
							/>
						</div>

						<div>
							<Label>Object Mass: {objects[0].mass} kg</Label>
							<Slider
								value={[objects[0].mass]}
								onValueChange={(v) => setObjects([{ ...objects[0], mass: v[0] }])}
								min={0.5}
								max={5}
								step={0.5}
							/>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Calculated Values</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-2 gap-4">
							<div className="bg-muted rounded-lg p-3">
								<div className="text-xs text-muted-foreground">Acceleration</div>
								<div className="text-lg font-mono font-bold">
									{currentAcceleration.toFixed(2)} m/s²
								</div>
							</div>
							<div className="bg-muted rounded-lg p-3">
								<div className="text-xs text-muted-foreground">Net Force</div>
								<div className="text-lg font-mono font-bold">{netForce.toFixed(2)} N</div>
							</div>
							<div className="bg-muted rounded-lg p-3">
								<div className="text-xs text-muted-foreground">Velocity X</div>
								<div className="text-lg font-mono font-bold">{objects[0].vx.toFixed(2)} m/s</div>
							</div>
							<div className="bg-muted rounded-lg p-3">
								<div className="text-xs text-muted-foreground">Velocity Y</div>
								<div className="text-lg font-mono font-bold">{objects[0].vy.toFixed(2)} m/s</div>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Legend</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2 text-sm">
						<div className="flex items-center gap-2">
							<div className="w-3 h-3 rounded-full bg-red-600" />
							<span>Weight (mg)</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="w-3 h-3 rounded-full bg-green-600" />
							<span>Applied Force</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="w-3 h-3 rounded-full bg-blue-500" />
							<span>Object</span>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
