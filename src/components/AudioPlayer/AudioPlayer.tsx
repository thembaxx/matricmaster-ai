'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AudioVisualizer } from './AudioVisualizer';
import { ErrorBanners } from './ErrorBanners';
import { PlaybackControls } from './PlaybackControls';
import { TTSSettings } from './TTSSettings';
import { WordTranscription } from './WordTranscription';

interface AudioPlayerProps {
	audioSrc?: string;
	text: string;
	title?: string;
	description?: string;
	isOpen: boolean;
	autoPlay?: boolean;
}

interface ErrorState {
	type: 'network' | 'speech' | 'permission' | 'unknown';
	message: string;
	recoverable: boolean;
}

export function AudioPlayer({
	audioSrc,
	text,
	title,
	description,
	isOpen,
	autoPlay = false,
}: AudioPlayerProps) {
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [isMuted, setIsMuted] = useState(false);
	const [activeWordIndex, setActiveWordIndex] = useState(-1);
	const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
	const [selectedVoice, setSelectedVoice] = useState<string>('');
	const [playbackSpeed, setPlaybackSpeed] = useState(0.9);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<ErrorState | null>(null);
	const [showSettings, setShowSettings] = useState(false);
	const [copied, setCopied] = useState(false);
	const [isAudioLoaded, setIsAudioLoaded] = useState(false);
	const [audioError, setAudioError] = useState(false);

	const audioRef = useRef<HTMLAudioElement | null>(null);
	const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
	const transcriptionRef = useRef<HTMLDivElement>(null);
	const hasStartedRef = useRef(false);

	const words = text
		.split(/\s+/)
		.filter(Boolean)
		.map((word, index) => ({
			id: `word-${index}`,
			text: word,
		}));

	const isTTSAvailable = typeof window !== 'undefined' && 'speechSynthesis' in window;
	const isAudioAvailable = audioSrc && !audioError;

	const initializeVoices = useCallback(() => {
		if (!isTTSAvailable) {
			setError({
				type: 'permission',
				message: 'Text-to-speech is not supported in your browser.',
				recoverable: false,
			});
			return;
		}

		const availableVoices = window.speechSynthesis.getVoices();
		if (availableVoices.length === 0) {
			setTimeout(() => {
				const retryVoices = window.speechSynthesis.getVoices();
				setVoices(retryVoices);
				if (retryVoices.length > 0) {
					const savedVoice = localStorage.getItem('selectedVoice');
					const savedSpeed = localStorage.getItem('playbackSpeed');

					if (savedVoice && retryVoices.find((v) => v.name === savedVoice)) {
						setSelectedVoice(savedVoice);
					} else {
						const englishVoice =
							retryVoices.find((v) => v.lang.startsWith('en') && v.name.includes('Premium')) ||
							retryVoices.find((v) => v.lang.startsWith('en')) ||
							retryVoices[0];
						setSelectedVoice(englishVoice?.name || '');
					}

					if (savedSpeed) {
						const speed = Number.parseFloat(savedSpeed);
						if (!Number.isNaN(speed) && speed >= 0.5 && speed <= 2) {
							setPlaybackSpeed(speed);
						}
					}
				}
			}, 100);
			return;
		}

		setVoices(availableVoices);
		const savedVoice = localStorage.getItem('selectedVoice');
		const savedSpeed = localStorage.getItem('playbackSpeed');

		if (savedVoice && availableVoices.find((v) => v.name === savedVoice)) {
			setSelectedVoice(savedVoice);
		} else {
			const englishVoice =
				availableVoices.find((v) => v.lang.startsWith('en') && v.name.includes('Premium')) ||
				availableVoices.find((v) => v.lang.startsWith('en')) ||
				availableVoices[0];
			setSelectedVoice(englishVoice?.name || '');
		}

		if (savedSpeed) {
			const speed = Number.parseFloat(savedSpeed);
			if (!Number.isNaN(speed) && speed >= 0.5 && speed <= 2) {
				setPlaybackSpeed(speed);
			}
		}
	}, [isTTSAvailable]);

	useEffect(() => {
		if (!isTTSAvailable) return;

		initializeVoices();

		return () => {
			window.speechSynthesis.cancel();
		};
	}, [isTTSAvailable, initializeVoices]);

	useEffect(() => {
		if (audioSrc && audioRef.current) {
			audioRef.current.load();
		}
	}, [audioSrc]);

	const handleAudioError = () => {
		setAudioError(true);
		setIsPlaying(false);
		setIsLoading(false);
	};

	const handleAudioCanPlay = () => {
		setIsAudioLoaded(true);
		setAudioError(false);
	};

	const startTTS = useCallback(
		(startText: string, fromIndex = 0) => {
			if (!isTTSAvailable) {
				setError({
					type: 'permission',
					message: 'Text-to-speech is not supported in your browser.',
					recoverable: false,
				});
				return;
			}

			window.speechSynthesis.cancel();
			setIsLoading(true);
			setError(null);

			const utterance = new SpeechSynthesisUtterance(startText);

			if (selectedVoice && voices.length > 0) {
				const voice = voices.find((v) => v.name === selectedVoice);
				if (voice) {
					utterance.voice = voice;
				}
			}

			utterance.rate = playbackSpeed;
			utterance.pitch = 1;

			utterance.onstart = () => {
				setIsPlaying(true);
				setIsLoading(false);
				hasStartedRef.current = true;
			};

			utterance.onend = () => {
				setIsPlaying(false);
				setActiveWordIndex(-1);
				hasStartedRef.current = false;
			};

			utterance.onerror = (event) => {
				setIsPlaying(false);
				setIsLoading(false);
				setActiveWordIndex(-1);
				hasStartedRef.current = false;

				if (event.error === 'canceled' || event.error === 'interrupted') {
					return;
				}

				if (event.error === 'network') {
					setError({
						type: 'network',
						message: 'Network error. Check your connection and try again.',
						recoverable: true,
					});
				} else if (event.error === 'not-allowed') {
					setError({
						type: 'permission',
						message: 'Microphone or audio permission denied.',
						recoverable: false,
					});
				} else {
					setError({
						type: 'unknown',
						message: 'Unable to play audio. Please try again.',
						recoverable: true,
					});
				}
			};

			utterance.onboundary = (event) => {
				if (event.name === 'word') {
					const wordCount = startText.slice(0, event.charIndex).split(/\s+/).length - 1;
					const newIndex = fromIndex + Math.max(0, wordCount);

					if (newIndex < words.length) {
						setActiveWordIndex(newIndex);

						if (transcriptionRef.current) {
							const wordElement = transcriptionRef.current.querySelector(
								`[data-word-index="${newIndex}"]`
							);
							if (wordElement) {
								wordElement.scrollIntoView({
									behavior: 'smooth',
									block: 'center',
								});
							}
						}
					}
				}
			};

			utteranceRef.current = utterance;
			window.speechSynthesis.speak(utterance);
		},
		[selectedVoice, playbackSpeed, voices, isTTSAvailable, words.length]
	);

	const togglePlay = useCallback(() => {
		if (audioSrc && audioRef.current && !audioError) {
			if (isPlaying) {
				audioRef.current.pause();
			} else {
				audioRef.current.play().catch(() => {
					setError({
						type: 'network',
						message: 'Failed to play audio file. Using text-to-speech instead.',
						recoverable: true,
					});
				});
			}
		} else {
			if (isPlaying) {
				window.speechSynthesis.cancel();
				setIsPlaying(false);
				setActiveWordIndex(-1);
			} else {
				startTTS(text);
			}
		}
	}, [audioSrc, isPlaying, text, startTTS, audioError]);

	const handleWordClick = useCallback(
		(index: number) => {
			const remainingWords = words.slice(index);
			const remainingText = remainingWords.map((w) => w.text).join(' ');
			startTTS(remainingText, index);
		},
		[words, startTTS]
	);

	const handleTimeUpdate = useCallback(() => {
		if (audioRef.current) {
			setCurrentTime(audioRef.current.currentTime);
		}
	}, []);

	const handleLoadedMetadata = useCallback(() => {
		if (audioRef.current) {
			setDuration(audioRef.current.duration);
			setIsAudioLoaded(true);
		}
	}, []);

	const handleAudioEnded = useCallback(() => {
		setIsPlaying(false);
		setCurrentTime(0);
	}, []);

	const handleAudioPlay = useCallback(() => {
		setIsPlaying(true);
	}, []);

	const handleAudioPause = useCallback(() => {
		setIsPlaying(false);
	}, []);

	const skipForward = useCallback(() => {
		if (audioSrc && audioRef.current && !audioError) {
			audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 30, duration);
		} else {
			window.speechSynthesis.cancel();
			setIsPlaying(false);
		}
	}, [audioSrc, audioError, duration]);

	const skipBackward = useCallback(() => {
		if (audioSrc && audioRef.current && !audioError) {
			audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 10, 0);
		} else {
			window.speechSynthesis.cancel();
			setIsPlaying(false);
		}
	}, [audioSrc, audioError]);

	const toggleMute = useCallback(() => {
		if (audioSrc && audioRef.current && !audioError) {
			audioRef.current.muted = !isMuted;
			setIsMuted(!isMuted);
		} else {
			setIsMuted(!isMuted);
		}
	}, [audioSrc, audioError, isMuted]);

	const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const time = Number.parseFloat(e.target.value);
		if (audioRef.current) {
			audioRef.current.currentTime = time;
			setCurrentTime(time);
		}
	}, []);

	const handleSpeedChange = useCallback((speed: number) => {
		setPlaybackSpeed(speed);
		localStorage.setItem('playbackSpeed', speed.toString());
	}, []);

	const handleVoiceChange = useCallback((voiceName: string) => {
		setSelectedVoice(voiceName);
		localStorage.setItem('selectedVoice', voiceName);
	}, []);

	const handleCopyText = useCallback(() => {
		navigator.clipboard.writeText(text);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}, [text]);

	const formatTime = useCallback((time: number) => {
		if (!Number.isFinite(time) || Number.isNaN(time)) return '0:00';
		const minutes = Math.floor(time / 60);
		const seconds = Math.floor(time % 60);
		return `${minutes}:${seconds.toString().padStart(2, '0')}`;
	}, []);

	const retryAudio = useCallback(() => {
		if (audioSrc && audioRef.current) {
			setAudioError(false);
			setIsAudioLoaded(false);
			audioRef.current.load();
		}
	}, [audioSrc]);

	const retryTTS = useCallback(() => {
		setError(null);
		startTTS(text);
	}, [startTTS, text]);

	const switchToTTS = useCallback(() => {
		setAudioError(false);
		startTTS(text);
	}, [startTTS, text]);

	useEffect(() => {
		if (isOpen && autoPlay && !hasStartedRef.current) {
			togglePlay();
		}
	}, [isOpen, autoPlay, togglePlay]);

	useEffect(() => {
		return () => {
			if (audioRef.current) {
				audioRef.current.pause();
				audioRef.current.src = '';
			}
			window.speechSynthesis.cancel();
		};
	}, []);

	return (
		<>
			{audioSrc && (
				<audio
					ref={audioRef}
					src={audioSrc}
					onTimeUpdate={handleTimeUpdate}
					onLoadedMetadata={handleLoadedMetadata}
					onEnded={handleAudioEnded}
					onPlay={handleAudioPlay}
					onPause={handleAudioPause}
					onError={handleAudioError}
					onCanPlay={handleAudioCanPlay}
					preload="metadata"
				>
					<track kind="captions" />
				</audio>
			)}

			<div className="flex flex-col h-full min-h-0">
				{(title || description) && (
					<div className="pb-4 border-b border-border/60">
						{title && (
							<h3 className="font-semibold text-lg text-foreground leading-snug">{title}</h3>
						)}
						{description && (
							<p className="text-sm text-muted-foreground mt-1 leading-relaxed line-clamp-2">
								{description}
							</p>
						)}
					</div>
				)}

				<AudioVisualizer
					isAudioAvailable={!!isAudioAvailable}
					audioError={audioError}
					isPlaying={isPlaying}
					currentTime={currentTime}
					duration={duration}
					handleSeek={handleSeek}
					formatTime={formatTime}
					isAudioLoaded={isAudioLoaded}
				/>

				<TTSSettings
					audioSrc={audioSrc}
					voices={voices}
					selectedVoice={selectedVoice}
					handleVoiceChange={handleVoiceChange}
					showSettings={showSettings}
					setShowSettings={setShowSettings}
					playbackSpeed={playbackSpeed}
					handleSpeedChange={handleSpeedChange}
				/>

				<ErrorBanners
					audioError={audioError}
					switchToTTS={switchToTTS}
					error={error}
					audioSrc={audioSrc}
					retryAudio={retryAudio}
					retryTTS={retryTTS}
				/>

				<PlaybackControls
					toggleMute={toggleMute}
					isMuted={isMuted}
					skipBackward={skipBackward}
					togglePlay={togglePlay}
					isLoading={isLoading}
					isPlaying={isPlaying}
					skipForward={skipForward}
				/>

				<WordTranscription
					transcriptionRef={transcriptionRef}
					handleCopyText={handleCopyText}
					copied={copied}
					words={words}
					handleWordClick={handleWordClick}
					activeWordIndex={activeWordIndex}
				/>
			</div>
		</>
	);
}
