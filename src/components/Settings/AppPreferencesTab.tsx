'use client';

import { ChartIcon, RefreshIcon, TargetIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useSettings } from '@/contexts/SettingsContext';
import { useAITutorDifficulty } from '@/hooks/useAITutorDifficulty';
import { DIFFICULTY_ORDER, getDifficultyLabel } from '@/services/adaptive-difficulty';
import { useAdaptiveDifficulty } from '@/stores/useAdaptiveDifficultyStore';

export function AppPreferencesTab() {
	const { dataSaverMode, setDataSaverMode, aiLanguage, setAiLanguage } = useSettings();
	const { currentDifficulty, setDifficulty, resetMetrics, getStats, getPerformanceForLevel } =
		useAdaptiveDifficulty();
	const {
		autoAdjust,
		toggleAutoAdjust,
		effectiveComplexity,
		setComplexityPreference,
		availableComplexities,
	} = useAITutorDifficulty();

	const [showHistory, setShowHistory] = useState(false);
	const [isGenerating, setIsGenerating] = useState(false);

	const stats = getStats();

	const handleResetMetrics = () => {
		resetMetrics();
		toast.success('Difficulty metrics have been reset');
	};

	const performanceHistory = DIFFICULTY_ORDER.map((level) => ({
		level,
		metrics: getPerformanceForLevel(level),
	})).filter((p) => p.metrics.correct > 0 || p.metrics.incorrect > 0);

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<div className="flex justify-between items-start">
						<div>
							<CardTitle>Data Saver Mode</CardTitle>
							<CardDescription>Optimize the app for low-bandwidth connections.</CardDescription>
						</div>
						<Badge variant="outline">South Africa</Badge>
					</div>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<Label>Enable Data Saver</Label>
							<p className="text-sm text-muted-foreground">
								Downgrades video call quality and disables auto-playing AI voice answers to save
								mobile data.
							</p>
						</div>
						<Switch checked={dataSaverMode} onCheckedChange={setDataSaverMode} />
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="flex justify-between items-start">
						<div className="flex items-center gap-2">
							<HugeiconsIcon icon={TargetIcon} className="h-5 w-5" />
							<div>
								<CardTitle>Adaptive Difficulty</CardTitle>
								<CardDescription>
									Automatically adjusts question difficulty based on your performance.
								</CardDescription>
							</div>
						</div>
						<Badge>{getDifficultyLabel(currentDifficulty)}</Badge>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<Label>Auto-Adjust Difficulty</Label>
							<p className="text-sm text-muted-foreground">
								Automatically adjust difficulty based on your answers.
							</p>
						</div>
						<Switch checked={autoAdjust} onCheckedChange={toggleAutoAdjust} />
					</div>

					<div className="space-y-2">
						<Label>Manual Difficulty Override</Label>
						<Select
							value={currentDifficulty}
							onValueChange={(val) => setDifficulty(val as typeof currentDifficulty)}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select difficulty" />
							</SelectTrigger>
							<SelectContent>
								{DIFFICULTY_ORDER.map((level) => (
									<SelectItem key={level} value={level}>
										{getDifficultyLabel(level)}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{!autoAdjust && (
						<div className="space-y-2">
							<Label>Explanation Complexity</Label>
							<Select
								value={effectiveComplexity}
								onValueChange={(val) => setComplexityPreference(val as typeof effectiveComplexity)}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select complexity" />
								</SelectTrigger>
								<SelectContent>
									{availableComplexities.map((c) => (
										<SelectItem key={c.value} value={c.value}>
											{c.label} - {c.description}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					)}

					<div className="grid grid-cols-3 gap-4 pt-2 border-t">
						<div className="text-center">
							<div className="text-xl font-bold">{stats.accuracy}%</div>
							<div className="text-xs text-muted-foreground">Accuracy</div>
						</div>
						<div className="text-center">
							<div className="text-xl font-bold">{stats.totalAnswered}</div>
							<div className="text-xs text-muted-foreground">Answered</div>
						</div>
						<div className="text-center">
							<div className="text-xl font-bold">
								{stats.streakType === 'correct' ? stats.streakCount : 0}
							</div>
							<div className="text-xs text-muted-foreground">Best Streak</div>
						</div>
					</div>

					<div className="flex gap-2 pt-2">
						<Button
							variant="outline"
							onClick={() => setShowHistory(!showHistory)}
							className="flex-1"
						>
							<HugeiconsIcon icon={ChartIcon} className="h-4 w-4 mr-2" />
							{showHistory ? 'Hide' : 'View'} History
						</Button>
						<Button variant="outline" onClick={handleResetMetrics} className="flex-1">
							<HugeiconsIcon icon={RefreshIcon} className="h-4 w-4 mr-2" />
							Reset Metrics
						</Button>
					</div>

					{showHistory && performanceHistory.length > 0 && (
						<div className="border-t pt-4 mt-4">
							<Label className="mb-3 block">Performance by Level</Label>
							<div className="space-y-2">
								{performanceHistory.map((p) => {
									const total = p.metrics.correct + p.metrics.incorrect;
									const accuracy = total > 0 ? Math.round((p.metrics.correct / total) * 100) : 0;
									return (
										<div key={p.level} className="flex items-center justify-between text-sm">
											<span className="capitalize">{getDifficultyLabel(p.level)}</span>
											<div className="flex items-center gap-2">
												<span className="text-muted-foreground">
													{p.metrics.correct}/{total} ({accuracy}%)
												</span>
											</div>
										</div>
									);
								})}
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>AI Language Preference</CardTitle>
					<CardDescription>
						Ensure the AI strictly replies in your preferred language for localized subjects.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col space-y-2">
						<Label>Language Context</Label>
						<Select value={aiLanguage} onValueChange={(val: 'en' | 'af') => setAiLanguage(val)}>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Select language" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="en">English (Default)</SelectItem>
								<SelectItem value="af">Afrikaans</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			<Card className="border-amber-200 dark:border-amber-800">
				<CardHeader>
					<div className="flex justify-between items-start">
						<div className="flex items-center gap-2">
							<HugeiconsIcon icon={TargetIcon} className="h-5 w-5 text-amber-500" />
							<div>
								<CardTitle className="text-amber-700 dark:text-amber-400">Demo Mode</CardTitle>
								<CardDescription>
									Generate mock data to preview the app with realistic activity.
								</CardDescription>
							</div>
						</div>
						<Badge
							variant="outline"
							className="border-amber-500 text-amber-700 dark:text-amber-400"
						>
							Development
						</Badge>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-4 text-sm">
						<p className="text-amber-800 dark:text-amber-300">
							<strong>Note:</strong> This feature generates 100+ users with 6 months of simulated
							activity including quiz results, study sessions, achievements, and social features.
							Best used for demos and testing.
						</p>
					</div>

					<div className="flex flex-col gap-3">
						<Button
							onClick={async () => {
								setIsGenerating(true);
								try {
									const response = await fetch('/api/mock-data/generate', {
										method: 'POST',
										headers: { 'Content-Type': 'application/json' },
										body: JSON.stringify({
											userCount: 100,
											monthsBack: 6,
											intensity: 'high',
										}),
									});
									const result = await response.json();
									if (result.success) {
										toast.success(
											`Generated ${result.usersGenerated} users with ${result.records.quizResults} quiz results!`
										);
									} else {
										toast.error(result.error || 'Generation failed');
									}
								} catch (err) {
									toast.error('Failed to generate mock data');
								} finally {
									setIsGenerating(false);
								}
							}}
							disabled={isGenerating}
							className="w-full bg-amber-600 hover:bg-amber-700"
						>
							{isGenerating ? 'Generating...' : 'Generate Demo Data (100 Users)'}
						</Button>
					</div>

					<div className="text-xs text-muted-foreground text-center">
						This will add data to your database. Run multiple times for more variety.
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
