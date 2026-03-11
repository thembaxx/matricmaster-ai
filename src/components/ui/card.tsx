import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const cardVariants = cva(
	'rounded-[1.5rem] border transition-all duration-300 ease-out',
	{
		variants: {
			variant: {
				default: 'border-border bg-card text-card-foreground shadow-sm',
				elevated: 'border-transparent bg-card text-card-foreground shadow-xl shadow-primary-violet/5',
				outlined: 'border-2 border-border bg-transparent text-card-foreground',
				interactive: 'border-border bg-card text-card-foreground shadow-sm hover:shadow-lg hover:-translate-y-1 cursor-pointer active:scale-[0.98]',
			},
			padding: {
				none: 'p-0',
				sm: 'p-4',
				md: 'p-6',
				lg: 'p-8',
			},
		},
		defaultVariants: {
			variant: 'default',
			padding: 'none',
		},
	}
);

export interface CardProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof cardVariants> {
	hoverable?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
	({ className, variant, padding, hoverable, ...props }, ref) => (
		<div
			ref={ref}
			className={cn(
				cardVariants({ variant, padding, className }),
				hoverable && 'hover:shadow-lg hover:-translate-y-1 transition-all duration-300'
			)}
			{...props}
		/>
	)
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({ className, ...props }, ref) => (
		<div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
	)
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({ className, ...props }, ref) => (
		<div
			ref={ref}
			className={cn('font-bold leading-none tracking-tight text-xl font-heading', className)}
			{...props}
		/>
	)
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({ className, ...props }, ref) => (
		<div ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
	)
);
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({ className, ...props }, ref) => (
		<div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
	)
);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
	({ className, ...props }, ref) => (
		<div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
	)
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
