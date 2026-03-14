'use client';

import {
	Building02Icon,
	Calendar01Icon,
	Chart02Icon,
	CheckmarkCircle02Icon,
	CopyIcon,
	Download01Icon,
	KeyIcon,
	Loading03Icon,
	PlusSignIcon,
	SparklesIcon,
	UserGroup02Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface SchoolStats {
	totalLearners: number;
	activeLicenses: number;
	expiringSoon: number;
	usagePercent: number;
}

interface School {
	id: string;
	name: string;
	emisNumber: string;
	province: string;
	contactName: string;
	contactEmail: string;
	subscriptionPlan: string;
	licenseCount: number;
	licenseExpiry: Date | null;
	status: string;
}

interface License {
	id: string;
	licenseKey: string;
	licenseType: string;
	assignedTo: string | null;
	status: string;
	expiresAt: Date | null;
}

const MOCK_SCHOOL: School = {
	id: '1',
	name: 'Johannesburg High School',
	emisNumber: '700123456',
	province: 'Gauteng',
	contactName: 'John Smith',
	contactEmail: 'john@school.edu.za',
	subscriptionPlan: 'premium',
	licenseCount: 500,
	licenseExpiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
	status: 'active',
};

const MOCK_LICENSES: License[] = [
	{
		id: '1',
		licenseKey: 'SCH-2026-ABC123',
		licenseType: 'student',
		assignedTo: 'john.doe@school.edu.za',
		status: 'active',
		expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
	},
	{
		id: '2',
		licenseKey: 'SCH-2026-ABC124',
		licenseType: 'student',
		assignedTo: 'jane.doe@school.edu.za',
		status: 'active',
		expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
	},
	{
		id: '3',
		licenseKey: 'SCH-2026-ABC125',
		licenseType: 'student',
		assignedTo: null,
		status: 'available',
		expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
	},
];

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
									<p className="text-2xl font-bold">{school.licenseCount - stats.activeLicenses}</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

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

				<Card>
					<CardHeader className="flex flex-row items-center justify-between">
						<div>
							<CardTitle>License Management</CardTitle>
							<CardDescription>Generate and manage student licenses</CardDescription>
						</div>
						<div className="flex gap-2">
							<Button
								variant="outline"
								onClick={() => generateLicenseKeys(10)}
								disabled={isLoading}
							>
								{isLoading ? (
									<HugeiconsIcon icon={Loading03Icon} className="w-4 h-4 mr-2 animate-spin" />
								) : (
									<HugeiconsIcon icon={PlusSignIcon} className="w-4 h-4 mr-2" />
								)}
								Generate 10
							</Button>
							<Button variant="outline">
								<HugeiconsIcon icon={Download01Icon} className="w-4 h-4 mr-2" />
								Export All
							</Button>
						</div>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{licenses.map((license) => (
								<div
									key={license.id}
									className="flex items-center justify-between p-3 rounded-lg border"
								>
									<div className="flex items-center gap-3">
										<HugeiconsIcon icon={KeyIcon} className="w-4 h-4 text-muted-foreground" />
										<div>
											<p className="font-mono text-sm">{license.licenseKey}</p>
											<p className="text-xs text-muted-foreground">
												{license.assignedTo || 'Not assigned'}
											</p>
										</div>
									</div>
									<div className="flex items-center gap-3">
										<Badge variant={license.status === 'active' ? 'default' : 'outline'}>
											{license.status}
										</Badge>
										<span className="text-sm text-muted-foreground">
											Expires: {formatDate(license.expiresAt)}
										</span>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => copyLicenseKey(license.licenseKey)}
										>
											<HugeiconsIcon icon={CopyIcon} className="w-4 h-4" />
										</Button>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
