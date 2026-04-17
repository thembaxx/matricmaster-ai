'use client';

import { BotIcon, ClockIcon, SparklesIcon, ZapIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

interface QuotaWaitModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	estimatedWait?: number;
	onTextMode: () => void;
}

export function QuotaWaitModal({
	open,
	onOpenChange,
	estimatedWait = 120,
	onTextMode,
}: QuotaWaitModalProps) {
	const [countdown, setCountdown] = useState(estimatedWait);
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		if (open && countdown > 0) {
			const interval = setInterval(() => {
				setCountdown((prev) => {
					if (prev <= 1) return 0;
					return prev - 1;
				});
				setProgress((prev) => Math.min(100, prev + 100 / estimatedWait));
			}, 1000);
			return () => clearInterval(interval);
		}
	}, [open, estimatedWait, countdown]);

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<BotIcon className="h-5 w-5 text-primary" />
						AI is in High Demand
					</DialogTitle>
					<DialogDescription>
						Our AI tutors are experiencing heavy usage right now. Hang tight!
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<div className="flex items-center justify-center gap-4 py-4">
						<div className="relative">
							<div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
								<SparklesIcon className="h-8 w-8 text-primary animate-pulse" />
							</div>
							<div className="absolute -bottom-1 -right-1">
								<Badge variant="secondary" className="h-6 text-xs">
									<ClockIcon className="h-3 w-3 mr-1" />
									{formatTime(countdown)}
								</Badge>
							</div>
						</div>
					</div>

					<div className="space-y-2">
						<div className="flex justify-between text-sm">
							<span className="text-muted-foreground">Queue position</span>
							<span className="font-medium">2 ahead of you</span>
						</div>
						<Progress value={progress} className="h-2" />
					</div>

					<div className="bg-muted/50 rounded-lg p-4 space-y-3">
						<p className="text-sm font-medium">Need instant help?</p>
						<Button
							variant="outline"
							className="w-full gap-2"
							onClick={() => {
								onTextMode();
								onOpenChange(false);
							}}
						>
							<ZapIcon className="h-4 w-4" />
							Switch to Text-Only Mode
						</Button>
						<p className="text-xs text-muted-foreground text-center">
							Faster responses with simplified formatting
						</p>
					</div>

					<Button
						variant="secondary"
						className="w-full"
						onClick={() => setCountdown(estimatedWait)}
						disabled={countdown > 0}
					>
						{countdown > 0 ? `Retry in ${formatTime(countdown)}` : 'Try Now'}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
