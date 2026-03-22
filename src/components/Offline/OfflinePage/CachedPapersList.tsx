'use client';

import { Delete02Icon, File01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type CachedPaper, formatBytes } from '@/lib/offline/offline-cache';

interface CachedPapersListProps {
	papers: CachedPaper[];
	onDelete: (paperId: string) => void;
}

export function CachedPapersList({ papers, onDelete }: CachedPapersListProps) {
	if (papers.length === 0) return null;

	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="flex items-center gap-2 text-base">
					<HugeiconsIcon icon={File01Icon} className="w-5 h-5 text-brand-green" />
					Saved Past Papers ({papers.length})
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-2">
				{papers.map((paper) => (
					<div
						key={paper.id}
						className="flex items-center justify-between p-3 rounded-xl bg-muted/30"
					>
						<div>
							<div className="font-medium text-sm">
								{paper.subject} {paper.paper}
							</div>
							<div className="text-xs text-muted-foreground">
								{paper.month} {paper.year} • {formatBytes(paper.size)}
							</div>
						</div>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => onDelete(paper.id)}
							className="text-red-500 hover:text-red-600 hover:bg-red-50"
						>
							<HugeiconsIcon icon={Delete02Icon} className="w-4 h-4" />
						</Button>
					</div>
				))}
			</CardContent>
		</Card>
	);
}
