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

const signInSchema = z.object({
	email: z.string().email('Invalid email address'),
	password: z.string().min(8, 'Password must be at least 8 characters'),
});

type SignInValues = z.infer<typeof signInSchema>;

export default function SignInPage() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [showPassword, setShowPassword] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<SignInValues>({
		resolver: zodResolver(signInSchema),
	});

	const onSubmit = async (data: SignInValues) => {
		setIsLoading(true);
		setError(null);
		const { error: authError } = await authClient.signIn.email({
			email: data.email,
			password: data.password,
			callbackURL: '/dashboard',
		});

		if (authError) {
			setError(authError.message || 'Invalid email or password');
			setIsLoading(false);
		}
	};

	const handleSocialSignIn = async (provider: 'google' | 'facebook') => {
		await authClient.signIn.social({
			provider,
			callbackURL: '/dashboard',
		});
	};

	const handleAnonymousSignIn = async () => {
		setIsLoading(true);
		const { error: authError } = await authClient.signIn.anonymous();
		if (authError) {
			setError(authError.message || 'Failed to sign in as guest');
			setIsLoading(false);
		} else {
			router.push('/dashboard');
		}
	};

	return (
		<div
			className="min-h-screen flex flex-col"
			style={{
				background: 'linear-gradient(180deg, #e8f4fc 0%, #d4e8f7 50%, #c8e0f4 100%)',
			}}
		>
			{/* Hero Section with Illustration */}
			<div className="relative w-full h-64 overflow-hidden">
				{/* Dark mode overlay */}
				<div className="absolute inset-0 bg-[#0a0f18] dark:block hidden opacity-90" />
				<div
					className="absolute inset-0 dark:block hidden"
					style={{
						background: 'linear-gradient(180deg, #1a2744 0%, #0f1a2e 50%, #0a0f18 100%)',
					}}
				/>

				{/* Decorative Elements */}
				{/* Pink Diamond */}
				<div
					className="absolute top-16 left-8 w-8 h-8 rotate-45 rounded-sm shadow-lg"
					style={{ backgroundColor: '#f472b6' }}
				/>

				{/* Yellow Square */}
				<div
					className="absolute top-12 right-12 w-7 h-7 rotate-12 rounded-md shadow-lg"
					style={{ backgroundColor: '#fbbf24' }}
				/>

				{/* Blue Sphere */}
				<div
					className="absolute bottom-8 left-12 w-14 h-14 rounded-full shadow-xl"
					style={{
						background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
					}}
				/>

				{/* Notebook/Book Illustration */}
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
					<div
						className="relative w-40 h-32 rounded-xl shadow-2xl"
						style={{ backgroundColor: '#f8fafc' }}
					>
						{/* Book spine */}
						<div
							className="absolute left-0 top-0 bottom-0 w-4 rounded-l-xl"
							style={{ backgroundColor: '#e2e8f0' }}
						/>
						{/* Book lines */}
						<div className="absolute top-6 left-8 right-4 space-y-2">
							<div className="h-1.5 rounded bg-slate-200 w-3/4" />
							<div className="h-1.5 rounded bg-slate-200 w-full" />
							<div className="h-1.5 rounded bg-slate-200 w-2/3" />
							<div className="h-1.5 rounded bg-slate-200 w-4/5" />
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="p-4 w-full flex">
				<div className="flex-1 px-6 py-8 -mt-4 bg-white dark:bg-[#0a0f18] rounded-3xl relative z-10">
					<div className="max-w-sm mx-auto space-y-6">
						{/* Header */}
						<div className="text-center space-y-2">
							<h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Welcome Back</h1>
							<p className="text-zinc-500 dark:text-zinc-400">Empowering your Grade 12 journey.</p>
						</div>

						{/* Error Message */}
						{error && (
							<div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium rounded-xl">
								{error}
							</div>
						)}

						{/* Form */}
						<form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
							{/* Email Field */}
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

							{/* Password Field */}
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

							{/* Forgot Password */}
							<div className="text-right">
								<Link
									href="/forgot-password"
									className="text-sm font-medium text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
								>
									Forgot password?
								</Link>
							</div>

							{/* Sign In Button */}
							<Button
								type="submit"
								disabled={isLoading}
								className="w-full h-14 rounded-xl bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98]"
							>
								{isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Sign In'}
							</Button>
						</form>

						{/* Divider */}
						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<div className="w-full border-t border-zinc-200 dark:border-zinc-700" />
							</div>
							<div className="relative flex justify-center text-sm">
								<span className="bg-white dark:bg-[#0a0f18] px-4 text-zinc-500 dark:text-zinc-400">
									or continue with
								</span>
							</div>
						</div>

						{/* Social Sign In */}
						<div className="grid grid-cols-2 gap-4">
							<Button
								type="button"
								variant="outline"
								onClick={() => handleSocialSignIn('google')}
								className="h-14 rounded-xl border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 font-medium gap-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-all active:scale-[0.98] text-zinc-700 dark:text-zinc-300"
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
								onClick={() => handleSocialSignIn('facebook')}
								className="h-14 rounded-xl border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 font-medium gap-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-all active:scale-[0.98] text-zinc-700 dark:text-zinc-300"
							>
								<svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
									<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
								</svg>
								Facebook
							</Button>
						</div>

						{/* Sign Up Link */}
						<p className="text-center text-zinc-600 dark:text-zinc-400">
							Don't have an account?{' '}
							<Link
								href="/sign-up"
								className="font-semibold text-blue-500 text-sm hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
							>
								Sign Up
							</Link>
						</p>

						{/* Continue as Guest */}
						<button
							type="button"
							onClick={handleAnonymousSignIn}
							className="w-full text-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 font-medium transition-colors underline underline-offset-2"
						>
							Continue as Guest
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
