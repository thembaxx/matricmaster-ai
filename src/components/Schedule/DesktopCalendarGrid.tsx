import { motion as m } from 'motion/react';

import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { UIEvent } from './constants';
import { DAYS, HOURS } from './constants';

interface DesktopCalendarGridProps {
	events: UIEvent[];
	selectedDay: string;
	onBlockClick: (event: UIEvent) => void;
}

export function DesktopCalendarGrid({
	events,
	selectedDay,
	onBlockClick,
}: DesktopCalendarGridProps) {
	return (
		<div className="hidden lg:block bg-card rounded-[2.5rem] border border-border/50 shadow-tiimo overflow-hidden">
			<div className="grid grid-cols-8 border-b border-border/50">
				<div className="p-4 border-r border-border/50" />
				{DAYS.map((day) => (
					<div
						key={day}
						className={cn(
							'p-4 text-center font-black  text-[10px] tracking-widest border-r border-border/50 last:border-r-0',
							day === selectedDay ? 'text-primary' : 'text-muted-foreground'
						)}
					>
						{day}
					</div>
				))}
			</div>

			<ScrollArea className="h-[600px]">
				<div className="grid grid-cols-8 relative">
					<div className="col-span-1 border-r border-border/50">
						{HOURS.map((hour) => (
							<div
								key={hour}
								className="h-20 p-2 text-[10px] font-bold text-muted-foreground/50 text-right border-b border-border/10"
							>
								{hour}:00
							</div>
						))}
					</div>

					{DAYS.map((day) => (
						<div
							key={day}
							className="col-span-1 relative border-r border-border/50 last:border-r-0"
						>
							{HOURS.map((hour) => (
								<div key={hour} className="h-20 border-b border-border/10" />
							))}

							{events
								.filter((e) => e.day === day)
								.map((event) => (
									<m.div
										key={event.id}
										initial={{ opacity: 0, scale: 0.9 }}
										animate={{ opacity: 1, scale: 1 }}
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
										className={cn(
											'absolute left-1 right-1 rounded-xl p-3 shadow-lg border border-white/10 overflow-hidden cursor-pointer group',
											event.color
										)}
										style={{
											top: `${(event.start - 8) * 80}px`,
											height: `${(event.end - event.start) * 80}px`,
										}}
										onClick={() => onBlockClick(event)}
										onKeyDown={(e) => {
											if (e.key === 'Enter' || e.key === ' ') {
												onBlockClick(event);
											}
										}}
										role="button"
										tabIndex={0}
									>
										<div className="flex flex-col h-full">
											<div className="flex items-start justify-between">
												<p className="text-[8px] font-black text-white/70  tracking-widest truncate flex-1">
													{event.subject}
												</p>
												{event.isCompleted && (
													<div className="shrink-0 -mt-1">
														<div className="size-4 rounded-full bg-white/20 flex items-center justify-center">
															<svg
																aria-label="Completed"
																className="w-2.5 h-2.5 text-white"
																fill="none"
																viewBox="0 0 24 24"
																stroke="currentColor"
															>
																<path
																	strokeLinecap="round"
																	strokeLinejoin="round"
																	strokeWidth={3}
																	d="M5 13l4 4L19 7"
																/>
															</svg>
														</div>
													</div>
												)}
											</div>
											<p className="text-xs font-black text-white truncate mt-auto">
												{event.title}
											</p>
										</div>
									</m.div>
								))}
						</div>
					))}
				</div>
			</ScrollArea>
		</div>
	);
}
