'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Check, CircleNotch, Eye, EyeSlash, Sparkle } from '@phosphor-icons/react';
import { AnimatePresence, m } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { SocialAuthButton } from '@/components/auth/SocialAuthButton';
import { SmoothWords } from '@/components/Transition/SmoothText';
import { BackgroundMesh } from '@/components/ui/background-mesh';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/animation-presets';
import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';

const signInSchema = z.object({
	email: z.string().email('Invalid email address'),
	password: z.string().min(8, 'Password must be at least 8 characters'),
});

type SignInValues = z.infer<typeof signInSchema>;

export function SignInForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const rawCallbackUrl = searchParams.get('callbackUrl') || '/dashboard';

	// Validate callbackUrl to prevent open redirects
	let safeCallbackUrl = '/dashboard';
	if (rawCallbackUrl.startsWith('/') && !rawCallbackUrl.startsWith('//')) {
		safeCallbackUrl = rawCallbackUrl;
	} else {
		try {
			const url = new URL(rawCallbackUrl);
			if (url.origin === (typeof window !== 'undefined' ? window.location.origin : '')) {
				safeCallbackUrl = url.pathname + url.search;
			}
		} catch {
			safeCallbackUrl = '/dashboard';
		}
	}

	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [showPassword, setShowPassword] = useState(false);
	const [successEmail, setSuccessEmail] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<SignInValues>({
		resolver: zodResolver(signInSchema),
	});

	const initializeDatabase = async () => {
		try {
			console.log('🔄 Initializing database after login...');
			const response = await fetch('/api/db/init', {
				method: 'POST',
				headers: { 'Content-TextT': 'application/json' },
			});

			let result: { success?: boolean; message?: string };
			const contentType = response.headers.get('content-type');
			if (contentType?.includes('application/json')) {
				try {
					result = await response.json();
				} catch {
					// Failed to parse JSON, get text instead
					const text = await response.text();
					result = { success: false, message: text };
				}
			} else {
				const text = await response.text();
				result = { success: false, message: text };
			}

			if (response.ok && result.success) {
				console.log('✅ Database initialized after login');
			} else {
				console.warn(
					`⚠️ Database initialization failed: Status ${response.status}, Message: ${result.message ?? 'Unknown error'}`
				);
			}
		} catch (err) {
			console.error('❌ Error initializing database:', err);
		}
	};

	const onSubmit = async (data: SignInValues) => {
		setIsLoading(true);
		setError(null);
		try {
			const { error: authError } = await authClient.signIn.email({
				email: data.email,
				password: data.password,
			});

			if (authError) {
				setError(authError.message || 'Invalid email or password');
				setIsLoading(false);
			} else {
				// We don't await this to avoid blocking navigation if better-auth redirects
				initializeDatabase().catch(console.error);

				setSuccessEmail(data.email);
				// If better-auth doesn't redirect automatically (e.g. if it's purely client-side handle)
				// we still have our fallback navigation
				setTimeout(() => {
					router.push(safeCallbackUrl);
					router.refresh();
				}, 2000);
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An unexpected error occurred');
			setIsLoading(false);
		}
	};

	const handleSocialSignIn = async (provider: 'google' | 'twitter') => {
		const callbackURL = new URL(safeCallbackUrl, window.location.origin).toString();
		await authClient.signIn.social({
			provider,
			callbackURL,
		});
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
			<BackgroundMesh />

			{/* Success Toast */}
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
								<Check className="w-4 h-4 text-white" />
							</div>
							<span className="font-semibold text-sm">Welcome back, {successEmail}!</span>
						</div>
					</m.div>
				)}
			</AnimatePresence>

			<div className="w-full max-w-md p-4 relative z-10">
				<m.div
					initial={{ opacity: 0, scale: 0.9, y: 20 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					transition={{ type: 'spring', stiffness: 200, damping: 25 }}
					className="w-full premium-glass border-none rounded-[2.5rem] shadow-2xl overflow-hidden p-8"
				>
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
							text="Welcome Back"
							className="text-4xl font-black tracking-tight text-foreground"
						/>
						<m.p
							variants={STAGGER_ITEM}
							className="text-muted-foreground text-balance font-medium text-base"
						>
							Sign in to continue your Grade 12 journey.
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

						<m.div variants={STAGGER_ITEM} className="space-y-2">
							<div className="flex items-center justify-between">
								<Label
									htmlFor="password"
									className="text-xs font-bold text-label-primary uppercase tracking-wider ml-1"
								>
									Password
								</Label>
								<Link
									href="/forgot-password"
									className="text-xs font-bold text-primary hover:text-primary/80 uppercase tracking-wider"
								>
									Forgot?
								</Link>
							</div>
							<div className="relative">
								<Input
									{...register('password')}
									id="password"
									type={showPassword ? 'text' : 'password'}
									placeholder="Enter your password"
									className="bg-background/50 pr-12"
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
									aria-label={showPassword ? 'Hide password' : 'Show password'}
								>
									{showPassword ? <EyeSlash className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
								</button>
							</div>
							{errors.password && (
								<p className="text-xs text-destructive font-semibold ml-1">
									{errors.password.message}
								</p>
							)}
						</m.div>

						<m.div variants={STAGGER_ITEM}>
							<Button
								type="submit"
								disabled={isLoading || !!successEmail}
								className={cn(
									'w-full h-14 rounded-2xl font-black text-base shadow-xl transition-all active:scale-[0.98]',
									successEmail
										? 'bg-success text-white shadow-success/30'
										: 'bg-primary text-primary-foreground shadow-primary/20'
								)}
							>
								{isLoading ? (
									<CircleNotch className="w-5 h-5 animate-spin" />
								) : successEmail ? (
									'Success!'
								) : (
									'Sign In'
								)}
							</Button>
						</m.div>
					</m.form>

					<m.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 1 }}
						className="relative my-8"
					>
						<div className="absolute inset-0 flex items-center">
							<div className="w-full border-t border-border/60" />
						</div>
						<div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em]">
							<span className="px-4 text-muted-foreground font-black bg-card/80 backdrop-blur-xl rounded-full">
								Or
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
							<SocialAuthButton provider="google" onClick={() => handleSocialSignIn('google')} />
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
						Don't have an account?{' '}
						<Link
							href="/sign-up"
							className="font-black text-primary hover:text-primary/80 underline-offset-4 transition-colors"
						>
							Sign Up
						</Link>
					</m.p>
				</m.div>

				{/* Footer simple copyright or branding */}
				<m.p
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 1.5 }}
					className="text-center text-muted-foreground/60 text-[10px] font-bold uppercase tracking-widest mt-8"
				>
					&copy; {new Date().getFullYear()} MatricMaster AI
				</m.p>
			</div>
		</div>
	);
}
