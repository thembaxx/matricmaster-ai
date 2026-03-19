import { File01Icon, SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { Button } from '@/components/ui/button';

export function PastPaperErrorState({
	error,
	router,
	paper,
	extractQuestions,
	onShowPdf,
}: {
	error: string;
	router: AppRouterInstance;
	paper: {
		id: string;
		subject: string;
		paper: string;
		year: number;
		month: string;
		downloadUrl: string;
	};
	extractQuestions: (
		id: string,
		downloadUrl: string,
		subject: string,
		paper: string,
		year: number,
		month: string
	) => void;
	onShowPdf: () => void;
}) {
	return (
		<div className="flex flex-col h-full bg-background relative">
			<header className="px-6 pt-12 pb-4 bg-card sticky top-0 z-20 border-b border-border shrink-0">
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center gap-4">
						<Button variant="ghost" size="icon" onClick={() => router.back()}>
							<HugeiconsIcon icon={File01Icon} className="w-5 h-5" />
						</Button>
						<h1 className="text-lg font-bold text-foreground">
							{paper.subject} {paper.paper}
						</h1>
					</div>
				</div>
			</header>
			<div className="flex-1 flex flex-col items-center justify-center p-6">
				<div className="text-center space-y-4 max-w-sm">
					<div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
						<HugeiconsIcon icon={SparklesIcon} className="w-8 h-8 text-red-500" />
					</div>
					<div className="space-y-2">
						<h3 className="font-bold text-foreground">Extraction Failed</h3>
						<p className="text-sm text-muted-foreground">{error}</p>
					</div>
					<div className="flex flex-col gap-2">
						<Button
							className="bg-brand-blue text-white"
							onClick={() =>
								extractQuestions(
									paper.id,
									paper.downloadUrl,
									paper.subject,
									paper.paper,
									paper.year,
									paper.month
								)
							}
						>
							Try Again
						</Button>
						<Button variant="outline" onClick={onShowPdf} className="gap-2">
							<HugeiconsIcon icon={File01Icon} className="w-4 h-4" />
							View Original PDF
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
