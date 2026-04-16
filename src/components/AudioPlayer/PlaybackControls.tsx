import {
	ArrowLeft02Icon,
	ArrowRight02Icon,
	PauseIcon,
	PlayIcon,
	VolumeHighIcon,
	VolumeMute01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PlaybackControlsProps {
	toggleMute: () => void;
	isMuted: boolean;
	skipBackward: () => void;
	togglePlay: () => void;
	isLoading: boolean;
	isPlaying: boolean;
	skipForward: () => void;
}

export function PlaybackControls({
	toggleMute,
	isMuted,
	skipBackward,
	togglePlay,
	isLoading,
	isPlaying,
	skipForward,
}: PlaybackControlsProps) {
	return (
		<div className="flex items-center justify-center gap-2 sm:gap-3 py-5">
			<Button
				variant="ghost"
				size="icon"
				onClick={toggleMute}
				className="rounded-full h-11 w-11 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-200"
			>
				<HugeiconsIcon icon={isMuted ? VolumeMute01Icon : VolumeHighIcon} className="w-5 h-5" />
			</Button>

			<Button
				variant="outline"
				size="icon"
				onClick={skipBackward}
				className="rounded-full h-11 w-11 relative hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-200"
			>
				<HugeiconsIcon icon={ArrowLeft02Icon} className="w-5 h-5" />
				<span className="text-[9px] font-bold absolute -bottom-0.5 tracking-wide">10</span>
			</Button>

			<Button
				size="icon"
				onClick={togglePlay}
				className={cn(
					'rounded-full h-14 w-14 relative overflow-hidden transition-all duration-200',
					'hover:scale-105 active:scale-95 shadow-lg shadow-primary/25',
					'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
					isLoading && 'opacity-80'
				)}
				disabled={isLoading}
			>
				{isLoading ? (
					<div className="absolute inset-0 flex items-center justify-center bg-primary/90">
						<div className="w-5 h-5 border-2 border-white/80 border-t-transparent rounded-full animate-spin" />
					</div>
				) : (
					<HugeiconsIcon
						icon={isPlaying ? PauseIcon : PlayIcon}
						className="w-7 h-7 transition-transform"
					/>
				)}
			</Button>

			<Button
				variant="outline"
				size="icon"
				onClick={skipForward}
				className="rounded-full h-11 w-11 relative hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-200"
			>
				<HugeiconsIcon icon={ArrowRight02Icon} className="w-5 h-5" />
				<span className="text-[9px] font-bold absolute -bottom-0.5 tracking-wide">30</span>
			</Button>

			<div className="w-11" />
		</div>
	);
}
