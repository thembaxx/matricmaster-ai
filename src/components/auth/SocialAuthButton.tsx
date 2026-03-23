import { Icon } from '@iconify/react';
import { m } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SocialAuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	provider: 'google' | 'twitter';
	isLoading?: boolean;
}

export function SocialAuthButton({
	provider,
	isLoading,
	className,
	...props
}: SocialAuthButtonProps) {
	const config = {
		google: {
			icon: 'logos:google-icon',
			label: 'Google',
			style: 'hover:bg-secondary text-foreground border-border',
		},
		twitter: {
			icon: 'logos:twitter',
			label: 'Twitter',
			style: 'hover:bg-blue-50 dark:hover:bg-blue-900/20 text-foreground border-border',
		},
	};

	const { icon, label, style } = config[provider];

	return (
		<m.div whileTap={{ scale: 0.98 }}>
			<Button
				type="button"
				variant="outline"
				disabled={isLoading}
				className={cn(
					'w-full h-12 rounded-xl font-medium gap-3 transition-all relative overflow-hidden group bg-card/50',
					style,
					className
				)}
				{...props}
			>
				{/* Shine effect on hover */}
				<div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

				{isLoading ? (
					<Icon icon="eos-icons:loading" className="w-5 h-5 animate-spin" />
				) : (
					<Icon icon={icon} className="w-5 h-5" />
				)}
				<span className="relative font-semibold text-base">Continue with {label}</span>
			</Button>
		</m.div>
	);
}
