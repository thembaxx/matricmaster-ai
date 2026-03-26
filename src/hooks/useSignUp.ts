import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { type SignUpValues, signUpSchema } from '@/app/(auth)/sign-up/constants';
import { authClient } from '@/lib/auth-client';

export function useSignUp() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [showPassword, setShowPassword] = useState(false);
	const [success, setSuccess] = useState(false);
	const [socialProvider, setSocialProvider] = useState<string | null>(null);

	const form = useForm<SignUpValues>({
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
			console.debug('Error initializing database:', err);
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
				setError(authError.message || 'failed to create account');
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
			setError(err instanceof Error ? err.message : 'an unexpected error occurred');
			setIsLoading(false);
		}
	};

	const handleSocialSignUp = async (provider: 'google' | 'twitter' | 'facebook') => {
		const callbackURL = new URL('/dashboard', window.location.origin).toString();
		await authClient.signIn.social({
			provider,
			callbackURL,
		});
	};

	return {
		form,
		isLoading,
		error,
		showPassword,
		setShowPassword,
		success,
		socialProvider,
		onSubmit,
		handleSocialSignUp,
	};
}
