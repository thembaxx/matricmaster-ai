import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface AudioVisualizerProps {
	isAudioAvailable: boolean;
	audioError: boolean;
	isPlaying: boolean;
	currentTime: number;
	duration: number;
	handleSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
	formatTime: (time: number) => string;
	isAudioLoaded: boolean;
}

export function AudioVisualizer({
	isAudioAvailable,
	audioError,
	isPlaying,
	currentTime,
	duration,
	handleSeek,
	formatTime,
	isAudioLoaded,
}: AudioVisualizerProps) {
	if (!isAudioAvailable || audioError) return null;

	return (
		<div className="py-5 space-y-3">
			<div className="flex items-center justify-center gap-1.5 py-2 h-12">
				{Array.from({ length: 24 }).map((_, i) => (
					<div
						key={`bar-${i}`}
						className={cn(
							'w-1 rounded-full transition-all duration-300 ease-out',
							isPlaying ? 'bg-primary animate-pulse' : 'bg-muted-foreground/25'
						)}
						style={{
							height: isPlaying ? `${28 + Math.random() * 60}%` : '28%',
							animationDelay: isPlaying ? `${i * 60}ms` : '0ms',
						}}
					/>
				))}
			</div>

			<div className="relative">
				<Input
					type="range"
					min={0}
					max={duration || 100}
					value={currentTime}
					onChange={handleSeek}
					className={cn(
						'w-full h-2 bg-secondary/60 rounded-full appearance-none cursor-pointer',
						'transition-all duration-150',
						'[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4',
						'[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full',
						'[&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer',
						'[&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-primary/40',
						'[&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110',
						'[&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4',
						'[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary',
						'[&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer'
					)}
					disabled={!isAudioLoaded}
				/>
			</div>
			<div className="flex justify-between text-xs text-muted-foreground font-medium">
				<span className="tabular-nums">{formatTime(currentTime)}</span>
				<span className="tabular-nums">{formatTime(duration)}</span>
			</div>
		</div>
	);
}
