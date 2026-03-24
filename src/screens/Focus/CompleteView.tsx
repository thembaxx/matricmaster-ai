import { CheckmarkCircle02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface CompleteViewProps {
	title: string;
	onContinue: () => void;
}

export function CompleteView({ title, onContinue }: CompleteViewProps) {
	return (
		<m.div
			key="complete"
			initial={{ opacity: 0, scale: 0.8 }}
			animate={{ opacity: 1, scale: 1 }}
			className="text-center"
		>
			<div className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-8 text-success shadow-success/20 shadow-2xl">
				<HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-12 h-12" />
			</div>
			<h2 className="text-4xl font-black tracking-tighter  mb-2">Session Complete!</h2>
			<p className="text-muted-foreground font-bold  text-xs tracking-widest mb-12">
				You've mastered {title}
			</p>
			<Button
				size="lg"
				onClick={onContinue}
				className="rounded-full px-10 h-14 font-black  text-xs tracking-widest shadow-xl shadow-primary/20"
			>
				Continue Journey
			</Button>
		</m.div>
	);
}
