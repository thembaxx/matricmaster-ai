import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { getDb } from '@/lib/db';
import { apsMilestones, universityTargets } from '@/lib/db/schema';

function getGeminiModel() {
	const apiKey = process.env.GEMINI_API_KEY;
	if (!apiKey) {
		throw new Error('GEMINI_API_KEY is not configured');
	}
	const google = createGoogleGenerativeAI({ apiKey });
	return google('gemini-2.5-flash');
}

interface StudyMilestone {
	title: string;
	description: string;
	subject: string;
	topic: string;
	apsPotentialPoints: number;
	estimatedHours: number;
}

interface UniversityPath {
	targetUniversity: string;
	targetFaculty: string;
	currentAps: number;
	targetAps: number;
	gap: number;
	prioritizedSubjects: string[];
	milestones: StudyMilestone[];
	weeklyPlan: Array<{
		week: number;
		focusSubject: string;
		topics: string[];
		targetMilestones: string[];
	}>;
}

const SOUTH_AFRICAN_UNIVERSITIES: Record<
	string,
	Record<string, { minAps: number; required: string[]; recommended: string[] }>
> = {
	'University of Cape Town': {
		Engineering: {
			minAps: 42,
			required: ['Mathematics', 'Physical Sciences'],
			recommended: ['Calculus', 'Mechanics', 'Electricity'],
		},
		'Health Sciences': {
			minAps: 45,
			required: ['Mathematics', 'Physical Sciences', 'Life Sciences'],
			recommended: ['Chemistry', 'Biology'],
		},
		Commerce: { minAps: 38, required: ['Mathematics'], recommended: ['Accounting', 'Economics'] },
		Science: {
			minAps: 40,
			required: ['Mathematics', 'Physical Sciences'],
			recommended: ['Chemistry'],
		},
		Law: { minAps: 38, required: ['English'], recommended: ['History'] },
	},
	'University of Pretoria': {
		Engineering: {
			minAps: 40,
			required: ['Mathematics', 'Physical Sciences'],
			recommended: ['Calculus', 'Mechanics'],
		},
		Medicine: {
			minAps: 43,
			required: ['Mathematics', 'Physical Sciences', 'Life Sciences'],
			recommended: ['Biochemistry'],
		},
		Commerce: { minAps: 36, required: ['Mathematics'], recommended: ['Accounting', 'Economics'] },
		Law: { minAps: 35, required: ['English'], recommended: ['History', 'Life Sciences'] },
		Agriculture: { minAps: 30, required: ['Life Sciences'], recommended: ['Physical Sciences'] },
	},
	'University of the Witwatersrand': {
		Engineering: {
			minAps: 42,
			required: ['Mathematics', 'Physical Sciences'],
			recommended: ['Calculus', 'Physics'],
		},
		'Health Sciences': {
			minAps: 44,
			required: ['Mathematics', 'Physical Sciences', 'Life Sciences'],
			recommended: [],
		},
		Commerce: { minAps: 38, required: ['Mathematics'], recommended: ['Accounting'] },
		Science: {
			minAps: 39,
			required: ['Mathematics', 'Physical Sciences'],
			recommended: ['Life Sciences'],
		},
	},
	'Stellenbosch University': {
		Engineering: {
			minAps: 38,
			required: ['Mathematics', 'Physical Sciences'],
			recommended: ['Math', 'Physics'],
		},
		Medicine: {
			minAps: 42,
			required: ['Mathematics', 'Physical Sciences', 'Life Sciences'],
			recommended: [],
		},
		Commerce: { minAps: 35, required: ['Mathematics'], recommended: ['Accounting', 'Economics'] },
		Science: { minAps: 36, required: ['Mathematics'], recommended: ['Physical Sciences'] },
		Education: { minAps: 28, required: ['Mathematics'], recommended: ['Life Sciences'] },
	},
	'University of Johannesburg': {
		Engineering: { minAps: 36, required: ['Mathematics', 'Physical Sciences'], recommended: [] },
		Commerce: { minAps: 32, required: ['Mathematics'], recommended: ['Accounting'] },
		'Health Sciences': {
			minAps: 38,
			required: ['Mathematics', 'Life Sciences'],
			recommended: ['Physical Sciences'],
		},
		Humanities: { minAps: 28, required: ['English'], recommended: ['History'] },
	},
	'University of KwaZulu-Natal': {
		Engineering: { minAps: 36, required: ['Mathematics', 'Physical Sciences'], recommended: [] },
		Medicine: {
			minAps: 40,
			required: ['Mathematics', 'Physical Sciences', 'Life Sciences'],
			recommended: [],
		},
		Commerce: { minAps: 30, required: ['Mathematics'], recommended: ['Accounting'] },
		Agriculture: { minAps: 28, required: ['Life Sciences'], recommended: ['Physical Sciences'] },
	},
	'University of the Free State': {
		Engineering: { minAps: 34, required: ['Mathematics', 'Physical Sciences'], recommended: [] },
		Medicine: {
			minAps: 38,
			required: ['Mathematics', 'Physical Sciences', 'Life Sciences'],
			recommended: [],
		},
		Commerce: { minAps: 28, required: ['Mathematics'], recommended: ['Accounting'] },
		Education: { minAps: 24, required: ['Mathematics'], recommended: ['Life Sciences'] },
	},
	'University of the Western Cape': {
		Science: {
			minAps: 34,
			required: ['Mathematics', 'Physical Sciences'],
			recommended: ['Life Sciences'],
		},
		Commerce: { minAps: 30, required: ['Mathematics'], recommended: ['Accounting'] },
		Education: { minAps: 24, required: ['Mathematics'], recommended: [] },
		'Health Sciences': {
			minAps: 38,
			required: ['Mathematics', 'Life Sciences', 'Physical Sciences'],
			recommended: [],
		},
	},
	'Nelson Mandela University': {
		Engineering: { minAps: 32, required: ['Mathematics', 'Physical Sciences'], recommended: [] },
		Commerce: { minAps: 26, required: ['Mathematics'], recommended: ['Accounting'] },
		'Marine Sciences': {
			minAps: 30,
			required: ['Life Sciences', 'Physical Sciences'],
			recommended: [],
		},
	},
	'University of Limpopo': {
		Medicine: {
			minAps: 36,
			required: ['Mathematics', 'Physical Sciences', 'Life Sciences'],
			recommended: [],
		},
		Commerce: { minAps: 26, required: ['Mathematics'], recommended: ['Accounting'] },
		Agriculture: { minAps: 24, required: ['Life Sciences'], recommended: [] },
	},
	'Durban University of Technology': {
		Engineering: { minAps: 28, required: ['Mathematics', 'Physical Sciences'], recommended: [] },
		Commerce: { minAps: 22, required: ['Mathematics'], recommended: ['Accounting'] },
		'Health Sciences': {
			minAps: 30,
			required: ['Life Sciences'],
			recommended: ['Physical Sciences'],
		},
	},
	'University of South Africa (UNISA)': {
		Commerce: { minAps: 20, required: ['Mathematics'], recommended: ['Accounting'] },
		Science: { minAps: 24, required: ['Mathematics'], recommended: ['Physical Sciences'] },
		Education: { minAps: 18, required: ['Mathematics'], recommended: [] },
	},
	'University of Fort Hare': {
		Commerce: { minAps: 24, required: ['Mathematics'], recommended: ['Accounting'] },
		Science: { minAps: 26, required: ['Mathematics', 'Physical Sciences'], recommended: [] },
		Agriculture: { minAps: 22, required: ['Life Sciences'], recommended: [] },
	},
	'Rhodes University': {
		Science: {
			minAps: 38,
			required: ['Mathematics', 'Physical Sciences'],
			recommended: ['Chemistry'],
		},
		Humanities: { minAps: 32, required: ['English'], recommended: ['History'] },
		Commerce: { minAps: 34, required: ['Mathematics'], recommended: ['Accounting'] },
	},
};

