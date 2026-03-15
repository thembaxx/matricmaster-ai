# Audio Player Enhancement - Specification

**Date:** 2026-03-15  
**Status:** Approved  
**Scope:** Full implementation - features, polish, audio support, integrations

---

## 1. Overview

Enhance the existing AudioPlayer component with missing features, visual polish, audio file support, and integrate it across the app (Quiz, PastPaperViewer, SnapAndSolve).

---

## 2. Missing Features

### 2.1 Voice Selection
- Dropdown showing available browser TTS voices
- Persist selected voice in localStorage
- Default to first available English voice

### 2.2 Playback Speed Control
- Slider from 0.5x to 2.0x
- Display current speed (e.g., "1.0x")
- Persist speed preference in localStorage

### 2.3 Auto-scroll to Active Word
- Use `scrollIntoView` with `block: 'center'` when word highlights change
- Smooth scroll behavior

### 2.4 Click Word to Jump
- Each word clickable
- Click starts TTS from that word
- Update activeWordIndex accordingly

### 2.5 Loading State
- Show skeleton/spinner while voices load
- Show loading indicator when TTS is starting

### 2.6 Error Handling
- Toast notification when TTS fails
- Fallback message: "Audio unavailable"

### 2.7 Copy Text
- Button to copy transcription to clipboard
- Show "Copied!" feedback

---

## 3. Visual Polish

### 3.1 Waveform Visualization
- Simple animated bars during playback
- Static when paused

### 3.2 Animations
- Smooth play/pause transitions
- Button press scale effects

### 3.3 Progress Bar
- Thicker track (h-3)
- Glowing thumb
- Time tooltip on hover/drag

### 3.4 Styling
- Gradient accent backgrounds
- Consistent icon sizing (all w-5 h-5)
- Better spacing and padding

---

## 4. Audio File Support

### 4.1 Implementation
- Accept optional `audioSrc` prop
- When provided: use native `<audio>` element
- TTS becomes secondary option

### 4.2 UI Differences
- With audio file: show full controls (seek, time)
- With TTS only: show TTS-specific controls (speed, voice)

---

## 5. Integration Points

### 5.1 Quiz - AIExplanation
- Add "Listen" button to AI explanations
- Opens ResponsiveAudioPlayer with explanation text
- Title: "Question Explanation"

### 5.2 PastPaperViewer
- Add audio button next to question text
- Read questions aloud

### 5.3 SnapAndSolve
- Add audio button to solutions
- Read step-by-step solutions

### 5.4 Lessons (Already Done)
- Already integrated with TTSButton

---

## 6. Component Structure

```
src/components/AudioPlayer/
├── AudioPlayer.tsx          # Enhanced core player
├── ResponsiveAudioPlayer.tsx # Dialog/Drawer wrapper
├── AudioControls.tsx        # Reusable controls (optional)
└── index.ts                # Exports
```

---

## 7. Acceptance Criteria

- [ ] Voice selection dropdown works and persists
- [ ] Playback speed adjustable 0.5x-2.0x
- [ ] Transcription auto-scrolls to highlighted word
- [ ] Clicking word starts playback from that word
- [ ] Loading state shows while TTS initializes
- [ ] Error toast shows on TTS failure
- [ ] Copy button copies text to clipboard
- [ ] Visual polish applied (waveform, animations)
- [ ] Audio file support works with audioSrc prop
- [ ] Integrated in Quiz → AIExplanation
- [ ] Integrated in PastPaperViewer
- [ ] Integrated in SnapAndSolve
