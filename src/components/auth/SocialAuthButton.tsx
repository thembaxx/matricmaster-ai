import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SocialAuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	provider: 'google' | 'twitter' | 'facebook';
	isLoading?: boolean;
}

function GoogleIcon({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			role="img"
			aria-label="Google"
		>
			<title>Google</title>
			<path
				d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
				fill="#4285F4"
			/>
			<path
				d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
				fill="#34A853"
			/>
			<path
				d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
				fill="#FBBC05"
			/>
			<path
				d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
				fill="#EA4335"
			/>
		</svg>
	);
}

function TwitterIcon({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			viewBox="0 0 24 24"
			fill="currentColor"
			xmlns="http://www.w3.org/2000/svg"
			role="img"
			aria-label="X (Twitter)"
		>
			<title>X (Twitter)</title>
			<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
		</svg>
	);
}

function LoadingSpinner({ className }: { className?: string }) {
	return (
		<svg
			className={cn('animate-spin', className)}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			role="img"
			aria-label="Loading"
		>
			<title>Loading</title>
			<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
			<path
				className="opacity-75"
				fill="currentColor"
				d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
			/>
		</svg>
	);
}

function FacebookIcon({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			viewBox="0 0 24 24"
			fill="currentColor"
			xmlns="http://www.w3.org/2000/svg"
			role="img"
			aria-label="Facebook"
		>
			<title>Facebook</title>
			<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
		</svg>
	);
}

export const SocialAuthButton = memo(function SocialAuthButton({
	provider,
	isLoading,
	className,
	...props
}: SocialAuthButtonProps) {
	const config = {
		google: {
			icon: GoogleIcon,
			label: 'Google',
			style: 'hover:bg-secondary text-foreground border-border',
		},
		twitter: {
			icon: TwitterIcon,
			label: 'X',
			style: 'hover:bg-zinc-900/5 dark:hover:bg-zinc-100/5 text-foreground border-border',
		},
		facebook: {
			icon: FacebookIcon,
			label: 'Facebook',
			style: 'hover:bg-blue-50/50 dark:hover:bg-blue-950/20 text-foreground border-border',
		},
	};

	const { icon: IconComponent, label, style } = config[provider];

	return (
		<Button
			type="button"
			variant="outline"
			disabled={isLoading}
			className={cn(
				'w-full h-12 rounded-xl font-medium gap-3 transition-all active:scale-[0.98] relative overflow-hidden group bg-card/50',
				style,
				className
			)}
			{...props}
		>
			<div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

			{isLoading ? <LoadingSpinner className="w-5 h-5" /> : <IconComponent className="w-5 h-5" />}
			<span className="relative font-semibold text-base">Continue with {label}</span>
		</Button>
	);
});
