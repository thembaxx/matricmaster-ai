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
	const [warningMinutes, setWarningMinutes] = useState(10);
	const [enableSound, setEnableSound] = useState(true);
	const [examName, setExamName] = useState('');
	const [isTimerRunning, setIsTimerRunning] = useState(false);
	const [isRestored, setIsRestored] = useState(false);

	const { startFocusMode, isFocusMode, state, completeExam } = useFocusMode();

	const STORAGE_KEY = 'lumni_exam_timer_state';

	useEffect(() => {
		try {
			const saved = localStorage.getItem(STORAGE_KEY);
			if (saved) {
				const parsed = JSON.parse(saved);
				if (Date.now() - parsed.lastUpdated < 24 * 60 * 60 * 1000) {
					if (parsed.timeRemaining !== undefined) setTimeRemaining(parsed.timeRemaining);
					if (parsed.examName !== undefined) setExamName(parsed.examName);
					if (parsed.customDuration !== undefined) setCustomDuration(parsed.customDuration);
					if (parsed.warningMinutes !== undefined) setWarningMinutes(parsed.warningMinutes);
					if (parsed.enableSound !== undefined) setEnableSound(parsed.enableSound);
					if (parsed.isTimerRunning !== undefined) setIsTimerRunning(parsed.isTimerRunning);

					if (parsed.selectedPresetName) {
						const foundPreset = EXAM_PRESETS.find((p) => p.name === parsed.selectedPresetName);
						if (foundPreset) setSelectedPreset(foundPreset);
					}
					toast.info('Timer session restored', { duration: 3000 });
				}
			}
		} catch (e) {
			console.error('Failed to parse saved exam timer state', e);
		} finally {
			setIsRestored(true);
		}
	}, []);

	useEffect(() => {
		if (!isRestored) return;
		localStorage.setItem(
			STORAGE_KEY,
			JSON.stringify({
				timeRemaining,
				examName,
				customDuration,
				warningMinutes,
				enableSound,
				isTimerRunning,
				selectedPresetName: selectedPreset.name,
				lastUpdated: Date.now(),
			})
		);
	}, [
		timeRemaining,
		isTimerRunning,
		examName,
		customDuration,
		warningMinutes,
		enableSound,
		selectedPreset.name,
		isRestored,
	]);

	const totalSeconds =
		selectedPreset.name === 'Custom' ? customDuration * 60 : selectedPreset.duration * 60;

	const isRunning = isTimerRunning && timeRemaining > 0;
	const showWarning = timeRemaining <= warningMinutes * 60 && timeRemaining > 0;
	const elapsedSeconds = totalSeconds - timeRemaining;
	const progress = ((totalSeconds - timeRemaining) / totalSeconds) * 100;

	const handleStart = () => {
		setIsTimerRunning(true);
		setTimeRemaining((prev) => (prev === 0 ? totalSeconds : prev));
		toast.success('Exam timer started - Good luck!');
	};

	const handlePause = () => {
		setIsTimerRunning(false);
		toast.info('Exam timer paused');
	};

	const handleReset = () => {
		setIsTimerRunning(false);
		setTimeRemaining(totalSeconds);
		localStorage.removeItem(STORAGE_KEY);
		toast.info('Exam timer reset');
	};

	const handlePresetSelect = (preset: ExamPreset) => {
		setSelectedPreset(preset);
		setTimeRemaining(preset.name === 'Custom' ? customDuration * 60 : preset.duration * 60);
		setIsTimerRunning(false);
	};

	const handleCustomDurationChange = (value: number[]) => {
		const mins = value[0];
		setCustomDuration(mins);
		setTimeRemaining(mins * 60);
		setIsTimerRunning(false);
	};

	useEffect(() => {
		let interval: NodeJS.Timeout;

		if (isRunning && timeRemaining > 0) {
			interval = setInterval(() => {
				setTimeRemaining((prev) => {
					const newTime = prev - 1;

					if (newTime <= warningMinutes * 60 && newTime > 0) {
						if (enableSound) {
							toast.warning(`${warningMinutes} minutes remaining!`, {
								duration: 10000,
							});
						}
					}

					if (newTime === 0) {
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
	}, [isRunning, timeRemaining, warningMinutes, enableSound, isFocusMode, completeExam]);

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
							<div className="flex flex-col gap-1.5 p-6">
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
