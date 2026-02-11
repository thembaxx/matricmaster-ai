'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth-client';

const signUpSchema = z.object({
	name: z.string().min(2, 'Name must be at least 2 characters'),
	email: z.string().email('Invalid email address'),
	password: z.string().min(8, 'Password must be at least 8 characters'),
});

type SignUpValues = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [showPassword, setShowPassword] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<SignUpValues>({
		resolver: zodResolver(signUpSchema),
	});

	// Initialize database connection after successful authentication
	const initializeDatabase = async () => {
		try {
			console.log('🔄 Initializing database after signup...');
			const response = await fetch('/api/db/init', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
			});
			const result = await response.json();
			if (result.success) {
				console.log('✅ Database initialized after signup');
			} else {
				console.warn('⚠️ Database initialization failed:', result.message);
			}
		} catch (err) {
			console.error('❌ Error initializing database:', err);
		}
	};

	const onSubmit = async (data: SignUpValues) => {
		setIsLoading(true);
		setError(null);
		const { error: authError } = await authClient.signUp.email({
			email: data.email,
			password: data.password,
			name: data.name,
		});

		if (authError) {
			setError(authError.message || 'Failed to create account');
			setIsLoading(false);
		} else {
			// Initialize database after successful signup
			await initializeDatabase();
			router.push('/dashboard');
		}
	};

	const handleSocialSignUp = async (provider: 'google' | 'twitter') => {
		await authClient.signIn.social({
			provider,
			callbackURL: '/dashboard',
		});
	};

	return (
		<div className="min-h-screen flex flex-col bg-slate-50 dark:bg-zinc-950 pt-8">
			{/* Main Content */}
			<main className="flex-1 px-6 pb-8">
				<div className="max-w-sm mx-auto space-y-6">
					{/* Illustration */}
					<div className="relative z-10 flex flex-col items-center">
						<div
							className="w-40 h-40 bg-contain bg-no-repeat bg-center  rounded-2xl overflow-hidden"
							data-alt="Playful 3D illustration of a graduation cap and a pencil"
							style={{
								backgroundImage:
									'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBfb0kuL_fhXq3o8csXamj2nRCfjURKGnnMK3mMZgTmXYUVQ1jX7VkEnxZA3w6VWyeiOMUAlfWECd-Jw7Y0_tPc-flA4EOK1K45kIh2B8oz0yq5FlFtCotoPGjmfqsPvCcXAIjpTxP7lGyG_pUIqMjIS_VaTY0yr1pGhAtmP1ayFoJWLr_5sb6zAQbXeegS_01yhJhs9Cw_B15TW4YehQsGn72R8niG0D3Kpd_bESOTYKVYfE6y_2z5m75Y1sP08TR5gw7z7HzFKs_-")',
							}}
						/>
					</div>

					{/* Header Text */}
					<div className="text-center space-y-2">
						<h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Start Your Journey</h1>
						<p className="text-zinc-500 dark:text-zinc-400">Grade 12 success starts here.</p>
					</div>

					{/* Error Message */}
					{error && (
						<div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium rounded-xl">
							{error}
						</div>
					)}

					{/* Form */}
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
						{/* Full Name Field */}
						<div className="space-y-2">
							<label
								htmlFor="name"
								className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
							>
								Full Name
							</label>
							<Input
								{...register('name')}
								type="text"
								placeholder="e.g., Thabo Mokoena"
								className="shadow-none flex w-full rounded-xl text-[#111318] dark:text-white border border-[#dbdfe6] dark:border-gray-700 bg-white dark:bg-gray-800/50 focus:border-primary focus:ring-2 focus:ring-primary/20 h-14 px-4 text-base font-normal placeholder:text-[#9ca3af]"
							/>
							{errors.name && (
								<p className="text-xs text-red-500 font-medium">{errors.name.message}</p>
							)}
						</div>

						{/* Email Field */}
						<div className="space-y-2">
							<label
								htmlFor="email"
								className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
							>
								Email
							</label>
							<Input
								{...register('email')}
								type="email"
								placeholder="name@example.com"
								className="shadow-none flex w-full rounded-xl text-[#111318] dark:text-white border border-[#dbdfe6] dark:border-gray-700 bg-white dark:bg-gray-800/50 focus:border-primary focus:ring-2 focus:ring-primary/20 h-14 px-4 text-base font-normal placeholder:text-[#9ca3af]"
							/>
							{errors.email && (
								<p className="text-xs text-red-500 font-medium">{errors.email.message}</p>
							)}
						</div>

						{/* Password Field */}
						<div className="space-y-2">
							<label
								htmlFor="password"
								className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
							>
								Create Password
							</label>
							<div className="relative">
								<Input
									{...register('password')}
									type={showPassword ? 'text' : 'password'}
									placeholder="Create a strong password"
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

						{/* Create Account Button */}
						<Button
							type="submit"
							disabled={isLoading}
							className="w-full h-14 rounded-xl bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98]"
						>
							{isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Create Account'}
						</Button>
					</form>

					{/* Divider */}
					<div className="relative">
						<div className="absolute inset-0 flex items-center">
							<div className="w-full border-t border-zinc-200 dark:border-zinc-700" />
						</div>
						<div className="relative flex justify-center text-sm">
							<span className="bg-background px-4 text-zinc-500 dark:text-zinc-400">
								or continue with
							</span>
						</div>
					</div>

					{/* Social Sign Up */}
					<div className="grid grid-cols-2 gap-3">
						<Button
							type="button"
							variant="outline"
							onClick={() => handleSocialSignUp('google')}
							className="h-14 rounded-xl border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 font-medium gap-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-all active:scale-[0.98] text-zinc-700 dark:text-zinc-300"
						>
							<svg className="w-5 h-5" viewBox="0 0 24 24" role="img" aria-label="Google logo">
								<title>Google</title>
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
							onClick={() => handleSocialSignUp('twitter')}
							className="h-14 rounded-xl border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 font-medium gap-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-all active:scale-[0.98] text-zinc-700 dark:text-zinc-300"
						>
							<svg className="w-5 h-5" viewBox="0 0 24 24" role="img" aria-label="Twitter logo">
								<title>Twitter</title>
								<path
									fill="#1DA1F2"
									d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"
								/>
							</svg>
							Twitter
						</Button>
					</div>

					{/* Sign In Link */}
					<p className="text-center text-zinc-600 dark:text-zinc-400 pt-2">
						Already have an account?{' '}
						<Link
							href="/sign-in"
							className="font-semibold text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
						>
							Sign In
						</Link>
					</p>
				</div>
			</main>
		</div>
	);
}
