'use client';

import { m } from 'framer-motion';
import { Download, FileDown, Image, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export interface QuizHistoryItem {
	date: string;
	subject: string;
	score: number;
	time: number;
	topic: string;
}

export interface ExportData {
	user: {
		name: string;
		email: string;
		joinedDate: string;
	};
	quizStats: {
		totalQuizzes: number;
		averageScore: number;
		bestScore: number;
		totalTime: number;
	};
	achievements: {
		totalUnlocked: number;
		badges: string[];
	};
	subjects: {
		name: string;
		questionsAnswered: number;
		accuracy: number;
	}[];
	quizHistory: QuizHistoryItem[];
}

interface DataExportProps {
	quizHistory: QuizHistoryItem[];
	userData: {
		name: string;
		email: string;
		joinedDate: string;
	};
	quizStats: {
		totalQuizzes: number;
		averageScore: number;
		bestScore: number;
		totalTime: number;
	};
	achievements: {
		totalUnlocked: number;
		badges: string[];
	};
	subjects: {
		name: string;
		questionsAnswered: number;
		accuracy: number;
	}[];
}

export default function DataExport({
	quizHistory,
	userData,
	quizStats,
	achievements,
	subjects,
}: DataExportProps) {
	const exportProgressReport = () => {
		const content = `
MatricMaster AI - Progress Report
================================
Generated: ${new Date().toLocaleDateString()}

User Profile
------------
Name: ${userData.name}
Email: ${userData.email}
Member Since: ${userData.joinedDate}

Quiz Statistics
---------------
Total Quizzes: ${quizStats.totalQuizzes}
Average Score: ${quizStats.averageScore}%
Best Score: ${quizStats.bestScore}%
Total Study Time: ${Math.round(quizStats.totalTime / 60)} minutes

Achievements
------------
Unlocked: ${achievements.totalUnlocked}
Badges: ${achievements.badges.join(', ') || 'None yet'}

Subject Breakdown
-----------------
${subjects.map((s) => `${s.name}: ${s.questionsAnswered} questions (${s.accuracy}% accuracy)`).join('\n')}
		`.trim();

		const blob = new Blob([content], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'progress-report.txt';
		a.click();
		URL.revokeObjectURL(url);
	};

	const exportQuizHistoryCSV = () => {
		const headers = ['Date', 'Subject', 'Score', 'Time (minutes)', 'Topic'];
		const rows = quizHistory.map((q) => [
			q.date,
			q.subject,
			q.score.toString(),
			Math.round(q.time / 60).toString(),
			q.topic,
		]);
		const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');

		const blob = new Blob([csv], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'quiz-history.csv';
		a.click();
		URL.revokeObjectURL(url);
	};

	const shareAchievements = async () => {
		const shareText = `🎉 I've completed ${achievements.totalUnlocked} achievements on MatricMaster AI! 
Total Quizzes: ${quizStats.totalQuizzes}
Average Score: ${quizStats.averageScore}%

#MatricMaster #Grade12 #NSC`;

		if (navigator.share) {
			try {
				await navigator.share({
					title: 'My MatricMaster Achievements',
					text: shareText,
				});
			} catch (_err) {
				console.log('Share cancelled');
			}
		} else {
			await navigator.clipboard.writeText(shareText);
			alert('Achievements copied to clipboard!');
		}
	};

	const backupProgress = () => {
		const data: ExportData = {
			user: userData,
			quizStats,
			achievements,
			subjects,
			quizHistory,
		};

		const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'matricmaster-backup.json';
		a.click();
		URL.revokeObjectURL(url);
	};

	const exportButtons = [
		{
			icon: FileDown,
			label: 'Export Progress Report',
			description: 'PDF-style summary',
			onClick: exportProgressReport,
		},
		{
			icon: Download,
			label: 'Export Quiz History',
			description: 'CSV spreadsheet',
			onClick: exportQuizHistoryCSV,
		},
		{
			icon: Share2,
			label: 'Share Achievements',
			description: 'Social media',
			onClick: shareAchievements,
		},
		{
			icon: Image,
			label: 'Backup Progress',
			description: 'Full JSON backup',
			onClick: backupProgress,
		},
	];

	return (
		<Card className="rounded-[2rem] bg-card/50 backdrop-blur-sm border border-border">
			<CardHeader>
				<CardTitle>Data Export & Sharing</CardTitle>
				<CardDescription>Download, share, or backup your progress</CardDescription>
			</CardHeader>
			<CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
				{exportButtons.map((btn, index) => (
					<m.div
						key={btn.label}
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: index * 0.05 }}
					>
						<Button
							variant="outline"
							size="lg"
							className="w-full justify-start h-auto py-3 px-4"
							onClick={btn.onClick}
						>
							<div className="flex items-center gap-3">
								<btn.icon className="w-4 h-4 shrink-0" />
								<div className="text-left">
									<div className="font-medium text-[11px]">{btn.label}</div>
									<div className="text-muted-foreground text-[10px]">{btn.description}</div>
								</div>
							</div>
						</Button>
					</m.div>
				))}
			</CardContent>
		</Card>
	);
}
