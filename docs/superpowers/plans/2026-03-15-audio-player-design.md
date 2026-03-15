# AudioPlayer Component Implementation Plan

> **For agentic workers:** REQUIRED: Use this plan to implement the feature. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a reusable audio player component with transcription highlighting that displays in a Drawer on mobile and Dialog on desktop.

**Architecture:** Create a unified AudioPlayer component that wraps transcription word highlighting logic. Use responsive pattern - Drawer for mobile (<768px), Dialog for desktop. Leverage existing TTSButton to trigger the player.

**Tech Stack:** 
- react-speech-highlight for word-by-word transcription highlighting
- shadcn/ui Drawer + Dialog for responsive container
- HTML5 audio for playback control

---

## Task 1: Install react-speech-highlight Library

**Files:**
- Modify: `package.json` (or run install command)

- [ ] **Step 1: Install react-speech-highlight**

Run: `bun add react-speech-highlight`
Expected: Package installed successfully

---

## Task 2: Create AudioPlayer Component

**Files:**
- Create: `src/components/AudioPlayer/AudioPlayer.tsx`
- Create: `src/components/AudioPlayer/index.ts`

- [ ] **Step 1: Create AudioPlayer component with transcription**

```tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useMediaPredicate } from 'react-speech-highlight';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  PlayIcon, 
  PauseIcon, 
  ArrowRewindIcon, 
  ArrowFastForwardIcon,
  VolumeHighIcon,
  VolumeMute01Icon,
  CloseIcon,
} from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Word {
  id: string;
  text: string;
  startTime?: number;
  endTime?: number;
}

interface AudioPlayerProps {
  audioSrc?: string;
  text: string;
  title?: string;
  description?: string;
  words?: Word[];
  isOpen: boolean;
  onClose: () => void;
  autoPlay?: boolean;
}

export function AudioPlayer({
  audioSrc,
  text,
  title,
  description,
  words,
  isOpen,
  onClose,
  autoPlay = false,
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [activeWordId, setActiveWordId] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const isMobile = useMediaPredicate('(max-width: 768px)');

  // Parse text into words if not provided
  const parsedWords = words || text.split(/\s+/).map((word, index) => ({
    id: `word-${index}`,
    text: word,
  }));

  // Find active word based on current time
  useEffect(() => {
    if (!audioRef.current || !parsedWords.length) return;
    
    const currentAudioTime = audioRef.current.currentTime;
    
    // Simple time-based word highlighting (distribute time evenly)
    const wordDuration = duration / parsedWords.length;
    const activeIndex = Math.floor(currentAudioTime / wordDuration);
    
    if (activeIndex >= 0 && activeIndex < parsedWords.length) {
      setActiveWordId(parsedWords[activeIndex].id);
    }
  }, [currentTime, duration, parsedWords]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

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
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(
        audioRef.current.currentTime + 30,
        duration
      );
    }
  };

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(
        audioRef.current.currentTime - 10,
        0
      );
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.volume = vol;
      setVolume(vol);
      setIsMuted(vol === 0);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

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
        />
      )}

      <div className="flex flex-col h-full">
        {/* Header */}
        {(title || description) && (
          <div className="pb-4 border-b border-border">
            {title && (
              <h3 className="font-bold text-lg line-clamp-2">{title}</h3>
            )}
            {description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {description}
              </p>
            )}
          </div>
        )}

        {/* Progress Bar */}
        <div className="py-4">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer 
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 
              [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full 
              [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer
              [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 
              [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary 
              [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 py-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="rounded-full"
          >
            <HugeiconsIcon 
              icon={isMuted ? VolumeMute01Icon : VolumeHighIcon} 
              className="w-5 h-5" 
            />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={skipBackward}
            className="rounded-full h-12 w-12"
          >
            <HugeiconsIcon icon={ArrowRewindIcon} className="w-5 h-5" />
            <span className="text-[10px] absolute -bottom-1">10</span>
          </Button>

          <Button
            size="icon"
            onClick={togglePlay}
            className="rounded-full h-16 w-16"
          >
            <HugeiconsIcon 
              icon={isPlaying ? PauseIcon : PlayIcon} 
              className="w-8 h-8" 
            />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={skipForward}
            className="rounded-full h-12 w-12"
          >
            <HugeiconsIcon icon={ArrowFastForwardIcon} className="w-5 h-5" />
            <span className="text-[10px] absolute -bottom-1">30</span>
          </Button>

          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Transcription */}
        <div className="flex-1 overflow-y-auto py-4 mt-4 bg-muted/30 rounded-lg p-4">
          <p className="text-sm leading-relaxed">
            {parsedWords.map((word, index) => (
              <span
                key={word.id}
                className={cn(
                  'transition-colors duration-150',
                  activeWordId === word.id 
                    ? 'bg-primary/20 text-primary font-medium rounded px-0.5' 
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
```

