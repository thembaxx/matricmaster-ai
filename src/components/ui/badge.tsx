import { cva, type VariantProps } from 'class-variance-authority';
import type * as React from 'react';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
	'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold transition-all duration-300 focus:outline-none focus:ring-[var(--focus-ring-width)] focus:ring-ring focus:ring-offset-[var(--focus-ring-offset)]',
	{
		variants: {
			variant: {
				default: 'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80',
				secondary:
					'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
				destructive:
					'border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80',
				outline: 'text-foreground border-border bg-transparent',
				success: 'border-transparent bg-success text-white',
				warning: 'border-transparent bg-warning text-white',
				error: 'border-transparent bg-destructive text-white',
				info: 'border-transparent bg-info text-white',
				violet: 'border-transparent bg-primary-violet text-white',
				cyan: 'border-transparent bg-primary-cyan text-white',
				orange: 'border-transparent bg-primary-orange text-white',
			},
			size: {
				sm: 'px-2 py-0.5 text-[10px]',
				md: 'px-2.5 py-0.5 text-xs',
				lg: 'px-3 py-1 text-sm',
			}
		},
		defaultVariants: {
			variant: 'default',
			size: 'md',
		},
	}
);

export interface BadgeProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof badgeVariants> {
	icon?: React.ReactNode;
}

function Badge({ className, variant, size, icon, children, ...props }: BadgeProps) {
	return (
		<div className={cn(badgeVariants({ variant, size }), className)} {...props}>
			{icon && <span className="mr-1">{icon}</span>}
			{children}
		</div>
	);
}

export { Badge, badgeVariants };
