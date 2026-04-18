'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useWelcomeBack } from '@/stores/useOnboardingStore';

export function WelcomeBackDialog() {
	const { shouldShowWelcomeBack, markWelcomeBackSeen, updateLastVisit } = useWelcomeBack();
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		if (shouldShowWelcomeBack) {
			setIsOpen(true);
		}
	}, [shouldShowWelcomeBack]);

	const handleClose = () => {
		setIsOpen(false);
		markWelcomeBackSeen();
		updateLastVisit();
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
					role="dialog"
					aria-modal="true"
					aria-labelledby="welcome-back-title"
				>
					<motion.div
						initial={{ scale: 0.9, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						exit={{ scale: 0.9, opacity: 0 }}
						className="mx-4 max-w-md rounded-2xl bg-card p-6 shadow-xl"
					>
						<div className="mb-4 text-center">
							<div className="mb-4 text-4xl">Welcome Back!</div>
							<h2 id="welcome-back-title" className="text-xl font-semibold text-foreground">
								We missed you at Lumni
							</h2>
						</div>

						<p className="mb-6 text-center text-muted-foreground">
							Your study progress is saved and ready to continue. Let's pick up where you left off!
						</p>

						<div className="space-y-3">
							<Button onClick={handleClose} className="w-full" size="lg">
								Continue Learning
							</Button>

							<Button onClick={handleClose} variant="ghost" className="w-full">
								View My Progress
							</Button>
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
