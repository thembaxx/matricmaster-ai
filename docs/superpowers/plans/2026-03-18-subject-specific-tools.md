# Subject-Specific Tools Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development (if subagents available) or execute plan in current session. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Virtual Science Lab (Circuits, Momentum, Waves) and Math Graphing Engine - interactive NSC Grade 12 learning tools

**Architecture:** 
- Math Graphing Engine: Custom HTML5 Canvas renderer with mathjs for equation parsing
- Virtual Science Lab: SVG-based visualizations with Zustand state management
- Both use existing UI patterns (shadcn components, Tailwind, Framer Motion)

**Tech Stack:** 
- mathjs (for equation parsing)
- HTML5 Canvas (graphing)
- SVG (physics simulations)
- Zustand (state)
- Existing: Next.js 16, TypeScript, Tailwind, shadcn/ui, Framer Motion

---

# Part 1: Math Graphing Engine

## Files

### New Files to Create

- `src/app/math/graph/page.tsx` - Main graphing page
- `src/components/Graphing/GraphEngine.tsx` - Canvas renderer with pan/zoom
- `src/components/Graphing/FunctionInput.tsx` - Equation input component
- `src/components/Graphing/FunctionList.tsx` - Active functions list
- `src/components/Graphing/SliderPanel.tsx` - Auto-generated parameter sliders
- `src/components/Graphing/AnalysisPanel.tsx` - Intersections/roots display
- `src/components/Graphing/TemplateGallery.tsx` - Pre-built NSC templates
- `src/components/Graphing/GraphToolbar.tsx` - Zoom, grid, trace toggles
- `src/stores/useGraphingEngine.ts` - Zustand store for graphing state
- `src/lib/graphing/parser.ts` - Equation parsing utilities
- `src/lib/graphing/renderer.ts` - Canvas rendering logic
- `src/lib/graphing/analysis.ts` - Intersection/root finding algorithms

### Files to Modify

- `src/app.config.ts` - Add `/math/graph` route

---

## Task 1: Setup and Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add mathjs dependency**

Run: `bun add mathjs && bun add -d @types/mathjs`

- [ ] **Step 2: Run typecheck**

Run: `bun run typecheck`
Expected: PASS

---

## Task 2: Graphing Store and Utilities

**Files:**
- Create: `src/stores/useGraphingEngine.ts`
- Create: `src/lib/graphing/parser.ts`
- Create: `src/lib/graphing/renderer.ts`
- Create: `src/lib/graphing/analysis.ts`

- [ ] **Step 1: Create Zustand store for graphing**

```typescript
// src/stores/useGraphingEngine.ts
import { create } from 'zustand';

interface GraphFunction {
  id: string;
  expression: string;
  color: string;
  visible: boolean;
}

interface Viewport {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

interface GraphState {
  functions: GraphFunction[];
  viewport: Viewport;
  params: Record<string, number>;
  showGrid: boolean;
  showTrace: boolean;
  tracePoint: { x: number; y: number } | null;
  
  addFunction: (expression: string) => void;
  removeFunction: (id: string) => void;
  toggleVisibility: (id: string) => void;
  setParam: (key: string, value: number) => void;
  setViewport: (viewport: Partial<Viewport>) => void;
  toggleGrid: () => void;
  setTracePoint: (point: { x: number; y: number } | null) => void;
  clear: () => void;
}

const COLORS = ['#8B5CF6', '#F97316', '#06B6D4', '#10B981', '#EF4444'];

export const useGraphingEngine = create<GraphState>((set, get) => ({
  functions: [],
  viewport: { xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
  params: { a: 1, b: 0, c: 0, m: 1, k: 1 },
  showGrid: true,
  showTrace: false,
  tracePoint: null,

  addFunction: (expression) => {
    const { functions } = get();
    const id = `fn-${Date.now()}`;
    const color = COLORS[functions.length % COLORS.length];
    set({ functions: [...functions, { id, expression, color, visible: true }] });
  },

  removeFunction: (id) => {
    set((state) => ({ functions: state.functions.filter((f) => f.id !== id) }));
  },

  toggleVisibility: (id) => {
    set((state) => ({
      functions: state.functions.map((f) => (f.id === id ? { ...f, visible: !f.visible } : f)),
    }));
  },

  setParam: (key, value) => {
    set((state) => ({ params: { ...state.params, [key]: value } }));
  },

  setViewport: (viewport) => {
    set((state) => ({ viewport: { ...state.viewport, ...viewport } }));
  },

  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  setTracePoint: (point) => set({ tracePoint: point }),
  clear: () => set({ functions: [], params: { a: 1, b: 0, c: 0, m: 1, k: 1 } }),
}));
```

- [ ] **Step 2: Create equation parser utility**

```typescript
// src/lib/graphing/parser.ts
import { parse, evaluate } from 'mathjs';

const BUILT_IN = ['x', 'y', 'f', 'sin', 'cos', 'tan', 'log', 'ln', 'e', 'exp', 'sqrt', 'abs', 'pi'];

export function parseExpression(expression: string): { compiled: ReturnType<typeof parse>; params: string[] } {
  const normalized = expression.toLowerCase().replace(/y\s*=\s*/i, '');
  const node = parse(normalized);
  
  const params: string[] = [];
  node.traverse((n: any) => {
    if (n.type === 'SymbolNode' && !BUILT_IN.includes(n.name) && !params.includes(n.name)) {
      params.push(n.name);
    }
  });
  
  return { compiled: node, params };
}

export function evaluateExpression(expression: string, x: number, params: Record<string, number> = {}): number {
  const normalized = expression.toLowerCase().replace(/y\s*=\s*/i, '');
  try {
    return evaluate(normalized, { x, ...params }) as number;
  } catch {
    return NaN;
  }
}

export function getParameters(expression: string): string[] {
  const { params } = parseExpression(expression);
  return params;
}
```

