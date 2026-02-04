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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/hooks/use-theme';

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
		<div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 font-inter">
			{/* Header - iOS-style sticky with safe area */}
			<header
				className="px-6 pb-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl sticky top-0 z-20 border-b border-zinc-100/50 dark:border-zinc-800/50 shrink-0 transition-all duration-200"
				style={{
					paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)',
				}}
			>
				<div className="flex justify-between items-center max-w-2xl mx-auto w-full">
					<Button
						variant="ghost"
						size="icon"
						className="rounded-full bg-zinc-100 dark:bg-zinc-800 relative w-12 h-12 transition-transform active:scale-90"
					>
						<Settings className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
					</Button>
					<h1 className="text-lg font-bold text-zinc-900 dark:text-white">Profile</h1>
					<Button
						variant="ghost"
						size="icon"
						className="rounded-full bg-zinc-100 dark:bg-zinc-800 relative w-12 h-12 transition-transform active:scale-90"
					>
						<Share2 className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
					</Button>
				</div>
			</header>

			{/* Content area with proper bottom spacing */}
			<ScrollArea className="flex-1">
				<main
					className="px-6 pb-28 pt-4 max-w-2xl mx-auto w-full"
					style={{
						paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 112px)',
					}}
				>
					{/* Profile Header */}
					<div className="flex flex-col items-center mb-8 relative">
						<div className="relative mb-4">
							{/* Background glow */}
							<div className="absolute inset-0 bg-blue-500 rounded-full blur-3xl opacity-20 scale-150" />
							<Avatar className="w-24 h-24 border-4 border-white dark:border-zinc-900 shadow-2xl relative z-10">
								<AvatarImage
									src="https://api.dicebear.com/7.x/avataaars/svg?seed=Thabo"
									className="rounded-full"
								/>
								<AvatarFallback className="text-lg font-bold">TM</AvatarFallback>
							</Avatar>
							{/* Verified badge */}
							<div className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center border-4 border-white dark:border-zinc-900 z-20">
								<Verified className="w-4 h-4 text-white" />
							</div>
						</div>
						<h2 className="text-3xl font-black text-zinc-900 dark:text-white mb-1">Thabo Mbeki</h2>
						<p className="text-base text-zinc-500 dark:text-zinc-400 font-medium text-center max-w-xs mx-auto leading-relaxed">
							St. John's College • Grade 12
						</p>
					</div>

					{/* View Toggle - Mobile-friendly */}
					<div className="flex justify-center mb-8">
						<div className="bg-zinc-100 dark:bg-zinc-900/50 rounded-2xl p-2 border border-zinc-200 dark:border-zinc-800 shadow-sm w-full max-w-sm">
							<button
								type="button"
								onClick={() => setViewMode('my_stats')}
								className={`flex-1 py-3 px-4 rounded-xl transition-all duration-200 ${
									viewMode === 'my_stats'
										? 'bg-blue-500 text-white shadow-lg shadow-blue/20'
										: 'bg-white dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700'
								}`}
							>
								<span className="font-bold">My Stats</span>
							</button>
							<button
								type="button"
								onClick={() => setViewMode('provincial')}
								className={`flex-1 py-3 px-4 rounded-xl transition-all duration-200 ${
									viewMode === 'provincial'
										? 'bg-purple-500 text-white shadow-lg shadow-purple/20'
										: 'bg-white dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700'
								}`}
							>
								<span className="font-bold">Provincial Avg</span>
							</button>
						</div>
					</div>

					{/* Radar Chart Visual - Responsive */}
					<div className="relative aspect-square max-w-[280px] mx-auto mb-8">
						{/* Background ring */}
						<div className="absolute inset-0 bg-zinc-200 dark:bg-zinc-800 rounded-full opacity-50" />

						{/* Grid Lines */}
						<div className="absolute inset-0 flex items-center justify-center">
							{/* Outer Hexagon */}
							<div className="w-[90%] h-[90%] border border-zinc-700/30 dark:border-zinc-300/30 absolute" />
							<div className="w-[65%] h-[65%] border border-zinc-700/30 dark:border-zinc-300/30 absolute" />
							<div className="w-[40%] h-[40%] border border-zinc-700/30 dark:border-zinc-300/30 absolute" />
							<div className="w-[20%] h-[20%] border border-zinc-700/30 dark:border-zinc-300/30 absolute" />

							{/* Axis Lines */}
							<div className="absolute w-[90%] h-[1px] bg-zinc-700/30 dark:bg-zinc-300/30 rotate-0" />
							<div className="absolute w-[90%] h-[1px] bg-zinc-700/30 dark:bg-zinc-300/30 rotate-60" />
							<div className="absolute w-[90%] h-[1px] bg-zinc-700/30 dark:bg-zinc-300/30 rotate-120" />

							{/* Data Polygon */}
							<div
								className="w-[85%] h-[85%] bg-blue-500/20 border-2 border-blue-500 absolute shadow-[0_4px_rgba(59,130,246,0.2)]"
								style={{ clipPath: 'polygon(50% 5%, 90% 30%, 80% 50%, 90% 20%, 80% 10% 30%)' }}
							>
								{/* Data Points */}
								<div className="absolute top-[8%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-blue-600/80 rounded-full flex items-center justify-center text-[12px] font-bold text-white shadow-lg">
									95%
								</div>
							</div>

							{/* Labels */}
							<div className="absolute top-[6%] left-1/2 text-[10px] font-bold text-blue-500 dark:text-blue-400">
								MATH
							</div>
							<div className="absolute top-[32%] right-1/2 text-[10px] font-bold text-zinc-500 dark:text-zinc-400">
								PHY SCI
							</div>
							<div className="absolute bottom-[32%] right-1/2 text-[10px] font-bold text-zinc-500 dark:text-zinc-400">
								ENG FAL
							</div>
							<div className="absolute bottom-[32%] left-1/2 text-[10px] font-bold text-zinc-500 dark:text-zinc-400">
								LIFE OR.
							</div>
							<div className="absolute bottom-[6%] left-1/2 text-[10px] font-bold text-zinc-500 dark:text-zinc-400">
								HIST
							</div>

							{/* Legend */}
							<div className="absolute -bottom-12 w-full flex justify-center gap-6 text-[10px] text-zinc-400 dark:text-zinc-500 px-6 py-3 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl">
								<div className="flex items-center gap-2">
									<span className="w-3 h-3 rounded-full bg-blue-500" /> You
								</div>
								<div className="flex items-center gap-2">
									<span className="w-3 h-3 rounded-full border border-zinc-500 dark:border-zinc-400" />{' '}
									Average
								</div>
							</div>
						</div>
					</div>

					{/* Achievements - Scrollable */}
					<div className="mb-6">
						<h3 className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-4">
							Skill Achievements
						</h3>
						<div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
							{achievements.map((item) => (
								<div
									key={item.title}
									className={`flex items-center gap-3 px-5 py-3 rounded-2xl border ${item.color} bg-white dark:bg-zinc-900 shrink-0`}
								>
									<item.icon className="w-5 h-5 flex-shrink-0" />
									<span className="text-sm font-bold text-zinc-900 dark:text-white truncate">
										{item.title}
									</span>
								</div>
							))}
						</div>
					</div>

					{/* Settings Section - Mobile-friendly */}
					<div className="mb-10">
						<h3 className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-4">
							Preferences
						</h3>
						<div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6">
							<div className="flex items-center justify-between gap-4">
								<div className="flex items-center gap-4">
									<div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
										{theme === 'dark' ? (
											<Moon className="w-7 h-7 text-purple-400" />
										) : (
											<Sun className="w-7 h-7 text-amber-500" />
										)}
									</div>
									<div>
										<h4 className="font-bold text-zinc-900 dark:text-white mb-1">Dark Mode</h4>
										<p className="text-xs text-zinc-500 dark:text-zinc-400">Easier on the eyes</p>
									</div>
								</div>
								<Switch
									checked={theme === 'dark'}
									onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
									className="shrink-0"
								/>
							</div>
						</div>
					</div>

					{/* Stats Cards - Responsive */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div className="p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all relative overflow-hidden group">
							<div className="relative z-10">
								<div className="flex items-center gap-3 mb-4">
									<div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
										<Activity className="w-6 h-6 text-blue-500" />
									</div>
									<div className="text-5xl font-black text-zinc-900 dark:text-white font-extrabold">
										78%
									</div>
								</div>
								<div className="text-xs text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
									Overall Avg
								</div>
							</div>
							<div className="absolute -bottom-2 -right-2 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl -mr-4 -mb-4 group-hover:bg-blue-500/30 group-hover:scale-110 transition-all" />
						</div>

						<div className="p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all relative overflow-hidden group">
							<div className="relative z-10">
								<div className="flex items-center gap-3 mb-4">
									<div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center">
										<Star className="w-6 h-6 text-purple-500" />
									</div>
									<div className="text-5xl font-black text-zinc-900 dark:text-white font-extrabold">
										Math
									</div>
								</div>
								<div className="text-xs text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
									Top Subject
								</div>
							</div>
							<div className="absolute -bottom-2 -right-2 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl -mr-4 -mb-4 group-hover:bg-purple-500/30 group-hover:scale-110 transition-all" />
						</div>
					</div>
				</main>
			</ScrollArea>
		</div>
	);
}
