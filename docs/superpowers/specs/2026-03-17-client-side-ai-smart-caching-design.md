# Client-Side Lite AI + Smart Caching Specification

## Overview

Implement a two-layer AI system: (1) Vercel KV caching for static FAQ queries, (2) WebLLM (Llama-3-8B) as offline fallback when internet is unavailable.

## Goals

1. **Cost Reduction**: Cache static FAQ queries at edge level
2. **Offline Support**: Enable AI tutoring without internet
3. **User Experience**: Seamless fallback with download progress

## Architecture

```
User Query → Vercel KV Cache Check
  ├── Cache Hit → Return cached response
  └── Cache Miss → Check Online Status
        ├── Online → Gemini API → Cache Response → Return
        └── Offline → WebLLM (Llama-3-8B) → Return
```

## Components

### 1. Cache Layer (Vercel KV)

**Location**: `src/lib/cache/vercel-kv.ts`

**Functionality**:
- `getCachedResponse(key: string): Promise<string | null>`
- `setCachedResponse(key: string, value: string, ttl?: number): Promise<void>`
- Cache key = normalized question (lowercase, trimmed)

**Cached Questions** (Static FAQs):
- APS calculation questions
- University admission requirements
- Study tips and general guidance

### 2. WebLLM Engine

**Location**: `src/lib/webllm/engine.ts`

**Functionality**:
- `initialize(): Promise<void>` - Load model (first time ~4GB)
- `generate(prompt: string): Promise<string>`
- `isReady(): boolean`
- `downloadProgress(): number` - 0-100

**Model**: Llama-3-8B (via @webllm/core)

### 3. AI Router

**Location**: `src/lib/ai/router.ts`

**Functionality**:
- `routeQuestion(question: string): Promise<AIMessage>`
- Decides: cache → online → offline
- Handles error recovery

### 4. UI Components

**WebLLMDownloader** (`src/components/AI/WebLLMDownloader.tsx`):
- Shows download progress on first use
- Dismissible banner once complete

**OfflineIndicator** (`src/components/AI/OfflineIndicator.tsx`):
- Subtle badge when offline mode active

### 5. Store

**useOfflineAIStore** (`src/stores/useOfflineAIStore.ts`):
- `isModelReady: boolean`
- `downloadProgress: number`
- `isOffline: boolean`
- `initialize(): Promise<void>`

## Configuration

### Environment Variables
```
KV_URL=your_vercel_kv_rest_api_url
KV_REST_API_TOKEN=your_vercel_kv_token
KV_PREFIX=matricmaster:
```

### Cached Questions (Initial Set)
```typescript
const STATIC_FAQS = [
  "how to calculate aps score",
  "what is the minimum aps for university of cape town",
  "what subjects are required for medicine",
  "how do i apply to south african universities",
  "what is the nsc certificate",
  "how to calculate your admission point score",
];
```

## Data Flow

1. **Query Received**: Normalize question → generate cache key
2. **Cache Check**: Look up in Vercel KV
   - If hit: return immediately
   - If miss: continue to routing
3. **Online Check**: `navigator.onLine`
   - If online: call Gemini → cache result → return
   - If offline: check WebLLM readiness
4. **WebLLM Execution**:
   - If not ready: trigger download, show UI
   - If ready: generate response → return

## Edge Cases

1. **First-time Offline Use**: Show download progress, block until complete
2. **Partial Download**: Resume capability via WebLLM checkpointing
3. **Cache Expired**: Re-fetch from Gemini, update cache
4. **WebLLM Error**: Fall back gracefully, show error message
5. **Vercel KV Unavailable**: Skip cache, use online fallback

## Success Criteria

- [ ] Static FAQs served from cache (< 50ms latency)
- [ ] WebLLM loads within 60 seconds on broadband
- [ ] Offline mode fully functional after initial download
- [ ] No visible UX degradation when switching modes
- [ ] Cache hit rate > 80% for configured FAQs

## File Structure

```
src/
├── lib/
│   ├── ai/
│   │   └── router.ts           # AI routing logic
│   ├── cache/
│   │   └── vercel-kv.ts        # Vercel KV wrapper
│   └── webllm/
│       └── engine.ts           # WebLLM loader
├── components/
│   └── AI/
│       ├── WebLLMDownloader.tsx
│       └── OfflineIndicator.tsx
└── stores/
    └── useOfflineAIStore.ts    # Offline AI state
```

## Testing

1. **Cache Tests**: Verify KV get/set operations
2. **Offline Tests**: Simulate `navigator.onLine = false`
3. **WebLLM Tests**: Verify model loads and generates
4. **Integration Tests**: Full flow with mocked Gemini
