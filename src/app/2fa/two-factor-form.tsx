import { Key01Icon, Loading03Icon, SmartPhone01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TwoFactorFormProps {
	useBackup: boolean;
	code: string;
	backupCode: string;
	error: string;
	successMessage: string;
	isLoading: boolean;
	onCodeChange: (value: string) => void;
	onBackupCodeChange: (value: string) => void;
	onSubmit: (e: React.FormEvent) => void;
	onSendOtp: () => void;
	onToggleBackup: () => void;
}

export function TwoFactorForm({
	useBackup,
	code,
	backupCode,
	error,
	successMessage,
	isLoading,
	onCodeChange,
	onBackupCodeChange,
	onSubmit,
	onSendOtp,
	onToggleBackup,
}: TwoFactorFormProps) {
	return (
		<form onSubmit={onSubmit} className="space-y-4">
			{!useBackup ? (
				<div className="space-y-2">
					<label htmlFor="code" className="text-sm font-medium">
						Verification Code
					</label>
					<div className="flex gap-2">
						<Input
							id="code"
							type="text"
							placeholder="000000"
							value={code}
							onChange={(e) => onCodeChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
							className="text-center text-2xl tracking-widest"
							maxLength={6}
							required
						/>
					</div>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className="text-sm text-muted-foreground"
						onClick={onSendOtp}
						disabled={isLoading}
					>
						<HugeiconsIcon icon={SmartPhone01Icon} className="mr-2 h-4 w-4" />
						PaperPlaneRight code to email
					</Button>
				</div>
			) : (
				<div className="space-y-2">
					<label htmlFor="backupCode" className="text-sm font-medium">
						Backup Code
					</label>
					<Input
						id="backupCode"
						type="text"
						placeholder="XXXXXXXXXX"
						value={backupCode}
						onChange={(e) => onBackupCodeChange(e.target.value.toUpperCase())}
						className="text-center text-xl tracking-widest font-mono"
						maxLength={10}
						required
					/>
				</div>
			)}

			{error && (
				<div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
			)}

			{successMessage && (
				<div className="rounded-md bg-green-500/10 p-3 text-sm text-green-600">
					{successMessage}
				</div>
			)}

			<Button type="submit" className="w-full" disabled={isLoading}>
				{isLoading ? (
					<>
						<HugeiconsIcon icon={Loading03Icon} className="mr-2 h-4 w-4 animate-spin" />
						Verifying...
					</>
				) : (
					<>
						<HugeiconsIcon icon={Key01Icon} className="mr-2 h-4 w-4" />
						Verify
					</>
				)}
			</Button>

			<div className="text-center">
				<Button type="button" variant="link" onClick={onToggleBackup} className="text-sm">
					{useBackup ? 'Use authenticator app' : 'Use backup code'}
				</Button>
			</div>
		</form>
	);
}
