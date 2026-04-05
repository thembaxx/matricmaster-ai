'use client';

import { Add01Icon, DatabaseIcon, Upload01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { FilterBar } from '@/components/CMS/FilterBar';
import { PaperManager } from '@/components/CMS/PaperManager';
import { PdfUploadDrawer } from '@/components/CMS/PdfUploadDrawer';
import { QuestionManager } from '@/components/CMS/QuestionManager';
import { UserManager } from '@/components/CMS/UserManager';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSubjectMap } from '@/hooks/use-cms-filters';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';
import {
	getPastPapersAction,
	getQuestionsAction,
	getSubjectsAction,
	getUsersAction,
	seedDatabaseAction,
} from '@/lib/db/actions';
import type { User } from '@/lib/db/better-auth-schema';
import type { PastPaper, Question, Subject } from '@/lib/db/schema';

export default function CMS() {
	const [subjects, setSubjects] = useState<Subject[]>([]);
	const [questions, setQuestions] = useState<Question[]>([]);
	const [users, setUsers] = useState<User[]>([]);
	const [allPastPapers, setAllPastPapers] = useState<PastPaper[]>([]);
	const [seeding, setSeeding] = useState(false);
	const [activeTab, setActiveTab] = useState('questions');
	const [isPdfDrawerOpen, setIsPdfDrawerOpen] = useState(false);
	const [createQuestionTrigger, setCreateQuestionTrigger] = useState(0);

	const [searchQuery, setSearchQuery] = useState('');
	const [selectedSubject, setSelectedSubject] = useState('all');
	const [selectedDifficulty, setSelectedDifficulty] = useState('all');
	const [userSearchQuery, setUserSearchQuery] = useState('');
	const [userFilter, setUserFilter] = useState<'all' | 'active' | 'blocked' | 'deleted'>('all');

	const debouncedSearch = useDebouncedCallback((value: string) => {
		setSearchQuery(value);
	}, 300);

	const debouncedUserSearch = useDebouncedCallback((value: string) => {
		setUserSearchQuery(value);
	}, 300);

	const subjectMap = useSubjectMap(subjects);

	const queryClient = useQueryClient();

	const { isLoading } = useQuery({
		queryKey: ['cms-data'],
		queryFn: async () => {
			const [subjectsData, questionsData, usersData, pastPapersData] = await Promise.all([
				getSubjectsAction(),
				getQuestionsAction({}),
				getUsersAction({}),
				getPastPapersAction(),
			]);
			setSubjects(subjectsData);
			setQuestions(questionsData.questions);
			setUsers(usersData.users);
			setAllPastPapers(pastPapersData.papers);
			return { subjectsData, questionsData, usersData, pastPapersData };
		},
	});

	const refetchData = useCallback(async () => {
		await queryClient.refetchQueries({ queryKey: ['cms-data'] });
	}, [queryClient]);

	const handleSeedDatabase = async () => {
		if (!confirm('This will seed the database with sample data. Continue?')) return;

		try {
			setSeeding(true);
			const result = await seedDatabaseAction();
			if (result.success) {
				toast.success(result.message);
				await refetchData();
			} else {
				toast.error(`Seeding failed: ${result.message}`);
			}
		} catch (error) {
			console.debug('Seeding error:', error);
			toast.error('An error occurred while seeding.');
		} finally {
			setSeeding(false);
		}
	};

	const filteredQuestions = useMemo(() => {
		const query = searchQuery.toLowerCase();
		const subjectIdFilter = selectedSubject !== 'all' ? Number.parseInt(selectedSubject, 10) : null;

		return questions.filter((q) => {
			const matchesSearch =
				q.questionText.toLowerCase().includes(query) || q.topic.toLowerCase().includes(query);
			const matchesSubject = subjectIdFilter === null || q.subjectId === subjectIdFilter;
			const matchesDifficulty = selectedDifficulty === 'all' || q.difficulty === selectedDifficulty;
			return matchesSearch && matchesSubject && matchesDifficulty;
		});
	}, [questions, searchQuery, selectedSubject, selectedDifficulty]);

	const filteredUsers = useMemo(() => {
		const query = userSearchQuery.toLowerCase();

		return users.filter((u) => {
			const matchesSearch =
				u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query);

			if (userFilter === 'active') return matchesSearch && !u.isBlocked && !u.deletedAt;
			if (userFilter === 'blocked') return matchesSearch && u.isBlocked;
			if (userFilter === 'deleted') return matchesSearch && !!u.deletedAt;

			return matchesSearch;
		});
	}, [users, userSearchQuery, userFilter]);

	return (
		<div className="flex-1 flex flex-col bg-background overflow-hidden pb-32">
			<PdfUploadDrawer
				isOpen={isPdfDrawerOpen}
				onClose={() => setIsPdfDrawerOpen(false)}
				subjects={subjects}
				onSuccess={refetchData}
			/>

			<header className="px-4 sm:px-8 pt-6 sm:pt-8 pb-6 bg-background shrink-0 space-y-6 sm:space-y-8">
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
					<div className="space-y-1">
						<h1 className="text-3xl font-black text-foreground tracking-tighter">
							content management
						</h1>
						<p className="text-muted-foreground font-bold text-sm">
							Manage questions, papers, and users
						</p>
					</div>

					<div className="flex items-center gap-3">
						<Button
							onClick={handleSeedDatabase}
							disabled={seeding}
							variant="outline"
							className="rounded-2xl border-2 font-black text-xs tracking-widest px-6"
						>
							<HugeiconsIcon icon={DatabaseIcon} className="h-4 w-4 mr-2" />
							{seeding ? 'seeding...' : 'seed db'}
						</Button>
						{activeTab === 'past-papers' && (
							<Button
								onClick={() => setIsPdfDrawerOpen(true)}
								className="rounded-2xl h-12 px-6 bg-primary hover:bg-primary/90 shadow-soft-lg shadow-primary/20 font-black text-sm tracking-widest"
							>
								<HugeiconsIcon icon={Upload01Icon} className="h-5 w-5 mr-2" />
								upload pdf
							</Button>
						)}
						{activeTab === 'questions' && (
							<Button
								onClick={() => setCreateQuestionTrigger((n) => n + 1)}
								className="rounded-2xl h-12 px-6 bg-primary hover:bg-primary/90 shadow-soft-lg shadow-primary/20 font-black text-sm tracking-widest"
							>
								<HugeiconsIcon icon={Add01Icon} className="h-5 w-5 mr-2" />
								create new
							</Button>
						)}
					</div>
				</div>

				<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
					<TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-14 bg-muted/50 p-1 rounded-2xl">
						<TabsTrigger
							value="questions"
							className="rounded-xl font-black text-xs tracking-widest"
						>
							questions
						</TabsTrigger>
						<TabsTrigger
							value="past-papers"
							className="rounded-xl font-black text-xs tracking-widest"
						>
							past papers
						</TabsTrigger>
						<TabsTrigger value="subjects" className="rounded-xl font-black text-xs tracking-widest">
							subjects
						</TabsTrigger>
						<TabsTrigger value="users" className="rounded-xl font-black text-xs tracking-widest">
							users
						</TabsTrigger>
					</TabsList>
				</Tabs>

				<FilterBar
					activeTab={activeTab}
					searchQuery={activeTab === 'users' ? userSearchQuery : searchQuery}
					onSearchChange={activeTab === 'users' ? debouncedUserSearch : debouncedSearch}
					selectedSubject={selectedSubject}
					onSubjectChange={setSelectedSubject}
					selectedDifficulty={selectedDifficulty}
					onDifficultyChange={setSelectedDifficulty}
					userFilter={userFilter}
					onUserFilterChange={setUserFilter}
					subjects={subjects}
				/>
			</header>

			<main className="flex-1 overflow-hidden px-4 sm:px-8">
				<div className="h-full no-scrollbar overflow-y-auto">
					{isLoading ? (
						<div className="flex items-center justify-center py-40">
							<div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
						</div>
					) : (
						<div className="pb-12">
							{activeTab === 'questions' && (
								<QuestionManager
									questions={filteredQuestions}
									subjects={subjects}
									subjectMap={subjectMap}
									onRefresh={refetchData}
									openCreateTrigger={createQuestionTrigger}
								/>
							)}

							{activeTab === 'users' && <UserManager users={filteredUsers} />}

							{activeTab === 'past-papers' && <PaperManager papers={allPastPapers} />}

							{activeTab === 'subjects' && (
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
									{subjects.map((s: Subject) => (
										<Card
											key={s.id}
											className="rounded-[2.5rem] border-2 border-border/50 p-8 space-y-4"
										>
											<div className="flex items-center justify-between">
												<h3 className="text-2xl font-black text-foreground tracking-tighter">
													{s.name.toLowerCase()}
												</h3>
												<Badge
													className={`rounded-lg tracking-widest text-[9px] font-black ${s.isActive ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'}`}
												>
													{s.isActive ? 'active' : 'inactive'}
												</Badge>
											</div>
											<p className="text-sm font-bold text-muted-foreground line-clamp-2">
												{s.description}
											</p>
											<div className="pt-4 border-t border-border/50">
												<p className="text-[10px] font-black text-muted-foreground tracking-widest">
													curriculum code
												</p>
												<p className="text-sm font-black text-foreground">
													{s.curriculumCode.toLowerCase()}
												</p>
											</div>
										</Card>
									))}
								</div>
							)}
						</div>
					)}
				</div>
			</main>
		</div>
	);
}
