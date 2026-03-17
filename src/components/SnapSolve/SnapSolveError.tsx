'use client';

import { m } from 'framer-motion';
import { AlertCircle, BrainIcon, RefreshCw, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type ErrorType = 'ocr' | 'generation' | 'unsupported' | 'quota';

interface SnapSolveErrorProps {
	type: ErrorType;
	onRetry?: () => void;
	onUseOwnKey?: () => void;
	onRefine?: () => void;
}

const ERROR_MESSAGES = {
	ocr: {
		title: "We couldn't read the question",
		description: 'Please ensure the photo is clear and try again.',
		icon: AlertCircle,
	},
	generation: {
		title: 'AI is a bit busy right now',
		description: 'Try again in a moment.',
		icon: RefreshCw,
	},
	unsupported: {
		title: 'Subject not supported',
		description:
			'This AI focuses on Grade 12 NSC curriculum. Try a math, science, or language question!',
		icon: BrainIcon,
	},
	quota: {
		title: 'AI quota exceeded',
		description: 'Add your own API key to continue.',
		icon: AlertCircle,
	},
};

export function SnapSolveError({ type, onRetry, onUseOwnKey, onRefine }: SnapSolveErrorProps) {
	const { title, description, icon: Icon } = ERROR_MESSAGES[type];

	return (
		<m.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
			<Card className="p-6 text-center max-w-md mx-auto">
				<div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
					<Icon className="w-8 h-8 text-muted-foreground" />
				</div>
				<h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
				<p className="text-sm text-muted-foreground mb-6">{description}</p>
				<div className="flex flex-col gap-2">
					{onRetry && (
						<Button onClick={onRetry} className="w-full gap-2">
							<RefreshCw className="w-4 h-4" />
							Try Again
						</Button>
					)}
					{type === 'ocr' && onRefine && (
						<Button variant="outline" onClick={onRefine} className="w-full gap-2">
							<Upload className="w-4 h-4" />
							Select Specific Area
						</Button>
					)}
					{type === 'quota' && onUseOwnKey && (
						<Button variant="outline" onClick={onUseOwnKey} className="w-full">
							Add Your Own API Key
						</Button>
					)}
				</div>
			</Card>
		</m.div>
	);
}
