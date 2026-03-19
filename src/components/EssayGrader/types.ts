export interface GradingResult {
	totalScore: number;
	breakdown: {
		content: number;
		structure: number;
		argument: number;
		language: number;
	};
	strengths: string[];
	improvements: string[];
	detailedFeedback: string;
	suggestedGrade: string;
}
