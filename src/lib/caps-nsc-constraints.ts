export const CAPS_NSC_CONSTRAINTS = {
	subjects: [
		'Mathematics',
		'Physical Sciences',
		'Life Sciences',
		'Geography',
		'History',
		'Economics',
		'Business Studies',
		'Accounting',
		'English Home Language',
		'English First Additional Language',
		'Afrikaans Home Language',
		'Afrikaans First Additional Language',
		'Information Technology',
		'Computer Applications Technology',
	],
	gradingLevels: [
		'Level 1 (0-29%)',
		'Level 2 (30-39%)',
		'Level 3 (40-49%)',
		'Level 4 (50-59%)',
		'Level 5 (60-69%)',
		'Level 7 (90-100%)',
	],
	examinationBoards: [
		'DBE (Department of Basic Education)',
		'IEB (Independent Examinations Board)',
	],
	curriculum: 'CAPS (Curriculum and Assessment Policy Statement)',
	certification: 'NSC (National Senior Certificate)',
	country: 'South Africa',
	grade: 12,
};

export const NSC_TERMINOLOGY = {
	answerKey: 'memorandum',
	exam: 'paper',
	grade: 'level',
	passMark: '40%',
	subject: 'learning area',
	topic: 'theme',
	question: 'item',
};

export const SUBJECT_SPECIFIC_GUIDELINES: Record<string, string> = {
	Mathematics: `Follow CAPS Mathematics guidelines for Grade 12.
- Use approved CASIO fx-CP400 or SHARP EL-W535HT calculators
- Show all working steps
- Round to 2 decimal places unless specified
- Use the approved formula sheet
- NS Common angles: 0°, 30°, 45°, 60°, 90° and their related angles`,

	'Physical Sciences': `Follow CAPS Physical Sciences guidelines for Grade 12.
- Use SI units consistently
- Show all formulas and substitutions
- Use g = 9.8 m/s² unless specified
- Include units in final answers
- Use the approved data sheet and formula sheet`,

	'Life Sciences': `Follow CAPS Life Sciences guidelines for Grade 12.
- Use proper biological terminology
- Diagrams must be labeled correctly
- Refer to specific examples from the CAPS content
- Essays should follow the mark allocation`,

	Geography: `Follow CAPS Geography guidelines for Grade 12.
- Use grid references and magnetic bearing
- Include scale in calculations
- Cartographic conventions must be followed
- Use correct map symbols`,

	History: `Follow CAPS History guidelines for Grade 12.
- Essays must have introduction, body, conclusion
- Use PAR (Point, Evidence, Reference) method
- Mark allocation guides length of answers
- Primary and secondary sources must be cited`,

	Economics: `Follow CAPS Economics guidelines for Grade 12.
- Diagrams must be drawn correctly with labels
- Use economic terminology
- Show calculations with formulas
- Graphs should show equilibrium points`,

	Accounting: `Follow CAPS Accounting guidelines for Grade 12.
- Use the accounting equation
- Show workings for adjustments
- VAT calculations at 15%
- Format financial statements according to GAAP`,
};

export function buildCAPSSystemPrompt(subject?: string): string {
	const basePrompt = `You are an expert Grade 12 tutor for the South African NSC (National Senior Certificate) examination.

## Context
- Curriculum: ${CAPS_NSC_CONSTRAINTS.curriculum}
- Certification: ${CAPS_NSC_CONSTRAINTS.certification}
- Grade: ${CAPS_NSC_CONSTRAINTS.grade}
- Country: ${CAPS_NSC_CONSTRAINTS.country}

## Important Guidelines
1. Always follow CAPS curriculum guidelines for Grade 12
2. Use South African NSC examination conventions
3. Use the term "memorandum" instead of "answer key"
4. Ensure content aligns with DBE/IEB standards
5. Use metric units (SI) for science subjects
6. Reference specific CAPS topics and content areas

## Terminology
- Answer key = Memorandum
- Exam = Paper
- Pass mark = 40%
- Question = Item`;

	if (subject && SUBJECT_SPECIFIC_GUIDELINES[subject]) {
		return `${basePrompt}

## Subject-Specific Guidelines for ${subject}
${SUBJECT_SPECIFIC_GUIDELINES[subject]}`;
	}

	return basePrompt;
}

export const EXAM_TIPS = {
	'Time Management': 'Spend 1 minute per mark. A 10-mark question gets 10 minutes.',
	'Answer Presentation': 'Answer in the order of the question paper. Show all workings.',
	'Multiple Choice': 'Eliminate obviously wrong answers first. Guess if unsure - no penalty.',
	'Essay Writing': 'Spend 5 minutes planning. Introduction + Body + Conclusion structure.',
	'Diagram Labeling': 'Label clearly. Use straight lines. Include units.',
};
