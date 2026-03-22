export interface TopicPrerequisite {
	topic: string;
	subject: string;
	prerequisites: string[];
	canLearnWithout: string[];
	estimatedHoursToMaster: number;
}

export interface DependencyChain {
	topics: string[];
	estimatedTotalHours: number;
	blocks: string[];
}

const TOPIC_PREREQUISITES: Record<string, Omit<TopicPrerequisite, 'topic'>> = {
	Calculus: {
		subject: 'Mathematics',
		prerequisites: ['Algebra', 'Functions', 'Number Patterns'],
		canLearnWithout: [],
		estimatedHoursToMaster: 40,
	},
	Differentiation: {
		subject: 'Mathematics',
		prerequisites: ['Calculus', 'Limits', 'Algebra'],
		canLearnWithout: [],
		estimatedHoursToMaster: 25,
	},
	Integration: {
		subject: 'Mathematics',
		prerequisites: ['Differentiation', 'Calculus', 'Algebra'],
		canLearnWithout: [],
		estimatedHoursToMaster: 30,
	},
	Functions: {
		subject: 'Mathematics',
		prerequisites: ['Algebra', 'Number Patterns'],
		canLearnWithout: [],
		estimatedHoursToMaster: 20,
	},
	'Quadratic Functions': {
		subject: 'Mathematics',
		prerequisites: ['Functions', 'Algebra'],
		canLearnWithout: [],
		estimatedHoursToMaster: 15,
	},
	Trigonometry: {
		subject: 'Mathematics',
		prerequisites: ['Geometry', 'Algebra'],
		canLearnWithout: [],
		estimatedHoursToMaster: 30,
	},
	'Analytical Geometry': {
		subject: 'Mathematics',
		prerequisites: ['Algebra', 'Functions'],
		canLearnWithout: [],
		estimatedHoursToMaster: 20,
	},
	Probability: {
		subject: 'Mathematics',
		prerequisites: ['Statistics', 'Number Patterns'],
		canLearnWithout: [],
		estimatedHoursToMaster: 15,
	},
	Statistics: {
		subject: 'Mathematics',
		prerequisites: ['Number Patterns'],
		canLearnWithout: [],
		estimatedHoursToMaster: 15,
	},
	'Linear Programming': {
		subject: 'Mathematics',
		prerequisites: ['Algebra', 'Functions', 'Graphs'],
		canLearnWithout: [],
		estimatedHoursToMaster: 20,
	},
	Mechanics: {
		subject: 'Physical Sciences',
		prerequisites: ['Vectors', 'Kinematics', 'Newton Laws'],
		canLearnWithout: [],
		estimatedHoursToMaster: 35,
	},
	'Newton Laws': {
		subject: 'Physical Sciences',
		prerequisites: ['Vectors', 'Kinematics', 'Forces'],
		canLearnWithout: [],
		estimatedHoursToMaster: 20,
	},
	'Work, Energy and Power': {
		subject: 'Physical Sciences',
		prerequisites: ['Newton Laws', 'Mechanics', 'Vectors'],
		canLearnWithout: [],
		estimatedHoursToMaster: 15,
	},
	Momentum: {
		subject: 'Physical Sciences',
		prerequisites: ['Newton Laws', 'Mechanics', 'Vectors'],
		canLearnWithout: [],
		estimatedHoursToMaster: 15,
	},
	Electricity: {
		subject: 'Physical Sciences',
		prerequisites: ['Electrostatics', 'Circuits', 'Voltage', 'Current'],
		canLearnWithout: [],
		estimatedHoursToMaster: 25,
	},
	Electromagnetism: {
		subject: 'Physical Sciences',
		prerequisites: ['Electricity', 'Magnetic Fields'],
		canLearnWithout: [],
		estimatedHoursToMaster: 20,
	},
	Waves: {
		subject: 'Physical Sciences',
		prerequisites: ['Sound', 'Light', 'Oscillations'],
		canLearnWithout: [],
		estimatedHoursToMaster: 20,
	},
	Optics: {
		subject: 'Physical Sciences',
		prerequisites: ['Light', 'Waves'],
		canLearnWithout: [],
		estimatedHoursToMaster: 15,
	},
	'Chemical Bonding': {
		subject: 'Physical Sciences',
		prerequisites: ['Atomic Structure', 'Periodic Table'],
		canLearnWithout: [],
		estimatedHoursToMaster: 15,
	},
	'Chemical Reactions': {
		subject: 'Physical Sciences',
		prerequisites: ['Chemical Bonding', 'Stoichiometry'],
		canLearnWithout: [],
		estimatedHoursToMaster: 20,
	},
	'Organic Chemistry': {
		subject: 'Physical Sciences',
		prerequisites: ['Chemical Bonding', 'Chemical Reactions', 'Functional Groups'],
		canLearnWithout: [],
		estimatedHoursToMaster: 25,
	},
	Electrochemistry: {
		subject: 'Physical Sciences',
		prerequisites: ['Electricity', 'Chemical Reactions', 'Redox'],
		canLearnWithout: [],
		estimatedHoursToMaster: 20,
	},
	Evolution: {
		subject: 'Life Sciences',
		prerequisites: ['Genetics', ' Biodiversity'],
		canLearnWithout: [],
		estimatedHoursToMaster: 20,
	},
	Genetics: {
		subject: 'Life Sciences',
		prerequisites: ['DNA', 'RNA', 'Heredity'],
		canLearnWithout: [],
		estimatedHoursToMaster: 25,
	},
	'DNA Replication': {
		subject: 'Life Sciences',
		prerequisites: ['DNA Structure', 'Cell Division'],
		canLearnWithout: [],
		estimatedHoursToMaster: 15,
	},
	'Protein Synthesis': {
		subject: 'Life Sciences',
		prerequisites: ['DNA', 'RNA', 'Genetics'],
		canLearnWithout: [],
		estimatedHoursToMaster: 15,
	},
	Ecology: {
		subject: 'Life Sciences',
		prerequisites: ['Ecosystems', 'Biomes'],
		canLearnWithout: [],
		estimatedHoursToMaster: 15,
	},
	'Human Impact': {
		subject: 'Life Sciences',
		prerequisites: ['Ecology', 'Biodiversity'],
		canLearnWithout: [],
		estimatedHoursToMaster: 10,
	},
};

