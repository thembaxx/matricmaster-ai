'use client';

import {
	Award,
	Check,
	ChevronDown,
	Clock,
	Flame,
	FlaskConical,
	Globe,
	Languages as LanguagesIcon,
	LayoutGrid,
	Lock,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

const categories = [
	{ id: 'all', name: 'All Subjects', icon: LayoutGrid },
	{ id: 'sciences', name: 'Sciences', icon: FlaskConical },
	{ id: 'languages', name: 'Languages', icon: LanguagesIcon },
];

const lessons = [
	{
		id: 1,
		subject: 'MATHEMATICS P1',
		title: 'Algebra & Equations',
		progress: 75,
		status: 'completed',
		icon: '📐',
		color: 'bg-yellow-50 dark:bg-yellow-900/20',
		iconColor: 'text-yellow-600',
	},
	{
		id: 2,
		subject: 'PHYSICAL SCIENCES',
		title: "Newton's Laws",
		progress: 25,
		status: 'active',
		icon: '⚡',
		color: 'bg-blue-50 dark:bg-blue-900/20',
		iconColor: 'text-blue-600',
		isContinue: true,
	},
	{
		id: 3,
		subject: 'HOME LANGUAGE',
		title: 'Poetry Analysis',
		time: '15 min',
		status: 'locked',
		icon: '📚',
		color: 'bg-rose-50 dark:bg-rose-900/20',
		iconColor: 'text-rose-600',
	},
	{
		id: 4,
		subject: 'LIFE SCIENCES',
		title: 'DNA & Genetics',
		time: '20 min',
		status: 'locked',
		icon: '🧬',
		color: 'bg-emerald-50 dark:bg-emerald-900/20',
		iconColor: 'text-emerald-600',
	},
];

export default function Lessons() {
	const [activeCategory, setActiveCategory] = useState('all');

	return (
		<div className="flex flex-col h-full bg-background">
			{/* Header */}
			<header className="px-6 pt-12 pb-6 shrink-0">
				<div className="flex items-start justify-between">
					<div className="space-y-1">
						<h1 className="text-2xl font-black text-foreground tracking-tight">Grade 12 Prep</h1>
						<p className="text-muted-foreground font-medium flex items-center gap-1.5 text-sm">
							Keep up the streak! <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />{' '}
							<span className="font-bold text-foreground">5 days</span>
						</p>
					</div>
					<Button
						variant="outline"
						size="sm"
						className="rounded-full bg-card border-border shadow-sm gap-2 h-10 px-4"
					>
						<Globe className="w-4 h-4 text-muted-foreground" />
						<span className="font-bold text-foreground">English</span>
						<ChevronDown className="w-4 h-4 text-muted-foreground/50" />
					</Button>
				</div>

				{/* Category selector */}
				<nav
					className="flex gap-3 mt-8 overflow-x-auto no-scrollbar"
					aria-label="Lesson categories"
				>
					{categories.map((cat) => (
						<button
							key={cat.id}
							type="button"
							onClick={() => setActiveCategory(cat.id)}
							aria-pressed={activeCategory === cat.id ? 'true' : 'false'}
							className={`flex items-center gap-2 px-5 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all border shadow-sm ${
								activeCategory === cat.id
									? 'bg-foreground text-background border-foreground shadow-lg'
									: 'bg-card text-muted-foreground border-border hover:text-foreground'
							}`}
						>
							<cat.icon
								className={`w-4 h-4 ${activeCategory === cat.id ? 'text-primary' : 'text-muted-foreground'}`}
							/>
							{cat.name}
						</button>
					))}
				</nav>
			</header>

			{/* Path Content */}
			<ScrollArea className="flex-1">
				<main className="px-6 py-4 relative">
					{/* Vertical Line */}
					<div className="absolute left-9.5 top-0 bottom-0 w-0.5 border-l-2 border-dashed border-border/50 z-0" />

					<div className="space-y-6">
						{lessons.map((lesson) => (
							<div key={lesson.id} className="flex gap-6 relative z-10">
								{/* Node Icon */}
								<div className="shrink-0 pt-4 flex flex-col items-center">
									{lesson.status === 'completed' && (
										<div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20 translate-y-1">
											<Check className="w-5 h-5 text-white stroke-[3px]" />
										</div>
									)}
									{lesson.status === 'active' && (
										<div className="w-8 h-8 rounded-full bg-card border-2 border-primary flex items-center justify-center shadow-lg shadow-primary/20 translate-y-1 ring-4 ring-primary/10">
											<div className="w-2.5 h-2.5 rounded-full bg-primary" />
										</div>
									)}
									{lesson.status === 'locked' && (
										<div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center translate-y-1">
											<Lock className="w-4 h-4 text-muted-foreground/50" />
										</div>
									)}
								</div>

								{/* Lesson Card */}
								<div className="flex-1">
									<Card
										className={`p-6 rounded-[2rem] border-2 shadow-sm relative overflow-hidden group hover:shadow-md transition-all ${
											lesson.status === 'active'
												? 'border-primary bg-card'
												: 'border-transparent bg-card'
										}`}
									>
										{lesson.isContinue && (
											<div className="absolute top-0 right-0">
												<div className="bg-primary text-primary-foreground text-[10px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-widest shadow-sm">
													Continue
												</div>
											</div>
										)}
										<div className="flex items-center justify-between">
											<div className="space-y-1.5 pr-4">
												<p
													className={`text-[10px] font-black uppercase tracking-widest ${
														lesson.status === 'active'
															? 'text-primary'
															: lesson.status === 'completed'
																? 'text-orange-500'
																: lesson.subject.includes('LANGUAGE')
																	? 'text-rose-500'
																	: lesson.subject.includes('LIFE')
																		? 'text-emerald-500'
																		: 'text-muted-foreground'
													}`}
												>
													{lesson.subject}
												</p>
												<h4 className="text-xl font-bold text-foreground leading-tight">
													{lesson.title}
												</h4>

												{lesson.progress !== undefined ? (
													<div className="flex items-center gap-3 pt-2">
														<div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
															<div
																className={`h-full rounded-full transition-all ${
																	lesson.status === 'active' ? 'bg-primary' : 'bg-orange-500'
																}`}
																style={{ width: `${lesson.progress}%` }}
															/>
														</div>
														<span className="text-xs font-bold text-muted-foreground">
															{lesson.progress}%
														</span>
													</div>
												) : (
													<div className="flex items-center gap-1.5 pt-2 text-muted-foreground font-medium text-xs">
														<Clock className="w-3.5 h-3.5" />
														{lesson.time}
													</div>
												)}
											</div>
											<div
												className={`w-16 h-16 rounded-4xl flex items-center justify-center text-3xl shadow-inner ${lesson.color} border border-border shrink-0 transform group-hover:scale-110 transition-transform`}
											>
												{lesson.status === 'active' ? (
													<div className="relative">
														<div className="absolute inset-0 blur-lg bg-yellow-400 opacity-50" />
														<span className="relative z-10">⚡</span>
													</div>
												) : (
													lesson.icon
												)}
											</div>
										</div>
									</Card>
								</div>
							</div>
						))}

						{/* Premium Upsell Card */}
						<div className="flex gap-6 relative z-10 pt-4">
							<div className="w-8 shrink-0" /> {/* Spacer for alignment */}
							<Card className="flex-1 bg-foreground text-background p-8 rounded-[2.5rem] text-center space-y-6 relative overflow-hidden shadow-2xl border-none">
								<div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
								<div className="absolute -bottom-12 -left-12 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />

								<div className="w-14 h-14 bg-background/10 rounded-2xl flex items-center justify-center mx-auto shadow-inner relative group cursor-pointer hover:scale-105 transition-transform">
									<Award className="w-8 h-8 text-yellow-400" />
									<div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-foreground" />
								</div>

								<div className="space-y-2">
									<h3 className="text-2xl font-black tracking-tight">Unlock Past Papers</h3>
									<p className="text-muted-foreground font-medium text-sm px-4">
										Get access to 2018-2023 exams with memos.
									</p>
								</div>

								<Button className="w-full bg-background text-foreground hover:bg-muted h-14 rounded-2xl font-black text-lg shadow-xl shadow-black/10 transition-all active:scale-[0.98]">
									Go Premium
								</Button>
							</Card>
						</div>
					</div>

					{/* Space for bottom nav */}
					<div className="h-32" />
				</main>
			</ScrollArea>
		</div>
	);
}
