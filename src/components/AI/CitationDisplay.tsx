'use client';

import { BookOpenIcon, File01Icon, GraduationCap, SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
	type Citation,
	type ConfidenceLevel,
	getConfidenceBgColor,
	getSourceTypeColor,
	type SourceType,
} from '@/lib/ai/citations';
import { cn } from '@/lib/utils';

interface CitationDisplayProps {
	citations: Citation[];
	showSources?: boolean;
	className?: string;
}

function SourceTypeIcon({ type }: { type: SourceType }) {
	switch (type) {
		case 'textbook':
			return <HugeiconsIcon icon={BookOpenIcon} className="h-3.5 w-3.5" />;
		case 'past-paper':
			return <HugeiconsIcon icon={File01Icon} className="h-3.5 w-3.5" />;
		case 'curriculum':
			return <HugeiconsIcon icon={GraduationCap} className="h-3.5 w-3.5" />;
		case 'ai-generated':
			return <HugeiconsIcon icon={SparklesIcon} className="h-3.5 w-3.5" />;
	}
}

function ConfidenceIndicator({ level }: { level: ConfidenceLevel }) {
	const labels = {
		high: 'High confidence',
		medium: 'Medium confidence',
		low: 'Low confidence',
	};

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<span
						className={cn(
							'inline-flex items-center gap-1 text-[10px] font-black  tracking-wider px-1.5 py-0.5 rounded border',
							getConfidenceBgColor(level)
						)}
					>
						<span
							className={cn(
								'h-1.5 w-1.5 rounded-full',
								level === 'high' && 'bg-green-500',
								level === 'medium' && 'bg-amber-500',
								level === 'low' && 'bg-red-500'
							)}
						/>
						{level}
					</span>
				</TooltipTrigger>
				<TooltipContent side="top" className="max-w-xs">
					<p>{labels[level]}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}

function CitationItem({ citation }: { citation: Citation }) {
	return (
		<div className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0">
			<div
				className={cn(
					'shrink-0 flex items-center justify-center w-8 h-8 rounded-lg border',
					getSourceTypeColor(citation.source.type)
				)}
			>
				<SourceTypeIcon type={citation.source.type} />
			</div>
			<div className="flex-1 min-w-0">
				<div className="flex items-center gap-2 flex-wrap">
					<span className="font-semibold text-sm truncate">{citation.source.name}</span>
					<ConfidenceIndicator level={citation.confidenceLevel} />
				</div>
				{citation.topic && (
					<p className="text-xs text-muted-foreground mt-0.5">
						{citation.topic}
						{citation.subtopic && ` › ${citation.subtopic}`}
					</p>
				)}
				{citation.source.description && (
					<p className="text-xs text-muted-foreground/70 mt-1 line-clamp-2">
						{citation.source.description}
					</p>
				)}
			</div>
			<div className="shrink-0">
				<span className="text-[10px] font-mono text-muted-foreground/50">
					{(citation.confidence * 100).toFixed(0)}%
				</span>
			</div>
		</div>
	);
}

