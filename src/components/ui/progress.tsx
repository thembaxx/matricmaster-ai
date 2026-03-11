'use client';

import * as ProgressPrimitive from '@radix-ui/react-progress';
import * as React from 'react';
import { cn } from '@/lib/utils';

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
	indicatorClassName?: string;
	variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'violet' | 'cyan' | 'orange';
}

const Progress = React.forwardRef<
	React.ElementRef<typeof ProgressPrimitive.Root>,
	ProgressProps
>(({ className, value, indicatorClassName, variant = 'default', ...props }, ref) => {
	const variantStyles = {
		default: 'bg-primary',
		success: 'bg-success',
		warning: 'bg-warning',
		error: 'bg-destructive',
		info: 'bg-info',
		violet: 'bg-primary-violet',
		cyan: 'bg-primary-cyan',
		orange: 'bg-primary-orange',
	};

	return (
		<ProgressPrimitive.Root
			ref={ref}
			className={cn('relative h-2.5 w-full overflow-hidden rounded-full bg-muted/50 shadow-inner', className)}
			{...props}
		>
			<ProgressPrimitive.Indicator
				className={cn(
					'h-full w-full flex-1 transition-all duration-500 ease-in-out',
					variantStyles[variant],
					indicatorClassName
				)}
				style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
			/>
		</ProgressPrimitive.Root>
	);
});
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
