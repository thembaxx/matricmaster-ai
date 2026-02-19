'use client';

import {
	Database,
	Edit2,
	ImagePlus,
	Maximize2,
	Plus,
	Search,
	Trash2,
	Upload,
	X,
	ZoomIn,
	ZoomOut,
} from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import { SafeImage } from '@/components/SafeImage';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
	createPastPaperAction,
	createQuestionAction,
	deletePastPaperAction,
	deleteUserAction,
	getPastPapersAction,
	getQuestionsAction,
	getQuestionWithOptionsAction,
	getSubjectsAction,
	getUsersAction,
	restoreUserAction,
	seedDatabaseAction,
	softDeleteQuestionAction,
	toggleUserBlockAction,
	updatePastPaperAction,
	updateQuestionAction,
	updateUserAction,
} from '@/lib/db/actions';
import type { User } from '@/lib/db/better-auth-schema';
import type { PastPaper, Question, Subject } from '@/lib/db/schema';
import { generatePaperId } from '@/lib/paper-utils';
import { uploadFiles } from '@/lib/uploadthing';

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

interface PastPaperFormData {
	id?: string;
	subject: string;
	paper: string;
	year: number;
	month: string;
	totalMarks: number;
	instructions?: string;
	originalPdfUrl?: string;
	isExtracted?: boolean;
	extractQuestions?: boolean;
}

const SUBJECTS = [
	'Mathematics',
	'Physical Sciences',
	'Life Sciences',
	'English',
	'Geography',
	'History',
	'Accounting',
	'Economics',
];

