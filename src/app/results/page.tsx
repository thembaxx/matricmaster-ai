'use client';

import {
	BookOpen01Icon,
	CheckmarkCircle02Icon,
	InformationCircleIcon,
	Mortarboard02Icon,
	Search01Icon,
	Share05Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const DBE_RESULTS_URL = 'https://www.education.gov.za/Results';

export default function ResultsPage() {
	const [examNumber, setExamNumber] = useState('');
	const [selectedYear, setSelectedYear] = useState(new Date().getFullYear() - 1);

	const currentYear = new Date().getFullYear();
	const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

	const handleCheckResults = () => {
		if (!examNumber.trim()) {
			toast.error('Please enter your examination number');
			return;
		}

		window.open(DBE_RESULTS_URL, '_blank');
		toast.info('Opening official DBE results portal');
	};

	return (
		<div className="min-h-screen pb-40 pt-8 px-4">
			<div className="max-w-3xl mx-auto">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
						<HugeiconsIcon icon={Mortarboard02Icon} className="w-8 h-8 text-primary" />
						NSC Results
					</h1>
					<p className="text-muted-foreground">
						Check your National Senior Certificate (Matric) results
					</p>
				</div>

				<Card className="mb-6">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<HugeiconsIcon icon={Search01Icon} className="w-5 h-5" />
							Check Your Results
						</CardTitle>
						<CardDescription>Enter your examination number to view your results</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<label htmlFor="exam-number" className="text-sm font-medium">
								Examination Number
							</label>
							<Input
								id="exam-number"
								placeholder="e.g., 123456789012"
								value={examNumber}
								onChange={(e) => setExamNumber(e.target.value)}
								className="mt-1"
								maxLength={12}
							/>
							<p className="text-xs text-muted-foreground mt-1">
								Found on your exam admission letter
							</p>
						</div>

						<div>
							<label htmlFor="exam-year" className="text-sm font-medium">
								Year
							</label>
							<select
								id="exam-year"
								value={selectedYear}
								onChange={(e) => setSelectedYear(Number(e.target.value))}
								className="w-full h-10 mt-1 px-3 rounded-lg border bg-background text-sm"
							>
								{years.map((y) => (
									<option key={y} value={y}>
										{y}
									</option>
								))}
							</select>
						</div>

						<Button className="w-full" onClick={handleCheckResults} disabled={!examNumber.trim()}>
							<HugeiconsIcon icon={Share05Icon} className="w-4 h-4 mr-2" />
							Check Results
						</Button>
					</CardContent>
				</Card>

				<Card className="mb-6 bg-blue-500/5 border-blue-500/20">
					<CardContent className="p-6">
						<div className="flex items-start gap-4">
							<div className="p-3 rounded-lg bg-blue-500/10 shrink-0">
								<HugeiconsIcon icon={InformationCircleIcon} className="w-6 h-6 text-blue-500" />
							</div>
							<div>
								<h3 className="font-semibold mb-2">How to Check Your Results</h3>
								<ol className="text-sm text-muted-foreground space-y-2">
									<li className="flex gap-2">
										<span className="font-medium text-foreground">1.</span>
										Enter your 12-digit examination number above
									</li>
									<li className="flex gap-2">
										<span className="font-medium text-foreground">2.</span>
										Select the year you wrote the exam
									</li>
									<li className="flex gap-2">
										<span className="font-medium text-foreground">3.</span>
										Click "Check Results" to open the official DBE portal
									</li>
									<li className="flex gap-2">
										<span className="font-medium text-foreground">4.</span>
										Results are released in January/February each year
									</li>
								</ol>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="mb-6">
					<CardHeader>
						<CardTitle>Understanding Your Results</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div>
								<h4 className="font-medium mb-2">Achievement Levels</h4>
								<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
									{[
										{ level: '7', desc: 'Outstanding', color: 'bg-green-500' },
										{ level: '6', desc: 'Meritorious', color: 'bg-green-400' },
										{ level: '5', desc: 'Substantial', color: 'bg-blue-500' },
										{ level: '4', desc: 'Adequate', color: 'bg-blue-400' },
										{ level: '3', desc: 'Moderate', color: 'bg-yellow-500' },
										{ level: '2', desc: 'Elementary', color: 'bg-orange-500' },
										{ level: '1', desc: 'Not Achieved', color: 'bg-red-500' },
									].map((item) => (
										<div key={item.level} className="flex items-center gap-2">
											<Badge className={item.color}>{item.level}</Badge>
											<span className="text-xs text-muted-foreground">{item.desc}</span>
										</div>
									))}
								</div>
							</div>

							<div>
								<h4 className="font-medium mb-2">Pass Requirements</h4>
								<ul className="text-sm text-muted-foreground space-y-1">
									<li className="flex gap-2">
										<HugeiconsIcon
											icon={CheckmarkCircle02Icon}
											className="w-4 h-4 text-green-500 shrink-0 mt-0.5"
										/>
										<span>National Certificate: Pass 6 subjects (including Home Language)</span>
									</li>
									<li className="flex gap-2">
										<HugeiconsIcon
											icon={CheckmarkCircle02Icon}
											className="w-4 h-4 text-green-500 shrink-0 mt-0.5"
										/>
										<span>Admission to Bachelor: Pass 4 subjects (including Language)</span>
									</li>
									<li className="flex gap-2">
										<HugeiconsIcon
											icon={CheckmarkCircle02Icon}
											className="w-4 h-4 text-green-500 shrink-0 mt-0.5"
										/>
										<span>Minimum 30% in Home Language for certificate endorsement</span>
									</li>
								</ul>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<HugeiconsIcon icon={BookOpen01Icon} className="w-5 h-5" />
							University Admission
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground mb-4">
							Your APS (Admission Point Score) determines university eligibility. Calculate your APS
							using our calculator:
						</p>
						<Button variant="outline" onClick={() => (window.location.href = '/aps-calculator')}>
							Go to APS Calculator
						</Button>
					</CardContent>
				</Card>

				<div className="mt-6 text-center text-sm text-muted-foreground">
					<p>Results provided by the Department of Basic Education</p>
					<p className="mt-1">© {currentYear} MatricMaster AI</p>
				</div>
			</div>
		</div>
	);
}
