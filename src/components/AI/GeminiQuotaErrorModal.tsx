'use client';

import {
	ArrowRight01Icon,
	Clock01Icon,
	Key02Icon,
	ShieldIcon,
	ViewIcon,
	ViewOffIcon,
	Warning,
	WifiDisconnected01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { AnimatePresence, m } from 'framer-motion';
import Link from 'next/link';
import { useCallback, useId, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useUserApiKey } from '@/hooks/use-user-api-key';

// Import the ErrorState type from the context to ensure consistency
interface ErrorState {
	type: 'quota' | 'rate_limit' | 'network' | 'server' | 'auth' | 'timeout' | 'unknown';
	message: string;
	details?: string;
	timestamp: Date;
	retryCount: number;
	canRetry: boolean;
	lastRetry?: Date;
}

interface GeminiQuotaErrorModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onApiKeySaved?: () => void;
	errorState?: ErrorState | null;
}

export function GeminiQuotaErrorModal({
	open,
	onOpenChange,
	onApiKeySaved,
	errorState,
}: GeminiQuotaErrorModalProps) {
	const { setApiKey, clearApiKey, hasApiKey } = useUserApiKey();
	const [inputValue, setInputValue] = useState('');
	const [showKey, setShowKey] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const inputId = useId();

	const getErrorDisplay = (error: ErrorState) => {
		const displays = {
			quota: {
				icon: Key02Icon,
				title: 'Quota Exceeded',
				description: 'Your free AI usage limit has been reached',
			},
			rate_limit: {
				icon: Clock01Icon,
				title: 'Rate Limited',
				description: 'Too many requests. Please wait before trying again.',
			},
			network: {
				icon: WifiDisconnected01Icon,
				title: 'Connection Error',
				description: 'Unable to connect to AI services',
			},
			server: {
				icon: ShieldIcon,
				title: 'Service Unavailable',
				description: 'AI service is temporarily down',
			},
			auth: {
				icon: Warning,
				title: 'Authentication Error',
				description: 'API key authentication failed',
			},
			timeout: {
				icon: Clock01Icon,
				title: 'Request Timeout',
				description: 'The request took too long to complete',
			},
			unknown: {
				icon: Warning,
				title: 'Unknown Error',
				description: 'An unexpected error occurred',
			},
		};
		return displays[error.type] || displays.quota;
	};

	const handleSaveKey = useCallback(async () => {
		const trimmedKey = inputValue.trim();
		if (!trimmedKey) {
			setError('Please enter a valid API key');
			return;
		}

		if (!trimmedKey.startsWith('AI')) {
			setError('Invalid API key format. Keys should start with "AI"');
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			await new Promise((resolve) => setTimeout(resolve, 500));
			setApiKey(trimmedKey);
			setInputValue('');
			onApiKeySaved?.();
			onOpenChange(false);
		} catch (error) {
			console.error('Failed to save API key:', error);
			setError('Failed to save API key. Please try again.');
		} finally {
			setIsLoading(false);
		}
	}, [inputValue, setApiKey, onApiKeySaved, onOpenChange]);

	const handleUseOwnKey = useCallback(() => {
		clearApiKey();
		onApiKeySaved?.();
	}, [clearApiKey, onApiKeySaved]);

	const handleGetGoogleKey = useCallback(() => {
		window.open('https://aistudio.google.com/app/apikey', '_blank');
	}, []);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<AnimatePresence>
				{open && (
					<m.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
					>
						<DialogContent className="sm:max-w-[480px] overflow-hidden p-0 gap-0">
							<m.div
								initial={{ opacity: 0, scale: 0.95, y: 10 }}
								animate={{ opacity: 1, scale: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.95, y: 10 }}
								transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
							>
								<DialogHeader className="pb-2 pt-6 px-6">
									<m.div
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: 0.1 }}
										className="flex items-center gap-3 mb-2"
									>
										<div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center">
											<HugeiconsIcon
												icon={errorState ? getErrorDisplay(errorState).icon : Warning}
												className="w-6 h-6 text-amber-600 dark:text-amber-400"
											/>
										</div>
										<div>
											<DialogTitle className="text-xl font-semibold">
												{errorState ? getErrorDisplay(errorState).title : 'AI Quota Exceeded'}
											</DialogTitle>
											<DialogDescription className="text-sm text-muted-foreground">
												{errorState
													? getErrorDisplay(errorState).description
													: 'Our shared AI quota has been reached'}
											</DialogDescription>
										</div>
									</m.div>
								</DialogHeader>

								<div className="px-6 pb-6">
									<m.div
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: 0.15 }}
										className="bg-muted/50 rounded-2xl p-4 mb-5"
									>
										<p className="text-sm text-foreground leading-relaxed">
											{errorState?.type === 'quota' ? (
												<>
													You've hit our shared AI usage limit. Don't worry! You can continue using
													AI features by adding your own Google AI API key, which gives you{' '}
													<span className="font-medium">free monthly credits</span> to use however
													you like.
												</>
											) : errorState?.type === 'rate_limit' ? (
												"You're making requests too quickly. Please wait a moment before trying again. The system will automatically retry your request."
											) : errorState?.type === 'network' ? (
												'Unable to connect to AI services. Please check your internet connection and try again.'
											) : errorState?.type === 'server' ? (
												'AI services are temporarily unavailable. This is usually resolved quickly - please try again in a few minutes.'
											) : errorState?.type === 'auth' ? (
												'Your API key appears to be invalid or expired. Please check your key or get a new one from Google AI Studio.'
											) : (
												'An unexpected error occurred. Please try again or contact support if the problem persists.'
											)}
											{errorState?.details && (
												<div className="mt-2 p-2 bg-muted rounded text-xs font-mono">
													{errorState.details}
												</div>
											)}
										</p>
									</m.div>

									{errorState?.type === 'quota' && (
										<m.div
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: 0.2 }}
											className="space-y-4"
										>
											{hasApiKey && (
												<div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900">
													<HugeiconsIcon
														icon={ShieldIcon}
														className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0"
													/>
													<p className="text-sm text-green-800 dark:text-green-200">
														You've already added your API key. Want to use a different one?
													</p>
													<Button
														variant="ghost"
														size="sm"
														onClick={handleUseOwnKey}
														className="ml-auto text-green-700 dark:text-green-300 hover:text-green-800 dark:hover:text-green-200"
													>
														Change
													</Button>
												</div>
											)}

											<div className="space-y-3">
												<label
													htmlFor={inputId}
													className="text-sm font-medium flex items-center gap-2"
												>
													<HugeiconsIcon icon={Key02Icon} className="w-4 h-4" />
													Enter your Google AI API Key
												</label>
												<div className="relative">
													<Input
														id={inputId}
														type={showKey ? 'text' : 'password'}
														placeholder="AI..."
														value={inputValue}
														onChange={(e) => {
															setInputValue(e.target.value);
															setError(null);
														}}
														className="pr-12 h-12"
														onKeyDown={(e) => e.key === 'Enter' && handleSaveKey()}
													/>
													<Button
														type="button"
														variant="ghost"
														size="icon"
														onClick={() => setShowKey(!showKey)}
														className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
													>
														<HugeiconsIcon
															icon={showKey ? ViewOffIcon : ViewIcon}
															className="w-5 h-5"
														/>
													</Button>
												</div>
												{error && (
													<m.p
														initial={{ opacity: 0, y: -5 }}
														animate={{ opacity: 1, y: 0 }}
														className="text-sm text-destructive"
													>
														{error}
													</m.p>
												)}
											</div>

											<Button
												onClick={handleGetGoogleKey}
												variant="outline"
												className="w-full h-12 gap-3 border-2 hover:bg-accent"
											>
												<svg viewBox="0 0 24 24" className="w-5 h-5" role="img" aria-label="Google">
													<title>Google</title>
													<path
														fill="#4285F4"
														d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
													/>
													<path
														fill="#34A853"
														d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
													/>
													<path
														fill="#FBBC05"
														d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
													/>
													<path
														fill="#EA4335"
														d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
													/>
												</svg>
												<span>Get Free API Key from Google AI Studio</span>
												<HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4 ml-auto" />
											</Button>

											<div className="flex gap-3 pt-2">
												<Button
													variant="secondary"
													onClick={() => onOpenChange(false)}
													className="flex-1 h-11"
												>
													Maybe Later
												</Button>
												<Button
													onClick={handleSaveKey}
													disabled={!inputValue.trim() || isLoading}
													className="flex-1 h-11 gap-2"
												>
													{isLoading ? (
														<>
															<span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
															Saving...
														</>
													) : (
														<>
															Save Key
															<HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4" />
														</>
													)}
												</Button>
											</div>

											<m.div
												initial={{ opacity: 0 }}
												animate={{ opacity: 1 }}
												transition={{ delay: 0.3 }}
												className="flex items-start gap-2 pt-2"
											>
												<HugeiconsIcon
													icon={ShieldIcon}
													className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0"
												/>
												<p className="text-xs text-muted-foreground leading-relaxed">
													<span className="font-medium">Your key stays on your device.</span> We
													never upload or store your API key on our servers. It remains local to
													your browser. See our{' '}
													<Link
														href="/privacy"
														className="underline hover:text-foreground transition-colors"
													>
														Privacy Policy
													</Link>
													.
												</p>
											</m.div>
										</m.div>
									)}

									{errorState?.type !== 'quota' && (
										<m.div
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: 0.2 }}
											className="flex gap-3 pt-2"
										>
											<Button
												variant="secondary"
												onClick={() => onOpenChange(false)}
												className="flex-1 h-11"
											>
												Close
											</Button>
											<Button onClick={() => onOpenChange(false)} className="flex-1 h-11 gap-2">
												Try Again
												<HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4" />
											</Button>
										</m.div>
									)}
								</div>

								<Separator />

								<m.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ delay: 0.35 }}
									className="bg-muted/30 px-6 py-3 flex items-center justify-between"
								>
									<span className="text-xs text-muted-foreground">
										© {new Date().getFullYear()} Lumni AI
									</span>
									<span className="text-xs text-muted-foreground">Powered by Google Gemini</span>
								</m.div>
							</m.div>
						</DialogContent>
					</m.div>
				)}
			</AnimatePresence>
		</Dialog>
	);
}
