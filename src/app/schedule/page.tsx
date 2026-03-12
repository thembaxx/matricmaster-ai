'use client';

import {
	Calendar01Icon,
	Clock01Icon,
	MoreVerticalIcon,
	PlusSignIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 14 }, (_, i) => i + 8); // 8 AM to 9 PM

const MOCK_EVENTS = [
	{ day: 'Mon', start: 14, end: 15.5, subject: 'Maths', color: 'bg-subject-math', title: 'Calculus' },
	{ day: 'Tue', start: 16, end: 17.5, subject: 'Physics', color: 'bg-subject-physics', title: 'Mechanics' },
	{ day: 'Wed', start: 15, end: 16.5, subject: 'Life Sci', color: 'bg-subject-life', title: 'Genetics' },
	{ day: 'Thu', start: 14, end: 15.5, subject: 'Maths', color: 'bg-subject-math', title: 'Functions' },
	{ day: 'Fri', start: 16, end: 18, subject: 'Past Paper', color: 'bg-primary', title: 'Mock Exam' },
];

export default function SchedulePage() {
	const [selectedDay, setSelectedDay] = useState('Mon');

	return (
		<div className="container mx-auto max-w-6xl px-4 pt-8 pb-32">
			<div className="flex items-center justify-between mb-8">
				<div>
					<h1 className="text-4xl font-black tracking-tight text-foreground uppercase">Study Schedule</h1>
					<p className="text-muted-foreground font-bold uppercase text-xs tracking-widest mt-1">
						Your weekly routine
					</p>
				</div>
				<Button className="rounded-full gap-2 font-black uppercase text-xs tracking-widest px-6 h-12 shadow-xl shadow-primary/20">
					<HugeiconsIcon icon={PlusSignIcon} className="w-4 h-4" />
					Add Block
				</Button>
			</div>

			{/* Desktop Grid View */}
			<div className="hidden lg:block bg-card rounded-[2.5rem] border border-border/50 shadow-tiimo overflow-hidden">
				<div className="grid grid-cols-8 border-b border-border/50">
					<div className="p-4 border-r border-border/50" />
					{DAYS.map(day => (
						<div key={day} className={cn(
							"p-4 text-center font-black uppercase text-[10px] tracking-widest border-r border-border/50 last:border-r-0",
							day === selectedDay ? "text-primary" : "text-muted-foreground"
						)}>
							{day}
						</div>
					))}
				</div>
				
				<ScrollArea className="h-[600px]">
					<div className="grid grid-cols-8 relative">
						{/* Time Column */}
						<div className="col-span-1 border-r border-border/50">
							{HOURS.map(hour => (
								<div key={hour} className="h-20 p-2 text-[10px] font-bold text-muted-foreground/50 text-right border-b border-border/10">
									{hour}:00
								</div>
							))}
						</div>

						{/* Day Columns */}
						{DAYS.map(day => (
							<div key={day} className="col-span-1 relative border-r border-border/50 last:border-r-0">
								{HOURS.map(hour => (
									<div key={hour} className="h-20 border-b border-border/10" />
								))}
								
								{/* Events */}
								{MOCK_EVENTS.filter(e => e.day === day).map((event, i) => (
									<m.div
										key={i}
										initial={{ opacity: 0, scale: 0.9 }}
										animate={{ opacity: 1, scale: 1 }}
										className={cn(
											"absolute left-1 right-1 rounded-xl p-3 shadow-lg border border-white/10 overflow-hidden",
											event.color
										)}
										style={{
											top: `${(event.start - 8) * 80}px`,
											height: `${(event.end - event.start) * 80}px`,
										}}
									>
										<p className="text-[8px] font-black text-white/70 uppercase tracking-widest truncate">{event.subject}</p>
										<p className="text-xs font-black text-white truncate">{event.title}</p>
									</m.div>
								))}
							</div>
						))}
					</div>
				</ScrollArea>
			</div>

			{/* Mobile List View */}
			<div className="lg:hidden space-y-6">
				<div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
					{DAYS.map(day => (
						<button
							key={day}
							onClick={() => setSelectedDay(day)}
							className={cn(
								"px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
								selectedDay === day 
									? "bg-foreground text-background shadow-lg scale-105" 
									: "bg-muted text-muted-foreground"
							)}
						>
							{day}
						</button>
					))}
				</div>

				<div className="space-y-4">
					{MOCK_EVENTS.filter(e => e.day === selectedDay).map((event, i) => (
						<Card key={i} className="shadow-tiimo border-border/50 overflow-hidden">
							<CardContent className="p-0 flex h-24">
								<div className={cn("w-3 h-full", event.color)} />
								<div className="flex-1 p-4 flex items-center justify-between">
									<div className="space-y-1">
										<div className="flex items-center gap-2">
											<HugeiconsIcon icon={Clock01Icon} className="w-3 h-3 text-muted-foreground" />
											<span className="text-[10px] font-bold text-muted-foreground">
												{event.start}:00 - {event.end % 1 === 0 ? `${event.end}:00` : `${Math.floor(event.end)}:30`}
											</span>
										</div>
										<h3 className="text-lg font-black uppercase tracking-tight">{event.title}</h3>
										<p className="text-[10px] font-black text-primary uppercase tracking-widest">{event.subject}</p>
									</div>
									<Button variant="ghost" size="icon" className="rounded-full">
										<HugeiconsIcon icon={MoreVerticalIcon} className="w-5 h-5" />
									</Button>
								</div>
							</CardContent>
						</Card>
					))}
					{MOCK_EVENTS.filter(e => e.day === selectedDay).length === 0 && (
						<div className="py-12 text-center">
							<div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 opacity-50">
								<HugeiconsIcon icon={Calendar01Icon} className="w-8 h-8" />
							</div>
							<p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">No study blocks today</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
