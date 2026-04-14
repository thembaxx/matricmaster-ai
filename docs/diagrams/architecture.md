# Architecture Diagrams

System architecture, data flow, and component interaction diagrams for the MatricMaster AI enriched app prototype.

---

## 1. System Architecture

```mermaid
graph TB
    subgraph Client["Client Layer (Next.js 16 App)"]
        A[React 19 Components]
        B[shadcn/ui Components]
        C[Framer Motion Animations]
        D[Recharts Dashboards]
        E[Zustand State Stores]
        A --> B
        A --> C
        A --> D
        A --> E
    end

    subgraph API["API Layer (Next.js Serverless Routes)"]
        F[AI Tutor Endpoints]
        G[Quiz / Flashcard Endpoints]
        H[Progress / Analytics Endpoints]
        I[Mock Data Generator API<br/>POST /api/mock-data/generate]
        J[Enrichment Pipeline API<br/>POST /api/enrichment/run<br/>GET /api/enrichment/stats]
        K[Activity Timeline API<br/>GET /api/activity/:userId/timeline]
    end

    subgraph DataLayer["Data Layer"]
        L[(PostgreSQL<br/>Production)]
        M[(SQLite<br/>Dev / Offline)]
        N[Drizzle ORM v0.45<br/>Smart DB Router]
        O[Drizzle Studio]
        L --> N
        M --> N
        O --> N
    end

    subgraph External["External Services"]
        P[Google Gemini API]
        Q[Ably Real-time]
        R[Paystack Payments]
        S[Resend Email]
        T[UploadThing Files]
    end

    subgraph Enrichment["Enrichment Pipeline"]
        U[Web Research Module]
        V[robots.txt Checker]
        W[Data Fetcher + Rate Limiter]
        X[Parser + Normalizer]
        Y[Deduplicator<br/>sourceUrl:contentHash]
        Z[Schema Validator]
        AA[Quality Scorer]
        AB[Quarantine Store]
        U --> V
        V --> W
        W --> X
        X --> Y
        Y --> Z
        Z --> AA
        AA -->|Pass| L
        AA -->|Fail| AB
    end

    subgraph MockGen["Mock Data Generator"]
        AC[Seeded RNG<br/>mulberry32]
        AD[User Generator]
        AE[Quiz Result Generator]
        AF[Study Session Generator]
        AG[Topic Mastery Generator]
        AH[Achievement Generator]
        AI[Social Data Generator<br/>Channels, Members, Events, Notifs]
        AC --> AD
        AC --> AE
        AC --> AF
        AC --> AG
        AC --> AH
        AC --> AI
    end

    A --> F
    A --> G
    A --> H
    A --> I
    A --> J
    A --> K

    F --> P
    G --> N
    H --> N
    I --> MockGen
    MockGen --> N
    J --> Enrichment
    K --> N

    F -.-> Q
    G -.-> R
    H -.-> S
    A -.-> T
```

**Narrative:** The client layer consists of React 19 components powered by shadcn/ui, Framer Motion, Recharts, and Zustand stores. These communicate with the API layer of Next.js serverless routes. The API layer serves three categories: existing app features (AI tutor, quiz, flashcards, progress), mock data generation, and data enrichment. The data layer uses Drizzle ORM with a smart router that targets PostgreSQL in production and SQLite in development. External services (Gemini, Ably, Paystack, Resend, UploadThing) remain unchanged. The enrichment pipeline independently fetches, normalizes, deduplicates, validates, and persists external data. The mock data generator uses a seeded RNG to produce reproducible synthetic user data.

---

## 2. Data Flow Diagram

```mermaid
flowchart LR
    subgraph Ingestion["Ingestion"]
        A1[Web Source APIs] --> A2[robots.txt Check]
        A3[Mock Data Generator] --> A4[Seeded RNG]
        A2 -->|Allowed| A5[HTTP Fetch<br/>with Rate Limit]
        A2 -->|Blocked| A6[Log & Skip]
        A5 --> A7[Raw Response]
        A4 --> A8[Generated Records]
    end

    subgraph Transformation["Transformation"]
        A7 --> B1[Parser]
        B1 --> B2[Normalizer<br/>+ Metadata Enrichment]
        A8 --> B2
        B2 --> B3[Deduplicator<br/>sourceUrl:contentHash]
    end

    subgraph Enrichment["Enrichment"]
        B3 --> C1[Schema Validator]
        C1 --> C2[Quality Scorer<br/>high / medium / low]
        C2 --> C3{Quality Gate}
    end

    subgraph Storage["Storage"]
        C3 -->|Pass| D1[(PostgreSQL / SQLite<br/>Drizzle ORM)]
        C3 -->|Fail| D2[Quarantine Store]
        D1 --> D3[Zustand Cache<br/>Client State]
        D2 --> D4[Admin Dashboard<br/>Quarantine View]
    end

    subgraph Presentation["Presentation"]
        D3 --> E1[ActivityHeatmap]
        D3 --> E2[ProgressRings]
        D3 --> E3[ActivityStream]
        D3 --> E4[AccuracyTrend]
        D3 --> E5[StreakCounter]
        D3 --> E6[WeakTopicHighlights]
        D3 --> E7[CohortComparison]
    end
```

**Narrative:** Data enters the system through two paths: (1) web sources fetched via the enrichment pipeline, and (2) synthetic data from the mock generator. Both paths converge at the normalizer, which adds provenance metadata (`dataSource`, `enrichedAt`, `dataQuality`). Records are deduplicated using a composite key of `sourceUrl` + `contentHash` (SHA-256). The validator checks schema compliance, and the quality scorer assigns a tier based on field completeness. Passing records persist to the database; failing records go to quarantine. The client reads from the cached Zustand store, which reflects the latest persisted state.

---

## 3. Component Interaction Diagram

```mermaid
graph LR
    subgraph Pages
        P1[Dashboard Page]
        P2[Subject Detail Page]
        P3[Quiz Page]
        P4[Admin Settings Page]
    end

    subgraph EnrichedComponents["Enriched Dashboard Components"]
        C1[ActivityHeatmap]
        C2[ProgressRings]
        C3[ActivityStream]
        C4[AccuracyTrend]
        C5[StreakCounter]
        C6[WeakTopicHighlights]
        C7[CohortComparison]
    end

    subgraph Services
        S1[Activity Timeline API]
        S2[Mock Data Generator API]
        S3[Enrichment Pipeline API]
        S4[Drizzle ORM / DB]
    end

    subgraph State
        Z1[Zustand: useEnrichedStore]
        Z2[Zustand: useMockDataStore]
    end

    P1 --> C1
    P1 --> C2
    P1 --> C3
    P1 --> C5

    P2 --> C4
    P2 --> C6
    P2 --> C7

    P4 --> S2
    P4 --> S3

    C1 --> S1
    C2 --> Z1
    C3 --> Z1
    C4 --> Z1
    C5 --> Z1
    C6 --> Z1
    C7 --> Z1

    S1 --> S4
    S2 --> S4
    S3 --> S4

    Z1 --> S1
    Z2 --> S2
```

**Narrative:** The Dashboard page composes ActivityHeatmap, ProgressRings, ActivityStream, and StreakCounter. The Subject Detail page uses AccuracyTrend, WeakTopicHighlights, and CohortComparison. Admin Settings provides controls to trigger mock data generation and run the enrichment pipeline. All enriched components read from the `useEnrichedStore` Zustand store, which fetches from the Activity Timeline API. The mock data and enrichment APIs write directly to the database. Feature flags (`mockDataEnabled`) control whether enriched or real data is displayed.
