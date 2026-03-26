import { ViewIcon, ViewOffIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { useId } from 'react';
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
	const passwordErrorId = useId();

	return (
		<m.div variants={STAGGER_ITEM} className="space-y-2">
			<Label
				htmlFor="password"
				className="text-xs font-bold text-label-primary tracking-wider ml-1"
			>
				create password
			</Label>
			<div className="relative">
				<Input
					{...register('password')}
					id="password"
					type={showPassword ? 'text' : 'password'}
					placeholder="create a strong password"
					className="bg-background/50 pr-12"
					maxLength={128}
					aria-required="true"
					aria-invalid={!!errors.password}
					aria-describedby={errors.password ? passwordErrorId : undefined}
					autoComplete="new-password"
				/>
				<button
					type="button"
					onClick={onTogglePassword}
					className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
					aria-label={showPassword ? 'hide password' : 'show password'}
				>
					{showPassword ? (
						<HugeiconsIcon icon={ViewOffIcon} className="w-5 h-5" />
					) : (
						<HugeiconsIcon icon={ViewIcon} className="w-5 h-5" />
					)}
				</button>
			</div>
			{errors.password && (
				<p
					id={passwordErrorId}
					className="text-xs text-destructive font-semibold ml-1"
					role="alert"
				>
					{errors.password.message}
				</p>
			)}
		</m.div>
	);
}
