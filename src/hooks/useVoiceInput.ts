'use client';

import { useCallback, useState } from 'react';

type VoiceRecognitionEvent = {
	results: {
		[index: number]: {
			[index: number]: {
				transcript: string;
			};
			isFinal: boolean;
		};
		length: number;
	};
};

type VoiceRecognitionErrorEvent = {
	error: string;
};

interface UseVoiceInputOptions {
	onTranscript?: (transcript: string) => void;
	onEnd?: () => void;
	onError?: (error: string) => void;
	continuous?: boolean;
	lang?: string;
}

export function useVoiceInput(options: UseVoiceInputOptions = {}) {
	const { onTranscript, onEnd, onError, continuous = false, lang = 'en-ZA' } = options;
	const [isListening, setIsListening] = useState(false);
	const [isSupported, setIsSupported] = useState(false);
	const [transcript, setTranscript] = useState('');
	const [recognition, setRecognition] = useState<any>(null);

	const initRecognition = useCallback(() => {
		if (typeof window === 'undefined') return null;

		const SpeechRecognitionAPI =
			window.SpeechRecognition || (window as any).webkitSpeechRecognition;

		if (!SpeechRecognitionAPI) {
			setIsSupported(false);
			return null;
		}

		setIsSupported(true);
		const recognitionInstance = new SpeechRecognitionAPI();
		recognitionInstance.continuous = continuous;
		recognitionInstance.interimResults = true;
		recognitionInstance.lang = lang;

		recognitionInstance.onresult = (event: VoiceRecognitionEvent) => {
			let finalTranscript = '';
			let interimTranscript = '';

			for (let i = 0; i < event.results.length; i++) {
				const result = event.results[i];
				if (result.isFinal) {
					finalTranscript += result[0].transcript;
				} else {
					interimTranscript += result[0].transcript;
				}
			}

			const currentTranscript = finalTranscript || interimTranscript;
			setTranscript(currentTranscript);
			if (finalTranscript && onTranscript) {
				onTranscript(finalTranscript);
			}
		};

		recognitionInstance.onerror = (event: VoiceRecognitionErrorEvent) => {
			console.debug('[VoiceInput] Error:', event.error);
			setIsListening(false);
			if (onError) {
				onError(event.error);
			}
		};

		recognitionInstance.onend = () => {
			setIsListening(false);
			if (onEnd) {
				onEnd();
			}
		};

		return recognitionInstance;
	}, [continuous, lang, onTranscript, onEnd, onError]);

	const startListening = useCallback(() => {
		const rec = recognition || initRecognition();
		if (rec) {
			setRecognition(rec);
			setTranscript('');
			rec.start();
			setIsListening(true);
		}
	}, [recognition, initRecognition]);

	const stopListening = useCallback(() => {
		if (recognition) {
			recognition.stop();
			setIsListening(false);
		}
	}, [recognition]);

	const clearTranscript = useCallback(() => {
		setTranscript('');
	}, []);

	return {
		isListening,
		isSupported,
		transcript,
		startListening,
		stopListening,
		clearTranscript,
	};
}
