import achievementsData from '@/content/achievements.json';
import gamificationConfigData from '@/content/gamification.json';
import subjectsData from '@/content/subjects.json';
import { dbManager } from '../index';
import { achievementDefinitions, gamificationConfig, subjects } from '../schema';

export async function seedCurriculumData() {
	const db = await dbManager.getDb();

	console.log('Seeding subjects from content/subjects.json...');
	for (const subject of subjectsData) {
		await db
			.insert(subjects)
			.values({
				slug: subject.id,
				name: subject.displayName,
				displayName: subject.displayName,
				description: subject.description,
				curriculumCode: subject.curriculumCode,
				emoji: subject.emoji,
				fluentEmoji: subject.fluentEmoji,
				imgSrc: subject.imgSrc ?? null,
				color: subject.color,
				bgColor: subject.bgColor,
				icon: subject.icon,
				fontFamily: subject.fontFamily,
				gradientPrimary: subject.gradientPrimary,
				gradientSecondary: subject.gradientSecondary,
				gradientAccent: subject.gradientAccent,
				isSupported: subject.isSupported,
				displayOrder: subject.displayOrder,
				isActive: subject.isActive,
			})
			.onConflictDoUpdate({
				target: subjects.slug,
				set: {
					name: subject.displayName,
					displayName: subject.displayName,
					description: subject.description,
					curriculumCode: subject.curriculumCode,
					emoji: subject.emoji,
					fluentEmoji: subject.fluentEmoji,
					imgSrc: subject.imgSrc ?? null,
					color: subject.color,
					bgColor: subject.bgColor,
					icon: subject.icon,
					fontFamily: subject.fontFamily,
					gradientPrimary: subject.gradientPrimary,
					gradientSecondary: subject.gradientSecondary,
					gradientAccent: subject.gradientAccent,
					isSupported: subject.isSupported,
					displayOrder: subject.displayOrder,
					isActive: subject.isActive,
					updatedAt: new Date(),
				},
			});
	}
	console.log(`Seeded ${subjectsData.length} subjects`);

	console.log('Seeding gamification config from content/gamification.json...');
	const configEntries = Object.entries(gamificationConfigData.config);
	for (const [key, config] of configEntries) {
		await db
			.insert(gamificationConfig)
			.values({ key, value: config.value, description: config.description })
			.onConflictDoUpdate({
				target: gamificationConfig.key,
				set: { value: config.value, description: config.description },
			});
	}
	console.log(`Seeded ${configEntries.length} gamification configs`);

	console.log('Seeding achievement definitions from content/achievements.json...');
	for (const achievement of achievementsData) {
		await db
			.insert(achievementDefinitions)
			.values({
				id: achievement.id,
				name: achievement.name,
				description: achievement.description,
				icon: achievement.icon,
				iconBg: achievement.iconBg,
				category: achievement.category,
				requirementType: achievement.requirementType,
				requirementValue: achievement.requirementValue,
				requirementSubjectId: achievement.requirementSubjectId,
				points: achievement.points,
				displayOrder: achievement.displayOrder,
			})
			.onConflictDoUpdate({
				target: achievementDefinitions.id,
				set: {
					name: achievement.name,
					description: achievement.description,
					icon: achievement.icon,
					iconBg: achievement.iconBg,
					category: achievement.category,
					requirementType: achievement.requirementType,
					requirementValue: achievement.requirementValue,
					requirementSubjectId: achievement.requirementSubjectId,
					points: achievement.points,
					displayOrder: achievement.displayOrder,
				},
			});
	}
	console.log(`Seeded ${achievementsData.length} achievements`);

	console.log('✅ Curriculum data seeding complete (from content/ directory)');
}
