'use client';

import { AlertIcon, ArrowRightIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { resolveConcept } from '@/services/buddyActions';

interface StruggleAlertProps {
	concept: string;
	struggleCount: number;
	onGetHelp?: () => void;
}

export function StruggleAlert({ concept, struggleCount, onGetHelp }: StruggleAlertProps) {
	const handleResolve = async () => {
		try {
			await resolveConcept(concept);
		} catch (error) {
			console.error('Failed to resolve concept:', error);
		}
	};

	return (
		<Card className="p-4 rounded-2xl border-amber-500/30 bg-amber-50 dark:bg-amber-950/30">
			<div className="flex items-start gap-3">
				<div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900 flex items-center justify-center shrink-0">
					<HugeiconsIcon icon={AlertIcon} className="w-5 h-5 text-amber-600" />
				</div>
				<div className="flex-1">
					<h4 className="font-semibold text-sm">Struggling with "{concept}"?</h4>
					<p className="text-xs text-muted-foreground mt-1">
						You&apos;ve had {struggleCount} attempts on this topic. Let&apos;s work through it
						together!
					</p>
					<div className="flex gap-2 mt-3">
						<Button size="sm" onClick={onGetHelp} className="rounded-full">
							Get Help
							<HugeiconsIcon icon={ArrowRightIcon} className="w-4 h-4 ml-1" />
						</Button>
						<Button size="sm" variant="outline" onClick={handleResolve} className="rounded-full">
							I Got This!
						</Button>
					</div>
				</div>
			</div>
		</Card>
	);
}
