'use client';

import {
	ArrowDown01Icon as CaretDown,
	CheckmarkCircle01Icon as Check,
	TimeClockIcon as Clock,
	FireIcon as Fire,
	FlaskIcon as Flask,
	Globe02Icon as Globe,
	TranslateIcon as LanguagesIcon,
	Layout01Icon as Layout,
	Lock01Icon as Lock,
	MedalIcon as Medal,
	ZapIcon as Zap,
} from 'hugeicons-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

const categories = [
	{ id: 'all', name: 'All Subjects', icon: Layout },
	{ id: 'sciences', name: 'Sciences', icon: Flask },
	{ id: 'languages', name: 'Translate', icon: LanguagesIcon },
];

const lessons = [
	{
		id: 1,
		subject: 'MATHEMATICS P1',
		title: 'Algebra & Equations',
		progress: 75,
		status: 'completed',
		icon: '📐',
		color: 'bg-brand-amber/10',
		iconColor: 'text-brand-amber',
	},
	{
		id: 2,
		subject: 'PHYSICAL SCIENCES',
		title: "Newton's Laws",
		progress: 25,
		status: 'active',
		icon: '⚡',
		color: 'bg-primary/10',
		iconColor: 'text-primary',
		isContinue: true,
	},
	{
		id: 3,
		subject: 'HOME LANGUAGE',
		title: 'Poetry Analysis',
		time: '15 min',
		status: 'locked',
		icon: '📚',
		color: 'bg-brand-red/10',
		iconColor: 'text-brand-red',
	},
	{
		id: 4,
		subject: 'LIFE SCIENCES',
		title: 'DNA & Genetics',
		time: '20 min',
		status: 'locked',
		icon: '🧬',
		color: 'bg-brand-green/10',
		iconColor: 'text-brand-green',
	},
];

