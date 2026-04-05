import type {
	GeneratedAchievement,
	GeneratedQuizResult,
	GeneratedStudySession,
	GeneratedTopicMastery,
	GeneratedUser,
} from './generator';

export interface EnrichmentConfig {
	enableValidation: boolean;
	enableDeduplication: boolean;
	enableConsistency: boolean;
	enableTimingEnrichment: boolean;
}

export interface ValidationResult {
	valid: boolean;
	errors: ValidationError[];
	warnings: ValidationWarning[];
}

export interface ValidationError {
	entity: string;
	id: string;
	field: string;
	message: string;
	severity: 'error';
}

export interface ValidationWarning {
	entity: string;
	id: string;
	field: string;
	message: string;
	severity: 'warning';
}

export interface EnrichmentStats {
	totalProcessed: number;
	validationErrors: number;
	validationWarnings: number;
	duplicatesRemoved: number;
	consistencyFixed: number;
	timingEnriched: number;
}

const DEFAULT_CONFIG: EnrichmentConfig = {
	enableValidation: true,
	enableDeduplication: true,
	enableConsistency: true,
	enableTimingEnrichment: true,
};

// ============================================
// Validation Functions
// ============================================

function validateUser(user: GeneratedUser): ValidationResult {
	const errors: ValidationError[] = [];
	const warnings: ValidationWarning[] = [];

	if (!user.email || !user.email.includes('@')) {
		errors.push({
			entity: 'user',
			id: user.id,
			field: 'email',
			message: 'Invalid email format',
			severity: 'error',
		});
	}

	if (!user.name || user.name.length < 2) {
		errors.push({
			entity: 'user',
			id: user.id,
			field: 'name',
			message: 'Name too short',
			severity: 'error',
		});
	}

	if (user.createdAt > new Date()) {
		warnings.push({
			entity: 'user',
			id: user.id,
			field: 'createdAt',
			message: 'Created date is in the future',
			severity: 'warning',
		});
	}

	return { valid: errors.length === 0, errors, warnings };
}

function validateQuizResult(result: GeneratedQuizResult): ValidationResult {
	const errors: ValidationError[] = [];
	const warnings: ValidationWarning[] = [];

	if (result.percentage < 0 || result.percentage > 100) {
		errors.push({
			entity: 'quizResult',
			id: result.id,
			field: 'percentage',
			message: `Invalid percentage: ${result.percentage}`,
			severity: 'error',
		});
	}

	if (result.score > result.totalQuestions) {
		errors.push({
			entity: 'quizResult',
			id: result.id,
			field: 'score',
			message: `Score (${result.score}) exceeds total questions (${result.totalQuestions})`,
			severity: 'error',
		});
	}

	if (result.timeTaken < 0) {
		warnings.push({
			entity: 'quizResult',
			id: result.id,
			field: 'timeTaken',
			message: 'Negative time taken',
			severity: 'warning',
		});
	}

	return { valid: errors.length === 0, errors, warnings };
}

function validateStudySession(session: GeneratedStudySession): ValidationResult {
	const errors: ValidationError[] = [];
	const warnings: ValidationWarning[] = [];

	if (session.completedAt && session.completedAt < session.startedAt) {
		errors.push({
			entity: 'studySession',
			id: session.id,
			field: 'completedAt',
			message: 'Completed time is before started time',
			severity: 'error',
		});
	}

	if (session.durationMinutes < 0) {
		errors.push({
			entity: 'studySession',
			id: session.id,
			field: 'durationMinutes',
			message: 'Negative duration',
			severity: 'error',
		});
	}

	return { valid: errors.length === 0, errors, warnings };
}

function validateTopicMastery(mastery: GeneratedTopicMastery): ValidationResult {
	const errors: ValidationError[] = [];
	const warnings: ValidationWarning[] = [];

	if (mastery.masteryLevel < 0 || mastery.masteryLevel > 100) {
		errors.push({
			entity: 'topicMastery',
			id: mastery.id,
			field: 'masteryLevel',
			message: `Invalid mastery level: ${mastery.masteryLevel}`,
			severity: 'error',
		});
	}

	if (mastery.questionsCorrect > mastery.questionsAttempted) {
		errors.push({
			entity: 'topicMastery',
			id: mastery.id,
			field: 'questionsCorrect',
			message: 'Correct answers exceed attempts',
			severity: 'error',
		});
	}

	return { valid: errors.length === 0, errors, warnings };
}

