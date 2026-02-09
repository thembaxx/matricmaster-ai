/** biome-ignore-all lint/performance/noImgElement: neededs */
'use client';

import { UploadButton } from '@uploadthing/react';
import {
	Database,
	Edit2,
	ImagePlus,
	Maximize2,
	Plus,
	Search,
	Trash2,
	X,
	ZoomIn,
	ZoomOut,
} from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useId, useState } from 'react';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import type { OurFileRouter } from '@/app/api/uploadthing/core';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
	createQuestionAction,
	getQuestionsAction,
	getQuestionWithOptionsAction,
	getSubjectsAction,
	seedDatabaseAction,
	softDeleteQuestionAction,
	updateQuestionAction,
} from '@/lib/db/actions';
import type { Question, Subject } from '@/lib/db/schema';

interface QuestionFormData {
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

interface OptionFormData {
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

export default function CMS() {
	const [subjects, setSubjects] = useState<Subject[]>([]);
	const [questions, setQuestions] = useState<Question[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedSubject, setSelectedSubject] = useState<string>('all');
	const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingQuestion, setEditingQuestion] = useState<QuestionFormData | null>(null);
	const [activeTab, setActiveTab] = useState('questions');
	const [seeding, setSeeding] = useState(false);
	const [drawerTab, setDrawerTab] = useState<'basic' | 'question' | 'options'>('basic');
	const [isFullscreen, setIsFullscreen] = useState(false);

	const loadData = useCallback(async () => {
		try {
			setLoading(true);
			const [subjectsData, questionsData] = await Promise.all([
				getSubjectsAction(),
				getQuestionsAction({}),
			]);
			setSubjects(subjectsData);
			setQuestions(questionsData);
		} catch (error) {
			console.error('Failed to load data:', error);
		} finally {
			setLoading(false);
		}
	}, []);

	// Load data on mount
	useEffect(() => {
		loadData();
	}, [loadData]);

	const handleSeedDatabase = async () => {
		if (!confirm('This will seed the database with sample data. Continue?')) return;

		try {
			setSeeding(true);
			const result = await seedDatabaseAction();
			if (result.success) {
				alert(result.message);
				await loadData();
			} else {
				alert(`Seeding failed: ${result.message}`);
			}
		} catch (error) {
			console.error('Seeding error:', error);
			alert('An error occurred while seeding.');
		} finally {
			setSeeding(false);
		}
	};

	const filteredQuestions = questions.filter((q) => {
		const matchesSearch =
			q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
			q.topic.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesSubject = selectedSubject === 'all' || q.subjectId.toString() === selectedSubject;
		const matchesDifficulty = selectedDifficulty === 'all' || q.difficulty === selectedDifficulty;
		return matchesSearch && matchesSubject && matchesDifficulty;
	});

