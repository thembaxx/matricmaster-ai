# Client-Side Lite AI + Smart Caching Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a two-layer AI system: Vercel KV caching for static FAQs, WebLLM (Llama-3-8B) as offline fallback.

**Architecture:** 
- Cache layer: Vercel KV for static FAQ queries
- WebLLM: Browser-based Llama-3-8B for offline AI
- Router: Decides cache → online → offline

**Tech Stack:** 
- Vercel KV (@vercel/kv)
- WebLLM (@webllm/core)
- Existing geminiService.ts (keep as primary)

---

## File Structure

```
src/
├── lib/
│   ├── ai/
│   │   └── router.ts           # NEW - AI routing logic
│   ├── cache/
│   │   └── vercel-kv.ts        # NEW - Vercel KV wrapper
│   └── webllm/
│       └── engine.ts            # NEW - WebLLM loader
├── components/
│   └── AI/
│       ├── WebLLMDownloader.tsx  # NEW
│       └── OfflineIndicator.tsx  # NEW
├── stores/
│   └── useOfflineAIStore.ts      # NEW
└── app/
    └── api/
        └── chat/
            └── route.ts         # MODIFY - add cache check
```

---

## Implementation Tasks

### Task 1: Vercel KV Cache Wrapper

**Files:**
- Create: `src/lib/cache/vercel-kv.ts`
- Test: `src/__tests__/cache/vercel-kv.test.ts`

- [ ] **Step 1: Install Vercel KV package**

```bash
cd C:\Users\Themba\Documents\org1128\projects\matricmaster-ai
bun add @vercel/kv
```

- [ ] **Step 2: Write the failing test**

```typescript
// src/__tests__/cache/vercel-kv.test.ts
import { getCachedResponse, setCachedResponse } from '@/lib/cache/vercel-kv';

describe('vercel-kv cache', () => {
  it('should return null for non-existent key', async () => {
    const result = await getCachedResponse('non-existent-question');
    expect(result).toBeNull();
  });

  it('should store and retrieve cached response', async () => {
    const question = 'how to calculate aps score';
    const answer = 'Your APS is calculated by...';
    
    await setCachedResponse(question, answer, 3600);
    const result = await getCachedResponse(question);
    
    expect(result).toBe(answer);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

```bash
bun run test:unit src/__tests__/cache/vercel-kv.test.ts
```

- [ ] **Step 4: Write implementation**

```typescript
// src/lib/cache/vercel-kv.ts
import { kv } from '@vercel/kv';

const CACHE_PREFIX = 'matricmaster:faq:';

export async function getCachedResponse(key: string): Promise<string | null> {
  try {
    const cacheKey = `${CACHE_PREFIX}${key.toLowerCase().trim()}`;
    const result = await kv.get<string>(cacheKey);
    return result;
  } catch (error) {
    console.debug('Cache read error:', error);
    return null;
  }
}

export async function setCachedResponse(
  key: string,
  value: string,
  ttl: number = 86400
): Promise<void> {
  try {
    const cacheKey = `${CACHE_PREFIX}${key.toLowerCase().trim()}`;
    await kv.set(cacheKey, value, { ex: ttl });
  } catch (error) {
    console.debug('Cache write error:', error);
  }
}

export function normalizeQuestion(question: string): string {
  return question.toLowerCase().trim().replace(/\s+/g, ' ');
}
```

- [ ] **Step 5: Run test to verify it passes**

```bash
bun run test:unit src/__tests__/cache/vercel-kv.test.ts
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/cache/ src/__tests__/cache/
git commit -m "feat: add Vercel KV cache wrapper for FAQs"
```

---

### Task 2: WebLLM Engine

**Files:**
- Create: `src/lib/webllm/engine.ts`
- Create: `src/__tests__/webllm/engine.test.ts`

- [ ] **Step 1: Install WebLLM package**

```bash
bun add @webllm/core
```

- [ ] **Step 2: Write the failing test**

```typescript
// src/__tests__/webllm/engine.test.ts
import { WebLLMEngine } from '@/lib/webllm/engine';

