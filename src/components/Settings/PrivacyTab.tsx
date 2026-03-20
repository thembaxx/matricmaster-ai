'use client';

import { Delete02Icon, Loading03Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { ZModeToggle } from '@/components/Settings/ZModeToggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useMapContext } from '@/lib/map-provider';

interface PrivacyTabProps {
	profileVisibility: boolean;
	showOnLeaderboard: boolean;
	analyticsTracking: boolean;
	hapticSupported: boolean;
	hapticEnabled: boolean;
	setHapticEnabled: (enabled: boolean) => void;
	handlePrivacyChange: (key: string, value: boolean) => void;
	isDeleteDialogOpen: boolean;
	setIsDeleteDialogOpen: (open: boolean) => void;
	deletePassword: string;
	setDeletePassword: (p: string) => void;
	handleDeleteAccount: () => void;
	isDeletingAccount: boolean;
}

export function PrivacyTab({
	profileVisibility,
	showOnLeaderboard,
	analyticsTracking,
	hapticSupported,
	hapticEnabled,
	setHapticEnabled,
	handlePrivacyChange,
	isDeleteDialogOpen,
	setIsDeleteDialogOpen,
	deletePassword,
	setDeletePassword,
	handleDeleteAccount,
	isDeletingAccount,
}: PrivacyTabProps) {
	const { provider, setProvider, isGoogleMapsAvailable } = useMapContext();

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Privacy Settings</CardTitle>
					<CardDescription>Control your privacy preferences</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="font-medium">Profile Visibility</p>
							<p className="text-sm text-muted-foreground">Allow others to see your profile</p>
						</div>
						<Switch
							checked={profileVisibility}
							onCheckedChange={(v) => handlePrivacyChange('profileVisibility', v)}
						/>
					</div>
					<Separator />
					<div className="flex items-center justify-between">
						<div>
							<p className="font-medium">Show on Leaderboard</p>
							<p className="text-sm text-muted-foreground">Appear on the public leaderboard</p>
						</div>
						<Switch
							checked={showOnLeaderboard}
							onCheckedChange={(v) => handlePrivacyChange('showOnLeaderboard', v)}
						/>
					</div>
					<Separator />
					<div className="flex items-center justify-between">
						<div>
							<p className="font-medium">Analytics Tracking</p>
							<p className="text-sm text-muted-foreground">Help us improve by sharing usage data</p>
						</div>
						<Switch
							checked={analyticsTracking}
							onCheckedChange={(v) => handlePrivacyChange('analyticsTracking', v)}
						/>
					</div>
					<Separator />
					<div className="flex items-center justify-between">
						<div>
							<p className="font-medium">Haptic Feedback</p>
							<p className="text-sm text-muted-foreground">
								{hapticSupported
									? 'Vibration on interactions and achievements'
									: 'Not supported on this device'}
							</p>
						</div>
						<Switch
							checked={hapticEnabled}
							onCheckedChange={setHapticEnabled}
							disabled={!hapticSupported}
						/>
					</div>
					<Separator />
					<ZModeToggle />
				</CardContent>
			</Card>

			{isGoogleMapsAvailable && (
				<Card>
					<CardHeader>
						<CardTitle>Map Settings</CardTitle>
						<CardDescription>Configure map provider preferences</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium">Use Google Maps</p>
								<p className="text-sm text-muted-foreground">
									Switch from OpenStreetMap to Google Maps
								</p>
							</div>
							<Switch
								checked={provider === 'google'}
								onCheckedChange={(checked) => setProvider(checked ? 'google' : 'leaflet')}
							/>
						</div>
						<p className="text-xs text-muted-foreground">
							OpenStreetMap is free and unlimited. Google Maps requires an API key.
						</p>
					</CardContent>
				</Card>
			)}

			<Card>
				<CardHeader>
					<CardTitle>Danger Zone</CardTitle>
					<CardDescription>Irreversible account actions</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<div>
							<p className="font-medium">Delete Account</p>
							<p className="text-sm text-muted-foreground">
								Permanently delete your account and all data
							</p>
						</div>
						<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
							<DialogTrigger asChild>
								<Button variant="destructive" size="sm">
									<HugeiconsIcon icon={Delete02Icon} className="mr-2 h-4 w-4" />
									Delete Account
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>Delete Account</DialogTitle>
									<DialogDescription>
										Are you sure you want to delete your account? This action cannot be undone. All
										your data, progress, and achievements will be permanently deleted.
									</DialogDescription>
								</DialogHeader>
								<div className="py-4">
									<Label htmlFor="deletePassword">Enter your password to confirm</Label>
									<Input
										id="deletePassword"
										type="password"
										value={deletePassword}
										onChange={(e) => setDeletePassword(e.target.value)}
										placeholder="Your password"
										className="mt-2"
									/>
								</div>
								<DialogFooter>
									<Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
										Cancel
									</Button>
									<Button
										variant="destructive"
										onClick={handleDeleteAccount}
										disabled={isDeletingAccount}
									>
										{isDeletingAccount ? (
											<>
												<HugeiconsIcon icon={Loading03Icon} className="mr-2 h-4 w-4 animate-spin" />
												Deleting...
											</>
										) : (
											'Delete My Account'
										)}
									</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
