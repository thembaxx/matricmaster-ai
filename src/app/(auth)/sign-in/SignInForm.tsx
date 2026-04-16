'use client';

import { AnimatePresence, m } from 'framer-motion';
import Link from 'next/link';
import { Suspense } from 'react';
import { appConfig } from '@/app.config';
import { SocialAuthButton } from '@/components/auth/SocialAuthButton';
import { SafeImage } from '@/components/SafeImage';
import { SmoothWords } from '@/components/Transition/SmoothText';
import { BackgroundMesh } from '@/components/ui/background-mesh';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useSignIn } from '@/hooks/useSignIn';
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/animation-presets';
import { FormFields } from './FormFields';

function SignInFormContent() {
	const {
		form,
		isLoading,
		error,
		showPassword,
		setShowPassword,
		successEmail,
		onSubmit,
		handleSocialSignIn,
	} = useSignIn();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = form;

	return (
		<div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
			<BackgroundMesh />

			<AnimatePresence>
				{successEmail && (
					<m.div
						initial={{ y: -100, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						exit={{ y: -100, opacity: 0 }}
						transition={{ type: 'spring', stiffness: 300, damping: 30 }}
						className="fixed top-6 left-0 right-0 z-50 flex justify-center pointer-events-none"
					>
						<div className="bg-success/90 text-white px-6 py-3 rounded-full shadow-lg shadow-success/30 flex items-center gap-3 pointer-events-auto backdrop-blur-md">
							<div className="bg-white/20 p-1 rounded-full">
								<SafeImage
									src="/logo.png"
									alt="Success"
									width={36}
									height={36}
									className="size-10"
								/>
							</div>
							<span className="font-semibold text-sm">welcome back, {successEmail}!</span>
						</div>
					</m.div>
				)}
			</AnimatePresence>

			<div className="w-full max-w-md p-4 relative z-10">
				<m.div
					initial={{ opacity: 0, scale: 0.9, y: 20 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					transition={{ type: 'spring', stiffness: 200, damping: 25 }}
					className="w-full tiimo-glass border-none rounded-[var(--radius-2xl)] shadow-soft-lg overflow-hidden p-8"
				>
					<m.div
						variants={STAGGER_CONTAINER}
						initial="hidden"
						animate="visible"
						className="text-center gap-3 mb-8"
					>
						<m.div
							variants={STAGGER_ITEM}
							whileHover={{ rotate: 15, scale: 1.1 }}
							className="w-14 h-14 bg-primary/10 rounded-[var(--radius-xl)] flex items-center justify-center mx-auto mb-5 text-primary"
						>
							<SafeImage src="/logo.png" alt="Success" width={36} height={36} className="size-10" />
						</m.div>
						<SmoothWords
							as="h1"
							text="welcome back"
							className="text-4xl font-black tracking-tight text-foreground"
						/>
						<m.p
							variants={STAGGER_ITEM}
							className="text-muted-foreground text-balance font-medium text-base"
						>
							Sign in to continue your matric prep.
						</m.p>
					</m.div>

					{error && (
						<m.div
							initial={{ opacity: 0, x: -10 }}
							animate={{ opacity: 1, x: 0 }}
							className="p-4 mb-6 bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium rounded-[var(--radius-lg)] flex items-center gap-3"
						>
							<div className="w-2 h-2 rounded-full bg-destructive shrink-0" />
							<span className="flex-1">{error}</span>
						</m.div>
					)}

					<m.form
						variants={STAGGER_CONTAINER}
						initial="hidden"
						animate="visible"
						onSubmit={handleSubmit(onSubmit)}
						className="flex flex-col gap-6"
					>
						<FormFields
							register={register}
							errors={errors}
							isLoading={isLoading}
							successEmail={successEmail}
							showPassword={showPassword}
							onTogglePassword={() => setShowPassword(!showPassword)}
						/>
					</m.form>

					<m.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 1 }}
						className="relative my-8"
					>
						<div className="absolute inset-0 flex items-center">
							<Separator />
						</div>
						<div className="relative flex justify-center">
							<span className="px-4 text-[10px] tracking-[0.2em] text-muted-foreground font-black bg-card/80 backdrop-blur-xl rounded-full">
								or
							</span>
						</div>
					</m.div>

					<m.div
						variants={STAGGER_CONTAINER}
						initial="hidden"
						animate="visible"
						className="flex flex-col gap-3"
					>
						<m.div variants={STAGGER_ITEM}>
							<SocialAuthButton
								provider="google"
								isLoading={isLoading}
								onClick={() => handleSocialSignIn('google')}
							/>
						</m.div>
						<m.div variants={STAGGER_ITEM}>
							<SocialAuthButton provider="twitter" onClick={() => handleSocialSignIn('twitter')} />
						</m.div>
					</m.div>

					<m.p
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 1.2 }}
						className="text-center text-muted-foreground mt-8 text-sm font-semibold"
					>
						don't have an account?{' '}
						<Link
							href="/sign-up"
							className="font-bold text-primary hover:text-primary/80 underline-offset-4 transition-colors"
						>
							Sign up
						</Link>
					</m.p>
				</m.div>

				<m.p
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 1.5 }}
					className="text-center text-muted-foreground/60 text-[10px] font-bold tracking-widest mt-8"
				>
					&copy; {new Date().getFullYear()} {appConfig.name}
				</m.p>
			</div>
		</div>
	);
}

function SignInFormSkeleton() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
			<BackgroundMesh />
			<div className="w-full max-w-md p-4 relative z-10">
				<div className="w-full tiimo-glass border-none rounded-[var(--radius-2xl)] shadow-soft-lg overflow-hidden p-8 flex flex-col gap-6">
					<div className="text-center gap-3">
						<Skeleton className="w-14 h-14 rounded-[var(--radius-xl)] mx-auto" />
						<Skeleton className="h-8 w-1/2 mx-auto" />
						<Skeleton className="h-4 w-3/4 mx-auto" />
					</div>
					<div className="flex flex-col gap-4">
						<Skeleton className="h-12 w-full" />
						<Skeleton className="h-12 w-full" />
					</div>
				</div>
			</div>
		</div>
	);
}

export function SignInForm() {
	return (
		<Suspense fallback={<SignInFormSkeleton />}>
			<SignInFormContent />
		</Suspense>
	);
}
