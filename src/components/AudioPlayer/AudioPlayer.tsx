'use client';

import { useAudioPlayer } from '@/hooks/useAudioPlayer';
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

export function AudioPlayer({
	audioSrc,
	text,
	title,
	description,
	isOpen,
	autoPlay = false,
}: AudioPlayerProps) {
	const {
		isPlaying,
		currentTime,
		duration,
		isMuted,
		activeWordIndex,
		voices,
		selectedVoice,
		playbackSpeed,
		isLoading,
		error,
		showSettings,
		setShowSettings,
		copied,
		isAudioLoaded,
		audioError,
		audioRef,
		transcriptionRef,
		words,
		isAudioAvailable,
		handleAudioError,
		handleAudioCanPlay,
		togglePlay,
		handleWordClick,
		handleTimeUpdate,
		handleLoadedMetadata,
		handleAudioEnded,
		skipForward,
		skipBackward,
		toggleMute,
		handleSeek,
		handleSpeedChange,
		handleVoiceChange,
		handleCopyText,
		formatTime,
		retryAudio,
		retryTTS,
		switchToTTS,
	} = useAudioPlayer({ audioSrc, text, isOpen, autoPlay });

	return (
		<>
			{audioSrc && (
				<audio
					ref={audioRef}
					src={audioSrc}
					onTimeUpdate={handleTimeUpdate}
					onLoadedMetadata={handleLoadedMetadata}
					onEnded={handleAudioEnded}
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
