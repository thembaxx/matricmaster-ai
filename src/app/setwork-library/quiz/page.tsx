import type { Metadata } from 'next';

import { appConfig } from '@/app.config';
import { quizQuestions, setworks } from '@/content/setworks';
import { QuizContent } from './quiz-content';

export const metadata: Metadata = {
	title: `Setwork Quiz | ${appConfig.name} AI`,
	description: 'Test your knowledge of prescribed setworks.',
};

export default function QuizPage() {
	return (
		<div className="flex flex-col h-full">
			<header className="px-6 pt-12 pb-40 bg-card border-b border-border">
				<h1 className="text-xl font-black">Setwork Quiz</h1>
				<p className="text-muted-foreground mt-2">
					Test your knowledge of characters, themes, and plot
				</p>
			</header>

			<main className="flex-1 p-6">
				<QuizContent setworks={setworks} quizQuestions={quizQuestions} />
			</main>
		</div>
	);
}
