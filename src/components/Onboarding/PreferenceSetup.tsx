import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';

// Mock data for subjects - in real app this would come from API
const availableSubjects = [
	{ id: 'mathematics', name: 'Mathematics', emoji: '🔢' },
	{ id: 'physics', name: 'Physics', emoji: '⚛️' },
	{ id: 'chemistry', name: 'Chemistry', emoji: '🧪' },
	{ id: 'biology', name: 'Biology', emoji: '🧬' },
	{ id: 'english', name: 'English', emoji: '📚' },
	{ id: 'afrikaans', name: 'Afrikaans', emoji: '🇿🇦' },
	{ id: 'history', name: 'History', emoji: '🏛️' },
	{ id: 'geography', name: 'Geography', emoji: '🌍' },
	{ id: 'accounting', name: 'Accounting', emoji: '💰' },
	{ id: 'business', name: 'Business Studies', emoji: '💼' },
	{ id: 'economics', name: 'Economics', emoji: '📊' },
	{ id: 'it', name: 'Information Technology', emoji: '💻' },
];

// ============================================================================
// PREFERENCE SETUP COMPONENT
// ============================================================================

interface PreferenceSetupProps {
	type: 'difficulty' | 'subjects' | 'study';
	responses: Record<string, any>;
	onUpdateResponse: (stepId: string, response: any) => void;
	getResponse: (stepId: string) => any;
}

export function PreferenceSetup({
	type,
	responses,
	onUpdateResponse,
	getResponse,
}: PreferenceSetupProps) {
	switch (type) {
		case 'difficulty':
			return (
				<DifficultySetup
					responses={responses}
					onUpdateResponse={onUpdateResponse}
					getResponse={getResponse}
				/>
			);
		case 'subjects':
			return (
				<SubjectPreferences
					responses={responses}
					onUpdateResponse={onUpdateResponse}
					getResponse={getResponse}
				/>
			);
		case 'study':
			return (
				<StudyPreferences
					responses={responses}
					onUpdateResponse={onUpdateResponse}
					getResponse={getResponse}
				/>
			);
		default:
			return <div>Unknown preference type: {type}</div>;
	}
}

// ============================================================================
// DIFFICULTY SETUP
// ============================================================================

interface DifficultySetupProps {
	responses: Record<string, any>;
	onUpdateResponse: (stepId: string, response: any) => void;
	getResponse: (stepId: string) => any;
}

