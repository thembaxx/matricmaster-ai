'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useMediaQuery } from '@/components/Schedule/hooks';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from '@/components/ui/drawer';
import { Skeleton } from '@/components/ui/skeleton';
import {
	getAllMatricYears,
	getMatricResults,
	type Learner,
	type MatricResultsData,
} from '@/lib/db/matric-results-actions';
import { cn } from '@/lib/utils';

const Bar = dynamic(() => import('recharts').then((mod) => mod.Bar), { ssr: false });
const BarChart = dynamic(() => import('recharts').then((mod) => mod.BarChart), { ssr: false });
const Cell = dynamic(() => import('recharts').then((mod) => mod.Cell), { ssr: false });
const ResponsiveContainer = dynamic(
	() => import('recharts').then((mod) => mod.ResponsiveContainer),
	{ ssr: false }
);
const Tooltip = dynamic(() => import('recharts').then((mod) => mod.Tooltip), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((mod) => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((mod) => mod.YAxis), { ssr: false });

const provinceColors = [
	'#FF6B6B',
	'#4ECDC4',
	'#45B7D1',
	'#96CEB4',
	'#FFEAA7',
	'#DDA0DD',
	'#98D8C8',
	'#F7DC6F',
	'#BB8FCE',
];

const topLearners: Learner[] = [
	{
		rank: 1,
		name: 'Abigail Kok',
		school: 'York High School',
		province: 'WC',
		overall: 97.4,
		subjects: [
			{ name: 'Mathematics', score: 98 },
			{ name: 'Physical Sciences', score: 97 },
			{ name: 'English Home Language', score: 96 },
			{ name: 'Accounting', score: 98 },
		],
	},
	{
		rank: 2,
		name: 'Lethu Matyipu',
		school: 'Joe Slovo Secondary',
		province: 'EC',
		overall: 96.8,
		subjects: [
			{ name: 'Mathematics', score: 97 },
			{ name: 'Life Sciences', score: 96 },
			{ name: 'English FAL', score: 97 },
			{ name: 'Geography', score: 97 },
		],
	},
	{
		rank: 3,
		name: 'Jani Steyn',
		school: 'Hoërskool Swartland',
		province: 'WC',
		overall: 96.5,
		subjects: [
			{ name: 'Mathematics', score: 98 },
			{ name: 'Physical Sciences', score: 95 },
			{ name: 'Afrikaans HL', score: 97 },
			{ name: 'Life Sciences', score: 96 },
		],
	},
	{
		rank: 4,
		name: 'Rayyan Ebrahim',
		school: 'Pinelands High',
		province: 'WC',
		overall: 96.1,
		subjects: [
			{ name: 'Mathematics', score: 96 },
			{ name: 'Physical Sciences', score: 97 },
			{ name: 'English Home Language', score: 95 },
			{ name: 'Accounting', score: 96 },
		],
	},
	{
		rank: 5,
		name: 'Thuto Dlothi',
		school: 'Sinenjongo High',
		province: 'WC',
		overall: 95.8,
		subjects: [
			{ name: 'Mathematics', score: 95 },
			{ name: 'Life Sciences', score: 96 },
			{ name: 'English FAL', score: 96 },
			{ name: 'Geography', score: 96 },
		],
	},
	{
		rank: 6,
		name: 'Mpho Ndlovu',
		school: 'Edenglen High',
		province: 'GP',
		overall: 95.4,
		subjects: [
			{ name: 'Mathematics', score: 94 },
			{ name: 'Physical Sciences', score: 96 },
			{ name: 'English FAL', score: 96 },
			{ name: 'Life Sciences', score: 95 },
		],
	},
	{
		rank: 7,
		name: 'Sarah Van Der Merwe',
		school: 'Waterkloof',
		province: 'GP',
		overall: 95.2,
		subjects: [
			{ name: 'Mathematics', score: 96 },
			{ name: 'Physical Sciences', score: 94 },
			{ name: 'Afrikaans HL', score: 96 },
			{ name: 'Accounting', score: 95 },
		],
	},
	{
		rank: 8,
		name: 'Sipho Mthembu',
		school: 'Westville Boys',
		province: 'KZN',
		overall: 94.9,
		subjects: [
			{ name: 'Mathematics', score: 95 },
			{ name: 'Physical Sciences', score: 94 },
			{ name: 'English Home Language', score: 95 },
			{ name: 'Life Sciences', score: 95 },
		],
	},
	{
		rank: 9,
		name: 'Fatima Patel',
		school: 'Orient Islamic',
		province: 'KZN',
		overall: 94.7,
		subjects: [
			{ name: 'Mathematics', score: 94 },
			{ name: 'Physical Sciences', score: 95 },
			{ name: 'English Home Language', score: 95 },
			{ name: 'Accounting', score: 95 },
		],
	},
	{
		rank: 10,
		name: 'James Bate',
		school: 'Parel Vallei High',
		province: 'WC',
		overall: 94.5,
		subjects: [
			{ name: 'Mathematics', score: 95 },
			{ name: 'Physical Sciences', score: 93 },
			{ name: 'English Home Language', score: 96 },
			{ name: 'Life Sciences', score: 94 },
		],
	},
];

function LearnerCard({ learner, onClick }: { learner: Learner; onClick: () => void }) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				'flex w-full items-center justify-between p-4 rounded-lg border border-border/50 bg-card cursor-pointer transition-all hover:border-primary/30 hover:shadow-tiimo text-left',
				learner.rank <= 3 && 'bg-accent/10'
			)}
		>
			<div className="flex items-center gap-4">
				<div
					className={cn(
						'flex h-10 w-10 items-center justify-center rounded-full font-semibold text-sm',
						learner.rank === 1 && 'bg-yellow-400 text-yellow-900',
						learner.rank === 2 && 'bg-gray-300 text-gray-700',
						learner.rank === 3 && 'bg-amber-600 text-white',
						learner.rank > 3 && 'bg-muted text-muted-foreground'
					)}
				>
					{learner.rank}
				</div>
				<div>
					<p className="font-semibold font-body text-foreground">{learner.name}</p>
					<p className="text-sm text-muted-foreground">
						{learner.school}, {learner.province}
					</p>
				</div>
			</div>
			<div className="text-right">
				<p className="font-bold font-mono text-lg text-primary">{learner.overall}%</p>
				<p className="text-xs text-muted-foreground">overall</p>
			</div>
		</button>
	);
}

