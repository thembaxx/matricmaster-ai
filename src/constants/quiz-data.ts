export interface QuizOption {
	id: string;
	text: string;
}

export interface QuizQuestion {
	id: string | number;
	question: string;
	options: QuizOption[];
	correctAnswer: string;
	hint: string;
	topic: string;
}

export interface QuizData {
	[paperId: string]: {
		title: string;
		subject: string;
		questions: QuizQuestion[];
	};
}

export const QUIZ_DATA: QuizData = {
	'phys-p1-2025-may': {
		title: 'NSC Physical Sciences P1 May/June 2025',
		subject: 'Physical Sciences',
		questions: [
			{
				id: 1.1,
				question:
					'Three forces act on an object so that the resultant force is zero. Which ONE of the following vector diagrams is the CORRECT representation of the three forces?',
				options: [
					{ id: 'A', text: 'Forces forming a closed triangle (tip-to-tail)' },
					{ id: 'B', text: 'Forces pointing in the same direction' },
					{ id: 'C', text: 'Two forces in one direction, one in the opposite' },
					{ id: 'D', text: 'Forces that do not meet at the ends' },
				],
				correctAnswer: 'A',
				hint: 'For the resultant force to be zero, the vector sum must be zero. This is represented by vectors forming a closed triangle in a tip-to-tail arrangement.',
				topic: "Newton's Laws",
			},
		],
	},
	'life-p1-2025-may': {
		title: 'NSC Life Sciences P1 May/June 2025',
		subject: 'Life Sciences',
		questions: [
			{
				id: '1.1.1',
				question:
					'The part in the amniotic egg that provides nutrients to the developing embryo is the:',
				options: [
					{ id: 'A', text: 'Yolk' },
					{ id: 'B', text: 'Chorion' },
					{ id: 'C', text: 'Amnion' },
					{ id: 'D', text: 'Shell' },
				],
				correctAnswer: 'A',
				hint: 'The yolk sac contains nutrients (yolk) that are used by the embryo for growth.',
				topic: 'Reproduction',
			},
			{
				id: '1.1.2',
				question: 'Which gland is responsible for the secretion of prolactin?',
				options: [
					{ id: 'A', text: 'Thyroid gland' },
					{ id: 'B', text: 'Adrenal gland' },
					{ id: 'C', text: 'Ovary' },
					{ id: 'D', text: 'Pituitary gland' },
				],
				correctAnswer: 'D',
				hint: 'The anterior pituitary gland secretes prolactin, which stimulates milk production in the mammary glands.',
				topic: 'Endocrine System',
			},
			{
				id: '1.1.4',
				question: 'The cranial and spinal nerves are part of the ... nervous system.',
				options: [
					{ id: 'A', text: 'central' },
					{ id: 'B', text: 'peripheral' },
					{ id: 'C', text: 'sympathetic' },
					{ id: 'D', text: 'parasympathetic' },
				],
				correctAnswer: 'B',
				hint: 'The Peripheral Nervous System (PNS) consists of all nerves outside the brain and spinal cord, including cranial and spinal nerves.',
				topic: 'Nervous System',
			},
		],
	},
	'life-p2-2025-may': {
		title: 'NSC Life Sciences P2 May/June 2025',
		subject: 'Life Sciences',
		questions: [
			{
				id: '1.1.1',
				question: 'A section of DNA that codes for a specific characteristic is called a:',
				options: [
					{ id: 'A', text: 'Genotype' },
					{ id: 'B', text: 'Phenotype' },
					{ id: 'C', text: 'Gene' },
					{ id: 'D', text: 'Allele' },
				],
				correctAnswer: 'C',
				hint: 'A gene is a hereditary unit consisting of a sequence of DNA that occupies a specific location on a chromosome.',
				topic: 'Genetics',
			},
		],
	},
	'geo-p1-2025-may': {
		title: 'NSC Geography P1 May/June 2025',
		subject: 'Geography',
		questions: [
			{
				id: '1.1.1',
				question:
					'Lines on a sketch map that join places of equal atmospheric pressure are known as:',
				options: [
					{ id: 'A', text: 'isotherms' },
					{ id: 'B', text: 'isohyets' },
					{ id: 'C', text: 'isobars' },
					{ id: 'D', text: 'contours' },
				],
				correctAnswer: 'C',
				hint: 'Isobars are lines on a map connecting points of equal atmospheric pressure.',
				topic: 'Climate and Weather',
			},
			{
				id: '1.1.2',
				question:
					'The season shown in a sketch map where a low pressure is over the interior and high pressure is over the oceans is:',
				options: [
					{ id: 'A', text: 'Summer' },
					{ id: 'B', text: 'Winter' },
					{ id: 'C', text: 'Spring' },
					{ id: 'D', text: 'Autumn' },
				],
				correctAnswer: 'A',
				hint: 'During summer in South Africa, the land heats up more than the ocean, creating low pressure over the interior.',
				topic: 'Climate and Weather',
			},
		],
	},
	'geo-p2-2025-may': {
		title: 'NSC Geography P2 May/June 2025',
		subject: 'Geography',
		questions: [
			{
				id: '1.1.1',
				question:
					'The distance between two points on a 1:50 000 map is 5 cm. What is the actual distance in reality?',
				options: [
					{ id: 'A', text: '2.5 km' },
					{ id: 'B', text: '250 m' },
					{ id: 'C', text: '5 km' },
					{ id: 'D', text: '500 m' },
				],
				correctAnswer: 'A',
				hint: 'Distance = Map distance x Scale. 5 cm x 50,000 = 250,000 cm = 2.5 km.',
				topic: 'Map Skills',
			},
		],
	},
	'math-p1-2025-may': {
		title: 'NSC Mathematics P1 May/June 2025',
		subject: 'Mathematics',
		questions: [
			{
				id: '1.1.1',
				question: 'Solve for x: x² - 5x + 6 = 0',
				options: [
					{ id: 'A', text: 'x = 2 or x = 3' },
					{ id: 'B', text: 'x = -2 or x = -3' },
					{ id: 'C', text: 'x = 1 or x = 6' },
					{ id: 'D', text: 'x = -1 or x = -6' },
				],
				correctAnswer: 'A',
				hint: 'Factorize the quadratic equation: (x - 2)(x - 3) = 0. Therefore x = 2 or x = 3.',
				topic: 'Algebra',
			},
			{
				id: '1.1.2',
				question: 'Solve for x: 3x² + 3x - 6 = 0',
				options: [
					{ id: 'A', text: 'x = 1 or x = -2' },
					{ id: 'B', text: 'x = -1 or x = 2' },
					{ id: 'C', text: 'x = 1 or x = 2' },
					{ id: 'D', text: 'x = -1 or x = -2' },
				],
				correctAnswer: 'A',
				hint: 'Divide by 3: x² + x - 2 = 0. Factorize: (x + 2)(x - 1) = 0. So x = -2 or x = 1.',
				topic: 'Algebra',
			},
		],
	},
	'math-p2-2025-may': {
		title: 'NSC Mathematics P2 May/June 2025',
		subject: 'Mathematics',
		questions: [
			{
				id: '1.1.1',
				question: 'The gradient of a line passing through (2, 3) and (5, 9) is:',
				options: [
					{ id: 'A', text: '2' },
					{ id: 'B', text: '1/2' },
					{ id: 'C', text: '3' },
					{ id: 'D', text: '1/3' },
				],
				correctAnswer: 'A',
				hint: 'm = (y2 - y1) / (x2 - x1) = (9 - 3) / (5 - 2) = 6 / 3 = 2.',
				topic: 'Analytical Geometry',
			},
		],
	},
	'acc-p1-2025-may': {
		title: 'NSC Accounting P1 May/June 2025',
		subject: 'Accounting',
		questions: [
			{
				id: '1.1',
				question:
					'Which of the following is a primary purpose of a Statement of Comprehensive Income?',
				options: [
					{ id: 'A', text: 'To show the financial position of the company' },
					{ id: 'B', text: 'To calculate the net profit or loss for the year' },
					{ id: 'C', text: 'To list all the assets and liabilities' },
					{ id: 'D', text: 'To show the cash inflows and outflows' },
				],
				correctAnswer: 'B',
				hint: 'The Statement of Comprehensive Income (Income Statement) summarizes revenues and expenses to determine profit or loss.',
				topic: 'Financial Statements',
			},
		],
	},
	'acc-p2-2025-may': {
		title: 'NSC Accounting P2 May/June 2025',
		subject: 'Accounting',
		questions: [
			{
				id: '1.1',
				question: 'What is the main purpose of internal control in a business?',
				options: [
					{ id: 'A', text: 'To increase sales' },
					{ id: 'B', text: 'To safeguard assets and ensure accurate records' },
					{ id: 'C', text: 'To pay less tax' },
					{ id: 'D', text: 'To reduce the number of employees' },
				],
				correctAnswer: 'B',
				hint: 'Internal controls are processes implemented to provide reasonable assurance regarding the achievement of objectives in effectiveness and efficiency of operations, reliability of financial reporting, and compliance with laws and regulations.',
				topic: 'Internal Control',
			},
		],
	},
	'eng-p1-2025-may': {
		title: 'NSC English HL P1 May/June 2025',
		subject: 'English HL',
		questions: [
			{
				id: '3.4',
				question:
					"Provide a contextually correct synonym for the word 'abandoned' as used in Text D (a chair on the street):",
				options: [
					{ id: 'A', text: 'Forgotten' },
					{ id: 'B', text: 'Deserted' },
					{ id: 'C', text: 'Discarded' },
					{ id: 'D', text: 'Replaced' },
				],
				correctAnswer: 'C',
				hint: "In the context of a chair left on the street, 'discarded' best captures the sense of being thrown away.",
				topic: 'Language Structures',
			},
		],
	},
	'eng-p2-2025-may': {
		title: 'NSC English HL P2 May/June 2025',
		subject: 'English HL',
		questions: [
			{
				id: '1.1',
				question:
					"In Shakespeare's 'Hamlet', what is the primary motive for Hamlet's hesitation in killing Claudius while he is praying?",
				options: [
					{ id: 'A', text: 'Fear of the guards' },
					{ id: 'B', text: 'Moral objection to murder' },
					{ id: 'C', text: 'Desire to send Claudius to hell, not heaven' },
					{ id: 'D', text: "Uncertainty about the Ghost's identity" },
				],
				correctAnswer: 'C',
				hint: 'Hamlet believes that if he kills Claudius while he is praying, Claudius will go to heaven. He wants to wait until Claudius is in the middle of a sinful act.',
				topic: 'Literature',
			},
		],
	},
	'eng-p3-2025-may': {
		title: 'NSC English HL P3 May/June 2025',
		subject: 'English HL',
		questions: [
			{
				id: '1.1',
				question: 'Which of the following is a characteristic of a discursive essay?',
				options: [
					{ id: 'A', text: 'It tells a personal story with a clear plot' },
					{ id: 'B', text: 'It presents a balanced argument on a topic' },
					{ id: 'C', text: 'It uses highly emotional language to persuade' },
					{ id: 'D', text: 'It provides a set of instructions' },
				],
				correctAnswer: 'B',
				hint: 'A discursive essay explores a topic from multiple perspectives in a balanced way.',
				topic: 'Writing',
			},
		],
	},
};
