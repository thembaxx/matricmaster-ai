import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import type { Screen } from '@/types';
import { Award, BarChart3, Settings, Share2, Star, TrendingUp, Verified } from 'lucide-react';
import { useState } from 'react';

interface ProfileProps {
	onNavigate: (s: Screen) => void;
}

const skillAchievements = ['Calculus Master', 'Physics Logic', 'Essay Wizard', 'Top 5%'];

export default function Profile({ onNavigate }: ProfileProps) {
	const [showProvincialAvg, setShowProvincialAvg] = useState(false);

	return (
		<div className="flex flex-col min-h-screen bg-background">
			{/* Header */}
			<header className="px-6 pt-12 pb-4 bg-white dark:bg-zinc-900 sticky top-0 z-20 border-b border-zinc-100 dark:border-zinc-800">
				<div className="flex justify-between items-center">
					<h1 className="text-xl font-bold text-zinc-900 dark:text-white">Profile</h1>
					<div className="flex gap-2">
						<Button variant="ghost" size="icon">
							<Settings className="w-5 h-5" />
						</Button>
						<Button variant="ghost" size="icon">
							<Share2 className="w-5 h-5" />
						</Button>
					</div>
				</div>
			</header>

			<ScrollArea className="flex-1">
				<main className="px-6 py-6 space-y-6 pb-24">
					{/* Profile Info */}
					<div className="text-center">
						<div className="relative inline-block">
							<Avatar className="w-24 h-24 border-4 border-white dark:border-zinc-800 shadow-lg">
								<AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Thabo" />
								<AvatarFallback className="text-2xl">TM</AvatarFallback>
							</Avatar>
							<div className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-800">
								<Verified className="w-4 h-4 text-white" />
							</div>
						</div>
						<h2 className="text-2xl font-bold text-zinc-900 dark:text-white mt-4">Thabo Mbeki</h2>
						<p className="text-sm text-zinc-500">St. John's College • Grade 12</p>
					</div>

					{/* Stats Toggle */}
					<div className="flex items-center justify-center gap-4">
						<span
							className={`text-sm font-medium ${!showProvincialAvg ? 'text-zinc-900 dark:text-white' : 'text-zinc-500'}`}
						>
							My Stats
						</span>
						<Switch checked={showProvincialAvg} onCheckedChange={setShowProvincialAvg} />
						<span
							className={`text-sm font-medium ${showProvincialAvg ? 'text-zinc-900 dark:text-white' : 'text-zinc-500'}`}
						>
							Provincial Avg
						</span>
					</div>

					{/* Radar Chart Placeholder */}
					<Card className="p-6">
						<h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4">
							Subject Performance
						</h3>
						<div className="relative h-64 flex items-center justify-center">
							{/* Simple Radar Chart Visualization */}
							<div className="relative w-48 h-48">
								{/* Background pentagons */}
								{[20, 40, 60, 80, 100].map((size) => (
									<div
										key={size}
										className="absolute top-1/2 left-1/2 border border-zinc-200 dark:border-zinc-700"
										style={{
											width: `${size}%`,
											height: `${size}%`,
											transform: 'translate(-50%, -50%)',
											clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
										}}
									/>
								))}
								{/* Data polygon */}
								<div
									className="absolute top-1/2 left-1/2 bg-blue-500/20 border-2 border-blue-500"
									style={{
										width: '80%',
										height: '80%',
										transform: 'translate(-50%, -50%)',
										clipPath: 'polygon(50% 5%, 95% 38%, 79% 95%, 21% 95%, 5% 38%)',
									}}
								/>
								{/* Labels */}
								<div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium">
									Math 95%
								</div>
								<div className="absolute top-[20%] -right-12 text-xs font-medium">Phy Sci 88%</div>
								<div className="absolute bottom-[10%] -right-10 text-xs font-medium">Eng 82%</div>
								<div className="absolute bottom-[10%] -left-8 text-xs font-medium">Acc 78%</div>
								<div className="absolute top-[20%] -left-10 text-xs font-medium">Bio 75%</div>
							</div>
						</div>
					</Card>

					{/* Skill Achievements */}
					<div>
						<h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
							Skill Achievements
						</h3>
						<div className="flex flex-wrap gap-2">
							{skillAchievements.map((skill) => (
								<Badge key={skill} variant="secondary" className="px-3 py-1 text-xs">
									<Award className="w-3 h-3 mr-1" />
									{skill}
								</Badge>
							))}
						</div>
					</div>

					{/* Stats Cards */}
					<div className="grid grid-cols-2 gap-4">
						<Card className="p-4">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
									<TrendingUp className="w-5 h-5 text-blue-600" />
								</div>
								<div>
									<p className="text-xl font-bold text-zinc-900 dark:text-white">78%</p>
									<p className="text-xs text-zinc-500">Average</p>
								</div>
							</div>
						</Card>
						<Card className="p-4">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
									<Star className="w-5 h-5 text-yellow-600" />
								</div>
								<div>
									<p className="text-xl font-bold text-zinc-900 dark:text-white">Math</p>
									<p className="text-xs text-zinc-500">Top Subject</p>
								</div>
							</div>
						</Card>
					</div>

					{/* Admin Tools */}
					<Card className="p-4 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
						<button
							type="button"
							onClick={() => onNavigate('CMS')}
							className="w-full flex items-center justify-between"
						>
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center">
									<BarChart3 className="w-5 h-5 text-white" />
								</div>
								<div className="text-left">
									<h4 className="font-semibold text-zinc-900 dark:text-white">Content CMS</h4>
									<p className="text-xs text-zinc-500">Manage lessons & materials</p>
								</div>
							</div>
							<span className="text-zinc-400">›</span>
						</button>
					</Card>
				</main>
			</ScrollArea>
		</div>
	);
}
