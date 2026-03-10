import { Loading03Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { cn } from '@/lib/utils';

function Spinner({ className, ...props }: React.ComponentProps<'svg'>) {
	return (
		<HugeiconsIcon
			icon={Loading03Icon}
			role="status"
			aria-label="Loading"
			{...props}
			className={cn('size-4 animate-spin', className)}
			strokeWidth={typeof props.strokeWidth === 'number' ? props.strokeWidth : undefined}
		/>
	);
}

export { Spinner };
