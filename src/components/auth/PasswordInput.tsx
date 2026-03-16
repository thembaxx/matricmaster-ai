import { ViewIcon, ViewOffIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { STAGGER_ITEM } from '@/lib/animation-presets';

interface PasswordInputProps {
	register: UseFormRegister<{
		name: string;
		email: string;
		password: string;
	}>;
	errors: FieldErrors<{
		name: string;
		email: string;
		password: string;
	}>;
	showPassword: boolean;
	onTogglePassword: () => void;
}

export function PasswordInput({
	register,
	errors,
	showPassword,
	onTogglePassword,
}: PasswordInputProps) {
	return (
		<m.div variants={STAGGER_ITEM} className="space-y-2">
			<Label
				htmlFor="password"
				className="text-xs font-bold text-label-primary uppercase tracking-wider ml-1"
			>
				Create Password
			</Label>
			<div className="relative">
				<Input
					{...register('password')}
					id="password"
					type={showPassword ? 'text' : 'password'}
					placeholder="Create a strong password"
					className="bg-background/50 pr-12"
					maxLength={128}
				/>
				<button
					type="button"
					onClick={onTogglePassword}
					className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
					aria-label={showPassword ? 'Hide password' : 'Show password'}
				>
					{showPassword ? (
						<HugeiconsIcon icon={ViewOffIcon} className="w-5 h-5" />
					) : (
						<HugeiconsIcon icon={ViewIcon} className="w-5 h-5" />
					)}
				</button>
			</div>
			{errors.password && (
				<p className="text-xs text-destructive font-semibold ml-1">{errors.password.message}</p>
			)}
		</m.div>
	);
}
