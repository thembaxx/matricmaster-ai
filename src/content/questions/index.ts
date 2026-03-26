import type { QuizData } from '@/constants/quiz/types';
import accounting from './accounting.json';
import chemistry from './chemistry.json';
import geography from './geography.json';
import lifeSciences from './life-sciences.json';
import mathematics from './mathematics.json';
import physics from './physics.json';
import practice from './practice.json';
import sampleShortAnswer from './sample-short-answer.json';

export const QUESTIONS_DATA: QuizData = {
	...(mathematics as QuizData),
	...(physics as QuizData),
	...(chemistry as QuizData),
	...(lifeSciences as QuizData),
	...(geography as QuizData),
	...(accounting as QuizData),
	...(practice as QuizData),
	...(sampleShortAnswer as QuizData),
};
