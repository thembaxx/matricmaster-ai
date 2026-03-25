'use client';

import { Calendar02Icon, Download02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
	exportWeeklyReportPDF,
	generateWeeklyReport,
	type WeeklyReportData,
} from '@/services/progress-pdf-export';

type ReportType = 'current-week' | 'custom';

interface WeeklyProgressExportProps {
	className?: string;
}

export function WeeklyProgressExport({ className }: WeeklyProgressExportProps) {
	const [isGenerating, setIsGenerating] = useState(false);
	const [reportType, setReportType] = useState<ReportType>('current-week');
	const [customStartDate, setCustomStartDate] = useState('');
	const [customEndDate, setCustomEndDate] = useState('');
	const [previewData, setPreviewData] = useState<WeeklyReportData | null>(null);
	const [showPreview, setShowPreview] = useState(false);

	const getDateRange = (): { start: Date; end: Date } | null => {
		if (reportType === 'current-week') {
			const now = new Date();
			const day = now.getDay();
			const diff = now.getDate() - day + (day === 0 ? -6 : 1);
			const start = new Date(now);
			start.setDate(diff);
			start.setHours(0, 0, 0, 0);
			const end = new Date(start);
			end.setDate(end.getDate() + 6);
			end.setHours(23, 59, 59, 999);
			return { start, end };
		}
		if (customStartDate && customEndDate) {
			return {
				start: new Date(customStartDate),
				end: new Date(customEndDate),
			};
		}
		return null;
	};

	const handlePreview = async () => {
		const range = getDateRange();
		if (!range && reportType === 'custom') {
			toast.error('Please select a start and end date');
			return;
		}

		try {
			const result = await generateWeeklyReport(
				reportType === 'custom' ? new Date(customStartDate) : undefined,
				reportType === 'custom' ? new Date(customEndDate) : undefined
			);
			if (result.success && result.data) {
				setPreviewData(result.data);
				setShowPreview(true);
			} else {
				toast.error('Failed to generate preview');
			}
		} catch {
			toast.error('Failed to load preview');
		}
	};

	const handleDownload = async () => {
		setIsGenerating(true);
		try {
			const range = getDateRange();
			const pdfBuffer = await exportWeeklyReportPDF(range?.start);

			if (pdfBuffer) {
				const blob = new Blob([new Uint8Array(pdfBuffer)], { type: 'application/pdf' });
				const url = URL.createObjectURL(blob);
				const link = document.createElement('a');
				link.href = url;
				const filename =
					reportType === 'current-week'
						? `matricmaster-weekly-report-${new Date().toISOString().split('T')[0]}.pdf`
						: `matricmaster-report-${customStartDate}-${customEndDate}.pdf`;
				link.download = filename;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				URL.revokeObjectURL(url);

				toast.success('Report downloaded successfully!');
			} else {
				toast.error('Failed to generate PDF report');
			}
		} catch {
			toast.error('Failed to download report');
		} finally {
			setIsGenerating(false);
		}
	};

	const formatStudyTime = (minutes: number): string => {
		if (minutes < 60) return `${minutes}m`;
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
	};

	const formatDate = (date: Date): string => {
		return new Date(date).toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
		});
	};

	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<HugeiconsIcon icon={Download02Icon} className="w-5 h-5" />
					Weekly Progress Report
				</CardTitle>
				<CardDescription>Download a PDF report of your study progress</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-3">
					<span className="text-sm font-medium">Select Report Period</span>
					<div className="flex flex-wrap gap-2">
						<Button
							variant={reportType === 'current-week' ? 'default' : 'outline'}
							size="sm"
							onClick={() => setReportType('current-week')}
						>
							Current Week
						</Button>
						<Button
							variant={reportType === 'custom' ? 'default' : 'outline'}
							size="sm"
							onClick={() => setReportType('custom')}
						>
							Custom Range
						</Button>
					</div>
				</div>

				{reportType === 'custom' && (
					<div className="grid grid-cols-2 gap-3">
						<div>
							<label htmlFor="start-date" className="text-sm text-muted-foreground">
								Start Date
							</label>
							<input
								id="start-date"
								type="date"
								value={customStartDate}
								onChange={(e) => setCustomStartDate(e.target.value)}
								className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
							/>
						</div>
						<div>
							<label htmlFor="end-date" className="text-sm text-muted-foreground">
								End Date
							</label>
							<input
								id="end-date"
								type="date"
								value={customEndDate}
								onChange={(e) => setCustomEndDate(e.target.value)}
								className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
							/>
						</div>
					</div>
				)}

				<div className="border-t pt-4">
					<h4 className="text-sm font-medium mb-3">Report Includes:</h4>
					<ul className="text-sm text-muted-foreground space-y-1">
						<li className="flex items-center gap-2">
							<span className="text-green-500">✓</span> Weekly study time and quiz stats
						</li>
						<li className="flex items-center gap-2">
							<span className="text-green-500">✓</span> Subject progress and mastery
						</li>
						<li className="flex items-center gap-2">
							<span className="text-green-500">✓</span> Quiz performance breakdown
						</li>
						<li className="flex items-center gap-2">
							<span className="text-green-500">✓</span> Streak and level information
						</li>
						<li className="flex items-center gap-2">
							<span className="text-green-500">✓</span> Visual bar charts
						</li>
					</ul>
				</div>

				<div className="flex gap-2">
					<Button variant="outline" onClick={handlePreview} className="flex-1">
						<HugeiconsIcon icon={Calendar02Icon} className="w-4 h-4 mr-2" />
						Preview
					</Button>
					<Button onClick={handleDownload} disabled={isGenerating} className="flex-1">
						<HugeiconsIcon icon={Download02Icon} className="w-4 h-4 mr-2" />
						{isGenerating ? 'Generating...' : 'Download PDF'}
					</Button>
				</div>

				{showPreview && previewData && (
					<div className="bg-muted/50 rounded-lg p-4 space-y-3">
						<h4 className="font-medium text-sm">Report Preview</h4>
						<div className="text-sm text-muted-foreground space-y-2">
							<p>
								<strong>Period:</strong> {formatDate(previewData.dateRange.start)} -{' '}
								{formatDate(previewData.dateRange.end)}
							</p>
							<p>
								<strong>Study Time:</strong>{' '}
								{formatStudyTime(previewData.weeklyStats.totalStudyMinutes)}
							</p>
							<p>
								<strong>Quizzes:</strong> {previewData.weeklyStats.quizzesTaken} |
								<strong> Questions:</strong> {previewData.weeklyStats.questionsAnswered} |
								<strong> Accuracy:</strong> {previewData.weeklyStats.accuracy}%
							</p>
							<p>
								<strong>XP Earned:</strong> {previewData.weeklyStats.xpEarned} |
								<strong> Streak:</strong> {previewData.streakInfo.currentStreak} days
							</p>
							<p>
								<strong>Level:</strong> {previewData.levelInfo.level} ({previewData.levelInfo.title}
								)
							</p>
							{previewData.subjectProgress.length > 0 && (
								<p>
									<strong>Top Subjects:</strong>{' '}
									{previewData.subjectProgress
										.slice(0, 3)
										.map((s) => s.subjectName)
										.join(', ')}
								</p>
							)}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
