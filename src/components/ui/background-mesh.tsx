import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BackgroundMeshProps {
	className?: string;
	variant?: 'default' | 'subtle';
}

export function BackgroundMesh({ className, variant = 'default' }: BackgroundMeshProps) {
	return (
		<div className={cn('absolute inset-0 pointer-events-none overflow-hidden', className)}>
			<motion.div
				initial={{ x: -20, y: -20, opacity: 0 }}
				animate={{
					x: [0, 20, -10, 0],
					y: [0, -30, 20, 0],
					opacity: 1,
				}}
				transition={{
					duration: 20,
					repeat: Number.POSITIVE_INFINITY,
					ease: 'linear',
					opacity: { duration: 2 },
				}}
				className={cn(
					'absolute top-[-20%] left-[-10%] rounded-full blur-[96px]',
					variant === 'default' ? 'w-[50%] h-[50%] bg-primary/10' : 'w-[40%] h-[40%] bg-primary/5'
				)}
			/>
			<motion.div
				initial={{ x: 20, y: 20, opacity: 0 }}
				animate={{
					x: [0, -30, 15, 0],
					y: [0, 25, -20, 0],
					opacity: 1,
				}}
				transition={{
					duration: 25,
					repeat: Number.POSITIVE_INFINITY,
					ease: 'linear',
					opacity: { duration: 2 },
				}}
				className={cn(
					'absolute bottom-[-20%] right-[-10%] rounded-full blur-[96px]',
					variant === 'default'
						? 'w-[50%] h-[50%] bg-brand-purple/10'
						: 'w-[40%] h-[40%] bg-brand-purple/5'
				)}
			/>
		</div>
	);
}
