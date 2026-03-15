# Audio Player Enhancement Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enhance AudioPlayer with missing features (voice selection, speed control, auto-scroll, word click, loading states, error handling, copy), add visual polish, support audio files, and integrate across Quiz/PastPaperViewer/SnapAndSolve.

**Architecture:** Enhance existing AudioPlayer.tsx with new features, update ResponsiveAudioPlayer.tsx wrapper, add new integration points in Quiz, PastPaperViewer, and SnapAndSolve screens.

**Tech Stack:** React, Web Speech API, @hugeicons/core-free-icons, shadcn/ui components

---

## File Structure

```
src/components/AudioPlayer/
├── AudioPlayer.tsx          # Enhanced core player (MODIFY)
├── ResponsiveAudioPlayer.tsx # Dialog/Drawer wrapper (MODIFY)
└── index.ts                # Exports (MODIFY)

src/screens/
├── Quiz.tsx                # Add audio to AIExplanation (MODIFY)
├── PastPaperViewer.tsx     # Add audio to questions (MODIFY)
├── SnapAndSolve.tsx        # Add audio to solutions (MODIFY)
└── Lessons.tsx             # Already done (VERIFY)
```

---

## Chunk 1: AudioPlayer Core Enhancement

### Task 1: Enhance AudioPlayer.tsx with all missing features

**Files:**
- Modify: `src/components/AudioPlayer/AudioPlayer.tsx:1-260`

- [ ] **Step 1: Read existing AudioPlayer.tsx to understand current implementation**

- [ ] **Step 2: Add new state variables and refs**

```typescript
// Add after existing state declarations
const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
const [selectedVoice, setSelectedVoice] = useState<string>('');
const [playbackSpeed, setPlaybackSpeed] = useState(0.9);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [showSettings, setShowSettings] = useState(false);
const transcriptionRef = useRef<HTMLDivElement>(null);

// Load voices on mount
useEffect(() => {
  if (!('speechSynthesis' in window)) return;
  
  const loadVoices = () => {
    const availableVoices = window.speechSynthesis.getVoices();
    setVoices(availableVoices);
    const savedVoice = localStorage.getItem('selectedVoice');
    const savedSpeed = localStorage.getItem('playbackSpeed');
    if (savedVoice && availableVoices.find(v => v.name === savedVoice)) {
      setSelectedVoice(savedVoice);
    } else if (availableVoices.length > 0) {
      const englishVoice = availableVoices.find(v => v.lang.startsWith('en')) || availableVoices[0];
      setSelectedVoice(englishVoice.name);
    }
    if (savedSpeed) setPlaybackSpeed(parseFloat(savedSpeed));
  };
  
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}, []);
```

- [ ] **Step 3: Add voice selection dropdown and speed control UI**

Add inside the player, after the title/description section:

```typescript
{!audioSrc && (
  <div className="flex items-center gap-3 pb-4 border-b border-border">
    <select
      value={selectedVoice}
      onChange={(e) => {
        setSelectedVoice(e.target.value);
        localStorage.setItem('selectedVoice', e.target.value);
      }}
      className="flex-1 text-sm bg-muted rounded-lg px-3 py-2 border"
    >
      {voices.map((voice) => (
        <option key={voice.name} value={voice.name}>
          {voice.name} ({voice.lang})
        </option>
      ))}
    </select>
    
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">{playbackSpeed.toFixed(1)}x</span>
      <input
        type="range"
        min="0.5"
        max="2"
        step="0.1"
        value={playbackSpeed}
        onChange={(e) => {
          const speed = parseFloat(e.target.value);
          setPlaybackSpeed(speed);
          localStorage.setItem('playbackSpeed', speed.toString());
        }}
        className="w-20"
      />
    </div>
  </div>
)}
```

- [ ] **Step 4: Add loading and error states**

Add before the main player content:

```typescript
{isLoading && (
  <div className="flex items-center justify-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
)}

{error && (
  <div className="p-3 bg-destructive/10 rounded-lg text-sm text-destructive">
    {error}
  </div>
)}
```

- [ ] **Step 5: Update togglePlay to use selected voice and speed**

Replace the TTS section in togglePlay:

```typescript
// In the else branch (TTS)
const utterance = new SpeechSynthesisUtterance(text);
if (selectedVoice) {
  const voice = voices.find(v => v.name === selectedVoice);
  if (voice) utterance.voice = voice;
}
utterance.rate = playbackSpeed;

// Add loading
setIsLoading(true);
utterance.onstart = () => {
  setIsPlaying(true);
  setIsLoading(false);
};
```

