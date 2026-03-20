import { Loading03Icon, ViewIcon, ViewOffIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import Link from 'next/link';
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

export function FormFields({
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
	return (
		<>
			<m.div variants={STAGGER_ITEM} className="space-y-2">
				<Label htmlFor="email" className="label-xs ml-1">
					Email Address
				</Label>
				<Input
					{...register('email')}
					id="email"
					type="email"
					placeholder="name@school.edu.za"
					className="bg-background/50 rounded-[var(--radius-md)]"
				/>
				{errors.email && (
					<p className="text-xs text-destructive font-semibold ml-1">{errors.email.message}</p>
				)}
			</m.div>

			<m.div variants={STAGGER_ITEM} className="space-y-2">
				<div className="flex items-center justify-between">
					<Label htmlFor="password" className="label-xs ml-1">
						Password
					</Label>
					<Link href="/forgot-password" className="label-xs text-primary hover:text-primary/80">
						Forgot?
					</Link>
				</div>
				<div className="relative">
					<Input
						{...register('password')}
						id="password"
						type={showPassword ? 'text' : 'password'}
						placeholder="Enter your password"
						className="bg-background/50 pr-12 rounded-[var(--radius-md)]"
					/>
					<Button
						variant="ghost"
						size="icon"
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
					</Button>
				</div>
				{errors.password && (
					<p className="text-xs text-destructive font-semibold ml-1">{errors.password.message}</p>
				)}
			</m.div>

			<m.div variants={STAGGER_ITEM}>
				<Button
					type="submit"
					disabled={isLoading || !!successEmail}
					className={cn(
						'w-full h-14 rounded-[var(--radius-lg)] font-black text-base shadow-xl transition-all active:scale-[0.98]',
						successEmail
							? 'bg-success text-white shadow-success/30'
							: 'bg-primary text-primary-foreground shadow-primary/20'
					)}
				>
					{isLoading ? (
						<HugeiconsIcon icon={Loading03Icon} className="w-5 h-5 animate-spin" />
					) : successEmail ? (
						'Success!'
					) : (
						'Sign In'
					)}
				</Button>
			</m.div>
		</>
	);
}
