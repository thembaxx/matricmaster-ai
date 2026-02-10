'use client';

import { Calculator, GraduationCap, Star, User } from 'lucide-react';
import { useState } from 'react';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from 'recharts';

import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from '@/components/ui/chart';
import { ScrollArea } from '@/components/ui/scroll-area';

const chartData = [
	{ subject: 'MATH', you: 95, average: 70 },
	{ subject: 'PHY SCI', you: 85, average: 75 },
	{ subject: 'ENG FAL', you: 75, average: 65 },
	{ subject: 'LIFE OR.', you: 65, average: 60 },
	{ subject: 'GEOG', you: 70, average: 65 },
	{ subject: 'ACC', you: 85, average: 75 },
	{ subject: 'HIST', you: 80, average: 70 },
];

const chartConfig = {
	you: {
		label: 'You',
		color: '#22d3ee',
	},
	average: {
		label: 'Average',
		color: '#64748b',
	},
} satisfies ChartConfig;

const achievements = [
	{
		title: 'Calculus Master',
		icon: Calculator,
		variant: 'blue' as const,
	},
	{
		title: 'Physics Logic',
		icon: User,
		variant: 'purple' as const,
	},
];

export default function Profile() {
	const [viewMode, setViewMode] = useState<'my_stats' | 'provincial'>('my_stats');

	return (
		<div className="p-4 bg-background">
			<div className="flex flex-col h-full overflow-hidden rounded-4xl bg-card">
				<ScrollArea className="flex-1">
					<main
						className="px-6 pb-40 pt-4 max-w-2xl mx-auto w-full flex flex-col items-center"
						style={{
							paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 160px)',
						}}
					>
						{/* Avatar Section */}
						<div className="relative mb-4">
							<div
								className="w-28 h-28 rounded-full overflow-hidden shadow-2xl relative"
								style={{ border: '4px solid #1e293b' }}
							>
								{/* biome-ignore lint/performance/noImgElement: User avatar from external source */}
								<img
									src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face"
									alt="Thabo Mbeki"
									className="w-full h-full object-cover"
								/>
							</div>
							<div
								className="absolute bottom-0 right-0 rounded-full p-1"
								style={{ backgroundColor: '#22d3ee', border: '3px solid #0a0f18' }}
							>
								<svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
									<title>Verified Badge</title>
									<path
										fillRule="evenodd"
										d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
										clipRule="evenodd"
									/>
								</svg>
							</div>
						</div>

						<div className="text-center mb-6">
							<h2 className="text-2xl font-bold mb-1 text-foreground">Thabo Mbeki</h2>
							<p className="text-sm text-muted-foreground">St. John's College • Grade 12</p>
						</div>

						{/* Tabs - Segmented Control */}
						<div className="w-full max-w-xs p-1 rounded-full flex mb-8 bg-muted">
							<button
								type="button"
								onClick={() => setViewMode('my_stats')}
								className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
									viewMode === 'my_stats' ? 'text-white' : 'text-muted-foreground'
								}`}
								style={{
									backgroundColor: viewMode === 'my_stats' ? '#2563eb' : 'transparent',
								}}
							>
								My Stats
							</button>
							<button
								type="button"
								onClick={() => setViewMode('provincial')}
								className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
									viewMode === 'provincial' ? 'text-white' : 'text-muted-foreground'
								}`}
								style={{
									backgroundColor: viewMode === 'provincial' ? '#2563eb' : 'transparent',
								}}
							>
								vs. Provincial Avg
							</button>
						</div>

						{/* Radar Chart */}
						<div className="w-full max-w-sm aspect-square relative mb-6">
							<ChartContainer config={chartConfig} className="min-w-0 min-h-0 w-full h-full">
								<RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
									<defs>
										<linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
											<stop offset="0%" stopColor="#22d3ee" stopOpacity={0.8} />
											<stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.3} />
										</linearGradient>
										<filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
											<feGaussianBlur stdDeviation="3" result="coloredBlur" />
											<feMerge>
												<feMergeNode in="coloredBlur" />
												<feMergeNode in="SourceGraphic" />
											</feMerge>
										</filter>
									</defs>
									<ChartTooltip cursor={false} content={<ChartTooltipContent />} />
									<PolarGrid stroke="#1e3a5f" strokeOpacity={0.6} />
									<PolarAngleAxis
										dataKey="subject"
										tick={{ fill: 'currentColor', fontSize: 11, fontWeight: 600 }}
										className="text-muted-foreground"
										tickLine={false}
									/>
									<Radar
										name="You"
										dataKey="you"
										stroke="#22d3ee"
										strokeWidth={2}
										fill="url(#radarGradient)"
										fillOpacity={0.6}
										filter="url(#glow)"
										dot={{
											r: 5,
											fill: '#22d3ee',
											fillOpacity: 1,
											stroke: 'hsl(var(--card))',
											strokeWidth: 2,
										}}
									/>
									{viewMode === 'provincial' && (
										<Radar
											name="Average"
											dataKey="average"
											stroke="#64748b"
											strokeWidth={1.5}
											fill="transparent"
											strokeDasharray="4 4"
										/>
									)}
								</RadarChart>
							</ChartContainer>

							{/* Highlight 95% on Math */}
							<div
								className="absolute top-[15%] left-1/2 -translate-x-1/2 text-xs font-bold px-2.5 py-1 rounded-lg shadow-lg z-10"
								style={{
									backgroundColor: '#22d3ee',
									color: '#0a0f18',
								}}
							>
								95%
							</div>
						</div>

						{/* Legend */}
						<div className="flex justify-center gap-6 mb-8">
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#22d3ee' }} />
								You
							</div>
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<span
									className="w-2.5 h-2.5 rounded-full"
									style={{ border: '1.5px solid #64748b', backgroundColor: 'transparent' }}
								/>
								Average
							</div>
						</div>

						{/* Achievements */}
						<div className="w-full mb-8">
							<h3 className="text-xs font-bold uppercase tracking-wider mb-4 text-muted-foreground">
								Skill Achievements
							</h3>
							<div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
								{achievements.map((item) => (
									<div
										key={item.title}
										className="flex items-center gap-2.5 px-5 py-3 rounded-full shrink-0"
										style={{
											backgroundColor:
												item.variant === 'blue'
													? 'rgba(34, 211, 238, 0.15)'
													: 'rgba(168, 85, 247, 0.15)',
											border: `1.5px solid ${item.variant === 'blue' ? 'rgba(34, 211, 238, 0.3)' : 'rgba(168, 85, 247, 0.3)'}`,
										}}
									>
										<item.icon
											className="w-4 h-4"
											style={{ color: item.variant === 'blue' ? '#22d3ee' : '#a855f7' }}
										/>
										<span
											className="font-semibold text-sm"
											style={{ color: item.variant === 'blue' ? '#22d3ee' : '#a855f7' }}
										>
											{item.title}
										</span>
									</div>
								))}
							</div>
						</div>

						{/* Stats Cards */}
						<div className="grid grid-cols-2 gap-4 w-full">
							<div className="p-5 rounded-2xl bg-muted">
								<div className="flex flex-col gap-3">
									<div
										className="w-10 h-10 rounded-xl flex items-center justify-center"
										style={{ backgroundColor: 'rgba(34, 211, 238, 0.15)' }}
									>
										<GraduationCap className="w-5 h-5" style={{ color: '#22d3ee' }} />
									</div>
									<div>
										<div className="text-3xl font-bold text-foreground">78%</div>
										<div className="text-xs font-medium mt-1 text-muted-foreground">
											Overall Average
										</div>
									</div>
								</div>
							</div>

							<div className="p-5 rounded-2xl bg-muted">
								<div className="flex flex-col gap-3">
									<div
										className="w-10 h-10 rounded-xl flex items-center justify-center"
										style={{ backgroundColor: 'rgba(168, 85, 247, 0.15)' }}
									>
										<Star className="w-5 h-5" style={{ color: '#a855f7' }} />
									</div>
									<div>
										<div className="text-3xl font-bold text-foreground">Math</div>
										<div className="text-xs font-medium mt-1 text-muted-foreground">
											Top Subject
										</div>
									</div>
								</div>
							</div>
						</div>
					</main>
				</ScrollArea>
			</div>
		</div>
	);
}
