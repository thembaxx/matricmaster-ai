/**
 * Content Equity and Cultural Bias Mitigation Service
 *
 * Handles cultural bias and content equity with:
 * - SA-specific context in AI system prompts
 * - Bias detection in generated content
 * - Diverse example scenarios reflecting SA context
 * - Community feedback loop for bias reporting
 * - Regular content audits for cultural sensitivity
 * - Inclusive language guidelines in prompts
 */

'use server';

import { eq } from 'drizzle-orm';
import { dbManagerV2 } from '@/lib/db/database-manager-v2';
import { contentFlags } from '@/lib/db/schema';
import { logger } from '@/lib/logger';

const log = logger.createLogger('ContentEquity');

// Types
export interface BiasDetectionResult {
	hasBias: boolean;
	biasType: BiasType[];
	confidence: number;
	suggestions: string[];
	requiresReview: boolean;
}

export type BiasType =
	| 'cultural'
	| 'regional'
	| 'gender'
	| 'socioeconomic'
	| 'language'
	| 'stereotyping'
	| 'exclusion';

export interface ContentAudit {
	id: string;
	contentType: 'question' | 'lesson' | 'explanation' | 'flashcard';
	contentId: string;
	auditDate: Date;
	biasDetected: boolean;
	biasTypes: BiasType[];
	severity: 'low' | 'medium' | 'high' | 'critical';
	resolved: boolean;
	resolvedAt: Date | null;
}

export interface ContentBiasReport {
	id: string;
	reporterId: string;
	contentId: string;
	biasType: BiasType;
	description: string;
	evidence: string;
	status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
	createdAt: Date;
}

export interface CulturalContext {
	region: string;
	language: string;
	culturalReferences: string[];
	localExamples: LocalExample[];
}

export interface LocalExample {
	topic: string;
	context: string;
	example: string;
	culturalRelevance: 'high' | 'medium' | 'low';
}

// SA Context configuration
const SA_CONTEXT = {
	regions: [
		'Western Cape',
		'Gauteng',
		'KwaZulu-Natal',
		'Eastern Cape',
		'Limpopo',
		'Mpumalanga',
		'North West',
		'Free State',
		'Northern Cape',
	],
	languages: [
		'English',
		'isiZulu',
		'isiXhosa',
		'Afrikaans',
		'Sepedi',
		'Setswana',
		'Sesotho',
		'Xitsonga',
		'siSwati',
		'Tshivenda',
		' isiNdebele',
	],
	culturalValues: [
		'Ubuntu - interconnectedness and community',
		'Education as pathway to opportunity',
		'Multilingualism and cultural diversity',
		'Respect for elders and traditions',
		'Resilience and determination',
	],
	inclusiveGuidelines: [
		'Use gender-neutral language',
		'Include examples from multiple SA regions',
		'Reference diverse cultural contexts',
		'Avoid assumptions about socioeconomic status',
		'Use inclusive scenarios that reflect SA diversity',
		'Acknowledge multiple pathways to success',
	],
};

/**
 * Detect bias in content
 */
export async function detectBias(content: string): Promise<BiasDetectionResult> {
	const biasTypes: BiasType[] = [];
	let confidence = 0;
	const suggestions: string[] = [];

	// Check for cultural bias
	if (hasCulturalBias(content)) {
		biasTypes.push('cultural');
		confidence += 0.3;
		suggestions.push('Include diverse cultural perspectives');
	}

	// Check for regional bias
	if (hasRegionalBias(content)) {
		biasTypes.push('regional');
		confidence += 0.2;
		suggestions.push('Include examples from different SA regions');
	}

	// Check for socioeconomic assumptions
	if (hasSocioeconomicAssumptions(content)) {
		biasTypes.push('socioeconomic');
		confidence += 0.2;
		suggestions.push('Avoid assumptions about access to resources');
	}

	// Check for stereotyping
	if (hasStereotyping(content)) {
		biasTypes.push('stereotyping');
		confidence += 0.3;
		suggestions.push('Remove stereotypical representations');
	}

	const hasBias = biasTypes.length > 0;
	const requiresReview = confidence >= 0.5;

	return {
		hasBias,
		biasTypes,
		confidence,
		suggestions,
		requiresReview,
	};
}

/**
 * Check for cultural bias
 */
function hasCulturalBias(content: string): boolean {
	// Would use NLP to detect cultural bias
	// Simplified: check for Western-centric references
	const westernCentric = ['Christmas', 'Thanksgiving', 'suburban', 'mall'];
	return westernCentric.some((term) => content.toLowerCase().includes(term));
}

/**
 * Check for regional bias
 */
function hasRegionalBias(content: string): boolean {
	// Check if content only references one region
	const regionCount = SA_CONTEXT.regions.filter((region) =>
		content.toLowerCase().includes(region.toLowerCase())
	).length;

	return regionCount === 0; // No SA regions mentioned at all
}

/**
 * Check for socioeconomic assumptions
 */
function hasSocioeconomicAssumptions(content: string): boolean {
	// Check for assumptions about access to technology, transport, etc.
	const assumptions = ['smartphone', 'laptop', 'car', 'internet', 'tutor'];
	return assumptions.some((term) => content.toLowerCase().includes(term));
}

/**
 * Check for stereotyping
 */
function hasStereotyping(_content: string): boolean {
	// Would use ML to detect stereotypes
	// Simplified implementation
	return false;
}

/**
 * Add SA context to AI prompt
 */
