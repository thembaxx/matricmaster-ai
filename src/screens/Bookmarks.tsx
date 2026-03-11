'use client';

import {
	Activity01Icon as ActivityIcon,
	Bookmark01Icon as Bookmark,
	Calculator01Icon as Calculator,
	Lightning01Icon as Lightning,
	MicroscopeIcon as Microscope,
	PlusSignIcon as Plus,
	ZapIcon as TrendUp,
	Loading03Icon as CircleNotch,
} from 'hugeicons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSession } from '@/lib/auth-client';
import { deleteBookmarkAction, getBookmarksAction } from '@/lib/db/bookmark-actions';
import type { Bookmark as BookmarkType } from '@/lib/db/schema';

// Icon mapping based on bookmark type
const getIconForType = (type: string) => {
	switch (type) {
		case 'math':
		case 'question':
			return Calculator;
		case 'physics':
		case 'past_paper':
			return Lightning;
		case 'life_sciences':
		case 'study_note':
			return Microscope;
		default:
			return TrendUp;
	}
};

const getColorForSubject = (subject: string) => {
	const lower = subject.toLowerCase();
	if (lower.includes('math')) return { color: 'text-blue-500', bg: 'bg-blue-100' };
	if (lower.includes('physics')) return { color: 'text-purple-500', bg: 'bg-purple-100' };
	if (lower.includes('life') || lower.includes('bio'))
		return { color: 'text-green-500', bg: 'bg-green-100' };
	return { color: 'text-orange-500', bg: 'bg-orange-100' };
};

