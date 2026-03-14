'use client';

import {
	DatabaseIcon as Database,
	FileArrowUp01Icon as FileArrowUp,
	Image01Icon as ImageSquare,
	Search01Icon as MagnifyingGlass,
	PencilEdit01Icon as PencilSimple,
	PlusSignIcon as Plus,
	Delete02Icon as Trash,
	Cancel01Icon as X,
	UserIcon as UserIconHuge,
	Bookmark01Icon as BookmarkIcon,
	Layout01Icon as LayoutIcon,
} from 'hugeicons-react';
import Image from 'next/image';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { PdfUploadDrawer } from '@/components/CMS/PdfUploadDrawer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
	getPastPapersAction,
	getQuestionsAction,
	getQuestionWithOptionsAction,
	getSubjectsAction,
	getUsersAction,
	seedDatabaseAction,
	softDeleteQuestionAction,
	updateQuestionAction,
} from '@/lib/db/actions';
import type { User } from '@/lib/db/better-auth-schema';
import type { PastPaper, Question, Subject } from '@/lib/db/schema';
import { uploadFiles } from '@/lib/uploadthing';
import { cn } from '@/lib/utils';

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
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedSubject, setSelectedSubject] = useState<string>('all');
	const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingQuestion, setEditingQuestion] = useState<QuestionFormData | null>(null);
	const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState('questions');
	const [seeding, setSeeding] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [drawerTab, setDrawerTab] = useState<'basic' | 'question' | 'options'>('basic');
	const [localImageFile, setLocalImageFile] = useState<File | null>(null);
	const [localImagePreview, setLocalImagePreview] = useState<string | null>(null);
	const [isPdfDrawerOpen, setIsPdfDrawerOpen] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Past Paper state
	const [allPastPapers, setAllPastPapers] = useState<PastPaper[]>([]);

	// User management state
	const [userSearchQuery, setUserSearchQuery] = useState('');
	const [userFilter, setUserFilter] = useState<'all' | 'active' | 'blocked' | 'deleted'>('all');

	const loadData = useCallback(async () => {
		try {
			setLoading(true);
			const [subjectsData, questionsData, usersData, pastPapersData] = await Promise.all([
				getSubjectsAction(),
				getQuestionsAction({}),
				getUsersAction({}),
				getPastPapersAction(),
			]);
			setSubjects(subjectsData);
			setQuestions(questionsData);
			setUsers(usersData);
			setAllPastPapers(pastPapersData);
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
				toast.success(result.message);
				await loadData();
			} else {
				toast.error(`Seeding failed: ${result.message}`);
			}
		} catch (error) {
			console.error('Seeding error:', error);
			toast.error('An error occurred while seeding.');
		} finally {
			setSeeding(false);
		}
	};

	// Bolt: Memoize subject lookup to convert O(S) array search into O(1) MapTrifold lookup
	const subjectMap = useMemo(() => {
		return new Map(subjects.map((s) => [s.id, s.name]));
	}, [subjects]);
	// Bolt: Memoize filtered users to prevent O(N) filtering on unrelated state changes (like drawer toggle)
	const filteredUsers = useMemo(() => {
		const query = userSearchQuery.toLowerCase(); // Bolt: Lowercase once outside loop
		return users.filter((u) => {
			const matchesSearch =
				u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query);

			if (userFilter === 'active') return matchesSearch && !u.isBlocked && !u.deletedAt;
			if (userFilter === 'blocked') return matchesSearch && u.isBlocked;
			if (userFilter === 'deleted') return matchesSearch && !!u.deletedAt;

			return matchesSearch;
		});
	}, [users, userSearchQuery, userFilter]);

	// Bolt: Memoize filtered questions to prevent O(N) filtering on unrelated state changes
	const filteredQuestions = useMemo(() => {
		const query = searchQuery.toLowerCase(); // Bolt: Lowercase once outside loop
		const subjectIdFilter = selectedSubject !== 'all' ? Number.parseInt(selectedSubject, 10) : null; // Bolt: Parse once outside loop

		return questions.filter((q) => {
			const matchesSearch =
				q.questionText.toLowerCase().includes(query) || q.topic.toLowerCase().includes(query);
			const matchesSubject = subjectIdFilter === null || q.subjectId === subjectIdFilter; // Bolt: Fast numeric comparison
			const matchesDifficulty = selectedDifficulty === 'all' || q.difficulty === selectedDifficulty;
			return matchesSearch && matchesSubject && matchesDifficulty;
		});
	}, [questions, searchQuery, selectedSubject, selectedDifficulty]);

	const handleCreateQuestion = () => {
		setEditingQuestion({ ...EMPTY_QUESTION });
		setLocalImageFile(null);
		setLocalImagePreview(null);
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
				await loadData();
			} catch (error) {
				console.error('Failed to delete question:', error);
				toast.error('Failed to delete question');
			}
		}
	};

	const handleSaveQuestion = async () => {
		if (!editingQuestion) return;

		// Validation
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
				// Update existing question
				await updateQuestionAction(editingQuestion.id, questionData);
				toast.success('Question updated successfully');
			} else {
				// Create new question
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
			await loadData();
		} catch (error) {
			console.error('Failed to save question:', error);
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

	// Bolt: O(1) lookup using memoized subjectMap
	const getSubjectName = useCallback(
		(subjectId: number) => {
			return subjectMap.get(subjectId) || 'Unknown';
		},
		[subjectMap]
	);

	const getDifficultyColor = (difficulty: string) => {
		switch (difficulty) {
			case 'easy':
				return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400';
			case 'medium':
				return 'bg-brand-amber/10 text-brand-amber dark:bg-brand-amber/20';
			case 'hard':
				return 'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400';
			default:
				return 'bg-muted text-label-secondary';
		}
	};

	// User display helpers
	const getRoleColor = (role: string) => {
		switch (role) {
			case 'admin':
				return 'bg-primary text-primary-foreground font-black';
			case 'moderator':
				return 'bg-blue-500 text-white font-black';
			default:
				return 'bg-muted text-muted-foreground font-bold';
		}
	};

	const getStatusColor = (isBlocked: boolean, deletedAt: Date | null) => {
		if (deletedAt) return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
		if (isBlocked) return 'bg-brand-amber/10 text-brand-amber border-brand-amber/20';
		return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
	};

	const getStatusText = (isBlocked: boolean, deletedAt: Date | null) => {
		if (deletedAt) return 'Deleted';
		if (isBlocked) return 'Blocked';
		return 'Active';
	};

	const fileInputId = useId();

	return (
		<div className="flex-1 flex flex-col bg-white dark:bg-zinc-950 overflow-hidden pb-40 lg:px-12">
			<PdfUploadDrawer
				isOpen={isPdfDrawerOpen}
				onClose={() => setIsPdfDrawerOpen(false)}
				subjects={subjects}
				onSuccess={loadData}
			/>
			{/* Header */}
			<header className="px-6 sm:px-10 pt-20 sm:pt-32 pb-12 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-3xl shrink-0 space-y-12 lg:px-0">
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-8 sm:gap-12">
					<div className="space-y-3">
						<h1 className="text-5xl sm:text-7xl lg:text-9xl font-black text-foreground tracking-tighter leading-none uppercase">
							Editor
						</h1>
						<p className="text-muted-foreground/40 font-black text-lg sm:text-2xl uppercase tracking-[0.3em] leading-none">
							Workspace hub
						</p>
					</div>

					<div className="flex items-center gap-3">
						<Button
							onClick={handleSeedDatabase}
							disabled={seeding}
							variant="ghost"
							className="h-14 px-6 rounded-2xl bg-muted/10 font-black text-xs uppercase tracking-widest hover:bg-muted/20 transition-all border-none"
						>
							<Database size={20} className="mr-2 stroke-[3px]" />
							{seeding ? 'Seeding...' : 'Seed'}
						</Button>
						{activeTab === 'past-papers' ? (
							<Button
								onClick={() => setIsPdfDrawerOpen(true)}
								className="h-14 px-8 bg-primary hover:bg-primary/90 text-white rounded-[1.5rem] shadow-xl shadow-primary/20 font-black text-xs uppercase tracking-widest transition-all scale-105 active:scale-95"
							>
								<FileArrowUp size={20} className="mr-3 stroke-[3.5px]" />
								Upload PDF
							</Button>
						) : (
							<Button
								onClick={() => handleCreateQuestion()}
								className="h-14 px-8 bg-primary hover:bg-primary/90 text-white rounded-[1.5rem] shadow-xl shadow-primary/20 font-black text-xs uppercase tracking-widest transition-all scale-105 active:scale-95"
							>
								<Plus size={20} className="mr-3 stroke-[3.5px]" />
								Create New
							</Button>
						)}
					</div>
				</div>

				<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
					<TabsList className="h-20 p-2 bg-muted/10 rounded-[2.5rem] border-none shadow-inner flex gap-2">
						{[
							{ id: 'questions', label: 'Questions' },
							{ id: 'past-papers', label: 'Vault' },
							{ id: 'subjects', label: 'Catalog' },
							{ id: 'users', label: 'Team' },
						].map((tab) => (
							<TabsTrigger
								key={tab.id}
								value={tab.id}
								className="flex-1 h-full rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-2xl transition-all duration-500"
							>
								{tab.label}
							</TabsTrigger>
						))}
					</TabsList>
				</Tabs>

				{/* Search & Filters */}
				<div className="grid grid-cols-1 md:grid-cols-12 gap-6">
					<div className={cn("relative group", activeTab === 'questions' ? "md:col-span-6" : "md:col-span-12")}>
						<MagnifyingGlass size={24} className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/30 stroke-[3px] group-focus-within:text-primary transition-colors" />
						<Input
							value={activeTab === 'users' ? userSearchQuery : searchQuery}
							onChange={(e) =>
								activeTab === 'users'
									? setUserSearchQuery(e.target.value)
									: setSearchQuery(e.target.value)
							}
							placeholder="Search library..."
							className="h-20 pl-16 pr-8 bg-muted/10 border-none rounded-[2.5rem] text-xl font-bold placeholder:text-muted-foreground/30 focus:ring-4 focus:ring-primary/5 transition-all"
						/>
					</div>

					{activeTab === 'questions' && (
						<>
							<div className="md:col-span-3">
								<Select value={selectedSubject} onValueChange={setSelectedSubject}>
									<SelectTrigger className="h-20 rounded-[1.75rem] border-none bg-muted/10 px-8 text-lg font-black uppercase tracking-widest text-muted-foreground focus:ring-4 focus:ring-primary/5">
										<SelectValue placeholder="Subject" />
									</SelectTrigger>
									<SelectContent className="rounded-[2rem] border-none shadow-2xl p-2">
										<SelectItem value="all" className="rounded-xl font-black uppercase tracking-widest text-xs">All Subjects</SelectItem>
										{subjects.map((s) => (
											<SelectItem key={s.id} value={s.id.toString()} className="rounded-xl font-black uppercase tracking-widest text-xs">
												{s.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="md:col-span-3">
								<Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
									<SelectTrigger className="h-20 rounded-[1.75rem] border-none bg-muted/10 px-8 text-lg font-black uppercase tracking-widest text-muted-foreground focus:ring-4 focus:ring-primary/5">
										<SelectValue placeholder="Level" />
									</SelectTrigger>
									<SelectContent className="rounded-[2rem] border-none shadow-2xl p-2">
										<SelectItem value="all" className="rounded-xl font-black uppercase tracking-widest text-xs">All Levels</SelectItem>
										<SelectItem value="easy" className="rounded-xl font-black uppercase tracking-widest text-xs">Easy</SelectItem>
										<SelectItem value="medium" className="rounded-xl font-black uppercase tracking-widest text-xs">Medium</SelectItem>
										<SelectItem value="hard" className="rounded-xl font-black uppercase tracking-widest text-xs">Hard</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</>
					)}

					{activeTab === 'users' && (
						<div className="md:col-span-6 hidden md:block">
							{/* Reserved for user-specific filtering if needed */}
						</div>
					)}
				</div>
			</header>

			{/* Main Content Grid */}
			<main className="flex-1 overflow-hidden px-6 sm:px-10 lg:px-0">
				<div className="h-full no-scrollbar overflow-y-auto">
					{loading ? (
						<div className="flex items-center justify-center py-64">
							<CircleNotch size={64} className="animate-spin text-primary opacity-20" />
						</div>
					) : (
						<div className="pb-32 space-y-12">
							<div className="flex items-center gap-4 px-2">
								<h2 className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.4em]">
									Database Results ({activeTab === 'users' ? filteredUsers.length : activeTab === 'questions' ? filteredQuestions.length : activeTab === 'past-papers' ? allPastPapers.length : subjects.length})
								</h2>
								<div className="h-px flex-1 bg-muted/10" />
							</div>

							{activeTab === 'questions' && (
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
									{filteredQuestions.map((q) => (
										<Card
											key={q.id}
											className="rounded-[3.5rem] border-none bg-card shadow-[0_15px_45px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_80px_rgba(0,0,0,0.1)] transition-all duration-700 group overflow-hidden"
										>
											<CardContent className="p-10 space-y-8">
												<div className="flex items-start justify-between">
													<div className="flex flex-wrap gap-2">
														<div className={cn(
															"h-8 px-4 rounded-xl flex items-center justify-center text-[10px] font-black uppercase tracking-widest",
															getDifficultyColor(q.difficulty)
														)}>
															{q.difficulty}
														</div>
														<div className="h-8 px-4 rounded-xl flex items-center justify-center text-[10px] font-black uppercase tracking-widest bg-muted/10 text-muted-foreground/60">
															Grd {q.gradeLevel}
														</div>
													</div>
													<div className="flex items-center gap-2">
														<Button
															variant="ghost"
															size="icon"
															className="h-12 w-12 rounded-xl bg-muted/10 hover:bg-primary hover:text-white transition-all shadow-sm"
															onClick={() => handleEditQuestion(q)}
															aria-label="Edit"
														>
															<PencilSimple size={20} className="stroke-[3px]" />
														</Button>
														<Button
															variant="ghost"
															size="icon"
															className="h-12 w-12 rounded-xl bg-muted/10 hover:bg-tiimo-pink hover:text-white transition-all shadow-sm"
															onClick={() => handleDeleteQuestion(q.id)}
															aria-label="Delete"
														>
															<Trash size={20} className="stroke-[3px]" />
														</Button>
													</div>
												</div>

												<p className="text-xl font-black text-foreground tracking-tight line-clamp-3 leading-tight group-hover:text-primary transition-colors">
													{q.questionText}
												</p>

												<div className="pt-8 border-t border-muted/10 flex items-center justify-between">
													<div className="space-y-1">
														<p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">
															{getSubjectName(q.subjectId)}
														</p>
														<p className="text-sm font-bold text-foreground truncate max-w-[150px]">
															{q.topic}
														</p>
													</div>
													<div className="text-right space-y-1">
														<p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">
															Worth
														</p>
														<p className="text-3xl font-black text-primary tracking-tighter leading-none">{q.marks}m</p>
													</div>
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							)}

							{activeTab === 'users' && (
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
									{filteredUsers.map((u) => (
										<Card
											key={u.id}
											className="rounded-[3rem] border-none bg-card shadow-[0_15px_45px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_80px_rgba(0,0,0,0.1)] transition-all duration-700 group cursor-pointer"
										>
											<CardContent className="p-10 space-y-8">
												<div className="flex flex-col items-center text-center space-y-6">
													<Avatar className="h-28 w-28 border-8 border-white dark:border-zinc-900 shadow-2xl rounded-[2.5rem] group-hover:scale-105 transition-transform duration-700">
														<AvatarImage src={u.image || undefined} alt={u.name} />
														<AvatarFallback className="bg-primary text-white font-black text-3xl">
															{u.name.charAt(0)}
														</AvatarFallback>
													</Avatar>
													<div className="space-y-2">
														<h3 className="font-black text-2xl text-foreground tracking-tight leading-none">
															{u.name}
														</h3>
														<p className="text-sm font-bold text-muted-foreground/40 uppercase tracking-widest">
															{u.email}
														</p>
													</div>
												</div>

												<div className="pt-8 border-t border-muted/10 flex items-center justify-between">
													<div className={cn(
														"h-10 px-5 rounded-2xl flex items-center justify-center text-[10px] font-black uppercase tracking-widest shadow-sm",
														getRoleColor(u.role || 'user')
													)}>
														{u.role || 'user'}
													</div>
													<div className={cn(
														"h-10 px-5 rounded-2xl flex items-center justify-center text-[10px] font-black uppercase tracking-widest border-none",
														getStatusColor(u.isBlocked, u.deletedAt)
													)}>
														{getStatusText(u.isBlocked, u.deletedAt)}
													</div>
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							)}

							{activeTab === 'past-papers' && (
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
									{allPastPapers.map((p) => (
										<Card
											key={p.id}
											className="rounded-[3.5rem] border-none bg-card shadow-[0_15px_45px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_80px_rgba(0,0,0,0.1)] transition-all duration-700 group overflow-hidden"
										>
											<CardContent className="p-10 space-y-8">
												<div className="flex items-start justify-between">
													<div className="flex flex-wrap gap-2">
														<div className="h-8 px-4 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black uppercase tracking-widest">
															{p.year}
														</div>
														<div className="h-8 px-4 rounded-xl bg-muted/10 text-muted-foreground/60 flex items-center justify-center text-[10px] font-black uppercase tracking-widest">
															{p.paper}
														</div>
													</div>
												</div>

												<div className="space-y-2">
													<h3 className="text-2xl font-black text-foreground tracking-tight uppercase line-clamp-1">
														{p.paperId}
													</h3>
													<p className="text-sm font-bold text-muted-foreground/40 uppercase tracking-widest">{p.subject}</p>
												</div>

												<div className="pt-8 border-t border-muted/10 flex items-center justify-between">
													<div className="space-y-1">
														<p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">
															Content
														</p>
														<div className={cn(
															"h-8 px-4 rounded-xl flex items-center justify-center text-[10px] font-black uppercase tracking-widest",
															p.isExtracted ? 'bg-tiimo-green/10 text-tiimo-green' : 'bg-tiimo-orange/10 text-tiimo-orange'
														)}>
															{p.isExtracted ? 'Ready' : 'Pending'}
														</div>
													</div>
													<div className="text-right space-y-1">
														<p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">
															Month
														</p>
														<p className="text-xl font-black text-foreground uppercase tracking-tight">
															{p.month}
														</p>
													</div>
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							)}

							{activeTab === 'subjects' && (
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
									{subjects.map((s) => (
										<Card
											key={s.id}
											className="rounded-[3.5rem] border-none bg-card shadow-[0_15px_45px_rgba(0,0,0,0.05)] p-10 space-y-8 group hover:shadow-[0_30px_80px_rgba(0,0,0,0.1)] transition-all duration-700"
										>
											<div className="flex items-center justify-between">
												<h3 className="text-3xl font-black text-foreground tracking-tighter uppercase leading-none">
													{s.name}
												</h3>
												<div className={cn(
													"h-10 px-5 rounded-2xl flex items-center justify-center text-[10px] font-black uppercase tracking-widest",
													s.isActive ? 'bg-tiimo-green text-white shadow-lg shadow-tiimo-green/20' : 'bg-muted/20 text-muted-foreground/40'
												)}>
													{s.isActive ? 'Active' : 'Draft'}
												</div>
											</div>
											<p className="text-lg font-bold text-muted-foreground/60 leading-relaxed line-clamp-3">
												{s.description}
											</p>
											<div className="pt-8 border-t border-muted/10">
												<p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] mb-2">
													Curriculum ID
												</p>
												<div className="h-12 px-6 rounded-2xl bg-muted/10 flex items-center text-md font-black text-foreground uppercase tracking-widest w-fit">
													{s.curriculumCode}
												</div>
											</div>
										</Card>
									))}
								</div>
							)}
						</div>
					)}
				</div>
			</main>

			{/* Question Drawer */}
			<Drawer
				open={isModalOpen}
				onOpenChange={(open) => {
					setIsModalOpen(open);
					if (!open) setDrawerTab('basic');
				}}
			>
				<DrawerContent className="max-h-[90vh] flex flex-col z-50 rounded-t-[4rem] pb-8 lg:max-w-5xl lg:mx-auto border-none shadow-[0_-20px_60px_rgba(0,0,0,0.2)]">
					<DrawerHeader className="text-left border-b border-muted/10 pb-8 px-10 pt-10">
						<div className="flex items-center gap-6 mb-8">
							<div className="w-16 h-16 rounded-[1.5rem] bg-primary text-white flex items-center justify-center shadow-xl shadow-primary/20">
								<PencilSimple size={32} className="stroke-[3px]" />
							</div>
							<div className="space-y-1">
								<DrawerTitle className="text-4xl font-black tracking-tight leading-none">
									{editingQuestion?.id ? 'Refine question' : 'Draft question'}
								</DrawerTitle>
								<DrawerDescription className="text-lg font-bold text-muted-foreground/60 uppercase tracking-widest">
									Educational workspace
								</DrawerDescription>
							</div>
						</div>

						<Tabs
							value={drawerTab}
							onValueChange={(v) => setDrawerTab(v as typeof drawerTab)}
							className="w-full"
						>
							<TabsList className="h-16 p-1.5 bg-muted/10 rounded-2xl border-none shadow-inner flex gap-2">
								<TabsTrigger
									value="basic"
									className="flex-1 h-full rounded-[1.25rem] font-black text-[10px] uppercase tracking-[0.2em] data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 data-[state=active]:shadow-lg transition-all"
								>
									Metadata
								</TabsTrigger>
								<TabsTrigger
									value="question"
									className="flex-1 h-full rounded-[1.25rem] font-black text-[10px] uppercase tracking-[0.2em] data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 data-[state=active]:shadow-lg transition-all"
								>
									Text
								</TabsTrigger>
								<TabsTrigger
									value="options"
									className="flex-1 h-full rounded-[1.25rem] font-black text-[10px] uppercase tracking-[0.2em] data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 data-[state=active]:shadow-lg transition-all"
								>
									Answers
								</TabsTrigger>
							</TabsList>
						</Tabs>
					</DrawerHeader>

					{editingQuestion && (
						<ScrollArea className="flex-1 px-10 py-10 no-scrollbar">
							<div className="space-y-10">
								{drawerTab === 'basic' && (
									<div className="space-y-10">
										<div className="space-y-4">
											<Label className="font-black text-xs uppercase tracking-[0.2em] text-muted-foreground/40 ml-2">
												Graphic Aid
											</Label>
											{editingQuestion.imageUrl ? (
												<div className="relative aspect-video w-full rounded-[2.5rem] overflow-hidden shadow-2xl group border-none">
													<Image
														src={editingQuestion.imageUrl}
														alt="Question"
														width={800}
														height={400}
														className="w-full h-full object-contain bg-muted/20"
														unoptimized
													/>
													<div className="absolute top-6 right-6">
														<Button
															type="button"
															variant="ghost"
															size="icon"
															className="h-12 w-12 rounded-xl bg-zinc-950/80 text-white backdrop-blur-xl hover:bg-tiimo-pink transition-all"
															onClick={handleRemoveImage}
															aria-label="Remove image"
														>
															<X size={24} className="stroke-[3px]" />
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
														className="w-full h-64 rounded-[2.5rem] bg-muted/5 border-4 border-dashed border-muted/10 flex flex-col items-center justify-center gap-6 hover:bg-muted/10 transition-all cursor-pointer group"
													>
														<div className="w-20 h-20 rounded-[1.5rem] bg-muted/10 flex items-center justify-center group-hover:scale-110 transition-transform">
															<ImageSquare size={36} className="text-muted-foreground/30 stroke-[3px]" />
														</div>
														<span className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground/40">
															Click to upload illustration
														</span>
													</label>
												</div>
											)}
										</div>

										<div className="grid grid-cols-2 gap-10">
											<div className="space-y-4">
												<Label className="font-black text-xs uppercase tracking-[0.2em] text-muted-foreground/40 ml-2">
													Subject Domain
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
													<SelectTrigger className="h-16 rounded-2xl bg-muted/10 border-none px-6 text-lg font-black uppercase tracking-widest text-muted-foreground focus:ring-4 focus:ring-primary/5">
														<SelectValue placeholder="Domain" />
													</SelectTrigger>
													<SelectContent className="rounded-2xl border-none shadow-2xl">
														{subjects.map((s) => (
															<SelectItem key={s.id} value={s.id.toString()} className="rounded-xl font-black text-xs uppercase tracking-widest">
																{s.name}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</div>
											<div className="space-y-4">
												<Label className="font-black text-xs uppercase tracking-[0.2em] text-muted-foreground/40 ml-2">
													Curriculum Level
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
													<SelectTrigger className="h-16 rounded-2xl bg-muted/10 border-none px-6 text-lg font-black uppercase tracking-widest text-muted-foreground focus:ring-4 focus:ring-primary/5">
														<SelectValue placeholder="Grade" />
													</SelectTrigger>
													<SelectContent className="rounded-2xl border-none shadow-2xl">
														<SelectItem value="10" className="rounded-xl font-black text-xs uppercase tracking-widest">Grade 10</SelectItem>
														<SelectItem value="11" className="rounded-xl font-black text-xs uppercase tracking-widest">Grade 11</SelectItem>
														<SelectItem value="12" className="rounded-xl font-black text-xs uppercase tracking-widest">Grade 12</SelectItem>
													</SelectContent>
												</Select>
											</div>
										</div>

										<div className="grid grid-cols-2 gap-10">
											<div className="space-y-4">
												<Label
													htmlFor="cms-topic"
													className="font-black text-xs uppercase tracking-[0.2em] text-muted-foreground/40 ml-2"
												>
													Study Topic
												</Label>
												<Input
													id="cms-topic"
													value={editingQuestion.topic}
													onChange={(e) =>
														setEditingQuestion({ ...editingQuestion, topic: e.target.value })
													}
													className="h-16 rounded-2xl bg-muted/10 border-none px-6 text-lg font-black placeholder:text-muted-foreground/20 focus:ring-4 focus:ring-primary/5"
													placeholder="e.g. Kinematics"
												/>
											</div>
											<div className="space-y-4">
												<Label className="font-black text-xs uppercase tracking-[0.2em] text-muted-foreground/40 ml-2">
													Challenge Tier
												</Label>
												<Select
													value={editingQuestion.difficulty}
													// biome-ignore lint/suspicious/noExplicitAny: Select onValueChange gives any for some reason
													onValueChange={(v: any) =>
														setEditingQuestion({ ...editingQuestion, difficulty: v })
													}
												>
													<SelectTrigger className="h-16 rounded-2xl bg-muted/10 border-none px-6 text-lg font-black uppercase tracking-widest text-muted-foreground focus:ring-4 focus:ring-primary/5">
														<SelectValue placeholder="Tier" />
													</SelectTrigger>
													<SelectContent className="rounded-2xl border-none shadow-2xl">
														<SelectItem value="easy" className="rounded-xl font-black text-xs uppercase tracking-widest">Easy</SelectItem>
														<SelectItem value="medium" className="rounded-xl font-black text-xs uppercase tracking-widest">Medium</SelectItem>
														<SelectItem value="hard" className="rounded-xl font-black text-xs uppercase tracking-widest">Hard</SelectItem>
													</SelectContent>
												</Select>
											</div>
										</div>
									</div>
								)}

								{drawerTab === 'question' && (
									<div className="space-y-10">
										<div className="space-y-4">
											<Label
												htmlFor="cms-question-text"
												className="font-black text-xs uppercase tracking-[0.2em] text-muted-foreground/40 ml-2"
											>
												Inquiry Text
											</Label>
											<Textarea
												id="cms-question-text"
												value={editingQuestion.questionText}
												onChange={(e) =>
													setEditingQuestion({ ...editingQuestion, questionText: e.target.value })
												}
												className="min-h-64 rounded-[2.5rem] bg-muted/5 border-none p-10 font-black text-2xl leading-tight placeholder:text-muted-foreground/10 focus:ring-8 focus:ring-primary/5 transition-all"
												placeholder="Draft your question here..."
											/>
										</div>
										<div className="space-y-4 w-48">
											<Label
												htmlFor="cms-points"
												className="font-black text-xs uppercase tracking-[0.2em] text-muted-foreground/40 ml-2"
											>
												Point Value
											</Label>
											<div className="relative">
												<Input
													id="cms-points"
													type="number"
													value={editingQuestion.marks}
													onChange={(e) =>
														setEditingQuestion({
															...editingQuestion,
															marks: Number.parseInt(e.target.value, 10),
														})
													}
													className="h-20 rounded-2xl bg-primary text-white border-none font-black text-4xl text-center shadow-xl shadow-primary/20"
												/>
												<div className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-xs text-white/40 uppercase tracking-widest">MAR</div>
											</div>
										</div>
									</div>
								)}

								{drawerTab === 'options' && (
									<div className="space-y-8">
										<div className="flex items-end justify-between px-2">
											<div className="space-y-1">
												<Label className="text-2xl font-black text-foreground tracking-tight">Propositions</Label>
												<p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Multiple Choice Answers</p>
											</div>
											<Button
												type="button"
												variant="ghost"
												onClick={addOption}
												className="h-12 px-6 rounded-2xl bg-muted/10 hover:bg-primary hover:text-white font-black text-xs uppercase tracking-widest transition-all gap-2"
											>
												<Plus size={18} className="stroke-[3px]" /> Add Option
											</Button>
										</div>

										<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
											{editingQuestion.options.map((opt, idx) => (
												<Card
													key={opt.optionLetter}
													className="p-8 rounded-[3rem] border-none bg-muted/5 space-y-6 relative overflow-hidden group shadow-sm hover:shadow-md transition-all"
												>
													<div className="flex items-center justify-between relative z-10">
														<div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl bg-primary text-white shadow-xl shadow-primary/20">
															{opt.optionLetter}
														</div>
														<div className="flex items-center gap-4">
															<div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 rounded-xl shadow-sm">
																<Checkbox
																	id={`correct-${idx}`}
																	checked={opt.isCorrect}
																	onCheckedChange={(v) => updateOption(idx, 'isCorrect', !!v)}
																	className="h-5 w-5 rounded-md border-2 border-tiimo-green data-[state=checked]:bg-tiimo-green data-[state=checked]:border-tiimo-green"
																/>
																<Label
																	htmlFor={`correct-${idx}`}
																	className="text-[10px] font-black uppercase tracking-widest text-tiimo-green cursor-pointer"
																>
																	Target
																</Label>
															</div>
															<Button
																variant="ghost"
																size="icon"
																className="h-10 w-10 rounded-xl bg-muted/10 text-tiimo-pink hover:bg-tiimo-pink hover:text-white transition-all"
																onClick={() => removeOption(idx)}
																aria-label="Remove"
															>
																<Trash size={20} className="stroke-[3px]" />
															</Button>
														</div>
													</div>
													<div className="space-y-4 relative z-10">
														<Textarea
															value={opt.optionText}
															onChange={(e) => updateOption(idx, 'optionText', e.target.value)}
															className="min-h-24 rounded-2xl bg-white dark:bg-zinc-900 border-none px-6 py-5 font-bold text-lg placeholder:text-muted-foreground/10 focus:ring-4 focus:ring-primary/5 transition-all"
															placeholder="Draft possibility..."
														/>
														<Textarea
															value={opt.explanation}
															onChange={(e) => updateOption(idx, 'explanation', e.target.value)}
															className="min-h-20 rounded-2xl bg-muted/10 border-none px-6 py-4 text-xs font-bold italic placeholder:text-muted-foreground/20 focus:ring-4 focus:ring-primary/5 transition-all"
															placeholder="Draft rationale..."
														/>
													</div>
												</Card>
											))}
										</div>
									</div>
								)}
							</div>
						</ScrollArea>
					)}

					<DrawerFooter className="pt-10 border-t border-muted/10 flex-row gap-6 px-10">
						<DrawerClose asChild>
							<Button
								variant="ghost"
								disabled={isSaving}
								className="flex-1 h-20 rounded-[2.25rem] bg-muted/10 font-black uppercase tracking-[0.2em] text-xs hover:bg-tiimo-pink hover:text-white transition-all"
							>
								Discard
							</Button>
						</DrawerClose>
						<Button
							onClick={handleSaveQuestion}
							disabled={!isFormValid() || isSaving}
							className="flex-[2] h-20 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-[2.25rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-black/30 hover:opacity-90 active:scale-95 transition-all"
						>
							{isSaving ? (
								<CircleNotch size={32} className="animate-spin" />
							) : editingQuestion?.id ? (
								'Finalize Edits'
							) : (
								'Commit to Database'
							)}
						</Button>
					</DrawerFooter>
				</DrawerContent>
			</Drawer>
		</div>
	);
}
