'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, CircleNotch, Sparkle } from '@phosphor-icons/react';
import { m } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { SmoothWords } from '@/components/Transition/SmoothText';
import { BackgroundMesh } from '@/components/ui/background-mesh';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/animation-presets';
import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';

const resetSchema = z.object({
	email: z.email('Invalid email address'),
});

type ResetValues = z.infer<typeof resetSchema>;

export function ForgotPasswordForm() {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isSubmitted, setIsSubmitted] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<ResetValues>({
		resolver: zodResolver(resetSchema),
	});

	const onSubmit = async (data: ResetValues) => {
		setIsLoading(true);
		setError(null);
		try {
			// @ts-expect-error - forgetPassword exists in better-auth but type inference fails here
			const { error: authError } = await authClient.forgetPassword({
				email: data.email,
				redirectTo: '/reset-password',
			});

			if (authError) {
				setError(authError.message || 'Failed to send reset link');
			} else {
				setIsSubmitted(true);
				toast.success('Password reset link sent to your email.');
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An unexpected error occurred');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
			<BackgroundMesh />

			<div className="w-full max-w-md p-4 relative z-10">
				<m.div
					initial={{ opacity: 0, scale: 0.9, y: 20 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					transition={{ type: 'spring', stiffness: 200, damping: 25 }}
					className="w-full premium-glass border-none rounded-[2.5rem] shadow-2xl overflow-hidden p-8"
				>
					<Link
						href="/sign-in"
						className="inline-flex items-center text-xs font-bold text-muted-foreground hover:text-foreground transition-colors mb-6 uppercase tracking-wider"
					>
						<ArrowLeft className="w-4 h-4 mr-2" /> Back to Sign In
					</Link>

					<m.div
						variants={STAGGER_CONTAINER}
						initial="hidden"
						animate="visible"
						className="text-center space-y-3 mb-8"
					>
						<m.div
							variants={STAGGER_ITEM}
							whileHover={{ rotate: 15, scale: 1.1 }}
							className="w-14 h-14 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-5 text-primary"
						>
							<Sparkle weight="bold" className="w-7 h-7" />
						</m.div>
						<SmoothWords
							as="h1"
							text="Reset Password"
							className="text-4xl font-black tracking-tight text-foreground"
						/>
						<m.p
							variants={STAGGER_ITEM}
							className="text-muted-foreground text-balance font-medium text-base"
						>
							{!isSubmitted
								? 'Enter your email address to receive a password reset link.'
								: 'Check your email for the reset link!'}
						</m.p>
					</m.div>

					{error && (
						<m.div
							initial={{ opacity: 0, x: -10 }}
							animate={{ opacity: 1, x: 0 }}
							className="p-4 mb-6 bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium rounded-2xl flex items-center gap-3"
						>
							<div className="w-2 h-2 rounded-full bg-destructive shrink-0" />
							<span className="flex-1">{error}</span>
						</m.div>
					)}

					{!isSubmitted ? (
						<m.form
							variants={STAGGER_CONTAINER}
							initial="hidden"
							animate="visible"
							onSubmit={handleSubmit(onSubmit)}
							className="space-y-6"
						>
							<m.div variants={STAGGER_ITEM} className="space-y-2">
								<Label
									htmlFor="email"
									className="text-xs font-bold text-label-primary uppercase tracking-wider ml-1"
								>
									Email Address
								</Label>
								<Input
									{...register('email')}
									id="email"
									type="email"
									placeholder="name@school.edu.za"
									className="bg-background/50"
								/>
								{errors.email && (
									<p className="text-xs text-destructive font-semibold ml-1">
										{errors.email.message}
									</p>
								)}
							</m.div>

							<m.div variants={STAGGER_ITEM}>
								<Button
									type="submit"
									disabled={isLoading}
									className={cn(
										'w-full h-14 rounded-2xl font-black text-base shadow-xl transition-all active:scale-[0.98]',
										'bg-primary text-primary-foreground shadow-primary/20'
									)}
								>
									{isLoading ? (
										<CircleNotch className="w-5 h-5 animate-spin" />
									) : (
										'Send Reset Link'
									)}
								</Button>
							</m.div>
						</m.form>
					) : (
						<m.div variants={STAGGER_ITEM} className="flex justify-center mt-6">
							<Button
								variant="outline"
								className="h-12 px-8 rounded-2xl font-bold border-border/60"
								onClick={() => setIsSubmitted(false)}
							>
								Try another email
							</Button>
						</m.div>
					)}
				</m.div>

				<m.p
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.5 }}
					className="text-center text-muted-foreground/60 text-[10px] font-bold uppercase tracking-widest mt-8"
				>
					&copy; {new Date().getFullYear()} MatricMaster
				</m.p>
			</div>
		</div>
	);
}