export default function Lessons() {
	const [activeCategory, setActiveCategory] = useState('all');

	return (
		<div className="flex flex-col h-full min-w-0 bg-white dark:bg-zinc-950 overflow-x-hidden lg:px-12">
			{/* Header */}
			<header className="px-6 sm:px-10 pt-20 sm:pt-32 pb-12 shrink-0 lg:px-0">
				<div className="flex items-start justify-between gap-8 mb-12">
					<div className="space-y-4">
						<h1 className="text-5xl sm:text-7xl lg:text-9xl font-black text-foreground tracking-tighter leading-none">
							Quest
						</h1>
						<div className="flex items-center gap-4">
							<p className="text-muted-foreground/40 font-black text-sm sm:text-lg uppercase tracking-[0.3em] leading-none">
								Grade 12 Journey
							</p>
							<div className="flex items-center gap-2 px-3 py-1 bg-tiimo-orange/10 rounded-full">
								<Fire size={14} className="text-tiimo-orange fill-tiimo-orange/20 stroke-[3px]" />
								<span className="text-[10px] font-black text-tiimo-orange uppercase tracking-widest">5 Day Streak</span>
							</div>
						</div>
					</div>
					<Button
						variant="ghost"
						className="h-14 px-6 rounded-2xl bg-muted/10 font-black text-xs uppercase tracking-widest hover:bg-muted/20 transition-all border-none shadow-sm gap-3"
					>
						<Globe size={20} className="text-muted-foreground stroke-[3px]" />
						<span className="hidden sm:inline">English</span>
						<CaretDown size={18} className="text-muted-foreground/40 stroke-[3px]" />
					</Button>
				</div>

				{/* Category selector */}
				<nav
					className="flex gap-3 overflow-x-auto no-scrollbar p-2 bg-muted/10 rounded-[2.5rem] max-w-fit"
					aria-label="Lesson categories"
				>
					{categories.map((cat) => (
						<button
							key={cat.id}
							type="button"
							onClick={() => setActiveCategory(cat.id)}
							className={cn(
								"flex items-center gap-3 px-8 h-14 rounded-[2rem] text-sm font-black uppercase tracking-widest transition-all duration-500 whitespace-nowrap",
								activeCategory === cat.id
									? 'bg-primary text-white shadow-xl shadow-primary/30 scale-105'
									: 'text-muted-foreground/40 hover:bg-muted/20'
							)}
						>
							<cat.icon size={20} className={cn("stroke-[3px]", activeCategory === cat.id ? 'scale-110' : '')} />
							{cat.name}
						</button>
					))}
				</nav>
			</header>

			{/* Path Content */}
			<ScrollArea className="flex-1 no-scrollbar px-6 sm:px-10 lg:px-0">
				<main className="max-w-4xl mx-auto w-full pb-64 relative">
					{/* Vertical Line */}
					<div className="absolute left-10 top-0 bottom-0 w-2 bg-muted/10 rounded-full z-0" />

					<div className="space-y-12">
						{lessons.map((lesson) => (
							<div key={lesson.id} className="flex gap-10 relative z-10">
								{/* Node Icon */}
								<div className="shrink-0 pt-6">
									{lesson.status === 'completed' && (
										<m.div
											whileHover={{ scale: 1.1, rotate: -10 }}
											className="w-20 h-20 rounded-[2rem] bg-tiimo-green text-white flex items-center justify-center shadow-xl shadow-tiimo-green/20 transition-all duration-500"
										>
											<Check size={36} className="stroke-[4.5px]" />
										</m.div>
									)}
									{lesson.status === 'active' && (
										<m.div
											animate={{ scale: [1, 1.1, 1] }}
											transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
											className="w-20 h-20 rounded-[2rem] bg-primary text-white flex items-center justify-center shadow-[0_20px_50px_rgba(var(--primary),0.3)] relative"
										>
											<div className="w-4 h-4 bg-white rounded-full animate-ping absolute" />
											<div className="w-4 h-4 bg-white rounded-full relative z-10" />
										</m.div>
									)}
									{lesson.status === 'locked' && (
										<div className="w-20 h-20 rounded-[2rem] bg-muted/20 text-muted-foreground/20 flex items-center justify-center">
											<Lock size={32} className="stroke-[3px]" />
										</div>
									)}
								</div>

								{/* Lesson Card */}
								<div className="flex-1">
									<m.div
										whileHover={{ scale: 1.02, x: 8 }}
										className={cn(
											"p-10 rounded-[3.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.05)] relative overflow-hidden group transition-all duration-700 cursor-pointer",
											lesson.status === 'active' ? 'bg-primary text-white' : 'bg-card'
										)}
									>
										{lesson.isContinue && (
											<div className="absolute top-0 right-0">
												<div className="bg-tiimo-orange text-white text-[10px] font-black px-6 py-2.5 rounded-bl-[2rem] uppercase tracking-[0.2em] shadow-lg">
													Priority
												</div>
											</div>
										)}
										<div className="flex items-center justify-between gap-8">
											<div className="flex-1 space-y-3">
												<p
													className={cn(
														"text-[10px] font-black uppercase tracking-[0.3em]",
														lesson.status === 'active' ? "text-white/60" : "text-muted-foreground/40"
													)}
												>
													{lesson.subject}
												</p>
												<h3 className="text-3xl font-black tracking-tight leading-tight">
													{lesson.title}
												</h3>

												{lesson.progress !== undefined ? (
													<div className="space-y-3 pt-4">
														<div className="h-4 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden p-1 shadow-inner">
															<m.div
																initial={{ width: 0 }}
																animate={{ width: `${lesson.progress}%` }}
																transition={{ duration: 1.5, type: 'spring' }}
																className={cn(
																	"h-full rounded-full",
																	lesson.status === 'active' ? 'bg-white' : 'bg-tiimo-orange'
																)}
															/>
														</div>
														<span className={cn(
															"text-[10px] font-black uppercase tracking-widest block",
															lesson.status === 'active' ? "text-white/40" : "text-muted-foreground/40"
														)}>
															{lesson.progress}% Mastery Achieved
														</span>
													</div>
												) : (
													<div className="flex items-center gap-3 pt-4 text-[10px] font-black uppercase tracking-widest opacity-40">
														<Clock size={16} className="stroke-[3px]" />
														{lesson.time} Estimated
													</div>
												)}
											</div>
											<div
												className={cn(
													"w-24 h-24 rounded-[2.5rem] flex items-center justify-center text-5xl shadow-inner transition-all duration-700",
													lesson.status === 'active' ? "bg-white/10" : "bg-muted/10 group-hover:scale-110"
												)}
											>
												{lesson.status === 'active' ? <Zap size={48} className="text-white fill-white/20 stroke-[2.5px]" /> : lesson.icon}
											</div>
										</div>
									</m.div>
								</div>
							</div>
						))}

						{/* Premium Unlock Section */}
						<div className="flex gap-10 relative z-10 pt-12">
							<div className="w-20 shrink-0" />
							<Card className="flex-1 bg-zinc-950 text-white p-12 rounded-[4rem] text-center space-y-10 relative overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.5)] border-none">
								<div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />

								<div className="w-20 h-20 bg-white/5 rounded-[1.75rem] flex items-center justify-center mx-auto shadow-inner relative group cursor-pointer hover:scale-110 transition-transform duration-700">
									<Medal size={40} className="text-tiimo-orange stroke-[3px] fill-tiimo-orange/20" />
								</div>

								<div className="space-y-4">
									<h3 className="text-4xl font-black tracking-tight leading-none">Unlock History</h3>
									<p className="text-lg font-bold text-white/40 max-w-sm mx-auto">
										Access the complete archive of past exams with expert memos.
									</p>
								</div>

								<Button className="w-full bg-white text-zinc-950 hover:bg-white/90 h-20 rounded-[2rem] font-black text-xl shadow-2xl transition-all active:scale-95">
									Go Elite
								</Button>
							</Card>
						</div>
					</div>
				</main>
			</ScrollArea>
		</div>
	);
}
