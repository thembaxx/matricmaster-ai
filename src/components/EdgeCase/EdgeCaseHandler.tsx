'use client';

import { BookOpen, Lightbulb, TrendingUp, X } from 'lucide-react';
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
import { EDGE_CASE_ICONS, SEVERITY_BORDER, SEVERITY_COLORS } from './constants';
import { Trophy } from './Trophy';

interface EdgeCaseHandlerProps {
	isOpen: boolean;
	edgeCase: EdgeCaseResponse | null;
	edgeCaseType?: EdgeCaseType;
	onClose: () => void;
	onAction: (action: string, type: EdgeCaseType) => void;
}

interface EdgeCaseDialogContentProps {
	edgeCase: EdgeCaseResponse;
	edgeCaseType: EdgeCaseType;
	selectedOption: string | null;
	onSelectOption: (value: string) => void;
	onAction: (label: string) => void;
	isAnimating: boolean;
}

function EdgeCaseDialogContent({
	edgeCase,
	edgeCaseType,
	selectedOption,
	onSelectOption,
	onAction,
	isAnimating,
}: EdgeCaseDialogContentProps) {
	const Icon = EDGE_CASE_ICONS[edgeCaseType];

	return (
		<>
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
									onClick={() => onSelectOption(option.value)}
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
							onClick={() => onAction(action.label)}
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
		</>
	);
}

export function EdgeCaseHandler({
	isOpen,
	edgeCase,
	edgeCaseType = 'COMPLETE_FAILURE',
	onClose,
	onAction,
}: EdgeCaseHandlerProps) {
	const [selectedOption, setSelectedOption] = useState<string | null>(null);
	const [isAnimating, setIsAnimating] = useState(false);

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
				<Button
					variant="ghost"
					size="icon"
					className="absolute right-2 top-2 h-6 w-6 z-10"
					onClick={handleClose}
				>
					<X className="h-4 w-4" />
					<span className="sr-only">close</span>
				</Button>
				<EdgeCaseDialogContent
					edgeCase={edgeCase}
					edgeCaseType={edgeCaseType}
					selectedOption={selectedOption}
					onSelectOption={setSelectedOption}
					onAction={handleAction}
					isAnimating={isAnimating}
				/>
			</DialogContent>
		</Dialog>
	);
}
