import { Loading03Icon, ViewIcon, ViewOffIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import Link from 'next/link';
import { memo, useId } from 'react';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { STAGGER_ITEM } from '@/lib/animation-presets';
import { cn } from '@/lib/utils';

interface SignInValues {
	email: string;
	password: string;
}

export const FormFields = memo(function FormFields({
	register,
	errors,
	isLoading,
	successEmail,
	showPassword,
	onTogglePassword,
}: {
	register: UseFormRegister<SignInValues>;
	errors: FieldErrors<SignInValues>;
	isLoading: boolean;
	successEmail: string | null;
	showPassword: boolean;
	onTogglePassword: () => void;
}) {
	const emailErrorId = useId();
	const passwordErrorId = useId();

	return (
		<fieldset className="flex flex-col gap-6 border-0 p-0 m-0">
			<legend className="sr-only">Sign in credentials</legend>

			<m.div variants={STAGGER_ITEM} className="flex flex-col gap-2">
				<Label htmlFor="email" className="label-xs ml-1">
					email address
				</Label>
				<Input
					{...register('email')}
					id="email"
					type="email"
					placeholder="name@school.edu.za"
					className="bg-background/50 rounded-[var(--radius-md)]"
					aria-required={true}
					aria-invalid={!!errors.email}
					aria-describedby={errors.email ? emailErrorId : undefined}
					autoComplete="email"
				/>
				{errors.email && (
					<p id={emailErrorId} className="text-xs text-destructive font-semibold ml-1" role="alert">
						{errors.email.message}
					</p>
				)}
			</m.div>

			<m.div variants={STAGGER_ITEM} className="flex flex-col gap-2">
				<div className="flex items-center justify-between">
					<Label htmlFor="password" className="label-xs ml-1">
						password
					</Label>
					<Link
						href="/forgot-password"
						transitionTypes={['fade']}
						className="label-xs text-primary hover:text-primary/80"
					>
						forgot?
					</Link>
				</div>
				<div className="relative">
					<Input
						{...register('password')}
						id="password"
						type={showPassword ? 'text' : 'password'}
						placeholder="enter your password"
						className="bg-background/50 pr-12 rounded-[var(--radius-md)]"
						aria-required={true}
						aria-invalid={!!errors.password}
						aria-describedby={errors.password ? passwordErrorId : undefined}
						autoComplete="current-password"
					/>
					<Button
						variant="ghost"
						size="icon"
						type="button"
						onClick={onTogglePassword}
						className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
						aria-label={showPassword ? 'hide password' : 'show password'}
					>
						{showPassword ? (
							<HugeiconsIcon icon={ViewOffIcon} className="size-5" />
						) : (
							<HugeiconsIcon icon={ViewIcon} className="size-5" />
						)}
					</Button>
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

			<m.div variants={STAGGER_ITEM}>
				<Button
					type="submit"
					disabled={isLoading || !!successEmail}
					className={cn(
						'w-full h-14 rounded-[var(--radius-lg)] font-bold text-white/90 text-base shadow-xl transition-all active:scale-[0.98]',
						successEmail
							? 'bg-success text-white shadow-success/30'
							: 'bg-primary text-primary-foreground shadow-primary/20'
					)}
					aria-busy={isLoading}
				>
					{isLoading ? (
						<>
							<HugeiconsIcon icon={Loading03Icon} className="w-5 h-5 animate-spin" />
							<span className="sr-only">signing in...</span>
						</>
					) : successEmail ? (
						'success!'
					) : (
						'Sign in'
					)}
				</Button>
			</m.div>
		</fieldset>
	);
});
