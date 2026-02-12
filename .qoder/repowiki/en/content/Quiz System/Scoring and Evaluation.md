# Scoring and Evaluation

<cite>
**Referenced Files in This Document**
- [evaluation.ts](file://src/types/evaluation.ts)
- [quiz-data.ts](file://src/constants/quiz-data.ts)
- [PhysicsQuiz.tsx](file://src/screens/PhysicsQuiz.tsx)
- [EnhancedTestQuiz.tsx](file://src/screens/EnhancedTestQuiz.tsx)
- [Achievements.tsx](file://src/screens/Achievements.tsx)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)
10. [Appendices](#appendices)

## Introduction
This document explains the quiz scoring and evaluation system implemented in the project. It covers the scoring algorithms, correctness validation logic, point calculation mechanisms, evaluation criteria for different question types, progress tracking, score aggregation, grade determination, and integration with user progress and achievements. It also documents transparency features, immediate feedback systems, and pathways for customization and integration with external assessment systems.

## Project Structure
The scoring and evaluation logic spans several modules:
- A reusable evaluation library for language and content-based assessments
- Quiz screens implementing question-by-question scoring and progress tracking
- A results screen aggregating scores and determining grades
- Achievement display integrating mastery metrics

```mermaid
graph TB
subgraph "Screens"
PQ["PhysicsQuiz.tsx"]
ETQ["EnhancedTestQuiz.tsx"]
ACH["Achievements.tsx"]
end
subgraph "Types and Constants"
EVAL["evaluation.ts"]
QDATA["quiz-data.ts"]
end
PQ --> EVAL
ETQ --> EVAL
ETQ --> QDATA
ACH --> ETQ
```

**Diagram sources**
- [PhysicsQuiz.tsx](file://src/screens/PhysicsQuiz.tsx#L164-L446)
- [EnhancedTestQuiz.tsx](file://src/screens/EnhancedTestQuiz.tsx#L113-L846)
- [evaluation.ts](file://src/types/evaluation.ts#L1-L421)
- [quiz-data.ts](file://src/constants/quiz-data.ts#L1-L313)
- [Achievements.tsx](file://src/screens/Achievements.tsx#L96-L250)

**Section sources**
- [evaluation.ts](file://src/types/evaluation.ts#L1-L421)
- [quiz-data.ts](file://src/constants/quiz-data.ts#L1-L313)
- [PhysicsQuiz.tsx](file://src/screens/PhysicsQuiz.tsx#L164-L446)
- [EnhancedTestQuiz.tsx](file://src/screens/EnhancedTestQuiz.tsx#L113-L846)
- [Achievements.tsx](file://src/screens/Achievements.tsx#L96-L250)

## Core Components
- Content-based evaluation for constructed responses (summary/argument tasks)
- Exact-match and keyword-based evaluation for short-answer tasks
- Multiple-choice evaluation with flexible normalization
- Quiz progress tracking and immediate feedback
- Score aggregation and grade determination
- Achievement and mastery visualization

Key implementation references:
- Content analysis and language marks: [evaluateSummary](file://src/types/evaluation.ts#L201-L248), [analyzeSummaryPoints](file://src/types/evaluation.ts#L34-L80), [calculateLanguageMarks](file://src/types/evaluation.ts#L144-L186)
- Exact match evaluation: [evaluateExactMatch](file://src/types/evaluation.ts#L260-L314)
- Keyword-based evaluation: [evaluateKeywordBased](file://src/types/evaluation.ts#L332-L378)
- Multiple-choice evaluation: [evaluateMultipleChoice](file://src/types/evaluation.ts#L383-L410)
- Quiz progress and scoring: [PhysicsQuiz.tsx](file://src/screens/PhysicsQuiz.tsx#L195-L213), [EnhancedTestQuiz.tsx](file://src/screens/EnhancedTestQuiz.tsx#L277-L291)
- Grade determination: [EnhancedTestQuiz.tsx](file://src/screens/EnhancedTestQuiz.tsx#L284-L291)

**Section sources**
- [evaluation.ts](file://src/types/evaluation.ts#L201-L410)
- [PhysicsQuiz.tsx](file://src/screens/PhysicsQuiz.tsx#L195-L213)
- [EnhancedTestQuiz.tsx](file://src/screens/EnhancedTestQuiz.tsx#L277-L291)

## Architecture Overview
The evaluation pipeline integrates UI screens with evaluation utilities. Screens collect answers, compute per-question scores, aggregate totals, and present results and feedback.

```mermaid
sequenceDiagram
participant U as "User"
participant UI as "Quiz Screen"
participant EVAL as "Evaluation Library"
participant DB as "Question Store"
U->>UI : Select answer / Submit response
UI->>UI : Compute per-question score
UI->>EVAL : Call evaluation function (exact/keyword/mc/summary)
EVAL-->>UI : Return scored result and explanation
UI->>UI : Update progress and score
UI->>DB : Persist session and results (optional)
UI-->>U : Show immediate feedback and next steps
```

**Diagram sources**
- [PhysicsQuiz.tsx](file://src/screens/PhysicsQuiz.tsx#L195-L213)
- [EnhancedTestQuiz.tsx](file://src/screens/EnhancedTestQuiz.tsx#L277-L291)
- [evaluation.ts](file://src/types/evaluation.ts#L260-L410)

## Detailed Component Analysis

### Content-Based Summary Evaluation
This component evaluates constructed responses by:
- Normalizing text for comparison
- Matching verbatim quotes and paraphrased content via keywords
- Assigning content marks up to a required threshold
- Applying language marks with criteria that penalize excessive verbatim quoting
- Enforcing word limits and generating explanations

```mermaid
flowchart TD
Start(["Start"]) --> Normalize["Normalize student answer and required points"]
Normalize --> MatchVerbatim["Check verbatim matches"]
MatchVerbatim --> ParaphraseCheck{"Allow paraphrase?"}
ParaphraseCheck --> |Yes| Extract["Extract keywords from description"]
Extract --> KeywordMatch["Count keyword matches"]
KeywordMatch --> Threshold{"Match ≥ 50%?"}
Threshold --> |Yes| MarkParaphrased["Mark as paraphrased match"]
Threshold --> |No| NoMatch["No paraphrased match"]
MatchVerbatim --> |No| ParaphraseCheck
MarkParaphrased --> Aggregate["Aggregate matched points (≤ required count)"]
NoMatch --> Aggregate
Aggregate --> VerbatimCount["Count verbatim quotes"]
VerbatimCount --> LangMarks["Compute language marks by criteria"]
LangMarks --> WordLimit["Check word count vs limit"]
WordLimit --> BuildExplain["Build explanation and totals"]
BuildExplain --> End(["End"])
```

**Diagram sources**
- [evaluation.ts](file://src/types/evaluation.ts#L34-L80)
- [evaluation.ts](file://src/types/evaluation.ts#L144-L186)
- [evaluation.ts](file://src/types/evaluation.ts#L201-L248)

**Section sources**
- [evaluation.ts](file://src/types/evaluation.ts#L23-L80)
- [evaluation.ts](file://src/types/evaluation.ts#L144-L186)
- [evaluation.ts](file://src/types/evaluation.ts#L201-L248)

### Exact-Match and Keyword-Based Evaluations
- Exact match evaluation supports case sensitivity and optional partial inclusion checks, awarding full marks on match.
- Keyword-based evaluation optionally requires all keywords or awards marks proportionally.

```mermaid
flowchart TD
EStart(["Exact Match Entry"]) --> CaseCheck{"Case sensitive?"}
CaseCheck --> |No| NormStudent["Normalize student answer"]
CaseCheck --> |Yes| KeepOrig["Keep original case"]
NormStudent --> LoopExact["Loop acceptable answers"]
KeepOrig --> LoopExact
LoopExact --> ExactMatch{"Exact match?"}
ExactMatch --> |Yes| Return1["Return 1/1 with explanation"]
ExactMatch --> |No| PartialAllowed{"Partial allowed?"}
PartialAllowed --> |Yes| LoopPartial["Loop acceptable answers"]
LoopPartial --> PartialMatch{"Partial include?"}
PartialMatch --> |Yes| Return2["Return 1/1 with explanation"]
PartialMatch --> |No| Return0["Return 0/1"]
PartialAllowed --> |No| Return0
KStart(["Keyword Entry"]) --> CaseK{"Case sensitive?"}
CaseK --> |No| NormK["Normalize answer"]
CaseK --> |Yes| KeepK["Keep original case"]
NormK --> Scan["Scan for each keyword"]
KeepK --> Scan
Scan --> AllReq{"Require all keywords?"}
AllReq --> |Yes| CheckAll{"Found all?"}
CheckAll --> |Yes| FullMarks["Award max marks"]
CheckAll --> |No| ZeroMarks["Award 0"]
AllReq --> |No| Prop["Award min(found, max)"]
FullMarks --> KEnd(["End"])
ZeroMarks --> KEnd
Prop --> KEnd
```

**Diagram sources**
- [evaluation.ts](file://src/types/evaluation.ts#L260-L314)
- [evaluation.ts](file://src/types/evaluation.ts#L332-L378)

**Section sources**
- [evaluation.ts](file://src/types/evaluation.ts#L260-L314)
- [evaluation.ts](file://src/types/evaluation.ts#L332-L378)

### Multiple-Choice Evaluation
- Supports flexible normalization and optional acceptance of letter or full-text answers.
- Returns correctness flag and awarded/max marks.

```mermaid
flowchart TD
MStart(["MCQ Entry"]) --> Normalize["Normalize student and correct"]
Normalize --> Accept{"Accept letter or text?"}
Accept --> |Yes| Compare1["Compare normalized student vs normalized correct"]
Accept --> |No| Compare2["Compare normalized student vs normalized correct"]
Compare1 --> Decision{"Equal?"}
Compare2 --> Decision
Decision --> |Yes| ReturnTrue["Award 1/1, correct"]
Decision --> |No| ReturnFalse["Award 0/1, incorrect"]
ReturnTrue --> MEnd(["End"])
ReturnFalse --> MEnd
```

**Diagram sources**
- [evaluation.ts](file://src/types/evaluation.ts#L383-L410)

**Section sources**
- [evaluation.ts](file://src/types/evaluation.ts#L383-L410)

### Quiz Progress Tracking and Immediate Feedback
- Physics quiz tracks current question index, selected answer, correctness, and score per question.
- On submission, it toggles result visibility and updates score accordingly.
- Progress bar and score badge reflect real-time progress.

```mermaid
sequenceDiagram
participant U as "User"
participant PQ as "PhysicsQuiz.tsx"
U->>PQ : Select answer
U->>PQ : Click Check Answer
PQ->>PQ : Compare selected vs correct
PQ->>PQ : Set isCorrect, showResult, update score
PQ-->>U : Immediate feedback + visual cues
U->>PQ : Next Question
PQ->>PQ : Advance index, reset state
```

**Diagram sources**
- [PhysicsQuiz.tsx](file://src/screens/PhysicsQuiz.tsx#L195-L213)
- [PhysicsQuiz.tsx](file://src/screens/PhysicsQuiz.tsx#L215-L446)

**Section sources**
- [PhysicsQuiz.tsx](file://src/screens/PhysicsQuiz.tsx#L164-L446)

### Score Aggregation and Grade Determination
- Enhanced test quiz aggregates correct answers across all questions.
- Computes grade based on percentage thresholds.
- Displays time taken and per-question correctness.

```mermaid
flowchart TD
SStart(["Quiz Completed"]) --> Count["Count correct answers"]
Count --> Percent["Compute percentage"]
Percent --> Grade{"Threshold met?"}
Grade --> |>=80| A["Grade A"]
Grade --> |>=70| B["Grade B"]
Grade --> |>=60| C["Grade C"]
Grade --> |>=50| D["Grade D"]
Grade --> |<50| F["Grade F"]
A --> Report["Render results and per-question feedback"]
B --> Report
C --> Report
D --> Report
F --> Report
```

**Diagram sources**
- [EnhancedTestQuiz.tsx](file://src/screens/EnhancedTestQuiz.tsx#L277-L291)
- [EnhancedTestQuiz.tsx](file://src/screens/EnhancedTestQuiz.tsx#L790-L840)

**Section sources**
- [EnhancedTestQuiz.tsx](file://src/screens/EnhancedTestQuiz.tsx#L277-L291)
- [EnhancedTestQuiz.tsx](file://src/screens/EnhancedTestQuiz.tsx#L790-L840)

### Achievement and Mastery Visualization
- Achievements page displays mastery level, progress percentage, and badge collection.
- Integrates with quiz results indirectly via user progression and activity.

```mermaid
graph TB
ETQ["EnhancedTestQuiz.tsx"]
ACH["Achievements.tsx"]
ETQ --> ACH
ACH --> ACH
```

**Diagram sources**
- [EnhancedTestQuiz.tsx](file://src/screens/EnhancedTestQuiz.tsx#L790-L840)
- [Achievements.tsx](file://src/screens/Achievements.tsx#L96-L250)

**Section sources**
- [Achievements.tsx](file://src/screens/Achievements.tsx#L96-L250)

## Dependency Analysis
- Quiz screens depend on evaluation utilities for correctness and scoring.
- Enhanced test quiz depends on question data and database actions for dynamic quizzes.
- Achievements rely on aggregated quiz performance indirectly.

```mermaid
graph LR
EVAL["evaluation.ts"] --> PQ["PhysicsQuiz.tsx"]
EVAL --> ETQ["EnhancedTestQuiz.tsx"]
QDATA["quiz-data.ts"] --> ETQ
ETQ --> ACH["Achievements.tsx"]
```

**Diagram sources**
- [evaluation.ts](file://src/types/evaluation.ts#L1-L421)
- [PhysicsQuiz.tsx](file://src/screens/PhysicsQuiz.tsx#L164-L446)
- [EnhancedTestQuiz.tsx](file://src/screens/EnhancedTestQuiz.tsx#L113-L846)
- [quiz-data.ts](file://src/constants/quiz-data.ts#L1-L313)
- [Achievements.tsx](file://src/screens/Achievements.tsx#L96-L250)

**Section sources**
- [evaluation.ts](file://src/types/evaluation.ts#L1-L421)
- [PhysicsQuiz.tsx](file://src/screens/PhysicsQuiz.tsx#L164-L446)
- [EnhancedTestQuiz.tsx](file://src/screens/EnhancedTestQuiz.tsx#L113-L846)
- [quiz-data.ts](file://src/constants/quiz-data.ts#L1-L313)
- [Achievements.tsx](file://src/screens/Achievements.tsx#L96-L250)

## Performance Considerations
- Text normalization and keyword extraction are linear in input length; keep keyword lists concise.
- Exact and keyword evaluations iterate over acceptable answers; prefer smaller sets or pre-filtered candidates.
- Multiple-choice comparisons are O(1) after normalization.
- UI rendering updates are optimized via React state management; avoid unnecessary re-renders by memoizing derived values.

## Troubleshooting Guide
Common issues and resolutions:
- Incorrect scoring for MCQs: Verify normalization options and accepted answer formats.
- Keyword evaluation not awarding marks: Confirm case sensitivity and whether partial inclusion is enabled.
- Summary evaluation not recognizing paraphrased content: Adjust keyword extraction and matching thresholds.
- Progress not updating: Ensure state updates occur after correctness checks and before advancing to next question.

**Section sources**
- [evaluation.ts](file://src/types/evaluation.ts#L260-L410)
- [PhysicsQuiz.tsx](file://src/screens/PhysicsQuiz.tsx#L195-L213)
- [EnhancedTestQuiz.tsx](file://src/screens/EnhancedTestQuiz.tsx#L277-L291)

## Conclusion
The system provides robust, extensible scoring and evaluation capabilities across multiple question types, with immediate feedback, progress tracking, and grade computation. The evaluation utilities encapsulate correctness logic, while quiz screens orchestrate user interactions and results presentation. Achievements integrate with quiz performance to visualize mastery.

## Appendices

### Implementation Guidelines for Customization
- To customize scoring rules:
  - Modify evaluation thresholds and criteria in the evaluation utilities.
  - Extend evaluation functions to support new question types (e.g., numeric, drag-and-drop).
- To integrate with external assessment systems:
  - Persist quiz sessions and results to a backend service.
  - Export performance analytics (time, accuracy, topic-wise breakdown).
  - Align grade boundaries with external standards.

### Example References
- Summary evaluation: [evaluateSummary](file://src/types/evaluation.ts#L201-L248)
- Exact match evaluation: [evaluateExactMatch](file://src/types/evaluation.ts#L260-L314)
- Keyword evaluation: [evaluateKeywordBased](file://src/types/evaluation.ts#L332-L378)
- MCQ evaluation: [evaluateMultipleChoice](file://src/types/evaluation.ts#L383-L410)
- Quiz scoring and progress: [PhysicsQuiz.tsx](file://src/screens/PhysicsQuiz.tsx#L195-L213), [EnhancedTestQuiz.tsx](file://src/screens/EnhancedTestQuiz.tsx#L277-L291)
- Grade determination: [EnhancedTestQuiz.tsx](file://src/screens/EnhancedTestQuiz.tsx#L284-L291)