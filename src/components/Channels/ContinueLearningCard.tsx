'use client';

import { PlayIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

interface ContinueLearningCardProps {
	title: string;
	subject: string;
	progress: number;
	onClick?: () => void;
}

export function ContinueLearningCard({
	title,
	subject,
	progress,
	onClick,
}: ContinueLearningCardProps) {
	return (
		<div
			role="button"
			tabIndex={0}
			className="bg-card p-5 rounded-3xl shadow-sm border border-border relative overflow-hidden group cursor-pointer hover:shadow-md transition-all ios-active-scale"
			onClick={onClick}
			onKeyDown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					onClick?.();
				}
			}}
		>
			<div className="flex items-center gap-5">
				<div className="w-16 h-16 rounded-2xl bg-warning flex items-center justify-center shadow-lg shadow-warning/20 transform group-hover:scale-105 transition-transform">
					<div className="text-warning-foreground text-3xl font-black italic">Σ</div>
				</div>
				<div className="flex-1">
					<h4 className="text-lg font-black text-foreground">{title}</h4>
					<p className="text-xs text-label-secondary font-black uppercase tracking-wider leading-tight">
						{subject} • {progress}% Complete
					</p>
				</div>
				<div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
					<HugeiconsIcon
						icon={PlayIcon}
						className="w-4 h-4 text-label-tertiary fill-label-tertiary"
					/>
				</div>
			</div>
			<div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
				<div className="h-full bg-primary" style={{ width: `${progress}%` }} />
			</div>
		</div>
	);
}
