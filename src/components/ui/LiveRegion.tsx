'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type LiveRegionPoliteness = 'polite' | 'assertive' | 'off';

interface LiveRegionProps extends React.HTMLAttributes<HTMLDivElement> {
	/**
	 * The politeness level for the live region.
	 * - 'polite': Waits for user to finish current task before announcing
	 * - 'assertive': Interrupts current speech to announce immediately
	 * - 'off': Disables live region announcements
	 * @default 'polite'
	 */
	politeness?: LiveRegionPoliteness;

	/**
	 * Whether to announce the entire region content or only changes.
	 * @default true
	 */
	atomic?: boolean;

	/**
	 * Whether the live region should be visually hidden.
	 * @default true
	 */
	hidden?: boolean;

	/**
	 * The content to announce. Can be a string or React nodes.
	 */
	children: React.ReactNode;

	/**
	 * Optional callback when content changes are announced
	 */
	onAnnounce?: (content: string) => void;
}

/**
 * LiveRegion component for accessible announcements.
 *
 * Use this component to announce dynamic content changes to screen readers.
 * - Use 'polite' for non-urgent updates (quiz results, progress updates)
 * - Use 'assertive' for critical alerts (errors, achievements)
 *
 * @example
 * ```tsx
 * <LiveRegion politeness="polite">
 *   Quiz completed! Your score: 8/10
 * </LiveRegion>
 *
 * <LiveRegion politeness="assertive" hidden={false}>
 *   Error: Unable to save progress
 * </LiveRegion>
 * ```
 */
export const LiveRegion = React.forwardRef<HTMLDivElement, LiveRegionProps>(
	(
		{
			politeness = 'polite',
			atomic = true,
			hidden = true,
			children,
			className,
			onAnnounce,
			...props
		},
		ref
	) => {
		const [content, setContent] = React.useState('');
		const previousContentRef = React.useRef('');

		React.useEffect(() => {
			const newContent = typeof children === 'string' ? children : '';

			if (newContent && newContent !== previousContentRef.current) {
				previousContentRef.current = newContent;
				setContent('');

				// Use requestAnimationFrame to ensure the screen reader detects the change
				requestAnimationFrame(() => {
					setContent(newContent);
					onAnnounce?.(newContent);
				});
			}
		}, [children, onAnnounce]);

		if (hidden) {
			return (
				<div
					ref={ref}
					role={politeness === 'off' ? undefined : 'status'}
					aria-live={politeness}
					aria-atomic={atomic}
					className="sr-only"
					{...props}
				>
					{content}
				</div>
			);
		}

		return (
			<div
				ref={ref}
				role={politeness === 'off' ? undefined : 'status'}
				aria-live={politeness}
				aria-atomic={atomic}
				className={className}
				{...props}
			>
				{children}
			</div>
		);
	}
);

LiveRegion.displayName = 'LiveRegion';

/**
 * useLiveRegion hook for programmatic announcements.
 *
 * @example
 * ```tsx
 * const { announce, LiveRegion } = useLiveRegion();
 *
 * // Announce a message
 * announce('Answer submitted!', 'polite');
 *
 * // Or use the component
 * <LiveRegion />
 * ```
 */
export function useLiveRegion(defaultPoliteness: LiveRegionPoliteness = 'polite') {
	const [message, setMessage] = React.useState('');
	const [politeness, setPoliteness] = React.useState<LiveRegionPoliteness>(defaultPoliteness);

	const announce = React.useCallback(
		(content: string, priority?: LiveRegionPoliteness) => {
			// Clear first to ensure re-announcement of same content
			setMessage('');
			setPoliteness(priority || defaultPoliteness);

			requestAnimationFrame(() => {
				setMessage(content);
			});
		},
		[defaultPoliteness]
	);

	const LiveRegionComponent = React.useCallback(
		(props?: Partial<LiveRegionProps>) => (
			<LiveRegion politeness={politeness} {...props}>
				{message}
			</LiveRegion>
		),
		[message, politeness]
	);

	return {
		announce,
		LiveRegion: LiveRegionComponent,
		message,
	};
}

/**
 * StatusMessage component for displaying status updates with live region.
 */
interface StatusMessageProps {
	message: string;
	type?: 'info' | 'success' | 'error' | 'warning';
	className?: string;
}

export function StatusMessage({ message, type = 'info', className }: StatusMessageProps) {
	const typeClasses = {
		info: 'text-foreground',
		success: 'text-green-600 dark:text-green-400',
		error: 'text-destructive',
		warning: 'text-yellow-600 dark:text-yellow-400',
	};

	const typePoliteness: Record<string, LiveRegionPoliteness> = {
		info: 'polite',
		success: 'polite',
		error: 'assertive',
		warning: 'assertive',
	};

	return (
		<LiveRegion
			politeness={typePoliteness[type]}
			className={cn('text-sm font-medium', typeClasses[type], className)}
		>
			{message}
		</LiveRegion>
	);
}
