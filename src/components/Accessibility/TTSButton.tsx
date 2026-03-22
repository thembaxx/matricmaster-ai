'use client';

import { Loader2Icon, Volume2Icon, VolumeXIcon } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAccessibilityStore } from '@/services/accessibility-service';

interface TTSButtonProps {
	text: string;
	className?: string;
	size?: 'default' | 'sm' | 'lg' | 'icon';
	variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

export function TTSButton({
	text,
	className = '',
	size = 'icon',
	variant = 'ghost',
}: TTSButtonProps) {
	const settings = useAccessibilityStore();
	const [loading, setLoading] = useState(false);
	const [isSpeaking, setIsSpeaking] = useState(false);
	const synthRef = useRef<SpeechSynthesis | null>(null);

	useEffect(() => {
		if (typeof window !== 'undefined') {
			synthRef.current = window.speechSynthesis;
		}
	}, []);

	const handleSpeak = useCallback(async () => {
		if (!synthRef.current || !settings.ttsEnabled) return;

		if (isSpeaking) {
			synthRef.current.cancel();
			setIsSpeaking(false);
			return;
		}

		setLoading(true);
		try {
			const utterance = new SpeechSynthesisUtterance(text);
			utterance.rate = 0.9;
			utterance.pitch = 1;
			utterance.onstart = () => setIsSpeaking(true);
			utterance.onend = () => setIsSpeaking(false);
			utterance.onerror = () => setIsSpeaking(false);
			synthRef.current.speak(utterance);
		} finally {
			setLoading(false);
		}
	}, [settings.ttsEnabled, isSpeaking, text]);

	if (!settings.ttsEnabled) return null;

	return (
		<Button
			type="button"
			size={size}
			variant={variant}
			className={className}
			onClick={handleSpeak}
			aria-label={isSpeaking ? 'Stop speaking' : 'Read aloud'}
		>
			{loading ? (
				<Loader2Icon className="h-4 w-4 animate-spin" />
			) : isSpeaking ? (
				<VolumeXIcon className="h-4 w-4" />
			) : (
				<Volume2Icon className="h-4 w-4" />
			)}
		</Button>
	);
}
