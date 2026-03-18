# Subject-Specific Tools Design Specification

**Version:** 1.0  
**Date:** 2026-03-18  
**Feature Set:** Subject-Specific Tools  
**Components:** Virtual Science Lab, Math Graphing Engine

---

## Overview

This specification covers two subject-specific learning tools:

1. **Virtual Science Lab** - Interactive physics simulations for NSC Grade 12
2. **Math Graphing Engine** - Full-featured function plotter

---

# Part 1: Virtual Science Lab

## Goals

- Provide interactive physics visualizations for NSC Grade 12 curriculum
- Enable students to manipulate parameters and observe results
- Build on existing `PhysicalSciences.tsx` and `InteractiveDiagram.tsx`
- Use hybrid approach: pre-built scenarios with adjustable parameters

## Simulations

### 1. Electric Circuits

**Location:** `/science-lab/circuits`

**Features:**
- Circuit canvas with battery, resistors (configurable count)
- Draggable resistor values (1-100Ω)
- Voltage slider (1-24V)
- Real-time calculation: current, voltage drops, power
- Series/parallel visualization
- Animated electron flow (current direction/intensity)
- Formula display panel

**Components:**
- `CircuitCanvas.tsx` - SVG-based circuit renderer
- `CircuitControls.tsx` - Parameter sliders and inputs
- `CircuitResults.tsx` - Calculated values display

**Physics:**
- Ohm's Law: V = IR
- Series: R_total = R1 + R2 + ...
- Parallel: 1/R_total = 1/R1 + 1/R2 + ...
- Power: P = IV = I²R

### 2. Momentum & Collisions

**Location:** `/science-lab/momentum`

**Features:**
- 2D collision simulation with two objects
- Configurable mass (1-10 kg) and velocity (-10 to 10 m/s)
- Elastic/inelastic collision toggle
- Before/after velocity vectors
- Conservation verification panel
- Animated collision playback

**Components:**
- `MomentumCanvas.tsx` - Canvas-based physics renderer
- `MomentumControls.tsx` - Mass/velocity inputs
- `MomentumResults.tsx` - Before/after comparison

**Physics:**
- Momentum: p = mv
- Elastic: m1v1 + m2v2 = m1v1' + m2v2'
- Kinetic Energy (elastic): ½m1v1² + ½m2v2² = ½m1v1'² + ½m2v2'²

### 3. Wave Motion

**Location:** `/science-lab/waves`

**Features:**
- Wave visualization (transverse)
- Adjustable: frequency, amplitude, wavelength, speed
- Real-time wave animation
- Equation display: y = A sin(kx - ωt)
- Standing wave mode with fixed endpoints
- Node/antinode labeling

**Components:**
- `WaveCanvas.tsx` - Animated wave renderer
- `WaveControls.tsx` - Parameter sliders
- `WaveEquation.tsx` - Live equation display

**Physics:**
- Wave equation: v = fλ
- Angular frequency: ω = 2πf
- Wave number: k = 2π/λ

## Navigation

**Route:** `/science-lab` (redirects to `/science-lab/circuits`)

```
/science-lab
  /circuits      (default)
  /momentum
  /waves
```

### Parameter Detection

Single lowercase letters not in `[x, y, f, sin, cos, tan, log, ln, e, exp, sqrt, abs]` are treated as parameters.

### Intersection Algorithm

- Tolerance: `1e-6`
- Max iterations: `100`
- Initial step size: `0.1`
- Fallback: Brute-force sampling for periodic functions (trig)

### Offline Support

Physics calculations are pure functions - no network required. Graphing engine uses local equation parsing. No special offline implementation needed beyond standard PWA caching.

### Store Naming

Following codebase conventions: `useScienceLab` and `useGraphingEngine`

### Mobile Behavior

Math Graphing: touch-based pan (drag), pinch-to-zoom, slider controls adapt to touch targets (min 44px)

**Header:**
- Tab navigation for simulation types
- Reset button to restore defaults
- Theme toggle

## Data Flow

```typescript
interface SimulationState {
  type: 'circuits' | 'momentum' | 'waves';
  params: Record<string, number>;
  results: Record<string, number>;
  isPlaying: boolean;
}

// State managed via Zustand store
useSimulationStore: {
  currentSimulation: SimulationState;
  setParam: (key: string, value: number) => void;
  calculate: () => void;
  reset: () => void;
}
```

## UI Components

1. **LabLayout** - Wrapper with header, navigation tabs
2. **SimulationCanvas** - Main visualization area
3. **ControlPanel** - Parameter inputs (sliders, number inputs)
4. **ResultsPanel** - Calculated values with formulas
5. **FormulaDisplay** - Shows relevant equations with highlighted values

## Design Tokens

- Primary: `var(--tiimo-lavender)` for interactive elements
- Secondary: `var(--tiimo-orange)` for resistors, `var(--tiimo-blue)` for current
- Background: `bg-card` with subtle grid pattern
- Animations: smooth transitions, 60fps target

---

# Part 2: Math Graphing Engine

## Goals

- Provide a Desmos-like graphing experience
- Support multiple function types common in NSC curriculum
- Enable parameter exploration via sliders
- Calculate and display intersections

## Features

### Core Graphing

