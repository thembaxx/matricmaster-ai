'use client';

import {
	AlertTriangle,
	BookOpen,
	Brain,
	Clock,
	CloudOff,
	Flame,
	HelpCircle,
	Info,
	Lightbulb,
	RefreshCw,
	ShieldAlert,
	Sparkles,
	TrendingUp,
	Users,
	X,
	Zap,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { EdgeCaseResponse, EdgeCaseType } from '@/services/edge-case-service';

interface EdgeCaseHandlerProps {
	isOpen: boolean;
	edgeCase: EdgeCaseResponse | null;
	edgeCaseType?: EdgeCaseType;
	onClose: () => void;
	onAction: (action: string, type: EdgeCaseType) => void;
}

const EDGE_CASE_ICONS: Record<EdgeCaseType, React.ElementType> = {
	COMPLETE_FAILURE: HelpCircle,
	HINT_OVERUSE: Lightbulb,
	RAPID_SUCCESS: Sparkles,
	BURNOUT_RISK: Flame,
	EMPTY_QUESTION_BANK: BookOpen,
	OFFLINE_CONFLICT: CloudOff,
	API_RATE_LIMIT: Zap,
	SESSION_TIMEOUT: Clock,
	TOXIC_COMPETITION: ShieldAlert,
	COMPARISON_ANXIETY: Users,
	AI_CONTENT_ERROR: AlertTriangle,
	CURRICULUM_CHANGE: RefreshCw,
	CONTRADICTORY_INFO: Info,
};

const SEVERITY_COLORS = {
	low: 'text-muted-foreground bg-muted',
	medium: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30',
	high: 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30',
	critical: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
};

const SEVERITY_BORDER = {
	low: 'border-muted',
	medium: 'border-yellow-500/50',
	high: 'border-orange-500/50',
	critical: 'border-red-500/50',
};

export function EdgeCaseHandler({
	isOpen,
	edgeCase,
	edgeCaseType = 'COMPLETE_FAILURE',
	onClose,
	onAction,
}: EdgeCaseHandlerProps) {
	const [selectedOption, setSelectedOption] = useState<string | null>(null);
	const [isAnimating, setIsAnimating] = useState(false);

	const Icon = edgeCase ? EDGE_CASE_ICONS[edgeCaseType] : HelpCircle;

	const handleAction = useCallback(
		(actionLabel: string) => {
			setIsAnimating(true);
			setTimeout(() => {
				onAction(actionLabel, edgeCaseType);
				onClose();
				setIsAnimating(false);
				setSelectedOption(null);
			}, 300);
		},
		[onAction, onClose, edgeCaseType]
	);

	const handleClose = useCallback(() => {
		setSelectedOption(null);
		onClose();
	}, [onClose]);

	if (!edgeCase) return null;

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent
				className={cn(
					'gap-0 p-0 sm:max-w-md overflow-hidden border-2',
					SEVERITY_BORDER[edgeCase.severity],
					isAnimating && 'animate-in fade-out-0 zoom-out-95 duration-300'
				)}
			>
				<div
					className={cn('flex items-center gap-3 p-4 border-b', SEVERITY_COLORS[edgeCase.severity])}
				>
					<Icon className="h-5 w-5 shrink-0" />
					<span
						className={cn(
							'text-xs font-medium  tracking-wide',
							edgeCase.severity === 'low' && 'text-muted-foreground',
							edgeCase.severity === 'medium' && 'text-yellow-700 dark:text-yellow-300',
							edgeCase.severity === 'high' && 'text-orange-700 dark:text-orange-300',
							edgeCase.severity === 'critical' && 'text-red-700 dark:text-red-300'
						)}
					>
						{edgeCaseType.replace(/_/g, ' ').toLowerCase()}
					</span>
					<Button variant="ghost" size="icon" className="ml-auto h-6 w-6" onClick={handleClose}>
						<X className="h-4 w-4" />
						<span className="sr-only">close</span>
					</Button>
				</div>

				<div className="p-6">
					<DialogHeader className="space-y-3 text-left">
						<DialogTitle className="text-xl font-semibold leading-tight">
							{edgeCase.title}
						</DialogTitle>
						<DialogDescription className="text-base leading-relaxed">
							{edgeCase.message}
						</DialogDescription>
					</DialogHeader>

					{edgeCase.options && edgeCase.options.length > 0 && (
						<div className="mt-4 space-y-2">
							<p className="text-sm font-medium text-muted-foreground">choose a source:</p>
							<div className="space-y-2">
								{edgeCase.options.map((option) => (
									<button
										type="button"
										key={option.value}
										onClick={() => setSelectedOption(option.value)}
										className={cn(
											'w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-all',
											selectedOption === option.value
												? 'border-primary bg-primary/5'
												: 'border-border hover:border-primary/50 hover:bg-muted/50'
										)}
									>
										<div
											className={cn(
												'h-8 w-8 rounded-full flex items-center justify-center shrink-0',
												selectedOption === option.value
													? 'bg-primary text-primary-foreground'
													: 'bg-muted'
											)}
										>
											{option.icon === 'book' ? (
												<BookOpen className="h-4 w-4" />
											) : (
												<Lightbulb className="h-4 w-4" />
											)}
										</div>
										<div className="flex-1 min-w-0">
											<p className="font-medium text-sm">{option.label}</p>
											{option.description && (
												<p className="text-xs text-muted-foreground mt-0.5">{option.description}</p>
											)}
										</div>
									</button>
								))}
							</div>
						</div>
					)}

					{edgeCase.enableChallengeMode && (
						<div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border">
							<div className="flex items-center gap-2 text-sm">
								<Trophy className="h-4 w-4 text-primary" />
								<span className="font-medium">challenge mode available</span>
							</div>
							<p className="text-xs text-muted-foreground mt-1">
								try completing questions without hints for bonus points
							</p>
						</div>
					)}

					{edgeCase.suggestContent && (
						<div className="mt-4 flex items-center gap-2">
							<TrendingUp className="h-4 w-4 text-primary" />
							<span className="text-sm text-muted-foreground">
								suggested: {edgeCase.suggestContent}
							</span>
						</div>
					)}

					<div
						className={cn(
							'mt-6 flex flex-col gap-2',
							edgeCase.actions.length === 1 && 'sm:flex-row sm:justify-end'
						)}
					>
						{edgeCase.actions.map((action, index) => (
							<Button
								key={action.label}
								onClick={() => handleAction(action.label)}
								variant={
									action.variant === 'destructive'
										? 'destructive'
										: action.variant === 'primary'
											? 'default'
											: 'secondary'
								}
								className={cn(
									'transition-all',
									index === 0 && 'bg-primary hover:bg-primary/90',
									isAnimating && 'pointer-events-none'
								)}
							>
								{action.label}
							</Button>
						))}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

function Trophy({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-label="Trophy"
			className={className}
		>
			<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
			<path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
			<path d="M4 22h16" />
			<path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
			<path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
			<path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
		</svg>
	);
}

interface EdgeCaseBadgeProps {
	type: EdgeCaseType;
	count?: number;
	onClick?: () => void;
	className?: string;
}

export function EdgeCaseBadge({ type, count, onClick, className }: EdgeCaseBadgeProps) {
	const Icon = EDGE_CASE_ICONS[type];

	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				'inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium',
				'bg-muted text-muted-foreground hover:bg-muted/80 transition-colors',
				className
			)}
		>
			<Icon className="h-3 w-3" />
			<span>{type.replace(/_/g, ' ').toLowerCase()}</span>
			{count !== undefined && count > 0 && (
				<span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">{count}</span>
			)}
		</button>
	);
}