- [ ] **Step 6: Add auto-scroll to active word**

Update the onboundary handler:

```typescript
utterance.onboundary = (event) => {
  if (event.name === 'word') {
    const wordCount = text.slice(0, event.charIndex).split(/\s+/).length - 1;
    const newIndex = Math.max(0, wordCount);
    setActiveWordIndex(newIndex);
    
    // Auto-scroll to highlighted word
    if (transcriptionRef.current) {
      const wordElement = transcriptionRef.current.querySelector(`[data-word-index="${newIndex}"]`);
      if (wordElement) {
        wordElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }
};
```

- [ ] **Step 7: Add word click handler and copy button**

Add to the transcription section:

```typescript
<div ref={transcriptionRef} className="flex-1 overflow-y-auto py-4 mt-2 bg-muted/30 rounded-lg p-4">
  <div className="flex justify-end mb-2">
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        navigator.clipboard.writeText(text);
        // Show toast or feedback
      }}
      className="text-xs"
    >
      Copy
    </Button>
  </div>
  <p className="text-sm leading-relaxed">
    {words.map((word, index) => (
      <span
        key={word.id}
        data-word-index={index}
        onClick={() => {
          // Start TTS from this word
          const remainingText = words.slice(index).map(w => w.text).join(' ');
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(remainingText);
          if (selectedVoice) {
            const voice = voices.find(v => v.name === selectedVoice);
            if (voice) utterance.voice = voice;
          }
          utterance.rate = playbackSpeed;
          utterance.onstart = () => setIsPlaying(true);
          utterance.onend = () => {
            setIsPlaying(false);
            setActiveWordIndex(-1);
          };
          window.speechSynthesis.speak(utterance);
          setIsPlaying(true);
          setActiveWordIndex(index);
        }}
        className={cn(
          'transition-all duration-150 cursor-pointer hover:text-primary',
          activeWordIndex === index
            ? 'bg-primary/20 text-primary font-semibold rounded px-0.5 scale-105 inline-block'
            : 'text-foreground'
        )}
      >
        {word.text}{' '}
      </span>
    ))}
  </p>
</div>
```

- [ ] **Step 8: Add waveform visualization**

Add after the controls section, before transcription:

```typescript
{audioSrc && (
  <div className="flex items-center justify-center gap-1 py-4 h-12">
    {Array.from({ length: 20 }).map((_, i) => (
      <div
        key={i}
        className={cn(
          'w-1 rounded-full transition-all duration-150',
          isPlaying 
            ? 'bg-primary animate-pulse' 
            : 'bg-muted-foreground/30',
          isPlaying && `animate-pulse delay-${i % 5}00`
        )}
        style={{
          height: isPlaying 
            ? `${Math.random() * 100}%` 
            : '20%',
          animationDuration: isPlaying ? '0.5s' : '0s'
        }}
      />
    ))}
  </div>
)}
```

- [ ] **Step 9: Run lint and fix any issues**

Run: `bun run lint:fix`

---

## Chunk 2: ResponsiveAudioPlayer Updates

### Task 2: Update ResponsiveAudioPlayer wrapper

**Files:**
- Modify: `src/components/AudioPlayer/ResponsiveAudioPlayer.tsx:1-147`

- [ ] **Step 1: Read current ResponsiveAudioPlayer.tsx**

- [ ] **Step 2: Add autoPlay prop handling**

Ensure autoPlay works correctly when opening the player:

```typescript
// In the playerContent, pass autoPlay
<AudioPlayer
  audioSrc={audioSrc}
  text={text}
  title={title}
  description={description}
  isOpen={isOpen}
  autoPlay={autoPlay}
/>
```

- [ ] **Step 3: Improve Dialog styling**

Update the Dialog.Content for better visual polish:

```typescript
// Make max-height larger for more transcription space
<div className="h-full max-h-[75vh] overflow-hidden">{playerContent}</div>
```

---

## Chunk 3: Quiz Integration

### Task 3: Add AudioPlayer to AIExplanation in Quiz

**Files:**
- Modify: `src/components/Quiz/AIExplanation.tsx:1-143`

- [ ] **Step 1: Read AIExplanation.tsx**

- [ ] **Step 2: Add imports for ResponsiveAudioPlayer**

```typescript
import { ResponsiveAudioPlayer } from '@/components/AudioPlayer';
import { VolumeHighIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@/components/ui/button';
```

- [ ] **Step 3: Add state for audio player**

```typescript
const [showAudioPlayer, setShowAudioPlayer] = useState(false);
```