**Function Input:**
- Multiple function slots (up to 5)
- Syntax: `y = f(x)` format
- Supported types:
  - Linear: `y = mx + c`
  - Quadratic: `y = ax² + bx + c`
  - Cubic: `y = ax³ + ...`
  - Trigonometric: `y = sin(x)`, `y = cos(x)`, `y = tan(x)`
  - Exponential: `y = aˣ`, `y = eˣ`
  - Logarithmic: `y = log(x)`, `y = ln(x)`
  - Reciprocal: `y = 1/x`
  - Absolute value: `y = |x|`
  - Square root: `y = √x`

**Graph Controls:**
- Pan (drag to move)
- Zoom (scroll wheel / pinch)
- Grid toggle
- Axis labels toggle
- Trace mode (show coordinates on hover)

### Parameter Sliders

- Auto-detect parameters (a, b, c, m, etc.)
- Generate slider for each parameter
- Range: -10 to 10 (configurable)
- Real-time graph update

### Analysis Features

- **Intersections:** Find where functions cross, display coordinates
- **Roots:** Find x-intercepts for each function
- **Extrema:** Find local maxima/minima (quadratic)
- **Table Mode:** Show (x, y) values in table

### Pre-built Templates

Include NSC curriculum templates:
1. Linear Functions - `y = mx + c`
2. Quadratic Functions - `y = ax² + bx + c`
3. Hyperbolic Functions - `y = a/x`
4. Exponential Functions - `y = aˣ`
5. Trigonometric Functions - `sin`, `cos`, `tan`
6. Inverse Functions - reflection about y = x

## Location

**Route:** `/math/graph` or `/graphing`

## Components

1. **GraphEngine** - Main canvas component with pan/zoom
2. **FunctionInput** - Multi-line equation input
3. **FunctionList** - Active functions with color indicators
4. **SliderPanel** - Auto-generated parameter controls
5. **AnalysisPanel** - Intersection/root results
6. **TemplateGallery** - Pre-built function templates
7. **GraphToolbar** - Zoom, grid, trace toggles

## Data Flow

```typescript
interface GraphState {
  functions: Array<{
    id: string;
    expression: string;
    color: string;
    visible: boolean;
  }>;
  viewport: {
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
  };
  params: Record<string, number>; // a, b, c, m, etc.
  analysis: {
    intersections: Array<{ x: number; y: number; functions: [string, string] }>;
    roots: Array<{ x: number; y: number; functionId: string }>;
  };
}
```

## Technical Implementation

**Equation Parsing:**
- Use `mathjs` library for expression parsing
- Evaluate expressions with parameter substitution
- Generate sample points for plotting

**Rendering:**
- HTML5 Canvas for performance
- 60fps render loop during animation
- Anti-aliased lines

**Intersection Algorithm:**
- Numerical methods (Newton-Raphson) for root finding
- Brute-force sampling for initial guesses

## UI Layout

```
┌─────────────────────────────────────────────────┐
│ [Templates] [Clear] [Analysis ▼]    [Grid] [≡] │
├─────────────────────────────────────────────────┤
│  y1 = ax² + bx + c    [color] [×]             │
│  y2 = mx + c          [color] [×]             │
│  + Add Function                               │
├───────────────┬─────────────────────────────────┤
│   Sliders     │                                 │
│   a: ──●────  │                                 │
│   b: ──●────  │       Graph Canvas             │
│   c: ──●────  │                                 │
│   m: ──●────  │                                 │
│               │                                 │
├───────────────┴─────────────────────────────────┤
│ Intersections: (1.5, 3.2) • Roots: (-2, 0)     │
└─────────────────────────────────────────────────┘
```

---

# Implementation Order

1. **Math Graphing Engine** - Core graphing first (foundational)
2. **Electric Circuits** - Most requested, builds on existing
3. **Wave Motion** - Visual, engaging
4. **Momentum** - Physics simulation

---

# Acceptance Criteria

## Virtual Science Lab

- [ ] User can access /science-lab and see tab navigation
- [ ] Electric Circuits: Adjust voltage/resistance, see current update in real-time
- [ ] Momentum: Set masses/velocities, see collision animation with results
- [ ] Waves: Adjust frequency/amplitude, see animated wave with equation
- [ ] All simulations show relevant formulas with calculated values
- [ ] Responsive on tablet/desktop (mobile: show "best on larger screen")

## Math Graphing Engine

- [ ] User can input multiple functions with proper syntax
- [ ] Graph renders smoothly with pan/zoom
- [ ] Parameter sliders auto-generate from expressions
- [ ] Intersections calculated and displayed
- [ ] Templates load pre-built NSC curriculum functions
- [ ] Works offline after initial load

---

# Files to Create/Modify

## New Files

- `src/app/science-lab/page.tsx` - Lab main page
- `src/app/science-lab/circuits/page.tsx` - Circuits simulation
- `src/app/science-lab/momentum/page.tsx` - Momentum simulation
- `src/app/science-lab/waves/page.tsx` - Waves simulation
- `src/app/math/graph/page.tsx` - Graphing engine page
- `src/components/ScienceLab/*` - Lab components
- `src/components/Graphing/*` - Graphing components
- `src/stores/useSimulationStore.tsx` - Zustand store for lab
- `src/stores/useGraphStore.tsx` - Zustand store for graphing
- `src/lib/physics/*.ts` - Physics calculation utilities
- `src/lib/graphing/*.ts` - Graphing utilities

## Modified Files

- `src/app.config.ts` - Add new routes to navigation
- `src/components/Dashboard/SubjectGridV2.tsx` - Link to new tools
- `src/screens/PhysicalSciences.tsx` - Link to circuits lab
