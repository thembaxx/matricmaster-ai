'use client';

import { useCallback, useEffect, useId, useReducer, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	createQuestionAction,
	getQuestionWithOptionsAction,
	softDeleteQuestionAction,
	updateQuestionAction,
} from '@/lib/db/actions';
import type { Question, Subject } from '@/lib/db/schema';
import { uploadFiles } from '@/lib/uploadthing';
import { QuestionBasicTab } from './QuestionBasicTab';
import { QuestionCard } from './QuestionCard';
import { QuestionContentTab } from './QuestionContentTab';
import { QuestionOptionsTab } from './QuestionOptionsTab';

export interface QuestionFormData {
	id?: string;
	questionText: string;
	imageUrl?: string | null;
	subjectId: number;
	gradeLevel: number;
	topic: string;
	difficulty: 'easy' | 'medium' | 'hard';
	marks: number;
	options: OptionFormData[];
}

export interface OptionFormData {
	id?: string;
	optionLetter: string;
	optionText: string;
	isCorrect: boolean;
	explanation: string;
}

const EMPTY_QUESTION: QuestionFormData = {
	questionText: '',
	imageUrl: null,
	subjectId: 0,
	gradeLevel: 12,
	topic: '',
	difficulty: 'medium',
	marks: 2,
	options: [
		{ optionLetter: 'A', optionText: '', isCorrect: false, explanation: '' },
		{ optionLetter: 'B', optionText: '', isCorrect: false, explanation: '' },
	],
};

interface QuestionManagerProps {
	questions: Question[];
	subjects: Subject[];
	subjectMap: Map<number, string>;
	onRefresh: () => void;
	openCreateTrigger?: number;
}

type State = {
	isModalOpen: boolean;
	editingQuestion: QuestionFormData | null;
	originalImageUrl: string | null;
	drawerTab: 'basic' | 'question' | 'options';
	localImageFile: File | null;
	localImagePreview: string | null;
	isSaving: boolean;
};

type Action =
	| { type: 'OPEN_MODAL'; payload: QuestionFormData | null }
	| { type: 'CLOSE_MODAL' }
	| { type: 'SET_EDITING_QUESTION'; payload: QuestionFormData }
	| { type: 'SET_ORIGINAL_IMAGE_URL'; payload: string | null }
	| { type: 'SET_DRAWER_TAB'; payload: 'basic' | 'question' | 'options' }
	| { type: 'SET_IMAGE_FILE'; payload: File | null }
	| { type: 'SET_IMAGE_PREVIEW'; payload: string | null }
	| { type: 'SET_SAVING'; payload: boolean }
	| { type: 'UPDATE_QUESTION_FIELD'; payload: Partial<QuestionFormData> }
	| { type: 'CLEAR_IMAGE_STATE' };

const initialState: State = {
	isModalOpen: false,
	editingQuestion: null,
	originalImageUrl: null,
	drawerTab: 'basic',
	localImageFile: null,
	localImagePreview: null,
	isSaving: false,
};

function reducer(state: State, action: Action): State {
	switch (action.type) {
		case 'OPEN_MODAL':
			return {
				...state,
				isModalOpen: true,
				editingQuestion: action.payload,
				localImageFile: null,
				localImagePreview: null,
				drawerTab: 'basic',
			};
		case 'CLOSE_MODAL':
			return { ...state, isModalOpen: false, drawerTab: 'basic' };
		case 'SET_EDITING_QUESTION':
			return { ...state, editingQuestion: action.payload };
		case 'SET_ORIGINAL_IMAGE_URL':
			return { ...state, originalImageUrl: action.payload };
		case 'SET_DRAWER_TAB':
			return { ...state, drawerTab: action.payload };
		case 'SET_IMAGE_FILE':
			return { ...state, localImageFile: action.payload };
		case 'SET_IMAGE_PREVIEW':
			return { ...state, localImagePreview: action.payload };
		case 'SET_SAVING':
			return { ...state, isSaving: action.payload };
		case 'UPDATE_QUESTION_FIELD':
			return state.editingQuestion
				? { ...state, editingQuestion: { ...state.editingQuestion, ...action.payload } }
				: state;
		case 'CLEAR_IMAGE_STATE':
			return { ...state, localImageFile: null, localImagePreview: null, originalImageUrl: null };
		default:
			return state;
	}
}