function LearnerModalDesktop({
	learner,
	open,
	onOpenChange,
}: {
	learner: Learner | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	if (!learner) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<span className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-400 text-sm font-bold text-yellow-900">
							{learner.rank}
						</span>
						{learner.name}
					</DialogTitle>
					<DialogDescription>
						{learner.school}, {learner.province}
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4 py-4">
					<div className="flex items-center justify-between rounded-lg bg-accent/20 p-4">
						<span className="text-muted-foreground">Overall Score</span>
						<span className="font-bold font-mono text-2xl text-primary">{learner.overall}%</span>
					</div>
					<div className="space-y-3">
						<p className="text-sm font-medium text-muted-foreground">Subject Breakdown</p>
						{learner.subjects.map((subject) => (
							<div key={subject.name} className="flex items-center justify-between">
								<span className="text-sm">{subject.name}</span>
								<Badge
									variant="outline"
									className={cn(
										'font-mono',
										subject.score >= 90 && 'border-green-500 text-green-600',
										subject.score >= 80 && subject.score < 90 && 'border-primary text-primary',
										subject.score >= 70 &&
											subject.score < 80 &&
											'border-yellow-500 text-yellow-600',
										subject.score < 70 && 'border-red-500 text-red-600'
									)}
								>
									{subject.score}%
								</Badge>
							</div>
						))}
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function LearnerModalMobile({
	learner,
	open,
	onOpenChange,
}: {
	learner: Learner | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	if (!learner) return null;

	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerContent>
				<DrawerHeader className="text-left">
					<DrawerTitle className="flex items-center gap-2">
						<span className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-400 text-sm font-bold text-yellow-900">
							{learner.rank}
						</span>
						{learner.name}
					</DrawerTitle>
					<DrawerDescription>
						{learner.school}, {learner.province}
					</DrawerDescription>
				</DrawerHeader>
				<div className="px-4 pb-4 space-y-4">
					<div className="flex items-center justify-between rounded-lg bg-accent/20 p-4">
						<span className="text-muted-foreground">Overall Score</span>
						<span className="font-bold font-mono text-2xl text-primary">{learner.overall}%</span>
					</div>
					<div className="space-y-3">
						<p className="text-sm font-medium text-muted-foreground">Subject Breakdown</p>
						{learner.subjects.map((subject) => (
							<div key={subject.name} className="flex items-center justify-between">
								<span className="text-sm">{subject.name}</span>
								<Badge
									variant="outline"
									className={cn(
										'font-mono',
										subject.score >= 90 && 'border-green-500 text-green-600',
										subject.score >= 80 && subject.score < 90 && 'border-primary text-primary',
										subject.score >= 70 &&
											subject.score < 80 &&
											'border-yellow-500 text-yellow-600',
										subject.score < 70 && 'border-red-500 text-red-600'
									)}
								>
									{subject.score}%
								</Badge>
							</div>
						))}
					</div>
				</div>
				<DrawerFooter className="pt-2">
					<DrawerClose asChild>
						<Button variant="outline">Close</Button>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}

function YearPills({
	years,
	selectedYear,
	onYearChange,
}: {
	years: number[];
	selectedYear: number;
	onYearChange: (year: number) => void;
}) {
	return (
		<div className="flex flex-wrap gap-2">
			{years.map((year) => (
				<Button
					key={year}
					variant={selectedYear === year ? 'default' : 'outline'}
					size="sm"
					onClick={() => onYearChange(year)}
					className={cn('font-mono', selectedYear === year && 'bg-primary text-primary-foreground')}
				>
					{year}
				</Button>
			))}
		</div>
	);
}

function SkeletonCard() {
	return (
		<Card>
			<CardHeader>
				<Skeleton className="h-6 w-3/4 mb-2" />
				<Skeleton className="h-4 w-1/2" />
			</CardHeader>
			<CardContent>
				<Skeleton className="h-48 w-full" />
			</CardContent>
		</Card>
	);
}

export default function MatricResults2025Page() {
	const [selectedYear, setSelectedYear] = useState(2025);
	const [years, setYears] = useState<number[]>([]);
	const [data, setData] = useState<MatricResultsData | null>(null);
	const [loading, setLoading] = useState(true);
	const [selectedLearner, setSelectedLearner] = useState<Learner | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const isDesktop = useMediaQuery('(min-width: 768px)');

	useEffect(() => {
		async function loadData() {
			setLoading(true);
			const [results, allYears] = await Promise.all([
				getMatricResults(selectedYear),
				getAllMatricYears(),
			]);
			setData(results);
			setYears(allYears);
			setLoading(false);
		}
		loadData();
	}, [selectedYear]);

	const handleLearnerClick = (learner: Learner) => {
		setSelectedLearner(learner);
		setIsModalOpen(true);
	};

	return (
		<div className="min-h-screen bg-background pb-40">
			<div className="container mx-auto px-4 py-8 max-w-6xl">
				<div className="mb-6">
					<h1 className="font-display text-3xl font-bold text-foreground mb-2">Matric Results</h1>
					<p className="text-muted-foreground mb-4">
						South Africa&apos;s National Senior Certificate examination results
					</p>
					<YearPills years={years} selectedYear={selectedYear} onYearChange={setSelectedYear} />
				</div>

				{loading ? (
					<div className="grid gap-6 md:grid-cols-2">
						<SkeletonCard />
						<SkeletonCard />
					</div>
				) : data ? (
					<div className="grid gap-6 md:grid-cols-2">
						<Card>
							<CardHeader>
								<CardTitle className="font-display text-xl">Pass Rate by Province</CardTitle>
								<CardDescription>
									{data.year} National pass rate: {data.nationalPassRate}%
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="h-72">
									<ResponsiveContainer width="100%" height="100%">
										<BarChart
											data={data.provinces}
											layout="vertical"
											margin={{ left: 60, right: 20 }}
										>
											<XAxis type="number" domain={[0, 100]} hide />
											<YAxis
												dataKey="province"
												type="category"
												tick={{ fontSize: 12, fontWeight: 500 }}
												width={60}
											/>
											<Tooltip
												content={({ active, payload }) => {
													if (active && payload?.length) {
														const item = payload[0].payload;
														return (
															<div className="bg-background border border-border/50 rounded-lg px-3 py-2 shadow-xl">
																<p className="font-bold">{item.fullName}</p>
																<p className="font-mono text-primary">{item.rate}%</p>
															</div>
														);
													}
													return null;
												}}
											/>
											<Bar dataKey="rate" radius={[0, 4, 4, 0]} maxBarSize={20}>
												{data.provinces.map((_, index) => (
													<Cell key={`province-${index}`} fill={provinceColors[index]} />
												))}
											</Bar>
										</BarChart>
									</ResponsiveContainer>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="font-display text-xl">Gateway Subject Pass Rates</CardTitle>
								<CardDescription>Key NSC examination subjects</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="h-72">
									<ResponsiveContainer width="100%" height="100%">
										<BarChart data={data.subjects} margin={{ left: 20, right: 20 }}>
											<XAxis
												dataKey="subject"
												tick={{ fontSize: 11, fontWeight: 500 }}
												interval={0}
												angle={-20}
												textAnchor="end"
												height={60}
											/>
											<YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
											<Tooltip
												content={({ active, payload }) => {
													if (active && payload?.length) {
														const item = payload[0].payload;
														return (
															<div className="bg-background border border-border/50 rounded-lg px-3 py-2 shadow-xl">
																<p className="font-bold">{item.subject}</p>
																<p className="font-mono text-primary">{item.rate}%</p>
															</div>
														);
													}
													return null;
												}}
											/>
											<Bar dataKey="rate" radius={[4, 4, 0, 0]} maxBarSize={40}>
												{data.subjects.map((_, index) => (
													<Cell
														key={`subject-${index}`}
														fill={provinceColors[index % provinceColors.length]}
													/>
												))}
											</Bar>
										</BarChart>
									</ResponsiveContainer>
								</div>
							</CardContent>
						</Card>
					</div>
				) : null}

				<Card className="mt-6">
					<CardHeader>
						<CardTitle className="font-display text-xl">Top 10 National Achievers</CardTitle>
						<CardDescription>Class of {selectedYear} - National Top Achievers</CardDescription>
					</CardHeader>
					<CardContent>
						{loading ? (
							<div className="space-y-3">
								{[...Array(5)].map((_, i) => (
									<div key={i} className="flex items-center gap-4">
										<Skeleton className="h-10 w-10 rounded-full" />
										<div className="flex-1">
											<Skeleton className="h-4 w-1/3 mb-1" />
											<Skeleton className="h-3 w-1/2" />
										</div>
										<Skeleton className="h-6 w-12" />
									</div>
								))}
							</div>
						) : (
							<div className="grid gap-3">
								{topLearners.map((learner) => (
									<LearnerCard
										key={learner.rank}
										learner={learner}
										onClick={() => handleLearnerClick(learner)}
									/>
								))}
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{isDesktop ? (
				<LearnerModalDesktop
					learner={selectedLearner}
					open={isModalOpen}
					onOpenChange={setIsModalOpen}
				/>
			) : (
				<LearnerModalMobile
					learner={selectedLearner}
					open={isModalOpen}
					onOpenChange={setIsModalOpen}
				/>
			)}
		</div>
	);
}
