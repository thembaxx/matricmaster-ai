'use client';

import {
	BulbIcon,
	Cancel01Icon as CloseIcon,
	ArrowUp01Icon as TrendingUpIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import type { StudyRecommendation, CurriculumSubject as Subject } from '@/lib/content-adapter';

interface AIRecommendationsProps {
	recommendations: StudyRecommendation[];
	subjects: Subject[];
	onDismiss: () => void;
	onSelect: (subjectId: string, topicId: string) => void;
}

export function AIRecommendations({
	recommendations,
	subjects,
	onDismiss,
	onSelect,
}: AIRecommendationsProps) {
	return (
		<div className="bg-gradient-to-r from-success/10 to-primary/10 rounded-2xl p-4 mb-3">
			<div className="flex items-center justify-between mb-3">
				<div className="flex items-center gap-2">
					<HugeiconsIcon icon={BulbIcon} className="w-5 h-5 text-warning" />
					<span className="font-bold text-sm">AI Recommendations</span>
				</div>
				<button
					type="button"
					onClick={onDismiss}
					className="text-muted-foreground hover:text-foreground"
				>
					<HugeiconsIcon icon={CloseIcon} className="w-4 h-4" />
				</button>
			</div>
			<div className="space-y-2">
				{recommendations.slice(0, 3).map((rec) => {
					const subject = subjects.find((s) => s.id === rec.subjectId);
					const topic = subject?.topics.find((t) => t.id === rec.topicId);
					if (!subject || !topic) return null;
					return (
						<button
							key={rec.topicId}
							type="button"
							onClick={() => onSelect(rec.subjectId, rec.topicId)}
							className="w-full flex items-center gap-3 p-3 bg-white dark:bg-zinc-900 rounded-xl text-left hover:shadow-md transition-shadow"
						>
							<span className="text-xl">{subject.icon}</span>
							<div className="flex-1 min-w-0">
								<p className="font-bold text-sm truncate">{topic.name}</p>
								<p className="text-[10px] text-muted-foreground">{rec.reason}</p>
							</div>
							<HugeiconsIcon icon={TrendingUpIcon} className="w-4 h-4 text-success" />
						</button>
					);
				})}
			</div>
		</div>
	);
}
