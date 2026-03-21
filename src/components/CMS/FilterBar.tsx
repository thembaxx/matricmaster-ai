'use client';

import { Search01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import type { Subject } from '@/lib/db/schema';

interface FilterBarProps {
	activeTab: string;
	searchQuery: string;
	onSearchChange: (value: string) => void;
	selectedSubject?: string;
	onSubjectChange?: (value: string) => void;
	selectedDifficulty?: string;
	onDifficultyChange?: (value: string) => void;
	userFilter?: 'all' | 'active' | 'blocked' | 'deleted';
	onUserFilterChange?: (value: 'all' | 'active' | 'blocked' | 'deleted') => void;
	subjects?: Subject[];
}

const DEFAULT_SUBJECTS: Subject[] = [];

export function FilterBar({
	activeTab,
	searchQuery,
	onSearchChange,
	selectedSubject,
	onSubjectChange,
	selectedDifficulty,
	onDifficultyChange,
	userFilter,
	onUserFilterChange,
	subjects = DEFAULT_SUBJECTS,
}: FilterBarProps) {
	const getPlaceholder = () => {
		if (activeTab === 'users') return 'Search users...';
		return 'Search content...';
	};

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 sm:gap-4">
			<div className="sm:col-span-2 md:col-span-6 relative">
				<HugeiconsIcon
					icon={Search01Icon}
					className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"
				/>
				<Input
					value={searchQuery}
					onChange={(e) => onSearchChange(e.target.value)}
					placeholder={getPlaceholder()}
					className="pl-12 text-base h-14 bg-muted/30 border-2 rounded-2xl focus:ring-primary/20"
				/>
			</div>

			{activeTab === 'questions' && (
				<>
					<div className="md:col-span-3">
						<Select value={selectedSubject} onValueChange={onSubjectChange}>
							<SelectTrigger className="h-14 rounded-2xl border-2 bg-muted/30">
								<SelectValue placeholder="All Subjects" />
							</SelectTrigger>
							<SelectContent className="rounded-2xl">
								<SelectItem value="all">All Subjects</SelectItem>
								{subjects.map((s) => (
									<SelectItem key={s.id} value={s.id.toString()}>
										{s.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="md:col-span-3">
						<Select value={selectedDifficulty} onValueChange={onDifficultyChange}>
							<SelectTrigger className="h-14 rounded-2xl border-2 bg-muted/30">
								<SelectValue placeholder="Difficulty" />
							</SelectTrigger>
							<SelectContent className="rounded-2xl">
								<SelectItem value="all">All Levels</SelectItem>
								<SelectItem value="easy">Easy</SelectItem>
								<SelectItem value="medium">Medium</SelectItem>
								<SelectItem value="hard">Hard</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</>
			)}

			{activeTab === 'users' && userFilter && (
				<div className="md:col-span-6">
					<Select
						value={userFilter}
						onValueChange={(v) =>
							onUserFilterChange?.(v as 'all' | 'active' | 'blocked' | 'deleted')
						}
					>
						<SelectTrigger className="h-14 rounded-2xl border-2 bg-muted/30">
							<SelectValue placeholder="Filter users" />
						</SelectTrigger>
						<SelectContent className="rounded-2xl">
							<SelectItem value="all">All Users</SelectItem>
							<SelectItem value="active">Active Only</SelectItem>
							<SelectItem value="blocked">Blocked Only</SelectItem>
							<SelectItem value="deleted">Deleted Only</SelectItem>
						</SelectContent>
					</Select>
				</div>
			)}
		</div>
	);
}
