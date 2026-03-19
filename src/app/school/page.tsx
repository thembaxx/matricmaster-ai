'use client';

import { Building02Icon, Chart02Icon, SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
	type License,
	MOCK_LICENSES,
	MOCK_SCHOOL,
	type School,
	type SchoolStats,
} from './constants';
import { LicenseManagementCard } from './LicenseManagementCard';
import { StatsCards } from './StatsCards';

export default function SchoolDashboardPage() {
	const [school, _setSchool] = useState<School>(MOCK_SCHOOL);
	const [licenses, setLicenses] = useState<License[]>(MOCK_LICENSES);
	const [isLoading, setIsLoading] = useState(false);
	const [_activeTab, _setActiveTab] = useState('overview');

	const stats: SchoolStats = {
		totalLearners: 450,
		activeLicenses: licenses.filter((l) => l.status === 'active').length,
		expiringSoon: licenses.filter(
			(l) => l.expiresAt && l.expiresAt.getTime() < Date.now() + 30 * 24 * 60 * 60 * 1000
		).length,
		usagePercent: Math.round((450 / school.licenseCount) * 100),
	};

	const generateLicenseKeys = async (count: number) => {
		setIsLoading(true);
		await new Promise((resolve) => setTimeout(resolve, 1000));

		const newLicenses: License[] = Array.from({ length: count }, (_, i) => ({
			id: `new-${Date.now()}-${i}`,
			licenseKey: `SCH-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
			licenseType: 'student',
			assignedTo: null,
			status: 'available',
			expiresAt: school.licenseExpiry,
		}));

		setLicenses([...licenses, ...newLicenses]);
		setIsLoading(false);
		toast.success(`Generated ${count} license keys`);
	};

	const copyLicenseKey = async (key: string) => {
		await navigator.clipboard.writeText(key);
		toast.success('License key copied!');
	};

	const formatDate = (date: Date | null) => {
		if (!date) return 'N/A';
		return new Date(date).toLocaleDateString('en-ZA', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
		});
	};

	const daysUntilExpiry = school.licenseExpiry
		? Math.ceil((school.licenseExpiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
		: 0;

	return (
		<div className="min-h-screen pb-40 pt-8 px-4">
			<div className="max-w-6xl mx-auto">
				<div className="flex items-start justify-between mb-8">
					<div>
						<h1 className="text-3xl font-bold flex items-center gap-2">
							<HugeiconsIcon icon={Building02Icon} className="w-8 h-8" />
							School Dashboard
						</h1>
						<p className="text-muted-foreground">{school.name}</p>
					</div>
					<Badge
						variant={school.subscriptionPlan === 'premium' ? 'default' : 'outline'}
						className="gap-1"
					>
						<HugeiconsIcon icon={SparklesIcon} className="w-3 h-3" />
						{school.subscriptionPlan.toUpperCase()} Plan
					</Badge>
				</div>

				<StatsCards stats={stats} availableLicenses={school.licenseCount - stats.activeLicenses} />

				<Card className="mb-8">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<HugeiconsIcon icon={Chart02Icon} className="w-5 h-5" />
							License Usage
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div className="flex justify-between text-sm">
								<span>
									{stats.totalLearners} of {school.licenseCount} licenses used
								</span>
								<span className="font-medium">{stats.usagePercent}%</span>
							</div>
							<Progress value={stats.usagePercent} className="h-3" />
							<p className="text-sm text-muted-foreground">
								{school.licenseCount - stats.totalLearners} licenses remaining
							</p>
						</div>
						<div className="mt-4 p-4 rounded-lg bg-muted/50 flex items-center justify-between">
							<div>
								<p className="font-medium">License expires in {daysUntilExpiry} days</p>
								<p className="text-sm text-muted-foreground">{formatDate(school.licenseExpiry)}</p>
							</div>
							<Button>Renew License</Button>
						</div>
					</CardContent>
				</Card>

				<LicenseManagementCard
					licenses={licenses}
					isLoading={isLoading}
					onGenerate={generateLicenseKeys}
					onCopyKey={copyLicenseKey}
					formatDate={formatDate}
				/>
			</div>
		</div>
	);
}
