'use client';

import { motion } from 'framer-motion';

export default function Loading() {
	return (
		<div className="flex items-center justify-center min-h-screen bg-background">
			<div className="flex flex-col items-center gap-8">
				<div className="relative">
					<motion.div
						animate={{
							scale: [1, 1.2, 1],
							rotate: [0, 180, 360],
							borderRadius: ['20%', '50%', '20%'],
						}}
						transition={{
							duration: 3,
							repeat: Number.POSITIVE_INFINITY,
							ease: 'easeInOut',
						}}
						className="w-16 h-16 bg-primary shadow-2xl shadow-primary/40"
					/>
					<motion.div
						animate={{
							scale: [1.2, 1, 1.2],
							rotate: [360, 180, 0],
							borderRadius: ['50%', '20%', '50%'],
						}}
						transition={{
							duration: 3,
							repeat: Number.POSITIVE_INFINITY,
							ease: 'easeInOut',
						}}
						className="w-16 h-16 bg-primary/20 absolute inset-0 blur-xl"
					/>
				</div>
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.5, delay: 0.2 }}
					className="flex flex-col items-center gap-2"
				>
					<p className="text-sm font-black uppercase tracking-[0.2em] text-foreground">
						MatricMaster
					</p>
					<div className="flex gap-1">
						{[0, 1, 2].map((i) => (
							<motion.div
								key={i}
								animate={{
									opacity: [0.3, 1, 0.3],
									scale: [1, 1.5, 1],
								}}
								transition={{
									duration: 1,
									repeat: Number.POSITIVE_INFINITY,
									delay: i * 0.2,
								}}
								className="w-1 h-1 rounded-full bg-primary"
							/>
						))}
					</div>
				</motion.div>
			</div>
		</div>
	);
}
