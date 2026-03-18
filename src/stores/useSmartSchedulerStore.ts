import { format, startOfWeek } from 'date-fns';
import { create } from 'zustand';
import type { SmartSchedulerState, StudyBlock } from '@/types/smart-scheduler';

export const useSmartSchedulerStore = create<SmartSchedulerState>((set, get) => ({
	currentWeek: startOfWeek(new Date(), { weekStartsOn: 1 }),
	selectedDate: new Date(),
	viewMode: 'week',
	blocks: [],
	suggestions: [],
	exams: [],
	isLoading: false,
	isGenerating: false,

	setCurrentWeek: (date) => set({ currentWeek: date }),
	setSelectedDate: (date) => set({ selectedDate: date }),
	setViewMode: (mode) => set({ viewMode: mode }),
	setBlocks: (blocks) => set({ blocks }),

	addBlock: (block) => set((state) => ({ blocks: [...state.blocks, block] })),

	updateBlock: (id, updates) =>
		set((state) => ({
			blocks: state.blocks.map((b) => (b.id === id ? { ...b, ...updates } : b)),
		})),

	removeBlock: (id) =>
		set((state) => ({
			blocks: state.blocks.filter((b) => b.id !== id),
		})),

	toggleBlockComplete: (id) =>
		set((state) => ({
			blocks: state.blocks.map((b) => (b.id === id ? { ...b, isCompleted: !b.isCompleted } : b)),
		})),

	setSuggestions: (suggestions) => set({ suggestions }),

	acceptSuggestion: (id) => {
		const { suggestions, addBlock } = get();
		const suggestion = suggestions.find((s) => s.id === id);
		if (suggestion) {
			const newBlock: StudyBlock = {
				id: crypto.randomUUID(),
				subject: suggestion.block.subject || '',
				topic: suggestion.block.topic,
				date: suggestion.block.date || new Date(),
				startTime: suggestion.block.startTime || '09:00',
				endTime: suggestion.block.endTime || '10:00',
				duration: suggestion.block.duration || 60,
				type: suggestion.block.type || 'study',
				isCompleted: false,
				isAISuggested: true,
			};
			addBlock(newBlock);
			set((state) => ({
				suggestions: state.suggestions.filter((s) => s.id !== id),
			}));
		}
	},

	dismissSuggestion: (id) =>
		set((state) => ({
			suggestions: state.suggestions.filter((s) => s.id !== id),
		})),

	setExams: (exams) => set({ exams }),
	setLoading: (loading) => set({ isLoading: loading }),
	setGenerating: (generating) => set({ isGenerating: generating }),

	loadSchedule: async () => {
		const { currentWeek } = get();
		set({ isLoading: true });
		try {
			const weekStr = format(currentWeek, 'yyyy-II');
			const response = await fetch(`/api/smart-scheduler/blocks?week=${weekStr}`);
			const data = await response.json();
			set({ blocks: data.blocks || [], exams: data.exams || [] });
		} catch (error) {
			console.error('Failed to load schedule:', error);
		} finally {
			set({ isLoading: false });
		}
	},

	generateSchedule: async () => {
		set({ isGenerating: true });
		try {
			const response = await fetch('/api/smart-scheduler/generate', {
				method: 'POST',
			});
			const data = await response.json();
			set({
				blocks: data.blocks || [],
				suggestions: data.suggestions || [],
			});
		} catch (error) {
			console.error('Failed to generate schedule:', error);
		} finally {
			set({ isGenerating: false });
		}
	},

	optimizeSchedule: async () => {
		const { blocks } = get();
		set({ isGenerating: true });
		try {
			const completedBlocks = blocks.filter((b) => b.isCompleted).map((b) => b.id);
			const response = await fetch('/api/smart-scheduler/optimize', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ completedBlocks }),
			});
			const data = await response.json();
			set((state) => ({
				blocks: [
					...state.blocks.filter((b) => !completedBlocks.includes(b.id)),
					...(data.rescheduled || []),
				],
				suggestions: data.newSuggestions || [],
			}));
		} catch (error) {
			console.error('Failed to optimize schedule:', error);
		} finally {
			set({ isGenerating: false });
		}
	},
}));
