'use client';

import {
	AlertCircleIcon,
	ArrowLeft01Icon,
	Link01Icon,
	Mail01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

export default function ParentSettingsPage() {
	const router = useRouter();
	const queryClient = useQueryClient();

	useQuery({
		queryKey: ['parent-settings'],
		queryFn: async () => {
			const res = await fetch('/api/parent-dashboard');
			if (!res.ok) return null;
			return res.json();
		},
		staleTime: 5 * 60 * 1000,
	});

	const [settings, setSettings] = useState({
		emailDigest: true,
		digestFrequency: 'weekly',
		alertQuizThreshold: 60,
		alertInactivityDays: 3,
		emailNotifications: true,
		pushNotifications: true,
	});

	const saveMutation = useMutation({
		mutationFn: async (newSettings: typeof settings) => {
			const res = await fetch('/api/parent-dashboard', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ settings: newSettings }),
			});
			if (!res.ok) throw new Error('Failed to save');
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['parent-settings'] });
			toast.success('Settings saved');
		},
		onError: () => {
			toast.error('Failed to save settings');
		},
	});

	const handleSave = () => {
		saveMutation.mutate(settings);
	};

	return (
		<div className="flex flex-col h-full bg-background min-w-0">
			<header className="px-6 pt-12 pb-6 flex items-center justify-between shrink-0 max-w-4xl mx-auto w-full">
				<Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
					<HugeiconsIcon icon={ArrowLeft01Icon} className="w-6 h-6" />
				</Button>
				<h1 className="text-xl font-black tracking-tight">Parent Settings</h1>
				<div className="w-10" />
			</header>

			<ScrollArea className="flex-1">
				<main className="px-6 py-4 pb-32 max-w-4xl mx-auto w-full space-y-8">
					<Card className="rounded-[2.5rem] border border-border/50 shadow-tiimo overflow-hidden">
						<CardHeader className="bg-muted/30 px-8 py-6">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
									<HugeiconsIcon icon={Mail01Icon} className="w-5 h-5 text-primary" />
								</div>
								<CardTitle className="text-lg font-black tracking-tight">
									Email Notifications
								</CardTitle>
							</div>
						</CardHeader>
						<CardContent className="p-6 space-y-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="font-bold text-sm">Weekly Digest</p>
									<p className="text-xs text-muted-foreground">
										Receive a weekly summary of your child's progress
									</p>
								</div>
								<Switch
									checked={settings.emailDigest}
									onCheckedChange={(v) => setSettings((s) => ({ ...s, emailDigest: v }))}
								/>
							</div>

							{settings.emailDigest && (
								<div>
									<Label className="text-[10px] font-bold text-muted-foreground  tracking-widest">
										Digest Frequency
									</Label>
									<Select
										value={settings.digestFrequency}
										onValueChange={(v) => setSettings((s) => ({ ...s, digestFrequency: v }))}
									>
										<SelectTrigger className="mt-2 rounded-xl">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="daily">Daily</SelectItem>
											<SelectItem value="weekly">Weekly</SelectItem>
											<SelectItem value="none">Don't send</SelectItem>
										</SelectContent>
									</Select>
								</div>
							)}

							<div className="flex items-center justify-between">
								<div>
									<p className="font-bold text-sm">Email Alerts</p>
									<p className="text-xs text-muted-foreground">
										Receive alerts when thresholds are triggered
									</p>
								</div>
								<Switch
									checked={settings.emailNotifications}
									onCheckedChange={(v) => setSettings((s) => ({ ...s, emailNotifications: v }))}
								/>
							</div>

							<div className="flex items-center justify-between">
								<div>
									<p className="font-bold text-sm">Push Notifications</p>
									<p className="text-xs text-muted-foreground">Receive push notifications in-app</p>
								</div>
								<Switch
									checked={settings.pushNotifications}
									onCheckedChange={(v) => setSettings((s) => ({ ...s, pushNotifications: v }))}
								/>
							</div>
						</CardContent>
					</Card>

					<Card className="rounded-[2.5rem] border border-border/50 shadow-tiimo overflow-hidden">
						<CardHeader className="bg-muted/30 px-8 py-6">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
									<HugeiconsIcon icon={AlertCircleIcon} className="w-5 h-5 text-warning" />
								</div>
								<CardTitle className="text-lg font-black tracking-tight">
									Alert Thresholds
								</CardTitle>
							</div>
						</CardHeader>
						<CardContent className="p-6 space-y-6">
							<div>
								<Label className="text-[10px] font-bold text-muted-foreground  tracking-widest">
									Quiz Score Alert (%)
								</Label>
								<p className="text-xs text-muted-foreground mb-2">
									Alert when quiz scores drop below this percentage
								</p>
								<Input
									type="number"
									min={0}
									max={100}
									value={settings.alertQuizThreshold}
									onChange={(e) =>
										setSettings((s) => ({
											...s,
											alertQuizThreshold: Number(e.target.value) || 60,
										}))
									}
									className="rounded-xl"
								/>
							</div>

							<div>
								<Label className="text-[10px] font-bold text-muted-foreground  tracking-widest">
									Inactivity Alert (days)
								</Label>
								<p className="text-xs text-muted-foreground mb-2">
									Alert when no study activity for this many days
								</p>
								<Input
									type="number"
									min={1}
									max={30}
									value={settings.alertInactivityDays}
									onChange={(e) =>
										setSettings((s) => ({
											...s,
											alertInactivityDays: Number(e.target.value) || 3,
										}))
									}
									className="rounded-xl"
								/>
							</div>
						</CardContent>
					</Card>

					<Card className="rounded-[2.5rem] border border-border/50 shadow-tiimo overflow-hidden">
						<CardHeader className="bg-muted/30 px-8 py-6">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
									<HugeiconsIcon icon={Link01Icon} className="w-5 h-5 text-primary" />
								</div>
								<CardTitle className="text-lg font-black tracking-tight">Link Account</CardTitle>
							</div>
						</CardHeader>
						<CardContent className="p-6">
							<div className="text-center py-4">
								<p className="text-sm text-muted-foreground mb-4">
									Connect your child's account to monitor their progress
								</p>
								<Button
									variant="outline"
									className="rounded-full font-bold text-xs gap-2"
									onClick={() => toast.info('Account linking coming soon')}
								>
									<HugeiconsIcon icon={Link01Icon} className="w-4 h-4" />
									Link Child's Account
								</Button>
							</div>
						</CardContent>
					</Card>

					<div className="flex justify-end">
						<Button
							className="rounded-full font-bold gap-2 px-8"
							onClick={handleSave}
							disabled={saveMutation.isPending}
						>
							{saveMutation.isPending ? 'Saving...' : 'Save Settings'}
						</Button>
					</div>
				</main>
			</ScrollArea>
		</div>
	);
}
