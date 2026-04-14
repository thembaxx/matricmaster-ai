# Flow Diagrams

Sequence and lifecycle diagrams for the MatricMaster AI enriched app prototype.

---

## 1. Sequence Diagram: Mock Data Generation

```mermaid
sequenceDiagram
    participant U as User (Admin)
    participant FE as Frontend (Next.js)
    participant API as POST /api/mock-data/generate
    participant GEN as MockDataGenerator
    participant RNG as Seeded RNG (mulberry32)
    participant Social as SocialGenerator
    participant DB as Database (Drizzle ORM)

    U->>FE: Click "Generate Mock Data"
    FE->>API: POST {userCount, monthsBack, intensity, seed}
    API->>API: Parse request body
    API->>DB: Initialize DB connection
    API->>API: Load existing subjects (for ID mapping)
    API->>GEN: CreateMockDataGenerator(config)
    GEN->>RNG: Initialize with seed
    GEN->>GEN: Generate date range (intensity-based)
    GEN->>GEN: Generate Users (userCount)

    loop For each user
        GEN->>RNG: Generate quiz results (6 per user)
        GEN->>RNG: Generate study sessions (8-25 based on intensity)
        GEN->>RNG: Generate topic mastery (4 subjects per user)
        GEN->>RNG: Generate achievements
        GEN->>DB: Insert user + quiz results + sessions + mastery + achievements
    end

    API->>Social: Create SocialGenerator
    loop For each channel (10 total)
        Social->>Social: Generate channel metadata
        Social->>Social: Generate channel members
        Social->>DB: Insert channel + members
    end

    loop For sample users (20)
        Social->>Social: Generate calendar events
        Social->>Social: Generate notifications
        Social->>Social: Generate AI conversations (30% chance)
        Social->>DB: Insert calendar events + notifications + AI conversations
    end

    DB-->>API: Insert confirmation
    API-->>FE: {success, usersGenerated, records, config}
    FE-->>U: Toast "Mock data generated" + refresh dashboard
```

**Narrative:** An admin triggers mock data generation from the admin panel. The API initializes the database, loads existing subjects for ID mapping, and creates a `MockDataGenerator` with the provided seed. For each user, it generates quiz results, study sessions, topic mastery, and achievements -- inserting them in per-user transactions. Then a `SocialGenerator` creates channels with members, followed by calendar events, notifications, and AI conversations for a sample of users. The final response includes record counts and the seed used. The frontend shows a success toast and refreshes the dashboard.

---

## 2. Sequence Diagram: Data Enrichment from Web Source

```mermaid
sequenceDiagram
    participant S as Scheduler / Admin
    participant API as POST /api/enrichment/run
    participant PL as EnrichmentPipeline
    participant RL as RateLimiter
    participant RT as robots.txt Checker
    participant WS as Web Source (e.g., DBE Past Papers)
    participant Parser as Source Parser
    participant Norm as Normalizer
    participant Dedup as Deduplicator
    participant Val as Validator
    participant QS as Quality Scorer
    participant DB as Database
    participant Quar as Quarantine Store

    S->>API: POST {sourceId?, runAll?}
    API->>API: Check admin session
    alt Unauthorized
        API-->>S: 401 {error: "Unauthorized"}
    end

    API->>PL: GetEnrichmentPipeline()

    alt Run single source
        API->>PL: runSource(sourceId)
    else Run all sources
        loop For each registered source
            API->>PL: runSource(source.id)
        end
    end

    PL->>RT: checkRobotsTxt(source.url)
    alt Blocked by robots.txt
        RT-->>PL: {allowed: false, reason}
        PL-->>API: {success: false, errors: ["Blocked by robots.txt"]}
    else Allowed
        RT-->>PL: {allowed: true}
        PL->>RL: waitForDomain(domain, rateLimitMs)
        RL-->>PL: Ready
        PL->>WS: GET source.url (with User-Agent, AbortController)
        WS-->>PL: HTTP 200 response body
        PL->>Parser: parser(rawResponse)
        Parser-->>PL: EnrichedRecord[]

        loop For each record
            PL->>Norm: normalizeRecord(record, source)
            Norm-->>PL: Record with metadata (dataSource, enrichedAt, provenance)
            PL->>Dedup: check sourceUrl:contentHash
            alt Duplicate
                Dedup-->>PL: Skip
            else New
                Dedup-->>PL: Include
                PL->>Val: validateRecord(record)
                alt Valid
                    Val-->>PL: {valid: true}
                    PL->>QS: calculateQuality(record)
                    QS-->>PL: high | medium | low
                    PL->>DB: Persist record
                    DB-->>PL: Confirmed
                else Invalid
                    Val-->>PL: {valid: false, errors}
                    PL->>Quar: quarantine(record, reason)
                    Quar-->>PL: Stored
                end
            end
        end

        PL-->>API: PipelineResult{success, counts, duration}
    end

    API-->>S: Pipeline result(s) + summary
```

**Narrative:** An admin or scheduler triggers the enrichment pipeline. The API verifies admin access first. For each source, the pipeline checks robots.txt, then rate-limits the request. Data is fetched with a 30-second timeout and retries with exponential backoff (1s, 2s, 4s). The source-specific parser converts raw data to `EnrichedRecord` objects. Each record is normalized with provenance metadata, deduplicated via SHA-256 content hash, validated against schema rules, quality-scored, and persisted. Invalid records are quarantined with reason codes. The response includes per-source and aggregate statistics.