export function QuestionManager({
	questions,
	subjects,
	subjectMap,
	onRefresh,
	openCreateTrigger,
}: QuestionManagerProps) {
	const [state, dispatch] = useReducer(reducer, initialState);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const fileInputId = useId();

	const handleCreateQuestion = useCallback(() => {
		dispatch({ type: 'OPEN_MODAL', payload: { ...EMPTY_QUESTION } });
	}, []);

	useEffect(() => {
		if (openCreateTrigger) {
			handleCreateQuestion();
		}
	}, [openCreateTrigger, handleCreateQuestion]);

	const handleEditQuestion = async (question: Question) => {
		const questionWithOptions = await getQuestionWithOptionsAction(question.id);
		if (questionWithOptions) {
			const formData: QuestionFormData = {
				id: questionWithOptions.id,
				questionText: questionWithOptions.questionText,
				imageUrl: questionWithOptions.imageUrl || null,
				subjectId: questionWithOptions.subjectId,
				gradeLevel: questionWithOptions.gradeLevel,
				topic: questionWithOptions.topic,
				difficulty: questionWithOptions.difficulty as 'easy' | 'medium' | 'hard',
				marks: questionWithOptions.marks,
				options: questionWithOptions.options.map((opt) => ({
					id: opt.id,
					optionLetter: opt.optionLetter,
					optionText: opt.optionText,
					isCorrect: opt.isCorrect,
					explanation: opt.explanation || '',
				})),
			};
			dispatch({ type: 'OPEN_MODAL', payload: formData });
			dispatch({ type: 'SET_ORIGINAL_IMAGE_URL', payload: questionWithOptions.imageUrl || null });
		}
	};

	const handleDeleteQuestion = async (id: string) => {
		if (confirm('Are you sure you want to delete this question?')) {
			try {
				await softDeleteQuestionAction(id);
				toast.success('Question deleted');
				onRefresh();
			} catch (error) {
				console.debug('Failed to delete question:', error);
				toast.error('Failed to delete question');
			}
		}
	};

	const handleSaveQuestion = async () => {
		if (!state.editingQuestion) return;

		if (!state.editingQuestion.questionText.trim()) {
			toast.error('Please enter a question');
			dispatch({ type: 'SET_DRAWER_TAB', payload: 'question' });
			return;
		}
		if (state.editingQuestion.subjectId === 0) {
			toast.error('Please select a subject');
			dispatch({ type: 'SET_DRAWER_TAB', payload: 'basic' });
			return;
		}
		if (!state.editingQuestion.topic.trim()) {
			toast.error('Please enter a topic');
			dispatch({ type: 'SET_DRAWER_TAB', payload: 'basic' });
			return;
		}
		if (state.editingQuestion.options.some((opt) => !opt.optionText.trim())) {
			toast.error('Please fill in all option texts');
			dispatch({ type: 'SET_DRAWER_TAB', payload: 'options' });
			return;
		}
		if (!state.editingQuestion.options.some((opt) => opt.isCorrect)) {
			toast.error('Please select at least one correct answer');
			dispatch({ type: 'SET_DRAWER_TAB', payload: 'options' });
			return;
		}

		try {
			dispatch({ type: 'SET_SAVING', payload: true });
			let imageUrlToSave = state.editingQuestion.imageUrl;

			if (state.localImageFile) {
				const uploadResult = await uploadFiles('questionImage', {
					files: [state.localImageFile],
				});
				if (uploadResult?.[0]?.ufsUrl) {
					imageUrlToSave = uploadResult[0].ufsUrl;
				} else {
					toast.error('Failed to upload image. Please try again.');
					return;
				}
			} else if (
				state.editingQuestion.id &&
				state.originalImageUrl &&
				!state.editingQuestion.imageUrl
			) {
				imageUrlToSave = null;
			}

			const questionData = {
				subjectId: state.editingQuestion.subjectId,
				questionText: state.editingQuestion.questionText,
				imageUrl: imageUrlToSave,
				gradeLevel: state.editingQuestion.gradeLevel,
				topic: state.editingQuestion.topic,
				difficulty: state.editingQuestion.difficulty,
				marks: state.editingQuestion.marks,
			};

			const optionsData = state.editingQuestion.options.map((opt) => ({
				optionLetter: opt.optionLetter,
				optionText: opt.optionText,
				isCorrect: opt.isCorrect,
				explanation: opt.explanation || null,
			}));

			if (state.editingQuestion.id) {
				await updateQuestionAction(state.editingQuestion.id, questionData);
				toast.success('Question updated successfully');
			} else {
				await createQuestionAction(questionData, optionsData);
				toast.success('Question created successfully');
			}

			if (state.localImagePreview) {
				URL.revokeObjectURL(state.localImagePreview);
			}
			dispatch({ type: 'CLEAR_IMAGE_STATE' });
			dispatch({ type: 'CLOSE_MODAL' });
			onRefresh();
		} catch (error) {
			console.debug('Failed to save question:', error);
			toast.error('Failed to save question. Please try again.');
		} finally {
			dispatch({ type: 'SET_SAVING', payload: false });
		}
	};

	const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			if (file.size > 4 * 1024 * 1024) {
				toast.error('Image must be less than 4MB');
				return;
			}
			dispatch({ type: 'SET_IMAGE_FILE', payload: file });
			const previewUrl = URL.createObjectURL(file);
			dispatch({ type: 'SET_IMAGE_PREVIEW', payload: previewUrl });
			if (state.editingQuestion) {
				dispatch({
					type: 'UPDATE_QUESTION_FIELD',
					payload: { imageUrl: previewUrl },
				});
			}
		}
	};

	const handleRemoveImage = () => {
		if (state.localImagePreview) {
			URL.revokeObjectURL(state.localImagePreview);
		}
		dispatch({ type: 'SET_IMAGE_FILE', payload: null });
		dispatch({ type: 'SET_IMAGE_PREVIEW', payload: null });
		if (state.editingQuestion) {
			dispatch({ type: 'UPDATE_QUESTION_FIELD', payload: { imageUrl: null } });
		}
	};

	const triggerFileInput = () => {
		fileInputRef.current?.click();
	};

	const isFormValid = () => {
		if (!state.editingQuestion) return false;
		return (
			state.editingQuestion.questionText.trim() !== '' &&
			state.editingQuestion.subjectId !== 0 &&
			state.editingQuestion.topic.trim() !== '' &&
			state.editingQuestion.options.every((opt) => opt.optionText.trim() !== '') &&
			state.editingQuestion.options.some((opt) => opt.isCorrect)
		);
	};

	const addOption = () => {
		if (!state.editingQuestion) return;
		const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
		const nextLetter = letters[state.editingQuestion.options.length];
		if (nextLetter) {
			dispatch({
				type: 'UPDATE_QUESTION_FIELD',
				payload: {
					options: [
						...state.editingQuestion.options,
						{ optionLetter: nextLetter, optionText: '', isCorrect: false, explanation: '' },
					],
				},
			});
		}
	};

	const removeOption = (index: number) => {
		if (!state.editingQuestion || state.editingQuestion.options.length <= 2) return;
		const newOptions = state.editingQuestion.options.filter((_, i) => i !== index);
		const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
		newOptions.forEach((opt, i) => {
			opt.optionLetter = letters[i];
		});
		dispatch({
			type: 'UPDATE_QUESTION_FIELD',
			payload: { options: newOptions },
		});
	};

	const updateOption = (index: number, field: keyof OptionFormData, value: string | boolean) => {
		if (!state.editingQuestion) return;
		const newOptions = [...state.editingQuestion.options];
		newOptions[index] = { ...newOptions[index], [field]: value };
		dispatch({
			type: 'UPDATE_QUESTION_FIELD',
			payload: { options: newOptions },
		});
	};

	const setEditingQuestion = (question: QuestionFormData | null) => {
		dispatch({ type: 'SET_EDITING_QUESTION', payload: question! });
	};

	return (
		<>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{questions.map((q) => (
					<QuestionCard
						key={q.id}
						question={q}
						subjectMap={subjectMap}
						onEdit={handleEditQuestion}
						onDelete={handleDeleteQuestion}
					/>
				))}
			</div>

			<Drawer
				open={state.isModalOpen}
				onOpenChange={(open) => {
					if (!open) dispatch({ type: 'CLOSE_MODAL' });
				}}
			>
				<DrawerContent className="max-h-[90vh] flex flex-col z-50 rounded-t-[3rem] pb-8 lg:max-w-4xl lg:mx-auto">
					<DrawerHeader className="text-left border-b pb-8 px-8">
						<DrawerTitle className="text-3xl font-black tracking-tighter uppercase">
							{state.editingQuestion?.id ? 'Edit Question' : 'New Question'}
						</DrawerTitle>
						<DrawerDescription className="font-bold">
							Manage educational content for students
						</DrawerDescription>

						<Tabs
							value={state.drawerTab}
							onValueChange={(v) =>
								dispatch({ type: 'SET_DRAWER_TAB', payload: v as typeof state.drawerTab })
							}
							className="w-full mt-8"
						>
							<TabsList className="grid w-full grid-cols-3 h-12 bg-muted/50 p-1 rounded-xl">
								<TabsTrigger
									value="basic"
									className="rounded-lg font-black text-[10px] uppercase tracking-widest"
								>
									Basic
								</TabsTrigger>
								<TabsTrigger
									value="question"
									className="rounded-lg font-black text-[10px] uppercase tracking-widest"
								>
									Content
								</TabsTrigger>
								<TabsTrigger
									value="options"
									className="rounded-lg font-black text-[10px] uppercase tracking-widest"
								>
									Options
								</TabsTrigger>
							</TabsList>
						</Tabs>
					</DrawerHeader>

					{state.editingQuestion && (
						<ScrollArea className="flex-1 px-8 py-8 no-scrollbar">
							<div className="space-y-8">
								{state.drawerTab === 'basic' && (
									<QuestionBasicTab
										editingQuestion={state.editingQuestion}
										setEditingQuestion={setEditingQuestion}
										subjects={subjects}
										fileInputId={fileInputId}
										fileInputRef={fileInputRef}
										handleImageSelect={handleImageSelect}
										handleRemoveImage={handleRemoveImage}
										triggerFileInput={triggerFileInput}
									/>
								)}

								{state.drawerTab === 'question' && (
									<QuestionContentTab
										editingQuestion={state.editingQuestion}
										setEditingQuestion={setEditingQuestion}
									/>
								)}

								{state.drawerTab === 'options' && (
									<QuestionOptionsTab
										editingQuestion={state.editingQuestion}
										addOption={addOption}
										removeOption={removeOption}
										updateOption={updateOption}
									/>
								)}
							</div>
						</ScrollArea>
					)}

					<DrawerFooter className="pt-8 border-t flex-row gap-4 px-8">
						<DrawerClose asChild>
							<Button
								variant="outline"
								disabled={state.isSaving}
								className="flex-1 h-14 rounded-2xl border-2 font-black uppercase tracking-widest text-xs"
							>
								Discard
							</Button>
						</DrawerClose>
						<Button
							onClick={handleSaveQuestion}
							disabled={!isFormValid() || state.isSaving}
							className="flex-1 h-14 bg-primary hover:bg-primary/90 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/20"
						>
							{state.isSaving ? (
								<Spinner className="h-5 w-5 text-primary-foreground" />
							) : state.editingQuestion?.id ? (
								'Update Content'
							) : (
								'Save Content'
							)}
						</Button>
					</DrawerFooter>
				</DrawerContent>
			</Drawer>
		</>
	);
}
