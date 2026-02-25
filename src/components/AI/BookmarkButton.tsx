'use client';

import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface BookmarkButtonProps {
	messageId: string;
	content: string;
	role: 'user' | 'assistant';
	subject?: string | null;
}

interface BookmarkedMessage {
	id: string;
	messageId: string;
	content: string;
	role: 'user' | 'assistant';
	subject?: string;
	savedAt: Date;
}

const STORAGE_KEY = 'ai-tutor-bookmarks';

function getBookmarks(): BookmarkedMessage[] {
	if (typeof window === 'undefined') return [];
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		return stored ? JSON.parse(stored) : [];
	} catch {
		return [];
	}
}

function saveBookmarks(bookmarks: BookmarkedMessage[]) {
	if (typeof window === 'undefined') return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
	} catch (error) {
		console.error('Failed to save bookmarks:', error);
	}
}

export function BookmarkButton({ messageId, content, role, subject }: BookmarkButtonProps) {
	const [bookmarks, setBookmarks] = useState<BookmarkedMessage[]>(getBookmarks);

	const isBookmarked = bookmarks.some((b) => b.messageId === messageId);

	const handleToggle = () => {
		if (isBookmarked) {
			const newBookmarks = bookmarks.filter((b) => b.messageId !== messageId);
			setBookmarks(newBookmarks);
			saveBookmarks(newBookmarks);
			toast.success('Bookmark removed');
		} else {
			const newBookmark: BookmarkedMessage = {
				id: `bookmark-${Date.now()}`,
				messageId,
				content,
				role,
				subject: subject || undefined,
				savedAt: new Date(),
			};
			const newBookmarks = [...bookmarks, newBookmark];
			setBookmarks(newBookmarks);
			saveBookmarks(newBookmarks);
			toast.success('Message bookmarked');
		}
	};

	return (
		<Button
			variant="ghost"
			size="icon"
			className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
			onClick={handleToggle}
			aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
			aria-pressed={isBookmarked}
		>
			{isBookmarked ? (
				<BookmarkCheck className="h-4 w-4 text-primary" />
			) : (
				<Bookmark className="h-4 w-4" />
			)}
		</Button>
	);
}

export function getBookmarkedMessages(): BookmarkedMessage[] {
	return getBookmarks();
}

export function clearAllBookmarks() {
	if (typeof window === 'undefined') return;
	localStorage.removeItem(STORAGE_KEY);
}

export type { BookmarkedMessage };
