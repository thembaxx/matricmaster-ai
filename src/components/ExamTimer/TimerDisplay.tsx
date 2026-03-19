import {
	Notification01Icon,
	PauseIcon,
	PlayIcon,
	RefreshIcon,
	ViewIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatTime } from './constants';

interface TimerDisplayProps {
	examName: string;
	timeRemaining: number;
	progress: number;
	isRunning: boolean;
	showWarning: boolean;
	timeColor: string;
	progressColor: string;
	onExamNameChange: (name: string) => void;
	onStart: () => void;
	onPause: () => void;
	onReset: () => void;
	onStartFocusMode: () => void;
}

export function TimerDisplay({
	examName,
	timeRemaining,
	progress,
	isRunning,
	showWarning,
	timeColor,
	progressColor,
	onExamNameChange,
	onStart,
	onPause,
	onReset,
	onStartFocusMode,
}: TimerDisplayProps) {
	return (
		<Card className="mb-6">
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<input
						type="text"
						placeholder="Enter exam name (optional)"
						value={examName}
						onChange={(e) => onExamNameChange(e.target.value)}
						className="bg-transparent border-none text-xl font-bold focus:outline-none focus:ring-0 w-full placeholder:text-muted-foreground/50"
						aria-label="Exam name"
					/>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="text-center py-8">
					<div className={`text-7xl font-bold tracking-wider mb-8 font-mono ${timeColor}`}>
						{formatTime(timeRemaining)}
					</div>

					<div className="w-full h-3 rounded-full bg-secondary overflow-hidden mb-8">
						<div
							className={`h-full transition-all duration-1000 ${progressColor}`}
							style={{ width: `${progress}%` }}
						/>
					</div>

					<div className="flex items-center justify-center gap-4">
						{!isRunning ? (
							<>
								<Button size="lg" onClick={onStart} className="px-8">
									<HugeiconsIcon icon={PlayIcon} className="w-5 h-5 mr-2" />
									Start
								</Button>
								<Button
									size="lg"
									variant="secondary"
									onClick={() => {
										onStart();
										onStartFocusMode();
									}}
									className="px-8"
								>
									<HugeiconsIcon icon={ViewIcon} className="w-5 h-5 mr-2" />
									Focus Mode
								</Button>
							</>
						) : (
							<Button size="lg" variant="outline" onClick={onPause} className="px-8">
								<HugeiconsIcon icon={PauseIcon} className="w-5 h-5 mr-2" />
								Pause
							</Button>
						)}

						<Button size="lg" variant="ghost" onClick={onReset} aria-label="Reset timer">
							<HugeiconsIcon icon={RefreshIcon} className="w-5 h-5" />
						</Button>
					</div>

					{showWarning && (
						<Badge variant="destructive" className="mt-6 animate-pulse">
							<HugeiconsIcon icon={Notification01Icon} className="w-4 h-4 mr-1" />
							Time is running out!
						</Badge>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
