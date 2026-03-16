'use client';

import {
	AlertCircleIcon,
	ArrowLeft02Icon,
	ArrowRight02Icon,
	CheckmarkCircle02Icon,
	Copy01Icon,
	InformationCircleIcon,
	PauseIcon,
	PlayIcon,
	Settings01Icon,
	VolumeHighIcon,
	VolumeMute01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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

				{isAudioAvailable && !audioError && (
					<div className="py-5 space-y-3">
						<div className="flex items-center justify-center gap-1.5 py-2 h-12">
							{Array.from({ length: 24 }).map((_, i) => (
								<div
									key={i}
									className={cn(
										'w-1 rounded-full transition-all duration-300 ease-out',
										isPlaying ? 'bg-primary animate-pulse' : 'bg-muted-foreground/25'
									)}
									style={{
										height: isPlaying ? `${28 + Math.random() * 60}%` : '28%',
										animationDelay: isPlaying ? `${i * 60}ms` : '0ms',
									}}
								/>
							))}
						</div>

						<div className="relative">
							<input
								type="range"
								min={0}
								max={duration || 100}
								value={currentTime}
								onChange={handleSeek}
								className={cn(
									'w-full h-2 bg-secondary/60 rounded-full appearance-none cursor-pointer',
									'transition-all duration-150',
									'[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4',
									'[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full',
									'[&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer',
									'[&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-primary/40',
									'[&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110',
									'[&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4',
									'[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary',
									'[&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer'
								)}
								disabled={!isAudioLoaded}
							/>
						</div>
						<div className="flex justify-between text-xs text-muted-foreground font-medium">
							<span className="tabular-nums">{formatTime(currentTime)}</span>
							<span className="tabular-nums">{formatTime(duration)}</span>
						</div>
					</div>
				)}

				{!audioSrc && (
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
								className={cn(
									'rounded-full h-10 w-10 transition-all duration-200',
									showSettings && 'bg-muted'
								)}
							>
								<HugeiconsIcon icon={Settings01Icon} className="w-5 h-5" />
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
				)}

				{audioError && (
					<div className="py-3 px-4 mx-1 mb-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
						<div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
							<HugeiconsIcon icon={InformationCircleIcon} className="w-4 h-4 flex-shrink-0" />
							<p className="text-sm">
								Audio file unavailable.{' '}
								<button
									type="button"
									onClick={switchToTTS}
									className="underline underline-offset-2 font-medium hover:text-amber-700 dark:hover:text-amber-300"
								>
									Use text-to-speech
								</button>
							</p>
						</div>
					</div>
				)}

				{error && (
					<div className="mx-1 mb-3 p-3.5 bg-destructive/8 border border-destructive/15 rounded-xl animate-in fade-in slide-in-from-top-1 duration-200">
						<div className="flex items-start gap-2.5">
							<HugeiconsIcon
								icon={AlertCircleIcon}
								className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5"
							/>
							<div className="flex-1 min-w-0">
								<p className="text-sm text-destructive font-medium">{error.message}</p>
								{error.recoverable && (
									<button
										type="button"
										onClick={error.type === 'network' && audioSrc ? retryAudio : retryTTS}
										className="text-xs text-destructive/80 underline underline-offset-2 mt-1.5 hover:text-destructive font-medium"
									>
										Try again
									</button>
								)}
							</div>
						</div>
					</div>
				)}

				<div className="flex items-center justify-center gap-2 sm:gap-3 py-5">
					<Button
						variant="ghost"
						size="icon"
						onClick={toggleMute}
						className="rounded-full h-10 w-10 hover:bg-muted/60 transition-all duration-200"
					>
						<HugeiconsIcon icon={isMuted ? VolumeMute01Icon : VolumeHighIcon} className="w-5 h-5" />
					</Button>

					<Button
						variant="outline"
						size="icon"
						onClick={skipBackward}
						className="rounded-full h-11 w-11 relative hover:bg-muted/60 transition-all duration-200"
					>
						<HugeiconsIcon icon={ArrowLeft02Icon} className="w-5 h-5" />
						<span className="text-[9px] font-bold absolute -bottom-0.5 tracking-wide">10</span>
					</Button>

					<Button
						size="icon"
						onClick={togglePlay}
						className={cn(
							'rounded-full h-14 w-14 relative overflow-hidden transition-all duration-200',
							'hover:scale-105 active:scale-95 shadow-lg shadow-primary/25',
							isLoading && 'opacity-80'
						)}
						disabled={isLoading}
					>
						{isLoading ? (
							<div className="absolute inset-0 flex items-center justify-center bg-primary/90">
								<div className="w-5 h-5 border-2 border-white/80 border-t-transparent rounded-full animate-spin" />
							</div>
						) : (
							<HugeiconsIcon
								icon={isPlaying ? PauseIcon : PlayIcon}
								className="w-7 h-7 transition-transform"
							/>
						)}
					</Button>

					<Button
						variant="outline"
						size="icon"
						onClick={skipForward}
						className="rounded-full h-11 w-11 relative hover:bg-muted/60 transition-all duration-200"
					>
						<HugeiconsIcon icon={ArrowRight02Icon} className="w-5 h-5" />
						<span className="text-[9px] font-bold absolute -bottom-0.5 tracking-wide">30</span>
					</Button>

					<div className="w-10" />
				</div>

				<div
					ref={transcriptionRef}
					className="flex-1 min-h-0 overflow-y-auto py-3 mt-1 bg-gradient-to-br from-muted/25 via-muted/15 to-muted/30 rounded-xl p-4"
				>
					<div className="flex justify-end mb-3">
						<Button
							variant="ghost"
							size="sm"
							onClick={handleCopyText}
							className={cn(
								'text-xs gap-1.5 transition-all duration-200 hover:bg-muted/60',
								copied && 'text-green-600 dark:text-green-400'
							)}
						>
							<HugeiconsIcon
								icon={copied ? CheckmarkCircle02Icon : Copy01Icon}
								className="w-3.5 h-3.5"
							/>
							{copied ? 'Copied!' : 'Copy'}
						</Button>
					</div>
					<p className="text-sm leading-7 text-foreground/90">
						{words.map((word, index) => (
							<span
								key={word.id}
								data-word-index={index}
								role="button"
								tabIndex={0}
								onClick={() => handleWordClick(index)}
								onKeyDown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										handleWordClick(index);
									}
								}}
								className={cn(
									'transition-all duration-200 cursor-pointer inline-block rounded-md px-0.5 -mx-0.5',
									'hover:text-primary hover:bg-primary/8',
									activeWordIndex === index
										? 'bg-primary/20 text-primary font-semibold scale-[1.02] shadow-sm'
										: 'text-foreground/90'
								)}
							>
								{word.text}{' '}
							</span>
						))}
					</p>
				</div>
			</div>
		</>
	);
}
