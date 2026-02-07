'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
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
		<div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-[#0a0f18]">
			{/* Header with Back Button */}
			<header className="p-6">
				<button
					type="button"
					onClick={() => router.back()}
					className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
				>
					<ChevronLeft className="w-7 h-7" />
				</button>
			</header>

			{/* Main Content */}
			<main className="flex-1 px-6 pb-8">
				<div className="max-w-sm mx-auto space-y-6">
					{/* Illustration */}
					<div className="flex justify-center mb-2">
						<div
							className="w-48 h-36 rounded-2xl flex items-center justify-center overflow-hidden"
							style={{
								background: 'linear-gradient(135deg, #64b5c6 0%, #4a9aa8 50%, #3d8b99 100%)',
							}}
						>
							{/* Graduation Cap Illustration */}
							<div className="relative">
								{/* Base/Stand */}
								<div
									className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-3 rounded-full"
									style={{ backgroundColor: '#d4a574' }}
								/>

								{/* Graduation Cap */}
								<div className="relative mb-2">
									{/* Cap base */}
									<div
										className="w-16 h-4 rounded-sm mx-auto"
										style={{ backgroundColor: '#1f2937' }}
									/>
									{/* Cap top */}
									<div
										className="w-20 h-2 -mt-1 mx-auto"
										style={{
											backgroundColor: '#374151',
											clipPath: 'polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)',
										}}
									/>
									{/* Tassel */}
									<div
										className="absolute -right-2 top-0 w-1 h-8 rounded-full"
										style={{ backgroundColor: '#fbbf24' }}
									/>
									<div
										className="absolute -right-3 top-7 w-3 h-3 rounded-full"
										style={{ backgroundColor: '#fbbf24' }}
									/>
								</div>

								{/* Pencils */}
								<div
									className="absolute -right-8 bottom-2 w-2 h-14 rounded-t-sm"
									style={{ backgroundColor: '#fbbf24' }}
								/>
								<div
									className="absolute -right-8 bottom-2 w-2 h-2"
									style={{ backgroundColor: '#f8b4b4' }}
								/>

								<div
									className="absolute -left-6 bottom-2 w-2 h-12 rounded-t-sm rotate-[-8deg]"
									style={{ backgroundColor: '#e5e7eb' }}
								/>
							</div>
						</div>
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
								id="name"
								type="text"
								placeholder="e.g., Thabo Mokoena"
								className="h-14 rounded-xl border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
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
								id="email"
								type="email"
								placeholder="name@example.com"
								className="h-14 rounded-xl border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
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
									id="password"
									type={showPassword ? 'text' : 'password'}
									placeholder="Create a strong password"
									className="h-14 rounded-xl border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 pr-12"
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
							className="w-full h-14 rounded-xl bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold text-lg shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98]"
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
