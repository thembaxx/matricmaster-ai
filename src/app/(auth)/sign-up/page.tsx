'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';

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

	const onSubmit = async (data: SignUpValues) => {
		setIsLoading(true);
		setError(null);
		const { error: authError } = await authClient.signUp.email({
			email: data.email,
			password: data.password,
			name: data.name,
			callbackURL: '/dashboard',
		});

		if (authError) {
			setError(authError.message || 'Failed to create account');
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-[#0a0f18] pt-8">
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
						></div>
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
