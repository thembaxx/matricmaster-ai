/// <reference types="web-speech-api" />

declare global {
	interface Window {
		SpeechRecognition: typeof SpeechRecognition;
		webkitSpeechRecognition: typeof SpeechRecognition;
	}

	var SpeechRecognition: typeof SpeechRecognition;
	var webkitSpeechRecognition: typeof SpeechRecognition;
}

export {};