- [ ] **Step 2: Create index export**

```ts
export { AudioPlayer } from './AudioPlayer';
```

---

## Task 3: Create Responsive AudioPlayer Wrapper

**Files:**
- Create: `src/components/AudioPlayer/ResponsiveAudioPlayer.tsx`

- [ ] **Step 1: Create responsive wrapper with Dialog/Drawer**

```tsx
'use client';

import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { AudioPlayer } from './AudioPlayer';

interface ResponsiveAudioPlayerProps {
  audioSrc?: string;
  text: string;
  title?: string;
  description?: string;
  trigger?: React.ReactNode;
  autoPlay?: boolean;
}

export function ResponsiveAudioPlayer({
  audioSrc,
  text,
  title,
  description,
  trigger,
  autoPlay = false,
}: ResponsiveAudioPlayerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const playerContent = (
    <AudioPlayer
      audioSrc={audioSrc}
      text={text}
      title={title}
      description={description}
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      autoPlay={autoPlay}
    />
  );

  if (isMobile) {
    return (
      <>
        {trigger && (
          <div onClick={() => setIsOpen(true)}>
            {trigger}
          </div>
        )}
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerContent className="h-[80vh]">
            <DrawerHeader>
              <DrawerTitle className="sr-only">Audio Player</DrawerTitle>
              <DrawerDescription className="sr-only">
                Listen to the lesson with transcription
              </DrawerDescription>
            </DrawerHeader>
            <div className="p-4 h-full">
              {playerContent}
            </div>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  return (
    <>
      {trigger && (
        <div onClick={() => setIsOpen(true)}>
          {trigger}
        </div>
      )}
      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg max-h-[80vh] bg-background rounded-xl shadow-xl border border-border p-6 z-50 focus:outline-none">
            <Dialog.Title className="sr-only">Audio Player</Dialog.Title>
            <Dialog.Description className="sr-only">
              Listen to the lesson with transcription
            </Dialog.Description>
            <div className="h-full max-h-[70vh]">
              {playerContent}
            </div>
            <Dialog.Close asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4 rounded-full"
              >
                <span className="sr-only">Close</span>
              </Button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
```

- [ ] **Step 2: Update index to export**

```ts
export { AudioPlayer } from './AudioPlayer';
export { ResponsiveAudioPlayer } from './ResponsiveAudioPlayer';
```

---

## Task 4: Create Audio Player Hook for TTS Integration

**Files:**
- Create: `src/hooks/useAudioPlayer.ts`

- [ ] **Step 1: Create audio player hook**

```ts
import { useState, useCallback, useRef } from 'react';

interface UseAudioPlayerOptions {
  text: string;
  autoPlay?: boolean;
  onWordChange?: (wordIndex: number) => void;
  onComplete?: () => void;
}

export function useAudioPlayer({ text, autoPlay = false, onWordChange, onComplete }: UseAudioPlayerOptions) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const words = text.split(/\s+/);
  
  const play = useCallback(() => {
    if (!('speechSynthesis' in window)) return;
    
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => {
      setIsPlaying(false);
      setCurrentWordIndex(-1);
      onComplete?.();
    };
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        const wordIndex = words.slice(0, event.charIndex).join(' ').split(/\s+/).length - 1;
        setCurrentWordIndex(Math.max(0, wordIndex));
        onWordChange?.(wordIndex);
      }
    };
    
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [text, words, onWordChange, onComplete]);

  const pause = useCallback(() => {
    window.speechSynthesis.pause();
    setIsPlaying(false);
  }, []);

  const resume = useCallback(() => {
    window.speechSynthesis.resume();
    setIsPlaying(true);
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setCurrentWordIndex(-1);
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) {
      pause();
    } else if (window.speechSynthesis.paused) {
      resume();
    } else {
      play();
    }
  }, [isPlaying, play, pause, resume]);

  return {
    isPlaying,
    currentWordIndex,
    words,
    play,
    pause,
    resume,
    stop,
    toggle,
  };
}
```