export function CitationDisplay({
	citations,
	showSources = true,
	className,
}: CitationDisplayProps) {
	const [isExpanded, setIsExpanded] = useState(false);

	if (!citations || citations.length === 0) {
		return null;
	}

	const highConfidence = citations.filter((c) => c.confidenceLevel === 'high');
	const mediumConfidence = citations.filter((c) => c.confidenceLevel === 'medium');

	return (
		<Card
			className={cn(
				'mt-4 overflow-hidden border-border/50 bg-muted/30 backdrop-blur-sm',
				className
			)}
		>
			<CardHeader className="pb-2 pt-3 px-4">
				<div className="flex items-center justify-between">
					<CardTitle className="text-sm font-semibold flex items-center gap-2">
						<HugeiconsIcon icon={BookOpenIcon} className="h-4 w-4 text-primary" />
						Sources ({citations.length})
					</CardTitle>
					<div className="flex items-center gap-2">
						{highConfidence.length > 0 && (
							<Badge
								variant="outline"
								className="bg-green-100/50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 text-[10px]"
							>
								{highConfidence.length} high
							</Badge>
						)}
						{mediumConfidence.length > 0 && (
							<Badge
								variant="outline"
								className="bg-amber-100/50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 text-[10px]"
							>
								{mediumConfidence.length} medium
							</Badge>
						)}
						<Button
							variant="ghost"
							size="sm"
							className="h-7 text-xs font-semibold"
							onClick={() => setIsExpanded(!isExpanded)}
						>
							{isExpanded ? 'Less' : 'View all'}
						</Button>
					</div>
				</div>
			</CardHeader>
			{showSources && (
				<CardContent className="pt-0 px-4 pb-3">
					<div className="space-y-0.5">
						{(isExpanded ? citations : citations.slice(0, 3)).map((citation) => (
							<CitationItem key={citation.id} citation={citation} />
						))}
					</div>
					{citations.length > 3 && !isExpanded && (
						<Button
							variant="ghost"
							size="sm"
							className="w-full mt-2 h-8 text-xs"
							onClick={() => setIsExpanded(true)}
						>
							+ {citations.length - 3} more sources
						</Button>
					)}
				</CardContent>
			)}
		</Card>
	);
}

interface InlineCitationProps {
	citation: Citation;
	index: number;
}

export function InlineCitationMarker({ citation, index }: InlineCitationProps) {
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<sup className="inline-flex items-center justify-center">
						<span
							className={cn(
								'inline-flex items-center justify-center w-4 h-4 text-[9px] font-black rounded-sm border cursor-help align-baseline ml-0.5',
								citation.confidenceLevel === 'high' &&
									'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
								citation.confidenceLevel === 'medium' &&
									'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
								citation.confidenceLevel === 'low' &&
									'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
							)}
						>
							{index + 1}
						</span>
					</sup>
				</TooltipTrigger>
				<TooltipContent side="top" className="max-w-xs">
					<div className="space-y-1">
						<div className="flex items-center gap-2">
							<span className="font-semibold text-xs">{citation.source.name}</span>
							<ConfidenceIndicator level={citation.confidenceLevel} />
						</div>
						{citation.topic && <p className="text-xs text-muted-foreground">{citation.topic}</p>}
						<p className="text-[10px] text-muted-foreground/70">
							Confidence: {(citation.confidence * 100).toFixed(0)}%
						</p>
					</div>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}

interface ConfidenceSummaryProps {
	citations: Citation[];
	className?: string;
}

export function ConfidenceSummary({ citations, className }: ConfidenceSummaryProps) {
	const summary = {
		high: citations.filter((c) => c.confidenceLevel === 'high').length,
		medium: citations.filter((c) => c.confidenceLevel === 'medium').length,
		low: citations.filter((c) => c.confidenceLevel === 'low').length,
	};

	const total = citations.length;

	return (
		<div className={cn('flex items-center gap-3', className)}>
			<span className="text-[10px] font-bold text-muted-foreground  tracking-wider">Sources</span>
			<div className="flex items-center gap-1.5">
				{summary.high > 0 && (
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400">
									<span className="w-2 h-2 rounded-full bg-green-500" />
									{summary.high}
								</span>
							</TooltipTrigger>
							<TooltipContent side="top">
								<p>{summary.high} high confidence sources</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				)}
				{summary.medium > 0 && (
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
									<span className="w-2 h-2 rounded-full bg-amber-500" />
									{summary.medium}
								</span>
							</TooltipTrigger>
							<TooltipContent side="top">
								<p>{summary.medium} medium confidence sources</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				)}
				{summary.low > 0 && (
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 dark:text-red-400">
									<span className="w-2 h-2 rounded-full bg-red-500" />
									{summary.low}
								</span>
							</TooltipTrigger>
							<TooltipContent side="top">
								<p>{summary.low} low confidence sources</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				)}
			</div>
			<span className="text-[10px] text-muted-foreground/50">({total} total)</span>
		</div>
	);
}
