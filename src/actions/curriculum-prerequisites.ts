'use server';

import { and, eq } from 'drizzle-orm';
import { getAuth } from '@/lib/auth';
import { type DbType, dbManager } from '@/lib/db';
import { questions, topicMastery } from '@/lib/db/schema';

interface TopicPrerequisite {
	topic: string;
	subject: string;
	prerequisites: string[];
	isUnlocked: boolean;
	masteryLevel: number;
}

interface PrerequisiteCheck {
	canAttempt: boolean;
	missingPrerequisites: string[];
	suggestedTopics: string[];
	message: string;
}

async function getDb(): Promise<DbType> {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) throw new Error('Database not available');
	return await dbManager.getDb();
}

/**
 * Get the prerequisites for a given topic based on NSC curriculum structure
 */
function getTopicPrerequisites(topic: string, _subject: string): string[] {
	const prerequisiteMap: Record<string, string[]> = {
		// Mathematics
		'Quadratic Equations': ['Linear Equations', 'Algebraic Expressions'],
		Trigonometry: ['Ratio and Proportion', 'Similarity', 'Pythagoras'],
		Calculus: ['Functions', 'Limits', 'Differentiation'],
		Probability: ['Combinatorics', 'Sets', 'Counting Principles'],
		'Euclidean Geometry': ['Lines and Angles', 'Triangles', 'Polygons'],
		'Analytical Geometry': ['Coordinate System', 'Linear Equations', 'Distance Formula'],
		Matrices: ['Algebraic Expressions', 'Linear Equations'],
		Statistics: ['Data Handling', 'Measures of Central Tendency'],

		// Physical Sciences
		Momentum: ["Newton's Laws", 'Vectors', 'Kinematics'],
		Electrostatics: ['Charge', 'Electric Fields', "Coulomb's Law"],
		'Chemical Equilibrium': ['Reaction Rates', 'Stoichiometry', 'Chemical Reactions'],
		'Organic Chemistry': ['Bonding', 'IUPAC Naming', 'Functional Groups'],
		'Redox Reactions': ['Oxidation States', 'Electron Transfer', 'Electrochemical Cells'],
		"Newton's Laws": ['Vectors', 'Kinematics', 'Forces'],
		Mechanics: ['Vectors', "Newton's Laws", 'Kinematics'],
		Waves: ['Transverse Waves', 'Sound', 'Wave Properties'],
		'Electric Circuits': ['Current', 'Resistance', "Ohm's Law"],

		// Life Sciences
		'Molecular Genetics': ['DNA Structure', 'Cell Division', 'Replication'],
		Evolution: ['Natural Selection', 'Genetics', 'Fossil Record'],
		'Human Reproduction': ['Cell Division', 'Hormones', 'Meiosis'],
		'Plant Physiology': ['Transport in Plants', 'Photosynthesis', 'Transpiration'],
		Meiosis: ['Cell Division', 'Mitosis', 'Chromosomes'],
		'Cell Division': ['Mitosis', 'Chromosomes', 'Cell Cycle'],
		Respiration: ['Cell Biology', 'Energy', 'ATP'],
		Photosynthesis: ['Chloroplast', 'Light Reactions', 'Calvin Cycle'],

		// English Home Language
		'Essay Writing': ['Paragraph Structure', 'Grammar', 'Creative Writing'],
		Comprehension: ['Reading Skills', 'Inference', 'Vocabulary'],
		'Poetry Analysis': ['Literary Devices', 'Figures of Speech', 'Tone'],
		'Language Structures': ['Grammar', 'Syntax', 'Punctuation'],

		// History
		'Cold War': ['World War II', 'Superpowers', 'Ideology'],
		'South African History': ['Colonialism', 'Apartheid', 'Democracy'],
		'Civil Rights': ['Apartheid', 'Resistance', 'Liberation Movements'],

		// Geography
		'Climate and Weather': ['Atmosphere', 'Pressure Systems', 'Climate Zones'],
		Geomorphology: ['Weathering', 'Erosion', 'Landforms'],
		Cartography: ['Map Reading', 'Scale', 'Coordinates'],
	};

	return prerequisiteMap[topic] || [];
}

