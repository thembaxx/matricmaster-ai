export interface VoiceSettings {
	voice: string;
	rate: number;
	pitch: number;
	volume: number;
}

export interface SpeechRecognitionResult {
	transcript: string;
	confidence: number;
	isFinal: boolean;
}

type SpeechRecognitionType = {
	continuous: boolean;
	interimResults: boolean;
	lang: string;
	onresult: ((event: unknown) => void) | null;
	onerror: ((event: unknown) => void) | null;
	start: () => void;
	stop: () => void;
	state: string;
};

let speechRecognition: SpeechRecognitionType | null = null;
let synthesis: SpeechSynthesis | null = null;

export function initSpeechRecognition(): boolean {
	if (typeof window === 'undefined') return false;

	const SpeechRecognitionAPI =
		(
			window as unknown as {
				SpeechRecognition?: { new (): SpeechRecognitionType };
				webkitSpeechRecognition?: { new (): SpeechRecognitionType };
			}
		).SpeechRecognition ||
		(window as unknown as { webkitSpeechRecognition?: { new (): SpeechRecognitionType } })
			.webkitSpeechRecognition;
	if (!SpeechRecognitionAPI) {
		console.warn('Speech recognition not supported');
		return false;
	}

	speechRecognition = new SpeechRecognitionAPI();
	speechRecognition.continuous = true;
	speechRecognition.interimResults = true;
	speechRecognition.lang = 'en-ZA';

	return true;
}

export function startListening(
	onResult: (result: SpeechRecognitionResult) => void,
	onError?: (error: string) => void
): boolean {
	if (!speechRecognition) {
		if (!initSpeechRecognition()) {
			onError?.('Speech recognition not available');
			return false;
		}
	}

	speechRecognition!.onresult = (event: unknown) => {
		const ev = event as {
			results: Array<{ 0: { transcript: string; confidence: number }; isFinal: boolean }>;
		};
		const result = ev.results[ev.results.length - 1];
		onResult({
			transcript: result[0].transcript,
			confidence: result[0].confidence,
			isFinal: result.isFinal,
		});
	};

	speechRecognition!.onerror = (event: unknown) => {
		const ev = event as { error: string };
		onError?.(ev.error);
	};

	speechRecognition!.start();
	return true;
}

export function stopListening(): void {
	if (speechRecognition) {
		speechRecognition.stop();
	}
}

export function isListening(): boolean {
	return speechRecognition?.state === 'running';
}

export function speak(
	text: string,
	settings?: VoiceSettings,
	onStart?: () => void,
	onEnd?: () => void
): void {
	if (typeof window === 'undefined') return;

	synthesis = window.speechSynthesis;

	const utterance = new SpeechSynthesisUtterance(text);
	utterance.lang = 'en-ZA';
	utterance.rate = settings?.rate ?? 1;
	utterance.pitch = settings?.pitch ?? 1;
	utterance.volume = settings?.volume ?? 1;

	if (settings?.voice) {
		const voices = synthesis.getVoices();
		const selectedVoice = voices.find((v) => v.name === settings.voice);
		if (selectedVoice) {
			utterance.voice = selectedVoice;
		}
	}

	utterance.onstart = () => onStart?.();
	utterance.onend = () => onEnd?.();
	utterance.onerror = () => onEnd?.();

	synthesis.speak(utterance);
}

export function stopSpeaking(): void {
	if (synthesis) {
		synthesis.cancel();
	}
}

export function isSpeaking(): boolean {
	return synthesis?.speaking ?? false;
}

export function getAvailableVoices(): SpeechSynthesisVoice[] {
	if (typeof window === 'undefined') return [];
	synthesis = window.speechSynthesis;
	return synthesis.getVoices();
}

export function getSouthAfricanVoices(): SpeechSynthesisVoice[] {
	const voices = getAvailableVoices();
	return voices.filter(
		(v) => v.lang.startsWith('en') || v.lang.startsWith('af') || v.lang.startsWith('zu')
	);
}

export function setRecognitionLanguage(lang: string): void {
	if (speechRecognition) {
		speechRecognition.lang = lang;
	}
}

declare global {
	interface Window {
		SpeechRecognition: any;
		webkitSpeechRecognition: any;
	}
}
