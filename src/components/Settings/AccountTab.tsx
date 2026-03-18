'use client';

import { Loading03Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AccountTabProps {
	session: any;
	displayName: string;
	setDisplayName: (name: string) => void;
	email: string;
	isPendingProfile: boolean;
	handleSaveProfile: () => void;
}

export function AccountTab({
	session,
	displayName,
	setDisplayName,
	email,
	isPendingProfile,
	handleSaveProfile,
}: AccountTabProps) {
	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Profile Information</CardTitle>
					<CardDescription>Update your account details</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-2">
						<Label htmlFor="displayName">Display Name</Label>
						<Input
							id="displayName"
							value={displayName}
							onChange={(e) => setDisplayName(e.target.value)}
							placeholder="Your name"
							maxLength={100}
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="email">Email</Label>
						<Input id="email" type="email" value={email} placeholder="your@email.com" disabled />
						<p className="text-xs text-muted-foreground">
							Email cannot be changed. Contact support if you need to update it.
						</p>
					</div>
					<Button onClick={handleSaveProfile} disabled={isPendingProfile}>
						{isPendingProfile ? (
							<>
								<HugeiconsIcon icon={Loading03Icon} className="mr-2 h-4 w-4 animate-spin" />
								Saving...
							</>
						) : (
							'Save Changes'
						)}
					</Button>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Connected Accounts</CardTitle>
					<CardDescription>Manage your connected OAuth providers</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
								<span className="text-red-500 font-bold">G</span>
							</div>
							<div>
								<p className="font-medium">Google</p>
								<p className="text-sm text-muted-foreground">
									{session?.user?.email ? 'Connected' : 'Not connected'}
								</p>
							</div>
						</div>
						<Button variant="outline" size="sm" disabled>
							{session?.user?.email ? 'Connected' : 'Connect'}
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
