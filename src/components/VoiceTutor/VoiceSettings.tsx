import { RotateClockwiseIcon, VolumeHighIcon, VolumeOffIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

interface VoiceSettingsProps {
	voices: SpeechSynthesisVoice[];
	selectedVoice: string;
	speechRate: number;
	isVoiceEnabled: boolean;
	isRecording: boolean;
	isSpeakingAI: boolean;
	onVoiceChange: (voice: string) => void;
	onSpeechRateChange: (rate: number) => void;
	onToggleVoice: () => void;
	onClearChat: () => void;
}

export function VoiceSettings({
	voices,
	selectedVoice,
	speechRate,
	isVoiceEnabled,
	isRecording,
	isSpeakingAI,
	onVoiceChange,
	onSpeechRateChange,
	onToggleVoice,
	onClearChat,
}: VoiceSettingsProps) {
	return (
		<Card className="mb-4">
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<CardTitle className="text-base">Voice Settings</CardTitle>
					<Badge
						variant="outline"
						className={
							isRecording
								? 'bg-red-500/10 text-red-500'
								: isSpeakingAI
									? 'bg-blue-500/10 text-blue-500'
									: ''
						}
					>
						{isRecording ? 'Recording...' : isSpeakingAI ? 'Speaking...' : 'Ready'}
					</Badge>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex items-center gap-4">
					<div className="flex-1">
						<label htmlFor="voice-select" className="text-sm font-medium">
							Voice
						</label>
						<Select value={selectedVoice} onValueChange={onVoiceChange}>
							<SelectTrigger id="voice-select" className="mt-1">
								<SelectValue placeholder="Select voice" />
							</SelectTrigger>
							<SelectContent>
								{voices.map((voice) => (
									<SelectItem key={voice.name} value={voice.name}>
										{voice.name} ({voice.lang})
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="w-32">
						<label htmlFor="speed-slider" className="text-sm font-medium">
							Speed: {speechRate.toFixed(1)}x
						</label>
						<Slider
							id="speed-slider"
							value={[speechRate]}
							onValueChange={([value]) => onSpeechRateChange(value)}
							min={0.5}
							max={2}
							step={0.1}
							className="mt-2"
						/>
					</div>
				</div>
				<div className="flex items-center justify-between pt-2">
					<Button
						variant={isVoiceEnabled ? 'default' : 'outline'}
						size="sm"
						onClick={onToggleVoice}
					>
						<HugeiconsIcon
							icon={isVoiceEnabled ? VolumeOffIcon : VolumeHighIcon}
							className="w-4 h-4 mr-1"
						/>
						{isVoiceEnabled ? 'Voice On' : 'Voice Off'}
					</Button>
					<Button variant="ghost" size="sm" onClick={onClearChat}>
						<HugeiconsIcon icon={RotateClockwiseIcon} className="w-4 h-4 mr-1" />
						Clear Chat
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
