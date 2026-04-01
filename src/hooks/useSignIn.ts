import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { authClient } from '@/lib/auth-client';

export const signInSchema = z.object({
	email: z.string().email('invalid email address'),
	password: z.string().min(8, 'password must be at least 8 characters'),
});

export type SignInValues = z.infer<typeof signInSchema>;

export function useSignIn() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const rawCallbackUrl = searchParams.get('callbackUrl') || '/dashboard';

	let safeCallbackUrl = '/dashboard';
	if (rawCallbackUrl.startsWith('/') && !rawCallbackUrl.startsWith('//')) {
		safeCallbackUrl = rawCallbackUrl;
	} else {
		try {
			const url = new URL(rawCallbackUrl);
			if (url.origin === (typeof window !== 'undefined' ? window.location.origin : '')) {
				safeCallbackUrl = url.pathname + url.search;
			}
		} catch (error) {
			console.warn('invalid callback URL, using default:', error);
			safeCallbackUrl = '/dashboard';
		}
	}

	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [showPassword, setShowPassword] = useState(false);
	const [successEmail, setSuccessEmail] = useState<string | null>(null);

	const form = useForm<SignInValues>({
		resolver: zodResolver(signInSchema),
		defaultValues: {
			email: '',
			password: '',
		},
	});

	const initializeDatabase = async () => {
		try {
			const response = await fetch('/api/db/init', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
			});

			let result: { success?: boolean; message?: string };
			const contentType = response.headers.get('content-type');
			if (contentType?.includes('application/json')) {
				try {
					result = await response.json();
				} catch (error) {
					console.warn('failed to parse JSON response:', error);
					const text = await response.text();
					result = { success: false, message: text };
				}
			} else {
				const text = await response.text();
				result = { success: false, message: text };
			}

			if (!response.ok || !result.success) {
				console.warn(
					`database initialization failed: status ${response.status}, message: ${result.message ?? 'unknown error'}`
				);
			}
		} catch (err) {
			console.debug('error initializing database:', err);
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
				setError(authError.message || 'invalid email or password');
				setIsLoading(false);
			} else {
				initializeDatabase().catch(console.error);

				setSuccessEmail(data.email);
				setTimeout(() => {
					router.push(safeCallbackUrl);
					router.refresh();
				}, 2000);
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'an unexpected error occurred');
			setIsLoading(false);
		}
	};

	const handleSocialSignIn = async (provider: 'google' | 'twitter' | 'facebook') => {
		setError(null);
		try {
			const callbackURL = new URL(safeCallbackUrl, window.location.origin).toString();
			const { error: authError } = await authClient.signIn.social({
				provider,
				callbackURL,
			});

			if (authError) {
				setError(authError.message || `failed to sign in with ${provider}`);
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : `failed to sign in with ${provider}`);
		}
	};

	return {
		form,
		isLoading,
		error,
		showPassword,
		setShowPassword,
		successEmail,
		onSubmit,
		handleSocialSignIn,
	};
}