- [ ] **Step 4: Add Listen button in explanation section**

After the explanation text is loaded, add a button:

```typescript
{explanation && (
  <div className="p-4 bg-card rounded-xl border">
    <div className="flex items-center justify-between mb-3">
      <div className="prose prose-sm dark:prose-invert max-w-none flex-1">
        <p className="text-sm whitespace-pre-wrap">{explanation}</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowAudioPlayer(true)}
        className="rounded-full ml-2 shrink-0"
        title="Listen to explanation"
      >
        <HugeiconsIcon icon={VolumeHighIcon} className="w-5 h-5" />
      </Button>
    </div>
    <ResponsiveAudioPlayer
      text={explanation}
      title="Question Explanation"
      open={showAudioPlayer}
      onOpenChange={setShowAudioPlayer}
    />
  </div>
)}
```

- [ ] **Step 5: Run lint**

Run: `bun run lint:fix`

---

## Chunk 4: PastPaperViewer Integration

### Task 4: Add audio to PastPaperViewer

**Files:**
- Modify: `src/screens/PastPaperViewer.tsx`

- [ ] **Step 1: Read PastPaperViewer.tsx**

- [ ] **Step 2: Add imports**

```typescript
import { ResponsiveAudioPlayer } from '@/components/AudioPlayer';
import { VolumeHighIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@/components/ui/button';
```

- [ ] **Step 3: Add state for audio player**

```typescript
const [audioText, setAudioText] = useState('');
const [audioTitle, setAudioTitle] = useState('');
const [showAudioPlayer, setShowAudioPlayer] = useState(false);
```

- [ ] **Step 4: Add audio button to question display**

Find where questions are rendered and add an audio button:

```typescript
// Add after question text
<div className="flex items-start gap-2">
  <p className="flex-1 text-sm">{questionText}</p>
  <Button
    variant="ghost"
    size="icon"
    onClick={() => {
      setAudioText(questionText);
      setAudioTitle(`Question ${index + 1}`);
      setShowAudioPlayer(true);
    }}
    className="shrink-0"
  >
    <HugeiconsIcon icon={VolumeHighIcon} className="w-4 h-4" />
  </Button>
</div>

{showAudioPlayer && (
  <ResponsiveAudioPlayer
    text={audioText}
    title={audioTitle}
    open={showAudioPlayer}
    onOpenChange={setShowAudioPlayer}
  />
)}
```

- [ ] **Step 5: Run lint**

Run: `bun run lint:fix`

---

## Chunk 5: SnapAndSolve Integration

### Task 5: Add audio to SnapAndSolve

**Files:**
- Modify: `src/screens/SnapAndSolve.tsx`

- [ ] **Step 1: Read SnapAndSolve.tsx**

- [ ] **Step 2: Add imports**

```typescript
import { ResponsiveAudioPlayer } from '@/components/AudioPlayer';
import { VolumeHighIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@/components/ui/button';
```

- [ ] **Step 3: Add state for audio player**

```typescript
const [audioText, setAudioText] = useState('');
const [showAudioPlayer, setShowAudioPlayer] = useState(false);
```

- [ ] **Step 4: Add audio button to solution display**

Find where solutions are rendered and add audio button:

```typescript
// After solution text
<Button
  variant="ghost"
  size="icon"
  onClick={() => {
    setAudioText(solutionText);
    setShowAudioPlayer(true);
  }}
>
  <HugeiconsIcon icon={VolumeHighIcon} className="w-4 h-4" />
</Button>

{showAudioPlayer && (
  <ResponsiveAudioPlayer
    text={audioText}
    title="Solution"
    open={showAudioPlayer}
    onOpenChange={setShowAudioPlayer}
  />
)}
```

- [ ] **Step 5: Run lint**

Run: `bun run lint:fix`

---

## Chunk 6: Final Verification

### Task 6: Verify all integrations work

- [ ] **Step 1: Test AudioPlayer features**

- [ ] **Step 2: Run full lint check**

Run: `bun run lint:fix`

- [ ] **Step 3: Build and verify**

Run: `bun run build`

---

## Summary

Total Tasks: 6 main tasks with ~25 steps

**Key Files Modified:**
1. `src/components/AudioPlayer/AudioPlayer.tsx` - Core enhancement
2. `src/components/AudioPlayer/ResponsiveAudioPlayer.tsx` - Wrapper update
3. `src/components/Quiz/AIExplanation.tsx` - Quiz integration
4. `src/screens/PastPaperViewer.tsx` - Past papers integration
5. `src/screens/SnapAndSolve.tsx` - Snap & solve integration
