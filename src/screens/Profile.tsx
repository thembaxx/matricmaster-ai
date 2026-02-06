'use client';

import {
	Calculator,
	GraduationCap,
	Microscope,
	Settings,
	Share2,
	Star,
	Verified,
} from 'lucide-react';
import { useState } from 'react';
import {
	PolarAngleAxis,
	PolarGrid,
	PolarRadiusAxis,
	Radar,
	RadarChart,
	ResponsiveContainer,
} from 'recharts';

import { Button } from '@/components/ui/button';
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
		color: 'hsl(var(--brand-blue))',
	},
	average: {
		label: 'Average',
		color: 'hsl(var(--zinc-500))',
	},
} satisfies ChartConfig;

const achievements = [
	{
		title: 'Calculus Master',
		icon: Calculator,
		color: 'text-brand-blue border-brand-blue/30 bg-brand-blue/10',
	},
	{
		title: 'Physics Logic',
		icon: Microscope,
		color: 'text-brand-purple border-brand-purple/30 bg-brand-purple/10',
	},
];

export default function Profile() {
	const [viewMode, setViewMode] = useState<'my_stats' | 'provincial'>('my_stats');

	return (
		<div className="flex flex-col h-full bg-[#0a0f18] text-white font-lexend overflow-hidden">
			{/* Header */}
			<header
				className="px-6 pb-4 bg-[#0a0f18]/80 backdrop-blur-xl sticky top-0 z-20 shrink-0"
				style={{
					paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)',
				}}
			>
				<div className="flex justify-between items-center max-w-2xl mx-auto w-full">
					<Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10">
						<Settings className="w-6 h-6 text-zinc-400" />
					</Button>
					<h1 className="text-xl font-bold tracking-tight">Profile</h1>
					<Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10">
						<Share2 className="w-6 h-6 text-zinc-400" />
					</Button>
				</div>
			</header>

			<ScrollArea className="flex-1">
				<main className="px-6 pb-32 pt-4 max-w-2xl mx-auto w-full flex flex-col items-center">
					{/* Avatar Section */}
					<div className="relative mb-6">
						<div className="w-32 h-32 rounded-full overflow-hidden border-4 border-zinc-800 shadow-2xl relative bg-zinc-800">
							<img
								src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
								alt="Thabo Mbeki"
								className="w-full h-full object-cover"
							/>
						</div>
						<div className="absolute bottom-1 right-1 bg-brand-blue rounded-full p-1.5 border-4 border-[#0a0f18]">
							<Verified className="w-4 h-4 text-white fill-white/20" />
						</div>
					</div>

					<div className="text-center mb-8">
						<h2 className="text-3xl font-black mb-1">Thabo Mbeki</h2>
						<p className="text-zinc-400 font-medium">St. John&apos;s College • Grade 12</p>
					</div>

					{/* Tabs */}
					<div className="w-full max-w-sm bg-zinc-900/50 p-1.5 rounded-2xl flex mb-12 border border-zinc-800">
						<button
							type="button"
							onClick={() => setViewMode('my_stats')}
							className={`flex-1 py-2.5 rounded-xl font-bold transition-all ${
								viewMode === 'my_stats'
									? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20'
									: 'text-zinc-500 hover:text-zinc-300'
							}`}
						>
							My Stats
						</button>
						<button
							type="button"
							onClick={() => setViewMode('provincial')}
							className={`flex-1 py-2.5 rounded-xl font-bold transition-all ${
								viewMode === 'provincial'
									? 'bg-zinc-800 text-white'
									: 'text-zinc-500 hover:text-zinc-300'
							}`}
						>
							vs. Provincial Avg
						</button>
					</div>

					{/* Radar Chart */}
					<div className="w-full max-w-md aspect-square relative mb-12">
						<ChartContainer config={chartConfig} className="w-full h-full min-h-[300px]">
							<ResponsiveContainer width="100%" height="100%">
								<RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
									<ChartTooltip cursor={false} content={<ChartTooltipContent />} />
									<PolarGrid stroke="#1f2937" />
									<PolarAngleAxis
										dataKey="subject"
										tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
									/>
									<PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
									<Radar
										name="You"
										dataKey="you"
										stroke="var(--color-you)"
										fill="var(--color-you)"
										fillOpacity={0.6}
										isAnimationActive={false}
										dot={{
											r: 4,
											fill: 'var(--color-you)',
											fillOpacity: 1,
										}}
									/>
									<Radar
										name="Average"
										dataKey="average"
										stroke="var(--color-average)"
										fill="transparent"
										strokeDasharray="4 4"
										isAnimationActive={false}
									/>
								</RadarChart>
							</ResponsiveContainer>
						</ChartContainer>

						{/* Highlight 95% on Math */}
						<div className="absolute top-[12%] left-1/2 -translate-x-1/2 bg-brand-blue text-[10px] font-black px-2 py-1 rounded-md shadow-lg z-10">
							95%
						</div>

						{/* Legend */}
						<div className="flex justify-center gap-6 mt-4">
							<div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
								<span className="w-2 h-2 rounded-full bg-brand-blue" />
								You
							</div>
							<div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
								<span className="w-2 h-2 rounded-full border border-zinc-600" />
								Average
							</div>
						</div>
					</div>

					{/* Achievements */}
					<div className="w-full mb-10">
						<h3 className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-4">
							Skill Achievements
						</h3>
						<div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
							{achievements.map((item) => (
								<div
									key={item.title}
									className={`flex items-center gap-3 px-6 py-3.5 rounded-3xl border-2 ${item.color} shrink-0`}
								>
									<item.icon className="w-5 h-5" />
									<span className="font-black text-sm">{item.title}</span>
								</div>
							))}
						</div>
					</div>

					{/* Stats Cards */}
					<div className="grid grid-cols-2 gap-4 w-full">
						<div className="bg-zinc-900/50 p-6 rounded-[2rem] border border-zinc-800 relative overflow-hidden group">
							<div className="relative z-10 flex flex-col gap-4">
								<div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center">
									<GraduationCap className="w-6 h-6 text-brand-blue" />
								</div>
								<div>
									<div className="text-4xl font-black mb-1">78%</div>
									<div className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">
										Overall Average
									</div>
								</div>
							</div>
						</div>

						<div className="bg-zinc-900/50 p-6 rounded-[2rem] border border-zinc-800 relative overflow-hidden group">
							<div className="relative z-10 flex flex-col gap-4">
								<div className="w-10 h-10 rounded-xl bg-brand-purple/10 flex items-center justify-center">
									<Star className="w-6 h-6 text-brand-purple" />
								</div>
								<div>
									<div className="text-4xl font-black mb-1">Math</div>
									<div className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">
										Top Subject
									</div>
								</div>
							</div>
						</div>
					</div>
				</main>
			</ScrollArea>
		</div>
	);
}
