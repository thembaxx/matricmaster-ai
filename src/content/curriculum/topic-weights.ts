export const SUBJECT_TOPIC_WEIGHTS: Record<string, Record<string, number>> = {
	mathematics: {
		'Sequences & Series': 15,
		'Functions & Inverses': 30,
		'Differential Calculus': 25,
		Probability: 15,
		Trigonometry: 20,
		'Analytical Geometry': 15,
		'Euclidean Geometry': 15,
		Statistics: 10,
	},
	'physical-sciences': {
		'Momentum & Impulse': 15,
		'Projectile Motion': 15,
		'Work, Energy & Power': 20,
		'Doppler Effect': 10,
		'Chemical Equilibrium': 15,
		'Chemical Reactions': 15,
		Electrostatics: 15,
		'Electric Circuits': 15,
	},
	'life-sciences': {
		'Cell Biology': 20,
		Genetics: 25,
		Evolution: 20,
		Ecology: 15,
		'Human Anatomy': 20,
	},
	english: {
		Comprehension: 25,
		'Essay Writing': 30,
		Poetry: 15,
		'Visual Literacy': 15,
		'Language Structures': 15,
	},
	afrikaans: {
		Comprehension: 25,
		'Essay Writing': 30,
		Poetry: 15,
		'Visual Literacy': 15,
		'Language Structures': 15,
	},
	geography: {
		Climatology: 20,
		Geomorphology: 25,
		Mapwork: 20,
		'Rural & Urban': 15,
		'Climate Change': 20,
	},
	history: {
		'Paper 1 - SA History': 50,
		'Paper 2 - World History': 50,
	},
	accounting: {
		'Financial Statements': 30,
		'Cost Accounting': 25,
		Budgeting: 15,
		Audit: 15,
		Tax: 15,
	},
	economics: {
		Microeconomics: 25,
		Macroeconomics: 30,
		'Economic Graphs': 20,
		Commerce: 15,
	},
};

export function getTopicMarkWeight(subject: string, topic: string): number {
	const normalizedSubject = subject.toLowerCase().replace(/[\s-]/g, '-');
	const subjectWeights = SUBJECT_TOPIC_WEIGHTS[normalizedSubject];

	if (!subjectWeights) {
		return 20;
	}

	return subjectWeights[topic] ?? 20;
}

export function getSubjectTotalWeight(subject: string): number {
	const normalizedSubject = subject.toLowerCase().replace(/[\s-]/g, '-');
	const subjectWeights = SUBJECT_TOPIC_WEIGHTS[normalizedSubject];

	if (!subjectWeights) {
		return 100;
	}

	return Object.values(subjectWeights).reduce((sum, weight) => sum + weight, 0);
}