- [ ] **Step 3: Create renderer utility**

```typescript
// src/lib/graphing/renderer.ts
export interface Point {
  x: number;
  y: number;
}

export interface Viewport {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export function worldToScreen(point: Point, viewport: Viewport, canvasWidth: number, canvasHeight: number): Point {
  const x = ((point.x - viewport.xMin) / (viewport.xMax - viewport.xMin)) * canvasWidth;
  const y = canvasHeight - ((point.y - viewport.yMin) / (viewport.yMax - viewport.yMin)) * canvasHeight;
  return { x, y };
}

export function screenToWorld(point: Point, viewport: Viewport, canvasWidth: number, canvasHeight: number): Point {
  const x = (point.x / canvasWidth) * (viewport.xMax - viewport.xMin) + viewport.xMin;
  const y = ((canvasHeight - point.y) / canvasHeight) * (viewport.yMax - viewport.yMin) + viewport.yMin;
  return { x, y };
}

export function generatePlotPoints(
  expression: string,
  params: Record<string, number>,
  viewport: Viewport,
  canvasWidth: number,
  numPoints: number = 500
): Point[] {
  import { evaluateExpression } from './parser';
  const points: Point[] = [];
  const step = (viewport.xMax - viewport.xMin) / numPoints;
  
  for (let x = viewport.xMin; x <= viewport.xMax; x += step) {
    const y = evaluateExpression(expression, x, params);
    if (!isNaN(y) && isFinite(y)) {
      points.push({ x, y });
    }
  }
  
  return points;
}

export function drawGrid(
  ctx: CanvasRenderingContext2D,
  viewport: Viewport,
  width: number,
  height: number
) {
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 0.5;
  
  const xStep = Math.pow(10, Math.floor(Math.log10(viewport.xMax - viewport.xMin)));
  const yStep = Math.pow(10, Math.floor(Math.log10(viewport.yMax - viewport.yMin)));
  
  for (let x = Math.ceil(viewport.xMin / xStep) * xStep; x <= viewport.xMax; x += xStep) {
    const screen = worldToScreen({ x, y: 0 }, viewport, width, height);
    ctx.beginPath();
    ctx.moveTo(screen.x, 0);
    ctx.lineTo(screen.x, height);
    ctx.stroke();
  }
  
  for (let y = Math.ceil(viewport.yMin / yStep) * yStep; y <= viewport.yMax; y += yStep) {
    const screen = worldToScreen({ x: 0, y }, viewport, width, height);
    ctx.beginPath();
    ctx.moveTo(0, screen.y);
    ctx.lineTo(width, screen.y);
    ctx.stroke();
  }
  
  // Axes
  ctx.strokeStyle = '#374151';
  ctx.lineWidth = 1;
  
  const origin = worldToScreen({ x: 0, y: 0 }, viewport, width, height);
  ctx.beginPath();
  ctx.moveTo(0, origin.y);
  ctx.lineTo(width, origin.y);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(origin.x, 0);
  ctx.lineTo(origin.x, height);
  ctx.stroke();
}
```

- [ ] **Step 4: Create analysis utility**

```typescript
// src/lib/graphing/analysis.ts
import { evaluateExpression } from './parser';

export interface Intersection {
  x: number;
  y: number;
  functions: [string, string];
}

export function findIntersections(
  expr1: string,
  expr2: string,
  params: Record<string, number>,
  xMin: number = -10,
  xMax: number = 10
): Intersection[] {
  const intersections: Intersection[] = [];
  const step = 0.1;
  
  let prevDiff = evaluateExpression(expr1, xMin, params) - evaluateExpression(expr2, xMin, params);
  
  for (let x = xMin + step; x <= xMax; x += step) {
    const diff = evaluateExpression(expr1, x, params) - evaluateExpression(expr2, x, params);
    
    if (prevDiff * diff < 0) {
      // Sign change - root exists in this interval
      const root = newtonRaphson(expr1, expr2, x - step, params);
      if (root !== null) {
        const y = evaluateExpression(expr1, root, params);
        intersections.push({ x: root, y, functions: [expr1, expr2] });
      }
    }
    prevDiff = diff;
  }
  
  return intersections;
}

function newtonRaphson(
  expr1: string,
  expr2: string,
  x0: number,
  params: Record<string, number>,
  tolerance: number = 1e-6,
  maxIter: number = 100
): number | null {
  let x = x0;
  
  for (let i = 0; i < maxIter; i++) {
    const h = 0.0001;
    const f = evaluateExpression(expr1, x, params) - evaluateExpression(expr2, x, params);
    const fPrime = (evaluateExpression(expr1, x + h, params) - evaluateExpression(expr2, x + h, params) - f) / h;
    
    if (Math.abs(fPrime) < 1e-10) return null;
    
    const xNew = x - f / fPrime;
    if (Math.abs(xNew - x) < tolerance) return xNew;
    x = xNew;
  }
  
  return null;
}

export function findRoots(
  expression: string,
  params: Record<string, number>,
  xMin: number = -10,
  xMax: number = 10
): { x: number; y: number }[] {
  return findIntersections(expression, '0', params, xMin, xMax).map(i => ({ x: i.x, y: 0 }));
}
```

- [ ] **Step 5: Run typecheck**

Run: `bun run typecheck`
Expected: PASS

---

## Task 3: Graphing Components

**Files:**
- Create: `src/components/Graphing/GraphEngine.tsx`
- Create: `src/components/Graphing/FunctionInput.tsx`
- Create: `src/components/Graphing/FunctionList.tsx`
- Create: `src/components/Graphing/SliderPanel.tsx`
- Create: `src/components/Graphing/GraphToolbar.tsx`

- [ ] **Step 1: Create GraphEngine component**

