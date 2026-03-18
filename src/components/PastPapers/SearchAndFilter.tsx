'use client';

import { Cancel01Icon, Settings02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Icon } from '@iconify/react';
import { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SearchBarProps {
	value: string;
	onChange: (value: string) => void;
}

export const SearchBar = memo(function SearchBar({ value, onChange }: SearchBarProps) {
	return (
		<div className="lg:col-span-8 flex items-center relative">
			<Icon
				icon="fluent:search-20-regular"
				className="w-5 sm:w-6 h-5 absolute left-4 z-1 sm:h-6 text-label-tertiary"
			/>
			<Input
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder="Search"
				className="pl-12 sm:pl-16 placeholder:font-medium placeholder:capitalize pr-12 sm:pr-16 bg-card backdrop-blur-md border-border border-2 h-12 sm:h-16 rounded-xl sm:rounded-2xl text-base sm:text-lg font-black uppercase tracking-tight shadow-inner"
				aria-label="Search past papers"
			/>
		</div>
	);
});

interface YearFilterProps {
	years: (number | string)[];
	selectedYear: number | string;
	onYearChange: (year: number | string) => void;
}

export const YearFilter = memo(function YearFilter({
	years,
	selectedYear,
	onYearChange,
}: YearFilterProps) {
	return (
		<div className="lg:col-span-4 flex gap-2 sm:gap-3 overflow-x-auto no-scrollbar py-1">
			{years.map((year) => (
				<button
					key={year}
					type="button"
					onClick={() => onYearChange(year)}
					aria-pressed={selectedYear === year}
					className={cn(
						'rounded-xl sm:rounded-2xl px-4 sm:px-8 py-2 sm:py-3 text-[11px] font-black uppercase tracking-widest transition-all h-10 sm:h-16 whitespace-nowrap ios-active-scale',
						selectedYear === year
							? 'bg-primary text-primary-foreground shadow-2xl shadow-primary/30'
							: 'bg-secondary text-label-secondary border-2 border-transparent hover:border-border backdrop-blur-sm'
					)}
				>
					{year}
				</button>
			))}
		</div>
	);
});

interface FilterButtonProps {
	activeFilterCount: number;
	onClick: () => void;
}

export const FilterButton = memo(function FilterButton({
	activeFilterCount,
	onClick,
}: FilterButtonProps) {
	return (
		<Button
			variant="outline"
			onClick={onClick}
			aria-label={`Advanced Faders${activeFilterCount > 0 ? `, ${activeFilterCount} active` : ''}`}
			className={cn(
				'rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest px-4 sm:px-6 h-10 sm:h-12 ios-active-scale',
				activeFilterCount > 0 && 'border-primary bg-primary/10 text-primary'
			)}
		>
			<HugeiconsIcon icon={Settings02Icon} className="w-4 h-4 mr-2" />
			<span className="hidden sm:inline">Advanced Faders</span>
			{activeFilterCount > 0 && (
				<Badge className="ml-2 rounded-full px-2 py-0.5 text-[9px] bg-primary text-primary-foreground">
					{activeFilterCount}
				</Badge>
			)}
		</Button>
	);
});

interface ClearFiltersButtonProps {
	onClick: () => void;
}

export const ClearFiltersButton = memo(function ClearFiltersButton({
	onClick,
}: ClearFiltersButtonProps) {
	return (
		<Button
			variant="ghost"
			onClick={onClick}
			aria-label="Clear all filters"
			className="rounded-2xl font-black text-[10px] uppercase tracking-widest px-3 sm:px-4 h-10 sm:h-12 text-label-tertiary hover:text-foreground ios-active-scale"
		>
			<HugeiconsIcon icon={Cancel01Icon} className="w-4 h-4 mr-1 sm:mr-2" />
			<span className="hidden sm:inline">Clear</span>
		</Button>
	);
});
