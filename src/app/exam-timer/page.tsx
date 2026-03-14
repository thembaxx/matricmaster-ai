'use client';

import {
	Clock01Icon,
	Notification01Icon,
	PauseIcon,
	PlayIcon,
	RefreshIcon,
	Settings01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

interface ExamPreset {
	name: string;
	duration: number;
	description: string;
}

const EXAM_PRESETS: ExamPreset[] = [
	{ name: 'Mathematics Paper 1', duration: 180, description: '3 hours - Pure Mathematics' },
	{ name: 'Mathematics Paper 2', duration: 180, description: '3 hours - Geometry & Trigonometry' },
	{ name: 'Physical Sciences', duration: 180, description: '3 hours - Physics & Chemistry' },
	{ name: 'Life Sciences', duration: 150, description: '2.5 hours - Biology' },
	{ name: 'Geography', duration: 180, description: '3 hours - Theory & Mapwork' },
	{ name: 'History', duration: 120, description: '2 hours - South Africa & World' },
	{ name: 'Accounting', duration: 180, description: '3 hours - Financial Statements' },
	{ name: 'English Home Language', duration: 180, description: '3 hours - Comprehension & Essay' },
	{ name: 'Custom', duration: 60, description: 'Set your own time' },
];

export default function ExamTimerPage() {
	const [selectedPreset, setSelectedPreset] = useState<ExamPreset>(EXAM_PRESETS[0]);
	const [customDuration, setCustomDuration] = useState(60);
	const [timeRemaining, setTimeRemaining] = useState(EXAM_PRESETS[0].duration * 60);
	const [isRunning, setIsRunning] = useState(false);
	const [showWarning, setShowWarning] = useState(false);
	const [warningMinutes, setWarningMinutes] = useState(10);
	const [enableSound, setEnableSound] = useState(true);
	const [examName, setExamName] = useState('');

	const totalSeconds =
		selectedPreset.name === 'Custom' ? customDuration * 60 : selectedPreset.duration * 60;
	const elapsedSeconds = totalSeconds - timeRemaining;
	const progress = ((totalSeconds - timeRemaining) / totalSeconds) * 100;

	const formatTime = (seconds: number) => {
		const hrs = Math.floor(seconds / 3600);
		const mins = Math.floor((seconds % 3600) / 60);
		const secs = seconds % 60;
		if (hrs > 0) {
			return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
		}
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	};

	const formatDuration = (minutes: number) => {
		const hrs = Math.floor(minutes / 60);
		const mins = minutes % 60;
		if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
		if (hrs > 0) return `${hrs} hour${hrs > 1 ? 's' : ''}`;
		return `${mins} min`;
	};

	const handleStart = () => {
		setIsRunning(true);
		toast.success('Exam timer started - Good luck!');
	};

	const handlePause = () => {
		setIsRunning(false);
		toast.info('Exam timer paused');
	};

	const handleReset = () => {
		setIsRunning(false);
		setTimeRemaining(
			selectedPreset.name === 'Custom' ? customDuration * 60 : selectedPreset.duration * 60
		);
		setShowWarning(false);
		toast.info('Exam timer reset');
	};

	const handlePresetSelect = (preset: ExamPreset) => {
		setSelectedPreset(preset);
		setIsRunning(false);
		setShowWarning(false);
		setTimeRemaining(preset.name === 'Custom' ? customDuration * 60 : preset.duration * 60);
	};

	const handleCustomDurationChange = (value: number[]) => {
		const mins = value[0];
		setCustomDuration(mins);
		setTimeRemaining(mins * 60);
	};

	useEffect(() => {
		let interval: NodeJS.Timeout;

		if (isRunning && timeRemaining > 0) {
			interval = setInterval(() => {
				setTimeRemaining((prev) => {
					const newTime = prev - 1;

					if (newTime <= warningMinutes * 60 && newTime > 0 && !showWarning) {
						setShowWarning(true);
						if (enableSound) {
							toast.warning(`${warningMinutes} minutes remaining!`, {
								duration: 10000,
							});
						}
					}

					if (newTime === 0) {
						setIsRunning(false);
						if (enableSound) {
							toast.error("Time's up! Submit your answers now.");
						}
					}

					return newTime;
				});
			}, 1000);
		}

		return () => clearInterval(interval);
	}, [isRunning, timeRemaining, warningMinutes, showWarning, enableSound]);

	const getTimeColor = () => {
		if (showWarning) return 'text-red-500';
		if (timeRemaining < 30 * 60) return 'text-orange-500';
		return 'text-foreground';
	};

	const getProgressColor = () => {
		if (showWarning) return 'bg-red-500';
		if (timeRemaining < 30 * 60) return 'bg-orange-500';
		return 'bg-primary';
	};

	return (
		<div className="min-h-screen pb-40 pt-8 px-4">
			<div className="max-w-2xl mx-auto">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
						<HugeiconsIcon icon={Clock01Icon} className="w-8 h-8" />
						Exam Timer
					</h1>
					<p className="text-muted-foreground">
						Practice under real exam conditions with our timer
					</p>
				</div>

				<Card className="mb-6">
					<CardHeader>
						<CardTitle>Select Exam Type</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
							{EXAM_PRESETS.map((preset) => (
								<button
									type="button"
									key={preset.name}
									onClick={() => handlePresetSelect(preset)}
									className={`p-3 rounded-lg border text-left transition-all ${
										selectedPreset.name === preset.name
											? 'border-primary bg-primary/10'
											: 'hover:border-primary/50'
									}`}
								>
									<div className="font-medium text-sm">{preset.name}</div>
									<div className="text-xs text-muted-foreground">
										{formatDuration(preset.duration)}
									</div>
								</button>
							))}
						</div>

						{selectedPreset.name === 'Custom' && (
							<div className="mt-4 p-4 rounded-lg border">
								<Label>Duration: {customDuration} minutes</Label>
								<Slider
									value={[customDuration]}
									onValueChange={handleCustomDurationChange}
									min={15}
									max={240}
									step={15}
									className="mt-2"
								/>
							</div>
						)}
					</CardContent>
				</Card>

				<Card className="mb-6">
					<CardHeader>
						<CardTitle className="flex items-center justify-between">
							<input
								type="text"
								placeholder="Enter exam name (optional)"
								value={examName}
								onChange={(e) => setExamName(e.target.value)}
								className="bg-transparent border-none text-xl font-bold focus:outline-none focus:ring-0 w-full"
							/>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-center py-8">
							<div className={`text-7xl font-bold tracking-wider mb-8 ${getTimeColor()}`}>
								{formatTime(timeRemaining)}
							</div>

							<div className="w-full h-3 rounded-full bg-secondary overflow-hidden mb-8">
								<div
									className={`h-full transition-all duration-1000 ${getProgressColor()}`}
									style={{ width: `${progress}%` }}
								/>
							</div>

							<div className="flex items-center justify-center gap-4">
								{!isRunning ? (
									<Button size="lg" onClick={handleStart} className="px-8">
										<HugeiconsIcon icon={PlayIcon} className="w-5 h-5 mr-2" />
										Start
									</Button>
								) : (
									<Button size="lg" variant="outline" onClick={handlePause} className="px-8">
										<HugeiconsIcon icon={PauseIcon} className="w-5 h-5 mr-2" />
										Pause
									</Button>
								)}

								<Button size="lg" variant="ghost" onClick={handleReset}>
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

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<HugeiconsIcon icon={Settings01Icon} className="w-5 h-5" />
							Timer Settings
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<div>
								<Label>Warning Alert</Label>
								<p className="text-sm text-muted-foreground">
									Get notified when time is running low
								</p>
							</div>
							<select
								value={warningMinutes}
								onChange={(e) => setWarningMinutes(Number(e.target.value))}
								className="h-9 px-3 rounded-lg border bg-background text-sm"
							>
								<option value={5}>5 minutes</option>
								<option value={10}>10 minutes</option>
								<option value={15}>15 minutes</option>
								<option value={30}>30 minutes</option>
							</select>
						</div>

						<div className="flex items-center justify-between">
							<div>
								<Label>Sound Alerts</Label>
								<p className="text-sm text-muted-foreground">Play sound when time is up</p>
							</div>
							<Switch checked={enableSound} onCheckedChange={setEnableSound} />
						</div>
					</CardContent>
				</Card>

				<div className="mt-6 text-center text-sm text-muted-foreground">
					<p>
						Elapsed: {formatTime(elapsedSeconds)} | Remaining: {formatTime(timeRemaining)}
					</p>
				</div>
			</div>
		</div>
	);
}
