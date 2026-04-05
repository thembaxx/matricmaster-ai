import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { generateAllMockData } from '@/lib/mock-data/generator';
import { createEnrichmentPipeline } from '@/lib/mock-data/pipeline';

interface CLIOptions {
	format: 'json' | 'csv';
	output: string;
	seed: number;
	userCount: number;
	monthsBack: number;
	intensity: 'low' | 'medium' | 'high';
	validate: boolean;
	includeAnimation: boolean;
}

function parseArgs(): CLIOptions {
	const args = process.argv.slice(2);
	const options: CLIOptions = {
		format: 'json',
		output: './mock-data',
		seed: 42,
		userCount: 100,
		monthsBack: 6,
		intensity: 'high',
		validate: true,
		includeAnimation: false,
	};

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		switch (arg) {
			case '--format':
			case '-f':
				options.format = args[++i] as 'json' | 'csv';
				break;
			case '--output':
			case '-o':
				options.output = args[++i];
				break;
			case '--seed':
				options.seed = Number.parseInt(args[++i], 10);
				break;
			case '--users':
				options.userCount = Number.parseInt(args[++i], 10);
				break;
			case '--months':
				options.monthsBack = Number.parseInt(args[++i], 10);
				break;
			case '--intensity':
				options.intensity = args[++i] as 'low' | 'medium' | 'high';
				break;
			case '--no-validate':
				options.validate = false;
				break;
			case '--include-animation':
				options.includeAnimation = true;
				break;
			case '--help':
			case '-h':
				printHelp();
				process.exit(0);
		}
	}

	return options;
}

function printHelp() {
	console.log(`
Mock Data Export Tool
======================

Usage: bun run mock:export [options]

Options:
  --format, -f <json|csv>    Output format (default: json)
  --output, -o <path>       Output directory (default: ./mock-data)
  --seed <number>           Random seed for reproducibility (default: 42)
  --users <number>          Number of users to generate (default: 100)
  --months <number>         Months of historical data (default: 6)
  --intensity <level>       Activity intensity: low, medium, high (default: high)
  --no-validate            Skip data validation and enrichment
  --include-animation       Include animation timing metadata per UI/UX Wiki
  --help, -h               Show this help message

Examples:
  bun run mock:export
  bun run mock:export --format csv --output ./data --users 1000
  bun run mock:export --seed 123 --months 12 --include-animation
  `);
}

async function exportToJSON(data: any, outputPath: string, includeAnimation: boolean) {
	if (!existsSync(outputPath)) {
		mkdirSync(outputPath, { recursive: true });
	}

	const exportData = {
		version: '1.0',
		generated: new Date().toISOString(),
		config: {
			seed: data.config?.seed ?? 42,
			userCount: data.users?.length ?? 0,
			includeAnimation,
		},
		entities: {
			users: data.users,
			quizResults: data.quizResults,
			studySessions: data.studySessions,
			topicMasteries: data.topicMasteries,
			achievements: data.achievements,
		},
	};

	writeFileSync(join(outputPath, 'mock-data.json'), JSON.stringify(exportData, null, 2));
	console.log(`✅ Exported JSON to ${join(outputPath, 'mock-data.json')}`);
}

async function exportToCSV(data: any, outputPath: string) {
	if (!existsSync(outputPath)) {
		mkdirSync(outputPath, { recursive: true });
	}

	// Export users
	if (data.users?.length > 0) {
		const userHeaders = ['id', 'email', 'name', 'createdAt'];
		const userRows = data.users.map((u: any) => userHeaders.map((h) => u[h] ?? '').join(','));
		writeFileSync(join(outputPath, 'users.csv'), [userHeaders.join(','), ...userRows].join('\n'));
		console.log(`✅ Exported users to ${join(outputPath, 'users.csv')}`);
	}

	// Export quiz results
	if (data.quizResults?.length > 0) {
		const quizHeaders = [
			'id',
			'userId',
			'subjectSlug',
			'topic',
			'score',
			'percentage',
			'timeTaken',
			'completedAt',
		];
		const quizRows = data.quizResults.map((q: any) => quizHeaders.map((h) => q[h] ?? '').join(','));
		writeFileSync(
			join(outputPath, 'quiz-results.csv'),
			[quizHeaders.join(','), ...quizRows].join('\n')
		);
		console.log(`✅ Exported quiz results to ${join(outputPath, 'quiz-results.csv')}`);
	}

	// Export achievements
	if (data.achievements?.length > 0) {
		const achievementHeaders = ['id', 'userId', 'achievementId', 'title', 'unlockedAt'];
		const achievementRows = data.achievements.map((a: any) =>
			achievementHeaders.map((h) => a[h] ?? '').join(',')
		);
		writeFileSync(
			join(outputPath, 'achievements.csv'),
			[achievementHeaders.join(','), ...achievementRows].join('\n')
		);
		console.log(`✅ Exported achievements to ${join(outputPath, 'achievements.csv')}`);
	}
}

async function main() {
	console.log('🎲 Mock Data Export Tool');
	console.log('========================\n');

	const options = parseArgs();

	console.log('Configuration:');
	console.log(`  - Seed: ${options.seed}`);
	console.log(`  - Users: ${options.userCount}`);
	console.log(`  - Months: ${options.monthsBack}`);
	console.log(`  - Intensity: ${options.intensity}`);
	console.log(`  - Format: ${options.format}`);
	console.log(`  - Validate: ${options.validate}`);
	console.log(`  - Animation: ${options.includeAnimation}`);
	console.log('');

	// Generate mock data
	console.log('📊 Generating mock data...');
	const rawData = await generateAllMockData({
		seed: options.seed,
		userCount: options.userCount,
		monthsBack: options.monthsBack,
		intensity: options.intensity,
	});
	console.log(`   Generated ${rawData.users.length} users`);
	console.log(`   Generated ${rawData.quizResults.length} quiz results`);
	console.log(`   Generated ${rawData.studySessions.length} study sessions`);
	console.log(`   Generated ${rawData.topicMasteries.length} topic masteries`);
	console.log(`   Generated ${rawData.achievements.length} achievements`);

	let finalData = rawData;

	// Enrich and validate
	if (options.validate) {
		console.log('\n🔧 Running data enrichment pipeline...');
		const pipeline = createEnrichmentPipeline({
			enableValidation: true,
			enableDeduplication: true,
			enableConsistency: true,
			enableTimingEnrichment: options.includeAnimation,
		});

		finalData = pipeline.process(rawData);
		const stats = pipeline.getStats();

		console.log(`   - Processed: ${stats.totalProcessed}`);
		console.log(`   - Validation errors: ${stats.validationErrors}`);
		console.log(`   - Validation warnings: ${stats.validationWarnings}`);
		console.log(`   - Duplicates removed: ${stats.duplicatesRemoved}`);
		console.log(`   - Consistency fixed: ${stats.consistencyFixed}`);
		console.log(`   - Timing enriched: ${stats.timingEnriched}`);
	}

	// Export
	console.log('\n💾 Exporting data...');
	if (options.format === 'json') {
		await exportToJSON(finalData, options.output, options.includeAnimation);
	} else {
		await exportToCSV(finalData, options.output);
	}

	console.log('\n✨ Done! Mock data export complete.');
}

main().catch(console.error);
