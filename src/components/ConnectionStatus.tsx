'use client';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export function ConnectionStatus() {
	const { isOnline, wasOffline } = useNetworkStatus();

	if (isOnline && !wasOffline) {
		return null;
	}

	const status = !isOnline ? 'offline' : wasOffline ? 'reconnecting' : 'online';
	const colors = {
		offline: 'bg-red-500',
		reconnecting: 'bg-yellow-500',
		online: 'bg-green-500',
	};
	const labels = {
		offline: 'Offline',
		reconnecting: 'Reconnecting...',
		online: 'Online',
	};

	return (
		<TooltipProvider delayDuration={200}>
			<Tooltip>
				<TooltipTrigger asChild>
					<div className="relative flex items-center justify-center w-6 h-6">
						<span
							className={`w-2.5 h-2.5 rounded-full ${colors[status]} ${
								status === 'reconnecting' ? 'animate-pulse' : ''
							}`}
						/>
					</div>
				</TooltipTrigger>
				<TooltipContent side="bottom" className="text-xs">
					<p>{labels[status]}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
