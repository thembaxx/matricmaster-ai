import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AiContextType =
	| 'idle'
	| 'quiz'
	| 'pastPaper'
	| 'lesson'
	| 'flashcard'
	| 'snapAndSolve'
	| 'voiceTutor'
	| 'curriculumMap';

export interface AiContextMetadata {
	questionText?: string;
	extractedOcr?: string;
	solutionPreview?: string;
	subjectName?: string;
	topicName?: string;
}

export interface AiContext {
	type: AiContextType;
	subject?: string;
	topic?: string;
	paperId?: string;
	lessonId?: string;
	questionId?: string;
	relatedTopics?: string[];
	metadata?: AiContextMetadata;
	isProactive?: boolean;
	lastUpdated: number;
}

interface AiContextStore {
	context: AiContext;
	setContext: (context: Partial<AiContext>) => void;
	clearContext: () => void;
	pushToHistory: (context: AiContext) => void;
	history: AiContext[];
}

const initialContext: AiContext = {
	type: 'idle',
	lastUpdated: Date.now(),
};

export const useAiContextStore = create<AiContextStore>()(
	persist(
		(set, _get) => ({
			context: initialContext,

			setContext: (newContext) => {
				set((state) => ({
					context: {
						...state.context,
						...newContext,
						lastUpdated: Date.now(),
					},
				}));
			},

			clearContext: () => {
				set({ context: initialContext });
			},

			pushToHistory: (context) => {
				set((state) => ({
					history: [context, ...state.history].slice(0, 10),
				}));
			},

			history: [],
		}),
		{
			name: 'ai-context-storage',
		}
	)
);
