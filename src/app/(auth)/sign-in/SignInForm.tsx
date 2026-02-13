/** biome-ignore-all lint/a11y/noSvgWithoutTitle: no need */
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth-client';

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
		<div className="min-h-screen flex flex-col bg-slate-50 dark:bg-zinc-950 relative overflow-hidden">
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
						<div className="bg-blue-500 text-white px-6 py-3 rounded-full shadow-lg shadow-blue-500/30 flex items-center gap-3 pointer-events-auto">
							<div className="bg-white/20 p-1 rounded-full">
								<Check className="w-4 h-4 text-white" />
							</div>
							<span className="font-medium text-sm">Signed in as {successEmail}</span>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			<div className="relative w-full h-64 overflow-hidden shrink-0">
				<div className="absolute inset-0 bg-background dark:block hidden opacity-90" />
				<div
					className="absolute inset-0 dark:block hidden"
					style={{
						background:
							'linear-gradient(180deg, rgba(24, 24, 27, 0.8) 0%, rgba(9, 9, 11, 0.9) 50%, rgba(0, 0, 0, 1) 100%)',
					}}
				/>

				<div
					className="absolute top-16 left-8 w-8 h-8 rotate-45 rounded-sm shadow-lg"
					style={{ backgroundColor: '#f472b6' }}
				/>
				<div
					className="absolute top-12 right-12 w-7 h-7 rotate-12 rounded-md shadow-lg"
					style={{ backgroundColor: '#fbbf24' }}
				/>
				<div
					className="absolute bottom-8 left-12 w-14 h-14 rounded-full shadow-xl"
					style={{
						background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
					}}
				/>

				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
					<div
						className="relative w-40 h-32 rounded-xl shadow-2xl"
						style={{ backgroundColor: '#f8fafc' }}
					>
						<div
							className="absolute left-0 top-0 bottom-0 w-4 rounded-l-xl"
							style={{ backgroundColor: '#e2e8f0' }}
						/>
						<div className="absolute top-6 left-8 right-4 space-y-2">
							<div className="h-1.5 rounded bg-slate-200 w-3/4" />
							<div className="h-1.5 rounded bg-slate-200 w-full" />
							<div className="h-1.5 rounded bg-slate-200 w-2/3" />
							<div className="h-1.5 rounded bg-slate-200 w-4/5" />
						</div>
					</div>
				</div>
			</div>

			<div className="p-4 w-full flex grow items-start justify-center">
				<div className="w-full max-w-sm px-6 py-8 -mt-4 bg-card rounded-3xl relative z-10 shadow-xl dark:shadow-zinc-950/50">
					<div className="space-y-6">
						<div className="text-center space-y-2">
							<h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Welcome Back</h1>
							<p className="text-zinc-500 dark:text-zinc-400">Empowering your Grade 12 journey.</p>
						</div>

						{error && (
							<div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium rounded-xl">
								{error}
							</div>
						)}

						<form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
							<div className="space-y-2">
								<label
									htmlFor="email"
									className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
								>
									Email Address
								</label>
								<Input
									{...register('email')}
									type="email"
									placeholder="name@school.edu.za"
									className="shadow-none flex w-full rounded-xl text-[#111318] dark:text-white border border-[#dbdfe6] dark:border-gray-700 bg-white dark:bg-gray-800/50 focus:border-primary focus:ring-2 focus:ring-primary/20 h-14 px-4 text-base font-normal placeholder:text-[#9ca3af]"
								/>
								{errors.email && (
									<p className="text-xs text-red-500 font-medium">{errors.email.message}</p>
								)}
							</div>

							<div className="space-y-2">
								<label
									htmlFor="password"
									className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
								>
									Password
								</label>
								<div className="relative">
									<Input
										{...register('password')}
										type={showPassword ? 'text' : 'password'}
										placeholder="Enter your password"
										className="shadow-none flex w-full rounded-xl text-[#111318] dark:text-white border border-[#dbdfe6] dark:border-gray-700 bg-white dark:bg-gray-800/50 focus:border-primary focus:ring-2 focus:ring-primary/20 h-14 px-4 text-base font-normal placeholder:text-[#9ca3af] pr-12"
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
									<p className="text-xs text-red-500 font-medium">{errors.password.message}</p>
								)}
							</div>

							<div className="text-right">
								<Link
									href="/forgot-password"
									className="text-sm font-medium text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
								>
									Forgot password?
								</Link>
							</div>

							<Button
								type="submit"
								disabled={isLoading || !!successEmail}
								className="w-full h-14 rounded-xl bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98]"
							>
								{isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Sign In'}
							</Button>
						</form>

						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<div className="w-full border-t border-zinc-200 dark:border-zinc-700" />
							</div>
							<div className="relative flex justify-center text-sm">
								<span className="bg-card px-4 text-zinc-500 dark:text-zinc-400">
									or continue with
								</span>
							</div>
						</div>

						<div className="flex flex-col gap-3">
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => handleSocialSignIn('google')}
								className="h-12 rounded-xl border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 font-medium gap-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-all active:scale-[0.98] text-zinc-700 dark:text-zinc-300"
							>
								<svg className="w-5 h-5" viewBox="0 0 24 24">
									<path
										fill="#4285F4"
										d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
									/>
									<path
										fill="#34A853"
										d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
									/>
									<path
										fill="#FBBC05"
										d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
									/>
									<path
										fill="#EA4335"
										d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
									/>
								</svg>
								Google
							</Button>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => handleSocialSignIn('twitter')}
								className="h-12 rounded-xl border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 font-medium gap-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-all active:scale-[0.98] text-zinc-700 dark:text-zinc-300"
							>
								<svg className="w-5 h-5" viewBox="0 0 24 24">
									<path
										fill="#1DA1F2"
										d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"
									/>
								</svg>
								Twitter
							</Button>
						</div>

						<p className="text-center text-zinc-600 dark:text-zinc-400">
							Don't have an account?{' '}
							<Link
								href="/sign-up"
								className="font-semibold text-blue-500 text-sm hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
							>
								Sign Up
							</Link>
						</p>


					</div>
				</div>
			</div>
		</div>
	);
}
