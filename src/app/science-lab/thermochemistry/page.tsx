'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface Particle {
	x: number;
	y: number;
	vx: number;
	vy: number;
	temp: number;
}

export default function ThermochemistryPage() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const animationRef = useRef<number>(0);

	const [temp, setTemp] = useState(300);
	const [mass, setMass] = useState(100);
	const [specificHeat, setSpecificHeat] = useState(4.18);
	const [heatAdded, setHeatAdded] = useState(0);
	const [reactionType, setReactionType] = useState<'none' | 'endothermic' | 'exothermic'>('none');
	const [_enthalpy, _setEnthalpy] = useState(-285.8);
	const [isRunning, setIsRunning] = useState(false);
	const [particles, setParticles] = useState<Particle[]>([]);
	const [_showTempGraph, _setShowTempGraph] = useState(true);

	const _initialTemp = 25;
	const _finalTemp = _initialTemp + heatAdded / (mass * specificHeat);
	const tempChange = heatAdded / (mass * specificHeat);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const numParticles = Math.floor(mass / 10);

		if (particles.length !== numParticles) {
			const newParticles = Array.from({ length: numParticles }, () => ({
				x: Math.random() * canvas.width,
				y: Math.random() * canvas.height,
				vx: (Math.random() - 0.5) * (temp / 100),
				vy: (Math.random() - 0.5) * (temp / 100),
				temp: temp,
			}));
			setParticles(newParticles);
		}

		const update = () => {
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
			const hue = Math.max(0, 240 - (temp - 200) * 0.3);
			gradient.addColorStop(0, `hsl(${hue}, 70%, 95%)`);
			gradient.addColorStop(1, `hsl(${hue}, 70%, 85%)`);
			ctx.fillStyle = gradient;
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			ctx.strokeStyle = '#e5e5e5';
			ctx.lineWidth = 1;
			for (let i = 0; i < canvas.width; i += 30) {
				ctx.beginPath();
				ctx.moveTo(i, 0);
				ctx.lineTo(i, canvas.height);
				ctx.stroke();
			}
			for (let i = 0; i < canvas.height; i += 30) {
				ctx.beginPath();
				ctx.moveTo(0, i);
				ctx.lineTo(canvas.width, i);
				ctx.stroke();
			}

			const containerGradient = ctx.createRadialGradient(
				canvas.width / 2,
				canvas.height / 2,
				0,
				canvas.width / 2,
				canvas.height / 2,
				150
			);
			containerGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
			containerGradient.addColorStop(1, 'rgba(200, 200, 200, 0.5)');
			ctx.beginPath();
			ctx.arc(canvas.width / 2, canvas.height / 2, 150, 0, Math.PI * 2);
			ctx.fillStyle = containerGradient;
			ctx.fill();
			ctx.strokeStyle = '#666';
			ctx.lineWidth = 3;
			ctx.stroke();

			particles.forEach((p) => {
				const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
				const hue = Math.max(0, 200 - speed * 2);

				ctx.beginPath();
				ctx.arc(p.x, p.y, 4 + speed * 0.1, 0, Math.PI * 2);
				ctx.fillStyle = `hsl(${hue}, 80%, 60%)`;
				ctx.fill();
			});

			const centerX = canvas.width / 2;
			const centerY = canvas.height / 2;

			if (reactionType === 'exothermic') {
				const glow = Math.sin(Date.now() / 100) * 0.3 + 0.7;
				ctx.beginPath();
				ctx.arc(centerX, centerY, 100 + Math.random() * 20, 0, Math.PI * 2);
				ctx.fillStyle = `rgba(255, 100, 0, ${glow * 0.3})`;
				ctx.fill();

				for (let i = 0; i < 5; i++) {
					const angle = (Date.now() / 500 + i * 1.2) % (Math.PI * 2);
					const length = 30 + Math.random() * 30;
					ctx.beginPath();
					ctx.moveTo(centerX, centerY);
					ctx.lineTo(centerX + Math.cos(angle) * length, centerY + Math.sin(angle) * length);
					ctx.strokeStyle = `rgba(255, ${150 - i * 20}, 0, 0.8)`;
					ctx.lineWidth = 2;
					ctx.stroke();
				}
			} else if (reactionType === 'endothermic') {
				const frost = Math.sin(Date.now() / 200) * 0.2 + 0.3;
				ctx.beginPath();
				ctx.arc(centerX, centerY, 120, 0, Math.PI * 2);
				ctx.fillStyle = `rgba(100, 200, 255, ${frost})`;
				ctx.fill();

				ctx.font = '14px Geist, sans-serif';
				ctx.fillStyle = '#1e3a8a';
				ctx.textAlign = 'center';
				ctx.fillText('↓ Heat Absorbed', centerX, centerY - 60);
			}

			ctx.fillStyle = '#1e1e1e';
			ctx.font = '14px Geist Mono, monospace';
			ctx.textAlign = 'left';
			ctx.fillText(`T = ${temp.toFixed(1)} K`, 20, 30);
			ctx.fillText(`Q = ${heatAdded.toFixed(1)} J`, 20, 50);

			if (isRunning) {
				setParticles((prev) =>
					prev.map((p) => {
						let newVx = p.vx + (Math.random() - 0.5) * (temp / 5000);
						let newVy = p.vy + (Math.random() - 0.5) * (temp / 5000);

						const speed = Math.sqrt(newVx * newVx + newVy * newVy);
						const maxSpeed = temp / 100;
						if (speed > maxSpeed) {
							newVx = (newVx / speed) * maxSpeed;
							newVy = (newVy / speed) * maxSpeed;
						}

						let newX = p.x + newVx;
						let newY = p.y + newVy;

						const dx = newX - centerX;
						const dy = newY - centerY;
						const dist = Math.sqrt(dx * dx + dy * dy);
						if (dist > 145) {
							const angle = Math.atan2(dy, dx);
							newX = centerX + Math.cos(angle) * 145;
							newY = centerY + Math.sin(angle) * 145;
							newVx *= -0.8;
							newVy *= -0.8;
						}

						return { ...p, x: newX, y: newY, vx: newVx, vy: newVy };
					})
				);

				animationRef.current = requestAnimationFrame(update);
			}
		};

		update();

		return () => {
			if (animationRef.current) {
				cancelAnimationFrame(animationRef.current);
			}
		};
	}, [temp, mass, isRunning, particles.length, reactionType, heatAdded.toFixed, particles.forEach]);

	const simulateHeatTransfer = (targetTemp: number) => {
		setIsRunning(true);
		const steps = 20;
		const stepHeat = (mass * specificHeat * (targetTemp - temp)) / steps;

		let step = 0;
		const interval = setInterval(() => {
			if (step >= steps) {
				setIsRunning(false);
				clearInterval(interval);
				return;
			}
			setHeatAdded((prev) => prev + stepHeat);
			setTemp((prev) => prev + stepHeat / (mass * specificHeat));
			step++;
		}, 100);
	};

	const resetSimulation = () => {
		setTemp(300);
		setHeatAdded(0);
		setReactionType('none');
		setIsRunning(false);
		const canvas = canvasRef.current;
		if (canvas) {
			setParticles(
				Array.from({ length: Math.floor(mass / 10) }, () => ({
					x: Math.random() * canvas.width,
					y: Math.random() * canvas.height,
					vx: (Math.random() - 0.5) * (temp / 100),
					vy: (Math.random() - 0.5) * (temp / 100),
					temp: temp,
				}))
			);
		}
	};

	return (
		<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<div className="lg:col-span-2">
				<Card>
					<CardHeader>
						<CardTitle>Thermochemistry Simulation</CardTitle>
					</CardHeader>
					<CardContent>
						<canvas
							ref={canvasRef}
							width={500}
							height={350}
							className="w-full rounded-lg border border-border"
						/>
						<div className="flex gap-2 mt-4 flex-wrap">
							<Button onClick={() => simulateHeatTransfer(temp + 50)} variant="default">
								+50 K
							</Button>
							<Button onClick={() => simulateHeatTransfer(temp - 50)} variant="default">
								-50 K
							</Button>
							<Button onClick={resetSimulation} variant="outline">
								Reset
							</Button>
							<Button
								onClick={() =>
									setReactionType(reactionType === 'exothermic' ? 'none' : 'exothermic')
								}
								variant={reactionType === 'exothermic' ? 'default' : 'outline'}
							>
								Exothermic
							</Button>
							<Button
								onClick={() =>
									setReactionType(reactionType === 'endothermic' ? 'none' : 'endothermic')
								}
								variant={reactionType === 'endothermic' ? 'default' : 'outline'}
							>
								Endothermic
							</Button>
						</div>
					</CardContent>
				</Card>

				<Card className="mt-4">
					<CardHeader>
						<CardTitle>Temperature vs Time</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="h-40 bg-muted rounded-lg p-4 relative">
							<svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
								<line x1="0" y1="90" x2="400" y2="90" stroke="#666" strokeWidth="1" />
								<line x1="0" y1="0" x2="0" y2="90" stroke="#666" strokeWidth="1" />

								<text x="200" y="105" fill="#666" fontSize="10" textAnchor="middle">
									Time (s)
								</text>
								<text
									x="-5"
									y="50"
									fill="#666"
									fontSize="10"
									textAnchor="middle"
									transform="rotate(-90, -5, 50)"
								>
									Temperature (K)
								</text>

								{!isRunning && (
									<line
										x1="0"
										y1={90 - temp / 5}
										x2="400"
										y2={90 - temp / 5}
										stroke="#3b82f6"
										strokeWidth="2"
										strokeDasharray="5,5"
									/>
								)}
							</svg>
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
							<Label>Temperature: {temp.toFixed(1)} K</Label>
							<Slider
								value={[temp]}
								onValueChange={(v) => setTemp(v[0])}
								min={100}
								max={500}
								step={1}
							/>
						</div>

						<div>
							<Label>Mass of Water: {mass} g</Label>
							<Slider
								value={[mass]}
								onValueChange={(v) => setMass(v[0])}
								min={50}
								max={500}
								step={10}
							/>
						</div>

						<div>
							<Label>Specific Heat: {specificHeat} J/g·K</Label>
							<Slider
								value={[specificHeat]}
								onValueChange={(v) => setSpecificHeat(v[0])}
								min={1}
								max={10}
								step={0.1}
							/>
						</div>

						<div>
							<Label>Heat Added: {heatAdded.toFixed(1)} J</Label>
							<Slider
								value={[Math.min(heatAdded, 50000)]}
								onValueChange={(v) => setHeatAdded(v[0])}
								min={0}
								max={50000}
								step={100}
							/>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Calculations</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="bg-muted rounded-lg p-3">
							<div className="text-xs text-muted-foreground">q = mcΔT</div>
							<div className="text-lg font-mono font-bold">
								{heatAdded.toFixed(2)} J = {mass}g × {specificHeat} × ΔT
							</div>
						</div>

						<div className="bg-muted rounded-lg p-3">
							<div className="text-xs text-muted-foreground">ΔT = q / (mc)</div>
							<div className="text-lg font-mono font-bold">ΔT = {tempChange.toFixed(2)} K</div>
						</div>

						<div className="bg-muted rounded-lg p-3">
							<div className="text-xs text-muted-foreground">Final Temperature</div>
							<div className="text-lg font-mono font-bold">
								{_finalTemp.toFixed(2)} K ({Number(_finalTemp.toFixed(2)) - 273.15}°C)
							</div>
						</div>
					</CardContent>
				</Card>

				{reactionType !== 'none' && (
					<Card>
						<CardHeader>
							<CardTitle>
								{reactionType === 'exothermic' ? 'Combustion' : 'Photosynthesis'}
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div>
								<Label>ΔH = {_enthalpy} kJ/mol</Label>
							</div>
							<div className="text-sm">
								{reactionType === 'exothermic'
									? 'Heat is released to the surroundings. Energy flows out of the system.'
									: 'Heat is absorbed from the surroundings. Energy flows into the system.'}
							</div>
							<div className="font-mono text-sm bg-muted p-2 rounded">
								{reactionType === 'exothermic'
									? 'CH₄ + 2O₂ → CO₂ + 2H₂O + Energy'
									: '6CO₂ + 6H₂O + Energy → C₆H₁₂O₆ + 6O₂'}
							</div>
						</CardContent>
					</Card>
				)}

				<Card>
					<CardHeader>
						<CardTitle>Reference</CardTitle>
					</CardHeader>
					<CardContent className="text-sm space-y-2">
						<div>
							<strong>c</strong> = specific heat capacity (J/g·K)
						</div>
						<div>
							<strong>q</strong> = heat energy (J)
						</div>
						<div>
							<strong>m</strong> = mass (g)
						</div>
						<div>
							<strong>ΔT</strong> = temperature change (K or °C)
						</div>
						<div>
							<strong>ΔH</strong> = enthalpy change (kJ/mol)
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
