import { Calendar01Icon, Clock01Icon, Delete02Icon, Edit01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { UIEvent } from './constants';
import { DAYS } from './constants';

interface MobileListViewProps {
	events: UIEvent[];
	selectedDay: string;
	isDeleting: string | null;
	onDaySelect: (day: string) => void;
	onBlockClick: (event: UIEvent) => void;
	onDeleteBlock: (eventId: string, e: React.MouseEvent) => void;
}

export function MobileListView({
	events,
	selectedDay,
	isDeleting,
	onDaySelect,
	onBlockClick,
	onDeleteBlock,
}: MobileListViewProps) {
	const filteredEvents = events.filter((e) => e.day === selectedDay);

	return (
		<div className="lg:hidden space-y-5 h-full w-full flex flex-col overflow-hidden">
			<div className="flex gap-2 pb-2 pl-2 overflow-x-auto no-scrollbar">
				{DAYS.map((day) => (
					<button
						key={day}
						type="button"
						onClick={() => onDaySelect(day)}
						className={cn(
							'px-5 py-3 rounded-2xl text-[11px] font-bold  tracking-widest transition-all shrink-0',
							selectedDay === day
								? 'bg-foreground text-background shadow-lg scale-105'
								: 'bg-muted/60 text-muted-foreground hover:bg-muted'
						)}
					>
						{day}
					</button>
				))}
			</div>

			<div className="space-y-3 grow">
				{filteredEvents.map((event) => (
					<m.div
						key={event.id}
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						whileTap={{ scale: 0.99 }}
					>
						<Card
							className={cn(
								'shadow-md border-border/40 overflow-hidden  rounded-xl cursor-pointer transition-all hover:shadow-lg',
								event.isCompleted && 'opacity-75'
							)}
							onClick={() => onBlockClick(event)}
						>
							<CardContent className="p-0 flex">
								<div className={cn('w-1.5 h-full min-h-[88px] shrink-0', event.color)} />

								<div className="flex-1 p-4 min-w-0">
									<div className="flex items-start justify-between gap-3">
										<div className="flex flex-col min-w-0 flex-1">
											<div className="flex items-center gap-2 mb-2">
												<HugeiconsIcon
													icon={Clock01Icon}
													className="w-3.5 h-3.5 text-muted-foreground shrink-0"
												/>
												<span className="text-[11px] font-semibold text-muted-foreground">
													{Math.floor(event.start)}:
													{String(Math.round((event.start % 1) * 60)).padStart(2, '0')} -{' '}
													{Math.floor(event.end)}:
													{String(Math.round((event.end % 1) * 60)).padStart(2, '0')}
												</span>
												{event.isCompleted && (
													<span className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-500/15 text-green-600 text-[10px] font-bold">
														DONE
													</span>
												)}
											</div>

											<h3 className="text-base font-bold  tracking-tight truncate pr-2">
												{event.title}
											</h3>

											<p className="text-[11px] font-semibold text-primary/80  tracking-widest truncate mt-1">
												{event.subject}
											</p>
										</div>

										<div className="flex items-center gap-1 shrink-0">
											<Button
												variant="ghost"
												size="icon"
												className="h-10 w-10 rounded-xl hover:bg-muted"
												onClick={(e) => {
													e.stopPropagation();
													onBlockClick(event);
												}}
											>
												<HugeiconsIcon icon={Edit01Icon} className="w-4 h-4" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												className="h-10 w-10 rounded-xl hover:bg-destructive/10 text-destructive/70 hover:text-destructive"
												onClick={(e) => onDeleteBlock(event.id, e)}
												disabled={isDeleting === event.id}
											>
												{isDeleting === event.id ? (
													<span className="w-4 h-4 border-2 border-destructive/30 border-t-destructive rounded-full animate-spin" />
												) : (
													<HugeiconsIcon icon={Delete02Icon} className="w-4 h-4" />
												)}
											</Button>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</m.div>
				))}

				{filteredEvents.length === 0 && (
					<div className="py-16 text-center">
						<div className="w-20 h-20 rounded-3xl bg-muted/50 flex items-center justify-center mx-auto mb-5">
							<HugeiconsIcon icon={Calendar01Icon} className="w-10 h-10 text-muted-foreground/40" />
						</div>
						<p className="text-sm font-semibold text-muted-foreground  tracking-wider">
							No study blocks
						</p>
						<p className="text-xs text-muted-foreground/60 mt-1">
							Tap "Add Block" to schedule your first session
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
