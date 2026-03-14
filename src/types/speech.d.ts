declare global {
	interface Window {
		SpeechRecognition: typeof SpeechRecognition;
		webkitSpeechRecognition: typeof SpeechRecognition;
		SpeechRecognitionAlternative: SpeechRecognitionAlternative;
		SpeechRecognitionErrorEvent: SpeechRecognitionErrorEvent;
		SpeechRecognitionEvent: SpeechRecognitionEvent;
	}

	var SpeechRecognition: typeof SpeechRecognition;
	var webkitSpeechRecognition: typeof SpeechRecognition;
}

export {};
