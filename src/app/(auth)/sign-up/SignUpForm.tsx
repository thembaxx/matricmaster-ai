'use client';

import { Tick01Icon as Check } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { AnimatePresence, m } from 'framer-motion';
import { SignUpFooter } from '@/components/auth/SignUpFooter';
import { SignUpHeader } from '@/components/auth/SignUpHeader';
import { SocialAuthButton } from '@/components/auth/SocialAuthButton';
import { BackgroundMesh } from '@/components/ui/background-mesh';
import { Separator } from '@/components/ui/separator';
import { useSignUp } from '@/hooks/useSignUp';
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/animation-presets';
import { SignUpFormFields } from './SignUpFormFields';

export default function SignUpForm() {
	const {
		form,
		isLoading,
		error,
		showPassword,
		setShowPassword,
		success,
		onSubmit,
		handleSocialSignUp,
	} = useSignUp();

	return (
		<div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
			<BackgroundMesh />

			<AnimatePresence>
				{success && (
					<m.div
						initial={{ y: -100, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						exit={{ y: -100, opacity: 0 }}
						transition={{ type: 'spring', stiffness: 300, damping: 30 }}
						className="fixed top-6 left-0 right-0 z-50 flex justify-center pointer-events-none"
					>
						<div className="bg-success/90 text-white px-6 py-3 rounded-full shadow-lg shadow-success/30 flex items-center gap-3 pointer-events-auto backdrop-blur-md">
							<div className="bg-white/20 p-1 rounded-full">
								<HugeiconsIcon icon={Check} className="w-4 h-4 text-white" />
							</div>
							<span className="font-semibold text-sm">account created successfully!</span>
						</div>
					</m.div>
				)}
			</AnimatePresence>

			<div className="w-full max-w-md p-4 relative z-10">
				<m.div
					initial={{ opacity: 0, scale: 0.9, y: 20 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					transition={{ type: 'spring', stiffness: 200, damping: 25 }}
					className="w-full premium-glass border-none rounded-[2.5rem] shadow-2xl overflow-hidden p-8"
				>
					<SignUpHeader />

					{error && (
						<m.div
							initial={{ opacity: 0, x: -10 }}
							animate={{ opacity: 1, x: 0 }}
							className="p-4 mb-6 bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium rounded-2xl flex items-center gap-3"
						>
							<div className="w-2 h-2 rounded-full bg-destructive shrink-0" />
							<span className="flex-1">{error}</span>
						</m.div>
					)}

					<SignUpFormFields
						form={form}
						isLoading={isLoading}
						success={success}
						showPassword={showPassword}
						setShowPassword={setShowPassword}
						onSubmit={onSubmit}
					/>

					<m.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 1 }}
						className="relative my-8"
					>
						<div className="absolute inset-0 flex items-center">
							<Separator />
						</div>
						<div className="relative flex justify-center text-[10px] tracking-[0.2em]">
							<span className="px-4 text-muted-foreground font-black bg-card/80 backdrop-blur-xl rounded-full">
								or
							</span>
						</div>
					</m.div>

					<m.div
						variants={STAGGER_CONTAINER}
						initial="hidden"
						animate="visible"
						className="flex flex-col gap-3"
					>
						<m.div variants={STAGGER_ITEM}>
							<SocialAuthButton
								provider="google"
								isLoading={isLoading}
								onClick={() => handleSocialSignUp('google')}
							/>
						</m.div>
						<m.div variants={STAGGER_ITEM}>
							<SocialAuthButton provider="twitter" onClick={() => handleSocialSignUp('twitter')} />
						</m.div>
					</m.div>

					<SignUpFooter />
				</m.div>
			</div>
		</div>
	);
}
