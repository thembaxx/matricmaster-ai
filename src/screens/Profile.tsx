import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Screen } from '@/types';
import {
	Activity,
	Calculator,
	Languages,
	Microscope,
	Settings,
	Share2,
	Star,
	Verified,
} from 'lucide-react';
import { useState } from 'react';

interface ProfileProps {
	onNavigate: (s: Screen) => void;
}

const achievements = [
	{ title: 'Calculus Master', icon: Calculator, color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
	{ title: 'Physics Logic', icon: Microscope, color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
	{ title: 'Essay Wizard', icon: Languages, color: 'text-green-400 bg-green-400/10 border-green-400/20' },
];

export default function Profile({ onNavigate: _ }: ProfileProps) {
	const [viewMode, setViewMode] = useState<'my_stats' | 'provincial'>('my_stats');

	return (
		<div className="flex flex-col min-h-screen bg-[#0f172a] text-white">
			{/* Header */}
			<header className="px-6 pt-12 pb-4 sticky top-0 z-20">
				<div className="flex justify-between items-center">
					<Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
						<Settings className="w-6 h-6" />
					</Button>
					<h1 className="text-lg font-bold">Profile</h1>
					<Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
						<Share2 className="w-6 h-6" />
					</Button>
				</div>
			</header>

			<ScrollArea className="flex-1">
				<main className="px-6 pb-28 pt-4">
					{/* Profile Header */}
					<div className="flex flex-col items-center mb-8">
						<div className="relative mb-4">
							<Avatar className="w-24 h-24 border-4 border-[#1e293b] shadow-xl">
								<AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Thabo" />
								<AvatarFallback>TM</AvatarFallback>
							</Avatar>
							<div className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center border-4 border-[#0f172a]">
								<Verified className="w-4 h-4 text-white" />
							</div>
						</div>
						<h2 className="text-2xl font-bold mb-1">Thabo Mbeki</h2>
						<p className="text-zinc-400 text-sm">St. John&apos;s College • Grade 12</p>
					</div>

					{/* View Toggle */}
					<div className="flex bg-[#1e293b] p-1 rounded-xl mb-10 max-w-sm mx-auto">
						<button
							type="button"
							onClick={() => setViewMode('my_stats')}
							className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
								viewMode === 'my_stats'
									? 'bg-blue-600 text-white shadow-lg'
									: 'text-zinc-400 hover:text-zinc-200'
							}`}
						>
							My Stats
						</button>
						<button
							type="button"
							onClick={() => setViewMode('provincial')}
							className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
								viewMode === 'provincial'
									? 'bg-blue-600 text-white shadow-lg'
									: 'text-zinc-400 hover:text-zinc-200'
							}`}
						>
							vs. Provincial Avg
						</button>
					</div>

					{/* Radar Chart Visual */}
					<div className="relative aspect-square max-w-sm mx-auto mb-10">
						{/* Grid Lines */}
						<div className="absolute inset-0 flex items-center justify-center">
							{/* Outer Hexagon */}
							<div className="w-[80%] h-[80%] border border-zinc-700/50 absolute" style={{ clipPath: 'polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)' }} />
							<div className="w-[60%] h-[60%] border border-zinc-700/50 absolute" style={{ clipPath: 'polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)' }} />
							<div className="w-[40%] h-[40%] border border-zinc-700/50 absolute" style={{ clipPath: 'polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)' }} />
							<div className="w-[20%] h-[20%] border border-zinc-700/50 absolute" style={{ clipPath: 'polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)' }} />
							
							{/* Axis Lines */}
							<div className="absolute w-[80%] h-[1px] bg-zinc-700/30 rotate-0" />
							<div className="absolute w-[80%] h-[1px] bg-zinc-700/30 rotate-60" />
							<div className="absolute w-[80%] h-[1px] bg-zinc-700/30 rotate-120" />
							
							{/* Data Polygon */}
							<div className="w-[80%] h-[80%] bg-blue-500/20 border-2 border-blue-500 absolute shadow-[0_0_30px_rgba(59,130,246,0.2)]" style={{ clipPath: 'polygon(50% 5%, 90% 30%, 80% 80%, 50% 90%, 20% 80%, 10% 30%)' }}>
								{/* Data Points */}
								<div className="absolute top-[5%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-4 h-[18px] bg-blue-600/50 rounded flex items-center justify-center text-[8px] font-bold">95%</div>
							</div>
						</div>

						{/* Labels */}
						<div className="absolute top-[5%] left-1/2 -translate-x-1/2 text-xs font-bold text-blue-400">MATH</div>
						<div className="absolute top-[28%] right-[5%] text-xs font-bold text-zinc-500">PHY SCI</div>
						<div className="absolute bottom-[28%] right-[5%] text-xs font-bold text-zinc-500">ENG FAL</div>
						<div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 text-xs font-bold text-zinc-500">LIFE OR.</div>
						<div className="absolute bottom-[28%] left-[5%] text-xs font-bold text-zinc-500">GEOG</div>
						<div className="absolute top-[28%] left-[5%] text-xs font-bold text-zinc-500">HIST</div>
						
						{/* Legend */}
						<div className="absolute -bottom-6 w-full flex justify-center gap-6 text-xs text-zinc-400">
							<div className="flex items-center gap-2">
								<span className="w-2 h-2 rounded-full bg-blue-500" /> You
							</div>
							<div className="flex items-center gap-2">
								<span className="w-2 h-2 rounded-full border border-zinc-500" /> Average
							</div>
						</div>
					</div>

					{/* Achievements */}
					<div className="mb-6">
						<h3 className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-4">Skill Achievements</h3>
						<div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
							{achievements.map((item) => (
								<div key={item.title} className={`flex items-center gap-2 px-4 py-2 rounded-full border ${item.color} whitespace-nowrap`}>
									<item.icon className="w-4 h-4" />
									<span className="text-xs font-bold">{item.title}</span>
								</div>
							))}
						</div>
					</div>

					{/* Stats Cards */}
					<div className="grid grid-cols-2 gap-4">
						<div className="p-5 rounded-3xl bg-[#1e293b] border border-blue-500/20 relative overflow-hidden">
							<div className="relative z-10">
								<div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center mb-3">
									<Activity className="w-5 h-5 text-blue-400" />
								</div>
								<div className="text-3xl font-bold text-white mb-1">78%</div>
								<div className="text-xs text-blue-300 font-medium">Overall Average</div>
							</div>
							<div className="absolute bottom-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -mr-6 -mb-6" />
						</div>

						<div className="p-5 rounded-3xl bg-[#1e293b] border border-zinc-800 relative overflow-hidden">
							<div className="relative z-10">
								<div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center mb-3">
									<Star className="w-5 h-5 text-purple-400" />
								</div>
								<div className="text-3xl font-bold text-white mb-1">Math</div>
								<div className="text-xs text-zinc-400 font-medium">Top Subject</div>
							</div>
							<div className="absolute bottom-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl -mr-6 -mb-6" />
						</div>
					</div>

				</main>
			</ScrollArea>
		</div>
	);
}
