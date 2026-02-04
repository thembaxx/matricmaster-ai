import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
// import type { Screen } from '@/types'; // Removed unused import
import { ArrowRight, Bell, Flame, Play } from 'lucide-react';

import { useRouter } from 'next/navigation';

const weekDays = [
	{ day: 'TUE', date: 10, status: 'complete' },
	{ day: 'WED', date: 11, status: 'complete' },
	{ day: 'THU', date: 12, status: 'active' }, // Today
	{ day: 'FRI', date: 13, status: 'upcoming' },
	{ day: 'SAT', date: 14, status: 'upcoming' },
	{ day: 'SUN', date: 15, status: 'upcoming' },
];

export default function Dashboard() {
	const router = useRouter();
	return (
		<div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 font-lexend">
			{/* Header */}
			<header className="px-6 pt-12 pb-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl sticky top-0 z-20 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
				<div className="flex justify-between items-center mb-4 max-w-2xl mx-auto w-full">
					<div className="flex items-center gap-4">
						<Avatar className="w-14 h-14 border-2 border-brand-green p-0.5">
							<AvatarImage
								src="https://api.dicebear.com/7.x/avataaars/svg?seed=Thabo"
								className="rounded-full"
							/>
							<AvatarFallback>TM</AvatarFallback>
						</Avatar>
						<div>
							<p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">
								Hi Thabo!
							</p>
							<h1 className="text-2xl font-black text-zinc-900 dark:text-white">Dashboard</h1>
						</div>
					</div>
					<Button
						variant="ghost"
						size="icon"
						className="rounded-full bg-zinc-100 dark:bg-zinc-800 relative w-12 h-12 transition-transform active:scale-90"
					>
						<Bell className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
						<span className="absolute top-3 right-3.5 w-2.5 h-2.5 bg-brand-red rounded-full border-2 border-white dark:border-zinc-800" />
					</Button>
				</div>
			</header>

			<ScrollArea className="flex-1">
				<main className="px-6 pb-12 pt-6 space-y-8 max-w-2xl mx-auto w-full">
					{/* Daily Goal - Prominent Focus */}
					<div className="space-y-4">
						<Card className="p-8 border-none shadow-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-[3rem] relative overflow-hidden group">
							<div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/20 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-110 transition-transform" />

							<div className="flex justify-between items-start mb-8 relative z-10">
								<div className="space-y-2">
									<Badge className="bg-brand-orange text-white border-none rounded-full px-4 py-1 font-black text-[10px] tracking-widest uppercase">
										Daily Goal
									</Badge>
									<h3 className="text-4xl font-black leading-tight">Calculus: Optimization</h3>
									<p className="text-zinc-400 dark:text-zinc-500 font-bold">
										Next: Stationary Points & Maxima
									</p>
								</div>
								<div className="w-20 h-20 bg-white/10 dark:bg-zinc-100 rounded-[2rem] flex items-center justify-center text-4xl shadow-inner animate-float">
									🚀
								</div>
							</div>

							<div className="space-y-4 relative z-10">
								<div className="flex items-end justify-between px-1">
									<span className="font-black text-xl uppercase tracking-tighter">
										Current Step
									</span>
									<span className="font-black text-brand-blue text-2xl italic">Quiz 3/5</span>
								</div>
								<Progress
									value={60}
									className="h-5 bg-white/10 dark:bg-zinc-100 rounded-full mb-8 shadow-inner"
								/>

								<Button
									className="w-full bg-brand-blue hover:bg-brand-blue-light text-white font-black h-20 rounded-[2.5rem] text-xl shadow-xl shadow-brand-blue/20 active:scale-[0.98] transition-all"
									onClick={() => router.push('/quiz')}
								>
									Continue Learning
									<ArrowRight className="w-6 h-6 ml-3" />
								</Button>
							</div>
						</Card>
					</div>

					{/* Streak Card */}
					<Card className="p-6 flex items-center justify-between border-none bg-white dark:bg-zinc-900 shadow-sm rounded-[2.5rem] group hover:shadow-md transition-shadow">
						<div className="space-y-1">
							<div className="flex items-baseline gap-2">
								<span className="text-5xl font-black text-zinc-900 dark:text-white">12</span>
								<span className="text-zinc-400 font-bold uppercase text-xs tracking-widest">
									Day Streak
								</span>
							</div>
							<div className="flex items-center gap-2 text-brand-orange text-sm font-bold">
								You're on fire! <Flame className="w-4 h-4 fill-current animate-bounce" />
							</div>
						</div>
						<div className="w-20 h-20 bg-brand-orange/10 rounded-[1.5rem] flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform">
							<Flame className="w-10 h-10 text-brand-orange fill-brand-orange/20" />
						</div>
					</Card>

					{/* Activity Path - Redesigned as a journey */}
					<div className="space-y-5">
						<div className="flex justify-between items-center px-1">
							<h2 className="text-sm font-black text-zinc-400 uppercase tracking-widest">
								Your Weekly Journey
							</h2>
							<button
								type="button"
								className="text-xs text-brand-blue font-black uppercase tracking-widest hover:underline"
							>
								View All
							</button>
						</div>
						<div className="flex justify-between items-center bg-white dark:bg-zinc-900 p-6 rounded-[2.5rem] shadow-sm relative overflow-hidden">
							<div className="absolute left-10 right-10 top-1/2 h-1 bg-zinc-100 dark:bg-zinc-800 -translate-y-1/2" />
							{weekDays.map((d) => (
								<div
									key={d.day}
									className={`relative z-10 flex flex-col items-center gap-3 transition-all cursor-pointer hover:scale-110 ${
										d.status === 'active'
											? 'text-brand-blue'
											: d.status === 'complete'
												? 'text-brand-green'
												: 'text-zinc-300'
									}`}
								>
									<span className="text-[10px] font-black tracking-widest uppercase">{d.day}</span>
									<div
										className={`w-12 h-12 flex items-center justify-center rounded-full border-4 transition-all ${
											d.status === 'active'
												? 'bg-brand-blue border-blue-100 dark:border-blue-900 text-white shadow-lg shadow-brand-blue/30 scale-125'
												: d.status === 'complete'
													? 'bg-brand-green border-green-100 dark:border-green-900 text-white shadow-md'
													: 'bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-800 text-zinc-400'
										}`}
									>
										<span className="text-sm font-black">{d.date}</span>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Recommended Challenges */}
					<div className="space-y-5">
						<h2 className="text-sm font-black text-zinc-400 uppercase tracking-widest px-1">
							Recommended for You
						</h2>
						<div className="grid grid-cols-1 gap-4">
							{[
								{
									title: 'Rate of Reaction',
									topic: 'Chemistry',
									time: '12m',
									difficulty: 'Medium',
									color: 'bg-brand-amber/10 text-brand-amber',
									icon: '🧪',
								},
								{
									title: 'Organic Molecules',
									topic: 'Chemistry',
									time: '15m',
									difficulty: 'Easy',
									color: 'bg-brand-amber/10 text-brand-amber',
									icon: '⬢',
								},
								{
									title: 'Doppler Effect',
									topic: 'Physics',
									time: '20m',
									difficulty: 'Hard',
									color: 'bg-brand-purple/10 text-brand-purple',
									icon: '🔊',
								},
							].map((challenge) => (
								<Card
									key={challenge.title}
									className="p-5 flex items-center gap-5 border-none shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer bg-white dark:bg-zinc-900 rounded-[2rem] group"
									onClick={() => router.push('/quiz')}
								>
									<div
										className={`w-16 h-16 rounded-2xl ${challenge.color} flex items-center justify-center text-xl font-black italic`}
									>
										{challenge.icon}
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">
											{challenge.topic}
										</p>
										<h4 className="font-black text-zinc-900 dark:text-white truncate text-lg group-hover:text-brand-blue transition-colors">
											{challenge.title}
										</h4>
										<div className="flex items-center gap-3 text-xs font-bold text-zinc-500 mt-1">
											<div className="flex items-center gap-1.5">
												<span className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
												{challenge.time}
											</div>
											<Badge
												variant="secondary"
												className="rounded-full px-2 py-0 text-[10px] font-black uppercase tracking-tighter"
											>
												{challenge.difficulty}
											</Badge>
										</div>
									</div>
									<div className="w-10 h-10 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-brand-blue group-hover:text-white transition-all">
										<Play className="w-4 h-4 fill-current ml-0.5" />
									</div>
								</Card>
							))}
						</div>
					</div>
				</main>
			</ScrollArea>
		</div>
	);
}
