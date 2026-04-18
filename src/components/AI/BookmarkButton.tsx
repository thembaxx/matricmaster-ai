'use client';

import { Bookmark01Icon, BookmarkIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { DURATION, EASING } from '@/lib/animation-presets';

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
	} catch (error) {
		console.warn('Failed to get bookmarks:', error);
		return [];
	}
}

function saveBookmarks(bookmarks: BookmarkedMessage[]) {
	if (typeof window === 'undefined') return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
	} catch (error) {
		console.debug('Failed to save bookmarks:', error);
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
			className="h-9 w-9 md:h-7 md:w-7 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity touch-manipulation"
			onClick={handleToggle}
			aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
			aria-pressed={isBookmarked}
		>
			<m.div
				animate={isBookmarked ? { scale: [1, 1.3, 1] } : { scale: [1, 0.8, 1] }}
				transition={{ duration: DURATION.normal, ease: EASING.easeOut }}
			>
				{isBookmarked ? (
					<HugeiconsIcon icon={Bookmark01Icon} className="h-4 w-4 text-primary" />
				) : (
					<HugeiconsIcon icon={BookmarkIcon} className="h-4 w-4" />
				)}
			</m.div>
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