interface EdgeCaseIndicatorProps {
	activeEdgeCases: EdgeCaseType[];
	onClick?: () => void;
	className?: string;
}

export function EdgeCaseIndicator({ activeEdgeCases, onClick, className }: EdgeCaseIndicatorProps) {
	if (activeEdgeCases.length === 0) return null;

	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg',
				'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
				'text-sm font-medium hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors',
				className
			)}
		>
			<AlertTriangle className="h-4 w-4" />
			<span>
				{activeEdgeCases.length} support {activeEdgeCases.length === 1 ? 'tip' : 'tips'} available
			</span>
		</button>
	);
}

interface QuickTipCardProps {
	title: string;
	description: string;
	icon?: React.ElementType;
	onDismiss?: () => void;
	className?: string;
}

export function QuickTipCard({
	title,
	description,
	icon: Icon = Lightbulb,
	onDismiss,
	className,
}: QuickTipCardProps) {
	return (
		<div
			className={cn(
				'group relative p-4 rounded-xl border bg-card text-card-foreground',
				'hover:shadow-md transition-all cursor-pointer',
				className
			)}
		>
			{onDismiss && (
				<Button
					variant="ghost"
					size="icon"
					className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
					onClick={(e) => {
						e.stopPropagation();
						onDismiss();
					}}
				>
					<X className="h-3 w-3" />
					<span className="sr-only">dismiss</span>
				</Button>
			)}

			<div className="flex items-start gap-3">
				<div className="p-2 rounded-lg bg-primary/10">
					<Icon className="h-4 w-4 text-primary" />
				</div>
				<div className="flex-1 min-w-0">
					<h4 className="font-medium text-sm">{title}</h4>
					<p className="text-xs text-muted-foreground mt-0.5">{description}</p>
				</div>
			</div>
		</div>
	);
}