export function addSAContextToPrompt(prompt: string): string {
	const contextAddition = `
    
Context: You are helping South African students prepare for their matric exams.
- Use examples that reflect SA diversity and multicultural context
- Reference SA locations, history, and culture appropriately
- Use inclusive language that respects all 11 official languages
- Avoid assumptions about socioeconomic status
- Include scenarios from urban, suburban, and rural contexts
- Respect Ubuntu philosophy and community values
`;

	return prompt + contextAddition;
}

/**
 * Get inclusive language guidelines
 */
export function getInclusiveLanguageGuidelines(): string[] {
	return SA_CONTEXT.inclusiveGuidelines;
}

/**
 * Report content bias
 */
export async function reportContentBias(params: {
	reporterId: string;
	contentId: string;
	biasType: BiasType;
	description: string;
	evidence: string;
}): Promise<ContentBiasReport> {
	const db = await dbManagerV2.getDb();
	if (!db) {
		throw new Error('Database not available');
	}

	const id = `bias_report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

	const report: ContentBiasReport = {
		id,
		reporterId: params.reporterId,
		contentId: params.contentId,
		biasType: params.biasType,
		description: params.description,
		evidence: params.evidence,
		status: 'pending',
		createdAt: new Date(),
	};

	try {
		await db.insert(contentFlags).values({
			id: report.id,
			userId: report.reporterId,
			contentId: report.contentId,
			reason: report.biasType,
			description: report.description,
			status: 'pending',
		});

		log.info('Content bias reported', {
			reportId: id,
			biasType: params.biasType,
			contentId: params.contentId,
		});

		return report;
	} catch (error) {
		log.error('Failed to report content bias', { error });
		throw error;
	}
}

/**
 * Get SA cultural context
 */
export function getSACulturalContext(): CulturalContext {
	return {
		region: 'South Africa',
		language: 'English',
		culturalReferences: SA_CONTEXT.culturalValues,
		localExamples: [
			{
				topic: 'Mathematics',
				context: 'Real-world application',
				example: 'Calculate the angle of elevation from Cape Town to Table Mountain',
				culturalRelevance: 'high',
			},
			{
				topic: 'History',
				context: 'SA historical events',
				example: 'Analyze the impact of the 1994 democratic elections',
				culturalRelevance: 'high',
			},
			{
				topic: 'Geography',
				context: 'Local geography',
				example: 'Study the climate patterns in the Karoo region',
				culturalRelevance: 'high',
			},
		],
	};
}

/**
 * Audit content for bias
 */
export async function auditContentForBias(
	contentType: string,
	contentId: string,
	content: string
): Promise<ContentAudit> {
	const biasDetection = await detectBias(content);

	const audit: ContentAudit = {
		id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
		contentType: contentType as ContentAudit['contentType'],
		contentId,
		auditDate: new Date(),
		biasDetected: biasDetection.hasBias,
		biasTypes: biasDetection.biasTypes,
		severity:
			biasDetection.confidence >= 0.7 ? 'high' : biasDetection.confidence >= 0.4 ? 'medium' : 'low',
		resolved: false,
		resolvedAt: null,
	};

	log.info('Content audit completed', {
		auditId: audit.id,
		contentType,
		contentId,
		biasDetected: biasDetection.hasBias,
		severity: audit.severity,
	});

	return audit;
}

/**
 * Get pending bias reports
 */
export async function getPendingBiasReports(): Promise<ContentBiasReport[]> {
	const db = await dbManagerV2.getDb();
	if (!db) {
		return [];
	}

	try {
		const reports = await db
			.select()
			.from(contentFlags)
			.where(eq(contentFlags.status, 'pending'))
			.orderBy(desc(contentFlags.createdAt))
			.limit(50);

		return reports.map((r) => ({
			id: r.id,
			reporterId: r.userId,
			contentId: r.contentId,
			biasType: r.reason as BiasType,
			description: r.description || '',
			evidence: '',
			status: r.status as ContentBiasReport['status'],
			createdAt: r.createdAt!,
		}));
	} catch (error) {
		log.error('Failed to get pending bias reports', { error });
		return [];
	}
}

/**
 * Resolve bias report
 */
export async function resolveBiasReport(reportId: string, resolved: boolean): Promise<void> {
	const db = await dbManagerV2.getDb();
	if (!db) {
		return;
	}

	try {
		await db
			.update(contentFlags)
			.set({
				status: resolved ? 'resolved' : 'dismissed',
				updatedAt: new Date(),
			})
			.where(eq(contentFlags.id, reportId));

		log.info('Bias report resolved', {
			reportId,
			resolved,
		});
	} catch (error) {
		log.error('Failed to resolve bias report', { error });
	}
}

/**
 * Generate culturally inclusive example
 */
export function generateCulturallyInclusiveExample(topic: string, context: string): LocalExample {
	const examples: Record<string, LocalExample> = {
		mathematics: {
			topic: 'Mathematics',
			context: 'SA context',
			example:
				'A taxi driver in Johannesburg earns R500 per day. If he works 5 days a week for 4 weeks, how much does he earn in a month?',
			culturalRelevance: 'high',
		},
		science: {
			topic: 'Science',
			context: 'SA context',
			example:
				'The Kruger National Park covers nearly 2 million hectares. Calculate the area in square kilometers.',
			culturalRelevance: 'high',
		},
		history: {
			topic: 'History',
			context: 'SA context',
			example:
				"Nelson Mandela was imprisoned for 27 years before becoming South Africa's first democratically elected president in 1994.",
			culturalRelevance: 'high',
		},
	};

	return (
		examples[topic.toLowerCase()] || {
			topic,
			context,
			example: `Example related to ${topic} in South African context`,
			culturalRelevance: 'medium',
		}
	);
}
