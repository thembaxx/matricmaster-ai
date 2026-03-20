'use client';

import {
	AlertCircleIcon,
	AlertDiamondIcon,
	Cancel01Icon,
	CheckmarkCircle01Icon,
	InformationCircleIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Alert {
	id: string;
	type: 'warning' | 'info' | 'success';
	title: string;
	message: string;
	createdAt: string;
	dismissed: boolean;
}

function getAlertStyles(type: 'warning' | 'info' | 'success') {
	switch (type) {
		case 'warning':
			return {
				icon: AlertDiamondIcon,
				iconColor: 'text-warning',
				bgColor: 'bg-warning-soft border-warning/20',
			};
		case 'info':
			return {
				icon: InformationCircleIcon,
				iconColor: 'text-primary',
				bgColor: 'bg-primary/5 border-primary/20',
			};
		case 'success':
			return {
				icon: CheckmarkCircle01Icon,
				iconColor: 'text-success',
				bgColor: 'bg-success-soft border-success/20',
			};
	}
}

export function AlertsPanel() {
	const queryClient = useQueryClient();

	const { data, isLoading } = useQuery({
		queryKey: ['parent-alerts'],
		queryFn: async () => {
			const res = await fetch('/api/parent-dashboard');
			if (!res.ok) throw new Error('Failed to fetch');
			const json = await res.json();
			return json.alerts;
		},
		staleTime: 5 * 60 * 1000,
	});

	const dismissMutation = useMutation({
		mutationFn: async (alertId: string) => {
			const res = await fetch('/api/parent-dashboard', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ alertId, action: 'dismiss' }),
			});
			if (!res.ok) throw new Error('Failed to dismiss');
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['parent-alerts'] });
			toast.success('Alert dismissed');
		},
	});

	const alerts: Alert[] = data?.alerts?.filter((a: Alert) => !a.dismissed) ?? [];

	return (
		<Card className="rounded-[2.5rem] border border-border/50 shadow-tiimo overflow-hidden">
			<CardHeader className="bg-muted/30 px-8 py-6">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
							<HugeiconsIcon icon={AlertCircleIcon} className="w-5 h-5 text-warning" />
						</div>
						<CardTitle className="text-lg font-black tracking-tight">Alerts</CardTitle>
					</div>
					{alerts.length > 0 && (
						<span className="w-6 h-6 rounded-full bg-destructive/10 text-destructive text-xs font-black flex items-center justify-center">
							{alerts.length}
						</span>
					)}
				</div>
			</CardHeader>
			<CardContent className="p-6 space-y-3">
				{isLoading ? (
					Array.from({ length: 2 }).map((_, i) => (
						<div key={i} className="h-16 bg-muted animate-pulse rounded-2xl" />
					))
				) : alerts.length === 0 ? (
					<div className="text-center py-8 text-muted-foreground">
						<HugeiconsIcon
							icon={CheckmarkCircle01Icon}
							className="w-12 h-12 mx-auto mb-3 opacity-30 text-success"
						/>
						<p className="text-sm font-medium">All clear!</p>
						<p className="text-xs mt-1">No alerts right now</p>
					</div>
				) : (
					alerts.map((alert) => {
						const styles = getAlertStyles(alert.type);
						return (
							<div
								key={alert.id}
								className={cn(
									'p-4 rounded-2xl border flex items-start gap-3 transition-all',
									styles.bgColor
								)}
							>
								<div className="mt-0.5">
									<HugeiconsIcon icon={styles.icon} className={cn('w-5 h-5', styles.iconColor)} />
								</div>
								<div className="flex-1 min-w-0">
									<p className="font-bold text-sm">{alert.title}</p>
									<p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
										{alert.message}
									</p>
								</div>
								<Button
									variant="ghost"
									size="icon"
									className="w-8 h-8 rounded-full shrink-0 hover:bg-muted"
									onClick={() => dismissMutation.mutate(alert.id)}
									disabled={dismissMutation.isPending}
								>
									<HugeiconsIcon icon={Cancel01Icon} className="w-4 h-4 text-muted-foreground" />
								</Button>
							</div>
						);
					})
				)}
			</CardContent>
		</Card>
	);
}
