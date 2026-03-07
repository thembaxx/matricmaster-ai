'use client';

import { X } from '@phosphor-icons/react';
import { AnimatePresence, m } from 'framer-motion';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useFeatureTooltip } from '@/hooks/use-feature-tooltip';

interface FeatureTooltipProps {
	isVisible: boolean;
	onDismiss: () => void;
	title: string;
	content: string;
	cta?: {
		label: string;
		href?: string;
		onClick?: () => void;
	};
	children: React.ReactNode;
	position?: 'top' | 'bottom' | 'left' | 'right';
}

export function FeatureTooltip({
	isVisible,
	onDismiss,
	title,
	content,
	cta,
	children,
	position = 'bottom',
}: FeatureTooltipProps) {
	useEffect(() => {
		if (isVisible) {
			const handleEscape = (e: KeyboardEvent) => {
				if (e.key === 'Escape') {
					onDismiss();
				}
			};
			document.addEventListener('keydown', handleEscape);
			return () => document.removeEventListener('keydown', handleEscape);
		}
	}, [isVisible, onDismiss]);

	const positionClasses = {
		top: 'bottom-full left-1/2 -translate-x-1/2 mb-3',
		bottom: 'top-full left-1/2 -translate-x-1/2 mt-3',
		left: 'right-full top-1/2 -translate-y-1/2 mr-3',
		right: 'left-full top-1/2 -translate-y-1/2 ml-3',
	};

	const arrowClasses = {
		top: 'top-full left-1/2 -translate-x-1/2 border-t-background',
		bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-background',
		left: 'left-full top-1/2 -translate-y-1/2 border-l-background',
		right: 'right-full top-1/2 -translate-y-1/2 border-r-background',
	};

	return (
		<div className="relative inline-block">
			{children}
			<AnimatePresence>
				{isVisible && (
					<m.div
						initial={{ opacity: 0, scale: 0.95, y: 8 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: 8 }}
						transition={{ duration: 0.2, ease: 'easeOut' }}
						className={`absolute z-50 w-72 ${positionClasses[position]} pointer-events-none`}
					>
						<div className="bg-background rounded-2xl shadow-2xl border border-border/50 p-4 pointer-events-auto">
							<div className="flex items-start justify-between gap-2 mb-2">
								<h4 className="font-bold text-foreground text-sm">{title}</h4>
								<button
									type="button"
									onClick={onDismiss}
									className="shrink-0 p-1 hover:bg-muted rounded-lg transition-colors"
									aria-label="Dismiss"
								>
									<X className="w-3.5 h-3.5 text-muted-foreground" />
								</button>
							</div>
							<p className="text-sm text-muted-foreground leading-relaxed mb-3">{content}</p>
							{cta && (
								<Button
									size="sm"
									className="w-full rounded-full text-xs font-bold"
									onClick={() => {
										if (cta.onClick) cta.onClick();
										onDismiss();
									}}
								>
									{cta.label}
								</Button>
							)}
						</div>
						<div className={`absolute border-8 border-transparent ${arrowClasses[position]}`} />
					</m.div>
				)}
			</AnimatePresence>
		</div>
	);
}

interface TooltipWrapperProps {
	tooltipId: string;
	title: string;
	content: string;
	cta?: {
		label: string;
		href?: string;
		onClick?: () => void;
	};
	position?: 'top' | 'bottom' | 'left' | 'right';
	children: React.ReactNode;
}

export function TooltipWrapper({
	tooltipId,
	title,
	content,
	cta,
	position = 'bottom',
	children,
}: TooltipWrapperProps) {
	const { isVisible, dismissAndMarkSeen } = useFeatureTooltip(tooltipId);

	return (
		<FeatureTooltip
			isVisible={isVisible}
			onDismiss={dismissAndMarkSeen}
			title={title}
			content={content}
			cta={cta}
			position={position}
		>
			{children}
		</FeatureTooltip>
	);
}
