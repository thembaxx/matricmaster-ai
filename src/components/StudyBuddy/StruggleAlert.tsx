'use client';

import { AlertIcon, ArrowRightIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useGeminiQuotaModal } from '@/contexts/GeminiQuotaModalContext';
import { isQuotaError } from '@/lib/ai/quota-error';
import { resolveConcept } from '@/services/buddyActions';

interface StruggleAlertProps {
	concept: string;
	struggleCount: number;
	onGetHelp?: () => void;
}

export function StruggleAlert({ concept, struggleCount, onGetHelp }: StruggleAlertProps) {
	const { triggerQuotaError } = useGeminiQuotaModal();

	const handleResolve = async () => {
		try {
			await resolveConcept(concept);
		} catch (error) {
			if (isQuotaError(error)) {
				triggerQuotaError();
			}
			console.error('Failed to resolve concept:', error);
		}
	};

	return (
		<Card className="p-4 rounded-2xl border border-warning/20 bg-warning/5 shadow-tiimo hover:shadow-tiimo-lg transition-shadow duration-300">
			<div className="flex items-start gap-3">
				<div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center shrink-0">
					<HugeiconsIcon icon={AlertIcon} className="w-5 h-5 text-warning" />
				</div>
				<div className="flex-1 min-w-0">
					<h4 className="font-semibold text-sm text-foreground">
						Struggling with &quot;{concept}&quot;?
					</h4>
					<p className="text-xs text-muted-foreground mt-1">
						You&apos;ve had {struggleCount} attempts on this topic. Let&apos;s work through it
						together!
					</p>
					<div className="flex gap-2 mt-3">
						<Button
							size="sm"
							onClick={onGetHelp}
							className="rounded-full h-8 px-4 bg-warning hover:bg-warning/90 text-warning-foreground"
						>
							Get Help
							<HugeiconsIcon icon={ArrowRightIcon} className="w-3.5 h-3.5 ml-1" />
						</Button>
						<Button
							size="sm"
							variant="outline"
							onClick={handleResolve}
							className="rounded-full h-8 px-3 border-muted-foreground/20"
						>
							I Got This!
						</Button>
					</div>
				</div>
			</div>
		</Card>
	);
}
