'use client';

import { Building02Icon, Chart02Icon, SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
	type License,
	MOCK_LICENSES,
	MOCK_SCHOOL,
	type School,
	type SchoolStats,
} from './constants';
import { LicenseManagementCard } from './LicenseManagementCard';
import { StatsCards } from './StatsCards';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LicenseUsageChart: any = dynamic(
	() => import('./LicenseUsageChart').then((mod) => mod.LicenseUsageChart),
	{
		ssr: false,
		loading: () => <Skeleton className="h-48 w-full" />,
	}
);

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

	const availableLicenses = school.licenseCount - stats.totalLearners;
	const expiredLicenses = stats.totalLearners - stats.activeLicenses;

	const pieData = [
		{ name: 'Active', value: stats.activeLicenses, color: 'var(--color-primary)' },
		{ name: 'Available', value: availableLicenses, color: 'var(--color-success)' },
		{ name: 'Expired', value: expiredLicenses, color: 'var(--color-warning)' },
	];

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

				<StatsCards stats={stats} availableLicenses={availableLicenses} />

				<Card className="mb-8">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<HugeiconsIcon icon={Chart02Icon} className="w-5 h-5" />
							License Usage
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-4">
								<div className="flex justify-between text-sm">
									<span>
										{stats.totalLearners} of {school.licenseCount} licenses used
									</span>
									<span className="font-medium">{stats.usagePercent}%</span>
								</div>
								<LicenseUsageChart pieData={pieData} />
								<div className="flex justify-center gap-4">
									{pieData.map((item) => (
										<div key={item.name} className="flex items-center gap-2">
											<div
												className="w-3 h-3 rounded-full"
												style={{ backgroundColor: item.color }}
											/>
											<span className="text-xs font-medium">{item.name}</span>
										</div>
									))}
								</div>
							</div>
							<div className="space-y-4">
								<p className="text-sm text-muted-foreground">
									{school.licenseCount - stats.totalLearners} licenses remaining
								</p>
								<div className="p-4 rounded-lg bg-muted/50 flex items-center justify-between">
									<div>
										<p className="font-medium">License expires in {daysUntilExpiry} days</p>
										<p className="text-sm text-muted-foreground">
											{formatDate(school.licenseExpiry)}
										</p>
									</div>
									<Button>Renew License</Button>
								</div>
								<div className="grid grid-cols-2 gap-3 mt-4">
									<div className="p-3 rounded-xl bg-primary/10 space-y-1">
										<p className="text-xs font-bold text-muted-foreground  tracking-wider">
											Active
										</p>
										<p className="text-xl font-black text-primary">{stats.activeLicenses}</p>
									</div>
									<div className="p-3 rounded-xl bg-success/10 space-y-1">
										<p className="text-xs font-bold text-muted-foreground  tracking-wider">
											Available
										</p>
										<p className="text-xl font-black text-success">{availableLicenses}</p>
									</div>
									<div className="p-3 rounded-xl bg-warning/10 space-y-1">
										<p className="text-xs font-bold text-muted-foreground  tracking-wider">
											Expiring Soon
										</p>
										<p className="text-xl font-black text-warning">{stats.expiringSoon}</p>
									</div>
									<div className="p-3 rounded-xl bg-muted/50 space-y-1">
										<p className="text-xs font-bold text-muted-foreground  tracking-wider">Total</p>
										<p className="text-xl font-black">{school.licenseCount}</p>
									</div>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				<LicenseManagementCard
					licenses={licenses}
					isLoading={isLoading}
					onGenerate={generateLicenseKeys}
					onCopyKey={copyLicenseKey}
					onExport={() => {
						const csv = licenses.map((l) => `${l.licenseKey},${l.status}`).join('\n');
						const blob = new Blob([`key,status\n${csv}`], { type: 'text/csv' });
						const url = URL.createObjectURL(blob);
						const a = document.createElement('a');
						a.href = url;
						a.download = 'licenses.csv';
						a.click();
						URL.revokeObjectURL(url);
					}}
					formatDate={formatDate}
				/>
			</div>
		</div>
	);
}
