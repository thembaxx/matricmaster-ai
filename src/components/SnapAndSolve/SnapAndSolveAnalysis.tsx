'use client';

import { Cancel01Icon, Loading03Icon, SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { SafeImage } from '@/components/SafeImage';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SnapAndSolveAnalysisProps {
	preview: string;
	onReset: () => void;
	subject: string;
	setSubject: (subject: string) => void;
	isAnalyzing: boolean;
	onAnalyze: () => void;
	subjects: string[];
}

export function SnapAndSolveAnalysis({
	preview,
	onReset,
	subject,
	setSubject,
	isAnalyzing,
	onAnalyze,
	subjects,
}: SnapAndSolveAnalysisProps) {
	return (
		<div className="w-full space-y-6">
			<div className="relative w-full aspect-video rounded-[2.5rem] overflow-hidden border-4 border-card shadow-2xl">
				<SafeImage src={preview} alt="Question preview" className="w-full h-full object-cover" />
				<button
					type="button"
					onClick={onReset}
					className="absolute top-4 right-4 w-10 h-10 bg-black/50 backdrop-blur-md text-white rounded-full flex items-center justify-center"
				>
					<HugeiconsIcon icon={Cancel01Icon} className="w-5 h-5" />
				</button>
			</div>

			<div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
				<div className="space-y-3">
					<p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] ml-1">
						Identify Subject
					</p>
					<div className="flex flex-wrap gap-2">
						{subjects.map((s) => (
							<button
								key={s}
								type="button"
								onClick={() => setSubject(s)}
								className={cn(
									'px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all',
									subject === s
										? 'bg-primary text-white shadow-lg scale-105'
										: 'bg-card border border-border text-muted-foreground'
								)}
							>
								{s}
							</button>
						))}
					</div>
				</div>

				<Button
					onClick={onAnalyze}
					disabled={isAnalyzing}
					className="w-full h-16 rounded-3xl font-black text-lg gap-2 shadow-2xl shadow-primary/30"
				>
					{isAnalyzing ? (
						<>
							<HugeiconsIcon icon={Loading03Icon} className="w-6 h-6 animate-spin" />
							Analyzing...
						</>
					) : (
						<>
							<HugeiconsIcon icon={SparklesIcon} className="w-6 h-6" />
							Solve with AI
						</>
					)}
				</Button>
			</div>
		</div>
	);
}
