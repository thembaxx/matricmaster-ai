'use client';

import {
	AlertCircleIcon,
	BookOpen01Icon,
	Cancel01Icon as CloseIcon,
	Search01Icon,
	Tick01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { CURRICULUM_DATA, type TopicStatus } from '@/data/curriculum';
import { cn } from '@/lib/utils';

export type FilterType = TopicStatus | 'all' | 'needs-attention';

interface TopicFiltersProps {
	searchQuery: string;
	onSearchChange: (query: string) => void;
	statusFilter: FilterType;
	onStatusFilterChange: (filter: FilterType) => void;
	filteredStats?: {
		total: number;
		mastered: number;
		inProgress: number;
		needsAttention: number;
	};
}

export function TopicFilters({
	searchQuery,
	onSearchChange,
	statusFilter,
	onStatusFilterChange,
	filteredStats,
}: TopicFiltersProps) {
	const totalTopics = CURRICULUM_DATA.reduce((acc, s) => acc + s.topics.length, 0);
	const masteredCount = CURRICULUM_DATA.reduce(
		(acc, s) => acc + s.topics.filter((t) => t.status === 'mastered').length,
		0
	);
	const inProgressCount = CURRICULUM_DATA.reduce(
		(acc, s) => acc + s.topics.filter((t) => t.status === 'in-progress').length,
		0
	);
	const needsAttentionCount = CURRICULUM_DATA.reduce(
		(acc, s) => acc + s.topics.filter((t) => t.status === 'in-progress' && t.progress < 60).length,
		0
	);
	const notStartedCount = CURRICULUM_DATA.reduce(
		(acc, s) => acc + s.topics.filter((t) => t.status === 'not-started').length,
		0
	);

	const hasActiveFilters = searchQuery || statusFilter !== 'all';

	return (
		<div className="space-y-3 mb-6">
			<div className="relative">
				<HugeiconsIcon
					icon={Search01Icon}
					className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
				/>
				<input
					type="text"
					placeholder="Search subjects or topics..."
					value={searchQuery}
					onChange={(e) => onSearchChange(e.target.value)}
					className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-border rounded-xl text-sm font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
				/>
				{searchQuery && (
					<button
						type="button"
						onClick={() => onSearchChange('')}
						className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
					>
						<HugeiconsIcon icon={CloseIcon} className="w-4 h-4" />
					</button>
				)}
			</div>

			<div className="flex gap-2 flex-wrap">
				<FilterButton active={statusFilter === 'all'} onClick={() => onStatusFilterChange('all')}>
					All ({totalTopics})
				</FilterButton>
				<FilterButton
					active={statusFilter === 'mastered'}
					onClick={() => onStatusFilterChange('mastered')}
					icon={Tick01Icon}
					iconClassName="text-success"
				>
					Mastered ({masteredCount})
				</FilterButton>
				<FilterButton
					active={statusFilter === 'in-progress'}
					onClick={() => onStatusFilterChange('in-progress')}
				>
					<div className="w-2 h-2 rounded-full bg-current" />
					In Progress ({inProgressCount})
				</FilterButton>
				<FilterButton
					active={statusFilter === 'needs-attention'}
					onClick={() => onStatusFilterChange('needs-attention')}
					icon={AlertCircleIcon}
					iconClassName="text-destructive"
				>
					Needs Attention ({needsAttentionCount})
				</FilterButton>
				<FilterButton
					active={statusFilter === 'not-started'}
					onClick={() => onStatusFilterChange('not-started')}
					icon={BookOpen01Icon}
				>
					Not Started ({notStartedCount})
				</FilterButton>
			</div>

			{hasActiveFilters && filteredStats && (
				<div className="flex items-center justify-between text-xs text-muted-foreground">
					<span>
						Showing {filteredStats.total} topics
						{searchQuery && ` for "${searchQuery}"`}
						{statusFilter !== 'all' && ` (${statusFilter})`}
					</span>
					<button
						type="button"
						onClick={() => {
							onSearchChange('');
							onStatusFilterChange('all');
						}}
						className="text-primary hover:underline font-medium"
					>
						Clear filters
					</button>
				</div>
			)}
		</div>
	);
}

function FilterButton({
	children,
	active,
	onClick,
	icon: Icon,
	iconClassName,
	variant,
}: {
	children: React.ReactNode;
	active: boolean;
	onClick: () => void;
	icon?: typeof Tick01Icon;
	iconClassName?: string;
	variant?: 'default' | 'success' | 'warning' | 'danger' | 'neutral';
}) {
	const variantStyles = {
		default: 'bg-primary text-white',
		success: 'bg-success text-white',
		warning: 'bg-warning text-white',
		danger: 'bg-destructive text-white',
		neutral: 'bg-muted-foreground text-white',
	};

	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				'px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5',
				active
					? variantStyles[variant || 'default']
					: 'bg-white dark:bg-zinc-900 border border-border text-muted-foreground hover:border-primary/50'
			)}
		>
			{Icon && <HugeiconsIcon icon={Icon} className={cn('w-3 h-3', iconClassName)} />}
			{children}
		</button>
	);
}
