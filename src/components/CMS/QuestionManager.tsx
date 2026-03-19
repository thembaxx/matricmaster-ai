'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
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

export function QuestionManager({
	questions,
	subjects,
	subjectMap,
	onRefresh,
	openCreateTrigger,
}: QuestionManagerProps) {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingQuestion, setEditingQuestion] = useState<QuestionFormData | null>(null);
	const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
	const [drawerTab, setDrawerTab] = useState<'basic' | 'question' | 'options'>('basic');
	const [localImageFile, setLocalImageFile] = useState<File | null>(null);
	const [localImagePreview, setLocalImagePreview] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const fileInputId = useId();

	const handleCreateQuestion = useCallback(() => {
		setEditingQuestion({ ...EMPTY_QUESTION });
		setLocalImageFile(null);
		setLocalImagePreview(null);
		setDrawerTab('basic');
		setIsModalOpen(true);
	}, []);

	useEffect(() => {
		if (openCreateTrigger) {
			handleCreateQuestion();
		}
	}, [openCreateTrigger, handleCreateQuestion]);

	const handleEditQuestion = async (question: Question) => {
		const questionWithOptions = await getQuestionWithOptionsAction(question.id);
		if (questionWithOptions) {
			setEditingQuestion({
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
			});
			setOriginalImageUrl(questionWithOptions.imageUrl || null);
			setLocalImageFile(null);
			setLocalImagePreview(null);
			setDrawerTab('basic');
			setIsModalOpen(true);
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
		if (!editingQuestion) return;

		if (!editingQuestion.questionText.trim()) {
			toast.error('Please enter a question');
			setDrawerTab('question');
			return;
		}
		if (editingQuestion.subjectId === 0) {
			toast.error('Please select a subject');
			setDrawerTab('basic');
			return;
		}
		if (!editingQuestion.topic.trim()) {
			toast.error('Please enter a topic');
			setDrawerTab('basic');
			return;
		}
		if (editingQuestion.options.some((opt) => !opt.optionText.trim())) {
			toast.error('Please fill in all option texts');
			setDrawerTab('options');
			return;
		}
		if (!editingQuestion.options.some((opt) => opt.isCorrect)) {
			toast.error('Please select at least one correct answer');
			setDrawerTab('options');
			return;
		}

		try {
			setIsSaving(true);
			let imageUrlToSave = editingQuestion.imageUrl;

			if (localImageFile) {
				const uploadResult = await uploadFiles('questionImage', {
					files: [localImageFile],
				});
				if (uploadResult?.[0]?.ufsUrl) {
					imageUrlToSave = uploadResult[0].ufsUrl;
				} else {
					toast.error('Failed to upload image. Please try again.');
					return;
				}
			} else if (editingQuestion.id && originalImageUrl && !editingQuestion.imageUrl) {
				imageUrlToSave = null;
			}

			const questionData = {
				subjectId: editingQuestion.subjectId,
				questionText: editingQuestion.questionText,
				imageUrl: imageUrlToSave,
				gradeLevel: editingQuestion.gradeLevel,
				topic: editingQuestion.topic,
				difficulty: editingQuestion.difficulty,
				marks: editingQuestion.marks,
			};

			const optionsData = editingQuestion.options.map((opt) => ({
				optionLetter: opt.optionLetter,
				optionText: opt.optionText,
				isCorrect: opt.isCorrect,
				explanation: opt.explanation || null,
			}));

			if (editingQuestion.id) {
				await updateQuestionAction(editingQuestion.id, questionData);
				toast.success('Question updated successfully');
			} else {
				await createQuestionAction(questionData, optionsData);
				toast.success('Question created successfully');
			}

			if (localImagePreview) {
				URL.revokeObjectURL(localImagePreview);
			}
			setLocalImageFile(null);
			setLocalImagePreview(null);
			setOriginalImageUrl(null);
			setIsModalOpen(false);
			setEditingQuestion(null);
			setDrawerTab('basic');
			onRefresh();
		} catch (error) {
			console.debug('Failed to save question:', error);
			toast.error('Failed to save question. Please try again.');
		} finally {
			setIsSaving(false);
		}
	};

	const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			if (file.size > 4 * 1024 * 1024) {
				toast.error('Image must be less than 4MB');
				return;
			}
			setLocalImageFile(file);
			const previewUrl = URL.createObjectURL(file);
			setLocalImagePreview(previewUrl);
			if (editingQuestion) {
				setEditingQuestion({
					...editingQuestion,
					imageUrl: previewUrl,
				});
			}
		}
	};

	const handleRemoveImage = () => {
		if (localImagePreview) {
			URL.revokeObjectURL(localImagePreview);
		}
		setLocalImageFile(null);
		setLocalImagePreview(null);
		if (editingQuestion) {
			setEditingQuestion({
				...editingQuestion,
				imageUrl: null,
			});
		}
	};

	const triggerFileInput = () => {
		fileInputRef.current?.click();
	};

	const isFormValid = () => {
		if (!editingQuestion) return false;
		return (
			editingQuestion.questionText.trim() !== '' &&
			editingQuestion.subjectId !== 0 &&
			editingQuestion.topic.trim() !== '' &&
			editingQuestion.options.every((opt) => opt.optionText.trim() !== '') &&
			editingQuestion.options.some((opt) => opt.isCorrect)
		);
	};

	const addOption = () => {
		if (!editingQuestion) return;
		const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
		const nextLetter = letters[editingQuestion.options.length];
		if (nextLetter) {
			setEditingQuestion({
				...editingQuestion,
				options: [
					...editingQuestion.options,
					{ optionLetter: nextLetter, optionText: '', isCorrect: false, explanation: '' },
				],
			});
		}
	};

	const removeOption = (index: number) => {
		if (!editingQuestion || editingQuestion.options.length <= 2) return;
		const newOptions = editingQuestion.options.filter((_, i) => i !== index);
		const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
		newOptions.forEach((opt, i) => {
			opt.optionLetter = letters[i];
		});
		setEditingQuestion({
			...editingQuestion,
			options: newOptions,
		});
	};

	const updateOption = (index: number, field: keyof OptionFormData, value: string | boolean) => {
		if (!editingQuestion) return;
		const newOptions = [...editingQuestion.options];
		newOptions[index] = { ...newOptions[index], [field]: value };
		setEditingQuestion({ ...editingQuestion, options: newOptions });
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
				open={isModalOpen}
				onOpenChange={(open) => {
					setIsModalOpen(open);
					if (!open) setDrawerTab('basic');
				}}
			>
				<DrawerContent className="max-h-[90vh] flex flex-col z-50 rounded-t-[3rem] pb-8 lg:max-w-4xl lg:mx-auto">
					<DrawerHeader className="text-left border-b pb-8 px-8">
						<DrawerTitle className="text-3xl font-black tracking-tighter uppercase">
							{editingQuestion?.id ? 'Edit Question' : 'New Question'}
						</DrawerTitle>
						<DrawerDescription className="font-bold">
							Manage educational content for students
						</DrawerDescription>

						<Tabs
							value={drawerTab}
							onValueChange={(v) => setDrawerTab(v as typeof drawerTab)}
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

					{editingQuestion && (
						<ScrollArea className="flex-1 px-8 py-8 no-scrollbar">
							<div className="space-y-8">
								{drawerTab === 'basic' && (
									<QuestionBasicTab
										editingQuestion={editingQuestion}
										setEditingQuestion={setEditingQuestion}
										subjects={subjects}
										fileInputId={fileInputId}
										fileInputRef={fileInputRef}
										handleImageSelect={handleImageSelect}
										handleRemoveImage={handleRemoveImage}
										triggerFileInput={triggerFileInput}
									/>
								)}

								{drawerTab === 'question' && (
									<QuestionContentTab
										editingQuestion={editingQuestion}
										setEditingQuestion={setEditingQuestion}
									/>
								)}

								{drawerTab === 'options' && (
									<QuestionOptionsTab
										editingQuestion={editingQuestion}
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
								disabled={isSaving}
								className="flex-1 h-14 rounded-2xl border-2 font-black uppercase tracking-widest text-xs"
							>
								Discard
							</Button>
						</DrawerClose>
						<Button
							onClick={handleSaveQuestion}
							disabled={!isFormValid() || isSaving}
							className="flex-1 h-14 bg-primary hover:bg-primary/90 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/20"
						>
							{isSaving ? (
								<Spinner className="h-5 w-5 text-primary-foreground" />
							) : editingQuestion?.id ? (
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
