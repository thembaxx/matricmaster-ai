'use client';

import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';

const CRISIS_RESOURCES = [
	{ name: 'SA Depression & Anxiety Group', phone: '080 056 78 78' },
	{ name: 'Lifeline', phone: '086 132 23 22' },
	{ name: 'Suicide Crisis Line', phone: '080 567 678' },
];

interface CrisisResourcesModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onGoBack: () => void;
	onEndSession: () => void;
}

export function CrisisResourcesModal({
	open,
	onOpenChange,
	onGoBack,
	onEndSession,
}: CrisisResourcesModalProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-destructive">
						<Heart className="h-5 w-5" />
						We care about you
					</DialogTitle>
					<DialogDescription>
						It looks like you might be having a tough time. Please reach out to these resources -
						they are here to help you.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-3 py-4">
					{CRISIS_RESOURCES.map((resource) => (
						<div
							key={resource.name}
							className="flex items-center justify-between p-3 rounded-lg border bg-card"
						>
							<span className="text-sm font-medium">{resource.name}</span>
							<a
								href={`tel:${resource.phone.replace(/\s/g, '')}`}
								className="text-sm text-primary hover:underline"
							>
								{resource.phone}
							</a>
						</div>
					))}
				</div>

				<DialogFooter className="flex-col sm:flex-row gap-2">
					<Button variant="outline" onClick={onGoBack} className="w-full">
						Go back
					</Button>
					<Button variant="destructive" onClick={onEndSession} className="w-full">
						End session
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
