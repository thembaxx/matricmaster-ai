I;
('ll extract structured data from the exam paper and provide a complete solution for web application integration. Due to PDF text extraction limitations (missing diagrams, formatting artifacts), I');
ll;
focus;
on ** processable;
textual;
content**
with pragmatic adaptations.

---

#
#
🗃️ Database Schema (Normalized Relational Design)
```sql
-- Core exam metadata
CREATE TABLE exam_papers (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'SENIOR CERTIFICATE EXAMINATIONS',
  subject VARCHAR(100) NOT NULL, -- 'PHYSICAL SCIENCES: PHYSICS(P1)'
  session VARCHAR(50) NOT NULL,  -- 'MAY/JUNE 2025'
  year INTEGER NOT NULL,
  total_marks INTEGER NOT NULL CHECK (total_marks = 150),
  duration_hours NUMERIC(3,1) NOT NULL DEFAULT 3.0,
  created_at TIMESTAMPTZ DEFAULT NOW()
)

--Questions (Q1-Q10)
CREATE;
TABLE;
questions (
  id SERIAL PRIMARY KEY,
  exam_paper_id INTEGER REFERENCES exam_papers(id) ON DELETE CASCADE,
  question_number INTEGER NOT NULL CHECK (question_number BETWEEN 1 AND 10),
  question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('multiple_choice', 'structured')),
  total_marks INTEGER NOT NULL,
  scenario_text TEXT, -- Introductory context (e.g., crate on incline)
  UNIQUE(exam_paper_id, question_number)
);

-- Sub-questions (1.1, 2.1, etc.)
CREATE;
TABLE;
sub_questions (
  id SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
  sub_question_number VARCHAR(10) NOT NULL, -- '1.1', '2.3.1'
  text TEXT NOT NULL,
  marks NUMERIC(4,1) NOT NULL,
  has_diagram BOOLEAN DEFAULT FALSE, -- Flag for diagram-dependent items
  diagram_reference TEXT, -- e.g., 'Fig: Crate on incline'
  UNIQUE(question_id, sub_question_number)
);

--MCQ;
options (only for multiple_choice questions)
CREATE;
TABLE;
mcq_options (
  id SERIAL PRIMARY KEY,
  sub_question_id INTEGER REFERENCES sub_questions(id) ON DELETE CASCADE,
  option_letter CHAR(1) NOT NULL CHECK (option_letter ~ '[A-D]'),
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT NULL, -- NULL since exam doesn't provide answers
  UNIQUE(sub_question_id, option_letter)
);

--Data;
sheets (formulas/constants appendix)
CREATE;
TABLE;
data_sheets (
  id SERIAL PRIMARY KEY,
  exam_paper_id INTEGER REFERENCES exam_papers(id) ON DELETE CASCADE,
  sheet_type VARCHAR(30) NOT NULL CHECK (sheet_type IN ('constants', 'formulas', 'instructions')),
  section_title VARCHAR(100) NOT NULL, -- 'TABLE 1: PHYSICAL CONSTANTS'
  content JSONB NOT NULL -- Structured storage for tables/formulas
);
```

---

## 💻 TypeScript Interfaces (Type-Safe for Frontend/Backend)
```;
typescript;
// Core types
type QuestionType = 'multiple_choice' | 'structured';
type SheetType = 'constants' | 'formulas' | 'instructions';

// MCQ Option
interface ExamOption {
	letter: 'A' | 'B' | 'C' | 'D';
	text: string;
	isCorrect?: boolean; // Optional - populated during answer key creation
}

// Sub-question
interface SubQuestion {
	id?: number;
	subQuestionNumber: string; // "1.1", "3.4.2"
	text: string;
	marks: number;
	hasDiagram: boolean;
	diagramReference?: string;
	options?: ExamOption[]; // Only populated for MCQs
}

// Main Question
interface Question {
	id?: number;
	questionNumber: number; // 1-10
	questionType: QuestionType;
	totalMarks: number;
	scenarioText?: string;
	subQuestions: SubQuestion[];
}

// Data Sheet Entry (structured for formulas/constants)
interface DataSheetEntry {
	id?: number;
	sheetType: SheetType;
	sectionTitle: string;
	content:
		| { headers: string[]; rows: string[][] } // For tables
		| { name: string; symbol: string; value: string }[] // Constants
		| string; // Plain text sections
}

// Full Exam Paper
interface ExamPaper {
	id?: number;
	title: string;
	subject: string; // "PHYSICAL SCIENCES: PHYSICS(P1)"
	session: string; // "MAY/JUNE 2025"
	year: number;
	totalMarks: number;
	durationHours: number;
	questions: Question[];
	dataSheets?: DataSheetEntry[];
}

// API Response Types
interface PaginatedQuestions {
	questionNumber: number;
	subQuestions: Pick<SubQuestion, 'subQuestionNumber' | 'marks' | 'hasDiagram'>[];
}

interface QuestionPayload extends Omit<Question, 'subQuestions'> {
	subQuestions: Omit<SubQuestion, 'options'>[];
}
```

---