	const handleCreateQuestion = () => {
		setEditingQuestion({ ...EMPTY_QUESTION });
		setDrawerTab('basic');
		setIsModalOpen(true);
	};

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
			setDrawerTab('basic');
			setIsModalOpen(true);
		}
	};

	const handleDeleteQuestion = async (id: string) => {
		if (confirm('Are you sure you want to delete this question?')) {
			try {
				await softDeleteQuestionAction(id);
				await loadData();
			} catch (error) {
				console.error('Failed to delete question:', error);
			}
		}
	};

	const handleSaveQuestion = async () => {
		if (!editingQuestion) return;

		// Validation
		if (!editingQuestion.questionText.trim()) {
			alert('Please enter a question');
			setDrawerTab('question');
			return;
		}
		if (editingQuestion.subjectId === 0) {
			alert('Please select a subject');
			setDrawerTab('basic');
			return;
		}
		if (!editingQuestion.topic.trim()) {
			alert('Please enter a topic');
			setDrawerTab('basic');
			return;
		}
		if (editingQuestion.options.some((opt) => !opt.optionText.trim())) {
			alert('Please fill in all option texts');
			setDrawerTab('options');
			return;
		}
		if (!editingQuestion.options.some((opt) => opt.isCorrect)) {
			alert('Please select at least one correct answer');
			setDrawerTab('options');
			return;
		}

		try {
			const questionData = {
				subjectId: editingQuestion.subjectId,
				questionText: editingQuestion.questionText,
				imageUrl: editingQuestion.imageUrl || null,
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
				// Update existing question
				await updateQuestionAction(editingQuestion.id, questionData);
				// Note: For updating options, you'd need to add updateOptions function
				// For now, we'll just reload the data
			} else {
				// Create new question
				await createQuestionAction(questionData, optionsData);
			}

			setIsModalOpen(false);
			setEditingQuestion(null);
			setDrawerTab('basic');
			await loadData();
		} catch (error) {
			console.error('Failed to save question:', error);
			alert('Failed to save question. Please try again.');
		}
	};

	// Check if all required fields are filled
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
		// Reassign letters
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

	const getSubjectName = (subjectId: number) => {
		return subjects.find((s) => s.id === subjectId)?.name || 'Unknown';
	};

	const getDifficultyColor = (difficulty: string) => {
		switch (difficulty) {
			case 'easy':
				return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
			case 'medium':
				return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
			case 'hard':
				return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
			default:
				return 'bg-gray-100 text-gray-700';
		}
	};

	// Generate unique IDs for form fields
	const questionId = useId();
	const topicId = useId();
	const marksId = useId();

	return (
		<div className="flex-1 flex flex-col bg-background overflow-hidden pb-28">
			{/* Header */}
			<header className="px-6 pt-4 pb-4 bg-background border-b border-border shrink-0">
				<div className="flex justify-between items-center mb-4">
					<div className="flex items-center gap-2">
						<Button
							onClick={handleSeedDatabase}
							disabled={seeding}
							variant="outline"
							size="sm"
							className="text-xs"
						>
							<Database className="h-3.5 w-3.5 mr-1" />
							{seeding ? 'Seeding...' : 'Seed DB'}
						</Button>
					</div>
					<Button
						onClick={handleCreateQuestion}
						size="icon"
						className="rounded-lg h-8 w-8 bg-brand-purple hover:bg-brand-purple/90 shadow-lg shadow-purple-500/20"
					>
						<Plus className="h-5 w-5" />
					</Button>
				</div>

				{/* Tabs */}
				<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full hidden">
					<TabsList className="grid w-full grid-cols-2 mb-4">
						<TabsTrigger value="questions">Questions</TabsTrigger>
						<TabsTrigger value="subjects">Subjects</TabsTrigger>
					</TabsList>
				</Tabs>

				{/* Filters */}
				{activeTab === 'questions' && (
					<div className="space-y-3">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
							<Input
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Search questions or topics..."
								className="pl-10 text-base h-12"
							/>
						</div>

						{/* Subject Pills */}
						<ScrollArea className="w-full whitespace-nowrap pb-2">
							<div className="flex gap-2 px-1">
								<button
									type="button"
									onClick={() => setSelectedSubject('all')}
									className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
										selectedSubject === 'all'
											? 'bg-brand-purple text-white shadow-md scale-105'
											: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
									}`}
								>
									All Subjects
								</button>
								{subjects.map((subject) => {
									const isSelected = selectedSubject === subject.id.toString();
									return (
										<button
											type="button"
											key={subject.id}
											onClick={() => setSelectedSubject(subject.id.toString())}
											className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
												isSelected
													? 'bg-brand-purple text-white shadow-md scale-105'
													: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
											}`}
										>
											{subject.name}
										</button>
									);
								})}
							</div>
						</ScrollArea>

						{/* Difficulty Filter */}
						<Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
							<SelectTrigger>
								<SelectValue placeholder="Difficulty" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Levels</SelectItem>
								<SelectItem value="easy">Easy</SelectItem>
								<SelectItem value="medium">Medium</SelectItem>
								<SelectItem value="hard">Hard</SelectItem>
							</SelectContent>
						</Select>
					</div>
				)}
			</header>

			{/* Content */}
			<main className="flex-1 overflow-hidden">
				<ScrollArea className="h-full">
					<div className="p-6 space-y-4">
						{loading ? (
							<div className="flex items-center justify-center py-20">
								<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple" />
							</div>
						) : activeTab === 'questions' ? (
							filteredQuestions.length === 0 ? (
								<div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
									<div className="text-6xl mb-4">❓</div>
									<p className="text-sm font-bold">No questions found</p>
									<p className="text-xs text-zinc-500 mt-2">
										Create your first question to get started
									</p>
								</div>
							) : (
								filteredQuestions.map((question) => (
									<Card key={question.id} className="group">
										<CardContent className="p-4">
											<div className="flex items-start gap-4">
												<div className="flex-1 min-w-0">
													<div className="flex items-center gap-2 mb-2">
														<Badge
															variant="secondary"
															className={`capitalize ${getDifficultyColor(question.difficulty)}`}
														>
															{question.difficulty}
														</Badge>
														<Badge variant="outline">Grade {question.gradeLevel}</Badge>
														<span className="text-xs text-zinc-400">
															{question.marks} point{question.marks > 1 ? 's' : ''}
														</span>
													</div>
													<p className="text-[13.2px] pl-1.5 font-normal text-zinc-900 dark:text-white/85 text-pretty mb-2 line-clamp-2">
														{question.questionText}
													</p>
													<div className="flex items-center gap-2 text-xs text-zinc-500">
														<Badge variant="secondary" className="text-xs">
															{getSubjectName(question.subjectId)}
														</Badge>
														<span>•</span>
														<span>{question.topic}</span>
													</div>
												</div>
												<div className="flex flex-col gap-1">
													<Button
														variant="ghost"
														size="icon"
														className="h-8 w-8 text-zinc-400 hover:text-brand-purple"
														onClick={() => handleEditQuestion(question)}
													>
														<Edit2 className="h-4 w-4" />
													</Button>
													<Button
														variant="ghost"
														size="icon"
														className="h-8 w-8 text-zinc-400 hover:text-red-500"
														onClick={() => handleDeleteQuestion(question.id)}
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												</div>
											</div>
										</CardContent>
									</Card>
								))
							)
						) : (
							// Subjects Tab
							<div className="space-y-4">
								{subjects.map((subject) => (
									<Card key={subject.id}>
										<CardContent className="p-4">
											<div className="flex items-center justify-between">
												<div>
													<h3 className="font-medium text-zinc-900 dark:text-white">
														{subject.name}
													</h3>
													<p className="text-sm text-zinc-500">{subject.description}</p>
													<p className="text-xs text-zinc-400 mt-1">
														Code: {subject.curriculumCode}
													</p>
												</div>
												<Badge variant={subject.isActive ? 'default' : 'secondary'}>
													{subject.isActive ? 'Active' : 'Inactive'}
												</Badge>
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						)}
					</div>
				</ScrollArea>
			</main>

			{/* Question Drawer */}
			<Drawer
				open={isModalOpen}
				onOpenChange={(open) => {
					setIsModalOpen(open);
					if (!open) setDrawerTab('basic');
				}}
			>
				<DrawerContent className="max-h-[90vh] flex flex-col z-120 rounded-t-3xl pb-3">
					<DrawerHeader className="text-left border-b pb-4">
						<DrawerTitle>
							{editingQuestion?.id ? 'Edit Question' : 'Create New Question'}
						</DrawerTitle>
						<DrawerDescription>
							{editingQuestion?.id
								? 'Edit the question details below.'
								: 'Fill in the details to create a new question.'}
						</DrawerDescription>

						{/* Tabs */}
						<Tabs
							value={drawerTab}
							onValueChange={(v) => setDrawerTab(v as typeof drawerTab)}
							className="w-full mt-4"
						>
							<TabsList className="grid w-full grid-cols-3">
								<TabsTrigger value="basic">Basic Info</TabsTrigger>
								<TabsTrigger value="question">Question</TabsTrigger>
								<TabsTrigger value="options">Options</TabsTrigger>
							</TabsList>
						</Tabs>
					</DrawerHeader>

					{editingQuestion && (
						<ScrollArea className="flex-1 px-4">
							<div className="space-y-6 py-4">
								{/* Tab 1: Basic Info */}
								{drawerTab === 'basic' && (
									<div className="space-y-6">
										{/* Image Upload */}
										<div className="space-y-2 aspect-video w-full">
											<Label>Question Image (Optional)</Label>
											{editingQuestion.imageUrl ? (
												<div className="space-y-2 mt-2">
													<div className="relative aspect-video w-full rounded-lg overflow-hidden border border-input">
														<Image
															src={editingQuestion.imageUrl}
															alt="Question"
															width={800}
															height={400}
															className="w-full h-auto max-h-64 object-contain bg-muted cursor-pointer"
															unoptimized
															onClick={() => setIsFullscreen(true)}
														/>
														<div className="absolute top-2 right-2 flex gap-1">
															<Button
																type="button"
																variant="secondary"
																size="sm"
																className="bg-white/80 hover:bg-white text-zinc-800"
																onClick={() => setIsFullscreen(true)}
															>
																<Maximize2 className="h-4 w-4" />
															</Button>
															<Button
																type="button"
																variant="destructive"
																size="sm"
																className="bg-white/80 hover:bg-white text-zinc-800"
																onClick={() =>
																	setEditingQuestion({
																		...editingQuestion,
																		imageUrl: null,
																	})
																}
															>
																<X className="h-4 w-4" />
															</Button>
														</div>
													</div>

													{/* Fullscreen Modal */}
													<Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
														<DialogContent className="max-w-7xl w-full max-h-[90vh] p-0 border-0 bg-black/90">
															<DialogHeader className="p-4 border-b border-zinc-700">
																<DialogTitle className="text-white">Question Image</DialogTitle>
																<DialogDescription className="text-zinc-400">
																	Zoom and pan to view details
																</DialogDescription>
															</DialogHeader>

															<div className="p-4 flex-1 flex items-center justify-center">
																<TransformWrapper
																	initialScale={1}
																	minScale={0.5}
																	maxScale={3}
																	limitToBounds={false}
																	centerOnInit={true}
																	doubleClick={{ mode: 'reset' }}
																>
																	{({ zoomIn, zoomOut, resetTransform }) => (
																		<div className="w-full h-full flex flex-col">
																			<div className="flex justify-center gap-2 mb-4">
																				<Button
																					type="button"
																					size="sm"
																					variant="secondary"
																					className="bg-zinc-800 hover:bg-zinc-700 text-white"
																					onClick={() => zoomIn()}
																				>
																					<ZoomIn className="h-4 w-4" />
																				</Button>
																				<Button
																					type="button"
																					size="sm"
																					variant="secondary"
																					className="bg-zinc-800 hover:bg-zinc-700 text-white"
																					onClick={() => zoomOut()}
																				>
																					<ZoomOut className="h-4 w-4" />
																				</Button>
																				<Button
																					type="button"
																					size="sm"
																					variant="secondary"
																					className="bg-zinc-800 hover:bg-zinc-700 text-white"
																					onClick={() => resetTransform()}
																				>
																					Reset
																				</Button>
																			</div>

																			<div className="flex-1 flex items-center justify-center">
																				<TransformComponent wrapperClass="w-full h-full flex items-center justify-center">
																					<img
																						src={editingQuestion.imageUrl || ''}
																						alt="Question"
																						className="max-w-none"
																						draggable={false}
																					/>
																				</TransformComponent>
																			</div>
																		</div>
																	)}
																</TransformWrapper>
															</div>
														</DialogContent>
													</Dialog>
												</div>
											) : (
												<div className="mt-2 h-full flex relative">
													<UploadButton<OurFileRouter, 'questionImage'>
														endpoint="questionImage"
														onClientUploadComplete={(res) => {
															if (res?.[0]?.ufsUrl) {
																setEditingQuestion({
																	...editingQuestion,
																	imageUrl: res[0].ufsUrl,
																});
															}
														}}
														onUploadError={(error: Error) => {
															alert(`Upload failed: ${error.message}`);
														}}
														appearance={{
															button:
																'ut-ready:bg-brand-purple ut-uploading:cursor-not-allowed rounded-lg bg-brand-purple/80 bg-none after:bg-brand-purple text-sm font-medium',
															container:
																'w-full flex-row rounded-lg border-2 border-dashed border-input p-4',
															allowedContent:
																'flex h-8 flex-col items-center justify-center text-xs text-muted-foreground',
														}}
														content={{
															button({ ready }) {
																if (ready)
																	return (
																		<div className="flex items-center gap-2">
																			<ImagePlus className="h-4 w-4" />
																			Upload Image
																		</div>
																	);
																return 'Getting ready...';
															},
															allowedContent({ ready, isUploading }) {
																if (!ready) return 'Checking...';
																if (isUploading) return 'Uploading...';
																return `Image (max 4MB)`;
															},
														}}
													/>
												</div>
											)}
										</div>

										{/* Subject & Grade */}
										<div className="grid grid-cols-2 gap-4">
											<div className="space-y-2">
												<Label>
													Subject <span className="text-red-500">*</span>
												</Label>
												<div className="mt-2">
													<Select
														value={editingQuestion.subjectId.toString()}
														onValueChange={(value) =>
															setEditingQuestion({
																...editingQuestion,
																subjectId: parseInt(value, 10),
															})
														}
													>
														<SelectTrigger>
															<SelectValue placeholder="Select subject" className="mt-2" />
														</SelectTrigger>
														<SelectContent>
															{subjects.map((subject) => (
																<SelectItem key={subject.id} value={subject.id.toString()}>
																	{subject.name}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												</div>
											</div>

											<div className="space-y-2">
												<Label>Grade Level</Label>
												<div className="mt-2">
													<Select
														value={editingQuestion.gradeLevel.toString()}
														onValueChange={(value) =>
															setEditingQuestion({
																...editingQuestion,
																gradeLevel: parseInt(value, 10),
															})
														}
													>
														<SelectTrigger>
															<SelectValue placeholder="Select grade" className="mt-2" />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="10">Grade 10</SelectItem>
															<SelectItem value="11">Grade 11</SelectItem>
															<SelectItem value="12">Grade 12</SelectItem>
														</SelectContent>
													</Select>
												</div>
											</div>
										</div>

										{/* Topic & Difficulty */}
										<div className="grid grid-cols-2 gap-4">
											<div className="space-y-2">
												<Label htmlFor={topicId}>
													Topic <span className="text-red-500">*</span>
												</Label>
												<Input
													id={topicId}
													value={editingQuestion.topic}
													onChange={(e) =>
														setEditingQuestion({
															...editingQuestion,
															topic: e.target.value,
														})
													}
													placeholder="e.g., Calculus"
													className="mt-2"
												/>
											</div>

											<div className="space-y-2">
												<Label>Difficulty</Label>
												<div className="mt-2">
													<Select
														value={editingQuestion.difficulty}
														onValueChange={(value: 'easy' | 'medium' | 'hard') =>
															setEditingQuestion({
																...editingQuestion,
																difficulty: value,
															})
														}
													>
														<SelectTrigger>
															<SelectValue placeholder="Select difficulty" className="mt-2" />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="easy">Easy</SelectItem>
															<SelectItem value="medium">Medium</SelectItem>
															<SelectItem value="hard">Hard</SelectItem>
														</SelectContent>
													</Select>
												</div>
											</div>
										</div>
									</div>
								)}

								{/* Tab 2: Question */}
								{drawerTab === 'question' && (
									<div className="space-y-6">
										{/* Question Text */}
										<div className="space-y-2">
											<Label htmlFor={questionId}>
												Question Text <span className="text-red-500">*</span>
											</Label>
											<textarea
												id={questionId}
												value={editingQuestion.questionText}
												onChange={(e) =>
													setEditingQuestion({
														...editingQuestion,
														questionText: e.target.value,
													})
												}
												placeholder="Enter your question here..."
												className="w-full min-h-0 mt-2 p-3 rounded-md border border-input bg-background text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring"
											/>
										</div>

										{/* Marks */}
										<div className="space-y-2">
											<Label htmlFor={marksId}>Points</Label>
											<Input
												id={marksId}
												type="number"
												min={1}
												max={10}
												value={editingQuestion.marks}
												className="mt-2"
												onChange={(e) =>
													setEditingQuestion({
														...editingQuestion,
														marks: parseInt(e.target.value, 10) || 1,
													})
												}
											/>
										</div>
									</div>
								)}

								{/* Tab 3: Options */}
								{drawerTab === 'options' && (
									<div className="space-y-4">
										<div className="flex items-center justify-between">
											<Label>
												Answer Options <span className="text-red-500">*</span>
											</Label>
											{editingQuestion.options.length < 6 && (
												<Button type="button" variant="outline" size="sm" onClick={addOption}>
													<Plus className="h-4 w-4 mr-1" />
													Add Option
												</Button>
											)}
										</div>

										{editingQuestion.options.map((option, index) => (
											<div
												key={option.optionLetter}
												className="p-4 border rounded-lg space-y-3 bg-muted/50"
											>
												<div className="flex items-start gap-3">
													<Badge
														variant={option.isCorrect ? 'default' : 'secondary'}
														className="w-8 h-8 flex items-center justify-center text-sm font-bold"
													>
														{option.optionLetter}
													</Badge>
													<Textarea
														value={option.optionText}
														onChange={(e) => updateOption(index, 'optionText', e.target.value)}
														placeholder={`Option ${option.optionLetter}`}
														className="flex-1 min-h-0 text-[15px]"
													/>
													{editingQuestion.options.length > 2 && (
														<Button
															type="button"
															variant="ghost"
															size="icon"
															className="text-red-500 hover:text-red-600"
															onClick={() => removeOption(index)}
														>
															<X className="h-4 w-4" />
														</Button>
													)}
												</div>

												<div className="flex items-center gap-4 px-1">
													<Label className="flex items-center gap-2 cursor-pointer">
														<Checkbox
															value={option.optionText}
															checked={option.isCorrect}
															onCheckedChange={(e) =>
																updateOption(index, 'isCorrect', e === option.optionText)
															}
															className="w-4 h-4 rounded border-gray-300 text-brand-purple focus:ring-brand-purple"
														/>
														<span className="text-sm text-zinc-600 dark:text-zinc-400">
															Correct Answer
														</span>
													</Label>
												</div>

												<Textarea
													value={option.explanation}
													onChange={(e) => updateOption(index, 'explanation', e.target.value)}
													placeholder="Explanation (optional)"
													className="text-sm mt-2"
												/>
											</div>
										))}
									</div>
								)}
							</div>
						</ScrollArea>
					)}

					<DrawerFooter className="pt-4 border-t flex-row gap-3">
						<DrawerClose asChild>
							<Button variant="outline" className="flex-1 text-sm">
								Cancel
							</Button>
						</DrawerClose>
						<Button
							onClick={handleSaveQuestion}
							disabled={!isFormValid()}
							className="flex-1 bg-brand-purple hover:bg-brand-purple/90 text-sm dark:text-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{editingQuestion?.id ? 'Update Question' : 'Create Question'}
						</Button>
					</DrawerFooter>
				</DrawerContent>
			</Drawer>
		</div>
	);
}
