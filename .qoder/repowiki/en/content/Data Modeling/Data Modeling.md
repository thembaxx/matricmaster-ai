# Data Modeling

<cite>
**Referenced Files in This Document**
- [mathematics_model.md](file://src/data_modeling/mathematics_model.md)
- [physics_model.md](file://src/data_modeling/physics_model.md)
- [economics_model.md](file://src/data_modeling/economics_model.md)
- [english_model.md](file://src/data_modeling/english_model.md)
- [history_model.md](file://src/data_modeling/history_model.md)
- [accounting_model.md](file://src/data_modeling/accounting_model.md)
- [index.ts](file://src/types/index.ts)
- [evaluation.ts](file://src/types/evaluation.ts)
- [quiz-data.ts](file://src/constants/quiz-data.ts)
- [mock-data.ts](file://src/constants/mock-data.ts)
- [MathematicsQuiz.tsx](file://src/screens/MathematicsQuiz.tsx)
- [PhysicsQuiz.tsx](file://src/screens/PhysicsQuiz.tsx)
- [PracticeQuiz.tsx](file://src/screens/PracticeQuiz.tsx)
- [InteractiveQuiz.tsx](file://src/screens/InteractiveQuiz.tsx)
- [geminiService.ts](file://src/services/geminiService.ts)
- [aiActions.ts](file://src/services/aiActions.ts)
- [data.ts](file://src/lib/data.ts)
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
This document provides comprehensive data modeling documentation for MatricMaster AI’s educational content structure across six subjects aligned with South African Senior Certificate (NSC) curriculum standards: Mathematics, Physics, Economics, English, History, and Accounting. It details subject-specific data models, question structures, answer formats, difficulty levels, topic coverage, content organization patterns, prerequisite relationships, and learning pathway mapping. It also explains implementation details for content validation, question randomization, and adaptive assessment strategies, and documents the relationships between data models and quiz system functionality, progress tracking, and study planning features. Finally, it outlines content creation workflows, data import procedures, curriculum alignment validation, maintenance strategies, update procedures, and integration with AI-powered content generation.

## Project Structure
MatricMaster AI organizes subject data models under a dedicated folder and integrates them with:
- TypeScript interfaces and evaluation utilities for quiz scoring
- Constant datasets for quick-start quizzes
- UI screens for interactive quiz experiences
- AI services for explanations and study planning
- Server-side data utilities for dashboard, progress, and recommendations

```mermaid
graph TB
subgraph "Data Models"
M["Mathematics Model"]
P["Physics Model"]
E["Economics Model"]
EN["English Model"]
H["History Model"]
A["Accounting Model"]
end
subgraph "Quiz System"
IQ["InteractiveQuiz.tsx"]
MQ["MathematicsQuiz.tsx"]
PQ["PhysicsQuiz.tsx"]
PQZ["PracticeQuiz.tsx"]
QD["quiz-data.ts"]
end
subgraph "Evaluation & Types"
EVAL["evaluation.ts"]
TYPES["index.ts"]
end
subgraph "AI Services"
GS["geminiService.ts"]
AA["aiActions.ts"]
end
subgraph "Server Utilities"
LIBDATA["data.ts"]
end
M --> IQ
P --> IQ
E --> IQ
EN --> IQ
H --> IQ
A --> IQ
QD --> IQ
EVAL --> IQ
TYPES --> IQ
GS --> MQ
GS --> PQ
GS --> IQ
AA --> GS
LIBDATA --> IQ
```

**Diagram sources**
- [mathematics_model.md](file://src/data_modeling/mathematics_model.md#L1-L212)
- [physics_model.md](file://src/data_modeling/physics_model.md#L1-L376)
- [economics_model.md](file://src/data_modeling/economics_model.md#L1-L294)
- [english_model.md](file://src/data_modeling/english_model.md#L1-L474)
- [history_model.md](file://src/data_modeling/history_model.md#L1-L686)
- [accounting_model.md](file://src/data_modeling/accounting_model.md#L1-L246)
- [InteractiveQuiz.tsx](file://src/screens/InteractiveQuiz.tsx#L1-L458)
- [MathematicsQuiz.tsx](file://src/screens/MathematicsQuiz.tsx#L1-L283)
- [PhysicsQuiz.tsx](file://src/screens/PhysicsQuiz.tsx#L1-L446)
- [PracticeQuiz.tsx](file://src/screens/PracticeQuiz.tsx#L1-L378)
- [quiz-data.ts](file://src/constants/quiz-data.ts#L1-L313)
- [evaluation.ts](file://src/types/evaluation.ts#L1-L421)
- [index.ts](file://src/types/index.ts#L1-L60)
- [geminiService.ts](file://src/services/geminiService.ts#L1-L14)
- [aiActions.ts](file://src/services/aiActions.ts#L1-L168)
- [data.ts](file://src/lib/data.ts#L1-L504)

**Section sources**
- [mathematics_model.md](file://src/data_modeling/mathematics_model.md#L1-L212)
- [physics_model.md](file://src/data_modeling/physics_model.md#L1-L376)
- [economics_model.md](file://src/data_modeling/economics_model.md#L1-L294)
- [english_model.md](file://src/data_modeling/english_model.md#L1-L474)
- [history_model.md](file://src/data_modeling/history_model.md#L1-L686)
- [accounting_model.md](file://src/data_modeling/accounting_model.md#L1-L246)
- [InteractiveQuiz.tsx](file://src/screens/InteractiveQuiz.tsx#L1-L458)
- [MathematicsQuiz.tsx](file://src/screens/MathematicsQuiz.tsx#L1-L283)
- [PhysicsQuiz.tsx](file://src/screens/PhysicsQuiz.tsx#L1-L446)
- [PracticeQuiz.tsx](file://src/screens/PracticeQuiz.tsx#L1-L378)
- [quiz-data.ts](file://src/constants/quiz-data.ts#L1-L313)
- [evaluation.ts](file://src/types/evaluation.ts#L1-L421)
- [index.ts](file://src/types/index.ts#L1-L60)
- [geminiService.ts](file://src/services/geminiService.ts#L1-L14)
- [aiActions.ts](file://src/services/aiActions.ts#L1-L168)
- [data.ts](file://src/lib/data.ts#L1-L504)

## Core Components
- Subject-specific data models define question structures, metadata, and content organization for Mathematics, Physics, Economics, English, History, and Accounting.
- Quiz system components consume these models to render questions, manage user interactions, and provide AI-powered explanations.
- Evaluation utilities support scoring and feedback for various question types.
- Server utilities provide dashboard stats, progress tracking, and recommended content.

**Section sources**
- [mathematics_model.md](file://src/data_modeling/mathematics_model.md#L1-L212)
- [physics_model.md](file://src/data_modeling/physics_model.md#L1-L376)
- [economics_model.md](file://src/data_modeling/economics_model.md#L1-L294)
- [english_model.md](file://src/data_modeling/english_model.md#L1-L474)
- [history_model.md](file://src/data_modeling/history_model.md#L1-L686)
- [accounting_model.md](file://src/data_modeling/accounting_model.md#L1-L246)
- [InteractiveQuiz.tsx](file://src/screens/InteractiveQuiz.tsx#L1-L458)
- [MathematicsQuiz.tsx](file://src/screens/MathematicsQuiz.tsx#L1-L283)
- [PhysicsQuiz.tsx](file://src/screens/PhysicsQuiz.tsx#L1-L446)
- [PracticeQuiz.tsx](file://src/screens/PracticeQuiz.tsx#L1-L378)
- [evaluation.ts](file://src/types/evaluation.ts#L1-L421)
- [data.ts](file://src/lib/data.ts#L1-L504)

## Architecture Overview
The system integrates subject data models with UI screens and AI services to deliver an adaptive, curriculum-aligned learning experience. The quiz system supports multiple question types, difficulty levels, and topic coverage, while evaluation utilities provide scoring and feedback. Server utilities enable progress tracking and recommendation engines.

```mermaid
sequenceDiagram
participant User as "User"
participant UI as "InteractiveQuiz.tsx"
participant Eval as "evaluation.ts"
participant AI as "geminiService.ts"
participant AIAction as "aiActions.ts"
User->>UI : Select subject and start quiz
UI->>UI : Render question and options
User->>UI : Submit answer
UI->>Eval : Evaluate answer (scoring)
Eval-->>UI : Score and feedback
User->>UI : Request explanation
UI->>AI : getExplanation(subject, topic)
AI->>AIAction : getExplanationAction(subject, topic)
AIAction-->>AI : Generated explanation
AI-->>UI : Explanation text
UI-->>User : Display explanation
```

**Diagram sources**
- [InteractiveQuiz.tsx](file://src/screens/InteractiveQuiz.tsx#L105-L194)
- [evaluation.ts](file://src/types/evaluation.ts#L201-L248)
- [geminiService.ts](file://src/services/geminiService.ts#L1-L14)
- [aiActions.ts](file://src/services/aiActions.ts#L42-L78)

**Section sources**
- [InteractiveQuiz.tsx](file://src/screens/InteractiveQuiz.tsx#L1-L458)
- [evaluation.ts](file://src/types/evaluation.ts#L1-L421)
- [geminiService.ts](file://src/services/geminiService.ts#L1-L14)
- [aiActions.ts](file://src/services/aiActions.ts#L1-L168)

## Detailed Component Analysis

### Mathematics Data Model
- Core metadata includes exam paper identifiers, year, session, total marks, time allocation, and subject.
- Question structure supports nested parts and subparts with marks and metadata for diagram requirements and rounding.
- Proposed database schema normalizes questions with hierarchical IDs, depth, and order indexing for efficient querying.
- Implementation guide covers cleaning math symbols, LaTeX rendering, and multi-paper curriculum support.

```mermaid
erDiagram
EXAM_PAPERS {
text id PK
jsonb metadata
text information_sheet
timestamptz created_at
}
QUESTION_ITEMS {
uuid id PK
text paper_id FK
text hierarchical_id
text parent_hierarchical_id
text text
smallint marks
smallint depth
smallint order_index
boolean is_leaf
jsonb metadata
}
EXAM_PAPERS ||--o{ QUESTION_ITEMS : "contains"
```

**Diagram sources**
- [mathematics_model.md](file://src/data_modeling/mathematics_model.md#L119-L147)

**Section sources**
- [mathematics_model.md](file://src/data_modeling/mathematics_model.md#L1-L212)

### Physics Data Model
- Supports multiple-choice and structured questions with scenario text, diagram references, and structured data sheets.
- MCQ options include letter codes and correctness flags; data sheets store constants and formulas in JSONB for flexible querying.
- Implementation notes address diagram handling, text normalization, and web app integration tips.

```mermaid
erDiagram
EXAM_PAPERS {
int id PK
text title
varchar subject
varchar session
int year
int total_marks
numeric duration_hours
timestamptz created_at
}
QUESTIONS {
int id PK
int exam_paper_id FK
int question_number
varchar question_type
int total_marks
text scenario_text
}
SUB_QUESTIONS {
int id PK
int question_id FK
varchar sub_question_number
text text
numeric marks
boolean has_diagram
text diagram_reference
}
MCQ_OPTIONS {
int id PK
int sub_question_id FK
char option_letter
text option_text
boolean is_correct
}
DATA_SHEETS {
int id PK
int exam_paper_id FK
varchar sheet_type
varchar section_title
jsonb content
}
EXAM_PAPERS ||--o{ QUESTIONS : "contains"
QUESTIONS ||--o{ SUB_QUESTIONS : "contains"
SUB_QUESTIONS ||--o{ MCQ_OPTIONS : "has"
EXAM_PAPERS ||--o{ DATA_SHEETS : "contains"
```

**Diagram sources**
- [physics_model.md](file://src/data_modeling/physics_model.md#L14-L79)

**Section sources**
- [physics_model.md](file://src/data_modeling/physics_model.md#L1-L376)

### Economics Data Model
- Modular structure supports dynamic rendering of question types (MCQ, matching, short-answer, data-response, essay, calculation).
- Stimulus-aware design handles graphs, tables, and cartoons referenced in questions.
- Prisma schema defines exam papers, sections, questions, and stimulus assets with JSON storage for options and matching exercises.

```mermaid
erDiagram
EXAM_PAPER {
string id PK
string subject
string paperCode
string session
int marksTotal
string timeTotal
string grade
string copyright
string sourcePdf
timestamptz createdAt
}
SECTION {
string id PK
string examPaperId FK
string sectionId
string type
string title
string instructions
int requiredCount
int sortOrder
}
QUESTION {
string id PK
string sectionId FK
string questionNumber
string type
int marks
text prompt
string stimulusId
json optionsJson
json columnAJson
json columnBJson
boolean requiresCalc
int sortOrder
}
STIMULUS_ASSET {
string id PK
string type
text description
string source
string assetPath
string examPaperId FK
}
EXAM_PAPER ||--o{ SECTION : "contains"
SECTION ||--o{ QUESTION : "contains"
QUESTION ||--o{ STIMULUS_ASSET : "references"
```

**Diagram sources**
- [economics_model.md](file://src/data_modeling/economics_model.md#L84-L143)

**Section sources**
- [economics_model.md](file://src/data_modeling/economics_model.md#L1-L294)

### English Data Model
- Database schema optimized for language assessment with sections (A: Comprehension, B: Summary, C: Language), source texts, questions, and sub-questions.
- Multimodal support for posters, cartoons, advertisements, and summary passages; constraints for task-specific requirements.
- Web integration guide includes visual asset resolution, summary validation, and cartoon analysis components.

```mermaid
erDiagram
EXAM_PAPERS {
int id PK
varchar subject
varchar session
int year
int total_marks
int duration_minutes
int page_count
text instructions
}
SECTIONS {
int id PK
int exam_paper_id FK
char section_letter
varchar title
int allocated_marks
int suggested_time_minutes
text section_instructions
}
SOURCE_TEXTS {
int id PK
int section_id FK
varchar text_identifier
text title
text content
varchar text_type
varchar source_attribution
boolean has_visual_element
varchar visual_reference_key
int word_count
}
QUESTIONS {
int id PK
int section_id FK
int question_number
text question_stem
int total_marks
varchar[] referenced_texts
varchar task_type
text[] constraints
}
SUB_QUESTIONS {
int id PK
int question_id FK
varchar sub_question_number
text prompt
numeric marks
varchar question_format
boolean requires_visual_context
varchar visual_context_hint
jsonb mcq_options
text answer_guidance
}
EXAM_PAPERS ||--o{ SECTIONS : "contains"
SECTIONS ||--o{ SOURCE_TEXTS : "contains"
SECTIONS ||--o{ QUESTIONS : "contains"
QUESTIONS ||--o{ SUB_QUESTIONS : "contains"
```

**Diagram sources**
- [english_model.md](file://src/data_modeling/english_model.md#L7-L85)

**Section sources**
- [english_model.md](file://src/data_modeling/english_model.md#L1-L474)

### History Data Model
- TypeScript interfaces and Prisma schema model source-based and essay sections with questions, sub-questions, and source materials.
- Instructions are stored separately for curriculum-aligned guidance.
- Next.js API and React components demonstrate fetching and rendering structured history exam data.

```mermaid
erDiagram
EXAM_PAPER {
string id PK
string title
string subject
string paper
int year
string session
int totalMarks
string totalTime
timestamptz createdAt
timestamptz updatedAt
}
SECTION {
string id PK
string examPaperId FK
string sectionId
string title
string description
string type
int minQuestions
int maxQuestions
timestamptz createdAt
timestamptz updatedAt
}
QUESTION {
string id PK
string sectionId FK
string questionId
string title
string description
int totalMarks
string[] sources
int order
timestamptz createdAt
timestamptz updatedAt
}
SUB_QUESTION {
string id PK
string questionId FK
string subQuestionId
string questionText
int marks
string type
int order
timestamptz createdAt
timestamptz updatedAt
}
INSTRUCTION {
string id PK
string examPaperId FK
string text
int order
timestamptz createdAt
timestamptz updatedAt
}
SOURCE_MATERIAL {
string id PK
string sourceId
string questionId FK
string title
string content
string type
timestamptz createdAt
timestamptz updatedAt
}
EXAM_PAPER ||--o{ SECTION : "contains"
SECTION ||--o{ QUESTION : "contains"
QUESTION ||--o{ SUB_QUESTION : "contains"
EXAM_PAPER ||--o{ INSTRUCTION : "contains"
QUESTION ||--o{ SOURCE_MATERIAL : "references"
```

**Diagram sources**
- [history_model.md](file://src/data_modeling/history_model.md#L467-L564)

**Section sources**
- [history_model.md](file://src/data_modeling/history_model.md#L1-L686)

### Accounting Data Model
- Production-ready solution packages TypeScript interfaces, sample datasets, and PostgreSQL schema for storing exam papers, student attempts, and formula references.
- Emphasizes pre-processing of PDF content, validation of financial calculations, and accessibility considerations.

```mermaid
erDiagram
EXAM_PAPERS {
text id PK
jsonb metadata
timestamptz created_at
}
STUDENT_ATTEMPTS {
uuid id PK
text paper_id FK
uuid student_id
text question_id
jsonb student_answer
int marks_awarded
text feedback
timestamptz submitted_at
}
FORMULA_REFERENCES {
int id PK
varchar category
varchar name
text formula
varchar curriculum_version
}
EXAM_PAPERS ||--o{ STUDENT_ATTEMPTS : "attempted"
```

**Diagram sources**
- [accounting_model.md](file://src/data_modeling/accounting_model.md#L142-L170)

**Section sources**
- [accounting_model.md](file://src/data_modeling/accounting_model.md#L1-L246)

### Quiz System Integration
- InteractiveQuiz consumes a centralized quiz dataset and renders questions with subject-specific theming, progress tracking, hints, and AI explanations.
- MathematicsQuiz and PhysicsQuiz demonstrate subject-specific UI flows, including drag-and-drop solution steps and multiple-choice interactions.
- PracticeQuiz provides a specialized math input experience with symbol keyboards and visual graph areas.

```mermaid
sequenceDiagram
participant User as "User"
participant IQ as "InteractiveQuiz.tsx"
participant QD as "quiz-data.ts"
participant GS as "geminiService.ts"
participant AA as "aiActions.ts"
User->>IQ : Open quiz with paperId
IQ->>QD : Load quiz data by paperId
QD-->>IQ : Questions and options
IQ->>IQ : Render question and options
User->>IQ : Submit answer
IQ->>GS : getExplanation(subject, question)
GS->>AA : getExplanationAction(subject, topic)
AA-->>GS : Explanation text
GS-->>IQ : Explanation text
IQ-->>User : Show result and explanation
```

**Diagram sources**
- [InteractiveQuiz.tsx](file://src/screens/InteractiveQuiz.tsx#L105-L194)
- [quiz-data.ts](file://src/constants/quiz-data.ts#L15-L313)
- [geminiService.ts](file://src/services/geminiService.ts#L1-L14)
- [aiActions.ts](file://src/services/aiActions.ts#L42-L78)

**Section sources**
- [InteractiveQuiz.tsx](file://src/screens/InteractiveQuiz.tsx#L1-L458)
- [MathematicsQuiz.tsx](file://src/screens/MathematicsQuiz.tsx#L1-L283)
- [PhysicsQuiz.tsx](file://src/screens/PhysicsQuiz.tsx#L1-L446)
- [PracticeQuiz.tsx](file://src/screens/PracticeQuiz.tsx#L1-L378)
- [quiz-data.ts](file://src/constants/quiz-data.ts#L1-L313)
- [geminiService.ts](file://src/services/geminiService.ts#L1-L14)
- [aiActions.ts](file://src/services/aiActions.ts#L1-L168)

### Evaluation Utilities
- Summary evaluation analyzes included points, checks for verbatim quoting, and calculates language marks based on criteria.
- Exact match and keyword-based evaluators support MCQ and keyword-driven questions.
- Multiple-choice evaluator accepts letter or text answers with optional normalization.

```mermaid
flowchart TD
Start(["Evaluate Answer"]) --> Type{"Question Type?"}
Type --> |Summary| SumEval["analyzeSummaryPoints()<br/>calculateLanguageMarks()"]
Type --> |Exact Match| ExactEval["evaluateExactMatch()"]
Type --> |Keyword| KeywordEval["evaluateKeywordBased()"]
Type --> |MCQ| McqEval["evaluateMultipleChoice()"]
SumEval --> SumRes["SummaryEvaluationResult"]
ExactEval --> ExactRes["ExactMatchEvaluationResult"]
KeywordEval --> KeywordRes["KeywordEvaluationResult"]
McqEval --> McqRes["MultipleChoiceResult"]
SumRes --> End(["Feedback"])
ExactRes --> End
KeywordRes --> End
McqRes --> End
```

**Diagram sources**
- [evaluation.ts](file://src/types/evaluation.ts#L34-L248)

**Section sources**
- [evaluation.ts](file://src/types/evaluation.ts#L1-L421)

### Progress Tracking and Study Planning
- Server utilities provide dashboard statistics, user profiles, subject progress, and recommended content.
- Study plan generation uses AI actions to produce daily quest paths aligned with subject topics and weekly hours.
- Achievement system defines unlockable milestones based on activity and performance.

```mermaid
sequenceDiagram
participant User as "User"
participant UI as "UI Screens"
participant LibData as "data.ts"
participant GS as "geminiService.ts"
participant AA as "aiActions.ts"
User->>UI : Request study plan
UI->>GS : generateStudyPlan(subjects, hours)
GS->>AA : generateStudyPlanAction(subjects, hours)
AA-->>GS : Study plan text
GS-->>UI : Study plan text
UI-->>User : Display plan
User->>LibData : Get dashboard stats
LibData-->>User : Stats and recommendations
```

**Diagram sources**
- [data.ts](file://src/lib/data.ts#L272-L281)
- [geminiService.ts](file://src/services/geminiService.ts#L7-L9)
- [aiActions.ts](file://src/services/aiActions.ts#L80-L114)

**Section sources**
- [data.ts](file://src/lib/data.ts#L1-L504)
- [geminiService.ts](file://src/services/geminiService.ts#L1-L14)
- [aiActions.ts](file://src/services/aiActions.ts#L1-L168)

## Dependency Analysis
The following diagram highlights key dependencies between data models, quiz components, evaluation utilities, and AI services.

```mermaid
graph TB
IQ["InteractiveQuiz.tsx"] --> QD["quiz-data.ts"]
IQ --> EVAL["evaluation.ts"]
IQ --> GS["geminiService.ts"]
GS --> AA["aiActions.ts"]
MQ["MathematicsQuiz.tsx"] --> GS
PQ["PhysicsQuiz.tsx"] --> GS
M["Mathematics Model"] --> IQ
P["Physics Model"] --> IQ
E["Economics Model"] --> IQ
EN["English Model"] --> IQ
H["History Model"] --> IQ
A["Accounting Model"] --> IQ
EVAL --> IQ
LIBDATA["data.ts"] --> IQ
```

**Diagram sources**
- [InteractiveQuiz.tsx](file://src/screens/InteractiveQuiz.tsx#L1-L458)
- [quiz-data.ts](file://src/constants/quiz-data.ts#L1-L313)
- [evaluation.ts](file://src/types/evaluation.ts#L1-L421)
- [geminiService.ts](file://src/services/geminiService.ts#L1-L14)
- [aiActions.ts](file://src/services/aiActions.ts#L1-L168)
- [MathematicsQuiz.tsx](file://src/screens/MathematicsQuiz.tsx#L1-L283)
- [PhysicsQuiz.tsx](file://src/screens/PhysicsQuiz.tsx#L1-L446)
- [data.ts](file://src/lib/data.ts#L1-L504)

**Section sources**
- [InteractiveQuiz.tsx](file://src/screens/InteractiveQuiz.tsx#L1-L458)
- [quiz-data.ts](file://src/constants/quiz-data.ts#L1-L313)
- [evaluation.ts](file://src/types/evaluation.ts#L1-L421)
- [geminiService.ts](file://src/services/geminiService.ts#L1-L14)
- [aiActions.ts](file://src/services/aiActions.ts#L1-L168)
- [MathematicsQuiz.tsx](file://src/screens/MathematicsQuiz.tsx#L1-L283)
- [PhysicsQuiz.tsx](file://src/screens/PhysicsQuiz.tsx#L1-L446)
- [data.ts](file://src/lib/data.ts#L1-L504)

## Performance Considerations
- Normalize hierarchical question structures to support efficient filtering and sorting by depth and order index.
- Use JSONB fields for flexible content storage while indexing frequently queried fields.
- Cache server-side data retrieval to minimize database load and improve response times.
- Optimize UI rendering by virtualizing long lists and deferring heavy computations to background threads.
- Implement lazy loading for assets (images, diagrams) and use responsive image formats.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
- AI features disabled: Verify API key configuration; the AI action functions log warnings when the key is missing.
- Quiz data not loading: Ensure paperId parameters match entries in the quiz dataset; confirm subject filtering logic.
- Evaluation mismatches: Validate question types and scoring criteria; use evaluation utilities to debug scoring logic.
- Database queries failing: Confirm schema definitions and foreign key relationships; check isActive flags and soft-deleted records.

**Section sources**
- [aiActions.ts](file://src/services/aiActions.ts#L22-L32)
- [InteractiveQuiz.tsx](file://src/screens/InteractiveQuiz.tsx#L124-L129)
- [evaluation.ts](file://src/types/evaluation.ts#L201-L248)
- [data.ts](file://src/lib/data.ts#L130-L156)

## Conclusion
MatricMaster AI’s data modeling aligns closely with South African curriculum standards across six core subjects. The modular, normalized data models support diverse question types, multimodal content, and curriculum-specific constraints. The quiz system integrates seamlessly with evaluation utilities and AI services to provide adaptive assessments, personalized explanations, and study planning. Server utilities enable robust progress tracking and recommendations, laying a solid foundation for scalable content management and continuous improvement.

[No sources needed since this section summarizes without analyzing specific files]

## Appendices

### Content Creation Workflows
- Mathematics: Clean math symbols, convert to LaTeX, store normalized JSON, and render with KaTeX.
- Physics: Normalize MCQ options, flag diagram dependencies, and store structured data sheets.
- Economics: Extract stimulus assets, map to questions, and store JSON for options/matching.
- English: Manage multimodal assets (posters, cartoons), validate summary constraints, and scaffold writing tasks.
- History: Structure source-based and essay sections, link sources to questions, and maintain instructions.
- Accounting: Pre-process PDFs, verify financial calculations, and store formula references.

**Section sources**
- [mathematics_model.md](file://src/data_modeling/mathematics_model.md#L153-L196)
- [physics_model.md](file://src/data_modeling/physics_model.md#L309-L374)
- [economics_model.md](file://src/data_modeling/economics_model.md#L238-L287)
- [english_model.md](file://src/data_modeling/english_model.md#L367-L472)
- [history_model.md](file://src/data_modeling/history_model.md#L566-L613)
- [accounting_model.md](file://src/data_modeling/accounting_model.md#L172-L244)

### Data Import Procedures
- Use centralized quiz dataset for quick-start quizzes; extend with subject-specific datasets.
- For past papers, implement database seeding scripts to populate normalized schemas.
- Validate curriculum alignment by cross-checking topics and difficulty levels against NSC guidelines.

**Section sources**
- [quiz-data.ts](file://src/constants/quiz-data.ts#L15-L313)
- [mock-data.ts](file://src/constants/mock-data.ts#L48-L240)

### Curriculum Alignment Validation
- Cross-reference question topics with NSC curriculum descriptors.
- Validate difficulty levels and time allocations against official exam specifications.
- Maintain separate metadata for curriculum versions and language variants.

**Section sources**
- [mathematics_model.md](file://src/data_modeling/mathematics_model.md#L193-L194)
- [physics_model.md](file://src/data_modeling/physics_model.md#L19-L26)
- [economics_model.md](file://src/data_modeling/economics_model.md#L92-L99)
- [english_model.md](file://src/data_modeling/english_model.md#L11-L20)
- [history_model.md](file://src/data_modeling/history_model.md#L34-L45)
- [accounting_model.md](file://src/data_modeling/accounting_model.md#L95-L101)

### Maintenance and Updates
- Regularly update datasets and schemas to reflect curriculum changes.
- Monitor AI service availability and gracefully degrade features when API keys are missing.
- Implement logging and error boundaries around AI interactions and data fetches.

**Section sources**
- [aiActions.ts](file://src/services/aiActions.ts#L22-L32)
- [data.ts](file://src/lib/data.ts#L1-L504)

### Adaptive Assessment and Randomization
- Randomize question order within quizzes while maintaining topic balance.
- Use evaluation utilities to adapt difficulty based on performance trends.
- Provide hints and AI explanations to support adaptive learning.

**Section sources**
- [InteractiveQuiz.tsx](file://src/screens/InteractiveQuiz.tsx#L172-L192)
- [evaluation.ts](file://src/types/evaluation.ts#L201-L248)
- [geminiService.ts](file://src/services/geminiService.ts#L1-L14)