/**
 * Check if a student has mastered the prerequisites for a given topic
 */
export async function checkTopicPrerequisites(
	topic: string,
	subject: string
): Promise<PrerequisiteCheck> {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession();
		if (!session?.user) {
			return {
				canAttempt: true,
				missingPrerequisites: [],
				suggestedTopics: [],
				message: 'Sign in for prerequisite tracking',
			};
		}

		const db = await getDb();
		const userId = session.user.id;

		// Get prerequisites for this topic from curriculum
		const prerequisites = getTopicPrerequisites(topic, subject);

		if (prerequisites.length === 0) {
			return {
				canAttempt: true,
				missingPrerequisites: [],
				suggestedTopics: [],
				message: 'No prerequisites required',
			};
		}

		// Check mastery of each prerequisite
		const missingPrereqs: string[] = [];
		const suggestedTopics: string[] = [];

		for (const prereq of prerequisites) {
			const mastery = await db.query.topicMastery.findFirst({
				where: and(eq(topicMastery.userId, userId), eq(topicMastery.topic, prereq)),
			});

			const masteryLevel = mastery ? Number(mastery.masteryLevel) : 0;

			if (masteryLevel < 0.5) {
				missingPrereqs.push(prereq);

				// If mastery is very low, suggest learning it first
				if (masteryLevel < 0.3) {
					suggestedTopics.push(prereq);
				}
			}
		}

		const canAttempt = missingPrereqs.length === 0;
		const message = canAttempt
			? `You've mastered the prerequisites for ${topic}`
			: `You should review ${missingPrereqs.join(', ')} before tackling ${topic}`;

		return { canAttempt, missingPrerequisites: missingPrereqs, suggestedTopics, message };
	} catch (error) {
		console.error('checkTopicPrerequisites failed:', error);
		return {
			canAttempt: true,
			missingPrerequisites: [],
			suggestedTopics: [],
			message: 'Unable to check prerequisites',
		};
	}
}

/**
 * Get unlocked topics for a student based on their mastery
 */
export async function getUnlockedTopics(subject: string): Promise<TopicPrerequisite[]> {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession();
		if (!session?.user) return [];

		const db = await getDb();
		const userId = session.user.id;

		// Get all topics for subject from questions table
		const allTopics = await db.query.questions.findMany({
			where: eq(questions.subjectId, 1),
			columns: { topic: true },
		});

		const topics = [...new Set(allTopics.map((q) => q.topic).filter(Boolean))];
		const result: TopicPrerequisite[] = [];

		for (const topic of topics) {
			if (!topic) continue;

			const prerequisites = getTopicPrerequisites(topic, subject);
			let masteryLevel = 0;

			// Get current topic mastery
			const mastery = await db.query.topicMastery.findFirst({
				where: and(eq(topicMastery.userId, userId), eq(topicMastery.topic, topic)),
			});

			masteryLevel = mastery ? Number(mastery.masteryLevel) : 0;

			// Check if all prerequisites are mastered
			let isUnlocked = prerequisites.length === 0;

			if (!isUnlocked) {
				let prereqsMet = true;
				for (const prereq of prerequisites) {
					const prereqMastery = await db.query.topicMastery.findFirst({
						where: and(eq(topicMastery.userId, userId), eq(topicMastery.topic, prereq)),
					});
					if (!prereqMastery || Number(prereqMastery.masteryLevel) < 0.5) {
						prereqsMet = false;
						break;
					}
				}
				isUnlocked = prereqsMet;
			}

			result.push({
				topic,
				subject,
				prerequisites,
				isUnlocked,
				masteryLevel,
			});
		}

		return result;
	} catch (error) {
		console.error('getUnlockedTopics failed:', error);
		return [];
	}
}

/**
 * Get recommended next topics based on prerequisites and mastery
 */
