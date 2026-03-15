'use client';

import {
	ArrowLeft02Icon,
	ArrowRight02Icon,
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

export function AudioPlayer({
	audioSrc,
	text,
	title,
	description,
	isOpen,
	autoPlay = false,
}: AudioPlayerProps) {
	const [isPlaying, setIsPlaying] = useState(false);
	const [_currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [isMuted, setIsMuted] = useState(false);
	const [activeWordIndex, setActiveWordIndex] = useState(-1);
	const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
	const [selectedVoice, setSelectedVoice] = useState<string>('');
	const [playbackSpeed, setPlaybackSpeed] = useState(0.9);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [showSettings, setShowSettings] = useState(false);
	const [copied, setCopied] = useState(false);

	const audioRef = useRef<HTMLAudioElement | null>(null);
	const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
	const transcriptionRef = useRef<HTMLDivElement>(null);

	const words = text.split(/\s+/).map((word, index) => ({
		id: `word-${index}`,
		text: word,
	}));

	useEffect(() => {
		if (!('speechSynthesis' in window)) return;

		const loadVoices = () => {
			const availableVoices = window.speechSynthesis.getVoices();
			setVoices(availableVoices);

			const savedVoice = localStorage.getItem('selectedVoice');
			const savedSpeed = localStorage.getItem('playbackSpeed');

			if (savedVoice && availableVoices.find((v) => v.name === savedVoice)) {
				setSelectedVoice(savedVoice);
			} else if (availableVoices.length > 0) {
				const englishVoice =
					availableVoices.find((v) => v.lang.startsWith('en')) || availableVoices[0];
				setSelectedVoice(englishVoice.name);
			}

			if (savedSpeed) {
				setPlaybackSpeed(Number.parseFloat(savedSpeed));
			}
		};

		loadVoices();
		window.speechSynthesis.onvoiceschanged = loadVoices;
	}, []);

	const startTTS = useCallback(
		(startText: string, fromIndex = 0) => {
			if (!('speechSynthesis' in window)) {
				setError('Speech synthesis not supported');
				return;
			}

			window.speechSynthesis.cancel();
			setIsLoading(true);
			setError(null);

			const utterance = new SpeechSynthesisUtterance(startText);

			if (selectedVoice) {
				const voice = voices.find((v) => v.name === selectedVoice);
				if (voice) utterance.voice = voice;
			}

			utterance.rate = playbackSpeed;

			utterance.onstart = () => {
				setIsPlaying(true);
				setIsLoading(false);
			};

			utterance.onend = () => {
				setIsPlaying(false);
				setActiveWordIndex(-1);
			};

			utterance.onerror = (event) => {
				setIsPlaying(false);
				setIsLoading(false);
				setActiveWordIndex(-1);
				if (event.error !== 'canceled') {
					setError('Failed to play audio. Please try again.');
				}
			};

			utterance.onboundary = (event) => {
				if (event.name === 'word') {
					const wordCount = startText.slice(0, event.charIndex).split(/\s+/).length - 1;
					const newIndex = fromIndex + Math.max(0, wordCount);
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
			};

			utteranceRef.current = utterance;
			window.speechSynthesis.speak(utterance);
			setIsPlaying(true);
		},
		[selectedVoice, playbackSpeed, voices]
	);

	const togglePlay = useCallback(() => {
		if (audioSrc && audioRef.current) {
			if (isPlaying) {
				audioRef.current.pause();
			} else {
				audioRef.current.play();
			}
			setIsPlaying(!isPlaying);
		} else {
			if (isPlaying) {
				window.speechSynthesis.cancel();
				setIsPlaying(false);
				setActiveWordIndex(-1);
			} else {
				startTTS(text);
			}
		}
	}, [audioSrc, isPlaying, text, startTTS]);

	const handleWordClick = useCallback(
		(index: number) => {
			const remainingWords = words.slice(index);
			const remainingText = remainingWords.map((w) => w.text).join(' ');
			startTTS(remainingText, index);
		},
		[words, startTTS]
	);

	const handleTimeUpdate = () => {
		if (audioRef.current) {
			setCurrentTime(audioRef.current.currentTime);
		}
	};

	const handleLoadedMetadata = () => {
		if (audioRef.current) {
			setDuration(audioRef.current.duration);
		}
	};

	const skipForward = () => {
		if (audioSrc && audioRef.current) {
			audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 30, duration);
		} else {
			window.speechSynthesis.cancel();
			setIsPlaying(false);
		}
	};

	const skipBackward = () => {
		if (audioSrc && audioRef.current) {
			audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 10, 0);
		} else {
			window.speechSynthesis.cancel();
			setIsPlaying(false);
		}
	};

	const toggleMute = () => {
		if (audioSrc && audioRef.current) {
			audioRef.current.muted = !isMuted;
			setIsMuted(!isMuted);
		} else {
			setIsMuted(!isMuted);
		}
	};

	const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
		const time = Number.parseFloat(e.target.value);
		if (audioRef.current) {
			audioRef.current.currentTime = time;
			setCurrentTime(time);
		}
	};

	const handleSpeedChange = (speed: number) => {
		setPlaybackSpeed(speed);
		localStorage.setItem('playbackSpeed', speed.toString());
	};

	const handleVoiceChange = (voiceName: string) => {
		setSelectedVoice(voiceName);
		localStorage.setItem('selectedVoice', voiceName);
	};

	const handleCopyText = () => {
		navigator.clipboard.writeText(text);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const formatTime = (time: number) => {
		const minutes = Math.floor(time / 60);
		const seconds = Math.floor(time % 60);
		return `${minutes}:${seconds.toString().padStart(2, '0')}`;
	};

	useEffect(() => {
		if (isOpen && autoPlay) {
			togglePlay();
		}
	}, [isOpen, autoPlay, togglePlay]);

	useEffect(() => {
		return () => {
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
					onEnded={() => setIsPlaying(false)}
					onPlay={() => setIsPlaying(true)}
					onPause={() => setIsPlaying(false)}
				>
					<track kind="captions" />
				</audio>
			)}

			<div className="flex flex-col h-full">
				{(title || description) && (
					<div className="pb-4 border-b border-border">
						{title && <h3 className="font-bold text-lg line-clamp-2">{title}</h3>}
						{description && (
							<p className="text-sm text-muted-foreground line-clamp-2 mt-1">{description}</p>
						)}
					</div>
				)}

				{audioSrc && (
					<div className="py-4">
						<div className="flex items-center justify-center gap-1 py-2 h-10 mb-2">
							{Array.from({ length: 20 }).map((_, i) => (
								<div
									key={i}
									className={cn(
										'w-1 rounded-full transition-all duration-150',
										isPlaying ? 'bg-primary animate-pulse' : 'bg-muted-foreground/30'
									)}
									style={{
										height: isPlaying ? `${20 + Math.random() * 80}%` : '20%',
										animationDelay: isPlaying ? `${i * 50}ms` : '0ms',
									}}
								/>
							))}
						</div>

						<input
							type="range"
							min={0}
							max={duration || 100}
							value={_currentTime}
							onChange={handleSeek}
							className="w-full h-3 bg-secondary rounded-full appearance-none cursor-pointer 
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 
              [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full 
              [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-primary/30
              [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 
              [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary 
              [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
						/>
						<div className="flex justify-between text-xs text-muted-foreground mt-1">
							<span>{formatTime(_currentTime)}</span>
							<span>{formatTime(duration)}</span>
						</div>
					</div>
				)}

				{!audioSrc && (
					<div className="py-3 space-y-3">
						<div className="flex items-center gap-3">
							<select
								value={selectedVoice}
								onChange={(e) => handleVoiceChange(e.target.value)}
								className="flex-1 text-sm bg-muted rounded-lg px-3 py-2 border border-input focus:outline-none focus:ring-2 focus:ring-primary"
								disabled={voices.length === 0}
							>
								{voices.length === 0 ? (
									<option>Loading voices...</option>
								) : (
									voices.map((voice) => (
										<option key={voice.name} value={voice.name}>
											{voice.name.length > 30 ? `${voice.name.slice(0, 30)}...` : voice.name} (
											{voice.lang})
										</option>
									))
								)}
							</select>

							<Button
								variant="ghost"
								size="icon"
								onClick={() => setShowSettings(!showSettings)}
								className={cn('rounded-full h-10 w-10', showSettings && 'bg-muted')}
							>
								<HugeiconsIcon icon={Settings01Icon} className="w-5 h-5" />
							</Button>
						</div>

						{showSettings && (
							<div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
								<div className="flex items-center gap-2 flex-1">
									<span className="text-xs text-muted-foreground whitespace-nowrap">
										Speed: {playbackSpeed.toFixed(1)}x
									</span>
									<input
										type="range"
										min="0.5"
										max="2"
										step="0.1"
										value={playbackSpeed}
										onChange={(e) => handleSpeedChange(Number.parseFloat(e.target.value))}
										className="flex-1 h-2 bg-secondary rounded-full appearance-none cursor-pointer 
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 
                      [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full 
                      [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer"
									/>
								</div>
							</div>
						)}
					</div>
				)}

				<div className="flex items-center justify-center gap-3 py-4">
					<Button
						variant="ghost"
						size="icon"
						onClick={toggleMute}
						className="rounded-full h-10 w-10"
					>
						<HugeiconsIcon icon={isMuted ? VolumeMute01Icon : VolumeHighIcon} className="w-5 h-5" />
					</Button>

					<Button
						variant="outline"
						size="icon"
						onClick={skipBackward}
						className="rounded-full h-12 w-12 relative"
					>
						<HugeiconsIcon icon={ArrowLeft02Icon} className="w-5 h-5" />
						<span className="text-[8px] font-bold absolute -bottom-0.5">10</span>
					</Button>

					<Button
						size="icon"
						onClick={togglePlay}
						className="rounded-full h-14 w-14 relative overflow-hidden"
						disabled={isLoading}
					>
						{isLoading ? (
							<div className="absolute inset-0 flex items-center justify-center">
								<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
							</div>
						) : (
							<HugeiconsIcon icon={isPlaying ? PauseIcon : PlayIcon} className="w-7 h-7" />
						)}
					</Button>

					<Button
						variant="outline"
						size="icon"
						onClick={skipForward}
						className="rounded-full h-12 w-12 relative"
					>
						<HugeiconsIcon icon={ArrowRight02Icon} className="w-5 h-5" />
						<span className="text-[8px] font-bold absolute -bottom-0.5">30</span>
					</Button>

					<div className="w-10" />
				</div>

				{error && (
					<div className="mx-4 mb-4 p-3 bg-destructive/10 rounded-lg">
						<p className="text-sm text-destructive">{error}</p>
					</div>
				)}

				<div
					ref={transcriptionRef}
					className="flex-1 overflow-y-auto py-4 mt-2 bg-gradient-to-br from-muted/20 to-muted/40 rounded-xl p-4"
				>
					<div className="flex justify-end mb-3">
						<Button
							variant="ghost"
							size="sm"
							onClick={handleCopyText}
							className="text-xs transition-all"
						>
							{copied ? <span className="text-green-500">Copied!</span> : 'Copy text'}
						</Button>
					</div>
					<p className="text-sm leading-relaxed">
						{words.map((word, index) => (
							<span
								key={word.id}
								role="button"
								tabIndex={0}
								onClick={() => handleWordClick(index)}
								onKeyDown={(e) => {
									if (e.key === 'Enter' || e.key === ')') {
										handleWordClick(index);
									}
								}}
								className={cn(
									'transition-all duration-150 cursor-pointer hover:text-primary hover:bg-primary/10 rounded px-0.5',
									activeWordIndex === index
										? 'bg-primary/25 text-primary font-bold rounded px-1 scale-105 inline-block shadow-sm'
										: 'text-foreground'
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