const PAPER_TYPES = ['P1', 'P2', 'P3'];
const MONTHS = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December',
];
const YEARS = Array.from({ length: 15 }, (_, i) => new Date().getFullYear() - i);

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
	const [drawerTab, setDrawerTab] = useState<'basic' | 'question' | 'options'>('basic');
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [localImageFile, setLocalImageFile] = useState<File | null>(null);
	const [localImagePreview, setLocalImagePreview] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// PDF upload state for past papers
	const [localPdfFile, setLocalPdfFile] = useState<File | null>(null);
	const [localPdfPreview, setLocalPdfPreview] = useState<string | null>(null);
	const [pdfUploading, setPdfUploading] = useState(false);
	const pdfInputRef = useRef<HTMLInputElement>(null);
	const pdfInputId = useId();

	// User management state
	const [userSearchQuery, setUserSearchQuery] = useState('');
	const [userFilter, setUserFilter] = useState<'all' | 'active' | 'blocked' | 'deleted'>('all');
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [isUserDrawerOpen, setIsUserDrawerOpen] = useState(false);
	const [userDrawerTab, setUserDrawerTab] = useState<'details' | 'actions'>('details');
	const [editingUser, setEditingUser] = useState<{
		name: string;
		email: string;
		role: 'admin' | 'moderator' | 'user';
	} | null>(null);

	// Past Papers management state
	const [pastPapers, setPastPapers] = useState<PastPaper[]>([]);
	const [pastPapersLoading, setPastPapersLoading] = useState(false);
	const [isPastPaperDrawerOpen, setIsPastPaperDrawerOpen] = useState(false);
	const [editingPastPaper, setEditingPastPaper] = useState<PastPaperFormData | null>(null);
	const [paperFilter] = useState<string>('all');
	const [selectedPastPaperSubject, setSelectedPastPaperSubject] = useState<string>('all');

	// Load past papers
	const loadPastPapers = useCallback(async () => {
		try {
			setPastPapersLoading(true);
			const papers = await getPastPapersAction({});
			setPastPapers(papers);
		} catch (error) {
			console.error('Failed to load past papers:', error);
		} finally {
			setPastPapersLoading(false);
		}
	}, []);

	// Load past papers when tab changes to past-papers
	useEffect(() => {
		if (activeTab === 'past-papers') {
			loadPastPapers();
		}
	}, [activeTab, loadPastPapers]);

	// Past paper handlers
	const handleCreatePastPaper = () => {
		setEditingPastPaper({
			subject: 'Mathematics',
			paper: 'P1',
			year: new Date().getFullYear(),
			month: 'November',
			totalMarks: 150,
			extractQuestions: false,
		});
		setIsPastPaperDrawerOpen(true);
	};

	const handleEditPastPaper = (paper: PastPaper) => {
		setEditingPastPaper({
			id: paper.id,
			subject: paper.subject,
			paper: paper.paper,
			year: paper.year,
			month: paper.month,
			totalMarks: paper.totalMarks || 150,
			instructions: paper.instructions || '',
			originalPdfUrl: paper.originalPdfUrl,
			isExtracted: paper.isExtracted,
		});
		setIsPastPaperDrawerOpen(true);
	};

	const handleDeletePastPaper = async (id: string) => {
		if (confirm('Are you sure you want to delete this past paper?')) {
			try {
				await deletePastPaperAction(id);
				await loadPastPapers();
			} catch (error) {
				console.error('Failed to delete past paper:', error);
			}
		}
	};

	const handleSavePastPaper = async () => {
		if (!editingPastPaper) return;

		if (!editingPastPaper.subject || !editingPastPaper.paper || !editingPastPaper.month) {
			alert('Please fill in all required fields');
			return;
		}

		try {
			setPdfUploading(true);
			const paperId = editingPastPaper.id
				? editingPastPaper.id
				: generatePaperId(
						editingPastPaper.subject,
						editingPastPaper.paper,
						editingPastPaper.year,
						editingPastPaper.month
					);

			// Upload PDF if a new one is selected
			let pdfUrl = editingPastPaper.originalPdfUrl;
			if (localPdfFile) {
				const uploadResult = await uploadFiles('pastPaperPDF', {
					files: [localPdfFile],
				});
				if (uploadResult?.[0]?.ufsUrl) {
					pdfUrl = uploadResult[0].ufsUrl;
				} else {
					setPdfUploading(false);
					alert('Failed to upload PDF. Please try again.');
					return;
				}
			}

			if (editingPastPaper.id) {
				// Update existing
				await updatePastPaperAction(editingPastPaper.id, {
					subject: editingPastPaper.subject,
					paper: editingPastPaper.paper,
					year: editingPastPaper.year,
					month: editingPastPaper.month,
					totalMarks: editingPastPaper.totalMarks,
					instructions: editingPastPaper.instructions,
					originalPdfUrl: pdfUrl,
				});
			} else {
				// Create new
				await createPastPaperAction({
					paperId,
					subject: editingPastPaper.subject,
					paper: editingPastPaper.paper,
					year: editingPastPaper.year,
					month: editingPastPaper.month,
					totalMarks: editingPastPaper.totalMarks,
					originalPdfUrl: pdfUrl || 'https://example.com/sample.pdf',
					instructions: editingPastPaper.instructions,
				});
			}

			clearPdfState();
			setIsPastPaperDrawerOpen(false);
			setEditingPastPaper(null);
			await loadPastPapers();
		} catch (error) {
			console.error('Failed to save past paper:', error);
			setPdfUploading(false);
			alert('Failed to save past paper. Please try again.');
		}
	};

	// Get unique subjects from past papers for filter pills
	const pastPaperSubjects = Array.from(new Set(pastPapers.map((p) => p.subject))).sort();

	const filteredPastPapers = pastPapers.filter((p) => {
		// Filter by subject
		if (selectedPastPaperSubject !== 'all' && p.subject !== selectedPastPaperSubject) {
			return false;
		}
		if (paperFilter === 'all') return true;
		if (paperFilter === 'extracted') return p.isExtracted;
		if (paperFilter === 'not-extracted') return !p.isExtracted;
		return true;
	});

	const loadData = useCallback(async () => {
		try {
			setLoading(true);
			const [subjectsData, questionsData, usersData] = await Promise.all([
				getSubjectsAction(),
				getQuestionsAction({}),
				getUsersAction({}),
			]);
			setSubjects(subjectsData);
			setQuestions(questionsData);
			setUsers(usersData);
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

	// User management handlers
	const handleOpenUserDrawer = (user: User) => {
		setSelectedUser(user);
		setEditingUser({
			name: user.name,
			email: user.email,
			role: (user.role as 'admin' | 'moderator' | 'user') || 'user',
		});
		setUserDrawerTab('details');
		setIsUserDrawerOpen(true);
	};

	const handleUpdateUser = async () => {
		if (!selectedUser || !editingUser) return;

		try {
			await updateUserAction(selectedUser.id, editingUser);
			await loadData();
			alert('User updated successfully');
		} catch (error) {
			console.error('Failed to update user:', error);
			alert('Failed to update user');
		}
	};

	const handleToggleBlock = async () => {
		if (!selectedUser) return;

		const action = selectedUser.isBlocked ? 'unblock' : 'block';
		if (!confirm(`Are you sure you want to ${action} this user?`)) return;

		try {
			const result = await toggleUserBlockAction(selectedUser.id);
			if (result.success) {
				await loadData();
				// Update selected user in state
				if (result.user) {
					setSelectedUser(result.user);
				}
				alert(`User ${action}ed successfully`);
			}
		} catch (error) {
			console.error('Failed to toggle block:', error);
			alert('Failed to update user status');
		}
	};

	const handleDeleteUser = async () => {
		if (!selectedUser) return;

		if (!confirm('Are you sure you want to delete this user? This action can be undone later.'))
			return;

		try {
			await deleteUserAction(selectedUser.id);
			await loadData();
			setIsUserDrawerOpen(false);
			alert('User deleted successfully');
		} catch (error) {
			console.error('Failed to delete user:', error);
			alert('Failed to delete user');
		}
	};

	const handleRestoreUser = async (userId: string) => {
		try {
			await restoreUserAction(userId);
			await loadData();
			alert('User restored successfully');
		} catch (error) {
			console.error('Failed to restore user:', error);
			alert('Failed to restore user');
		}
	};

	const filteredUsers = users.filter((u) => {
		const matchesSearch =
			u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
			u.email.toLowerCase().includes(userSearchQuery.toLowerCase());
		return matchesSearch;
	});

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
			let imageUrlToSave = editingQuestion.imageUrl;

			if (localImageFile) {
				const uploadResult = await uploadFiles('questionImage', {
					files: [localImageFile],
				});
				if (uploadResult?.[0]?.ufsUrl) {
					imageUrlToSave = uploadResult[0].ufsUrl;
				} else {
					alert('Failed to upload image. Please try again.');
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
				// Note: For updating options, you'd need to add updateOptions function
				// For now, we'll just reload the data
			} else {
				// Create new question
				await createQuestionAction(questionData, optionsData);
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
			alert('Failed to save question. Please try again.');
		}
	};

	const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			if (file.size > 4 * 1024 * 1024) {
				alert('Image must be less than 4MB');
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

	// PDF handlers for past papers
	const handlePdfSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			if (file.size > 16 * 1024 * 1024) {
				alert('PDF must be less than 16MB');
				return;
			}
			if (file.type !== 'application/pdf') {
				alert('Only PDF files are allowed');
				return;
			}
			setLocalPdfFile(file);
			// Create a URL for preview
			const previewUrl = URL.createObjectURL(file);
			setLocalPdfPreview(previewUrl);
		}
	};

	const handleRemovePdf = () => {
		if (localPdfPreview) {
			URL.revokeObjectURL(localPdfPreview);
		}
		setLocalPdfFile(null);
		setLocalPdfPreview(null);
	};

	const triggerPdfInput = () => {
		pdfInputRef.current?.click();
	};

	// Clear PDF state when drawer closes
	const clearPdfState = () => {
		if (localPdfPreview) {
			URL.revokeObjectURL(localPdfPreview);
		}
		setLocalPdfFile(null);
		setLocalPdfPreview(null);
		setPdfUploading(false);
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

	// User display helpers
	const getRoleColor = (role: string) => {
		switch (role) {
			case 'admin':
				return 'bg-brand-purple text-white';
			case 'moderator':
				return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
			default:
				return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
		}
	};

	const getStatusColor = (isBlocked: boolean, deletedAt: Date | null) => {
		if (deletedAt) return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
		if (isBlocked)
			return 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400';
		return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
	};

	const getStatusText = (isBlocked: boolean, deletedAt: Date | null) => {
		if (deletedAt) return 'Deleted';
		if (isBlocked) return 'Blocked';
		return 'Active';
	};

	// Generate unique IDs for form fields
	const questionId = useId();
	const topicId = useId();
	const marksId = useId();
	const fileInputId = useId();

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
						onClick={() => {
							if (activeTab === 'past-papers') {
								handleCreatePastPaper();
							} else {
								handleCreateQuestion();
							}
						}}
						size="icon"
						className="rounded-lg h-8 w-8 bg-brand-purple hover:bg-brand-purple/90 shadow-lg shadow-purple-500/20"
					>
						<Plus className="h-5 w-5" />
					</Button>
				</div>

				{/* Tabs */}
				<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
					<TabsList className="grid w-full grid-cols-4 mb-4">
						<TabsTrigger value="questions">Questions</TabsTrigger>
						<TabsTrigger value="past-papers">Past Papers</TabsTrigger>
						<TabsTrigger value="subjects">Subjects</TabsTrigger>
						<TabsTrigger value="users">Users</TabsTrigger>
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

						<div className="flex gap-2 px-1 w-full overflow-x-auto">
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

				{/* User Filters */}
				{activeTab === 'users' && (
					<div className="space-y-3">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
							<Input
								value={userSearchQuery}
								onChange={(e) => setUserSearchQuery(e.target.value)}
								placeholder="Search users by name or email..."
								className="pl-10 text-base h-12"
							/>
						</div>
						<Select value={userFilter} onValueChange={(v) => setUserFilter(v as typeof userFilter)}>
							<SelectTrigger>
								<SelectValue placeholder="Filter users" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Users</SelectItem>
								<SelectItem value="active">Active</SelectItem>
								<SelectItem value="blocked">Blocked</SelectItem>
								<SelectItem value="deleted">Deleted</SelectItem>
							</SelectContent>
						</Select>
					</div>
				)}

				{/* Past Papers Filters */}
				{activeTab === 'past-papers' && pastPaperSubjects.length > 0 && (
					<div className="flex gap-2 px-1 w-full overflow-x-auto">
						<button
							type="button"
							onClick={() => setSelectedPastPaperSubject('all')}
							className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
								selectedPastPaperSubject === 'all'
									? 'bg-brand-purple text-white shadow-md scale-105'
									: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
							}`}
						>
							All
						</button>
						{pastPaperSubjects.map((subject) => {
							const isSelected = selectedPastPaperSubject === subject;
							return (
								<button
									type="button"
									key={subject}
									onClick={() => setSelectedPastPaperSubject(subject)}
									className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
										isSelected
											? 'bg-brand-purple text-white shadow-md scale-105'
											: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
									}`}
								>
									{subject}
								</button>
							);
						})}
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
													<div className="flex items-center justify-start gap-2 text-xs text-zinc-500">
														<Badge variant="secondary" className="text-[10px]">
															{getSubjectName(question.subjectId)}
														</Badge>
														<span>•</span>
														<span className="grow truncate">{question.topic}</span>
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
						) : activeTab === 'subjects' ? (
							// Subjects Tab
							<div className="space-y-4">
								{subjects.map((subject) => (
									<Card key={subject.id}>
										<CardContent className="p-4">
											<div className="flex items-center justify-between">
												<div>
													<h3 className="font-medium text-base text-zinc-900 dark:text-white">
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
						) : activeTab === 'past-papers' ? (
							// Past Papers Tab
							<div className="space-y-4">
								{pastPapersLoading ? (
									<div className="flex items-center justify-center py-20">
										<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple" />
									</div>
								) : filteredPastPapers.length === 0 ? (
									<div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
										<div className="text-6xl mb-4">📄</div>
										<p className="text-sm font-bold">No past papers found</p>
										<p className="text-xs text-zinc-500 mt-2">
											Click the + button to add a past paper
										</p>
									</div>
								) : (
									filteredPastPapers.map((paper) => (
										<Card key={paper.id} className="group">
											<CardContent className="p-4">
												<div className="flex items-start gap-4">
													<div className="flex-1 min-w-0">
														<div className="flex items-center gap-2 mb-2">
															<Badge variant="secondary">{paper.subject}</Badge>
															<Badge variant="outline">{paper.paper}</Badge>
															<Badge variant="outline">{paper.year}</Badge>
															<Badge variant="outline">{paper.month}</Badge>
															{paper.isExtracted && (
																<Badge className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
																	Extracted
																</Badge>
															)}
														</div>
														<div className="flex items-center gap-2 text-xs text-zinc-400">
															<span>{paper.totalMarks || 150} marks</span>
														</div>
													</div>
													<div className="flex flex-col gap-1">
														<Button
															variant="ghost"
															size="icon"
															className="h-8 w-8 text-zinc-400 hover:text-brand-purple"
															onClick={() => handleEditPastPaper(paper)}
														>
															<Edit2 className="h-4 w-4" />
														</Button>
														<Button
															variant="ghost"
															size="icon"
															className="h-8 w-8 text-zinc-400 hover:text-red-500"
															onClick={() => handleDeletePastPaper(paper.id)}
														>
															<Trash2 className="h-4 w-4" />
														</Button>
													</div>
												</div>
											</CardContent>
										</Card>
									))
								)}
							</div>
						) : (
							// Users Tab
							<div className="space-y-4">
								{filteredUsers.length === 0 ? (
									<div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
										<div className="text-6xl mb-4">👥</div>
										<p className="text-sm font-bold">No users found</p>
										<p className="text-xs text-zinc-500 mt-2">
											Try adjusting your search or filter
										</p>
									</div>
								) : (
									filteredUsers.map((user) => (
										<Card
											key={user.id}
											className="group cursor-pointer hover:shadow-md transition-shadow"
											onClick={() => handleOpenUserDrawer(user)}
										>
											<CardContent className="p-4">
												<div className="flex items-start gap-4">
													<Avatar className="h-12 w-12">
														<AvatarImage src={user.image || undefined} alt={user.name} />
														<AvatarFallback className="bg-brand-purple text-white">
															{user.name.charAt(0).toUpperCase()}
														</AvatarFallback>
													</Avatar>
													<div className="flex-1 min-w-0">
														<div className="flex items-center gap-2 mb-1">
															<h3 className="font-medium text-base text-zinc-900 dark:text-white truncate">
																{user.name}
															</h3>
															<Badge className={`text-xs ${getRoleColor(user.role || 'user')}`}>
																{user.role || 'user'}
															</Badge>
														</div>
														<p className="text-sm text-zinc-500 truncate">{user.email}</p>
														<div className="flex items-center gap-2 mt-2">
															<Badge
																variant="secondary"
																className={getStatusColor(user.isBlocked, user.deletedAt)}
															>
																{getStatusText(user.isBlocked, user.deletedAt)}
															</Badge>
															<span className="text-xs text-zinc-400">
																Joined {new Date(user.createdAt).toLocaleDateString()}
															</span>
														</div>
													</div>
													{user.deletedAt && (
														<Button
															variant="outline"
															size="sm"
															onClick={(e) => {
																e.stopPropagation();
																handleRestoreUser(user.id);
															}}
															className="text-xs"
														>
															Restore
														</Button>
													)}
												</div>
											</CardContent>
										</Card>
									))
								)}
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
				<DrawerContent className="max-h-[90vh] flex flex-col z-50 rounded-t-3xl pb-3">
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
																onClick={handleRemoveImage}
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
																					<SafeImage
																						src={editingQuestion.imageUrl}
																						alt="Question"
																						className="max-w-none"
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
														className="w-full rounded-lg border-2 border-dashed border-input p-4 flex flex-col items-center justify-center gap-2 hover:border-brand-purple hover:bg-muted/50 transition-colors cursor-pointer"
													>
														<ImagePlus className="h-8 w-8 text-muted-foreground" />
														<span className="text-sm text-muted-foreground">
															Click to upload image (max 4MB)
														</span>
													</label>
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
																subjectId: Number.parseInt(value, 10),
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
																gradeLevel: Number.parseInt(value, 10),
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
														marks: Number.parseInt(e.target.value, 10) || 1,
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

			{/* User Drawer */}
			<Drawer
				open={isUserDrawerOpen}
				onOpenChange={(open) => {
					setIsUserDrawerOpen(open);
					if (!open) setUserDrawerTab('details');
				}}
			>
				<DrawerContent className="max-h-[90vh] flex flex-col z-50 rounded-t-3xl pb-3">
					<DrawerHeader className="text-left border-b pb-4">
						<DrawerTitle>User Details</DrawerTitle>
						<DrawerDescription>Manage user account and permissions</DrawerDescription>

						<Tabs
							value={userDrawerTab}
							onValueChange={(v) => setUserDrawerTab(v as typeof userDrawerTab)}
							className="w-full mt-4"
						>
							<TabsList className="grid w-full grid-cols-2">
								<TabsTrigger value="details">Details</TabsTrigger>
								<TabsTrigger value="actions">Actions</TabsTrigger>
							</TabsList>
						</Tabs>
					</DrawerHeader>

					{selectedUser && editingUser && (
						<ScrollArea className="flex-1 px-4">
							<div className="space-y-6 py-4">
								{/* Tab 1: Details */}
								{userDrawerTab === 'details' && (
									<div className="space-y-6">
										{/* User Avatar & Basic Info */}
										<div className="flex items-center gap-4">
											<Avatar className="h-16 w-16">
												<AvatarImage
													src={selectedUser.image || undefined}
													alt={selectedUser.name}
												/>
												<AvatarFallback className="bg-brand-purple text-white text-lg">
													{selectedUser.name.charAt(0).toUpperCase()}
												</AvatarFallback>
											</Avatar>
											<div>
												<h3 className="font-semibold text-lg">{selectedUser.name}</h3>
												<p className="text-sm text-zinc-500">{selectedUser.email}</p>
												<div className="flex items-center gap-2 mt-1">
													<Badge className={getRoleColor(selectedUser.role || 'user')}>
														{selectedUser.role || 'user'}
													</Badge>
													<Badge
														variant="secondary"
														className={getStatusColor(
															selectedUser.isBlocked,
															selectedUser.deletedAt
														)}
													>
														{getStatusText(selectedUser.isBlocked, selectedUser.deletedAt)}
													</Badge>
												</div>
											</div>
										</div>

										{/* Edit Form */}
										<div className="space-y-4">
											<div className="space-y-2">
												<Label>Name</Label>
												<Input
													value={editingUser.name}
													onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
													placeholder="User name"
												/>
											</div>

											<div className="space-y-2">
												<Label>Email</Label>
												<Input
													value={editingUser.email}
													onChange={(e) =>
														setEditingUser({ ...editingUser, email: e.target.value })
													}
													placeholder="User email"
													type="email"
												/>
											</div>

											<div className="space-y-2">
												<Label>Role</Label>
												<Select
													value={editingUser.role}
													onValueChange={(v: 'admin' | 'moderator' | 'user') =>
														setEditingUser({ ...editingUser, role: v })
													}
												>
													<SelectTrigger>
														<SelectValue placeholder="Select role" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="admin">Admin</SelectItem>
														<SelectItem value="moderator">Moderator</SelectItem>
														<SelectItem value="user">User</SelectItem>
													</SelectContent>
												</Select>
											</div>

											<div className="pt-2">
												<Button
													onClick={handleUpdateUser}
													className="w-full bg-brand-purple hover:bg-brand-purple/90"
												>
													Save Changes
												</Button>
											</div>
										</div>

										{/* Join Date */}
										<div className="pt-4 border-t">
											<p className="text-sm text-zinc-500">
												Joined: {new Date(selectedUser.createdAt).toLocaleDateString()} at{' '}
												{new Date(selectedUser.createdAt).toLocaleTimeString()}
											</p>
											{selectedUser.deletedAt && (
												<p className="text-sm text-red-500 mt-1">
													Deleted: {new Date(selectedUser.deletedAt).toLocaleDateString()}
												</p>
											)}
										</div>
									</div>
								)}

								{/* Tab 2: Actions */}
								{userDrawerTab === 'actions' && (
									<div className="space-y-4">
										<div className="p-4 border rounded-lg space-y-3">
											<h4 className="font-medium">Account Status</h4>
											<p className="text-sm text-zinc-500">
												{selectedUser.isBlocked
													? 'This user is currently blocked and cannot log in.'
													: 'This user can log in and access the application.'}
											</p>
											<Button
												onClick={handleToggleBlock}
												variant={selectedUser.isBlocked ? 'default' : 'destructive'}
												className="w-full"
											>
												{selectedUser.isBlocked ? 'Unblock User' : 'Block User'}
											</Button>
										</div>

										<div className="p-4 border rounded-lg space-y-3">
											<h4 className="font-medium text-red-600">Danger Zone</h4>
											<p className="text-sm text-zinc-500">
												{selectedUser.deletedAt
													? 'This user has been soft deleted. They can be restored.'
													: 'Deleting a user will soft delete their account. This can be undone.'}
											</p>
											{selectedUser.deletedAt ? (
												<Button
													onClick={() => handleRestoreUser(selectedUser.id)}
													variant="outline"
													className="w-full"
												>
													Restore User
												</Button>
											) : (
												<Button onClick={handleDeleteUser} variant="destructive" className="w-full">
													Delete User
												</Button>
											)}
										</div>
									</div>
								)}
							</div>
						</ScrollArea>
					)}

					<DrawerFooter className="pt-4 border-t">
						<DrawerClose asChild>
							<Button variant="outline" className="w-full">
								Close
							</Button>
						</DrawerClose>
					</DrawerFooter>
				</DrawerContent>
			</Drawer>

			{/* Past Papers Drawer */}
			<Drawer
				open={isPastPaperDrawerOpen}
				onOpenChange={(open) => {
					setIsPastPaperDrawerOpen(open);
					if (!open) {
						setEditingPastPaper(null);
						clearPdfState();
					}
				}}
			>
				<DrawerContent className="max-h-[90vh] flex flex-col z-50 rounded-t-3xl pb-3 overflow-hidden">
					<DrawerHeader className="text-left border-b pb-4 shrink-0">
						<DrawerTitle>
							{editingPastPaper?.id ? 'Edit Past Paper' : 'Add New Past Paper'}
						</DrawerTitle>
						<DrawerDescription>
							{editingPastPaper?.id
								? 'Edit the past paper details below.'
								: 'Fill in the details to add a new past paper.'}
						</DrawerDescription>
					</DrawerHeader>

					{editingPastPaper && (
						<ScrollArea className="flex-1 px-4 h-full">
							<div className="space-y-6 py-4">
								{/* PDF Upload */}
								<div className="space-y-2">
									<Label>Past Paper PDF (Optional)</Label>
									{localPdfPreview || editingPastPaper.originalPdfUrl ? (
										<div className="space-y-2 mt-2">
											<div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
												<div className="h-12 w-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
													<span className="text-red-600 dark:text-red-400 font-bold text-xs">
														PDF
													</span>
												</div>
												<div className="flex-1 min-w-0">
													<p className="text-sm font-medium truncate">
														{localPdfFile?.name || 'Uploaded PDF'}
													</p>
													<p className="text-xs text-zinc-500">
														{localPdfFile
															? `${(localPdfFile.size / 1024 / 1024).toFixed(2)} MB`
															: 'Ready'}
													</p>
												</div>
												<Button
													type="button"
													variant="ghost"
													size="icon"
													className="text-zinc-400 hover:text-red-500"
													onClick={handleRemovePdf}
												>
													<X className="h-4 w-4" />
												</Button>
											</div>
										</div>
									) : (
										<div className="mt-2">
											<input
												type="file"
												id={pdfInputId}
												ref={pdfInputRef}
												onChange={handlePdfSelect}
												accept="application/pdf"
												className="hidden"
											/>
											<label
												htmlFor={pdfInputId}
												onClick={triggerPdfInput}
												className="w-full rounded-lg border-2 border-dashed border-input p-6 flex flex-col items-center justify-center gap-2 hover:border-brand-purple hover:bg-muted/50 transition-colors cursor-pointer"
											>
												<Upload className="h-8 w-8 text-muted-foreground" />
												<span className="text-sm text-muted-foreground">
													Click to upload PDF (max 16MB)
												</span>
											</label>
										</div>
									)}
								</div>

								{/* Subject */}
								<div className="space-y-2">
									<Label>
										Subject <span className="text-red-500">*</span>
									</Label>
									<Select
										value={editingPastPaper.subject}
										onValueChange={(value) =>
											setEditingPastPaper({ ...editingPastPaper, subject: value })
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select subject" />
										</SelectTrigger>
										<SelectContent>
											{SUBJECTS.map((subj) => (
												<SelectItem key={subj} value={subj}>
													{subj}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								{/* Paper Type & Year */}
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label>
											Paper <span className="text-red-500">*</span>
										</Label>
										<Select
											value={editingPastPaper.paper}
											onValueChange={(value) =>
												setEditingPastPaper({ ...editingPastPaper, paper: value })
											}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select paper" />
											</SelectTrigger>
											<SelectContent>
												{PAPER_TYPES.map((p) => (
													<SelectItem key={p} value={p}>
														{p}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>

									<div className="space-y-2">
										<Label>
											Year <span className="text-red-500">*</span>
										</Label>
										<Select
											value={editingPastPaper.year.toString()}
											onValueChange={(value) =>
												setEditingPastPaper({
													...editingPastPaper,
													year: Number.parseInt(value, 10),
												})
											}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select year" />
											</SelectTrigger>
											<SelectContent>
												{YEARS.map((year) => (
													<SelectItem key={year} value={year.toString()}>
														{year}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								</div>

								{/* Month */}
								<div className="space-y-2">
									<Label>
										Month <span className="text-red-500">*</span>
									</Label>
									<Select
										value={editingPastPaper.month}
										onValueChange={(value) =>
											setEditingPastPaper({ ...editingPastPaper, month: value })
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select month" />
										</SelectTrigger>
										<SelectContent>
											{MONTHS.map((month) => (
												<SelectItem key={month} value={month}>
													{month}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								{/* Total Marks */}
								<div className="space-y-2">
									<Label>Total Marks</Label>
									<Input
										type="number"
										min={1}
										max={500}
										value={editingPastPaper.totalMarks}
										onChange={(e) =>
											setEditingPastPaper({
												...editingPastPaper,
												totalMarks: Number.parseInt(e.target.value, 10) || 150,
											})
										}
										placeholder="e.g., 150"
									/>
								</div>

								{/* Instructions */}
								<div className="space-y-2">
									<Label>Instructions</Label>
									<Textarea
										value={editingPastPaper.instructions || ''}
										onChange={(e) =>
											setEditingPastPaper({ ...editingPastPaper, instructions: e.target.value })
										}
										placeholder="Exam instructions..."
										rows={2}
									/>
								</div>
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
							onClick={handleSavePastPaper}
							disabled={pdfUploading}
							className="flex-1 bg-brand-purple hover:bg-brand-purple/90 text-sm dark:text-white/90 disabled:opacity-50"
						>
							{pdfUploading ? 'Uploading...' : editingPastPaper?.id ? 'Update Paper' : 'Add Paper'}
						</Button>
					</DrawerFooter>
				</DrawerContent>
			</Drawer>
		</div>
	);
}
