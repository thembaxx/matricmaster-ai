'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Tick01Icon as Check, Loading03Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { AnimatePresence, m } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { SignUpFooter } from '@/components/auth/SignUpFooter';
import { SignUpHeader } from '@/components/auth/SignUpHeader';
import { SocialAuthButton } from '@/components/auth/SocialAuthButton';
import { BackgroundMesh } from '@/components/ui/background-mesh';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/animation-presets';
import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';

const signUpSchema = z.object({
	name: z.string().min(2, 'Name must be at least 2 characters'),
	email: z.string().email('Invalid email address'),
	password: z.string().min(8, 'Password must be at least 8 characters'),
});

type SignUpValues = z.infer<typeof signUpSchema>;

export default function SignUpForm() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [showPassword, setShowPassword] = useState(false);
	const [success, setSuccess] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<SignUpValues>({
		resolver: zodResolver(signUpSchema),
	});

	const initializeDatabase = async () => {
		try {
			const response = await fetch('/api/db/init', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
			});
			const result = await response.json();
			if (!result.success) {
				console.warn('Database initialization failed:', result.message);
			}
		} catch (err) {
			console.error('Error initializing database:', err);
		}
	};

	const onSubmit = async (data: SignUpValues) => {
		setIsLoading(true);
		setError(null);
		try {
			const { error: authError } = await authClient.signUp.email({
				email: data.email,
				password: data.password,
				name: data.name,
			});

			if (authError) {
				setError(authError.message || 'Failed to create account');
				setIsLoading(false);
			} else {
				setSuccess(true);
				initializeDatabase().catch(console.error);

				setTimeout(() => {
					router.push('/onboarding');
					router.refresh();
				}, 1500);
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An unexpected error occurred');
			setIsLoading(false);
		}
	};

	const handleSocialSignUp = async (provider: 'google' | 'twitter') => {
		const callbackURL = new URL('/dashboard', window.location.origin).toString();
		await authClient.signIn.social({
			provider,
			callbackURL,
		});
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
			<BackgroundMesh />

			<AnimatePresence>
				{success && (
					<m.div
						initial={{ y: -100, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						exit={{ y: -100, opacity: 0 }}
						transition={{ type: 'spring', stiffness: 300, damping: 30 }}
						className="fixed top-6 left-0 right-0 z-50 flex justify-center pointer-events-none"
					>
						<div className="bg-success/90 text-white px-6 py-3 rounded-full shadow-lg shadow-success/30 flex items-center gap-3 pointer-events-auto backdrop-blur-md">
							<div className="bg-white/20 p-1 rounded-full">
								<HugeiconsIcon icon={Check} className="w-4 h-4 text-white" />
							</div>
							<span className="font-semibold text-sm">Account created successfully!</span>
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
					<SignUpHeader />

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
								htmlFor="name"
								className="text-xs font-bold text-label-primary uppercase tracking-wider ml-1"
							>
								Full Name
							</Label>
							<Input
								{...register('name')}
								id="name"
								type="text"
								placeholder="e.g., Thabo Mokoena"
								className="bg-background/50"
								maxLength={100}
							/>
							{errors.name && (
								<p className="text-xs text-destructive font-semibold ml-1">{errors.name.message}</p>
							)}
						</m.div>

						<m.div variants={STAGGER_ITEM} className="space-y-2">
							<Label
								htmlFor="email"
								className="text-xs font-bold text-label-primary uppercase tracking-wider ml-1"
							>
								Email
							</Label>
							<Input
								{...register('email')}
								id="email"
								type="email"
								placeholder="name@example.com"
								className="bg-background/50"
								maxLength={254}
							/>
							{errors.email && (
								<p className="text-xs text-destructive font-semibold ml-1">
									{errors.email.message}
								</p>
							)}
						</m.div>

						<PasswordInput
							register={register}
							errors={errors}
							showPassword={showPassword}
							onTogglePassword={() => setShowPassword(!showPassword)}
						/>

						<m.div variants={STAGGER_ITEM}>
							<Button
								type="submit"
								disabled={isLoading || success}
								className={cn(
									'w-full h-14 rounded-2xl font-black text-base shadow-xl transition-all active:scale-[0.98]',
									success
										? 'bg-success text-white shadow-success/30'
										: 'bg-primary text-primary-foreground shadow-primary/20'
								)}
							>
								{isLoading ? (
									<HugeiconsIcon icon={Loading03Icon} className="w-5 h-5 animate-spin" />
								) : success ? (
									'Redirecting...'
								) : (
									'Create Account'
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
							<SocialAuthButton provider="google" onClick={() => handleSocialSignUp('google')} />
						</m.div>
						<m.div variants={STAGGER_ITEM}>
							<SocialAuthButton provider="twitter" onClick={() => handleSocialSignUp('twitter')} />
						</m.div>
					</m.div>

					<SignUpFooter />
				</m.div>
			</div>
		</div>
	);
}
