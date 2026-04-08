import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { calculateLearningStyle, learningStyleQuestions } from '../../hooks/useOnboarding';

// ============================================================================
// LEARNING STYLE QUIZ COMPONENT
// ============================================================================

interface LearningStyleQuizProps {
	responses: Record<string, any>;
	onUpdateResponse: (stepId: string, response: any) => void;
}

export function LearningStyleQuiz({ responses, onUpdateResponse }: LearningStyleQuizProps) {
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
	const [isComplete, setIsComplete] = useState(false);

	const currentQuestion = learningStyleQuestions[currentQuestionIndex];
	const totalQuestions = learningStyleQuestions.length;

	useEffect(() => {
		// Load existing responses
		const existing = responses.learning_style_quiz || {};
		setSelectedAnswers(existing);
	}, [responses]);

	useEffect(() => {
		// Check if quiz is complete
		const answeredQuestions = Object.keys(selectedAnswers).length;
		setIsComplete(answeredQuestions === totalQuestions);
	}, [selectedAnswers]);

	const handleAnswerSelect = (questionId: string, style: string) => {
		const newAnswers = { ...selectedAnswers, [questionId]: style };
		setSelectedAnswers(newAnswers);

		// Save to parent component
		onUpdateResponse('learning_style_quiz', newAnswers);

		// Calculate and save learning style
		if (Object.keys(newAnswers).length === totalQuestions) {
			const learningStyle = calculateLearningStyle(newAnswers);
			onUpdateResponse('learning_style', learningStyle);
		}
	};

	const handleNext = () => {
		if (currentQuestionIndex < totalQuestions - 1) {
			setCurrentQuestionIndex((prev) => prev + 1);
		}
	};

	const handlePrevious = () => {
		if (currentQuestionIndex > 0) {
			setCurrentQuestionIndex((prev) => prev - 1);
		}
	};

	const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

	if (isComplete) {
		const learningStyle = calculateLearningStyle(selectedAnswers);
		return <LearningStyleResult learningStyle={learningStyle} />;
	}

	return (
		<div className="space-y-6">
			{/* Progress indicator */}
			<div className="space-y-2">
				<div className="flex justify-between text-sm text-gray-600">
					<span>
						Question {currentQuestionIndex + 1} of {totalQuestions}
					</span>
					<span>{Math.round(progress)}% complete</span>
				</div>
				<div className="w-full bg-gray-200 rounded-full h-2">
					<div
						className="bg-blue-600 h-2 rounded-full transition-all duration-300"
						style={{ width: `${progress}%` }}
					/>
				</div>
			</div>

			{/* Question card */}
			<Card>
				<CardContent className="pt-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">{currentQuestion.question}</h3>

					<RadioGroup
						value={selectedAnswers[currentQuestion.questionId] || ''}
						onValueChange={(value) => handleAnswerSelect(currentQuestion.questionId, value)}
						className="space-y-3"
					>
						{currentQuestion.options.map((option, index) => (
							<div
								key={index}
								className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
							>
								<RadioGroupItem
									value={option.style}
									id={`${currentQuestion.questionId}-${option.style}`}
								/>
								<Label
									htmlFor={`${currentQuestion.questionId}-${option.style}`}
									className="flex-1 cursor-pointer"
								>
									{option.text}
								</Label>
							</div>
						))}
					</RadioGroup>
				</CardContent>
			</Card>

			{/* Navigation */}
			<div className="flex justify-between">
				<Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
					Previous
				</Button>

				<Button onClick={handleNext} disabled={!selectedAnswers[currentQuestion.questionId]}>
					{currentQuestionIndex === totalQuestions - 1 ? 'Complete Quiz' : 'Next'}
				</Button>
			</div>

			{/* Question dots */}
			<div className="flex justify-center space-x-2">
				{learningStyleQuestions.map((_, index) => (
					<div
						key={index}
						className={`w-3 h-3 rounded-full ${
							index === currentQuestionIndex
								? 'bg-blue-600'
								: selectedAnswers[learningStyleQuestions[index].questionId]
									? 'bg-green-500'
									: 'bg-gray-300'
						}`}
					/>
				))}
			</div>
		</div>
	);
}

// ============================================================================
// LEARNING STYLE RESULT COMPONENT
// ============================================================================

interface LearningStyleResultProps {
	learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
}

function LearningStyleResult({ learningStyle }: LearningStyleResultProps) {
	const styleInfo = {
		visual: {
			title: 'Visual Learner',
			description: 'You learn best through seeing and visualizing information.',
			emoji: '👁️',
			strengths: ['Diagrams and charts', 'Color-coded notes', 'Visual demonstrations', 'Mind maps'],
			tips: [
				'Use flashcards with images',
				'Watch video explanations',
				'Draw diagrams when solving problems',
				'Use color to organize information',
			],
		},
		auditory: {
			title: 'Auditory Learner',
			description: 'You learn best through listening and verbal communication.',
			emoji: '🔊',
			strengths: [
				'Lectures and discussions',
				'Audio recordings',
				'Group study',
				'Verbal explanations',
			],
			tips: [
				'Read notes out loud',
				'Record and listen to explanations',
				'Discuss concepts with others',
				'Use mnemonic devices',
			],
		},
		kinesthetic: {
			title: 'Kinesthetic Learner',
			description: 'You learn best through hands-on experiences and physical activity.',
			emoji: '🤝',
			strengths: [
				'Hands-on activities',
				'Real-world applications',
				'Movement while learning',
				'Building and creating',
			],
			tips: [
				'Use physical objects when studying',
				'Take breaks to move around',
				'Practice problems actively',
				'Create physical models',
			],
		},
		reading: {
			title: 'Reading/Writing Learner',
			description: 'You learn best through reading and writing activities.',
			emoji: '📚',
			strengths: [
				'Textbooks and articles',
				'Taking notes',
				'Writing summaries',
				'Lists and outlines',
			],
			tips: [
				'Take detailed notes',
				'Rewrite information in your own words',
				'Create study guides',
				'Read explanations multiple times',
			],
		},
	};

	const info = styleInfo[learningStyle];

	return (
		<div className="text-center space-y-6">
			<div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
				<span className="text-4xl">{info.emoji}</span>
			</div>

			<div>
				<h3 className="text-2xl font-bold text-gray-900 mb-2">{info.title}</h3>
				<p className="text-gray-600">{info.description}</p>
			</div>

			<div className="grid md:grid-cols-2 gap-6">
				<div className="bg-green-50 p-4 rounded-lg">
					<h4 className="font-semibold text-green-800 mb-2">Your Strengths</h4>
					<ul className="text-sm text-green-700 space-y-1">
						{info.strengths.map((strength, index) => (
							<li key={index}>• {strength}</li>
						))}
					</ul>
				</div>

				<div className="bg-blue-50 p-4 rounded-lg">
					<h4 className="font-semibold text-blue-800 mb-2">Study Tips</h4>
					<ul className="text-sm text-blue-700 space-y-1">
						{info.tips.map((tip, index) => (
							<li key={index}>• {tip}</li>
						))}
					</ul>
				</div>
			</div>

			<div className="bg-gray-50 p-4 rounded-lg">
				<p className="text-sm text-gray-700">
					<strong>Note:</strong> Most people have a mix of learning styles. We'll adapt content to
					match your preferences while also exposing you to other styles for well-rounded learning.
				</p>
			</div>
		</div>
	);
}
