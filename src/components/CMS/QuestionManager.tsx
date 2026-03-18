'use client';

import {
	Add01Icon,
	Cancel01Icon,
	Delete02Icon,
	ImageIcon,
	PencilEdit01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import Image from 'next/image';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
	createQuestionAction,
	getQuestionWithOptionsAction,
	softDeleteQuestionAction,
	updateQuestionAction,
} from '@/lib/db/actions';
import type { Question, Subject } from '@/lib/db/schema';
import { uploadFiles } from '@/lib/uploadthing';
import { DifficultyBadge } from './StatusBadge';

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
					<Card
						key={q.id}
						className="rounded-[2rem] border-2 border-border/50 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 group"
					>
						<CardContent className="p-6 space-y-6">
							<div className="flex items-start justify-between">
								<div className="flex flex-wrap gap-2">
									<DifficultyBadge difficulty={q.difficulty as 'easy' | 'medium' | 'hard'} />
									<Badge
										variant="outline"
										className="rounded-lg uppercase tracking-widest text-[9px] font-black"
									>
										Grade {q.gradeLevel}
									</Badge>
								</div>
								<div className="flex items-center gap-1">
									<Tooltip>
										<TooltipTrigger asChild>
											<Button
												variant="ghost"
												size="icon"
												className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors"
												onClick={() => handleEditQuestion(q)}
												aria-label="Edit question"
											>
												<HugeiconsIcon icon={PencilEdit01Icon} className="h-5 w-5" />
											</Button>
										</TooltipTrigger>
										<TooltipContent>Edit question</TooltipContent>
									</Tooltip>
									<Tooltip>
										<TooltipTrigger asChild>
											<Button
												variant="ghost"
												size="icon"
												className="h-10 w-10 rounded-xl hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
												onClick={() => handleDeleteQuestion(q.id)}
												aria-label="Delete question"
											>
												<HugeiconsIcon icon={Delete02Icon} className="h-5 w-5" />
											</Button>
										</TooltipTrigger>
										<TooltipContent>Delete question</TooltipContent>
									</Tooltip>
								</div>
							</div>

							<p className="text-sm font-bold text-foreground line-clamp-3 leading-relaxed">
								{q.questionText}
							</p>

							<div className="pt-4 border-t border-border/50 flex items-center justify-between">
								<div className="space-y-1">
									<p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
										{subjectMap.get(q.subjectId) || 'Unknown'}
									</p>
									<p className="text-xs font-bold text-foreground truncate max-w-37.5">{q.topic}</p>
								</div>
								<div className="text-right">
									<p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
										Points
									</p>
									<p className="text-lg font-black text-primary">{q.marks}</p>
								</div>
							</div>
						</CardContent>
					</Card>
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
									<div className="space-y-8">
										<div className="space-y-3">
											<Label className="font-black text-xs uppercase tracking-widest text-muted-foreground">
												Illustration
											</Label>
											{editingQuestion.imageUrl ? (
												<div className="relative aspect-video w-full rounded-3xl overflow-hidden border-2 border-border shadow-xl group">
													<Image
														src={editingQuestion.imageUrl}
														alt="Question"
														width={800}
														height={400}
														className="w-full h-full object-contain bg-muted"
														unoptimized
													/>
													<div className="absolute top-4 right-4 flex gap-2">
														<Button
															type="button"
															variant="destructive"
															size="icon"
															className="rounded-xl h-10 w-10"
															onClick={handleRemoveImage}
															aria-label="Remove image"
														>
															<HugeiconsIcon icon={Cancel01Icon} className="h-5 w-5" />
														</Button>
													</div>
												</div>
											) : (
												<div className="relative">
													<input
														type="file"
														id={fileInputId}
														ref={fileInputRef}
														onChange={handleImageSelect}
														accept="image/*"
														className="hidden"
													/>
													<label
														htmlFor={fileInputId}
														onClick={triggerFileInput}
														className="w-full h-48 rounded-3xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-4 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer"
													>
														<div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
															<HugeiconsIcon
																icon={ImageIcon}
																className="h-8 w-8 text-muted-foreground"
															/>
														</div>
														<span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
															Upload Image (Max 4MB)
														</span>
													</label>
												</div>
											)}
										</div>

										<div className="grid grid-cols-2 gap-8">
											<div className="space-y-3">
												<Label className="font-black text-xs uppercase tracking-widest text-muted-foreground">
													Subject
												</Label>
												<Select
													value={editingQuestion.subjectId.toString()}
													onValueChange={(v) =>
														setEditingQuestion({
															...editingQuestion,
															subjectId: Number.parseInt(v, 10),
														})
													}
												>
													<SelectTrigger className="h-14 rounded-2xl border-2">
														<SelectValue placeholder="Select" />
													</SelectTrigger>
													<SelectContent className="rounded-2xl">
														{subjects.map((s) => (
															<SelectItem key={s.id} value={s.id.toString()}>
																{s.name}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</div>
											<div className="space-y-3">
												<Label className="font-black text-xs uppercase tracking-widest text-muted-foreground">
													Grade
												</Label>
												<Select
													value={editingQuestion.gradeLevel.toString()}
													onValueChange={(v) =>
														setEditingQuestion({
															...editingQuestion,
															gradeLevel: Number.parseInt(v, 10),
														})
													}
												>
													<SelectTrigger className="h-14 rounded-2xl border-2">
														<SelectValue placeholder="Select" />
													</SelectTrigger>
													<SelectContent className="rounded-2xl">
														<SelectItem value="10">Grade 10</SelectItem>
														<SelectItem value="11">Grade 11</SelectItem>
														<SelectItem value="12">Grade 12</SelectItem>
													</SelectContent>
												</Select>
											</div>
										</div>

										<div className="grid grid-cols-2 gap-8">
											<div className="space-y-3">
												<Label className="font-black text-xs uppercase tracking-widest text-muted-foreground">
													Topic
												</Label>
												<Input
													value={editingQuestion.topic}
													onChange={(e) =>
														setEditingQuestion({ ...editingQuestion, topic: e.target.value })
													}
													className="h-14 rounded-2xl border-2 font-bold"
												/>
											</div>
											<div className="space-y-3">
												<Label className="font-black text-xs uppercase tracking-widest text-muted-foreground">
													Difficulty
												</Label>
												<Select
													value={editingQuestion.difficulty}
													onValueChange={(v) =>
														setEditingQuestion({
															...editingQuestion,
															difficulty: v as typeof editingQuestion.difficulty,
														})
													}
												>
													<SelectTrigger className="h-14 rounded-2xl border-2">
														<SelectValue placeholder="Select" />
													</SelectTrigger>
													<SelectContent className="rounded-2xl">
														<SelectItem value="easy">Easy</SelectItem>
														<SelectItem value="medium">Medium</SelectItem>
														<SelectItem value="hard">Hard</SelectItem>
													</SelectContent>
												</Select>
											</div>
										</div>
									</div>
								)}

								{drawerTab === 'question' && (
									<div className="space-y-8">
										<div className="space-y-3">
											<Label className="font-black text-xs uppercase tracking-widest text-muted-foreground">
												Question Content
											</Label>
											<Textarea
												value={editingQuestion.questionText}
												onChange={(e) =>
													setEditingQuestion({ ...editingQuestion, questionText: e.target.value })
												}
												className="min-h-50 rounded-3xl border-2 p-6 font-bold text-lg leading-relaxed"
												placeholder="Type the question..."
											/>
										</div>
										<div className="space-y-3 max-w-50">
											<Label className="font-black text-xs uppercase tracking-widest text-muted-foreground">
												Points
											</Label>
											<Input
												type="number"
												value={editingQuestion.marks}
												onChange={(e) =>
													setEditingQuestion({
														...editingQuestion,
														marks: Number.parseInt(e.target.value, 10),
													})
												}
												className="h-14 rounded-2xl border-2 font-black text-xl text-center"
											/>
										</div>
									</div>
								)}

								{drawerTab === 'options' && (
									<div className="space-y-6">
										<div className="flex items-center justify-between mb-4">
											<Label className="font-black text-xs uppercase tracking-widest text-muted-foreground">
												Answer Possibilities
											</Label>
											<Button
												type="button"
												variant="outline"
												size="sm"
												onClick={addOption}
												className="rounded-xl h-10 px-4 font-black text-[10px] uppercase tracking-widest border-2"
											>
												<HugeiconsIcon icon={Add01Icon} className="h-4 w-4 mr-2" /> Add
											</Button>
										</div>

										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											{editingQuestion.options.map((opt, idx) => (
												<div
													key={opt.optionLetter}
													className="p-6 rounded-3xl border-2 bg-muted/20 space-y-4 relative"
												>
													<div className="flex items-center justify-between">
														<Badge className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg bg-primary shadow-lg shadow-primary/20">
															{opt.optionLetter}
														</Badge>
														<div className="flex items-center gap-2">
															<Checkbox
																id={`correct-${idx}`}
																checked={opt.isCorrect}
																onCheckedChange={(v) => updateOption(idx, 'isCorrect', !!v)}
																className="h-6 w-6 rounded-lg border-2"
															/>
															<Label
																htmlFor={`correct-${idx}`}
																className="text-[10px] font-black uppercase tracking-widest text-muted-foreground cursor-pointer"
															>
																Correct
															</Label>
															<Button
																variant="ghost"
																size="icon"
																className="h-8 w-8 text-rose-500"
																onClick={() => removeOption(idx)}
																aria-label="Remove option"
															>
																<HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
															</Button>
														</div>
													</div>
													<Textarea
														value={opt.optionText}
														onChange={(e) => updateOption(idx, 'optionText', e.target.value)}
														className="min-h-20 rounded-xl border-2 font-bold"
														placeholder="Answer text..."
													/>
													<Textarea
														value={opt.explanation}
														onChange={(e) => updateOption(idx, 'explanation', e.target.value)}
														className="min-h-15 rounded-xl border-2 text-xs font-bold bg-background"
														placeholder="Explanation..."
													/>
												</div>
											))}
										</div>
									</div>
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
