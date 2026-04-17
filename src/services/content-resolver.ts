import { QUESTIONS_DATA } from '@/content/questions';
import type { QuizPaper } from '@/content/questions/quiz/types';
import type { QuizParams } from '@/lib/schemas/quiz-params';

export interface ResolvedQuiz {
	quiz: QuizPaper | null;
	quizId?: string;
	status: 'found' | 'empty' | 'fallback';
	message?: string;
}

class QuizContentResolver {
	async resolveQuiz(params: QuizParams): Promise<ResolvedQuiz> {
		const { subject, category } = params;

		// 1. Try to find exact match if ID was provided (though not explicitly in path, rest of params might have it)
		// Or if we have a specific logic to map subject/category to a quiz ID

		const allQuizzes = Object.entries(QUESTIONS_DATA);

		// If subject is provided
		if (subject) {
			const subjectQuizzes = allQuizzes.filter(([, q]) => q.subject === subject);

			if (subjectQuizzes.length === 0) {
				return {
					quiz: null,
					status: 'empty',
					message: `No quizzes found for subject: ${subject}`,
				};
			}

			// If category is also provided
			if (category) {
				const categoryQuiz = subjectQuizzes.find(([, q]) =>
					q.title.toLowerCase().includes(category.toLowerCase())
				);
				if (categoryQuiz) {
					return {
						quiz: categoryQuiz[1],
						quizId: categoryQuiz[0],
						status: 'found',
					};
				}
				// If category not found, return empty with context as requested (show empty with proper context)
				return {
					quiz: null,
					status: 'empty',
					message: `No quizzes found for category: ${category} in ${subject}`,
				};
			}

			// If only subject is provided, requirement #2 says: "show empty with proper context"
			return {
				quiz: null,
				status: 'empty',
				message: `Please select a specific category for ${subject}`,
			};
		}

		// Absolute fallback to math as per existing (but we want to avoid hardcoding if possible)
		const mathQuiz = QUESTIONS_DATA['math-p1-2023-nov'];
		return {
			quiz: mathQuiz,
			quizId: 'math-p1-2023-nov',
			status: 'fallback',
			message: 'Falling back to default mathematics quiz',
		};
	}
}

export const quizContentResolver = new QuizContentResolver();
