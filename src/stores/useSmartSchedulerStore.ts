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

	moveBlock: (blockId: string, newDate: Date, newStartTime?: string) => {
		const { blocks } = get();
		const block = blocks.find((b) => b.id === blockId);
		if (!block) return;

		let newStartHour = block.startTime;
		if (newStartTime) {
			newStartHour = newStartTime;
		}

		const [hour, min] = newStartHour.split(':').map(Number);
		const endHour = hour + Math.floor((hour * 60 + min + block.duration) / 60);
		const endMin = String((hour * 60 + min + block.duration) % 60).padStart(2, '0');
		const newEndTime = `${endHour.toString().padStart(2, '0')}:${endMin}`;

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
			console.error('Failed to check adaptive schedule:', error);
			return null;
		} finally {
			set({ isLoading: false });
		}
	},

	saveBlock: async (block: Partial<StudyBlock>) => {
		const { addBlock, updateBlock } = get();
		try {
			if (block.id) {
				updateBlock(block.id, block);
				await fetch(`/api/smart-scheduler/blocks/${block.id}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(block),
				});
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
				await fetch('/api/smart-scheduler/blocks', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(newBlock),
				});
			}
		} catch (error) {
			console.error('Failed to save block:', error);
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
			console.error('Failed to save imported blocks:', error);
		}
	},
}));