interface SessionRecoveryPromptProps {
	lastQuestionIndex: number;
	totalQuestions: number;
	onRecover: () => void;
	onStartFresh: () => void;
	className?: string;
}

export function SessionRecoveryPrompt({
	lastQuestionIndex,
	totalQuestions,
	onRecover,
	onStartFresh,
	className,
}: SessionRecoveryPromptProps) {
	return (
		<div
			className={cn(
				'flex items-center gap-4 p-4 rounded-xl border bg-card',
				'animate-in slide-in-from-top-4 duration-300',
				className
			)}
		>
			<div className="p-3 rounded-full bg-primary/10">
				<Clock className="h-6 w-6 text-primary" />
			</div>
			<div className="flex-1 min-w-0">
				<h4 className="font-medium">welcome back</h4>
				<p className="text-sm text-muted-foreground">
					continue from question {lastQuestionIndex + 1} of {totalQuestions}
				</p>
			</div>
			<div className="flex gap-2">
				<Button variant="secondary" size="sm" onClick={onStartFresh}>
					start fresh
				</Button>
				<Button size="sm" onClick={onRecover}>
					continue
				</Button>
			</div>
		</div>
	);
}

interface ProgressIndicatorProps {
	metrics: {
		hintsUsed: number;
		questionsAnswered: number;
		streakDays: number;
	};
	className?: string;
}

export function ProgressIndicator({ metrics, className }: ProgressIndicatorProps) {
	const hintRatio =
		metrics.questionsAnswered > 0 ? metrics.hintsUsed / metrics.questionsAnswered : 0;

	return (
		<div className={cn('flex items-center gap-4 text-sm', className)}>
			<div className="flex items-center gap-1.5">
				<Brain className="h-4 w-4 text-muted-foreground" />
				<span>{metrics.questionsAnswered} questions</span>
			</div>

			<div className="flex items-center gap-1.5">
				<Lightbulb
					className={cn('h-4 w-4', hintRatio > 0.5 ? 'text-yellow-500' : 'text-muted-foreground')}
				/>
				<span>{metrics.hintsUsed} hints</span>
				{hintRatio > 0.5 && (
					<span className="text-xs text-yellow-600 dark:text-yellow-400">(overusing)</span>
				)}
			</div>

			<div className="flex items-center gap-1.5">
				<Flame className="h-4 w-4 text-orange-500" />
				<span>{metrics.streakDays} day streak</span>
			</div>
		</div>
	);
}
