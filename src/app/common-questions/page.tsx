'use client';

import { FluentEmoji } from '@lobehub/fluent-emoji';
import { useReducer } from 'react';
import { QuestionCard } from '@/components/CommonQuestions/QuestionCard';
import { QuestionDialog } from '@/components/CommonQuestions/QuestionDialog';
import { Button } from '@/components/ui/button';
import {
	COMMON_QUESTIONS,
	type CommonQuestion,
	SUBJECTS,
	type SubjectId,
} from '@/constants/common-questions';

type State = {
	selectedSubject: SubjectId | 'all';
	selectedQuestion: CommonQuestion | null;
	dialogOpen: boolean;
	selectedAnswer: string | null;
	showAnswer: boolean;
	showHint: boolean;
};

type Action =
	| { type: 'SET_SUBJECT'; payload: SubjectId | 'all' }
	| { type: 'OPEN_QUESTION'; payload: CommonQuestion }
	| { type: 'CLOSE_DIALOG' }
	| { type: 'SELECT_ANSWER'; payload: string }
	| { type: 'CHECK_ANSWER' }
	| { type: 'TOGGLE_HINT' };

const initialState: State = {
	selectedSubject: 'all',
	selectedQuestion: null,
	dialogOpen: false,
	selectedAnswer: null,
	showAnswer: false,
	showHint: false,
};

function reducer(state: State, action: Action): State {
	switch (action.type) {
		case 'SET_SUBJECT':
			return { ...state, selectedSubject: action.payload };
		case 'OPEN_QUESTION':
			return {
				...state,
				selectedQuestion: action.payload,
				selectedAnswer: null,
				showAnswer: false,
				showHint: false,
				dialogOpen: true,
			};
		case 'CLOSE_DIALOG':
			return { ...state, dialogOpen: false };
		case 'SELECT_ANSWER':
			return state.showAnswer ? state : { ...state, selectedAnswer: action.payload };
		case 'CHECK_ANSWER':
			return { ...state, showAnswer: true };
		case 'TOGGLE_HINT':
			return { ...state, showHint: !state.showHint };
		default:
			return state;
	}
}

export default function CommonQuestionsPage() {
	const [state, dispatch] = useReducer(reducer, initialState);

	const filteredQuestions =
		state.selectedSubject === 'all'
			? COMMON_QUESTIONS
			: COMMON_QUESTIONS.filter((q) => q.subject === state.selectedSubject);

	return (
		<div className="min-h-screen bg-background pb-40">
			<header className="px-6 pt-12 pb-6 bg-card/50 backdrop-blur-xl sticky top-0 z-10">
				<div className="max-w-4xl mx-auto">
					<h1 className="text-2xl font-bold mb-2">Common exam questions</h1>
					<p className="text-sm text-muted-foreground mb-6">
						Practice frequently asked questions from past NSC papers
					</p>

					<div className="flex flex-wrap gap-2">
						<Button
							variant={state.selectedSubject === 'all' ? 'default' : 'outline'}
							size="sm"
							onClick={() => dispatch({ type: 'SET_SUBJECT', payload: 'all' })}
							className="rounded-full"
						>
							All subjects
						</Button>
						{SUBJECTS.map((subject) => (
							<Button
								key={subject.id}
								variant={state.selectedSubject === subject.id ? 'default' : 'outline'}
								size="sm"
								onClick={() => dispatch({ type: 'SET_SUBJECT', payload: subject.id })}
								className="rounded-full gap-2"
							>
								<FluentEmoji type="3d" emoji={subject.fluentEmoji} size={16} className="w-4 h-4" />
								{subject.label}
							</Button>
						))}
					</div>
				</div>
			</header>

			<main className="px-6 py-6 max-w-4xl mx-auto">
				<p className="text-sm text-muted-foreground mb-4">{filteredQuestions.length} questions</p>

				<div className="space-y-4">
					{filteredQuestions.map((question, index) => (
						<QuestionCard
							key={question.id}
							question={question}
							index={index}
							onClick={(q) => dispatch({ type: 'OPEN_QUESTION', payload: q })}
						/>
					))}
				</div>
			</main>

			{state.selectedQuestion && (
				<QuestionDialog
					question={state.selectedQuestion}
					dialogOpen={state.dialogOpen}
					setDialogOpen={(open) => !open && dispatch({ type: 'CLOSE_DIALOG' })}
					selectedAnswer={state.selectedAnswer}
					onSelectAnswer={(answer) => dispatch({ type: 'SELECT_ANSWER', payload: answer })}
					showAnswer={state.showAnswer}
					onCheckAnswer={() => dispatch({ type: 'CHECK_ANSWER' })}
					showHint={state.showHint}
					onToggleHint={() => dispatch({ type: 'TOGGLE_HINT' })}
				/>
			)}
		</div>
	);
}