export function getPrerequisites(topic: string, subject?: string): TopicPrerequisite | null {
	const key = Object.keys(TOPIC_PREREQUISITES).find(
		(k) =>
			k.toLowerCase() === topic.toLowerCase() ||
			topic.toLowerCase().includes(k.toLowerCase()) ||
			k.toLowerCase().includes(topic.toLowerCase())
	);

	if (!key) return null;

	const prereq = TOPIC_PREREQUISITES[key];

	if (subject && prereq.subject.toLowerCase() !== subject.toLowerCase()) {
		return null;
	}

	return { ...prereq, topic: key };
}

export function getMissingPrerequisites(topic: string, masteredTopics: string[]): string[] {
	const prereq = getPrerequisites(topic);

	if (!prereq) return [];

	return prereq.prerequisites.filter(
		(p) => !masteredTopics.some((m) => m.toLowerCase().includes(p.toLowerCase()))
	);
}

export function buildDependencyChain(topic: string, masteredTopics: string[]): DependencyChain {
	const chain: string[] = [];
	const blocks: string[] = [];
	const visited = new Set<string>();

	const addTopicToChain = (t: string) => {
		if (visited.has(t.toLowerCase())) return;
		visited.add(t.toLowerCase());

		const prereq = getPrerequisites(t);
		if (!prereq) {
			if (!chain.includes(t)) chain.push(t);
			return;
		}

		for (const prereqTopic of prereq.prerequisites) {
			if (!masteredTopics.some((m) => m.toLowerCase().includes(prereqTopic.toLowerCase()))) {
				if (!blocks.includes(prereqTopic)) {
					blocks.push(prereqTopic);
					addTopicToChain(prereqTopic);
				}
			}
		}

		if (!chain.includes(t)) chain.push(t);
	};

	addTopicToChain(topic);

	const totalHours = chain.reduce((sum, t) => {
		const prereq = getPrerequisites(t);
		return sum + (prereq?.estimatedHoursToMaster || 10);
	}, 0);

	return {
		topics: chain,
		estimatedTotalHours: totalHours,
		blocks,
	};
}

export function suggestLearningPath(
	targetTopic: string,
	currentMastery: Record<string, number>
): string[] {
	const path: string[] = [];
	const prereq = getPrerequisites(targetTopic);

	if (!prereq) {
		return [targetTopic];
	}

	for (const prereqTopic of prereq.prerequisites) {
		const masteryLevel = currentMastery[prereqTopic.toLowerCase()] || 0;

		if (masteryLevel < 0.7) {
			const subPath = suggestLearningPath(prereqTopic, currentMastery);
			for (const sub of subPath) {
				if (!path.includes(sub)) path.push(sub);
			}
		}
	}

	if (!path.includes(targetTopic)) {
		path.push(targetTopic);
	}

	return path;
}

export function getTopicsBlockedBy(topic: string, allTopics: string[]): string[] {
	const blockedTopics: string[] = [];

	for (const t of allTopics) {
		const prereq = getPrerequisites(t);
		if (prereq?.prerequisites.some((p) => p.toLowerCase().includes(topic.toLowerCase()))) {
			blockedTopics.push(t);
		}
	}

	return blockedTopics;
}
