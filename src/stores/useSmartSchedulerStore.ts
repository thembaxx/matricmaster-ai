import * as Sentry from '@sentry/nextjs';
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

	toggleBlockComplete: async (id) => {
		const { blocks } = get();
		const block = blocks.find((b) => b.id === id);
		if (!block) return;

		const newCompleted = !block.isCompleted;
		set((state) => ({
			blocks: state.blocks.map((b) => (b.id === id ? { ...b, isCompleted: newCompleted } : b)),
		}));

		try {
			await fetch('/api/smart-scheduler/blocks', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id, isCompleted: newCompleted }),
			});
		} catch (error) {
			Sentry.captureException(error);
			console.error('Failed to toggle block completion:', error);
			set((state) => ({
				blocks: state.blocks.map((b) => (b.id === id ? { ...b, isCompleted: !newCompleted } : b)),
			}));
		}
	},

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
			Sentry.captureException(error);
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
				exams: data.exams || [],
			});
		} catch (error) {
			Sentry.captureException(error);
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
				body: JSON.stringify({ completedBlocks, blocks }),
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
			Sentry.captureException(error);
			console.error('Failed to optimize schedule:', error);
		} finally {
			set({ isGenerating: false });
		}
	},

	moveBlock: (blockId: string, newDate: Date, newStartTime?: string) => {
		const { blocks } = get();
		const block = blocks.find((b) => b.id === blockId);
		if (!block) return;

		const newStartHour = newStartTime || block.startTime;
		const [hour, min] = newStartHour.split(':').map(Number);
		const endMin = hour * 60 + min + block.duration;
		const endH = Math.floor(endMin / 60);
		const endM = String(endMin % 60).padStart(2, '0');
		const newEndTime = `${endH.toString().padStart(2, '0')}:${endM}`;

		get().updateBlock(blockId, {
			date: newDate,
			startTime: newStartHour,
			endTime: newEndTime,
		});
	},

	checkAdaptiveSchedule: async () => {
		set({ isLoading: true });
		try {
			const response = await fetch('/api/smart-scheduler/adaptive', {
				method: 'POST',
			});
			const data = await response.json();
			if (data.rescheduled && data.rescheduled.length > 0) {
				set((state) => ({
					blocks: state.blocks.map((b) => {
						const rescheduled = data.rescheduled.find((r: { id: string }) => r.id === b.id);
						return rescheduled || b;
					}),
					suggestions: [...state.suggestions, ...(data.newSuggestions || [])],
				}));
			}
			return data;
		} catch (error) {
			Sentry.captureException(error);
			console.error('Failed to check adaptive schedule:', error);
			return null;
		} finally {
			set({ isLoading: false });
		}
	},

	saveBlock: async (block: Partial<StudyBlock>) => {
		const { addBlock, updateBlock, removeBlock } = get();
		try {
			if (block.id) {
				updateBlock(block.id, block);
				const response = await fetch('/api/smart-scheduler/blocks', {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(block),
				});
				if (!response.ok) {
					throw new Error('Failed to update block');
				}
			} else {
				const newBlock: StudyBlock = {
					id: crypto.randomUUID(),
					subject: block.subject || 'General',
					topic: block.topic,
					date: block.date || new Date(),
					startTime: block.startTime || '09:00',
					endTime: block.endTime || '10:00',
					duration: block.duration || 60,
					type: block.type || 'study',
					isCompleted: false,
					isAISuggested: false,
				};
				addBlock(newBlock);
				const response = await fetch('/api/smart-scheduler/blocks', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(newBlock),
				});
				if (!response.ok) {
					removeBlock(newBlock.id);
					throw new Error('Failed to create block');
				}
			}
		} catch (error) {
			Sentry.captureException(error);
			console.error('Failed to save block:', error);
			throw error;
		}
	},

	deleteBlock: async (blockId: string) => {
		const { blocks } = get();
		const removed = blocks.find((b) => b.id === blockId);

		set((state) => ({
			blocks: state.blocks.filter((b) => b.id !== blockId),
		}));

		try {
			const response = await fetch(`/api/smart-scheduler/blocks?id=${blockId}`, {
				method: 'DELETE',
			});
			if (!response.ok) {
				throw new Error('Failed to delete block');
			}
		} catch (error) {
			Sentry.captureException(error);
			console.error('Failed to delete block:', error);
			if (removed) {
				set((state) => ({
					blocks: [...state.blocks, removed].sort((a, b) => {
						const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
						if (dateCompare !== 0) return dateCompare;
						return a.startTime.localeCompare(b.startTime);
					}),
				}));
			}
			throw error;
		}
	},

	importStudyPathBlocks: (pathBlocks: StudyBlock[]) => {
		const { blocks } = get();
		const mergedBlocks = [...blocks];

		for (const pathBlock of pathBlocks) {
			const existingIndex = mergedBlocks.findIndex(
				(b) =>
					new Date(b.date).toDateString() === new Date(pathBlock.date).toDateString() &&
					b.startTime === pathBlock.startTime
			);

			if (existingIndex === -1) {
				mergedBlocks.push(pathBlock);
			} else {
				const existing = mergedBlocks[existingIndex];
				if (existing.isCompleted) {
					const conflictBlock: StudyBlock = {
						...pathBlock,
						id: `${pathBlock.id}-conflict`,
						topic: `${pathBlock.topic} (Path - moved)`,
					};
					mergedBlocks.push(conflictBlock);
				} else {
					mergedBlocks[existingIndex] = {
						...existing,
						subject: pathBlock.subject,
						topic: pathBlock.topic,
						duration: Math.max(existing.duration, pathBlock.duration),
						isAISuggested: true,
					};
				}
			}
		}

		mergedBlocks.sort((a, b) => {
			const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
			if (dateCompare !== 0) return dateCompare;
			return a.startTime.localeCompare(b.startTime);
		});

		set({ blocks: mergedBlocks });
	},

	saveImportedBlocks: async (pathBlocks: StudyBlock[]) => {
		const { importStudyPathBlocks } = get();
		importStudyPathBlocks(pathBlocks);

		try {
			await Promise.all(
				pathBlocks.map((block) =>
					fetch('/api/smart-scheduler/blocks', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(block),
					})
				)
			);
		} catch (error) {
			Sentry.captureException(error);
			console.error('Failed to save imported blocks:', error);
		}
	},

	rescheduleForEnergy: async () => {
		const { blocks } = get();
		set({ isLoading: true });
		try {
			const response = await fetch('/api/smart-scheduler/reschedule-energy', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ blocks }),
			});
			const data = await response.json();
			if (data.rescheduled) {
				set({ blocks: data.rescheduled });
			}
		} catch (error) {
			Sentry.captureException(error);
			console.error('Failed to reschedule for energy:', error);
		} finally {
			set({ isLoading: false });
		}
	},

	rescheduleForLoadShedding: async () => {
		const { blocks } = get();
		set({ isLoading: true });
		try {
			const response = await fetch('/api/smart-scheduler/reschedule-loadshedding', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ blocks }),
			});
			const data = await response.json();
			if (data.rescheduled) {
				set({ blocks: data.rescheduled });
			}
		} catch (error) {
			Sentry.captureException(error);
			console.error('Failed to reschedule for load shedding:', error);
		} finally {
			set({ isLoading: false });
		}
	},

	applyBurnoutProtection: async () => {
		set({ isLoading: true });
		try {
			const response = await fetch('/api/smart-scheduler/burnout-protection', {
				method: 'POST',
			});
			const data = await response.json();
			if (data.adjustedBlocks) {
				set({ blocks: data.adjustedBlocks });
			}
		} catch (error) {
			Sentry.captureException(error);
			console.error('Failed to apply burnout protection:', error);
		} finally {
			set({ isLoading: false });
		}
	},
}));
