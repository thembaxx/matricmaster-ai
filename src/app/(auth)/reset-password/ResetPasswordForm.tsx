'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
	ArrowLeft02Icon,
	CheckmarkCircle02Icon,
	Loading03Icon,
	LockPasswordIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { appConfig } from '@/app.config';
import { SmoothWords } from '@/components/Transition/SmoothText';
import { BackgroundMesh } from '@/components/ui/background-mesh';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/animation-presets';
import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';

const resetPasswordSchema = z
	.object({
		password: z.string().min(8, 'Password must be at least 8 characters'),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword'],
	});

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

function ResetPasswordFormContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get('token');
	const passwordId = useId();
	const confirmPasswordId = useId();

	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isSuccess, setIsSuccess] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<ResetPasswordValues>({
		resolver: zodResolver(resetPasswordSchema),
	});

	const onSubmit = async (data: ResetPasswordValues) => {
		if (!token) {
			setError('Invalid or missing reset token. Please request a new password reset link.');
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			const { error: authError } = await authClient.resetPassword({
				newPassword: data.password,
				token,
			});

			if (authError) {
				setError(authError.message || 'Failed to reset password');
			} else {
				setIsSuccess(true);
				toast.success('Password reset successfully!');
				setTimeout(() => {
					router.push('/login');
				}, 2000);
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
					className="w-full premium-glass border-none rounded-[2.5rem] shadow-soft-lg overflow-hidden p-8"
				>
					<Link
						href="/login"
						className="inline-flex items-center text-xs font-bold text-muted-foreground hover:text-foreground transition-colors mb-6 tracking-wider"
					>
						<HugeiconsIcon icon={ArrowLeft02Icon} className="w-4 h-4 mr-2" /> Back to Sign in
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
							<HugeiconsIcon icon={LockPasswordIcon} className="w-7 h-7" />
						</m.div>
						<SmoothWords
							as="h1"
							text="new password"
							className="text-4xl font-black tracking-tight text-foreground"
						/>
						<m.p
							variants={STAGGER_ITEM}
							className="text-muted-foreground text-balance font-medium text-base"
						>
							{!isSuccess
								? 'Enter your new password below.'
								: 'Your password has been reset successfully!'}
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

					{isSuccess ? (
						<m.div
							variants={STAGGER_CONTAINER}
							initial="hidden"
							animate="visible"
							className="text-center space-y-6"
						>
							<m.div
								variants={STAGGER_ITEM}
								className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto"
							>
								<HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-8 h-8 text-green-500" />
							</m.div>
							<m.div variants={STAGGER_ITEM}>
								<Button
									onClick={() => router.push('/login')}
									className={cn(
										'w-full h-14 rounded-2xl font-black text-base shadow-xl transition-all active:scale-[0.98]',
										'bg-primary text-primary-foreground shadow-primary/20'
									)}
								>
									Go to Sign in
								</Button>
							</m.div>
						</m.div>
					) : (
						<m.form
							variants={STAGGER_CONTAINER}
							initial="hidden"
							animate="visible"
							onSubmit={handleSubmit(onSubmit)}
							className="space-y-6"
						>
							<m.div variants={STAGGER_ITEM} className="space-y-2">
								<Label
									htmlFor={passwordId}
									className="text-xs font-bold text-label-primary tracking-wider ml-1"
								>
									new password
								</Label>
								<Input
									{...register('password')}
									id={passwordId}
									type="password"
									placeholder="Enter new password"
									className="bg-background/50"
								/>
								{errors.password && (
									<p className="text-xs text-destructive font-semibold ml-1">
										{errors.password.message}
									</p>
								)}
							</m.div>

							<m.div variants={STAGGER_ITEM} className="space-y-2">
								<Label
									htmlFor={confirmPasswordId}
									className="text-xs font-bold text-label-primary tracking-wider ml-1"
								>
									Confirm Password
								</Label>
								<Input
									{...register('confirmPassword')}
									id={confirmPasswordId}
									type="password"
									placeholder="Confirm new password"
									className="bg-background/50"
								/>
								{errors.confirmPassword && (
									<p className="text-xs text-destructive font-semibold ml-1">
										{errors.confirmPassword.message}
									</p>
								)}
							</m.div>

							<m.div variants={STAGGER_ITEM}>
								<Button
									type="submit"
									disabled={isLoading || !token}
									className={cn(
										'w-full h-14 rounded-2xl font-black text-base shadow-xl transition-all active:scale-[0.98]',
										'bg-primary text-primary-foreground shadow-primary/20'
									)}
								>
									{isLoading ? (
										<HugeiconsIcon icon={Loading03Icon} className="w-5 h-5 animate-spin" />
									) : (
										<span className="flex items-center justify-center gap-2">
											<HugeiconsIcon icon={LockPasswordIcon} className="w-5 h-5" />
											reset password
										</span>
									)}
								</Button>
							</m.div>
						</m.form>
					)}
				</m.div>

				<m.p
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.5 }}
					className="text-center text-muted-foreground/60 text-[10px] font-bold tracking-widest mt-8"
				>
					&copy; {new Date().getFullYear()} {appConfig.name} AI
				</m.p>
			</div>
		</div>
	);
}

export function ResetPasswordForm() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen flex items-center justify-center bg-background">
					<BackgroundMesh />
					<div className="w-full max-w-md p-4 relative z-10">
						<div className="w-full premium-glass border-none rounded-[2.5rem] shadow-soft-lg overflow-hidden p-8 flex items-center justify-center min-h-[400px]">
							<HugeiconsIcon icon={Loading03Icon} className="w-8 h-8 animate-spin text-primary" />
						</div>
					</div>
				</div>
			}
		>
			<ResetPasswordFormContent />
		</Suspense>
	);
}
