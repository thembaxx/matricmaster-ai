import { AlertCircleIcon, InformationCircleIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

interface ErrorState {
	type: 'network' | 'speech' | 'permission' | 'unknown';
	message: string;
	recoverable: boolean;
}

interface ErrorBannersProps {
	audioError: boolean;
	switchToTTS: () => void;
	error: ErrorState | null;
	audioSrc?: string;
	retryAudio: () => void;
	retryTTS: () => void;
}

export function ErrorBanners({
	audioError,
	switchToTTS,
	error,
	audioSrc,
	retryAudio,
	retryTTS,
}: ErrorBannersProps) {
	return (
		<>
			{audioError && (
				<div className="py-3 px-4 mx-1 mb-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
					<div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
						<HugeiconsIcon icon={InformationCircleIcon} className="w-4 h-4 flex-shrink-0" />
						<p className="text-sm">
							Audio file unavailable.{' '}
							<button
								type="button"
								onClick={switchToTTS}
								className="underline underline-offset-2 font-medium hover:text-amber-700 dark:hover:text-amber-300"
							>
								Use text-to-speech
							</button>
						</p>
					</div>
				</div>
			)}

			{error && (
				<div className="mx-1 mb-3 p-3.5 bg-destructive/8 border border-destructive/15 rounded-xl animate-in fade-in slide-in-from-top-1 duration-200">
					<div className="flex items-start gap-2.5">
						<HugeiconsIcon
							icon={AlertCircleIcon}
							className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5"
						/>
						<div className="flex-1 min-w-0">
							<p className="text-sm text-destructive font-medium">{error.message}</p>
							{error.recoverable && (
								<button
									type="button"
									onClick={error.type === 'network' && audioSrc ? retryAudio : retryTTS}
									className="text-xs text-destructive/80 underline underline-offset-2 mt-1.5 hover:text-destructive font-medium"
								>
									Try again
								</button>
							)}
						</div>
					</div>
				</div>
			)}
		</>
	);
}
