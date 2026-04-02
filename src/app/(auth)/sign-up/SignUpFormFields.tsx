import { Loading03Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { memo, useId } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/animation-presets';
import { cn } from '@/lib/utils';
import type { SignUpValues } from './constants';

interface SignUpFormFieldsProps {
	form: UseFormReturn<SignUpValues>;
	isLoading: boolean;
	success: boolean;
	showPassword: boolean;
	setShowPassword: (show: boolean) => void;
	onSubmit: (data: SignUpValues) => void;
}

export const SignUpFormFields = memo(function SignUpFormFields({
	form,
	isLoading,
	success,
	showPassword,
	setShowPassword,
	onSubmit,
}: SignUpFormFieldsProps) {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = form;

	const nameErrorId = useId();
	const emailErrorId = useId();

	return (
		<m.form
			variants={STAGGER_CONTAINER}
			initial="hidden"
			animate="visible"
			onSubmit={handleSubmit(onSubmit)}
			className="space-y-6"
		>
			<fieldset className="space-y-6 border-0 p-0 m-0">
				<legend className="sr-only">create your account</legend>

				<m.div variants={STAGGER_ITEM} className="space-y-2">
					<Label
						htmlFor="name"
						className="text-xs font-bold text-label-primary tracking-wider ml-1"
					>
						full name
					</Label>
					<Input
						{...register('name')}
						id="name"
						type="text"
						placeholder="e.g., thabo mokoena"
						className="bg-background/50"
						maxLength={100}
						aria-required="true"
						aria-invalid={!!errors.name}
						aria-describedby={errors.name ? nameErrorId : undefined}
						autoComplete="name"
						error={!!errors.name}
					/>
					{errors.name && (
						<p
							id={nameErrorId}
							className="text-xs text-destructive font-semibold ml-1"
							role="alert"
						>
							{errors.name.message}
						</p>
					)}
				</m.div>

				<m.div variants={STAGGER_ITEM} className="space-y-2">
					<Label
						htmlFor="email"
						className="text-xs font-bold text-label-primary tracking-wider ml-1"
					>
						email
					</Label>
					<Input
						{...register('email')}
						id="email"
						type="email"
						placeholder="name@example.com"
						className="bg-background/50"
						maxLength={254}
						aria-required="true"
						aria-invalid={!!errors.email}
						aria-describedby={errors.email ? emailErrorId : undefined}
						autoComplete="email"
						error={!!errors.email}
					/>
					{errors.email && (
						<p
							id={emailErrorId}
							className="text-xs text-destructive font-semibold ml-1"
							role="alert"
						>
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
						aria-busy={isLoading}
					>
						{isLoading ? (
							<>
								<HugeiconsIcon icon={Loading03Icon} className="w-5 h-5 animate-spin" />
								<span className="sr-only">Creating account...</span>
							</>
						) : success ? (
							'redirecting...'
						) : (
							'create account'
						)}
					</Button>
				</m.div>
			</fieldset>
		</m.form>
	);
});
