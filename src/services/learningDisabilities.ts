/**
 * Learning Disabilities Accommodations Service
 *
 * Handles learning disability support with:
 * - Learning profile awareness (dyslexia, ADHD, dyscalculia)
 * - Disability-aware difficulty adjustment
 * - Specialized accommodations (extended time, simplified language, visual aids)
 * - Adaptive pacing based on learning profile
 * - UI adjustments for accessibility
 */

'use server';

import { eq } from 'drizzle-orm';
import { boolean, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { dbManagerV2 } from '@/lib/db/database-manager-v2';
import { logger } from '@/lib/logger';

const log = logger.createLogger('LearningDisabilities');

// Types
export type LearningDisabilityType =
	| 'none'
	| 'dyslexia'
	| 'adhd'
	| 'dyscalculia'
	| 'autism_spectrum'
	| 'other';

export interface LearningProfile {
	userId: string;
	disabilityType: LearningDisabilityType;
	dyslexiaSupport: boolean;
	adhdSupport: boolean;
	dyscalculiaSupport: boolean;
	extendedTime: boolean;
	simplifiedLanguage: boolean;
	visualAids: boolean;
	audioSupport: boolean;
	chunkedContent: boolean;
	frequentBreaks: boolean;
	reducedDistractions: boolean;
	updatedAt: Date;
}

export interface AccommodationSettings {
	extendedTimeMultiplier: number; // 1.0 = normal, 1.5 = 50% extra, 2.0 = double time
	questionComplexityReduction: boolean;
	hintFrequency: 'low' | 'medium' | 'high' | 'very-high';
	visualAidEnabled: boolean;
	textToSpeech: boolean;
	simplifiedInstructions: boolean;
	breakReminders: boolean;
	breakFrequencyMinutes: number;
	focusMode: boolean;
	distractionReduction: boolean;
}

export interface DisabilityAccommodations {
	learningProfile: LearningProfile;
	accommodations: AccommodationSettings;
	uiAdjustments: UIAdjustments;
}

export interface UIAdjustments {
	fontSize: string;
	lineHeight: string;
	letterSpacing: string;
	wordSpacing: string;
	highContrast: boolean;
	dyslexiaFriendlyFont: boolean;
	reducedMotion: boolean;
	largerClickTargets: boolean;
	simplifiedNavigation: boolean;
	colorCoding: boolean;
}

// Learning profiles table schema
const learningProfilesTable = pgTable('learning_profiles', {
	userId: text('user_id').primaryKey(),
	disabilityType: varchar('disability_type', { length: 30 }).notNull().default('none'),
	dyslexiaSupport: boolean('dyslexia_support').default(false),
	adhdSupport: boolean('adhd_support').default(false),
	dyscalculiaSupport: boolean('dyscalculia_support').default(false),
	extendedTime: boolean('extended_time').default(false),
	simplifiedLanguage: boolean('simplified_language').default(false),
	visualAids: boolean('visual_aids').default(false),
	audioSupport: boolean('audio_support').default(false),
	chunkedContent: boolean('chunked_content').default(false),
	frequentBreaks: boolean('frequent_breaks').default(false),
	reducedDistractions: boolean('reduced_distractions').default(false),
	updatedAt: timestamp('updated_at').defaultNow(),
});

/**
 * Get learning profile for a student
 */
export async function getLearningProfile(userId: string): Promise<LearningProfile | null> {
	const db = await dbManagerV2.getDb();
	if (!db) {
		return null;
	}

	try {
		// Check if table exists
		const tableExists = await checkTableExists('learning_profiles');
		if (!tableExists) {
			return null;
		}

		const [profile] = await db
			.select()
			.from(learningProfilesTable)
			.where(eq(learningProfilesTable.userId, userId));

		if (!profile) {
			return null;
		}

		return {
			userId: profile.userId,
			disabilityType: (profile.disabilityType as LearningDisabilityType) || 'none',
			dyslexiaSupport: profile.dyslexiaSupport || false,
			adhdSupport: profile.adhdSupport || false,
			dyscalculiaSupport: profile.dyscalculiaSupport || false,
			extendedTime: profile.extendedTime || false,
			simplifiedLanguage: profile.simplifiedLanguage || false,
			visualAids: profile.visualAids || false,
			audioSupport: profile.audioSupport || false,
			chunkedContent: profile.chunkedContent || false,
			frequentBreaks: profile.frequentBreaks || false,
			reducedDistractions: profile.reducedDistractions || false,
			updatedAt: profile.updatedAt || new Date(),
		};
	} catch (error) {
		log.warn('Failed to get learning profile (non-critical)', { userId, error });
		return null;
	}
}

/**
 * Update learning profile
 */
export async function updateLearningProfile(
	userId: string,
	profile: Partial<LearningProfile>
): Promise<LearningProfile> {
	const db = await dbManagerV2.getDb();
	if (!db) {
		throw new Error('Database not available');
	}

	try {
		const now = new Date();

		// Upsert learning profile
		await db
			.insert(learningProfilesTable)
			.values({
				userId,
				disabilityType: profile.disabilityType || 'none',
				dyslexiaSupport: profile.dyslexiaSupport || false,
				adhdSupport: profile.adhdSupport || false,
				dyscalculiaSupport: profile.dyscalculiaSupport || false,
				extendedTime: profile.extendedTime || false,
				simplifiedLanguage: profile.simplifiedLanguage || false,
				visualAids: profile.visualAids || false,
				audioSupport: profile.audioSupport || false,
				chunkedContent: profile.chunkedContent || false,
				frequentBreaks: profile.frequentBreaks || false,
				reducedDistractions: profile.reducedDistractions || false,
				updatedAt: now,
			})
			.onConflictDoUpdate({
				target: learningProfilesTable.userId,
				set: {
					disabilityType: profile.disabilityType,
					dyslexiaSupport: profile.dyslexiaSupport,
					adhdSupport: profile.adhdSupport,
					dyscalculiaSupport: profile.dyscalculiaSupport,
					extendedTime: profile.extendedTime,
					simplifiedLanguage: profile.simplifiedLanguage,
					visualAids: profile.visualAids,
					audioSupport: profile.audioSupport,
					chunkedContent: profile.chunkedContent,
					frequentBreaks: profile.frequentBreaks,
					reducedDistractions: profile.reducedDistractions,
					updatedAt: now,
				},
			});

		log.info('Learning profile updated', {
			userId,
			disabilityType: profile.disabilityType,
		});

		return {
			userId,
			disabilityType: profile.disabilityType || 'none',
			dyslexiaSupport: profile.dyslexiaSupport || false,
			adhdSupport: profile.adhdSupport || false,
			dyscalculiaSupport: profile.dyscalculiaSupport || false,
			extendedTime: profile.extendedTime || false,
			simplifiedLanguage: profile.simplifiedLanguage || false,
			visualAids: profile.visualAids || false,
			audioSupport: profile.audioSupport || false,
			chunkedContent: profile.chunkedContent || false,
			frequentBreaks: profile.frequentBreaks || false,
			reducedDistractions: profile.reducedDistractions || false,
			updatedAt: now,
		};
	} catch (error) {
		log.error('Failed to update learning profile', { userId, error });
		throw error;
	}
}

/**
 * Get accommodations based on learning disability
 */
export async function getDisabilityAccommodations(
	userId: string
): Promise<DisabilityAccommodations> {
	const db = await dbManagerV2.getDb();
	if (!db) {
		throw new Error('Database not available');
	}

	const learningProfile = await getLearningProfile(userId);

	if (!learningProfile || learningProfile.disabilityType === 'none') {
		// Return default accommodations
		return {
			learningProfile: {
				userId,
				disabilityType: 'none',
				dyslexiaSupport: false,
				adhdSupport: false,
				dyscalculiaSupport: false,
				extendedTime: false,
				simplifiedLanguage: false,
				visualAids: false,
				audioSupport: false,
				chunkedContent: false,
				frequentBreaks: false,
				reducedDistractions: false,
				updatedAt: new Date(),
			},
			accommodations: getDefaultAccommodations(),
			uiAdjustments: getDefaultUIAdjustments(),
		};
	}

	// Generate accommodations based on disability type
	const accommodations = generateAccommodations(learningProfile);
	const uiAdjustments = generateUIAdjustments(learningProfile);

	return {
		learningProfile,
		accommodations,
		uiAdjustments,
	};
}

/**
 * Generate accommodations based on learning profile
 */
function generateAccommodations(profile: LearningProfile): AccommodationSettings {
	const base: AccommodationSettings = {
		extendedTimeMultiplier: 1.0,
		questionComplexityReduction: false,
		hintFrequency: 'medium',
		visualAidEnabled: false,
		textToSpeech: false,
		simplifiedInstructions: false,
		breakReminders: false,
		breakFrequencyMinutes: 30,
		focusMode: false,
		distractionReduction: false,
	};

	switch (profile.disabilityType) {
		case 'dyslexia':
			return {
				...base,
				extendedTimeMultiplier: 1.5,
				simplifiedInstructions: true,
				textToSpeech: true,
				visualAidEnabled: true,
				hintFrequency: 'high',
				chunkedContent: true,
			};

		case 'adhd':
			return {
				...base,
				extendedTimeMultiplier: 1.5,
				breakReminders: true,
				breakFrequencyMinutes: 15,
				focusMode: true,
				distractionReduction: true,
				hintFrequency: 'high',
				chunkedContent: true,
			};

		case 'dyscalculia':
			return {
				...base,
				extendedTimeMultiplier: 2.0,
				questionComplexityReduction: true,
				visualAidEnabled: true,
				hintFrequency: 'very-high',
				simplifiedInstructions: true,
			};

		case 'autism_spectrum':
			return {
				...base,
				extendedTimeMultiplier: 1.5,
				simplifiedInstructions: true,
				distractionReduction: true,
				focusMode: true,
				hintFrequency: 'medium',
				breakReminders: true,
				breakFrequencyMinutes: 20,
			};

		default:
			return base;
	}
}

/**
 * Generate UI adjustments based on learning profile
 */
function generateUIAdjustments(profile: LearningProfile): UIAdjustments {
	const base: UIAdjustments = {
		fontSize: '1rem',
		lineHeight: '1.5',
		letterSpacing: 'normal',
		wordSpacing: 'normal',
		highContrast: false,
		dyslexiaFriendlyFont: false,
		reducedMotion: false,
		largerClickTargets: false,
		simplifiedNavigation: false,
		colorCoding: false,
	};

	switch (profile.disabilityType) {
		case 'dyslexia':
			return {
				...base,
				fontSize: '1.125rem',
				lineHeight: '1.8',
				letterSpacing: '0.05em',
				wordSpacing: '0.15em',
				dyslexiaFriendlyFont: true,
				highContrast: true,
			};

		case 'adhd':
			return {
				...base,
				largerClickTargets: true,
				simplifiedNavigation: true,
				reducedMotion: true,
				colorCoding: true,
			};

		case 'dyscalculia':
			return {
				...base,
				fontSize: '1.125rem',
				visualAids: true,
				colorCoding: true,
			};

		case 'autism_spectrum':
			return {
				...base,
				reducedMotion: true,
				simplifiedNavigation: true,
				largerClickTargets: true,
				highContrast: false, // Can be overstimulating
				colorCoding: true,
			};

		default:
			return base;
	}
}

/**
 * Get default accommodations
 */
function getDefaultAccommodations(): AccommodationSettings {
	return {
		extendedTimeMultiplier: 1.0,
		questionComplexityReduction: false,
		hintFrequency: 'medium',
		visualAidEnabled: false,
		textToSpeech: false,
		simplifiedInstructions: false,
		breakReminders: false,
		breakFrequencyMinutes: 30,
		focusMode: false,
		distractionReduction: false,
	};
}

/**
 * Get default UI adjustments
 */
function getDefaultUIAdjustments(): UIAdjustments {
	return {
		fontSize: '1rem',
		lineHeight: '1.5',
		letterSpacing: 'normal',
		wordSpacing: 'normal',
		highContrast: false,
		dyslexiaFriendlyFont: false,
		reducedMotion: false,
		largerClickTargets: false,
		simplifiedNavigation: false,
		colorCoding: false,
	};
}

/**
 * Adjust quiz time based on accommodations
 */
export function getAdjustedQuizTime(
	baseTimeMinutes: number,
	accommodations: AccommodationSettings
): number {
	return Math.ceil(baseTimeMinutes * accommodations.extendedTimeMultiplier);
}

/**
 * Check if user qualifies for disability accommodations
 * This would typically be set by user or admin
 */
export async function initializeLearningProfileTable(): Promise<void> {
	const db = await dbManagerV2.getDb();
	if (!db) {
		log.warn('Database not available - skipping learning profile initialization');
		return;
	}

	try {
		await db.execute(`
      CREATE TABLE IF NOT EXISTS learning_profiles (
        user_id TEXT PRIMARY KEY,
        disability_type VARCHAR(30) NOT NULL DEFAULT 'none',
        dyslexia_support BOOLEAN DEFAULT false,
        adhd_support BOOLEAN DEFAULT false,
        dyscalculia_support BOOLEAN DEFAULT false,
        extended_time BOOLEAN DEFAULT false,
        simplified_language BOOLEAN DEFAULT false,
        visual_aids BOOLEAN DEFAULT false,
        audio_support BOOLEAN DEFAULT false,
        chunked_content BOOLEAN DEFAULT false,
        frequent_breaks BOOLEAN DEFAULT false,
        reduced_distractions BOOLEAN DEFAULT false,
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

		log.info('Learning profiles table initialized');
	} catch (error) {
		log.error('Failed to initialize learning profiles table', { error });
	}
}

/**
 * Check if table exists
 */
async function checkTableExists(tableName: string): Promise<boolean> {
	const db = await dbManagerV2.getDb();
	if (!db) {
		return false;
	}

	try {
		const result = await db.execute(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = '${tableName}'
      );
    `);
		return result[0]?.exists ?? false;
	} catch {
		return false;
	}
}
