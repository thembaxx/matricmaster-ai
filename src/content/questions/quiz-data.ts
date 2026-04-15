import { ACCOUNTING_QUIZ } from './quiz/accounting';
import { BUSINESS_STUDIES_QUIZ } from './quiz/business-studies';
import { CHEMISTRY_QUIZ } from './quiz/chemistry';
import { ECONOMICS_QUIZ } from './quiz/economics';
import { GEOGRAPHY_QUIZ } from './quiz/geography';
import { LIFE_SCIENCES_QUIZ } from './quiz/life-sciences';
import { MATHEMATICS_QUIZ } from './quiz/mathematics';
import { PHYSICS_QUIZ } from './quiz/physics';
import { PRACTICE_QUIZ } from './quiz/practice';
import { SHORT_ANSWER_QUIZ } from './quiz/sample-short-answer';
import type { QuizData } from './quiz/types';

export * from './quiz/types';

export const QUIZ_DATA: QuizData = {
	...MATHEMATICS_QUIZ,
	...PHYSICS_QUIZ,
	...CHEMISTRY_QUIZ,
	...LIFE_SCIENCES_QUIZ,
	...GEOGRAPHY_QUIZ,
	...ACCOUNTING_QUIZ,
	...ECONOMICS_QUIZ,
	...BUSINESS_STUDIES_QUIZ,
	...PRACTICE_QUIZ,
	...SHORT_ANSWER_QUIZ,
};
