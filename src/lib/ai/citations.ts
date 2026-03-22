import { CURRICULUM_DATA } from '@/data/curriculum';

export type SourceType = 'textbook' | 'past-paper' | 'curriculum' | 'ai-generated';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface CitationSource {
	id: string;
	name: string;
	type: SourceType;
	url?: string;
	description?: string;
}

export interface Citation {
	id: string;
	source: CitationSource;
	topic?: string;
	subtopic?: string;
	confidence: number;
	confidenceLevel: ConfidenceLevel;
	quote?: string;
	page?: string;
	gradeLevel?: string;
	year?: number;
}

export interface CitationMetadata {
	citations: Citation[];
	generatedAt: string;
	version: string;
}

const SOURCE_DATABASE: CitationSource[] = [
	{
		id: 'caps-math',
		name: 'CAPS Mathematics',
		type: 'curriculum',
		description: 'National Curriculum and Assessment Policy Statement for Mathematics',
	},
	{
		id: 'caps-science',
		name: 'CAPS Physical Sciences',
		type: 'curriculum',
		description: 'National Curriculum for Physical Sciences',
	},
	{
		id: 'caps-life',
		name: 'CAPS Life Sciences',
		type: 'curriculum',
		description: 'National Curriculum for Life Sciences',
	},
	{
		id: 'nsc-papers',
		name: 'NSC Past Examination Papers',
		type: 'past-paper',
		description: 'Previous years NSC examination papers and memos',
	},
	{
		id: 'sg-mathematics',
		name: 'Study Guide: Mathematics',
		type: 'textbook',
		description: 'Mathematics study guide aligned with NSC curriculum',
	},
	{
		id: 'sg-physics',
		name: 'Study Guide: Physics',
		type: 'textbook',
		description: 'Physics study guide aligned with NSC curriculum',
	},
	{
		id: 'sg-chemistry',
		name: 'Study Guide: Chemistry',
		type: 'textbook',
		description: 'Chemistry study guide aligned with NSC curriculum',
	},
];

export { SOURCE_DATABASE };

export function getSourceById(id: string): CitationSource | undefined {
	return SOURCE_DATABASE.find((s) => s.id === id);
}

export function getSourcesByType(type: SourceType): CitationSource[] {
	return SOURCE_DATABASE.filter((s) => s.type === type);
}

export function getConfidenceLevel(confidence: number): ConfidenceLevel {
	if (confidence >= 0.8) return 'high';
	if (confidence >= 0.5) return 'medium';
	return 'low';
}

export function getConfidenceColor(level: ConfidenceLevel): string {
	switch (level) {
		case 'high':
			return 'text-green-600 dark:text-green-400';
		case 'medium':
			return 'text-amber-600 dark:text-amber-400';
		case 'low':
			return 'text-red-600 dark:text-red-400';
	}
}

export function getConfidenceBgColor(level: ConfidenceLevel): string {
	switch (level) {
		case 'high':
			return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800';
		case 'medium':
			return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
		case 'low':
			return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
	}
}

export function getSourceTypeIcon(type: SourceType): string {
	switch (type) {
		case 'textbook':
			return 'book';
		case 'past-paper':
			return 'file-text';
		case 'curriculum':
			return 'graduation-cap';
		case 'ai-generated':
			return 'sparkles';
	}
}

export function getSourceTypeColor(type: SourceType): string {
	switch (type) {
		case 'textbook':
			return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
		case 'past-paper':
			return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
		case 'curriculum':
			return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
		case 'ai-generated':
			return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800';
	}
}

export function findCurriculumTopic(
	subject: string | null,
	topic: string
): { subjectId: string; topicId: string; topicName: string } | null {
	if (!subject) return null;

	const subjectLower = subject.toLowerCase();
	const topicLower = topic.toLowerCase();

	const matchedSubject = CURRICULUM_DATA.find(
		(s) =>
			s.name.toLowerCase() === subjectLower ||
			s.id.toLowerCase() === subjectLower ||
			s.name.toLowerCase().includes(subjectLower) ||
			subjectLower.includes(s.name.toLowerCase())
	);

	if (!matchedSubject) return null;

	const matchedTopic = matchedSubject.topics.find(
		(t) => t.name.toLowerCase().includes(topicLower) || topicLower.includes(t.name.toLowerCase())
	);

	if (matchedTopic) {
		return {
			subjectId: matchedSubject.id,
			topicId: matchedTopic.id,
			topicName: matchedTopic.name,
		};
	}

	return {
		subjectId: matchedSubject.id,
		topicId: matchedSubject.topics[0]?.id || '',
		topicName: matchedSubject.topics[0]?.name || '',
	};
}

