import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
	'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-[17px] font-bold transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-[var(--focus-ring-width)] focus-visible:ring-ring focus-visible:ring-offset-[var(--focus-ring-offset)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0 active:scale-[0.98] hover:scale-[1.02] hover:-translate-y-0.5 min-h-[44px]',
	{
		variants: {
			variant: {
				default:
					'bg-gradient-to-r from-primary-violet to-primary-cyan text-white shadow-md hover:shadow-primary-violet/25 shadow-lg',
				primary: 'bg-gradient-to-r from-primary-violet to-primary-cyan text-white shadow-md hover:shadow-primary-violet/25 shadow-lg',
				secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
				tertiary: 'bg-transparent text-primary hover:bg-primary/5',
				outline:
					'border-2 border-primary-violet/20 bg-background shadow-sm hover:bg-primary-violet/5 hover:text-primary-violet border-primary/20',
				destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
				success: 'bg-success text-white shadow-sm hover:bg-success/90',
				ghost: 'hover:bg-accent hover:text-accent-foreground',
				link: 'text-primary underline-offset-4 hover:underline',
				glass: 'ios-glass text-foreground hover:bg-surface-elevated/90 shadow-sm border-border/50',
			},
			size: {
				default: 'h-12 px-6 py-3',
				sm: 'h-10 rounded-xl px-4 text-sm',
				lg: 'h-14 rounded-[2rem] px-10 text-lg',
				icon: 'h-12 w-12 rounded-full',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	}
);

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
	loading?: boolean;
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, asChild = false, loading, leftIcon, rightIcon, children, ...props }, ref) => {
		if (asChild) {
			return (
				<Slot className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}>
					{children}
				</Slot>
			);
		}

		return (
			<button
				className={cn(buttonVariants({ variant, size, className }))}
				ref={ref}
				disabled={loading || props.disabled}
				{...props}
			>
				{loading && <Spinner className="mr-2" />}
				{!loading && leftIcon && <span className="mr-2">{leftIcon}</span>}
				{children}
				{!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
			</button>
		);
	}
);
Button.displayName = 'Button';

export { Button, buttonVariants };