describe('WebLLMEngine', () => {
  it('should report isReady as false initially', () => {
    const engine = new WebLLMEngine();
    expect(engine.isReady()).toBe(false);
  });

  it('should report download progress', () => {
    const engine = new WebLLMEngine();
    const progress = engine.getDownloadProgress();
    expect(progress).toBe(0);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

```bash
bun run test:unit src/__tests__/webllm/engine.test.ts
```

- [ ] **Step 4: Write implementation**

```typescript
// src/lib/webllm/engine.ts
import { CreateMLCEngine, MLCEngine } from '@webllm/core';

let engine: MLCEngine | null = null;
let isInitializing = false;
let initPromise: Promise<void> | null = null;

const MODEL_NAME = 'Llama-3-8B-Instruct-q4f32_1-MLC';

export class WebLLMEngine {
  private progress = 0;
  private _isReady = false;

  async initialize(onProgress?: (progress: number) => void): Promise<void> {
    if (this._isReady) return;
    if (isInitializing && initPromise) {
      return initPromise;
    }

    isInitializing = true;
    initPromise = this._doInitialize(onProgress);
    return initPromise;
  }

  private async _doInitialize(onProgress?: (progress: number) => void): Promise<void> {
    try {
      engine = await CreateMLCEngine(
        MODEL_NAME,
        {
          initProgressCallback: (info) => {
            this.progress = Math.round(info.progress * 100);
            onProgress?.(this.progress);
          },
        }
      );
      this._isReady = true;
    } catch (error) {
      console.error('WebLLM init failed:', error);
      throw error;
    }
  }

  isReady(): boolean {
    return this._isReady;
  }

  getDownloadProgress(): number {
    return this.progress;
  }

  async generate(prompt: string): Promise<string> {
    if (!engine || !this._isReady) {
      throw new Error('WebLLM not initialized');
    }

    const messages = [
      { role: 'system', content: 'You are a helpful South African matric study assistant. Answer questions about NSC curriculum, university admissions, and study tips.' },
      { role: 'user', content: prompt }
    ];

    const output = await engine.chat.completions.create({
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    });

    return output.choices[0]?.message?.content || '';
  }
}

export const webllmEngine = new WebLLMEngine();
```

- [ ] **Step 5: Run test to verify it passes**

```bash
bun run test:unit src/__tests__/webllm/engine.test.ts
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/webllm/ src/__tests__/webllm/
git commit -m "feat: add WebLLM engine for offline AI"
```

---

### Task 3: Offline AI Store

**Files:**
- Create: `src/stores/useOfflineAIStore.ts`

- [ ] **Step 1: Create the store**

```typescript
// src/stores/useOfflineAIStore.ts
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { webllmEngine } from '@/lib/webllm/engine';

interface OfflineAIState {
  isModelReady: boolean;
  downloadProgress: number;
  isOffline: boolean;
  initialize: () => Promise<void>;
  setOnlineStatus: (isOnline: boolean) => void;
}

export const useOfflineAIStore = create<OfflineAIState>()(
  persist(
    (set) => ({
      isModelReady: false,
      downloadProgress: 0,
      isOffline: false,

      initialize: async () => {
        try {
          await webllmEngine.initialize((progress) => {
            set({ downloadProgress: progress });
          });
          set({ isModelReady: true, downloadProgress: 100 });
        } catch (error) {
          console.debug('WebLLM init failed:', error);
          set({ downloadProgress: 0 });
        }
      },

      setOnlineStatus: (isOnline: boolean) => {
        set({ isOffline: !isOnline });
      },
    }),
    {
      name: 'offline-ai-store',
      partialize: (state) => ({ isModelReady: state.isModelReady }),
    }
  )
);
```

- [ ] **Step 2: Commit**

```bash
git add src/stores/useOfflineAIStore.ts
git commit -m "feat: add offline AI store"
```

---

### Task 4: AI Router

**Files:**
- Create: `src/lib/ai/router.ts`

- [ ] **Step 1: Create the router**

```typescript
// src/lib/ai/router.ts
import { getCachedResponse, setCachedResponse } from '@/lib/cache/vercel-kv';
import { webllmEngine } from '@/lib/webllm/engine';
import { generateAI, AI_MODELS } from '@/lib/ai-config';

const STATIC_FAQS = new Set([
  'how to calculate aps score',
  'what is the minimum aps for university',
  'how do i apply to university',
  'what is nsc',
  'how to calculate admission point score',
]);

function normalizeQuestion(question: string): string {
  return question.toLowerCase().trim().replace(/\s+/g, ' ');
}

export async function routeAIQuestion(question: string): Promise<string> {
  const normalized = normalizeQuestion(question);
  
  // 1. Check static FAQ cache
  const cached = await getCachedResponse(normalized);
  if (cached) {
    console.debug('Cache hit:', normalized);
    return cached;
  }

  // 2. Check online status
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  if (isOnline) {
    // 3. Use Gemini (existing)
    try {
      const response = await generateAI({ 
        prompt: question,
        model: AI_MODELS.PRIMARY
      });
      
      // Cache if it's a static FAQ
      if (STATIC_FAQS.has(normalized)) {
        await setCachedResponse(normalized, response.text);
      }
      
      return response.text;
    } catch (error) {
      console.debug('Gemini failed, falling back to offline:', error);
    }
  }

  // 4. Offline fallback - use WebLLM
  if (!webllmEngine.isReady()) {
    await webllmEngine.initialize();
  }

  return webllmEngine.generate(question);
}

export function isStaticFAQ(question: string): boolean {
  const normalized = normalizeQuestion(question);
  return STATIC_FAQS.has(normalized);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/ai/router.ts
git commit -m "feat: add AI router with cache + offline fallback"
```

---

### Task 5: UI Components

**Files:**
- Create: `src/components/AI/WebLLMDownloader.tsx`
- Create: `src/components/AI/OfflineIndicator.tsx`

- [ ] **Step 1: Create WebLLMDownloader component**

```tsx
// src/components/AI/WebLLMDownloader.tsx
'use client';

import { DownloadCloudIcon, XIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useEffect, useState } from 'react';
import { useOfflineAIStore } from '@/stores/useOfflineAIStore';
import { Button } from '@/components/ui/button';

export function WebLLMDownloader() {
  const { isModelReady, downloadProgress, initialize } = useOfflineAIStore();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!isModelReady && !dismissed) {
      initialize();
    }
  }, [isModelReady, dismissed, initialize]);

  if (isModelReady || dismissed) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 max-w-md mx-auto z-50">
      <div className="bg-card border border-border rounded-2xl p-4 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <HugeiconsIcon icon={DownloadCloudIcon} className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="font-black text-sm">Downloading Offline AI</h4>
            <p className="text-xs text-muted-foreground mt-1">
              {downloadProgress < 100 
                ? `Downloading Llama-3-8B... ${downloadProgress}%`
                : 'Almost ready!'}
            </p>
            <div className="w-full bg-muted rounded-full h-2 mt-2 overflow-hidden">
              <div 
                className="bg-primary h-full transition-all duration-300"
                style={{ width: `${downloadProgress}%` }}
              />
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setDismissed(true)}
            className="h-8 w-8"
          >
            <HugeiconsIcon icon={XIcon} className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create OfflineIndicator component**

```tsx
// src/components/AI/OfflineIndicator.tsx
'use client';

import { WifiOffIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useEffect, useState } from 'react';

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    setIsOffline(!navigator.onLine);
    
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-amber-500/90 text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium shadow-lg">
        <HugeiconsIcon icon={WifiOffIcon} className="w-4 h-4" />
        Offline Mode
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/AI/
git commit -m "feat: add WebLLM downloader and offline indicator UI"
```

---

### Task 6: Integration

**Files:**
- Modify: `src/app.config.ts` - Add environment variables
- Modify: `src/app/layout.tsx` - Add components

- [ ] **Step 1: Add environment variable template to .env.example**

```bash
# Vercel KV for FAQ caching
KV_URL=
KV_REST_API_TOKEN=
KV_PREFIX=matricmaster:
```

- [ ] **Step 2: Update .env.example**

```bash
git add .env.example
git commit -m "docs: add Vercel KV env vars to .env.example"
```

- [ ] **Step 3: Add components to layout**

```tsx
// In src/app/layout.tsx, add:
// import { WebLLMDownloader } from '@/components/AI/WebLLMDownloader';
// import { OfflineIndicator } from '@/components/AI/OfflineIndicator';

// Inside the body, add components:
// <OfflineIndicator />
// <WebLLMDownloader />
```

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: integrate offline AI components into app layout"
```

---

### Task 7: Integration with Existing AI Tutor API

**Files:**
- Modify: `src/app/api/ai-tutor/route.ts` - Add cache check

- [ ] **Step 1: Update the AI tutor API route**

The existing API at `/api/ai-tutor` handles AI tutor requests. We'll add the cache check to this route.

```typescript
// In src/app/api/ai-tutor/route.ts
// Add at the top imports:
import { routeAIQuestion } from '@/lib/ai/router';

// Replace direct AI call in the POST handler:
// Instead of: const response = await generateAI({...})
// Use:
const response = await routeAIQuestion(userMessage);
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/ai-tutor/route.ts
git commit -m "feat: integrate AI router into ai-tutor API"
```

---

## Summary

| Task | Files | Status |
|------|-------|--------|
| 1. Vercel KV Cache | src/lib/cache/vercel-kv.ts | Pending |
| 2. WebLLM Engine | src/lib/webllm/engine.ts | Pending |
| 3. Offline AI Store | src/stores/useOfflineAIStore.ts | Pending |
| 4. AI Router | src/lib/ai/router.ts | Pending |
| 5. UI Components | src/components/AI/ | Pending |
| 6. Integration | src/app/layout.tsx | Pending |
| 7. AI Tutor Integration | src/app/api/ai-tutor/route.ts | Pending |

---

## Store Separation Notes

The `useOfflineAIStore` is intentionally separate from `useOfflineStore`:

- **useOfflineStore**: Manages quiz downloads for offline study
- **useOfflineAIStore**: Manages WebLLM model state and offline AI capability

These are different concerns (content vs AI), so separate stores keep responsibilities clean.

---

## Testing Checklist

- [ ] Cache returns null for non-existent keys
- [ ] Cache stores and retrieves values
- [ ] WebLLM reports readiness correctly
- [ ] Download progress updates during initialization
- [ ] Router uses cache for static FAQs
- [ ] Router falls back to Gemini when online
- [ ] Router falls back to WebLLM when offline
- [ ] OfflineIndicator shows when offline
- [ ] WebLLMDownloader shows on first load
- [ ] Full chat flow works online
