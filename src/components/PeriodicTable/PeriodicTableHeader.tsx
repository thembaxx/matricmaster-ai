'use client';

import { SearchIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import type { TrendMode } from '@/constants/periodic-table';
import { cn } from '@/lib/utils';

interface TrendOption {
	value: string;
	label: string;
}

const TREND_OPTIONS: TrendOption[] = [
	{ value: 'electronegativity', label: 'electronegativity' },
	{ value: 'atomicRadius', label: 'atomic radius' },
	{ value: 'ionizationEnergy', label: 'ionization energy' },
	{ value: 'density', label: 'density' },
];

interface PeriodicTableHeaderProps {
	searchQuery: string;
	onSearchChange: (query: string) => void;
	selectedGroup: string;
	onGroupChange: (group: string) => void;
	trendsMode: TrendMode;
	onTrendsModeChange: (mode: TrendMode) => void;
	compareMode: boolean;
	onCompareModeChange: (enabled: boolean) => void;
	compareElementsCount: number;
	onStartQuiz: () => void;
	filteredCount: number;
	totalCount: number;
}

export function PeriodicTableHeader({
	searchQuery,
	onSearchChange,
	selectedGroup,
	onGroupChange,
	trendsMode,
	onTrendsModeChange,
	compareMode,
	onCompareModeChange,
	compareElementsCount,
	onStartQuiz,
	filteredCount,
	totalCount,
}: PeriodicTableHeaderProps) {
	const showFilters = searchQuery !== '' || selectedGroup !== 'all';

	return (
		<header className="px-4 sm:px-6 pt-6 pb-3 shrink-0 max-w-6xl mx-auto w-full space-y-3">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<h1 className="text-xl font-black tracking-normal">periodic table</h1>
					<Button
						variant="outline"
						size="sm"
						onClick={onStartQuiz}
						className="rounded-full font-bold text-xs"
					>
						take quiz
					</Button>
					<Select
						value={trendsMode || 'none'}
						onValueChange={(val) => onTrendsModeChange(val === 'none' ? null : (val as TrendMode))}
					>
						<SelectTrigger className="w-[140px] h-8 rounded-full text-xs font-bold">
							<SelectValue placeholder="trends" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="none">view mode</SelectItem>
							{TREND_OPTIONS.map((opt) => (
								<SelectItem key={opt.value} value={opt.value}>
									{opt.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Button
						variant={compareMode ? 'default' : 'outline'}
						size="sm"
						onClick={() => {
							onCompareModeChange(!compareMode);
							if (compareMode) {
								// Reset compare elements if disabling
							}
						}}
						className="rounded-full font-bold text-xs"
					>
						compare{compareElementsCount > 0 ? ` (${compareElementsCount})` : ''}
					</Button>
				</div>
				<div className="text-xs font-medium text-muted-foreground hidden sm:block">
					{trendsMode
						? 'view periodic trends'
						: compareMode
							? 'select 2 elements to compare'
							: 'click any element to learn more'}
				</div>
			</div>
			<div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
				<div className="relative flex-1">
					<HugeiconsIcon
						icon={SearchIcon}
						className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-2"
					/>

					<Input
						placeholder="search by name, symbol, or number..."
						value={searchQuery}
						onChange={(e) => onSearchChange(e.target.value)}
						className="pl-9 pr-9 h-10 bg-background/80 backdrop-blur-sm placeholder:text-sm"
					/>
					{searchQuery && (
						<button
							type="button"
							onClick={() => onSearchChange('')}
							className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors z-2"
							aria-label="Clear search"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								aria-hidden="true"
							>
								<title>Clear search</title>
								<line x1="18" y1="6" x2="6" y2="18" />
								<line x1="6" y1="6" x2="18" y2="18" />
							</svg>
						</button>
					)}
				</div>
				<Select value={selectedGroup} onValueChange={onGroupChange}>
					<SelectTrigger className="w-full sm:w-[180px] h-10 bg-background/80 backdrop-blur-sm">
						<SelectValue placeholder="filter by group" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">all groups</SelectItem>
						<SelectItem value="nonmetal">nonmetals</SelectItem>
						<SelectItem value="noble">noble gases</SelectItem>
						<SelectItem value="alkali">alkali metals</SelectItem>
						<SelectItem value="alkaline">alkaline earth</SelectItem>
						<SelectItem value="metalloid">metalloids</SelectItem>
						<SelectItem value="halogen">halogens</SelectItem>
						<SelectItem value="transition">transition metals</SelectItem>
						<SelectItem value="metal">post-transition</SelectItem>
						<SelectItem value="lanthanide">lanthanides</SelectItem>
						<SelectItem value="actinide">actinides</SelectItem>
					</SelectContent>
				</Select>
			</div>
			<div className="flex flex-wrap gap-1.5">
				{[
					{ value: 'nonmetal', label: 'Nonmetals', color: 'bg-primary-violet' },
					{ value: 'noble', label: 'Noble Gases', color: 'bg-accent-blue' },
					{ value: 'alkali', label: 'Alkali', color: 'bg-primary-orange' },
					{ value: 'halogen', label: 'Halogens', color: 'bg-destructive' },
					{ value: 'transition', label: 'Transition', color: 'bg-blue-500' },
				].map((group) => (
					<button
						type="button"
						key={group.value}
						onClick={() => onGroupChange(selectedGroup === group.value ? 'all' : group.value)}
						className={cn(
							'px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider transition-all border',
							selectedGroup === group.value
								? `${group.color}/30 border-current text-foreground ring-1 ring-current`
								: 'bg-muted/50 border-border text-muted-foreground hover:bg-muted hover:text-foreground'
						)}
					>
						{group.label.toLowerCase()}
					</button>
				))}
			</div>
			{showFilters && (
				<div className="flex items-center gap-2 flex-wrap">
					<span className="text-xs text-muted-foreground">
						showing {filteredCount} of {totalCount} elements
					</span>
					<button
						type="button"
						onClick={() => {
							onSearchChange('');
							onGroupChange('all');
						}}
						className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
					>
						clear filters
					</button>
				</div>
			)}
		</header>
	);
}

export { TREND_OPTIONS };