```tsx
// src/components/Graphing/GraphEngine.tsx
'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useGraphingEngine } from '@/stores/useGraphingEngine';
import { worldToScreen, drawGrid, generatePlotPoints } from '@/lib/graphing/renderer';

export function GraphEngine() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { functions, viewport, params, showGrid, setTracePoint } = useGraphingEngine();
  
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);
    
    if (showGrid) {
      drawGrid(ctx, viewport, width, height);
    }
    
    functions.forEach((fn) => {
      if (!fn.visible) return;
      
      const points = generatePlotPoints(fn.expression, params, viewport, width);
      ctx.strokeStyle = fn.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      let drawing = false;
      points.forEach((point) => {
        const screen = worldToScreen(point, viewport, width, height);
        if (!drawing) {
          ctx.moveTo(screen.x, screen.y);
          drawing = true;
        } else {
          ctx.lineTo(screen.x, screen.y);
        }
      });
      
      ctx.stroke();
    });
  }, [functions, viewport, params, showGrid]);
  
  useEffect(() => {
    draw();
  }, [draw]);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * (viewport.xMax - viewport.xMin) + viewport.xMin;
    const y = ((rect.height - (e.clientY - rect.top)) / rect.height) * (viewport.yMax - viewport.yMin) + viewport.yMin;
    
    setTracePoint({ x, y });
  };
  
  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={500}
      className="w-full h-full rounded-xl border border-border"
      onMouseMove={handleMouseMove}
    />
  );
}
```

- [ ] **Step 2: Create FunctionInput component**

```tsx
// src/components/Graphing/FunctionInput.tsx
'use client';

import { useState } from 'react';
import { useGraphingEngine } from '@/stores/useGraphingEngine';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function FunctionInput() {
  const [expression, setExpression] = useState('');
  const { addFunction } = useGraphingEngine();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (expression.trim()) {
      addFunction(expression.trim());
      setExpression('');
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={expression}
        onChange={(e) => setExpression(e.target.value)}
        placeholder="y = ax² + bx + c"
        className="font-mono"
      />
      <Button type="submit" variant="secondary">Add</Button>
    </form>
  );
}
```

- [ ] **Step 3: Create FunctionList component**

```tsx
// src/components/Graphing/FunctionList.tsx
'use client';

import { useGraphingEngine } from '@/stores/useGraphingEngine';
import { Button } from '@/components/ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { CloseIcon } from '@hugeicons/core-free-icons';

export function FunctionList() {
  const { functions, removeFunction, toggleVisibility } = useGraphingEngine();
  
  if (functions.length === 0) {
    return <p className="text-sm text-muted-foreground">No functions added yet</p>;
  }
  
  return (
    <div className="space-y-2">
      {functions.map((fn) => (
        <div key={fn.id} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
          <button
            onClick={() => toggleVisibility(fn.id)}
            className="w-4 h-4 rounded-full border-2"
            style={{ backgroundColor: fn.visible ? fn.color : 'transparent' }}
          />
          <span className="flex-1 font-mono text-sm">y = {fn.expression}</span>
          <Button variant="ghost" size="icon" onClick={() => removeFunction(fn.id)}>
            <HugeiconsIcon icon={CloseIcon} className="w-4 h-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Create SliderPanel component**

```tsx
// src/components/Graphing/SliderPanel.tsx
'use client';

import { useGraphingEngine } from '@/stores/useGraphingEngine';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { getParameters } from '@/lib/graphing/parser';

