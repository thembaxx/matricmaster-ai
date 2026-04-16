import type { QuizParams } from './schemas/quiz-params';

export function buildQuizUrl(params: QuizParams & { id?: string }): string {
	const { subject, category, id, ...rest } = params;
	let url = '/quiz';

	if (id) {
		url += `/v/${id}`;
	} else if (subject) {
		url += `/${subject}`;
		if (category) {
			url += `/${category}`;
		}
	}

	const searchParams = new URLSearchParams();
	for (const [key, value] of Object.entries(rest)) {
		if (value !== undefined && value !== null) {
			searchParams.append(key, String(value));
		}
	}

	const queryString = searchParams.toString();
	return queryString ? `${url}?${queryString}` : url;
}

export function parseQuizUrl(path: string, searchParams: URLSearchParams): QuizParams {
	const parts = path.split('/').filter(Boolean);
	// Parts expected: ['quiz', subject, category]
	const subject = parts[1];
	const category = parts[2];

	const params: Record<string, any> = {
		subject,
		category,
	};

	for (const [key, value] of searchParams.entries()) {
		params[key] = value;
	}

	return params as QuizParams;
}
