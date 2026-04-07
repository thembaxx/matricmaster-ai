'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { getMatricResults, type MatricResultsData } from '@/lib/db/matric-results-actions';
import { cn } from '@/lib/utils';

const provinceColors = [
	'#3B82F6',
	'#5CB587',
	'#48A7DE',
	'#F2C945',
	'#14B8A6',
	'#F97316',
	'#EC4899',
	'#818CF8',
	'#2DD4BF',
];

interface MatricResultsWidgetProps {
	className?: string;
}

export function MatricResultsWidget({ className }: MatricResultsWidgetProps) {
	const router = useRouter();
	const [data, setData] = useState<MatricResultsData | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function loadData() {
			const result = await getMatricResults(2025);
			setData(result);
			setLoading(false);
		}
		loadData();
	}, []);

	return (
		<button
			type="button"
			className={cn(
				'group cursor-pointer rounded-xl border border-border/50 bg-card p-4 text-left transition-all hover:border-primary/30 hover:shadow-tiimo w-full',
				className
			)}
			onClick={() => router.push('/matric-results')}
		>
			<div className="mb-3 flex items-center justify-between">
				<h3 className="font-display text-sm font-semibold text-foreground italic">
					matric results
				</h3>
				<span className="font-mono text-xs text-muted-foreground italic">2025</span>
			</div>

			{loading ? (
				<div className="space-y-2">
					<Skeleton className="h-8 w-full" />
					<Skeleton className="h-4 w-2/3" />
				</div>
			) : data ? (
				<div className="space-y-3">
					<div className="flex items-baseline gap-2">
						<span className="font-mono text-3xl font-bold text-primary">
							{data.nationalPassRate}%
						</span>
						<span className="text-xs text-muted-foreground italic">pass rate</span>
					</div>

					<div className="space-y-1">
						<p className="text-xs font-medium text-muted-foreground italic">top province</p>
						<div className="flex items-center gap-2">
							<div
								className="h-2 w-2 rounded-full"
								style={{ backgroundColor: provinceColors[0] }}
							/>
							<span className="text-sm font-medium italic">
								{data.provinces[0]?.fullName?.toLowerCase()}
							</span>
							<span className="font-mono text-xs text-primary">{data.provinces[0]?.rate}%</span>
						</div>
					</div>

					<div className="flex items-center gap-3 text-xs text-muted-foreground italic">
						<span>math: {data.subjects.find((s) => s.subject === 'Mathematics')?.rate || 0}%</span>
						<span>
							physics: {data.subjects.find((s) => s.subject === 'Physical Sciences')?.rate || 0}%
						</span>
					</div>
				</div>
			) : null}

			<div className="mt-3 flex items-center justify-between text-xs text-muted-foreground italic">
				<span>view all years</span>
				<span className="transition-transform group-hover:translate-x-1 italic">→</span>
			</div>
		</button>
	);
}
