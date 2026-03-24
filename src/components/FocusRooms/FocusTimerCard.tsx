import { PlayIcon, StopIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function FocusTimerCard({
	isGroupMode,
	timeLeft,
	focusMinutes,
	isActive,
	activeMembersCount,
	onToggleActive,
	formatTime,
}: {
	isGroupMode: boolean;
	timeLeft: number;
	focusMinutes: number;
	isActive: boolean;
	activeMembersCount: number;
	onToggleActive: () => void;
	formatTime: (seconds: number) => string;
}) {
	return (
		<Card className="rounded-[2.5rem] p-8 sm:p-12 text-center bg-card border-border/50 shadow-tiimo overflow-hidden relative">
			<div className="absolute inset-0 bg-primary/5 -z-10" />
			{isGroupMode && (
				<div className="absolute top-4 right-4 px-3 py-1 bg-tiimo-green/10 rounded-full">
					<span className="text-xs font-black  tracking-widest text-tiimo-green">
						Group Mode Active
					</span>
				</div>
			)}
			<div className="space-y-6">
				<h2 className="text-xl font-black  tracking-widest text-primary">
					{isGroupMode ? 'Group Focus Session' : 'Solo Focus Session'}
				</h2>
				<div className="text-8xl font-black tracking-tighter tabular-nums text-foreground">
					{formatTime(timeLeft)}
				</div>
				<div className="flex justify-center gap-4">
					<Button
						size="lg"
						onClick={onToggleActive}
						className={cn(
							'rounded-full px-8 h-16 text-lg font-black  tracking-widest transition-all shadow-xl',
							isActive ? 'bg-tiimo-yellow text-white' : 'bg-primary text-white'
						)}
					>
						<HugeiconsIcon icon={isActive ? StopIcon : PlayIcon} className="w-6 h-6 mr-2" />
						{isActive ? 'Pause' : 'Start Focus'}
					</Button>
				</div>
				<div className="flex items-center justify-center gap-8 text-sm">
					<div className="text-center">
						<p className="text-2xl font-black text-primary tabular-nums">{focusMinutes}</p>
						<p className="text-xs text-muted-foreground">Minutes Today</p>
					</div>
					{isGroupMode && (
						<>
							<div className="w-px h-8 bg-border" />
							<div className="text-center">
								<p className="text-2xl font-black text-tiimo-green tabular-nums">
									{activeMembersCount}
								</p>
								<p className="text-xs text-muted-foreground">Studying Now</p>
							</div>
						</>
					)}
				</div>
			</div>
		</Card>
	);
}
