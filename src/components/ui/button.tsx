import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
	'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-[17px] font-bold transition-all focus-visible:outline-none focus-visible:ring-[var(--focus-ring-width)] focus-visible:ring-ring focus-visible:ring-offset-[var(--focus-ring-offset)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.97] duration-200',
	{
		variants: {
			variant: {
				default: 'bg-primary text-primary-foreground shadow-md hover:bg-primary/90',
				destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
				outline:
					'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
				secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
				ghost: 'hover:bg-accent hover:text-accent-foreground',
				link: 'text-primary underline-offset-4 hover:underline',
				ios: 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20 hover:bg-brand-blue/90',
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
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, asChild = false, ...props }, ref) => {
		const Comp = asChild ? Slot : 'button';
		return (
			<Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
		);
	}
);
Button.displayName = 'Button';

export { Button, buttonVariants };
