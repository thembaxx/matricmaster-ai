import { ViewIcon, ViewOffIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { useId, useState } from 'react';
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

const PASSWORD_REQUIREMENTS = [
	{ key: 'length', label: 'at least 8 characters', test: (p: string) => p.length >= 8 },
	{ key: 'uppercase', label: 'one uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
	{ key: 'number', label: 'one number', test: (p: string) => /[0-9]/.test(p) },
	{
		key: 'special',
		label: 'one special character',
		test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p),
	},
];

function getPasswordStrength(password: string): number {
	if (!password) return 0;
	let score = 0;
	PASSWORD_REQUIREMENTS.forEach((req) => {
		if (req.test(password)) score++;
	});
	return score;
}

export function PasswordInput({
	register,
	errors,
	showPassword,
	onTogglePassword,
}: PasswordInputProps) {
	const passwordErrorId = useId();
	const [password, setPassword] = useState('');
	const strength = getPasswordStrength(password);

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
					onChange={(e) => setPassword(e.target.value)}
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
			{password.length > 0 && (
				<div className="space-y-2 mt-2">
					<div className="flex gap-1">
						{[1, 2, 3, 4].map((level) => (
							<div
								key={level}
								className={`h-1 flex-1 rounded-full transition-colors ${
									level <= strength
										? strength <= 1
											? 'bg-destructive'
											: strength <= 2
												? 'bg-yellow-500'
												: 'bg-green-500'
										: 'bg-muted'
								}`}
							/>
						))}
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
						{PASSWORD_REQUIREMENTS.map((req) => (
							<p
								key={req.key}
								className={`text-[10px] flex items-center gap-1 ${
									req.test(password) ? 'text-green-600' : 'text-muted-foreground'
								}`}
							>
								<span
									className={`w-3 h-3 rounded-full flex items-center justify-center text-[8px] ${
										req.test(password)
											? 'bg-green-500 text-white'
											: 'bg-muted text-muted-foreground'
									}`}
								>
									{req.test(password) ? '✓' : '○'}
								</span>
								{req.label}
							</p>
						))}
					</div>
				</div>
			)}
		</m.div>
	);
}
