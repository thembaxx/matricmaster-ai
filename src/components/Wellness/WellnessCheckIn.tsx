'use client';

import { Pause, RefreshCw, StopCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { BreakNeedsSelector } from './BreakNeedsSelector';
import { CrisisResourcesModal } from './CrisisResourcesModal';
import { FrustrationToggle } from './FrustrationToggle';
import { MoodSelector } from './MoodSelector';
import { useWellnessForm } from './useWellnessForm';

export interface WellnessCheckInData {
	mood: number;
	isFrustrated: boolean;
	needsBreak: 'yes' | 'no' | 'suggestions';
}

export interface WellnessCheckInProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onContinue: () => void;
	onTakeBreak: () => void;
	onSwitchTopic: () => void;
	onEndSession: () => void;
	triggerType: 'study_duration' | 'consecutive_wrong';
	consecutiveWrong?: number;
	studyDuration?: number;
}

export function WellnessCheckIn({
	open,
	onOpenChange,
	onContinue,
	onTakeBreak,
	onSwitchTopic,
	onEndSession,
	triggerType,
	consecutiveWrong = 0,
	studyDuration = 0,
}: WellnessCheckInProps) {
	const {
		mood,
		isFrustrated,
		needsBreak,
		showCrisisResources,
		moodGroupId,
		frustrationGroupId,
		breakGroupId,
		isBurnedOut,
		setMood,
		setIsFrustrated,
		setNeedsBreak,
		setShowCrisisResources,
		resetForm,
		getFormData,
	} = useWellnessForm();

	const handleAction = (action: 'continue' | 'break' | 'switch' | 'end') => {
		console.log('Wellness check-in submitted:', getFormData());

		switch (action) {
			case 'continue':
				onContinue();
				break;
			case 'break':
				onTakeBreak();
				break;
			case 'switch':
				onSwitchTopic();
				break;
			case 'end':
				onEndSession();
				break;
		}

		resetForm();
		onOpenChange(false);
	};

	const handleSubmit = () => {
		if (isBurnedOut) {
			setShowCrisisResources(true);
			return;
		}
		handleAction('continue');
	};

	const handleClose = () => {
		resetForm();
		onOpenChange(false);
	};

	if (showCrisisResources) {
		return (
			<CrisisResourcesModal
				open={open}
				onOpenChange={handleClose}
				onGoBack={() => setShowCrisisResources(false)}
				onEndSession={() => handleAction('end')}
			/>
		);
	}

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<span className="text-primary">❤️</span>
						How are you doing?
					</DialogTitle>
					<DialogDescription>
						{triggerType === 'study_duration'
							? `You've been studying for ${studyDuration} minutes. Let's check in.`
							: `You've had ${consecutiveWrong} wrong answers in a row. No worries, let's take a moment.`}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6 py-4">
					<MoodSelector value={mood} onChange={setMood} groupId={moodGroupId} />

					<FrustrationToggle
						value={isFrustrated}
						onChange={setIsFrustrated}
						groupId={frustrationGroupId}
					/>

					<BreakNeedsSelector value={needsBreak} onChange={setNeedsBreak} groupId={breakGroupId} />
				</div>

				<DialogFooter className="flex-col sm:flex-row gap-2">
					<Button
						variant="outline"
						onClick={() => handleAction('end')}
						className="w-full sm:w-auto"
					>
						<StopCircle className="h-4 w-4 mr-1" />
						End session
					</Button>
					<div className="flex gap-2 flex-1">
						<Button variant="secondary" onClick={() => handleAction('switch')} className="flex-1">
							<RefreshCw className="h-4 w-4 mr-1" />
							Switch topic
						</Button>
						<Button variant="secondary" onClick={() => handleAction('break')} className="flex-1">
							<Pause className="h-4 w-4 mr-1" />
							Take 5-min break
						</Button>
					</div>
				</DialogFooter>

				{mood !== null && isFrustrated !== null && needsBreak !== null && (
					<div className="mt-2">
						<Button onClick={handleSubmit} className="w-full" size="lg">
							{isBurnedOut ? 'See support options' : 'Continue studying'}
						</Button>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
