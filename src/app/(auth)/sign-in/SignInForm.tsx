/** biome-ignore-all lint/a11y/noSvgWithoutTitle: no need */
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Eye, EyeOff, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { SocialAuthButton } from '@/components/auth/SocialAuthButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
				headers: { 'Content-Type': 'application/json' },
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
		<div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950 relative overflow-hidden">
			{/* Animated Background Mesh */}
			<div className="absolute inset-0 pointer-events-none overflow-hidden">
				<div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/20 dark:bg-blue-900/20 rounded-full blur-[128px] animate-pulse-slow" />
				<div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/20 dark:bg-purple-900/20 rounded-full blur-[128px] animate-pulse-slow delay-1000" />
			</div>

			{/* Success Toast */}
			<AnimatePresence>
				{successEmail && (
					<motion.div
						initial={{ y: -100, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						exit={{ y: -100, opacity: 0 }}
						transition={{ type: 'spring', stiffness: 300, damping: 30 }}
						className="fixed top-6 left-0 right-0 z-50 flex justify-center pointer-events-none"
					>
						<div className="bg-emerald-500 text-white px-6 py-3 rounded-full shadow-lg shadow-emerald-500/30 flex items-center gap-3 pointer-events-auto backdrop-blur-md">
							<div className="bg-white/20 p-1 rounded-full">
								<Check className="w-4 h-4 text-white" />
							</div>
							<span className="font-medium text-sm">Welcome back, {successEmail}!</span>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			<div className="w-full max-w-md p-4 relative z-10">
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.5, ease: 'easeOut' }}
					className="w-full bg-white/80 dark:bg-zinc-900/60 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden p-8"
				>
					<div className="text-center space-y-2 mb-8">
						<div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600 dark:text-blue-400">
							<Sparkles className="w-6 h-6" />
						</div>
						<h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
							Welcome Back
						</h1>
						<p className="text-zinc-500 dark:text-zinc-400 text-balance">
							Sign in to continue your Grade 12 journey.
						</p>
					</div>

					{error && (
						<motion.div
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							className="p-4 mb-6 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm font-medium rounded-xl flex items-center gap-2"
						>
							<div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
							{error}
						</motion.div>
					)}

					<form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
						<div className="space-y-2">
							<label
								htmlFor="email"
								className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 ml-1"
							>
								Email Address
							</label>
							<Input
								{...register('email')}
								type="email"
								placeholder="name@school.edu.za"
								className="h-12 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
							/>
							{errors.email && (
								<p className="text-xs text-red-500 font-medium ml-1">{errors.email.message}</p>
							)}
						</div>

						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<label
									htmlFor="password"
									className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 ml-1"
								>
									Password
								</label>
								<Link
									href="/forgot-password"
									className="text-xs font-medium text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
								>
									Forgot password?
								</Link>
							</div>
							<div className="relative">
								<Input
									{...register('password')}
									type={showPassword ? 'text' : 'password'}
									placeholder="Enter your password"
									className="h-12 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium pr-12"
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
								>
									{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
								</button>
							</div>
							{errors.password && (
								<p className="text-xs text-red-500 font-medium ml-1">{errors.password.message}</p>
							)}
						</div>

						<Button
							type="submit"
							disabled={isLoading || !!successEmail}
							className={cn(
								'w-full h-12 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]',
								successEmail
									? 'bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600'
									: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 text-white'
							)}
						>
							{isLoading ? (
								<Loader2 className="w-5 h-5 animate-spin" />
							) : successEmail ? (
								'Success!'
							) : (
								'Sign In'
							)}
						</Button>
					</form>

					<div className="relative my-8">
						<div className="absolute inset-0 flex items-center">
							<div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
						</div>
						<div className="relative flex justify-center text-xs uppercase tracking-widest">
							<span className="px-4 text-zinc-400 font-bold backdrop-blur-xl bg-white/80 dark:bg-zinc-900/80 rounded-full">
								Or continue with
							</span>
						</div>
					</div>

					<div className="flex flex-col gap-3">
						<SocialAuthButton provider="google" onClick={() => handleSocialSignIn('google')} />
						<SocialAuthButton provider="twitter" onClick={() => handleSocialSignIn('twitter')} />
					</div>

					<p className="text-center text-zinc-500 dark:text-zinc-400 mt-8 text-sm">
						Don't have an account?{' '}
						<Link
							href="/sign-up"
							className="font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
						>
							Sign Up
						</Link>
					</p>
				</motion.div>

				{/* Footer simple copyright or branding */}
				<p className="text-center text-zinc-400 dark:text-zinc-600 text-xs mt-8">
					&copy; {new Date().getFullYear()} MatricMaster AI. All rights reserved.
				</p>
			</div>
		</div>
	);
}