export default function Bookmarks() {
	const router = useRouter();
	const { data: session, isPending } = useSession();
	const [activeTab, setActiveTab] = useState('all');
	const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	// Load bookmarks on mount
	useEffect(() => {
		const loadBookmarks = async () => {
			if (session?.user?.id) {
				setIsLoading(true);
				const data = await getBookmarksAction();
				setBookmarks(data);
				setIsLoading(false);
			} else {
				setIsLoading(false);
			}
		};
		if (!isPending) {
			loadBookmarks();
		}
	}, [session?.user?.id, isPending]);

	const handleDelete = async (e: React.MouseEvent, bookmarkId: string) => {
		e.stopPropagation();
		if (!session?.user?.id) return;

		const result = await deleteBookmarkAction(bookmarkId);
		if (result.success) {
			setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));
			toast.success('Bookmark removed');
		} else {
			toast.error('Failed to remove bookmark');
		}
	};

	const filteredBookmarks =
		activeTab === 'all'
			? bookmarks
			: bookmarks.filter((b) => b.bookmarkType.toLowerCase().includes(activeTab.toLowerCase()));

	// Show placeholder when not logged in
	if (!session) {
		return (
			<div className="flex flex-col h-full bg-background">
				<header className="px-6 pt-12 pb-2 bg-card shrink-0">
					<h1 className="text-3xl font-bold mb-1">Bookmarks</h1>
					<p className="text-sm text-muted-foreground mb-6">Your saved revision questions</p>
				</header>
				<ScrollArea className="flex-1">
					<main className="px-6 py-6 pb-40">
						<div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
							<div className="w-32 h-32 bg-muted rounded-[2.5rem] flex items-center justify-center">
								<Bookmark className="w-16 h-16 text-muted-foreground" />
							</div>
							<div className="space-y-2">
								<h3 className="text-xl font-bold">Sign in to view bookmarks</h3>
								<p className="text-sm text-muted-foreground max-w-60 mx-auto">
									FloppyDisk difficult questions or important concepts to review them later.
								</p>
							</div>
							<Button onClick={() => router.push('/sign-in')} className="rounded-full px-8">
								Sign In
							</Button>
						</div>
					</main>
				</ScrollArea>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full bg-white dark:bg-zinc-950 pb-40 overflow-x-hidden lg:px-12">
			{/* Header */}
			<header className="px-6 sm:px-10 pt-20 sm:pt-32 pb-12 shrink-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-3xl sticky top-0 z-30 border-none lg:px-0 space-y-12">
				<div className="space-y-3">
					<h1 className="text-5xl sm:text-7xl lg:text-9xl font-black text-foreground tracking-tighter leading-none">
						Library
					</h1>
					<p className="text-muted-foreground/40 font-black text-sm sm:text-lg uppercase tracking-[0.3em] leading-none">
						Your Curated Knowledge
					</p>
				</div>

				<Tabs defaultValue="all" className="w-full">
					<TabsList className="h-16 p-1.5 bg-muted/10 rounded-2xl border-none shadow-inner flex gap-2 max-w-2xl">
						{[
							{ id: 'all', label: 'All Items' },
							{ id: 'question', label: 'Questions' },
							{ id: 'past_paper', label: 'Vault' },
							{ id: 'study_note', label: 'Notes' },
						].map((tab) => (
							<TabsTrigger
								key={tab.id}
								value={tab.id}
								onClick={() => setActiveTab(tab.id)}
								className="flex-1 h-full rounded-xl font-black text-[10px] uppercase tracking-[0.2em] data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-500"
							>
								{tab.label}
							</TabsTrigger>
						))}
					</TabsList>
				</Tabs>
			</header>

			<ScrollArea className="flex-1 no-scrollbar px-6 sm:px-10 lg:px-0">
				<main className="max-w-7xl mx-auto w-full pb-64">
					{isLoading ? (
						<div className="flex items-center justify-center py-40">
							<CircleNotch size={64} className="animate-spin text-primary opacity-20" />
						</div>
					) : filteredBookmarks.length > 0 ? (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
							{filteredBookmarks.map((bookmark) => {
								const Icon = getIconForType(bookmark.bookmarkType);
								const colors = getColorForSubject(bookmark.bookmarkType);
								return (
									<m.div
										key={bookmark.id}
										whileHover={{ y: -8 }}
										className="relative group"
									>
										<Card
											className="p-10 rounded-[3.5rem] border-none bg-card shadow-[0_15px_45px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_70px_rgba(0,0,0,0.1)] transition-all duration-700 cursor-pointer flex flex-col gap-8 h-80 overflow-hidden"
											onClick={() =>
												router.push(
													`/${bookmark.bookmarkType === 'past_paper' ? 'past-paper' : 'quiz'}?id=${bookmark.referenceId}`
												)
											}
										>
											<div className="flex justify-between items-start relative z-10">
												<div
													className={cn("w-16 h-16 rounded-[1.25rem] flex items-center justify-center shadow-lg", colors.bg)}
												>
													<Icon size={32} className={cn("stroke-[3px]", colors.color)} />
												</div>
												<button
													type="button"
													onClick={(e) => handleDelete(e, bookmark.id)}
													className="h-12 w-12 rounded-xl bg-muted/10 text-muted-foreground/40 hover:bg-tiimo-pink hover:text-white transition-all flex items-center justify-center active:scale-90"
													aria-label="Remove"
												>
													<X size={20} className="stroke-[3px]" />
												</button>
											</div>

											{/* Content Preview */}
											<div className="flex-1 bg-muted/5 rounded-3xl border-none flex items-center justify-center p-6 text-center relative overflow-hidden group-hover:bg-muted/10 transition-colors">
												{bookmark.note ? (
													<p className="text-md font-bold text-muted-foreground leading-relaxed line-clamp-3">
														"{bookmark.note}"
													</p>
												) : (
													<ActivityIcon size={48} className="text-muted-foreground/10 stroke-[2.5px]" />
												)}
											</div>

											<div className="space-y-1">
												<p className={cn("text-[10px] font-black uppercase tracking-[0.2em]", colors.color)}>
													{bookmark.bookmarkType}
												</p>
												<h3 className="text-xl font-black text-foreground truncate tracking-tight">
													{bookmark.referenceId}
												</h3>
											</div>
										</Card>
									</m.div>
								);
							})}
						</div>
					) : (
						<div className="py-40 flex flex-col items-center justify-center text-center space-y-12">
							<div className="w-32 h-32 bg-muted/10 rounded-[3rem] flex items-center justify-center mx-auto">
								<Bookmark size={48} className="text-muted-foreground/20 stroke-[3px]" />
							</div>
							<div className="space-y-4">
								<h3 className="text-4xl font-black text-foreground tracking-tighter">Vault Empty</h3>
								<p className="text-lg font-bold text-muted-foreground/40 max-w-sm mx-auto leading-relaxed">
									Pin important sessions or difficult concepts to review them later.
								</p>
							</div>
							<Button
								onClick={() => router.push('/quiz')}
								className="h-16 px-10 bg-primary hover:bg-primary/90 text-white font-black text-lg rounded-2xl shadow-xl shadow-primary/30"
							>
								<Plus size={24} className="mr-3 stroke-[3px]" />
								Find Content
							</Button>
						</div>
					)}
				</main>
			</ScrollArea>
		</div>
	);
}
