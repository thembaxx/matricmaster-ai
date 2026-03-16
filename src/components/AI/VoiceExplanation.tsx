'use client';

import { PauseIcon, StopIcon, VolumeHighIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VoiceExplanationProps {
	text: string;
	className?: string;
}

type PlaybackSpeed = 1 | 1.5 | 2;

export function VoiceExplanation({ text, className }: VoiceExplanationProps) {
	const [isPlaying, setIsPlaying] = useState(false);
	const [isSupported, setIsSupported] = useState(false);
	const [speed, setSpeed] = useState<PlaybackSpeed>(1);
	const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);

	useEffect(() => {
		setIsSupported('speechSynthesis' in window);

		const loadVoices = () => {
			const voices = window.speechSynthesis.getVoices();
			const englishVoice = voices.find((v) => v.lang.startsWith('en')) || voices[0];
			setVoice(englishVoice);
		};

		loadVoices();
		window.speechSynthesis.onvoiceschanged = loadVoices;

		return () => {
			window.speechSynthesis.cancel();
		};
	}, []);

	const speak = () => {
		if (!isSupported || !text) return;

		window.speechSynthesis.cancel();

		const utt = new SpeechSynthesisUtterance(text);
		utt.voice = voice;
		utt.rate = speed;
		utt.pitch = 1;

		utt.onend = () => setIsPlaying(false);
		utt.onerror = () => setIsPlaying(false);

		window.speechSynthesis.speak(utt);
		setIsPlaying(true);
	};

	const pause = () => {
		window.speechSynthesis.pause();
		setIsPlaying(false);
	};

	const stop = () => {
		window.speechSynthesis.cancel();
		setIsPlaying(false);
	};

	const toggleSpeed = () => {
		const speeds: PlaybackSpeed[] = [1, 1.5, 2];
		const currentIndex = speeds.indexOf(speed);
		const nextIndex = (currentIndex + 1) % speeds.length;
		setSpeed(speeds[nextIndex]);
	};

	if (!isSupported) return null;

	return (
		<div className={cn('flex items-center gap-2', className)}>
			{!isPlaying ? (
				<Button size="sm" variant="outline" className="rounded-full gap-2" onClick={speak}>
					<HugeiconsIcon icon={VolumeHighIcon} className="w-4 h-4" />
					Listen
				</Button>
			) : (
				<div className="flex gap-1">
					<Button size="sm" variant="outline" className="rounded-full" onClick={pause}>
						<HugeiconsIcon icon={PauseIcon} className="w-4 h-4" />
					</Button>
					<Button size="sm" variant="outline" className="rounded-full" onClick={stop}>
						<HugeiconsIcon icon={StopIcon} className="w-4 h-4" />
					</Button>
				</div>
			)}

			<Button size="sm" variant="ghost" className="text-xs" onClick={toggleSpeed}>
				{speed}x
			</Button>
		</div>
	);
}
