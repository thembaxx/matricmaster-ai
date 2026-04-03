'use client';

import {
	CopyIcon,
	Download01Icon,
	KeyIcon,
	Loading03Icon,
	PlusSignIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { License } from './constants';

interface LicenseManagementCardProps {
	licenses: License[];
	isLoading: boolean;
	onGenerate: (count: number) => void;
	onCopyKey: (key: string) => void;
	onExport?: () => void;
	formatDate: (date: Date | null) => string;
}

export function LicenseManagementCard({
	licenses,
	isLoading,
	onGenerate,
	onCopyKey,
	onExport,
	formatDate,
}: LicenseManagementCardProps) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between">
				<div>
					<CardTitle>License Management</CardTitle>
					<CardDescription>Generate and manage student licenses</CardDescription>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" onClick={() => onGenerate(10)} disabled={isLoading}>
						{isLoading ? (
							<HugeiconsIcon icon={Loading03Icon} className="w-4 h-4 mr-2 animate-spin" />
						) : (
							<HugeiconsIcon icon={PlusSignIcon} className="w-4 h-4 mr-2" />
						)}
						Generate 10
					</Button>
					<Button variant="outline" onClick={onExport} disabled={licenses.length === 0}>
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
								<Button variant="ghost" size="icon" onClick={() => onCopyKey(license.licenseKey)}>
									<HugeiconsIcon icon={CopyIcon} className="w-4 h-4" />
								</Button>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
