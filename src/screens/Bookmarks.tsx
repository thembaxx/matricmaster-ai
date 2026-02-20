'use client';

import { Activity, Bookmark, Calculator, Microscope, Plus, TrendingUp, Zap } from 'lucide-react';
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
			return Zap;
		case 'life_sciences':
		case 'study_note':
			return Microscope;
		default:
			return TrendingUp;
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
	const { data: session } = useSession();
	const [activeTab, setActiveTab] = useState('all');
	const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	// Load bookmarks on mount
	useEffect(() => {
		const loadBookmarks = async () => {
			if (session?.user?.id) {
				setIsLoading(true);
				const data = await getBookmarksAction(session.user.id);
				setBookmarks(data);
				setIsLoading(false);
			} else {
				setIsLoading(false);
			}
		};
		loadBookmarks();
	}, [session?.user?.id]);

	const handleDelete = async (e: React.MouseEvent, bookmarkId: string) => {
		e.stopPropagation();
		if (!session?.user?.id) return;

		const result = await deleteBookmarkAction(bookmarkId, session.user.id);
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
								<p className="text-sm text-muted-foreground max-w-[240px] mx-auto">
									Save difficult questions or important concepts to review them later.
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
		<div className="flex flex-col h-full bg-background">
			{/* Header */}
			<header className="px-6 pt-12 pb-2 bg-card shrink-0">
				<h1 className="text-3xl font-bold mb-1">Bookmarks</h1>
				<p className="text-sm text-muted-foreground mb-6">Your saved revision questions</p>

				<Tabs defaultValue="all" className="w-full">
					<TabsList className="w-full justify-start gap-2 bg-transparent p-0 h-auto overflow-x-auto no-scrollbar">
						{[
							{ id: 'all', label: 'All' },
							{ id: 'question', label: 'Questions' },
							{ id: 'past_paper', label: 'Papers' },
							{ id: 'study_note', label: 'Notes' },
						].map((tab) => (
							<TabsTrigger
								key={tab.id}
								value={tab.id}
								onClick={() => setActiveTab(tab.id)}
								className="rounded-full border px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
							>
								{tab.label}
							</TabsTrigger>
						))}
					</TabsList>
				</Tabs>
			</header>

			<ScrollArea className="flex-1">
				<main className="px-6 py-6 pb-40">
					{isLoading ? (
						<div className="flex items-center justify-center py-24">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
						</div>
					) : filteredBookmarks.length > 0 ? (
						<div className="grid grid-cols-2 gap-4">
							{filteredBookmarks.map((bookmark) => {
								const Icon = getIconForType(bookmark.bookmarkType);
								const colors = getColorForSubject(bookmark.bookmarkType);
								return (
									<Card
										key={bookmark.id}
										className="p-5 hover:shadow-lg transition-all cursor-pointer rounded-[2.5rem] border bg-card shadow-sm flex flex-col h-64 relative group"
										onClick={() =>
											router.push(
												`/${bookmark.bookmarkType === 'past_paper' ? 'past-paper' : 'quiz'}?id=${bookmark.referenceId}`
											)
										}
									>
										<button
											type="button"
											onClick={(e) => handleDelete(e, bookmark.id)}
											className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive hover:text-destructive-foreground rounded-full"
											title="Remove bookmark"
										>
											<Bookmark className="w-4 h-4 fill-current" />
										</button>
										<div className="flex justify-between items-start mb-4">
											<div
												className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center`}
											>
												<Icon className={`w-5 h-5 ${colors.color}`} />
											</div>
											<Bookmark className={`w-5 h-5 ${colors.color} fill-current`} />
										</div>

										{/* Content Preview */}
										<div className="flex-1 bg-muted/50 border border-dashed border-border rounded-xl mb-4 flex items-center justify-center p-2">
											{bookmark.note ? (
												<span className="text-sm text-muted-foreground line-clamp-3">
													{bookmark.note}
												</span>
											) : (
												<div className="text-muted-foreground/50">
													<Activity className="w-8 h-8" />
												</div>
											)}
										</div>

										<div>
											<p
												className={`text-[10px] font-bold mb-1 uppercase tracking-wide ${colors.color}`}
											>
												{bookmark.bookmarkType}
											</p>
											<h3 className="text-sm font-bold leading-tight mb-1">
												{bookmark.referenceId}
											</h3>
											<p className="text-[10px] text-muted-foreground">
												{bookmark.createdAt
													? new Date(bookmark.createdAt).toLocaleDateString()
													: 'Unknown'}
											</p>
										</div>
									</Card>
								);
							})}
						</div>
					) : (
						<div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
							<div className="w-32 h-32 bg-muted rounded-[2.5rem] flex items-center justify-center">
								<Bookmark className="w-16 h-16 text-muted-foreground" />
							</div>
							<div className="space-y-2">
								<h3 className="text-xl font-bold">Nothing saved yet</h3>
								<p className="text-sm text-muted-foreground max-w-[240px] mx-auto">
									Save difficult questions or important concepts to review them later.
								</p>
							</div>
							<Button onClick={() => router.push('/quiz')} className="rounded-full px-8">
								<Plus className="w-4 h-4 mr-2" />
								Browse Questions
							</Button>
						</div>
					)}
				</main>
			</ScrollArea>
		</div>
	);
}