export function SliderPanel() {
  const { functions, params, setParam } = useGraphingEngine();
  
  // Extract unique parameters from all expressions
  const allParams = new Set<string>();
  functions.forEach(fn => {
    getParameters(fn.expression).forEach(p => allParams.add(p));
  });
  
  const paramKeys = Array.from(allParams);
  
  if (paramKeys.length === 0) {
    return <p className="text-sm text-muted-foreground">Add a function to see sliders</p>;
  }
  
  return (
    <div className="space-y-4">
      {paramKeys.map((key) => (
        <div key={key} className="space-y-2">
          <div className="flex justify-between">
            <Label>{key}</Label>
            <span className="font-mono text-sm">{params[key] ?? 1}</span>
          </div>
          <Slider
            value={[params[key] ?? 1]}
            onValueChange={([v]) => setParam(key, v)}
            min={-10}
            max={10}
            step={0.1}
          />
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Create GraphToolbar component**

```tsx
// src/components/Graphing/GraphToolbar.tsx
'use client';

import { useGraphingEngine } from '@/stores/useGraphingEngine';
import { Button } from '@/components/ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { GridIcon, ZoomInIcon, ZoomOutIcon, RefreshIcon } from '@hugeicons/core-free-icons';

export function GraphToolbar() {
  const { showGrid, toggleGrid, setViewport, viewport, clear } = useGraphingEngine();
  
  const handleZoom = (direction: 'in' | 'out') => {
    const factor = direction === 'in' ? 0.8 : 1.25;
    setViewport({
      xMin: viewport.xMin * factor,
      xMax: viewport.xMax * factor,
      yMin: viewport.yMin * factor,
      yMax: viewport.yMax * factor,
    });
  };
  
  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon" onClick={toggleGrid}>
        <HugeiconsIcon icon={GridIcon} className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => handleZoom('in')}>
        <HugeiconsIcon icon={ZoomInIcon} className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => handleZoom('out')}>
        <HugeiconsIcon icon={ZoomOutIcon} className="w-4 h-4" />
      </Button>
      <Button variant="ghost" onClick={clear}>Clear</Button>
    </div>
  );
}
```

- [ ] **Step 6: Run typecheck**

Run: `bun run typecheck`
Expected: PASS

---

## Task 4: Graphing Page

**Files:**
- Create: `src/app/math/graph/page.tsx`

- [ ] **Step 1: Create the main graph page**

```tsx
// src/app/math/graph/page.tsx
import type { Metadata } from 'next';
import { appConfig } from '@/app.config';
import { GraphEngine } from '@/components/Graphing/GraphEngine';
import { FunctionInput } from '@/components/Graphing/FunctionInput';
import { FunctionList } from '@/components/Graphing/FunctionList';
import { SliderPanel } from '@/components/Graphing/SliderPanel';
import { GraphToolbar } from '@/components/Graphing/GraphToolbar';
import { TemplateGallery } from '@/components/Graphing/TemplateGallery';
import { Card } from '@/components/ui/card';

export const metadata: Metadata = {
  title: `Math Graphing Engine | ${appConfig.name} AI`,
  description: 'Plot functions, explore graphs, and understand mathematical relationships.',
};

export default function GraphPage() {
  return (
    <div className="flex flex-col h-full">
      <header className="px-6 pt-12 pb-40 bg-card border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-black">Math Graphing Engine</h1>
          <GraphToolbar />
        </div>
        <FunctionInput />
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 p-4 border-r border-border overflow-y-auto">
          <h3 className="font-semibold mb-4">Functions</h3>
          <FunctionList />
          
          <h3 className="font-semibold mt-6 mb-4">Parameters</h3>
          <SliderPanel />
        </aside>
        
        <main className="flex-1 p-4">
          <Card className="h-full p-4">
            <GraphEngine />
          </Card>
        </main>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add route to app.config.ts**

Skip - Next.js App Router automatically routes based on folder structure. The pages will be accessible at `/science-lab`, `/science-lab/circuits`, `/science-lab/momentum`, `/science-lab/waves`, and `/math/graph` automatically.

- [ ] **Step 3: Run typecheck and lint**

Run: `bun run typecheck && bun run lint`
Expected: PASS

---

## Task 5: Templates

**Files:**
- Create: `src/components/Graphing/TemplateGallery.tsx`

- [ ] **Step 1: Create template gallery**

```tsx
// src/components/Graphing/TemplateGallery.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useGraphingEngine } from '@/stores/useGraphingEngine';

const TEMPLATES = [
  { label: 'Linear', expression: 'y = mx + c', params: { m: 1, c: 0 } },
  { label: 'Quadratic', expression: 'y = ax² + bx + c', params: { a: 1, b: 0, c: 0 } },
  { label: 'Cubic', expression: 'y = ax³ + bx² + cx + d', params: { a: 1, b: 0, c: 0, d: 0 } },
  { label: 'Exponential', expression: 'y = a^x', params: { a: 2 } },
  { label: 'Sine', expression: 'y = a sin(bx)', params: { a: 1, b: 1 } },
  { label: 'Cosine', expression: 'y = a cos(bx)', params: { a: 1, b: 1 } },
  { label: 'Hyperbola', expression: 'y = a/x', params: { a: 1 } },
];

export function TemplateGallery() {
  const { addFunction, setParam } = useGraphingEngine();
  
  const handleSelect = (template: typeof TEMPLATES[0]) => {
    addFunction(template.expression);
    Object.entries(template.params).forEach(([key, value]) => {
      setParam(key, value);
    });
  };
  
  return (
    <div className="grid grid-cols-2 gap-2">
      {TEMPLATES.map((t) => (
        <Button key={t.label} variant="outline" onClick={() => handleSelect(t)}>
          {t.label}
        </Button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Integrate into page**

Add TemplateGallery to the sidebar in `src/app/math/graph/page.tsx`

- [ ] **Step 3: Run typecheck**

Run: `bun run typecheck`
Expected: PASS

---

# Part 2: Virtual Science Lab

## Files

### New Files to Create

- `src/app/science-lab/page.tsx` - Lab main page with tabs
- `src/app/science-lab/circuits/page.tsx` - Circuits simulation
- `src/app/science-lab/momentum/page.tsx` - Momentum simulation
- `src/app/science-lab/waves/page.tsx` - Waves simulation
- `src/components/ScienceLab/CircuitCanvas.tsx` - Circuit SVG renderer
- `src/components/ScienceLab/CircuitControls.tsx` - Circuit parameter controls
- `src/components/ScienceLab/MomentumCanvas.tsx` - Momentum collision renderer
- `src/components/ScienceLab/MomentumControls.tsx` - Momentum inputs
- `src/components/ScienceLab/WaveCanvas.tsx` - Wave animation renderer
- `src/components/ScienceLab/WaveControls.tsx` - Wave parameter sliders
- `src/stores/useScienceLab.ts` - Zustand store for lab state
- `src/lib/physics/circuits.ts` - Circuit calculation utilities
- `src/lib/physics/momentum.ts` - Momentum calculation utilities
- `src/lib/physics/waves.ts` - Wave calculation utilities

### Files to Modify

- `src/app.config.ts` - Add `/science-lab` route

---

## Task 6: Science Lab Store and Physics Utilities

**Files:**
- Create: `src/stores/useScienceLab.ts`
- Create: `src/lib/physics/circuits.ts`
- Create: `src/lib/physics/momentum.ts`
- Create: `src/lib/physics/waves.ts`

- [ ] **Step 1: Create Science Lab store**

```typescript
// src/stores/useScienceLab.ts
import { create } from 'zustand';

type SimulationType = 'circuits' | 'momentum' | 'waves';

interface CircuitState {
  voltage: number;
  resistors: { id: string; resistance: number; config: 'series' | 'parallel' }[];
}

interface MomentumState {
  mass1: number;
  mass2: number;
  velocity1: number;
  velocity2: number;
  collisionType: 'elastic' | 'inelastic';
  isPlaying: boolean;
}

interface WaveState {
  amplitude: number;
  frequency: number;
  wavelength: number;
  speed: number;
}

interface ScienceLabState {
  currentSimulation: SimulationType;
  circuit: CircuitState;
  momentum: MomentumState;
  wave: WaveState;
  
  setSimulation: (type: SimulationType) => void;
  setCircuit: (partial: Partial<CircuitState>) => void;
  setMomentum: (partial: Partial<MomentumState>) => void;
  setWave: (partial: Partial<WaveState>) => void;
  resetCircuit: () => void;
  resetMomentum: () => void;
  resetWave: () => void;
}

export const useScienceLab = create<ScienceLabState>((set) => ({
  currentSimulation: 'circuits',
  
  circuit: {
    voltage: 12,
    resistors: [
      { id: 'r1', resistance: 4, config: 'series' },
      { id: 'r2', resistance: 6, config: 'parallel' },
      { id: 'r3', resistance: 3, config: 'series' },
    ],
  },
  
  momentum: {
    mass1: 2,
    mass2: 2,
    velocity1: 5,
    velocity2: -3,
    collisionType: 'elastic',
    isPlaying: false,
  },
  
  wave: {
    amplitude: 1,
    frequency: 1,
    wavelength: 2,
    speed: 2,
  },
  
  setSimulation: (type) => set({ currentSimulation: type }),
  
  setCircuit: (partial) => set((state) => ({ circuit: { ...state.circuit, ...partial } })),
  
  setMomentum: (partial) => set((state) => ({ momentum: { ...state.momentum, ...partial } })),
  
  setWave: (partial) => set((state) => ({ wave: { ...state.wave, ...partial } })),
  
  resetCircuit: () => set({
    circuit: {
      voltage: 12,
      resistors: [
        { id: 'r1', resistance: 4, config: 'series' },
        { id: 'r2', resistance: 6, config: 'parallel' },
        { id: 'r3', resistance: 3, config: 'series' },
      ],
    },
  }),
  
  resetMomentum: () => set({
    momentum: {
      mass1: 2,
      mass2: 2,
      velocity1: 5,
      velocity2: -3,
      collisionType: 'elastic',
      isPlaying: false,
    },
  }),
  
  resetWave: () => set({
    wave: {
      amplitude: 1,
      frequency: 1,
      wavelength: 2,
      speed: 2,
    },
  }),
}));
```

- [ ] **Step 2: Create circuit physics utility**

```typescript
// src/lib/physics/circuits.ts
export interface Resistor {
  id: string;
  resistance: number;
  config: 'series' | 'parallel';
}

export interface CircuitResults {
  equivalentResistance: number;
  totalCurrent: number;
  voltageDrops: { id: string; voltage: number; current: number; power: number }[];
}

export function calculateCircuit(voltage: number, resistors: Resistor[]): CircuitResults {
  // Separate series and parallel resistors
  const seriesResistors = resistors.filter(r => r.config === 'series');
  const parallelResistors = resistors.filter(r => r.config === 'parallel');
  
  // Series: R_total = R1 + R2 + ...
  const seriesResistance = seriesResistors.reduce((sum, r) => sum + r.resistance, 0);
  
  // Parallel: 1/R_total = 1/R1 + 1/R2 + ...
  const parallelResistance = parallelResistors.length > 0
    ? 1 / parallelResistors.reduce((sum, r) => sum + 1 / r.resistance, 0)
    : 0;
  
  // Total resistance
  const equivalentResistance = seriesResistance + parallelResistance;
  
  // Total current (Ohm's Law)
  const totalCurrent = voltage / equivalentResistance;
  
  // Voltage drops
  const voltageDrops = resistors.map(r => {
    let current: number;
    if (r.config === 'series') {
      current = totalCurrent;
    } else {
      // Parallel: voltage is the same, current splits
      current = voltage / r.resistance;
    }
    const vDrop = current * r.resistance;
    const power = current * vDrop;
    return { id: r.id, voltage: vDrop, current, power };
  });
  
  return { equivalentResistance, totalCurrent, voltageDrops };
}
```

- [ ] **Step 3: Create momentum physics utility**

```typescript
// src/lib/physics/momentum.ts
export interface MomentumResults {
  initialMomentum: number;
  finalMomentum: number;
  initialKineticEnergy: number;
  finalKineticEnergy: number;
  velocity1After: number;
  velocity2After: number;
  momentumConserved: boolean;
  energyConserved: boolean;
}

export function calculateCollision(
  m1: number,
  m2: number,
  v1: number,
  v2: number,
  type: 'elastic' | 'inelastic'
): MomentumResults {
  // Initial momentum
  const initialMomentum = m1 * v1 + m2 * v2;
  
  // Initial kinetic energy
  const initialKineticEnergy = 0.5 * m1 * v1 ** 2 + 0.5 * m2 * v2 ** 2;
  
  let velocity1After: number;
  let velocity2After: number;
  
  if (type === 'elastic') {
    // Elastic collision formulas
    velocity1After = ((m1 - m2) * v1 + 2 * m2 * v2) / (m1 + m2);
    velocity2After = ((m2 - m1) * v2 + 2 * m1 * v1) / (m1 + m2);
  } else {
    // Perfectly inelastic - objects stick together
    const finalVelocity = initialMomentum / (m1 + m2);
    velocity1After = finalVelocity;
    velocity2After = finalVelocity;
  }
  
  // Final momentum
  const finalMomentum = m1 * velocity1After + m2 * velocity2After;
  
  // Final kinetic energy
  const finalKineticEnergy = 0.5 * m1 * velocity1After ** 2 + 0.5 * m2 * velocity2After ** 2;
  
  return {
    initialMomentum,
    finalMomentum,
    initialKineticEnergy,
    finalKineticEnergy,
    velocity1After,
    velocity2After,
    momentumConserved: Math.abs(initialMomentum - finalMomentum) < 0.001,
    energyConserved: type === 'elastic' ? Math.abs(initialKineticEnergy - finalKineticEnergy) < 0.001 : false,
  };
}
```

- [ ] **Step 4: Create wave physics utility**

```typescript
// src/lib/physics/waves.ts
export interface WaveResults {
  frequency: number;
  wavelength: number;
  speed: number;
  angularFrequency: number;
  waveNumber: number;
  period: number;
}

export function calculateWave(amplitude: number, frequency: number): WaveResults {
  const wavelength = frequency > 0 ? 20 / frequency : 0; // Arbitrary relationship for display
  const speed = frequency * wavelength;
  const angularFrequency = 2 * Math.PI * frequency;
  const waveNumber = (2 * Math.PI) / wavelength;
  const period = frequency > 0 ? 1 / frequency : 0;
  
  return {
    frequency,
    wavelength,
    speed,
    angularFrequency,
    waveNumber,
    period,
  };
}

export function generateWavePoints(
  amplitude: number,
  frequency: number,
  phase: number,
  numPoints: number = 200
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  
  for (let i = 0; i < numPoints; i++) {
    const x = (i / numPoints) * 4 * Math.PI; // 2 wavelengths
    const y = amplitude * Math.sin(frequency * x - phase);
    points.push({ x, y });
  }
  
  return points;
}
```

- [ ] **Step 5: Run typecheck**

Run: `bun run typecheck`
Expected: PASS

---

## Task 7: Circuit Components

**Files:**
- Create: `src/components/ScienceLab/CircuitCanvas.tsx`
- Create: `src/components/ScienceLab/CircuitControls.tsx`

- [ ] **Step 1: Create CircuitCanvas component**

```tsx
// src/components/ScienceLab/CircuitCanvas.tsx
'use client';

import { useScienceLab } from '@/stores/useScienceLab';
import { calculateCircuit } from '@/lib/physics/circuits';
import { m } from 'framer-motion';

export function CircuitCanvas() {
  const { circuit } = useScienceLab();
  const results = calculateCircuit(circuit.voltage, circuit.resistors);
  
  return (
    <div className="relative bg-card rounded-2xl p-8 min-h-[400px]">
      <svg viewBox="0 0 400 300" className="w-full h-full">
        {/* Battery */}
        <rect x="20" y="130" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2" />
        <text x="40" y="155" textAnchor="middle" className="text-xs fill-current font-mono">
          {circuit.voltage}V
        </text>
        
        {/* Wires */}
        <line x1="60" y1="150" x2="120" y2="150" stroke="currentColor" strokeWidth="2" />
        <line x1="120" y1="150" x2="120" y2="80" stroke="currentColor" strokeWidth="2" />
        <line x1="120" y1="80" x2="280" y2="80" stroke="currentColor" strokeWidth="2" />
        <line x1="280" y1="80" x2="280" y2="150" stroke="currentColor" strokeWidth="2" />
        <line x1="280" y1="150" x2="340" y2="150" stroke="currentColor" strokeWidth="2" />
        <line x1="340" y1="150" x2="340" y2="220" stroke="currentColor" strokeWidth="2" />
        <line x1="340" y1="220" x2="200" y2="220" stroke="currentColor" strokeWidth="2" />
        <line x1="200" y1="220" x2="60" y2="220" stroke="currentColor" strokeWidth="2" />
        <line x1="60" y1="220" x2="60" y2="170" stroke="currentColor" strokeWidth="2" />
        
        {/* Resistor 1 - Series */}
        <rect x="140" y="70" width="40" height="20" fill="var(--tiimo-orange)" stroke="currentColor" strokeWidth="2" />
        <text x="160" y="60" textAnchor="middle" className="text-xs fill-current font-bold">
          R₁ = {circuit.resistors[0].resistance}Ω
        </text>
        
        {/* Resistor 2 - Parallel */}
        <rect x="260" y="140" width="20" height="40" fill="var(--tiimo-orange)" stroke="currentColor" strokeWidth="2" />
        <text x="290" y="165" textAnchor="start" className="text-xs fill-current font-bold">
          R₂ = {circuit.resistors[1].resistance}Ω
        </text>
        
        {/* Resistor 3 - Series */}
        <rect x="240" y="210" width="40" height="20" fill="var(--tiimo-orange)" stroke="currentColor" strokeWidth="2" />
        <text x="260" y="250" textAnchor="middle" className="text-xs fill-current font-bold">
          R₃ = {circuit.resistors[2].resistance}Ω
        </text>
        
        {/* Animated electron flow - current indicator */}
        <circle r="4" fill="var(--tiimo-blue)">
          <animateMotion 
            dur="2s" 
            repeatCount="indefinite" 
            path="M60,150 L120,150 L120,80 L280,80 L280,150 L340,150 L340,220 L200,220 L60,220 L60,150" 
          />
        </circle>
      </svg>
      
      {/* Results overlay */}
      <div className="absolute top-4 right-4 bg-background/90 backdrop-blur p-4 rounded-xl border">
        <div className="text-sm">
          <p><span className="font-bold">R_eq:</span> {results.equivalentResistance.toFixed(2)}Ω</p>
          <p><span className="font-bold">I_total:</span> {results.totalCurrent.toFixed(2)}A</p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create CircuitControls component**

```tsx
// src/components/ScienceLab/CircuitControls.tsx
'use client';

import { useScienceLab } from '@/stores/useScienceLab';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function CircuitControls() {
  const { circuit, setCircuit, resetCircuit } = useScienceLab();
  
  return (
    <Card className="p-4 space-y-6">
      <div>
        <Label>Voltage: {circuit.voltage}V</Label>
        <Slider
          value={[circuit.voltage]}
          onValueChange={([v]) => setCircuit({ voltage: v })}
          min={1}
          max={24}
          step={1}
        />
      </div>
      
      {circuit.resistors.map((r, i) => (
        <div key={r.id}>
          <Label>R{i + 1}: {r.resistance}Ω ({r.config})</Label>
          <Slider
            value={[r.resistance]}
            onValueChange={([v]) => {
              const newResistors = [...circuit.resistors];
              newResistors[i] = { ...r, resistance: v };
              setCircuit({ resistors: newResistors });
            }}
            min={1}
            max={100}
            step={1}
          />
        </div>
      ))}
      
      <Button variant="outline" onClick={resetCircuit}>Reset</Button>
    </Card>
  );
}
```

- [ ] **Step 3: Run typecheck**

Run: `bun run typecheck`
Expected: PASS

---

## Task 8: Momentum Components

**Files:**
- Create: `src/components/ScienceLab/MomentumCanvas.tsx`
- Create: `src/components/ScienceLab/MomentumControls.tsx`

- [ ] **Step 1: Create MomentumCanvas component**

```tsx
// src/components/ScienceLab/MomentumCanvas.tsx
'use client';

import { useScienceLab } from '@/stores/useScienceLab';
import { calculateCollision } from '@/lib/physics/momentum';
import { m } from 'framer-motion';

export function MomentumCanvas() {
  const { momentum } = useScienceLab();
  const results = calculateCollision(
    momentum.mass1,
    momentum.mass2,
    momentum.velocity1,
    momentum.velocity2,
    momentum.collisionType
  );
  
  return (
    <div className="relative bg-card rounded-2xl p-8 min-h-[300px]">
      <svg viewBox="0 0 400 200" className="w-full h-full">
        {/* Ground line */}
        <line x1="20" y1="180" x2="380" y2="180" stroke="currentColor" strokeWidth="2" />
        
        {/* Object 1 */}
        <circle cx="50" cy="140" r={20 + momentum.mass1 * 3} fill="var(--tiimo-lavender)">
          <animate attributeName="cx" values="50;200;200;50;50" dur="3s" repeatCount="indefinite" />
        </circle>
        <text x="50" y="100" textAnchor="middle" className="text-xs font-bold">
          m₁={momentum.mass1}kg, v₁={momentum.velocity1}m/s
        </text>
        
        {/* Object 2 */}
        <circle cx="350" cy="140" r={20 + momentum.mass2 * 3} fill="var(--tiimo-orange)">
          <animate attributeName="cx" values="350;200;200;350;350" dur="3s" repeatCount="indefinite" />
        </circle>
        <text x="350" y="100" textAnchor="middle" className="text-xs font-bold">
          m₂={momentum.mass2}kg, v₂={momentum.velocity2}m/s
        </text>
      </svg>
      
      {/* Results */}
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <Card className="p-3">
          <p className="font-bold">Before</p>
          <p>p = {results.initialMomentum.toFixed(2)} kg·m/s</p>
          <p>KE = {results.initialKineticEnergy.toFixed(2)} J</p>
        </Card>
        <Card className="p-3">
          <p className="font-bold">After</p>
          <p>p' = {results.finalMomentum.toFixed(2)} kg·m/s</p>
          <p>KE' = {results.finalKineticEnergy.toFixed(2)} J</p>
        </Card>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create MomentumControls component**

```tsx
// src/components/ScienceLab/MomentumControls.tsx
'use client';

import { useScienceLab } from '@/stores/useScienceLab';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

export function MomentumControls() {
  const { momentum, setMomentum, resetMomentum } = useScienceLab();
  
  return (
    <Card className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <Label>Elastic Collision</Label>
        <Switch
          checked={momentum.collisionType === 'elastic'}
          onCheckedChange={(checked) => setMomentum({ collisionType: checked ? 'elastic' : 'inelastic' })}
        />
      </div>
      
      <div>
        <Label>Mass 1: {momentum.mass1}kg</Label>
        <Slider
          value={[momentum.mass1]}
          onValueChange={([v]) => setMomentum({ mass1: v })}
          min={1}
          max={10}
          step={0.5}
        />
      </div>
      
      <div>
        <Label>Mass 2: {momentum.mass2}kg</Label>
        <Slider
          value={[momentum.mass2]}
          onValueChange={([v]) => setMomentum({ mass2: v })}
          min={1}
          max={10}
          step={0.5}
        />
      </div>
      
      <div>
        <Label>Velocity 1: {momentum.velocity1}m/s</Label>
        <Slider
          value={[momentum.velocity1]}
          onValueChange={([v]) => setMomentum({ velocity1: v })}
          min={-10}
          max={10}
          step={0.5}
        />
      </div>
      
      <div>
        <Label>Velocity 2: {momentum.velocity2}m/s</Label>
        <Slider
          value={[momentum.velocity2]}
          onValueChange={([v]) => setMomentum({ velocity2: v })}
          min={-10}
          max={10}
          step={0.5}
        />
      </div>
      
      <Button variant="outline" onClick={resetMomentum}>Reset</Button>
    </Card>
  );
}
```

- [ ] **Step 3: Run typecheck**

Run: `bun run typecheck`
Expected: PASS

---

## Task 9: Wave Components

**Files:**
- Create: `src/components/ScienceLab/WaveCanvas.tsx`
- Create: `src/components/ScienceLab/WaveControls.tsx`

- [ ] **Step 1: Create WaveCanvas component**

```tsx
// src/components/ScienceLab/WaveCanvas.tsx
'use client';

import { useScienceLab } from '@/stores/useScienceLab';
import { generateWavePoints } from '@/lib/physics/waves';
import { useEffect, useState } from 'react';
import { m } from 'framer-motion';

export function WaveCanvas() {
  const { wave } = useScienceLab();
  const [phase, setPhase] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setPhase(p => p + wave.frequency * 0.1);
    }, 50);
    return () => clearInterval(interval);
  }, [wave.frequency]);
  
  const points = generateWavePoints(wave.amplitude, wave.frequency, phase);
  
  return (
    <div className="relative bg-card rounded-2xl p-8 min-h-[300px]">
      <svg viewBox="0 0 400 200" className="w-full h-full">
        {/* Axis */}
        <line x1="20" y1="100" x2="380" y2="100" stroke="currentColor" strokeWidth="1" opacity="0.3" />
        
        {/* Wave - use native SVG animation */}
        <path
          d={`M ${points.map((p, i) => `${p.x * 80 + 40} ${100 - p.y * 40}`).join(' L ')}`}
          fill="none"
          stroke="var(--tiimo-lavender)"
          strokeWidth="3"
        >
          <animate 
            attributeName="d" 
            dur="0.5s" 
            repeatCount="indefinite"
            values={[
              `M ${generateWavePoints(wave.amplitude, wave.frequency, 0).map((p, i) => `${p.x * 80 + 40} ${100 - p.y * 40}`).join(' L ')}`,
              `M ${generateWavePoints(wave.amplitude, wave.frequency, 1).map((p, i) => `${p.x * 80 + 40} ${100 - p.y * 40}`).join(' L ')}`,
              `M ${generateWavePoints(wave.amplitude, wave.frequency, 2).map((p, i) => `${p.x * 80 + 40} ${100 - p.y * 40}`).join(' L ')}`,
            ]}
          />
        </path>
        
        {/* Labels */}
        <text x="200" y="180" textAnchor="middle" className="text-xs fill-muted-foreground">
          λ = {(20 / wave.frequency).toFixed(2)} units
        </text>
      </svg>
      
      {/* Equation */}
      <div className="absolute top-4 right-4 bg-background/90 backdrop-blur px-4 py-2 rounded-xl border font-mono text-sm">
        y = {wave.amplitude} sin({wave.frequency}x - {phase.toFixed(2)})
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create WaveControls component**

```tsx
// src/components/ScienceLab/WaveControls.tsx
'use client';

import { useScienceLab } from '@/stores/useScienceLab';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function WaveControls() {
  const { wave, setWave, resetWave } = useScienceLab();
  
  return (
    <Card className="p-4 space-y-6">
      <div>
        <Label>Amplitude: {wave.amplitude}</Label>
        <Slider
          value={[wave.amplitude]}
          onValueChange={([v]) => setWave({ amplitude: v })}
          min={0.1}
          max={3}
          step={0.1}
        />
      </div>
      
      <div>
        <Label>Frequency: {wave.frequency}Hz</Label>
        <Slider
          value={[wave.frequency]}
          onValueChange={([v]) => setWave({ frequency: v })}
          min={0.5}
          max={5}
          step={0.1}
        />
      </div>
      
      <Button variant="outline" onClick={resetWave}>Reset</Button>
    </Card>
  );
}
```

- [ ] **Step 3: Run typecheck**

Run: `bun run typecheck`
Expected: PASS

---

## Task 10: Science Lab Pages

**Files:**
- Create: `src/app/science-lab/page.tsx`
- Create: `src/app/science-lab/circuits/page.tsx`
- Create: `src/app/science-lab/momentum/page.tsx`
- Create: `src/app/science-lab/waves/page.tsx`

- [ ] **Step 1: Create main lab page with tabs**

```tsx
// src/app/science-lab/page.tsx
'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ArrowLeft02Icon, SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ScienceLabPage() {
  const router = useRouter();
  const pathname = usePathname();
  
  const activeTab = pathname.split('/').pop() || 'circuits';
  
  return (
    <div className="flex flex-col h-full">
      <header className="px-6 pt-12 pb-40 bg-card border-b border-border">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')}>
            <HugeiconsIcon icon={ArrowLeft02Icon} className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-black">Virtual Science Lab</h1>
        </div>
        
        <Tabs value={activeTab} onValueChange={(v) => router.push(`/science-lab/${v}`)}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="circuits">Electric Circuits</TabsTrigger>
            <TabsTrigger value="momentum">Momentum</TabsTrigger>
            <TabsTrigger value="waves">Wave Motion</TabsTrigger>
          </TabsList>
        </Tabs>
      </header>
      
      <main className="flex-1 p-6">
        {activeTab === 'circuits' && (
          <div className="text-center py-20">
            <SparklesIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p>Select a simulation from the tabs above</p>
          </div>
        )}
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Create circuits page**

```tsx
// src/app/science-lab/circuits/page.tsx
import { CircuitCanvas } from '@/components/ScienceLab/CircuitCanvas';
import { CircuitControls } from '@/components/ScienceLab/CircuitControls';
import { Card } from '@/components/ui/card';

export default function CircuitsPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <CircuitCanvas />
      </div>
      <div>
        <CircuitControls />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create momentum page**

```tsx
// src/app/science-lab/momentum/page.tsx
import { MomentumCanvas } from '@/components/ScienceLab/MomentumCanvas';
import { MomentumControls } from '@/components/ScienceLab/MomentumControls';

export default function MomentumPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <MomentumCanvas />
      </div>
      <div>
        <MomentumControls />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create waves page**

```tsx
// src/app/science-lab/waves/page.tsx
import { WaveCanvas } from '@/components/ScienceLab/WaveCanvas';
import { WaveControls } from '@/components/ScienceLab/WaveControls';

export default function WavesPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <WaveCanvas />
      </div>
      <div>
        <WaveControls />
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Run typecheck and lint**

Run: `bun run typecheck && bun run lint`
Expected: PASS

---

## Task 11: Integration

**Files:**
- Modify: `src/components/Dashboard/SubjectGridV2.tsx`

- [ ] **Step 1: Add links to dashboard**

Add "Science Lab" and "Math Graphing" cards to SubjectGridV2

- [ ] **Step 2: Final typecheck and lint**

Run: `bun run typecheck && bun run lint`
Expected: PASS

---

## Summary

**Math Graphing Engine:**
- [ ] Task 1: Install mathjs
- [ ] Task 2: Create store and utilities
- [ ] Task 3: Create graphing components
- [ ] Task 4: Create main graph page
- [ ] Task 5: Add templates

**Virtual Science Lab:**
- [ ] Task 6: Create store and physics utilities
- [ ] Task 7: Create circuit components
- [ ] Task 8: Create momentum components
- [ ] Task 9: Create wave components
- [ ] Task 10: Create lab pages
- [ ] Task 11: Integration

**Total: 11 tasks**
