import { Check, Loader2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PhoneVerificationSectionProps {
	phoneNumber: string;
	onPhoneChange: (value: string) => void;
	verificationCode: string;
	onVerificationCodeChange: (value: string) => void;
	isVerified: boolean;
	isLoading: boolean;
	showVerification: boolean;
	onSendCode: () => void;
	onVerify: () => void;
}

export function PhoneVerificationSection({
	phoneNumber,
	onPhoneChange,
	verificationCode,
	onVerificationCodeChange,
	isVerified,
	isLoading,
	showVerification,
	onSendCode,
	onVerify,
}: PhoneVerificationSectionProps) {
	const Spinner = Loader2;

	return (
		<div className="space-y-4">
			<h3 className="font-medium flex items-center gap-2">
				<Shield className="h-4 w-4" />
				Phone Verification
			</h3>

			{!isVerified ? (
				<div className="space-y-3">
					<Label htmlFor="phone">Phone Number</Label>
					<div className="flex gap-2">
						<Input
							id="phone"
							type="tel"
							placeholder="+27 81 234 5678"
							value={phoneNumber}
							onChange={(e) => onPhoneChange(e.target.value)}
						/>
						<Button onClick={onSendCode} disabled={!phoneNumber || isLoading}>
							{isLoading ? <Spinner className="h-4 w-4 animate-spin" /> : 'Send Code'}
						</Button>
					</div>

					{showVerification && (
						<div className="space-y-3">
							<Label htmlFor="code">Verification Code</Label>
							<div className="flex gap-2">
								<Input
									id="code"
									type="text"
									placeholder="123456"
									value={verificationCode}
									onChange={(e) => onVerificationCodeChange(e.target.value)}
									maxLength={6}
									className="w-32"
								/>
								<Button onClick={onVerify} disabled={!verificationCode || isLoading}>
									{isLoading ? <Spinner className="h-4 w-4 animate-spin" /> : 'Verify'}
								</Button>
							</div>
						</div>
					)}
				</div>
			) : (
				<div className="flex items-center gap-2 p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
					<Check className="h-5 w-5 text-green-600" />
					<span className="text-green-800 dark:text-green-400">{phoneNumber} verified</span>
				</div>
			)}
		</div>
	);
}