export async function getRecommendedTopics(
	subject: string,
	limit = 5
): Promise<Array<{ topic: string; reason: string; priority: number }>> {
	try {
		const unlocked = await getUnlockedTopics(subject);
		const recommendations: Array<{ topic: string; reason: string; priority: number }> = [];

		for (const item of unlocked) {
			if (!item.isUnlocked) continue;

			if (item.masteryLevel < 0.5) {
				recommendations.push({
					topic: item.topic,
					reason: 'Low mastery - needs practice',
					priority: 100 - item.masteryLevel * 100,
				});
			} else if (item.masteryLevel < 0.8) {
				recommendations.push({
					topic: item.topic,
					reason: 'Good progress - keep practicing',
					priority: 50 - item.masteryLevel * 50,
				});
			}
		}

		// Sort by priority and return top recommendations
		recommendations.sort((a, b) => b.priority - a.priority);
		return recommendations.slice(0, limit);
	} catch (error) {
		console.error('getRecommendedTopics failed:', error);
		return [];
	}
}

/**
 * Get all prerequisite chains for a subject
 */
export async function getPrerequisiteMap(
	subject: string
): Promise<Array<{ topic: string; prerequisites: string[]; dependents: string[] }>> {
	try {
		const db = await getDb();

		// Get all topics for subject
		const allTopics = await db.query.questions.findMany({
			where: eq(questions.subjectId, 1),
			columns: { topic: true },
		});

		const topics = [...new Set(allTopics.map((q) => q.topic).filter(Boolean))];
		const result: Array<{ topic: string; prerequisites: string[]; dependents: string[] }> = [];

		for (const topic of topics) {
			if (!topic) continue;

			const prerequisites = getTopicPrerequisites(topic, subject);

			// Find dependents (topics that have this topic as a prerequisite)
			const dependents: string[] = [];
			for (const otherTopic of topics) {
				if (!otherTopic || otherTopic === topic) continue;
				const otherPrereqs = getTopicPrerequisites(otherTopic, subject);
				if (otherPrereqs.includes(topic)) {
					dependents.push(otherTopic);
				}
			}

			result.push({
				topic,
				prerequisites,
				dependents,
			});
		}

		return result;
	} catch (error) {
		console.error('getPrerequisiteMap failed:', error);
		return [];
	}
}

/**
 * Check if mastering a topic will unlock new topics
 */
export async function checkUnlockPotential(
	topic: string,
	subject: string
): Promise<{
	currentMastery: number;
	willUnlock: string[];
	dependentTopics: string[];
}> {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession();
		if (!session?.user) {
			return { currentMastery: 0, willUnlock: [], dependentTopics: [] };
		}

		const db = await getDb();
		const userId = session.user.id;

		// Get current mastery
		const mastery = await db.query.topicMastery.findFirst({
			where: and(eq(topicMastery.userId, userId), eq(topicMastery.topic, topic)),
		});

		const currentMastery = mastery ? Number(mastery.masteryLevel) : 0;

		// Find topics that have this as a prerequisite
		const dependentTopics: string[] = [];
		const willUnlock: string[] = [];

		const allTopics = await db.query.questions.findMany({
			where: eq(questions.subjectId, 1),
			columns: { topic: true },
		});

		const topics = [...new Set(allTopics.map((q) => q.topic).filter(Boolean))];

		for (const otherTopic of topics) {
			if (!otherTopic || otherTopic === topic) continue;

			const prereqs = getTopicPrerequisites(otherTopic, subject);
			if (prereqs.includes(topic)) {
				dependentTopics.push(otherTopic);

				// Check if this topic mastery will unlock it (mastery >= 0.5)
				const otherMasteries = await Promise.all(
					prereqs
						.filter((p) => p !== topic)
						.map((p) =>
							db.query.topicMastery.findFirst({
								where: and(eq(topicMastery.userId, userId), eq(topicMastery.topic, p)),
							})
						)
				);

				const otherPrereqsMet = otherMasteries.every((m) => m && Number(m.masteryLevel) >= 0.5);

				// If all other prereqs are met and current topic mastery would cross 0.5
				if (otherPrereqsMet && currentMastery < 0.5) {
					willUnlock.push(otherTopic);
				}
			}
		}

		return { currentMastery, willUnlock, dependentTopics };
	} catch (error) {
		console.error('checkUnlockPotential failed:', error);
		return { currentMastery: 0, willUnlock: [], dependentTopics: [] };
	}
}
