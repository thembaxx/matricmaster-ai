import { m } from 'framer-motion';
import Image from 'next/image';
import { SmoothWords } from '@/components/Transition/SmoothText';
import { Card } from '@/components/ui/card';
import { STAGGER_CONTAINER } from '@/lib/animation-presets';
import type { SessionUser } from '@/lib/auth';
import { cn } from '@/lib/utils';

interface OnboardingStepContentProps {
	step: {
		id: number;
		title: string;
		description: string;
		image: string;
		color: string;
		icon: unknown;
	};
	currentStep: number;
	user?: SessionUser | null;
}

export function OnboardingStepContent({ step, currentStep, user }: OnboardingStepContentProps) {
	return (
		<m.div drag="x" dragConstraints={{ left: 0, right: 0 }} className="w-full max-w-md">
			<Card className="premium-glass border-none shadow-2xl overflow-hidden rounded-[2.5rem] p-8 flex flex-col items-center text-center gap-8">
				<m.div
					variants={STAGGER_CONTAINER}
					initial="hidden"
					animate="visible"
					className="relative w-full aspect-square max-h-64 flex items-center justify-center"
				>
					<m.div
						animate={{
							scale: [1, 1.1, 1],
							rotate: [0, 10, 0],
						}}
						transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
						className={cn(
							'absolute inset-0 bg-gradient-to-br opacity-20 blur-3xl rounded-full',
							step.color
						)}
					/>

					<div className="rounded-2xl overflow-hidden">
						<Image
							src={step.image}
							alt={step.title}
							width={256}
							height={256}
							className="relative z-10 w-full h-full object-contain drop-shadow-2xl"
							priority={currentStep === 0}
							unoptimized
						/>
					</div>
				</m.div>

				<div className="space-y-4">
					<SmoothWords
						as="h1"
						text={
							currentStep === 0 && user?.name ? `Welcome, ${user.name.split(' ')[0]}!` : step.title
						}
						className="text-2xl font-bold text-foreground text-pretty"
					/>
					<m.p
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
						className="text-muted-foreground font-medium text-base leading-relaxed px-2 text-pretty"
					>
						{step.description}
					</m.p>
				</div>
			</Card>
		</m.div>
	);
}
