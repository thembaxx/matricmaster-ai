import { cn } from '@/lib/utils';
import type { EdgeCaseType } from '@/services/edge-case-service';
import { EDGE_CASE_ICONS } from './constants';

interface EdgeCaseBadgeProps {
	type: EdgeCaseType;
	count?: number;
	onClick?: () => void;
	className?: string;
}

export function EdgeCaseBadge({ type, count, onClick, className }: EdgeCaseBadgeProps) {
	const Icon = EDGE_CASE_ICONS[type];

	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				'inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium',
				'bg-muted text-muted-foreground hover:bg-muted/80 transition-colors',
				className
			)}
		>
			<Icon className="h-3 w-3" />
			<span>{type.replace(/_/g, ' ').toLowerCase()}</span>
			{count !== undefined && count > 0 && (
				<span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">{count}</span>
			)}
		</button>
	);
}