export function createCitation(source: CitationSource, options: Partial<Citation> = {}): Citation {
	const confidence = options.confidence ?? 0.7;
	return {
		id: `cite-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
		source,
		topic: options.topic,
		subtopic: options.subtopic,
		confidence,
		confidenceLevel: getConfidenceLevel(confidence),
		quote: options.quote,
		page: options.page,
		gradeLevel: options.gradeLevel,
		year: options.year,
	};
}

export function formatCitationForDisplay(citation: Citation): string {
	const parts: string[] = [];

	if (citation.source.name) {
		parts.push(citation.source.name);
	}

	if (citation.topic) {
		parts.push(citation.topic);
	}

	if (citation.page) {
		parts.push(`p. ${citation.page}`);
	}

	return parts.join(' - ');
}

export function extractCitationsFromJson(jsonStr: string): {
	citations: Citation[];
	cleanText: string;
} {
	try {
		const jsonMatch = jsonStr.match(/```json\s*([\s\S]*?)\s*```|(\{[\s\S]*\})/);
		if (!jsonMatch) {
			return { citations: [], cleanText: jsonStr };
		}

		const jsonContent = jsonMatch[1] || jsonMatch[2];
		const parsed = JSON.parse(jsonContent);

		if (parsed.citations && Array.isArray(parsed.citations)) {
			const citations: Citation[] = parsed.citations.map((c: Partial<Citation>) => {
				const source =
					typeof c.source === 'string'
						? getSourceById(c.source) || {
								id: 'unknown',
								name: c.source,
								type: 'ai-generated' as SourceType,
							}
						: (c.source as CitationSource);

				return createCitation(source, {
					confidence: c.confidence,
					topic: c.topic,
					subtopic: c.subtopic,
					quote: c.quote,
					page: c.page,
					gradeLevel: c.gradeLevel,
					year: c.year,
				});
			});

			const cleanText = jsonStr.replace(/```json\s*[\s\S]*?\s*```/, '').trim();
			return { citations, cleanText };
		}

		return { citations: [], cleanText: jsonStr };
	} catch {
		return { citations: [], cleanText: jsonStr };
	}
}

export function parseInlineCitations(text: string): {
	cleanText: string;
	inlineCitations: Citation[];
} {
	const inlineCitations: Citation[] = [];
	const citationPattern = /\[cite:([^\]]+)\]/g;

	let cleanText = text;

	for (const match of text.matchAll(citationPattern)) {
		if (!match || !match[1]) continue;
		const citationData = match[1];
		try {
			const data: {
				sourceId: string;
				sourceName?: string;
				sourceType?: SourceType;
				confidence?: number;
				topic?: string;
				subtopic?: string;
			} = JSON.parse(decodeURIComponent(citationData));
			const source = getSourceById(data.sourceId) || {
				id: data.sourceId,
				name: data.sourceName || 'Unknown Source',
				type: (data.sourceType as SourceType) || 'ai-generated',
			};

			inlineCitations.push(
				createCitation(source, {
					confidence: data.confidence,
					topic: data.topic,
					subtopic: data.subtopic,
				})
			);
		} catch {
			// Skip malformed citation
		}
	}

	cleanText = text.replace(citationPattern, '');
	return { cleanText, inlineCitations };
}

export function createInlineCitationMarker(citation: Citation): string {
	const data = {
		sourceId: citation.source.id,
		sourceName: citation.source.name,
		sourceType: citation.source.type,
		confidence: citation.confidence,
		topic: citation.topic,
		subtopic: citation.subtopic,
	};

	return `[cite:${encodeURIComponent(JSON.stringify(data))}]`;
}

export function sortCitationsByConfidence(citations: Citation[]): Citation[] {
	return [...citations].sort((a, b) => b.confidence - a.confidence);
}

export function filterCitationsByLevel(citations: Citation[], level: ConfidenceLevel): Citation[] {
	return citations.filter((c) => c.confidenceLevel === level);
}

export function getCitationSummary(citations: Citation[]): {
	total: number;
	byType: Record<SourceType, number>;
	byConfidence: Record<ConfidenceLevel, number>;
} {
	const summary = {
		total: citations.length,
		byType: {
			textbook: 0,
			'past-paper': 0,
			curriculum: 0,
			'ai-generated': 0,
		} as Record<SourceType, number>,
		byConfidence: {
			high: 0,
			medium: 0,
			low: 0,
		} as Record<ConfidenceLevel, number>,
	};

	for (const citation of citations) {
		summary.byType[citation.source.type]++;
		summary.byConfidence[citation.confidenceLevel]++;
	}

	return summary;
}
