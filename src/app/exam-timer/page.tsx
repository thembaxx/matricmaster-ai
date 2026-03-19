'use client';

import { Clock01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { ExamPreset } from '@/components/ExamTimer/constants';
import { EXAM_PRESETS, formatTime } from '@/components/ExamTimer/constants';
import { PresetSelector } from '@/components/ExamTimer/PresetSelector';
import { SettingsCard } from '@/components/ExamTimer/SettingsCard';
import { TimerDisplay } from '@/components/ExamTimer/TimerDisplay';
import { ExamCompleteModal } from '@/components/FocusMode/ExamCompleteModal';
import { FocusLayout } from '@/components/FocusMode/FocusLayout';
import { useFocusMode } from '@/contexts/FocusModeContext';

export default function ExamTimerPage() {
	const [selectedPreset, setSelectedPreset] = useState<ExamPreset>(EXAM_PRESETS[0]);
	const [customDuration, setCustomDuration] = useState(60);
	const [timeRemaining, setTimeRemaining] = useState(EXAM_PRESETS[0].duration * 60);
	const [isRunning, setIsRunning] = useState(false);
	const [showWarning, setShowWarning] = useState(false);
	const [warningMinutes, setWarningMinutes] = useState(10);
	const [enableSound, setEnableSound] = useState(true);
	const [examName, setExamName] = useState('');

	const { startFocusMode, isFocusMode, state, completeExam } = useFocusMode();

	const totalSeconds =
		selectedPreset.name === 'Custom' ? customDuration * 60 : selectedPreset.duration * 60;
	const elapsedSeconds = totalSeconds - timeRemaining;
	const progress = ((totalSeconds - timeRemaining) / totalSeconds) * 100;

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
						if (isFocusMode) {
							completeExam();
						}
					}

					return newTime;
				});
			}, 1000);
		}

		return () => clearInterval(interval);
	}, [
		isRunning,
		timeRemaining,
		warningMinutes,
		showWarning,
		enableSound,
		isFocusMode,
		completeExam,
	]);

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
					<div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 mb-4">
						<HugeiconsIcon icon={Clock01Icon} className="w-8 h-8 text-primary" />
					</div>
					<h1 className="text-3xl font-bold mb-2">Exam Timer</h1>
					<p className="text-muted-foreground">
						Practice under real exam conditions with our timer
					</p>
				</div>

				<PresetSelector
					selectedPreset={selectedPreset}
					customDuration={customDuration}
					onPresetSelect={handlePresetSelect}
					onCustomDurationChange={handleCustomDurationChange}
				/>

				<TimerDisplay
					examName={examName}
					timeRemaining={timeRemaining}
					progress={progress}
					isRunning={isRunning}
					showWarning={showWarning}
					timeColor={getTimeColor()}
					progressColor={getProgressColor()}
					onExamNameChange={setExamName}
					onStart={handleStart}
					onPause={handlePause}
					onReset={handleReset}
					onStartFocusMode={startFocusMode}
				/>

				<SettingsCard
					warningMinutes={warningMinutes}
					enableSound={enableSound}
					onWarningMinutesChange={setWarningMinutes}
					onEnableSoundChange={setEnableSound}
				/>

				<div className="mt-6 text-center text-sm text-muted-foreground">
					<p>
						Elapsed: {formatTime(elapsedSeconds)} | Remaining: {formatTime(timeRemaining)}
					</p>
				</div>
			</div>

			{isFocusMode && (
				<FocusLayout timeRemaining={timeRemaining} totalTime={totalSeconds}>
					<div className="max-w-2xl mx-auto p-6">
						<div className="rounded-lg border bg-card text-card-foreground shadow-sm">
							<div className="flex flex-col space-y-1.5 p-6">
								<h3 className="text-2xl font-semibold leading-none tracking-tight">
									{examName || selectedPreset.name}
								</h3>
							</div>
							<div className="p-6 pt-0">
								<p className="text-muted-foreground">
									This is a focus mode session. Answer your questions here. AI features are
									temporarily disabled.
								</p>
							</div>
						</div>
					</div>
				</FocusLayout>
			)}

			{state === 'completed' && <ExamCompleteModal />}
		</div>
	);
}
