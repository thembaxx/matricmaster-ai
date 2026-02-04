import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/hooks/use-theme';
// import type { Screen } from '@/types'; // Removed unused import
import {
	Activity,
	Calculator,
	Languages,
	Microscope,
	Moon,
	Settings,
	Share2,
	Star,
	Sun,
	Verified,
} from 'lucide-react';
import { useState } from 'react';

const achievements = [
	{
		title: 'Calculus Master',
		icon: Calculator,
		color: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
	},
	{
		title: 'Physics Logic',
		icon: Microscope,
		color: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
	},
	{
		title: 'Essay Wizard',
		icon: Languages,
		color: 'text-green-400 bg-green-400/10 border-green-400/20',
	},
];

export default function Profile() {
	const { theme, setTheme } = useTheme();
	const [viewMode, setViewMode] = useState<'my_stats' | 'provincial'>('my_stats');

	return (
		<div className="flex flex-col h-full bg-white dark:bg-zinc-950 font-lexend">
			{/* Header */}
			<header className="px-6 pt-12 pb-4 sticky top-0 z-20 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl shrink-0">
				<div className="flex justify-between items-center max-w-2xl mx-auto w-full">
					<Button
						variant="ghost"
						size="icon"
						className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-full"
					>
						<Settings className="w-6 h-6" />
					</Button>
					<h1 className="text-lg font-bold text-zinc-900 dark:text-white">Profile</h1>
					<Button
						variant="ghost"
						size="icon"
						className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-full"
					>
						<Share2 className="w-6 h-6" />
					</Button>
				</div>
			</header>

			<ScrollArea className="flex-1">
				<main className="px-6 pb-32 pt-4 max-w-2xl mx-auto w-full">
					{/* Profile Header */}
					<div className="flex flex-col items-center mb-8">
						<div className="relative mb-6">
							<div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-20 scale-150" />
							<Avatar className="w-28 h-28 border-4 border-white dark:border-zinc-900 shadow-2xl relative z-10">
								<AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Thabo" />
								<AvatarFallback>TM</AvatarFallback>
							</Avatar>
							<div className="absolute bottom-1 right-1 w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center border-4 border-white dark:border-zinc-950 z-20">
								<Verified className="w-4 h-4 text-white" />
							</div>
						</div>
						<h2 className="text-3xl font-extrabold mb-1 text-zinc-900 dark:text-white">
							Thabo Mbeki
						</h2>
						<p className="text-zinc-500 dark:text-zinc-400 font-medium">
							St. John&apos;s College • Grade 12
						</p>
					</div>

					{/* View Toggle */}
					<div className="flex bg-zinc-100 dark:bg-zinc-900 p-1.5 rounded-2xl mb-12 max-w-sm mx-auto">
						<button
							type="button"
							onClick={() => setViewMode('my_stats')}
							className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
								viewMode === 'my_stats'
									? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-white shadow-sm'
									: 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
							}`}
						>
							My Stats
						</button>
						<button
							type="button"
							onClick={() => setViewMode('provincial')}
							className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
								viewMode === 'provincial'
									? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-white shadow-sm'
									: 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
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
							<div
								className="w-[80%] h-[80%] border border-zinc-700/50 absolute"
								style={{ clipPath: 'polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)' }}
							/>
							<div
								className="w-[60%] h-[60%] border border-zinc-700/50 absolute"
								style={{ clipPath: 'polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)' }}
							/>
							<div
								className="w-[40%] h-[40%] border border-zinc-700/50 absolute"
								style={{ clipPath: 'polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)' }}
							/>
							<div
								className="w-[20%] h-[20%] border border-zinc-700/50 absolute"
								style={{ clipPath: 'polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)' }}
							/>

							{/* Axis Lines */}
							<div className="absolute w-[80%] h-[1px] bg-zinc-700/30 rotate-0" />
							<div className="absolute w-[80%] h-[1px] bg-zinc-700/30 rotate-60" />
							<div className="absolute w-[80%] h-[1px] bg-zinc-700/30 rotate-120" />

							{/* Data Polygon */}
							<div
								className="w-[80%] h-[80%] bg-blue-500/20 border-2 border-blue-500 absolute shadow-[0_0_30px_rgba(59,130,246,0.2)]"
								style={{ clipPath: 'polygon(50% 5%, 90% 30%, 80% 80%, 50% 90%, 20% 80%, 10% 30%)' }}
							>
								{/* Data Points */}
								<div className="absolute top-[5%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-4 h-[18px] bg-blue-600/50 rounded flex items-center justify-center text-[8px] font-bold text-white">
									95%
								</div>
							</div>
						</div>

						{/* Labels */}
						<div className="absolute top-[5%] left-1/2 -translate-x-1/2 text-xs font-bold text-blue-400">
							MATH
						</div>
						<div className="absolute top-[28%] right-[5%] text-xs font-bold text-zinc-500">
							PHY SCI
						</div>
						<div className="absolute bottom-[28%] right-[5%] text-xs font-bold text-zinc-500">
							ENG FAL
						</div>
						<div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 text-xs font-bold text-zinc-500">
							LIFE OR.
						</div>
						<div className="absolute bottom-[28%] left-[5%] text-xs font-bold text-zinc-500">
							GEOG
						</div>
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
						<h3 className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-4">
							Skill Achievements
						</h3>
						<div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
							{achievements.map((item) => (
								<div
									key={item.title}
									className={`flex items-center gap-2 px-4 py-2 rounded-full border ${item.color} whitespace-nowrap`}
								>
									<item.icon className="w-4 h-4" />
									<span className="text-xs font-bold">{item.title}</span>
								</div>
							))}
						</div>
					</div>

					{/* Settings Section */}
					<div className="mb-10">
						<h3 className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-4">
							Preferences
						</h3>
						<div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 p-6 flex items-center justify-between">
							<div className="flex items-center gap-4">
								<div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
									{theme === 'dark' ? (
										<Moon className="w-6 h-6 text-purple-400" />
									) : (
										<Sun className="w-6 h-6 text-amber-500" />
									)}
								</div>
								<div>
									<h4 className="font-bold text-zinc-900 dark:text-white">Dark Mode</h4>
									<p className="text-xs text-zinc-500">Easier on the eyes</p>
								</div>
							</div>
							<Switch
								checked={theme === 'dark'}
								onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
							/>
						</div>
					</div>

					{/* Stats Cards */}
					<div className="grid grid-cols-2 gap-4">
						<div className="p-6 rounded-[2.5rem] bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 relative overflow-hidden group hover:scale-[1.02] transition-transform">
							<div className="relative z-10">
								<div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4">
									<Activity className="w-6 h-6 text-blue-500" />
								</div>
								<div className="text-4xl font-extrabold text-zinc-900 dark:text-white mb-1">
									78%
								</div>
								<div className="text-xs text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
									Overall Avg
								</div>
							</div>
							<div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-8 -mb-8 group-hover:bg-blue-500/10 transition-colors" />
						</div>

						<div className="p-6 rounded-[2.5rem] bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 relative overflow-hidden group hover:scale-[1.02] transition-transform">
							<div className="relative z-10">
								<div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-4">
									<Star className="w-6 h-6 text-purple-500" />
								</div>
								<div className="text-4xl font-extrabold text-zinc-900 dark:text-white mb-1">
									Math
								</div>
								<div className="text-xs text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
									Top Subject
								</div>
							</div>
							<div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl -mr-8 -mb-8 group-hover:bg-purple-500/10 transition-colors" />
						</div>
					</div>
				</main>
			</ScrollArea>
		</div>
	);
}