---

## Task 5: Update TTSButton to Use AudioPlayer

**Files:**
- Modify: `src/components/Lessons/TTSButton.tsx`

- [ ] **Step 1: Update TTSButton to open AudioPlayer**

```tsx
'use client';

import { VolumeHighIcon, VolumeMute01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ResponsiveAudioPlayer } from '@/components/AudioPlayer/ResponsiveAudioPlayer';

interface TTSButtonProps {
  text: string;
  title?: string;
  description?: string;
  className?: string;
}

export function TTSButton({ text, title, description, className }: TTSButtonProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  const [playerOpen, setPlayerOpen] = useState(false);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      setSupported(true);
    }
  }, []);

  useEffect(() => {
    if (!supported) return;

    const handleSpeechStart = () => setIsSpeaking(true);
    const handleSpeechEnd = () => setIsSpeaking(false);

    // Listen for speech events
    const originalSpeak = window.speechSynthesis.speak;
    window.speechSynthesis.speak = function(utterance) {
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      return originalSpeak.call(window.speechSynthesis, utterance);
    };

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [supported]);

  if (!supported) return null;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setPlayerOpen(true)}
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

      <ResponsiveAudioPlayer
        text={text}
        title={title}
        description={description}
        trigger={null}
        autoPlay={true}
      />
    </>
  );
}
```

Actually, let's simplify - we need a separate component for opening the player. Let me revise:

```tsx
'use client';

import { VolumeHighIcon, VolumeMute01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ResponsiveAudioPlayer } from '@/components/AudioPlayer/ResponsiveAudioPlayer';

interface TTSButtonProps {
  text: string;
  title?: string;
  description?: string;
  className?: string;
  showPlayer?: boolean;
}

export function TTSButton({ text, title, description, className, showPlayer = true }: TTSButtonProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  const [playerOpen, setPlayerOpen] = useState(false);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      setSupported(true);
    }
  }, []);

  useEffect(() => {
    if (!supported) return;
    
    const checkSpeaking = setInterval(() => {
      setIsSpeaking(window.speechSynthesis.speaking);
    }, 100);
    
    return () => clearInterval(checkSpeaking);
  }, [supported]);

  const toggleSpeech = () => {
    if (!supported) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  if (!supported) return null;

  if (showPlayer) {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPlayerOpen(true)}
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

        <ResponsiveAudioPlayer
          text={text}
          title={title}
          description={description}
          trigger={null}
          open={playerOpen}
          onOpenChange={setPlayerOpen}
        />
      </>
    );
  }

  // Original inline behavior
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
```

---

## Task 6: Update Lessons Component to Use New TTSButton

**Files:**
- Modify: `src/screens/Lessons.tsx`

- [ ] **Step 1: Update import to include showPlayer prop**

Change: `<TTSButton text={`${lesson.title}. ${lesson.content.slice(0, 200)}`} />`

To: `<TTSButton 
  text={`${lesson.title}. ${lesson.content.slice(0, 200)}`} 
  title={lesson.title}
  showPlayer={true}
/>`

---

## Task 7: Test and Polish

**Files:**
- All created files

- [ ] **Step 1: Run typecheck**

Run: `bun run typecheck`
Expected: No errors

- [ ] **Step 2: Run lint**

Run: `bun run lint`
Expected: No errors

- [ ] **Step 3: Verify component renders correctly**

Manual test: Click TTSButton and verify player opens with transcription

---

## Summary

This plan creates:
1. **AudioPlayer.tsx** - Core player with forward/backward, play/pause, volume, progress bar, and word-by-word transcription highlighting
2. **ResponsiveAudioPlayer.tsx** - Wrapper that shows Dialog on desktop, Drawer on mobile
3. **useAudioPlayer.ts** - Hook for TTS integration with word tracking
4. **Updated TTSButton** - Now opens the full audio player with transcription

The component maintains the app's clean, modern aesthetic with the lavender accent colors and smooth animations.