// ============================================
// Deduplication
// ============================================

function deduplicateUsers(users: GeneratedUser[]): GeneratedUser[] {
	const seen = new Set<string>();
	return users.filter((user) => {
		const key = `${user.email.toLowerCase()}-${user.name.toLowerCase()}`;
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});
}

function deduplicateQuizResults(results: GeneratedQuizResult[]): GeneratedQuizResult[] {
	const seen = new Set<string>();
	return results.filter((result) => {
		const key = `${result.userId}-${result.subjectSlug}-${result.completedAt.getTime()}`;
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});
}

// ============================================
// Consistency Fixing
// ============================================

function fixQuizResultConsistency(results: GeneratedQuizResult[]): GeneratedQuizResult[] {
	return results.map((result) => {
		const calculated = Math.round((result.totalQuestions * result.percentage) / 100);
		if (result.score !== calculated) {
			return { ...result, score: calculated };
		}
		return result;
	});
}

function fixMasteryConsistency(masteries: GeneratedTopicMastery[]): GeneratedTopicMastery[] {
	return masteries.map((mastery) => {
		const calculatedCorrect = Math.round((mastery.questionsAttempted * mastery.masteryLevel) / 100);
		if (mastery.questionsCorrect !== calculatedCorrect) {
			return { ...mastery, questionsCorrect: calculatedCorrect };
		}
		return mastery;
	});
}

// ============================================
// Timing Enrichment (per UI/UX Wiki timing-under-300ms)
// ============================================

interface TimingMetadata {
	animationDuration: number;
	timingCategory: 'press-hover' | 'small-state' | 'user-initiated';
	springConfig?: { stiffness: number; damping: number; mass: number };
}

function enrichTiming(data: {
	quizResults?: GeneratedQuizResult[];
	studySessions?: GeneratedStudySession[];
}): {
	quizResults?: GeneratedQuizResult[] & { timingMetadata?: TimingMetadata };
	studySessions?: GeneratedStudySession[] & { timingMetadata?: TimingMetadata };
} {
	const result: {
		quizResults?: (GeneratedQuizResult & { timingMetadata?: TimingMetadata })[];
		studySessions?: (GeneratedStudySession & { timingMetadata?: TimingMetadata })[];
	} = {};

	if (data.quizResults) {
		result.quizResults = data.quizResults.map((result) => {
			const timingCategory =
				result.percentage >= 80
					? 'press-hover'
					: result.percentage >= 50
						? 'small-state'
						: 'user-initiated';

			const animationDuration =
				timingCategory === 'press-hover' ? 160 : timingCategory === 'small-state' ? 220 : 300;

			return {
				...result,
				timingMetadata: {
					animationDuration,
					timingCategory,
					springConfig:
						timingCategory === 'press-hover' ? { stiffness: 300, damping: 30, mass: 1 } : undefined,
				},
			};
		});
	}

	if (data.studySessions) {
		result.studySessions = data.studySessions.map((session) => ({
			...session,
			timingMetadata: {
				animationDuration: 220,
				timingCategory: 'small-state',
			},
		}));
	}

	return result;
}

// ============================================
// Main Pipeline
// ============================================

export class DataEnrichmentPipeline {
	private config: EnrichmentConfig;
	private stats: EnrichmentStats;

	constructor(config: Partial<EnrichmentConfig> = {}) {
		this.config = { ...DEFAULT_CONFIG, ...config };
		this.stats = this.initStats();
	}

	private initStats(): EnrichmentStats {
		return {
			totalProcessed: 0,
			validationErrors: 0,
			validationWarnings: 0,
			duplicatesRemoved: 0,
			consistencyFixed: 0,
			timingEnriched: 0,
		};
	}