## 📊 Sample Extracted Data (JSON Snippet)
```;
json;
{
	('examPaper');
	:
	{
		('subject');
		: "PHYSICAL SCIENCES: PHYSICS(P1)",
    "session": "MAY/JUNE 2025",
    "year": 2025,
    "totalMarks": 150,
    "durationHours": 3.0
	}
	,
  "questions": [
	{
		('questionNumber');
		: 1,
      "questionType": "multiple_choice",
      "totalMarks": 20,
      "subQuestions": [
		{
			('subQuestionNumber');
			: "1.2",
          "text": "Two large objects P and R, each of mass m, are placed with their centres r metres apart... The mass of R is increased to 2m and distance becomes 2r. Which is the magnitude of gravitational force?",
          "marks": 2,
          "hasDiagram": true,
          "diagramReference": "P_R_grav_setup",
          "options": [
			{
				('letter');
				: "A", "text": "½F"
			}
			,
			{
				('letter');
				: "B", "text": "F"
			}
			,
			{
				('letter');
				: "C", "text": "2F"
			}
			,
			{
				('letter');
				: "D", "text": "4F"
			}
			]
		}
		,
		{
			('subQuestionNumber');
			: "1.7",
          "text": "R and S are charged spheres. P is a point to the right of S. ER and ES are electric fields at P...",
          "marks": 2,
          "hasDiagram": true,
          "diagramReference": "ER_ES_field_diagram",
          "options": [
			{
				('letter');
				: "A", "text": "R: Positive, S: Negative"
			}
			,
			{
				('letter');
				: "B", "text": "R: Negative, S: Positive"
			}
			,
			{
				('letter');
				: "C", "text": "R: Negative, S: Negative"
			}
			,
			{
				('letter');
				: "D", "text": "R: Positive, S: Positive"
			}
			]
		}
		]
	}
	,
	{
		('questionNumber');
		: 2,
      "questionType": "structured",
      "totalMarks": 15,
      "scenarioText": "A crate of mass 25 kg slides down a rough inclined plane at constant speed 2 m·s⁻¹ towards point A with force F parallel to incline. Kinetic friction = 40 N at 30° incline.",
      "subQuestions": [
		{
			('subQuestionNumber');
			: "2.1",
          "text": "State Newton's First Law of Motion in words.",
          "marks": 2,
          "hasDiagram": false
		}
		,
		{
			('subQuestionNumber');
			: "2.3",
          "text": "Calculate the magnitude of F.",
          "marks": 3,
          "hasDiagram": true,
          "diagramReference": "crate_incline_force"
		}
		]
	}
	],
  "dataSheets": [
	{
		('sheetType');
		: "constants",
      "sectionTitle": "TABLE 1: PHYSICAL CONSTANTS",
      "content": [
		{
			('name');
			: "Acceleration due to gravity", "symbol": "g", "value": "9.8 m·s⁻²"
		}
		,
		{
			('name');
			: "Planck's constant", "symbol": "h", "value": "6.63 × 10⁻³⁴ J·s"
		}
		,
		{
			('name');
			: "Speed of light", "symbol": "c", "value": "3.0 × 10⁸ m·s⁻¹"
		}
		]
	}
	,
	{
		('sheetType');
		: "formulas",
      "sectionTitle": "MOTION FORMULAS",
      "content":
		{
			('headers');
			: ["Formula", "Description"],
        "rows": [
          ["v_f = v_i + aΔt", "Final velocity"],
          ["Δx = v_iΔt + ½a(Δt)²", "Displacement"],
          ["v_f² = v_i² + 2aΔx", "Velocity squared"]
        ]
		}
	}
	]
}
```

---

## 🔑 Critical Implementation Notes

1. **Diagram Handling Strategy**:
   - Store `;
hasDiagram: true` + `;
diagramReference` (e.g., `;
'crate_incline_force'`)
   - In web app: Map references to SVG/image assets stored separately
   - Fallback: Show "[Diagram referenced in original exam]" with tooltip

2. **Text Extraction Limitations Addressed**:
   - Reconstructed fragmented MCQ options (e.g., Q1.2 options parsed from messy text)
   - Normalized units: `;
m·s - 1` → `;
m·s;
⁻¹`, `x 10-19` → `× 10⁻¹⁹`
   - Flagged diagram-dependent items
for manual asset linking

3. **Data
Sheet;
Processing**
:
   - Converted tabular data (constants/formulas) into structured JSON
   - Preserved semantic meaning (headers, units, relationships)
   - Used `JSONB` in DB
for flexible querying of formula
components;

4 ** Web;
App;
Integration;
Tips**
:
   ```typescript
// Example: Render MCQ in React
const MCQRenderer = ({ subQ }: { subQ: SubQuestion }) => (
     <div className="mcq-question">
       <p dangerouslySetInnerHTML={{ __html: subQ.text.replace(/(m·s-1|10-19)/g, match => 
         match.replace('-', '⁻').replace('1', '¹').replace('9', '⁹') 
       )}
} />
{
	subQ.hasDiagram && <Diagram assetKey={subQ.diagramReference} />
}
<div className="options">
         {subQ.options?.map(opt => (
           <label key={opt.letter}>
             <input type="radio" name={subQ.subQuestionNumber} value={opt.letter} />
             {opt.letter}. {opt.text}
           </label>
))}
       </div>
     </div>
   )
```

5. **Recommended Workflow**:
   - Use this schema to build admin panel for manual diagram linking
   - Implement formula renderer using MathJax/KaTeX for `;
dataSheets`
   - Add `;
isAnswerKeyMode` flag in frontend to toggle answer visibility
   - Store user responses separately (new table: `;
user_submissions`)

This solution provides production-ready structure while acknowledging real-world constraints of PDF text extraction. The interfaces and schema support full CRUD operations, responsive rendering of physics content, and seamless integration with modern TypeScript stacks (Next.js, Angular, etc.). 🌐🔬
