'use client';

import { SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { checkForNudges, dismissNudge, type Nudge } from '@/actions/nudge-system';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface AITutorNudgeProps {
	className?: string;
}

export function AITutorNudge(_props: AITutorNudgeProps) {
	const router = useRouter();
	const [nudge, setNudge] = useState<Nudge | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let mounted = true;
		async function loadNudge() {
			try {
				const nudges = await checkForNudges();
				if (mounted && nudges.length > 0) {
					setNudge(nudges[0]);
				}
			} catch {
				console.error('Failed to load nudge');
			} finally {
				if (mounted) setLoading(false);
			}
		}
		loadNudge();
		return () => {
			mounted = false;
		};
	}, []);

	if (loading || !nudge) return null;

	return (
		<Card className="bg-gradient-to-r from-violet-500 to-purple-600 text-white p-4 shadow-lg">
			<div className="flex items-start gap-3">
				<div className="p-2 bg-white/20 rounded-lg">
					<HugeiconsIcon icon={SparklesIcon} className="w-5 h-5" />
				</div>
				<div className="flex-1">
					<h3 className="font-semibold text-base">{nudge.title}</h3>
					<p className="text-sm text-white/80 mt-1">{nudge.message}</p>
					<div className="flex gap-2 mt-3">
						{nudge.actionUrl && (
							<Button
								size="sm"
								variant="secondary"
								onClick={() => {
									dismissNudge(nudge.id);
									router.push(nudge.actionUrl!);
								}}
							>
								{nudge.actionLabel}
							</Button>
						)}
						<Button
							size="sm"
							variant="ghost"
							className="text-white hover:bg-white/20"
							onClick={() => {
								dismissNudge(nudge.id);
								setNudge(null);
							}}
						>
							Dismiss
						</Button>
					</div>
				</div>
			</div>
		</Card>
	);
}
