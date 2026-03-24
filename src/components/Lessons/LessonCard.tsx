import { Clock01Icon, LockIcon, Tick01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { TTSButton } from '@/components/Lessons/TTSButton';
import { Card } from '@/components/ui/card';
import type { Lesson } from '@/hooks/useLessons';

interface LessonCardProps {
	lesson: Lesson;
}

export function LessonCard({ lesson }: LessonCardProps) {
	return (
		<div className="flex gap-6 relative z-10">
			{/* Node Icon */}
			<div className="shrink-0 pt-4 flex flex-col items-center">
				{lesson.status === 'completed' && (
					<div className="w-8 h-8 rounded-full bg-brand-amber flex items-center justify-center shadow-lg shadow-brand-amber/20 translate-y-1">
						<HugeiconsIcon
							icon={Tick01Icon}
							className="w-5 h-5 text-primary-foreground stroke-[3px]"
						/>
					</div>
				)}
				{lesson.status === 'active' && (
					<div className="w-8 h-8 rounded-full bg-card border-2 border-primary flex items-center justify-center shadow-lg shadow-primary/20 translate-y-1">
						<div className="w-2.5 h-2.5 rounded-full bg-primary" />
					</div>
				)}
				{lesson.status === 'locked' && (
					<div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center translate-y-1">
						<HugeiconsIcon icon={LockIcon} className="w-4 h-4 text-muted-foreground/50" />
					</div>
				)}
			</div>

			{/* Lesson Card */}
			<div className="flex-1">
				<Card
					className={`p-6 rounded-[2rem] border-2 shadow-sm relative overflow-hidden group hover:shadow-md transition-all ${
						lesson.status === 'active' ? 'border-primary bg-card' : 'border-transparent bg-card'
					}`}
				>
					{lesson.isContinue && (
						<div className="absolute top-0 right-0">
							<div className="bg-primary text-primary-foreground text-[10px] font-black px-4 py-1.5 rounded-bl-2xl  tracking-widest shadow-sm">
								continue
							</div>
						</div>
					)}
					<div className="flex items-center justify-between">
						<div className="space-y-1.5 pr-4">
							<p
								className={`text-[10px] font-black  tracking-widest ${
									lesson.status === 'active'
										? 'text-primary'
										: lesson.status === 'completed'
											? 'text-brand-amber'
											: lesson.subject.includes('LANGUAGE')
												? 'text-brand-red'
												: lesson.subject.includes('LIFE')
													? 'text-brand-green'
													: 'text-muted-foreground'
								}`}
							>
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
									<span className="text-xs font-bold text-muted-foreground">
										{lesson.progress}%
									</span>
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
			</div>
		</div>
	);
}
