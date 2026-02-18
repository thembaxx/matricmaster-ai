import { cn } from '@/lib/utils';

interface BackgroundMeshProps {
	className?: string;
	variant?: 'default' | 'subtle';
}

export function BackgroundMesh({ className, variant = 'default' }: BackgroundMeshProps) {
	return (
		<div className={cn('absolute inset-0 pointer-events-none overflow-hidden', className)}>
			<div
				className={cn(
					'absolute top-[-20%] left-[-10%] rounded-full animate-pulse-slow',
					variant === 'default'
						? 'w-[50%] h-[50%] bg-blue-500/10 dark:bg-blue-900/10 blur-[96px]'
						: 'w-[40%] h-[40%] bg-blue-500/5 dark:bg-blue-900/5 blur-[80px]'
				)}
			/>
			<div
				className={cn(
					'absolute bottom-[-20%] right-[-10%] rounded-full animate-pulse-slow delay-1000',
					variant === 'default'
						? 'w-[50%] h-[50%] bg-purple-500/10 dark:bg-purple-900/10 blur-[96px]'
						: 'w-[40%] h-[40%] bg-purple-500/5 dark:bg-purple-900/5 blur-[80px]'
				)}
			/>
		</div>
	);
}
