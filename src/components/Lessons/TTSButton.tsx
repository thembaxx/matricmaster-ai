'use client';

import { VolumeHighIcon, VolumeMute01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TTSButtonProps {
	text: string;
	className?: string;
}

export function TTSButton({ text, className }: TTSButtonProps) {
	const [isSpeaking, setIsSpeaking] = useState(false);
	const [supported, setSupported] = useState(false);

	useEffect(() => {
		if ('speechSynthesis' in window) {
			setSupported(true);
		}
	}, []);

	const toggleSpeech = () => {
		if (!supported) return;

		if (isSpeaking) {
			window.speechSynthesis.cancel();
			setIsSpeaking(false);
		} else {
			const utterance = new SpeechSynthesisUtterance(text);
			utterance.onend = () => setIsSpeaking(false);
			utterance.rate = 0.9; // Slightly slower for clarity
			window.speechSynthesis.speak(utterance);
			setIsSpeaking(true);
		}
	};

	if (!supported) return null;

	return (
		<Button
			variant="outline"
			size="sm"
			onClick={toggleSpeech}
			className={cn(
				'rounded-full gap-2 font-black uppercase text-[10px] tracking-widest transition-all shadow-sm',
				isSpeaking ? 'bg-primary text-white border-primary shadow-primary/20' : 'bg-card',
				className
			)}
		>
			<HugeiconsIcon
				icon={isSpeaking ? VolumeHighIcon : VolumeMute01Icon}
				className={cn('w-4 h-4', isSpeaking && 'animate-pulse')}
			/>
			{isSpeaking ? 'Listening...' : 'Listen to Lesson'}
		</Button>
	);
}
