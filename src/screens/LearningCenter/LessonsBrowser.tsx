'use client';

import { Chemistry01Icon, LayoutLeftIcon, TranslateIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useEffect, useState } from 'react';
import { LessonCard } from '@/components/Lessons/LessonCard';
import { LessonDetailModal } from '@/components/Lessons/LessonDetailModal';
import { Button } from '@/components/ui/button';
import { useLessonCache } from '@/hooks/useLessonCache';
import type { Lesson } from '@/hooks/useLessons';

interface LessonsBrowserProps {
	activeCategory: string;
	setActiveCategory: (id: string) => void;
	filteredLessons: any[];
	loading: boolean;
}

export default function LessonsBrowser({
	activeCategory,
	setActiveCategory,
	filteredLessons,
	loading,
}: LessonsBrowserProps) {
	const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
	const [modalOpen, setModalOpen] = useState(false);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [offlineReady, setOfflineReady] = useState(false);

	// Offline caching
	const { isOfflineReady } = useLessonCache(filteredLessons);

	// Check offline readiness
	useEffect(() => {
		isOfflineReady().then(setOfflineReady);
	}, [isOfflineReady]);

	const handleLessonClick = (lesson: Lesson, index: number) => {
		setSelectedLesson(lesson);
		setCurrentIndex(index);
		setModalOpen(true);
	};

	const handleModalNavigate = (lesson: Lesson, index: number) => {
		setSelectedLesson(lesson);
		setCurrentIndex(index);
	};

	if (loading) {
		return (
			<div className="flex flex-col h-full items-center justify-center bg-background py-12">
				<div className="animate-pulse flex flex-col items-center">
					<div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
						<HugeiconsIcon icon={LayoutLeftIcon} className="w-6 h-6 text-primary" />
					</div>
					<p className="text-muted-foreground text-sm">loading lessons...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			{/* Offline indicator */}
			{offlineReady && (
				<div className="fixed bottom-24 right-4 z-50">
					<div className="bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
						<span className="w-2 h-2 bg-white rounded-full animate-pulse" />
						offline ready
					</div>
				</div>
			)}

			{/* Category selector */}
			<nav
				className="flex gap-2 sm:gap-3 overflow-x-auto no-scrollbar"
				aria-label="Lesson categories"
			>
				{[
					{ id: 'all', name: 'all subjects', icon: LayoutLeftIcon },
					{ id: 'mathematics', name: 'mathematics', icon: LayoutLeftIcon },
					{ id: 'physical_sciences', name: 'physical sciences', icon: Chemistry01Icon },
					{ id: 'life_sciences', name: 'life sciences', icon: LayoutLeftIcon },
					{ id: 'languages', name: 'languages', icon: TranslateIcon },
				].map((cat) => (
					<Button
						key={cat.id}
						type="button"
						variant="ghost"
						onClick={() => setActiveCategory(cat.id)}
						aria-pressed={activeCategory === cat.id ? 'true' : 'false'}
						className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all border shadow-sm ${
							activeCategory === cat.id
								? 'bg-foreground text-background border-foreground shadow-lg'
								: 'bg-card text-muted-foreground border-border hover:text-foreground'
						}`}
					>
						<HugeiconsIcon
							icon={cat.icon}
							className={`w-4 h-4 ${activeCategory === cat.id ? 'text-primary' : 'text-muted-foreground'}`}
						/>
						{cat.name}
					</Button>
				))}
			</nav>

			<div className="relative">
				{/* Vertical Line for the "path" feel */}
				<div className="absolute left-9.5 top-0 bottom-0 w-0.5 border-l-2 border-dashed border-border/50 z-0" />
				<div className="space-y-6 relative z-10">
					{filteredLessons.length === 0 ? (
						<div className="text-center py-12">
							<p className="text-muted-foreground">No lessons found for this category</p>
						</div>
					) : (
						filteredLessons.map((lesson, index) => (
							<LessonCard
								key={lesson.id}
								lesson={lesson}
								onClick={() => handleLessonClick(lesson, index)}
							/>
						))
					)}
				</div>
			</div>

			<LessonDetailModal
				lesson={selectedLesson}
				open={modalOpen}
				onOpenChange={setModalOpen}
				allLessons={filteredLessons}
				currentIndex={currentIndex}
				onNavigate={handleModalNavigate}
			/>
		</div>
	);
}
