/** biome-ignore-all lint/a11y/noStaticElementInteractions: required */
'use client';

import { ArrowRight, Bell, BookOpen, Check, Flame, FlaskConical, Play, Sigma } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Dashboard() {
	const router = useRouter();

	return (
		<div className="flex flex-col h-full bg-[#f8f9fa] dark:bg-[#0a0f18] font-inter">
			{/* Header */}
			<header className="px-6 pt-6 pb-2 flex items-center justify-between shrink-0">
				<div className="flex items-center gap-3">
					<div className="relative">
						<Avatar className="w-12 h-12 border-2 border-white dark:border-zinc-800 shadow-sm relative">
							<AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Thabo&gender=female" />
							<AvatarFallback>TH</AvatarFallback>
						</Avatar>
						<div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-[#0a0f18] rounded-full" />
					</div>
					<div>
						<p className="text-zinc-500 dark:text-zinc-400 text-xs font-medium">Welcome back,</p>
						<h2 className="text-xl font-bold text-zinc-900 dark:text-white leading-none">Thabo</h2>
					</div>
				</div>
				<Button
					variant="ghost"
					size="icon"
					className="w-12 h-12 rounded-full bg-white dark:bg-zinc-900 shadow-sm relative"
				>
					<Bell className="w-6 h-6 text-zinc-700 dark:text-zinc-300" />
					<span className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 border-2 border-white dark:border-[#0a0f18] rounded-full" />
				</Button>
			</header>

			<ScrollArea className="flex-1">
				<main className="px-6 py-6 space-y-8 pb-32">
					{/* Streak Card */}
					<Card className="p-6 bg-white dark:bg-zinc-900 border-none shadow-sm rounded-3xl flex items-center justify-between relative overflow-hidden">
						<div className="space-y-1 relative z-10">
							<div className="flex items-baseline gap-2">
								<span className="text-4xl font-extrabold text-zinc-900 dark:text-white">12</span>
								<span className="text-zinc-400 dark:text-zinc-500 font-bold text-xl">days</span>
							</div>
							<p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">
								You're on fire! 🔥 Keep it up!
							</p>
						</div>
						<div className="w-16 h-16 bg-orange-50 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center relative z-10">
							<div className="absolute inset-0 blur-xl bg-orange-200/50 dark:bg-orange-900/30 rounded-full" />
							<Flame className="w-8 h-8 text-[#efb036] fill-[#efb036] relative z-10" />
						</div>
					</Card>

					{/* This Week Section */}
					<div className="space-y-4">
						<div className="flex justify-between items-center">
							<h3 className="text-lg font-bold text-zinc-900 dark:text-white">This Week</h3>
							<button
								type="button"
								className="text-sm font-bold text-[#efb036] hover:opacity-80 transition-opacity"
							>
								View Calendar
							</button>
						</div>
						<div className="flex justify-between items-center bg-white dark:bg-zinc-900 p-4 rounded-3xl shadow-sm">
							{[
								{ day: 'MON', date: 10, status: 'complete' },
								{ day: 'TUE', date: 11, status: 'complete' },
								{ day: 'WED', date: 12, status: 'active' },
								{ day: 'THU', date: 13, status: 'idle' },
								{ day: 'FRI', date: 14, status: 'idle' },
								{ day: 'SAT', date: 15, status: 'idle' },
								{ day: 'SUN', date: 16, status: 'idle' },
							].map((item) => (
								<div key={item.day} className="flex flex-col items-center gap-2">
									<span
										className={`text-[10px] font-bold ${item.status === 'active' ? 'text-[#efb036]' : 'text-zinc-400 dark:text-zinc-500'}`}
									>
										{item.day}
									</span>
									<div
										className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
											item.status === 'complete'
												? 'bg-[#efb036] text-white'
												: item.status === 'active'
													? 'bg-white dark:bg-zinc-800 border-2 border-[#efb036] text-[#efb036] shadow-lg shadow-orange-500/20'
													: 'bg-zinc-50 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500'
										}`}
									>
										{item.status === 'complete' ? (
											<Check className="w-5 h-5 stroke-[3px]" />
										) : (
											<span className="text-sm font-bold">{item.date}</span>
										)}
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Daily Goal Card */}
					<Card className="p-8 bg-white dark:bg-zinc-900 border-none shadow-sm rounded-[2.5rem] space-y-6 relative overflow-hidden group">
						<div className="absolute -right-4 -top-4 w-48 h-48 bg-orange-50/50 dark:bg-orange-900/5 rounded-full blur-3xl pointer-events-none" />

						<div className="flex justify-between items-start relative z-10">
							<div className="space-y-3">
								<div className="inline-flex items-center px-3 py-1 bg-orange-100/80 dark:bg-orange-900/20 rounded-lg">
									<span className="text-[10px] font-bold text-[#efb036] uppercase tracking-wider">
										Daily Goal
									</span>
								</div>
								<h3 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
									Master Algebra
								</h3>
								<p className="text-zinc-500 dark:text-zinc-400 font-medium">
									Complete 3 quiz questions
								</p>
							</div>
							<div className="w-20 h-20 bg-[#f8f9fa] dark:bg-zinc-800 rounded-2xl flex items-center justify-center shadow-inner overflow-hidden border border-zinc-100 dark:border-zinc-700">
								<img
									src="https://images.unsplash.com/photo-1579546671584-62dcfaf35ad0?w=100&h=100&fit=crop"
									alt="Trophy"
									className="w-14 h-14 object-contain opacity-90"
								/>
							</div>
						</div>

						<div className="space-y-3 relative z-10">
							<div className="flex justify-between items-end">
								<span className="text-sm font-bold text-zinc-900 dark:text-white">2/3 Solved</span>
								<span className="text-sm font-bold text-[#efb036]">66%</span>
							</div>
							<div className="h-2.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
								<div
									className="h-full bg-[#efb036] rounded-full transition-all duration-500"
									style={{ width: '66%' }}
								/>
							</div>
						</div>

						<Button
							className="w-full h-14 bg-[#efb036] hover:bg-[#d99d2b] text-white rounded-2xl text-lg font-bold shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 relative z-10"
							onClick={() => router.push('/quiz')}
						>
							Continue Quest
							<ArrowRight className="w-5 h-5" />
						</Button>
					</Card>

					{/* Recommended Challenges */}
					<div className="space-y-5">
						<h3 className="text-lg font-bold text-zinc-900 dark:text-white">
							Recommended Challenges
						</h3>
						<div className="space-y-4">
							{[
								{
									title: 'Differentiation Rules',
									time: '10m',
									difficulty: 'Medium',
									icon: <Sigma className="w-6 h-6 text-blue-500" />,
									iconBg: 'bg-blue-50 dark:bg-blue-900/20',
								},
								{
									title: 'Newton’s Second Law',
									time: '20m',
									difficulty: 'Hard',
									icon: <FlaskConical className="w-6 h-6 text-purple-500" />,
									iconBg: 'bg-purple-50 dark:bg-purple-900/20',
								},
								{
									title: 'Poetry Analysis',
									time: '5m',
									difficulty: 'Easy',
									icon: <BookOpen className="w-6 h-6 text-emerald-500" />,
									iconBg: 'bg-emerald-50 dark:bg-emerald-900/20',
								},
							].map((challenge) => (
								<div
									key={challenge.title}
									className="bg-white dark:bg-zinc-900 p-4 pl-5 rounded-3xl flex items-center justify-between shadow-sm group hover:shadow-md transition-all cursor-pointer border border-zinc-50 dark:border-zinc-800/50"
									onClick={() => router.push('/quiz')}
								>
									<div className="flex items-center gap-4">
										<div
											className={`w-12 h-12 rounded-2xl flex items-center justify-center ${challenge.iconBg}`}
										>
											{challenge.icon}
										</div>
										<div className="space-y-0.5">
											<h4 className="font-bold text-zinc-900 dark:text-white">{challenge.title}</h4>
											<div className="flex items-center gap-2 text-xs font-medium text-zinc-400 dark:text-zinc-500">
												<div className="flex items-center gap-1">
													<Clock className="w-3 h-3" />
													{challenge.time}
												</div>
												<span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
												<div
													className={`px-2 py-0.5 rounded-lg font-bold ${
														challenge.difficulty === 'Hard'
															? 'bg-rose-50 text-rose-500 dark:bg-rose-900/20'
															: challenge.difficulty === 'Medium'
																? 'bg-orange-50 text-orange-500 dark:bg-orange-900/20'
																: 'bg-emerald-50 text-emerald-500 dark:bg-emerald-900/20'
													}`}
												>
													{challenge.difficulty}
												</div>
											</div>
										</div>
									</div>
									<Button
										variant="ghost"
										size="icon"
										className="w-10 h-10 rounded-full bg-zinc-50 dark:bg-zinc-800 text-zinc-300 group-hover:bg-[#efb036] group-hover:text-white transition-all scale-90 group-hover:scale-100"
									>
										<Play className="w-4 h-4 fill-current ml-0.5" />
									</Button>
								</div>
							))}
						</div>
					</div>
				</main>
			</ScrollArea>
		</div>
	);
}

// Sub-component for icons used in the map/list
function Clock({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<circle cx="12" cy="12" r="10" />
			<polyline points="12 6 12 12 16 14" />
		</svg>
	);
}
