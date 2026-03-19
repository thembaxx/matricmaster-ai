import {
	CheckmarkCircle02Icon,
	Clock01Icon,
	DriveIcon,
	Refresh01Icon,
	Wifi01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatBytes } from '@/lib/offline';

interface OfflineStatusCardProps {
	isOfflineState: boolean;
	cacheSize: number;
	isReloading: boolean;
	onRetry: () => void;
	onClearCache: () => void;
}

export function OfflineStatusCard({
	isOfflineState,
	cacheSize,
	isReloading,
	onRetry,
	onClearCache,
}: OfflineStatusCardProps) {
	return (
		<Card>
			<CardHeader className="text-center">
				<div className="mx-auto mb-4 p-4 rounded-full bg-muted">
					<HugeiconsIcon
						icon={isOfflineState ? Wifi01Icon : Refresh01Icon}
						className={`w-8 h-8 ${isOfflineState ? 'text-orange-500' : 'text-blue-500'}`}
					/>
				</div>
				<CardTitle>{isOfflineState ? "You're Offline" : 'Connection Issue'}</CardTitle>
				<CardDescription>
					{isOfflineState
						? "Don't worry! You can still access some features offline."
						: 'There seems to be a connection problem.'}
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{isOfflineState && (
					<div className="text-sm text-muted-foreground space-y-3">
						<p>While offline, you can:</p>
						<ul className="space-y-2">
							<li className="flex items-start gap-2">
								<HugeiconsIcon
									icon={CheckmarkCircle02Icon}
									className="w-4 h-4 text-green-500 shrink-0 mt-0.5"
								/>
								<span>Review saved flashcards</span>
							</li>
							<li className="flex items-start gap-2">
								<HugeiconsIcon
									icon={CheckmarkCircle02Icon}
									className="w-4 h-4 text-green-500 shrink-0 mt-0.5"
								/>
								<span>Continue your study plan</span>
							</li>
							<li className="flex items-start gap-2">
								<HugeiconsIcon
									icon={CheckmarkCircle02Icon}
									className="w-4 h-4 text-green-500 shrink-0 mt-0.5"
								/>
								<span>View cached past papers</span>
							</li>
							<li className="flex items-start gap-2">
								<HugeiconsIcon
									icon={CheckmarkCircle02Icon}
									className="w-4 h-4 text-green-500 shrink-0 mt-0.5"
								/>
								<span>Track your progress</span>
							</li>
						</ul>
					</div>
				)}

				<div className="grid grid-cols-2 gap-3 text-sm">
					<div className="p-3 rounded-lg bg-muted">
						<div className="flex items-center gap-2 mb-1">
							<HugeiconsIcon icon={DriveIcon} className="w-4 h-4 text-muted-foreground" />
							<span className="text-muted-foreground">Cache Size</span>
						</div>
						<p className="font-medium">{formatBytes(cacheSize)}</p>
					</div>
					<div className="p-3 rounded-lg bg-muted">
						<div className="flex items-center gap-2 mb-1">
							<HugeiconsIcon icon={Clock01Icon} className="w-4 h-4 text-muted-foreground" />
							<span className="text-muted-foreground">Last Synced</span>
						</div>
						<p className="font-medium">{new Date().toLocaleTimeString()}</p>
					</div>
				</div>

				<div className="flex gap-2">
					<Button className="flex-1" onClick={onRetry} disabled={isReloading}>
						<HugeiconsIcon icon={Refresh01Icon} className="w-4 h-4 mr-2" />
						{isReloading ? 'Retrying...' : 'Try Again'}
					</Button>
					<Button variant="outline" onClick={onClearCache}>
						Clear Cache
					</Button>
				</div>

				<Button
					variant="ghost"
					className="w-full"
					onClick={() => {
						window.location.href = '/dashboard';
					}}
				>
					Go to Dashboard
				</Button>
			</CardContent>
		</Card>
	);
}
