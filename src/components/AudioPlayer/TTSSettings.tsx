import { Settings01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TTSSettingsProps {
	audioSrc?: string;
	voices: SpeechSynthesisVoice[];
	selectedVoice: string;
	handleVoiceChange: (voiceName: string) => void;
	showSettings: boolean;
	setShowSettings: (show: boolean) => void;
	playbackSpeed: number;
	handleSpeedChange: (speed: number) => void;
}

export function TTSSettings({
	audioSrc,
	voices,
	selectedVoice,
	handleVoiceChange,
	showSettings,
	setShowSettings,
	playbackSpeed,
	handleSpeedChange,
}: TTSSettingsProps) {
	if (audioSrc) return null;

	return (
		<div className="py-4 space-y-3">
			<div className="flex items-center gap-3">
				<select
					value={selectedVoice}
					onChange={(e) => handleVoiceChange(e.target.value)}
					className={cn(
						'flex-1 text-sm bg-muted/60 rounded-xl px-3 py-2.5 border border-border/60',
						'focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40',
						'transition-all duration-200 cursor-pointer'
					)}
					disabled={voices.length === 0}
				>
					{voices.length === 0 ? (
						<option>Loading voices...</option>
					) : (
						voices.map((voice) => (
							<option key={voice.name} value={voice.name}>
								{voice.name.length > 32 ? `${voice.name.slice(0, 32)}...` : voice.name} (
								{voice.lang.split('-')[0]})
							</option>
						))
					)}
				</select>

				<Button
					variant="ghost"
					size="icon"
					onClick={() => setShowSettings(!showSettings)}
					aria-label={showSettings ? 'Hide TTS settings' : 'Show TTS settings'}
					className={cn(
						'rounded-full h-10 w-10 transition-all duration-200',
						showSettings && 'bg-muted'
					)}
				>
					<HugeiconsIcon icon={Settings01Icon} className="w-5 h-5" aria-hidden="true" />
				</Button>
			</div>

			{showSettings && (
				<div className="animate-in slide-in-from-top-2 duration-200">
					<div className="flex items-center gap-4 p-4 bg-muted/40 rounded-xl border border-border/40">
						<div className="flex items-center gap-3 flex-1">
							<span className="text-xs text-muted-foreground whitespace-nowrap font-medium">
								Speed: {playbackSpeed.toFixed(1)}x
							</span>
							<input
								type="range"
								min="0.5"
								max="2"
								step="0.1"
								value={playbackSpeed}
								onChange={(e) => handleSpeedChange(Number.parseFloat(e.target.value))}
								className={cn(
									'flex-1 h-2 bg-secondary/60 rounded-full appearance-none cursor-pointer',
									'[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5',
									'[&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full',
									'[&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer'
								)}
							/>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
