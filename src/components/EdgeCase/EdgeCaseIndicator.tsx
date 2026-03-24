import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EdgeCaseType } from '@/services/edge-case-service';

interface EdgeCaseIndicatorProps {
	activeEdgeCases: EdgeCaseType[];
	onClick?: () => void;
	className?: string;
}

export function EdgeCaseIndicator({ activeEdgeCases, onClick, className }: EdgeCaseIndicatorProps) {
	if (activeEdgeCases.length === 0) return null;

	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg',
				'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
				'text-sm font-medium hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors',
				className
			)}
		>
			<AlertTriangle className="h-4 w-4" />
			<span>
				{activeEdgeCases.length} support {activeEdgeCases.length === 1 ? 'tip' : 'tips'} available
			</span>
		</button>
	);
}
