import { motion } from 'framer-motion';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export function AccountScreen({ onContinue }: { onContinue: () => void }) {
	return (
		<motion.div
			initial={{ opacity: 0, x: 50 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -50 }}
			className="w-full space-y-8 text-center"
		>
			<div className="space-y-2">
				<h2 className="text-3xl font-bold tracking-tight">Save your plan and start climbing.</h2>
				<p className="text-muted-foreground">
					Create a free account to unlock your personalized roadmap and track your progress.
				</p>
			</div>

			<div className="grid gap-3 w-full max-w-sm mx-auto">
				<Button variant="outline" className="h-12 gap-3" onClick={onContinue}>
					<div className="w-4 h-4 relative">
						<Image
							src="https://www.google.com/favicon.ico"
							fill
							alt="Google"
							className="object-contain"
						/>
					</div>
					Continue with Google
				</Button>
				<Button variant="outline" className="h-12 gap-3" onClick={onContinue}>
					<div className="w-4 h-4 relative">
						<Image
							src="https://www.apple.com/favicon.ico"
							fill
							alt="Apple"
							className="object-contain"
						/>
					</div>
					Continue with Apple
				</Button>
				<div className="relative py-4">
					<div className="absolute inset-0 flex items-center">
						<span className="w-full border-t border-border" />
					</div>
					<div className="relative flex justify-center text-xs uppercase">
						<span className="bg-background px-2 text-muted-foreground">Or use email</span>
					</div>
				</div>
				<Button variant="outline" className="h-12" onClick={onContinue}>
					Continue with Email
				</Button>
			</div>

			<button
				type="button"
				className="text-sm text-muted-foreground hover:text-foreground transition-colors"
				onClick={onContinue}
			>
				Already have an account? <span className="font-semibold underline">Log in</span>
			</button>
		</motion.div>
	);
}

export function PaywallScreen({ onComplete }: { onComplete: () => void }) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -20 }}
			className="w-full space-y-8 text-center"
		>
			<div className="space-y-4">
				<div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
					Limited Time Offer
				</div>
				<h2 className="text-3xl font-bold tracking-tight">Unlock the full power of Lumni AI.</h2>
				<p className="text-muted-foreground">
					Get the personal tutor that ensures you never stay stuck on a question again.
				</p>
			</div>

			<div className="grid gap-6 w-full max-w-md mx-auto">
				<div className="p-6 rounded-3xl bg-card border-2 border-primary shadow-xl relative space-y-6 text-left">
					<div className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
						RECOMMENDED
					</div>

					<div className="space-y-1">
						<div className="text-2xl font-bold">Lumni Premium</div>
						<div className="text-muted-foreground text-sm">
							Unlimited AI tutoring and deep analytics.
						</div>
					</div>

					<ul className="space-y-3">
						{[
							'Unlimited AI Tutor explanations',
							'Advanced Gap Analysis & Analytics',
							'Priority access to new past papers',
							'Ad-free learning experience',
							'Customizable goal tracking',
						].map((feature, i) => (
							<li key={i} className="flex gap-3 items-center text-sm text-foreground">
								<span className="text-primary">✓</span> {feature}
							</li>
						))}
					</ul>

					<div className="pt-4 border-t border-border space-y-4">
						<div className="flex justify-between items-end">
							<span className="text-sm text-muted-foreground">Annual Plan</span>
							<span className="text-3xl font-bold">
								R 199<span className="text-sm font-normal text-muted-foreground">/yr</span>
							</span>
						</div>
						<Button
							size="lg"
							className="w-full h-14 text-lg shadow-lg shadow-primary/20"
							onClick={onComplete}
						>
							Start your 7-day FREE trial
						</Button>
					</div>
				</div>

				<div className="p-6 rounded-3xl bg-card border border-border space-y-6 text-left opacity-80">
					<div className="space-y-1">
						<div className="text-xl font-bold">Free Version</div>
						<div className="text-muted-foreground text-sm">Perfect for getting started.</div>
					</div>
					<ul className="space-y-3">
						{[
							'3 AI explanations per day',
							'Basic study plan generator',
							'Access to public past papers',
						].map((feature, i) => (
							<li key={i} className="flex gap-3 items-center text-sm text-foreground">
								<span className="text-muted-foreground">✓</span> {feature}
							</li>
						))}
					</ul>
					<Button variant="outline" className="w-full h-12" onClick={onComplete}>
						Continue with Free
					</Button>
				</div>
			</div>

			<button
				type="button"
				className="text-sm text-muted-foreground hover:text-foreground transition-colors"
			>
				Restore Purchases
			</button>
		</motion.div>
	);
}
