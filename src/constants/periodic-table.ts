import type { ELEMENTS } from '@/content/element-details';

export const GROUP_COLORS: Record<string, string> = {
	nonmetal: 'bg-primary-violet/20 border-primary-violet/30 text-primary-violet',
	noble: 'bg-accent-blue/20 border-accent-blue/30 text-accent-blue',
	alkali: 'bg-primary-orange/20 border-primary-orange/30 text-primary-orange',
	alkaline: 'bg-tiimo-yellow/20 border-tiimo-yellow/30 text-tiimo-yellow',
	metalloid: 'bg-tiimo-green/20 border-tiimo-green/30 text-tiimo-green',
	halogen: 'bg-destructive/20 border-destructive/30 text-destructive',
	transition: 'bg-blue-500/20 border-blue-500/30 text-blue-500',
	metal: 'bg-zinc-400/20 border-zinc-400/30 text-zinc-600 dark:text-zinc-300',
	lanthanide: 'bg-pink-400/20 border-pink-400/30 text-pink-600',
	actinide: 'bg-red-400/20 border-red-400/30 text-red-600',
	synthetic: 'bg-gray-400/20 border-gray-400/30 text-gray-500',
};

export const CATEGORY_LABELS: Record<string, string> = {
	nonmetal: 'Nonmetal',
	noble: 'Noble Gas',
	alkali: 'Alkali Metal',
	alkaline: 'Alkaline Earth Metal',
	metalloid: 'Metalloid',
	halogen: 'Halogen',
	transition: 'Transition Metal',
	metal: 'Post-Transition Metal',
	lanthanide: 'Lanthanide',
	actinide: 'Actinide',
	synthetic: 'Synthetic Element',
};

export type ElementType = (typeof ELEMENTS)[number];

export type QuizQuestion = {
	question: string;
	options: string[];
	correctAnswer: number;
	explanation: string;
	elementNum?: number;
};

export type TrendMode =
	| 'electronegativity'
	| 'atomicRadius'
	| 'ionizationEnergy'
	| 'density'
	| null;

export interface ElementComparisonData {
	elements: ElementType[];
	details: Record<number, ElementDetail>;
}

export interface ElementDetail {
	electronegativity: number | null;
	atomicRadius: number | null;
	ionizationEnergy: number | null;
	density: string;
	meltingPoint: string;
	boilingPoint: string;
	practiceQuestions?: Array<{
		question: string;
		options: string[];
		answer: number;
	}>;
}
