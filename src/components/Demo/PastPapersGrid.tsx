'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataSection } from '@/components/ui/data-loader';

interface PastPaper {
	paperId: string;
	subject: string;
	paper: string;
	month: string;
	year: number;
	totalMarks: number | null;
}

interface PastPapersGridProps {
	papers: PastPaper[];
}

export function PastPapersGrid({ papers }: PastPapersGridProps) {
	return (
		<DataSection title="Past Papers" description="NSC exam papers by subject">
			<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
				{papers.slice(0, 6).map((paper) => (
					<Card
						key={paper.paperId}
						className="hover:shadow-lg transition-all duration-200 hover:border-primary/30"
					>
						<CardHeader className="pb-2">
							<CardTitle className="text-base">{paper.subject}</CardTitle>
							<CardDescription>
								{paper.paper} - {paper.month} {paper.year}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="flex items-center justify-between">
								<Badge variant="outline">{paper.totalMarks} marks</Badge>
								<Button size="sm" variant="ghost">
									View Paper
								</Button>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</DataSection>
	);
}
