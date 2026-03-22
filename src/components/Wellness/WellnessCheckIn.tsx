'use client';

import { Heart, Pause, RefreshCw, StopCircle, Sun, Thermometer, Volume2 } from 'lucide-react';
import { useId, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

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

const MOOD_OPTIONS = [
	{ value: 1, label: 'Struggling', icon: Thermometer },
	{ value: 2, label: 'Difficult', icon: Volume2 },
	{ value: 3, label: 'Okay', icon: Sun },
	{ value: 4, label: 'Good', icon: Heart },
	{ value: 5, label: 'Great', icon: RefreshCw },
];

const CRISIS_RESOURCES = [
	{ name: 'SA Depression & Anxiety Group', phone: '080 056 78 78' },
	{ name: 'Lifeline', phone: '086 132 23 22' },
	{ name: 'Suicide Crisis Line', phone: '080 567 678' },
];

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
	const moodGroupId = useId();
	const frustrationGroupId = useId();
	const breakGroupId = useId();
	const [mood, setMood] = useState<number | null>(null);
	const [isFrustrated, setIsFrustrated] = useState<boolean | null>(null);
	const [needsBreak, setNeedsBreak] = useState<'yes' | 'no' | 'suggestions' | null>(null);
	const [showCrisisResources, setShowCrisisResources] = useState(false);

	const isBurnedOut = needsBreak === 'yes' || isFrustrated;

	const handleSubmit = () => {
		if (isBurnedOut) {
			setShowCrisisResources(true);
			return;
		}
		handleAction('continue');
	};

	const handleAction = (action: 'continue' | 'break' | 'switch' | 'end') => {
		const data: WellnessCheckInData = {
			mood: mood ?? 3,
			isFrustrated: isFrustrated ?? false,
			needsBreak: needsBreak ?? 'no',
		};
		console.log('Wellness check-in submitted:', data);

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

	const resetForm = () => {
		setMood(null);
		setIsFrustrated(null);
		setNeedsBreak(null);
		setShowCrisisResources(false);
	};

	const handleClose = () => {
		resetForm();
		onOpenChange(false);
	};

	if (showCrisisResources) {
		return (
			<Dialog open={open} onOpenChange={handleClose}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-destructive">
							<Heart className="h-5 w-5" />
							We care about you
						</DialogTitle>
						<DialogDescription>
							It looks like you might be having a tough time. Please reach out to these resources -
							they are here to help you.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-3 py-4">
						{CRISIS_RESOURCES.map((resource) => (
							<div
								key={resource.name}
								className="flex items-center justify-between p-3 rounded-lg border bg-card"
							>
								<span className="text-sm font-medium">{resource.name}</span>
								<a
									href={`tel:${resource.phone.replace(/\s/g, '')}`}
									className="text-sm text-primary hover:underline"
								>
									{resource.phone}
								</a>
							</div>
						))}
					</div>

					<DialogFooter className="flex-col sm:flex-row gap-2">
						<Button
							variant="outline"
							onClick={() => setShowCrisisResources(false)}
							className="w-full"
						>
							Go back
						</Button>
						<Button variant="destructive" onClick={() => handleAction('end')} className="w-full">
							End session
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Heart className="h-5 w-5 text-primary" />
						How are you doing?
					</DialogTitle>
					<DialogDescription>
						{triggerType === 'study_duration'
							? `You've been studying for ${studyDuration} minutes. Let's check in.`
							: `You've had ${consecutiveWrong} wrong answers in a row. No worries, let's take a moment.`}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6 py-4">
					<fieldset className="space-y-3">
						<legend className="text-sm font-medium">How are you feeling?</legend>
						<div
							className="flex justify-between gap-2"
							role="radiogroup"
							aria-labelledby={moodGroupId}
						>
							{MOOD_OPTIONS.map((option) => {
								const Icon = option.icon;
								const isSelected = mood === option.value;
								return (
									<button
										key={option.value}
										type="button"
										onClick={() => setMood(option.value)}
										role="radio"
										aria-checked={isSelected}
										aria-label={option.label}
										className={cn(
											'flex flex-col items-center gap-1 p-3 rounded-lg border transition-all',
											'hover:border-primary/50 hover:bg-primary/5',
											'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
											isSelected && 'border-primary bg-primary/10 ring-1 ring-primary'
										)}
									>
										<Icon
											className={cn(
												'h-6 w-6',
												isSelected ? 'text-primary' : 'text-muted-foreground'
											)}
										/>
										<span className="text-xs text-muted-foreground">{option.label}</span>
									</button>
								);
							})}
						</div>
					</fieldset>

					<fieldset className="space-y-3">
						<legend className="text-sm font-medium">Is this getting frustrating?</legend>
						<div className="flex gap-2" role="radiogroup" aria-labelledby={frustrationGroupId}>
							<button
								type="button"
								onClick={() => setIsFrustrated(true)}
								role="radio"
								aria-checked={isFrustrated === true}
								className={cn(
									'flex-1 py-2 px-4 rounded-md border text-sm font-medium transition-colors',
									'hover:border-primary/50 hover:bg-primary/5',
									'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
									isFrustrated === true
										? 'border-primary bg-primary/10 text-primary'
										: 'border-input bg-background'
								)}
							>
								Yes
							</button>
							<button
								type="button"
								onClick={() => setIsFrustrated(false)}
								role="radio"
								aria-checked={isFrustrated === false}
								className={cn(
									'flex-1 py-2 px-4 rounded-md border text-sm font-medium transition-colors',
									'hover:border-primary/50 hover:bg-primary/5',
									'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
									isFrustrated === false
										? 'border-primary bg-primary/10 text-primary'
										: 'border-input bg-background'
								)}
							>
								No
							</button>
						</div>
					</fieldset>

					<fieldset className="space-y-3">
						<legend className="text-sm font-medium">Need a break?</legend>
						<div className="flex flex-wrap gap-2" role="radiogroup" aria-labelledby={breakGroupId}>
							<button
								type="button"
								onClick={() => setNeedsBreak('yes')}
								role="radio"
								aria-checked={needsBreak === 'yes'}
								className={cn(
									'flex-1 py-2 px-4 rounded-md border text-sm font-medium transition-colors min-w-[80px]',
									'hover:border-primary/50 hover:bg-primary/5',
									'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
									needsBreak === 'yes'
										? 'border-primary bg-primary/10 text-primary'
										: 'border-input bg-background'
								)}
							>
								Yes
							</button>
							<button
								type="button"
								onClick={() => setNeedsBreak('no')}
								role="radio"
								aria-checked={needsBreak === 'no'}
								className={cn(
									'flex-1 py-2 px-4 rounded-md border text-sm font-medium transition-colors min-w-[80px]',
									'hover:border-primary/50 hover:bg-primary/5',
									'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
									needsBreak === 'no'
										? 'border-primary bg-primary/10 text-primary'
										: 'border-input bg-background'
								)}
							>
								No
							</button>
							<button
								type="button"
								onClick={() => setNeedsBreak('suggestions')}
								role="radio"
								aria-checked={needsBreak === 'suggestions'}
								className={cn(
									'flex-1 py-2 px-4 rounded-md border text-sm font-medium transition-colors min-w-[80px]',
									'hover:border-primary/50 hover:bg-primary/5',
									'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
									needsBreak === 'suggestions'
										? 'border-primary bg-primary/10 text-primary'
										: 'border-input bg-background'
								)}
							>
								Suggestions
							</button>
						</div>
					</fieldset>
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
