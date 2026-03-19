'use client';

import {
	Calendar01Icon,
	CheckmarkCircle02Icon,
	KeyIcon,
	UserGroup02Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Card, CardContent } from '@/components/ui/card';
import type { SchoolStats } from './constants';

interface StatsCardsProps {
	stats: SchoolStats;
	availableLicenses: number;
}

export function StatsCards({ stats, availableLicenses }: StatsCardsProps) {
	return (
		<div className="grid md:grid-cols-4 gap-4 mb-8">
			<Card>
				<CardContent className="p-4">
					<div className="flex items-center gap-3">
						<div className="p-2 rounded-lg bg-primary/10">
							<HugeiconsIcon icon={UserGroup02Icon} className="w-5 h-5 text-primary" />
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Total Learners</p>
							<p className="text-2xl font-bold">{stats.totalLearners}</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardContent className="p-4">
					<div className="flex items-center gap-3">
						<div className="p-2 rounded-lg bg-green-500/10">
							<HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-5 h-5 text-green-500" />
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Active Licenses</p>
							<p className="text-2xl font-bold">{stats.activeLicenses}</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardContent className="p-4">
					<div className="flex items-center gap-3">
						<div className="p-2 rounded-lg bg-yellow-500/10">
							<HugeiconsIcon icon={Calendar01Icon} className="w-5 h-5 text-yellow-500" />
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Expiring Soon</p>
							<p className="text-2xl font-bold">{stats.expiringSoon}</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardContent className="p-4">
					<div className="flex items-center gap-3">
						<div className="p-2 rounded-lg bg-blue-500/10">
							<HugeiconsIcon icon={KeyIcon} className="w-5 h-5 text-blue-500" />
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Available</p>
							<p className="text-2xl font-bold">{availableLicenses}</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