export async function generateUniversityPath(
	_userId: string,
	universityName: string,
	faculty: string,
	currentAps: number,
	currentStrengths: string[],
	weakTopics: Array<{ subject: string; topic: string }>
): Promise<UniversityPath> {
	const uniRequirements = SOUTH_AFRICAN_UNIVERSITIES[universityName]?.[faculty];

	if (!uniRequirements) {
		throw new Error(`Unknown university/faculty: ${universityName}/${faculty}`);
	}

	const targetAps = uniRequirements.minAps;
	const gap = targetAps - currentAps;

	const prompt = `
Generate a study roadmap for a South African NSC student targeting ${universityName} - ${faculty}.

Current Status:
- Current APS: ${currentAps}
- Target APS: ${targetAps}
- APS Gap: ${gap}
- Strong subjects: ${currentStrengths.join(', ') || 'None specified'}
- Weak topics: ${weakTopics.map((t) => `${t.subject}: ${t.topic}`).join(', ') || 'None specified'}

Required subjects for this program: ${uniRequirements.required.join(', ')}

Generate a detailed roadmap with:
1. Prioritized subjects to focus on (ranked by APS impact)
2. 5-8 specific milestones that each contribute to APS improvement
3. A 12-week study plan

For each milestone, include:
- Title (actionable, e.g., "Master Calculus Derivatives")
- Subject
- Specific topic
- APS potential (1-3 points)
- Estimated hours needed

Return as JSON with this structure:
{
  "prioritizedSubjects": ["Mathematics", "Physical Sciences", ...],
  "milestones": [
    {
      "title": "string",
      "description": "string", 
      "subject": "string",
      "topic": "string",
      "apsPotentialPoints": number,
      "estimatedHours": number
    }
  ],
  "weeklyPlan": [
    {
      "week": 1,
      "focusSubject": "string",
      "topics": ["string"],
      "targetMilestones": ["string"]
    }
  ]
}
`;

	const { object } = await generateObject({
		model: getGeminiModel(),
		schema: z.object({
			prioritizedSubjects: z.array(z.string()),
			milestones: z.array(
				z.object({
					title: z.string(),
					description: z.string(),
					subject: z.string(),
					topic: z.string(),
					apsPotentialPoints: z.number(),
					estimatedHours: z.number(),
				})
			),
			weeklyPlan: z.array(
				z.object({
					week: z.number(),
					focusSubject: z.string(),
					topics: z.array(z.string()),
					targetMilestones: z.array(z.string()),
				})
			),
		}),
		prompt,
	});

	return {
		targetUniversity: universityName,
		targetFaculty: faculty,
		currentAps,
		targetAps,
		gap,
		prioritizedSubjects: object.prioritizedSubjects,
		milestones: object.milestones,
		weeklyPlan: object.weeklyPlan,
	};
}

