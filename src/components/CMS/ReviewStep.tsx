'use client';

import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ExtractedPaper } from '@/services/pdfExtractor';
import { ExtractedQuestionCard } from './ExtractedQuestionCard';

interface ReviewStepProps {
	extractedData: ExtractedPaper;
	handleUpdateExtractedQuestion: (idx: number, field: any, value: any) => void;
	handleUpdateExtractedOption: (
		qIdx: number,
		optIdx: number,
		field: any,
		value: any,
		sqIdx?: number
	) => void;
	handleUpdateSubQuestion: (qIdx: number, sqIdx: number, field: any, value: any) => void;
}

export function ReviewStep({
	extractedData,
	handleUpdateExtractedQuestion,
	handleUpdateExtractedOption,
	handleUpdateSubQuestion,
}: ReviewStepProps) {
	return (
		<ScrollArea className="h-full px-8 py-6">
			<div className="space-y-8">
				<div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 rounded-3xl bg-muted/30 border-2">
					<div>
						<p className="text-[10px] font-black  text-muted-foreground tracking-widest mb-1">
							Subject
						</p>
						<p className="font-bold">{extractedData.subject}</p>
					</div>
					<div>
						<p className="text-[10px] font-black  text-muted-foreground tracking-widest mb-1">
							Paper
						</p>
						<p className="font-bold">{extractedData.paper}</p>
					</div>
					<div>
						<p className="text-[10px] font-black  text-muted-foreground tracking-widest mb-1">
							Year
						</p>
						<p className="font-bold">{extractedData.year}</p>
					</div>
					<div>
						<p className="text-[10px] font-black  text-muted-foreground tracking-widest mb-1">
							Analysis
						</p>
						<p className="font-bold">{extractedData.questions.length} Questions Found</p>
					</div>
				</div>

				<div className="space-y-6">
					<div className="flex items-center justify-between">
						<h4 className="font-black  text-sm tracking-widest flex items-center gap-2">
							Verification List{' '}
							<Badge variant="secondary" className="rounded-md">
								{extractedData.questions.length}
							</Badge>
						</h4>
					</div>

					<div className="space-y-6">
						{extractedData.questions.map((q, idx) => (
							<ExtractedQuestionCard
								key={q.id || `q-${idx}`}
								question={q}
								index={idx}
								onUpdateQuestion={handleUpdateExtractedQuestion}
								onUpdateOption={handleUpdateExtractedOption}
								onUpdateSubQuestion={handleUpdateSubQuestion}
							/>
						))}
					</div>
				</div>
			</div>
		</ScrollArea>
	);
}
