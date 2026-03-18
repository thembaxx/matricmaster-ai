'use client';

import { Clock01Icon, LockIcon, Tick01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { memo } from 'react';
import { TTSButton } from '@/components/Lessons/TTSButton';
import { Card } from '@/components/ui/card';

interface Lesson {
	id: string;
	subject: string;
	topic: string;
	title: string;
	content: string;
	duration: number;
	difficulty: string;
	prerequisites: string[];
	learning_objectives: string[];
	progress?: number;
	status?: 'completed' | 'active' | 'locked';
	icon?: string;
	color?: string;
	iconColor?: string;
	isContinue?: boolean;
	time?: string;
}

interface LessonCardProps {
	lesson: Lesson;
}

export const LessonCard = memo(function LessonCard({ lesson }: LessonCardProps) {
	const getStatusColor = () => {
		if (lesson.status === 'active') return 'text-primary';
		if (lesson.status === 'completed') return 'text-brand-amber';
		if (lesson.subject.includes('LANGUAGE')) return 'text-brand-red';
		if (lesson.subject.includes('LIFE')) return 'text-brand-green';
		return 'text-muted-foreground';
	};

	return (
		<Card
			className={`p-6 rounded-[2rem] border-2 shadow-sm relative overflow-hidden group hover:shadow-md transition-all ${
				lesson.status === 'active' ? 'border-primary bg-card' : 'border-transparent bg-card'
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
					<p className={`text-[10px] font-black uppercase tracking-widest ${getStatusColor()}`}>
						{lesson.subject}
					</p>
					<h3 className="text-xl font-bold text-foreground leading-tight">{lesson.title}</h3>

					<div className="pt-2">
						<TTSButton
							text={`${lesson.title}. ${lesson.content.slice(0, 200)}`}
							title={lesson.title}
							showPlayer={true}
						/>
					</div>

					{lesson.progress !== undefined ? (
						<div className="flex items-center gap-3 pt-2">
							<div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
								<div
									className={`h-full rounded-full transition-all ${
										lesson.status === 'active' ? 'bg-primary' : 'bg-brand-amber'
									}`}
									style={{ width: `${lesson.progress}%` }}
								/>
							</div>
							<span className="text-xs font-bold text-muted-foreground">{lesson.progress}%</span>
						</div>
					) : (
						<div className="flex items-center gap-1.5 pt-2 text-muted-foreground font-medium text-xs">
							<HugeiconsIcon icon={Clock01Icon} className="w-3.5 h-3.5" />
							{lesson.time}
						</div>
					)}
				</div>

				<div
					className={`w-16 h-16 rounded-4xl flex items-center justify-center text-3xl shadow-inner ${lesson.color} border border-border shrink-0 transform group-hover:scale-110 transition-transform`}
				>
					{lesson.status === 'active' ? (
						<div className="relative">
							<div className="absolute inset-0 blur-lg bg-brand-amber opacity-50" />
							<span className="relative z-10">⚡</span>
						</div>
					) : (
						lesson.icon
					)}
				</div>
			</div>
		</Card>
	);
});

interface TimelineNodeProps {
	status: 'completed' | 'active' | 'locked';
}

export const TimelineNode = memo(function TimelineNode({ status }: TimelineNodeProps) {
	if (status === 'completed') {
		return (
			<div className="w-8 h-8 rounded-full bg-brand-amber flex items-center justify-center shadow-lg shadow-brand-amber/20 translate-y-1">
				<HugeiconsIcon icon={Tick01Icon} className="w-5 h-5 text-primary-foreground stroke-[3px]" />
			</div>
		);
	}
	if (status === 'active') {
		return (
			<div className="w-8 h-8 rounded-full bg-card border-2 border-primary flex items-center justify-center shadow-lg shadow-primary/20 translate-y-1">
				<div className="w-2.5 h-2.5 rounded-full bg-primary" />
			</div>
		);
	}
	return (
		<div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center translate-y-1">
			<HugeiconsIcon icon={LockIcon} className="w-4 h-4 text-muted-foreground/50" />
		</div>
	);
});

interface PremiumUpsellCardProps {
	onGoPremium: () => void;
}

export const PremiumUpsellCard = memo(function PremiumUpsellCard({
	onGoPremium,
}: PremiumUpsellCardProps) {
	return (
		<div className="flex gap-6 relative z-10 pt-4">
			<div className="w-8 shrink-0" />
			<Card className="flex-1 bg-foreground text-background p-8 rounded-[2.5rem] text-center space-y-6 relative overflow-hidden shadow-2xl border-none">
				<div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
				<div className="absolute -bottom-12 -left-12 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />

				<div className="w-14 h-14 bg-background/10 rounded-2xl flex items-center justify-center mx-auto shadow-inner relative group cursor-pointer hover:scale-105 transition-transform">
					<HugeiconsIcon icon={Medal01Icon} className="w-8 h-8 text-yellow-400" />
					<div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-foreground" />
				</div>

				<div className="space-y-2">
					<h3 className="text-2xl font-black tracking-tight">Unlock Past Papers</h3>
					<p className="text-muted-foreground font-medium text-sm px-4">
						Get access to 2018-2023 exams with memos.
					</p>
					<Button
						onClick={onGoPremium}
						className="w-full bg-background text-foreground hover:bg-muted h-14 rounded-2xl font-black text-lg shadow-xl shadow-black/10 transition-all active:scale-[0.98]"
					>
						Go Premium
					</Button>
				</div>
			</Card>
		</div>
	);
});

import { Medal01Icon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
