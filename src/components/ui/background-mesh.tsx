import { m } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BackgroundMeshProps {
	className?: string;
	variant?: 'default' | 'subtle';
}

export function BackgroundMesh({ className, variant = 'default' }: BackgroundMeshProps) {
	return (
		<div className={cn('absolute inset-0 pointer-events-none overflow-hidden -z-10', className)}>
			<m.div
				initial={{ x: -20, y: -20, opacity: 0 }}
				animate={{
					x: [0, 30, -20, 0],
					y: [0, -40, 30, 0],
					opacity: 1,
				}}
				transition={{
					duration: 25,
					repeat: Number.POSITIVE_INFINITY,
					ease: 'easeInOut',
					opacity: { duration: 2 },
				}}
				className={cn(
					'absolute top-[-25%] left-[-15%] rounded-full blur-[120px]',
					variant === 'default' ? 'w-[70%] h-[70%] bg-primary/15' : 'w-[50%] h-[50%] bg-primary/10'
				)}
			/>
			<m.div
				initial={{ x: 20, y: 20, opacity: 0 }}
				animate={{
					x: [0, -40, 20, 0],
					y: [0, 30, -30, 0],
					opacity: 1,
				}}
				transition={{
					duration: 30,
					repeat: Number.POSITIVE_INFINITY,
					ease: 'easeInOut',
					opacity: { duration: 2 },
				}}
				className={cn(
					'absolute bottom-[-25%] right-[-15%] rounded-full blur-[120px]',
					variant === 'default'
						? 'w-[70%] h-[70%] bg-brand-purple/15'
						: 'w-[50%] h-[50%] bg-brand-purple/10'
				)}
			/>
			<m.div
				animate={{
					scale: [1, 1.2, 0.9, 1],
					opacity: [0.1, 0.2, 0.1, 0.15],
				}}
				transition={{
					duration: 20,
					repeat: Number.POSITIVE_INFINITY,
					ease: 'easeInOut',
				}}
				className="absolute top-[30%] left-[20%] w-[30%] h-[30%] bg-brand-blue/10 rounded-full blur-[100px]"
			/>
		</div>
	);
}
