'use client';

import { Loading03Icon, SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const SUBJECTS = [
	'Mathematics',
	'Physical Sciences',
	'Life Sciences',
	'Accounting',
	'Economics',
	'General',
] as const;

interface SubjectSelectorProps {
	selectedSubject: string;
	onSubjectChange: (subject: string) => void;
}

export const SubjectSelector = memo(function SubjectSelector({
	selectedSubject,
	onSubjectChange,
}: SubjectSelectorProps) {
	return (
		<div className="space-y-3">
			<p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] ml-1">
				Identify Subject
			</p>
			<div className="flex flex-wrap gap-2">
				{SUBJECTS.map((s) => (
					<button
						key={s}
						type="button"
						onClick={() => onSubjectChange(s)}
						className={cn(
							'px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all',
							selectedSubject === s
								? 'bg-primary text-white shadow-lg scale-105'
								: 'bg-card border border-border text-muted-foreground'
						)}
					>
						{s}
					</button>
				))}
			</div>
		</div>
	);
});

interface AnalyzeButtonProps {
	isAnalyzing: boolean;
	onClick: () => void;
}

export const AnalyzeButton = memo(function AnalyzeButton({
	isAnalyzing,
	onClick,
}: AnalyzeButtonProps) {
	return (
		<Button
			onClick={onClick}
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
	);
});