export async function saveRoadmapToDatabase(
	userId: string,
	universityTargetId: string,
	roadmap: UniversityPath
): Promise<void> {
	const db = await getDb();

	for (const milestone of roadmap.milestones) {
		await db.insert(apsMilestones).values({
			userId,
			universityTargetId,
			title: milestone.title,
			description: milestone.description,
			subject: milestone.subject,
			topic: milestone.topic,
			apsPotentialPoints: milestone.apsPotentialPoints,
			status: 'pending',
		});
	}

	await db
		.update(universityTargets)
		.set({ roadMapGeneratedAt: new Date() })
		.where(eq(universityTargets.id, universityTargetId));
}

export async function getUserRoadmap(userId: string) {
	const db = await getDb();

	const activeTarget = await db.query.universityTargets.findFirst({
		where: and(eq(universityTargets.userId, userId), eq(universityTargets.isActive, true)),
	});

	if (!activeTarget) return null;

	const milestones = await db.query.apsMilestones.findMany({
		where: eq(apsMilestones.userId, userId),
	});

	return {
		target: activeTarget,
		milestones,
		completedCount: milestones.filter((m: (typeof milestones)[number]) => m.status === 'completed')
			.length,
		totalMilestones: milestones.length,
		potentialApsGain: milestones
			.filter((m: (typeof milestones)[number]) => m.status !== 'completed')
			.reduce((sum: number, m: (typeof milestones)[number]) => sum + m.apsPotentialPoints, 0),
	};
}

export async function completeMilestone(milestoneId: string): Promise<void> {
	const db = await getDb();
	await db
		.update(apsMilestones)
		.set({ status: 'completed', completedAt: new Date() })
		.where(eq(apsMilestones.id, milestoneId));
}
