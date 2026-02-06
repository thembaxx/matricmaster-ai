'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft, Chrome, Facebook, Loader2, Lock, Mail, Rocket, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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

	const handleSocialSignIn = async (provider: 'google' | 'facebook') => {
		await authClient.signIn.social({
			provider,
			callbackURL: '/dashboard',
		});
	};

	return (
		<div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col relative overflow-hidden font-inter">
			{/* Decorative Background Elements */}
			<div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand-green/10 rounded-full blur-[120px] pointer-events-none" />
			<div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-brand-amber/10 rounded-full blur-[100px] pointer-events-none" />

			{/* Header */}
			<header className="p-6 relative z-10">
				<Button
					variant="ghost"
					size="sm"
					onClick={() => router.push('/')}
					className="rounded-full gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
				>
					<ChevronLeft className="w-4 h-4" />
					Back to Home
				</Button>
			</header>

			<main className="flex-1 flex items-center justify-center p-6 relative z-10">
				<div className="w-full max-w-md space-y-8">
					<div className="text-center space-y-2">
						<div className="inline-flex items-center justify-center w-16 h-16 bg-brand-green rounded-2xl shadow-xl mb-4 animate-bounce">
							<Rocket className="w-8 h-8 text-white" />
						</div>
						<h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight font-lexend">
							Join the <span className="text-brand-green italic font-serif">Mission!</span>
						</h1>
						<p className="text-zinc-500 font-medium">Create an account to track your progress.</p>
					</div>

					<Card className="p-8 rounded-[2.5rem] border-none shadow-2xl bg-white dark:bg-zinc-900">
						{error && (
							<div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-bold rounded-2xl">
								{error}
							</div>
						)}

						<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
							<div className="space-y-2">
								<div className="relative">
									<User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
									<Input
										{...register('name')}
										placeholder="Full Name"
										className="pl-12 h-14 rounded-2xl border-zinc-100 dark:border-zinc-800 focus:ring-brand-green"
									/>
								</div>
								{errors.name && (
									<p className="text-xs text-red-500 font-bold px-2">{errors.name.message}</p>
								)}
							</div>

							<div className="space-y-2">
								<div className="relative">
									<Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
									<Input
										{...register('email')}
										type="email"
										placeholder="Email Address"
										className="pl-12 h-14 rounded-2xl border-zinc-100 dark:border-zinc-800 focus:ring-brand-green"
									/>
								</div>
								{errors.email && (
									<p className="text-xs text-red-500 font-bold px-2">{errors.email.message}</p>
								)}
							</div>

							<div className="space-y-2">
								<div className="relative">
									<Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
									<Input
										{...register('password')}
										type="password"
										placeholder="Create Password"
										className="pl-12 h-14 rounded-2xl border-zinc-100 dark:border-zinc-800 focus:ring-brand-green"
									/>
								</div>
								{errors.password && (
									<p className="text-xs text-red-500 font-bold px-2">{errors.password.message}</p>
								)}
							</div>

							<Button
								type="submit"
								disabled={isLoading}
								className="w-full h-14 rounded-2xl bg-brand-green hover:bg-brand-green/90 text-white font-black text-lg shadow-lg shadow-brand-green/20 transition-all active:scale-[0.98]"
							>
								{isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Create Account'}
							</Button>
						</form>

						<div className="relative my-8">
							<div className="absolute inset-0 flex items-center">
								<div className="w-full border-t border-zinc-100 dark:border-zinc-800" />
							</div>
							<div className="relative flex justify-center text-xs uppercase">
								<span className="bg-white dark:bg-zinc-900 px-4 font-black text-zinc-400 tracking-widest">
									Or sign up with
								</span>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<Button
								variant="outline"
								onClick={() => handleSocialSignIn('google')}
								className="h-14 rounded-2xl border-zinc-100 dark:border-zinc-800 font-bold gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all active:scale-[0.98]"
							>
								<Chrome className="w-5 h-5" />
								Google
							</Button>
							<Button
								variant="outline"
								onClick={() => handleSocialSignIn('facebook')}
								className="h-14 rounded-2xl border-zinc-100 dark:border-zinc-800 font-bold gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all active:scale-[0.98]"
							>
								<Facebook className="w-5 h-5" />
								Facebook
							</Button>
						</div>
					</Card>

					<p className="text-center text-zinc-500 font-bold">
						Already have an account?{' '}
						<Link href="/sign-in" className="text-brand-green hover:underline">
							Sign in here
						</Link>
					</p>
				</div>
			</main>

			{/* Illustration Overlay (Subtle) */}
			<div className="fixed bottom-0 left-0 right-0 h-32 pointer-events-none opacity-20 dark:opacity-10">
				<svg viewBox="0 0 1440 320" className="w-full h-full preserve-aspect-ratio-none">
					<title>Decorative background wave</title>
					<path
						fill="#059669"
						fillOpacity="1"
						d="M0,192L48,181.3C96,171,192,149,288,160C384,171,480,213,576,213.3C672,213,768,171,864,138.7C960,107,1056,85,1152,101.3C1248,117,1344,171,1392,197.3L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
					/>
				</svg>
			</div>
		</div>
	);
}