function DifficultySetup({ onUpdateResponse, getResponse }: DifficultySetupProps) {
	const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>(
		'medium'
	);

	useEffect(() => {
		const existing = getResponse('difficulty_preference') || 'medium';
		setSelectedDifficulty(existing);
	}, [getResponse]);

	const handleDifficultyChange = (difficulty: 'easy' | 'medium' | 'hard') => {
		setSelectedDifficulty(difficulty);
		onUpdateResponse('difficulty_preference', difficulty);
	};

	const difficultyOptions = [
		{
			value: 'easy' as const,
			title: 'Easy',
			description: 'Beginner-friendly content with detailed explanations',
			emoji: '🌱',
			features: [
				'Step-by-step guidance',
				'Basic concepts',
				'Extra examples',
				'Gentle learning curve',
			],
		},
		{
			value: 'medium' as const,
			title: 'Medium',
			description: 'Balanced content for steady progress',
			emoji: '⚖️',
			features: ['Moderate challenge', 'Some independence', 'Good pace', 'Balanced support'],
		},
		{
			value: 'hard' as const,
			title: 'Hard',
			description: 'Advanced content for confident learners',
			emoji: '🏔️',
			features: ['Complex problems', 'Independent learning', 'Fast pace', 'Advanced concepts'],
		},
	];

	return (
		<div className="space-y-6">
			<div className="text-center">
				<h3 className="text-lg font-semibold text-gray-900 mb-2">
					What's your current knowledge level?
				</h3>
				<p className="text-gray-600">
					This helps us start you at the right difficulty. Don't worry - we'll adjust as you learn!
				</p>
			</div>

			<div className="space-y-4">
				{difficultyOptions.map((option) => (
					<Card
						key={option.value}
						className={`cursor-pointer transition-all ${
							selectedDifficulty === option.value
								? 'ring-2 ring-blue-500 bg-blue-50'
								: 'hover:bg-gray-50'
						}`}
						onClick={() => handleDifficultyChange(option.value)}
					>
						<CardContent className="p-4">
							<div className="flex items-start space-x-4">
								<div className="flex-shrink-0">
									<input
										type="radio"
										name="difficulty"
										value={option.value}
										checked={selectedDifficulty === option.value}
										onChange={() => handleDifficultyChange(option.value)}
										className="mt-1"
									/>
								</div>
								<div className="flex-1">
									<div className="flex items-center space-x-2 mb-2">
										<span className="text-2xl">{option.emoji}</span>
										<h4 className="font-semibold text-gray-900">{option.title}</h4>
									</div>
									<p className="text-gray-600 mb-3">{option.description}</p>
									<div className="flex flex-wrap gap-2">
										{option.features.map((feature, index) => (
											<Badge key={index} variant="secondary" className="text-xs">
												{feature}
											</Badge>
										))}
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			<div className="bg-blue-50 p-4 rounded-lg">
				<p className="text-sm text-blue-800">
					<strong>Pro tip:</strong> We recommend starting with Medium difficulty if you're unsure.
					Our adaptive system will quickly adjust to your actual skill level.
				</p>
			</div>
		</div>
	);
}

// ============================================================================
// SUBJECT PREFERENCES
// ============================================================================

interface SubjectPreferencesProps {
	responses: Record<string, any>;
	onUpdateResponse: (stepId: string, response: any) => void;
	getResponse: (stepId: string) => any;
}

function SubjectPreferences({ onUpdateResponse, getResponse }: SubjectPreferencesProps) {
	const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

	useEffect(() => {
		const existing = getResponse('subject_interests') || [];
		setSelectedSubjects(existing);
	}, [getResponse]);

	const handleSubjectToggle = (subjectId: string) => {
		const newSubjects = selectedSubjects.includes(subjectId)
			? selectedSubjects.filter((id) => id !== subjectId)
			: [...selectedSubjects, subjectId];

		setSelectedSubjects(newSubjects);
		onUpdateResponse('subject_interests', newSubjects);
	};

	return (
		<div className="space-y-6">
			<div className="text-center">
				<h3 className="text-lg font-semibold text-gray-900 mb-2">
					Which subjects interest you most?
				</h3>
				<p className="text-gray-600">
					Select the subjects you want to focus on. You can change this anytime.
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{availableSubjects.map((subject) => (
					<Card
						key={subject.id}
						className={`cursor-pointer transition-all ${
							selectedSubjects.includes(subject.id)
								? 'ring-2 ring-blue-500 bg-blue-50'
								: 'hover:bg-gray-50'
						}`}
						onClick={() => handleSubjectToggle(subject.id)}
					>
						<CardContent className="p-4">
							<div className="flex items-center space-x-3">
								<Checkbox
									checked={selectedSubjects.includes(subject.id)}
									onChange={() => handleSubjectToggle(subject.id)}
								/>
								<span className="text-2xl">{subject.emoji}</span>
								<Label className="flex-1 cursor-pointer font-medium">{subject.name}</Label>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{selectedSubjects.length > 0 && (
				<div className="bg-green-50 p-4 rounded-lg">
					<p className="text-sm text-green-800">
						<strong>Great choice!</strong> You've selected {selectedSubjects.length} subject
						{selectedSubjects.length !== 1 ? 's' : ''}. We'll prioritize content from these areas in
						your personalized recommendations.
					</p>
				</div>
			)}

			<div className="bg-gray-50 p-4 rounded-lg">
				<p className="text-sm text-gray-700">
					<strong>Note:</strong> You can always add or remove subjects later. We'll also suggest
					content from related subjects to give you a well-rounded education.
				</p>
			</div>
		</div>
	);
}

// ============================================================================
// STUDY PREFERENCES
// ============================================================================

interface StudyPreferencesProps {
	responses: Record<string, any>;
	onUpdateResponse: (stepId: string, response: any) => void;
	getResponse: (stepId: string) => any;
}

function StudyPreferences({ onUpdateResponse, getResponse }: StudyPreferencesProps) {
	const [sessionDuration, setSessionDuration] = useState([30]);
	const [preferredPace, setPreferredPace] = useState<'slow' | 'moderate' | 'fast'>('moderate');
	const [contentTypes, setContentTypes] = useState<string[]>(['text', 'visual']);

	useEffect(() => {
		const existingDuration = getResponse('session_duration') || 30;
		const existingPace = getResponse('preferred_pace') || 'moderate';
		const existingContentTypes = getResponse('content_types') || ['text', 'visual'];

		setSessionDuration([existingDuration]);
		setPreferredPace(existingPace);
		setContentTypes(existingContentTypes);
	}, [getResponse]);

	const handleDurationChange = (value: number[]) => {
		setSessionDuration(value);
		onUpdateResponse('session_duration', value[0]);
	};

	const handlePaceChange = (pace: 'slow' | 'moderate' | 'fast') => {
		setPreferredPace(pace);
		onUpdateResponse('preferred_pace', pace);
	};

	const handleContentTypeToggle = (contentType: string) => {
		const newTypes = contentTypes.includes(contentType)
			? contentTypes.filter((type) => type !== contentType)
			: [...contentTypes, contentType];

		setContentTypes(newTypes);
		onUpdateResponse('content_types', newTypes);
	};

	const paceOptions = [
		{
			value: 'slow' as const,
			title: 'Slow & Steady',
			description: 'Take your time with detailed explanations',
			emoji: '🐢',
		},
		{
			value: 'moderate' as const,
			title: 'Moderate Pace',
			description: 'Balanced speed with good coverage',
			emoji: '⚖️',
		},
		{
			value: 'fast' as const,
			title: 'Fast Track',
			description: 'Quick progress for confident learners',
			emoji: '🚀',
		},
	];

	const contentTypeOptions = [
		{ id: 'text', label: 'Text & Reading', emoji: '📖' },
		{ id: 'visual', label: 'Visual Aids', emoji: '📊' },
		{ id: 'interactive', label: 'Interactive Exercises', emoji: '🎮' },
		{ id: 'examples', label: 'Real Examples', emoji: '💡' },
		{ id: 'audio', label: 'Audio Content', emoji: '🔊' },
	];

	return (
		<div className="space-y-8">
			{/* Session Duration */}
			<div>
				<h3 className="text-lg font-semibold text-gray-900 mb-2">Preferred Study Session Length</h3>
				<p className="text-gray-600 mb-4">
					How long do you typically want to study in one session?
				</p>
				<div className="px-4">
					<Slider
						value={sessionDuration}
						onValueChange={handleDurationChange}
						max={120}
						min={15}
						step={15}
						className="w-full"
					/>
					<div className="flex justify-between text-sm text-gray-500 mt-2">
						<span>15 min</span>
						<span className="font-semibold">{sessionDuration[0]} minutes</span>
						<span>120 min</span>
					</div>
				</div>
			</div>

			{/* Preferred Pace */}
			<div>
				<h3 className="text-lg font-semibold text-gray-900 mb-2">Learning Pace Preference</h3>
				<p className="text-gray-600 mb-4">
					How quickly do you prefer to progress through material?
				</p>
				<RadioGroup value={preferredPace} onValueChange={handlePaceChange} className="space-y-3">
					{paceOptions.map((option) => (
						<div
							key={option.value}
							className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50"
						>
							<RadioGroupItem value={option.value} id={`pace-${option.value}`} />
							<Label htmlFor={`pace-${option.value}`} className="flex-1 cursor-pointer">
								<div className="flex items-center space-x-2">
									<span>{option.emoji}</span>
									<div>
										<div className="font-medium">{option.title}</div>
										<div className="text-sm text-gray-600">{option.description}</div>
									</div>
								</div>
							</Label>
						</div>
					))}
				</RadioGroup>
			</div>

			{/* Content Types */}
			<div>
				<h3 className="text-lg font-semibold text-gray-900 mb-2">Preferred Content Types</h3>
				<p className="text-gray-600 mb-4">
					What types of content do you enjoy learning with? (Select all that apply)
				</p>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
					{contentTypeOptions.map((option) => (
						<div
							key={option.id}
							className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
								contentTypes.includes(option.id)
									? 'ring-2 ring-blue-500 bg-blue-50'
									: 'hover:bg-gray-50'
							}`}
							onClick={() => handleContentTypeToggle(option.id)}
							role="button"
							tabIndex={0}
							onKeyDown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									handleContentTypeToggle(option.id);
								}
							}}
						>
							<Checkbox
								checked={contentTypes.includes(option.id)}
								onChange={() => handleContentTypeToggle(option.id)}
							/>
							<span>{option.emoji}</span>
							<Label className="flex-1 cursor-pointer font-medium">{option.label}</Label>
						</div>
					))}
				</div>
			</div>

			<div className="bg-blue-50 p-4 rounded-lg">
				<p className="text-sm text-blue-800">
					<strong>Perfect!</strong> These preferences will help us create study sessions and
					recommend content that matches your learning style and schedule.
				</p>
			</div>
		</div>
	);
}