---

## 3. UI Flow Diagram: User Journey Through Enriched App

```mermaid
flowchart TD
    Start([User Opens App]) --> Login{Authenticated?}

    Login -->|No| AuthFlow[Login / Register Page]
    AuthFlow --> Login

    Login -->|Yes| Dashboard[Dashboard Page]

    Dashboard --> HasData{Has enriched data?}
    HasData -->|Yes| ShowHeatmap[Show ActivityHeatmap<br/>6-month contribution grid]
    HasData -->|No| EmptyState[Show empty state<br/>"Start your journey"]

    ShowHeatmap --> Streak[Show StreakCounter<br/>flame icon + streak count]
    Streak --> Rings[Show ProgressRings<br/>per-subject circular progress]
    Rings --> Stream[Show ActivityStream<br/>grouped by date]

    EmptyState --> Streak

    Dashboard --> ClickSubject[User clicks subject card]
    ClickSubject --> SubjectDetail[Subject Detail Page]

    SubjectDetail --> Accuracy[Show AccuracyTrend<br/>sparkline + area chart]
    Accuracy --> WeakTopics[Show WeakTopicHighlights<br/>top 5 weak topics with practice CTAs]
    WeakTopics --> Cohort[Show CohortComparison<br/>user vs cohort bar chart]

    SubjectDetail --> StartQuiz[Click "Start Quiz"]
    StartQuiz --> QuizSession[Quiz Session]
    QuizSession --> RecordResult[Record quiz result]
    RecordResult --> UpdateProgress[Update user progress in DB]
    UpdateProgress --> Dashboard

    SubjectDetail --> PracticeWeak[Click "Practice Now" on weak topic]
    PracticeWeak --> QuizSession

    Dashboard --> ViewAnalytics[Click "Analytics"]
    ViewAnalytics --> AnalyticsPage[Analytics Dashboard]
    AnalyticsPage --> ViewCohort[View cohort comparison]
    ViewCohort --> Dashboard

    Dashboard --> ViewGamification[Click "Achievements"]
    ViewGamification --> AchievementsPage[Achievement badges<br/>with unlock dates and rarity]
    AchievementsPage --> Dashboard

    style Start fill:#3B82F6,color:#fff
    style Dashboard fill:#22C55E,color:#fff
    style ShowHeatmap fill:#8B5CF6,color:#fff
    style Accuracy fill:#8B5CF6,color:#fff
    style WeakTopics fill:#8B5CF6,color:#fff
    style Cohort fill:#8B5CF6,color:#fff
```

**Narrative:** The user authenticates and lands on the Dashboard. If enriched data exists, they see the activity heatmap, streak counter, progress rings, and activity stream. Clicking a subject reveals accuracy trends, weak topic highlights, and cohort comparison. From any subject view, the user can start a quiz or practice weak topics. Quiz results update progress and return to the dashboard. The analytics and achievements pages provide deeper insights into historical performance.

---

## 4. Data Lifecycle Diagram

```mermaid
flowchart LR
    subgraph Create["Creation"]
        A1[Mock Data Generator<br/>seeded RNG] --> A2[Synthetic Users + Activity]
        A3[Web Scrapers / APIs<br/>robots.txt compliant] --> A4[Raw External Data]
    end

    subgraph Process["Processing"]
        A2 --> B1[Normalize to Schema<br/>+ provenance metadata]
        A4 --> B1
        B1 --> B2[Deduplicate<br/>sourceUrl:contentHash SHA-256]
        B2 --> B3[Validate<br/>schema compliance]
        B3 --> B4[Quality Score<br/>high / medium / low]
    end

    subgraph Store["Persistence"]
        B4 -->|Pass| C1[(PostgreSQL / SQLite<br/>Drizzle ORM)]
        B4 -->|Fail| C2[Quarantine Store<br/>with reason codes]
        C1 --> C3[Tag: dataSource =<br/>mock | enriched | real]
    end

    subgraph Serve["Presentation"]
        C1 --> D1[Activity Timeline API<br/>GET /api/activity/:userId/timeline]
        D1 --> D2[Zustand Store<br/>useEnrichedStore]
        D2 --> D3[React Components<br/>Heatmap, Rings, Stream, etc.]
        C2 --> D4[Admin Quarantine View<br/>GET /api/enrichment/stats]
    end

    subgraph Evolve["Evolution"]
        D3 --> E1[New user activity<br/>quiz, study, flashcard]
        E1 --> C1
        C1 -.->|weekly/monthly| A3
        C2 -.->|retry with<br/>alternative parser| B1
    end
```

**Narrative:** Data is created through two channels: the mock data generator produces synthetic users with seeded randomness, and web sources provide external educational content. Both converge at the normalization step where provenance metadata is attached. Deduplication prevents duplicate records via SHA-256 content hashing. Validation and quality scoring gate data before persistence. All records are tagged with their `dataSource` (`mock`, `enriched`, or `real`). The presentation layer serves data through the Activity Timeline API to React components via Zustand. The lifecycle is cyclical: new user activity feeds back into the database, enrichment sources are refreshed on schedule, and quarantined records can be retried with alternative parsers.