	process(
		data: {
			users: GeneratedUser[];
			quizResults: GeneratedQuizResult[];
			studySessions: GeneratedStudySession[];
			topicMasteries: GeneratedTopicMastery[];
			achievements: GeneratedAchievement[];
		},
		config: Partial<EnrichmentConfig> = {}
	): {
		users: GeneratedUser[];
		quizResults: GeneratedQuizResult[];
		studySessions: GeneratedStudySession[];
		topicMasteries: GeneratedTopicMastery[];
		achievements: GeneratedAchievement[];
		stats: EnrichmentStats;
		validationResults: {
			users: ValidationResult[];
			quizResults: ValidationResult[];
			studySessions: ValidationResult[];
			topicMasteries: ValidationResult[];
		};
	} {
		const finalConfig = { ...this.config, ...config };
		this.stats = this.initStats();

		let users = [...data.users];
		let quizResults = [...data.quizResults];
		let studySessions = [...data.studySessions];
		let topicMasteries = [...data.topicMasteries];
		const achievements = [...data.achievements];

		this.stats.totalProcessed =
			users.length +
			quizResults.length +
			studySessions.length +
			topicMasteries.length +
			achievements.length;

		const validationResults = {
			users: [] as ValidationResult[],
			quizResults: [] as ValidationResult[],
			studySessions: [] as ValidationResult[],
			topicMasteries: [] as ValidationResult[],
		};

		// Validation
		if (finalConfig.enableValidation) {
			users = users.filter((user) => {
				const result = validateUser(user);
				validationResults.users.push(result);
				this.stats.validationErrors += result.errors.length;
				this.stats.validationWarnings += result.warnings.length;
				return result.valid;
			});

			quizResults = quizResults.filter((result) => {
				const validation = validateQuizResult(result);
				validationResults.quizResults.push(validation);
				this.stats.validationErrors += validation.errors.length;
				this.stats.validationWarnings += validation.warnings.length;
				return validation.valid;
			});

			studySessions = studySessions.filter((session) => {
				const validation = validateStudySession(session);
				validationResults.studySessions.push(validation);
				this.stats.validationErrors += validation.errors.length;
				this.stats.validationWarnings += validation.warnings.length;
				return validation.valid;
			});

			topicMasteries = topicMasteries.filter((mastery) => {
				const validation = validateTopicMastery(mastery);
				validationResults.topicMasteries.push(validation);
				this.stats.validationErrors += validation.errors.length;
				this.stats.validationWarnings += validation.warnings.length;
				return validation.valid;
			});
		}

		// Deduplication
		if (finalConfig.enableDeduplication) {
			const beforeCount = users.length + quizResults.length;
			users = deduplicateUsers(users);
			quizResults = deduplicateQuizResults(quizResults);
			const afterCount = users.length + quizResults.length;
			this.stats.duplicatesRemoved += beforeCount - afterCount;
		}

		// Consistency fixing
		if (finalConfig.enableConsistency) {
			const beforeFix = JSON.stringify(quizResults);
			quizResults = fixQuizResultConsistency(quizResults);
			topicMasteries = fixMasteryConsistency(topicMasteries);

			if (JSON.stringify(quizResults) !== beforeFix) {
				this.stats.consistencyFixed += quizResults.length;
			}
		}

		// Timing enrichment (per UI/UX Wiki)
		if (finalConfig.enableTimingEnrichment) {
			const enriched = enrichTiming({ quizResults, studySessions });
			quizResults = enriched.quizResults ?? quizResults;
			studySessions = enriched.studySessions ?? studySessions;
			this.stats.timingEnriched += quizResults.length + studySessions.length;
		}

		return {
			users,
			quizResults,
			studySessions,
			topicMasteries,
			achievements,
			stats: { ...this.stats },
			validationResults,
		};
	}

	getStats(): EnrichmentStats {
		return { ...this.stats };
	}
}

// ============================================
// Factory
// ============================================

export const createEnrichmentPipeline = (
	config?: Partial<EnrichmentConfig>
): DataEnrichmentPipeline => {
	return new DataEnrichmentPipeline(config);
};
