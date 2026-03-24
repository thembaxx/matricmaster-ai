'use client';

import { Badge } from '@/components/ui/badge';

type Difficulty = 'easy' | 'medium' | 'hard';
type Role = 'admin' | 'moderator' | 'user';
type UserStatus = 'active' | 'blocked' | 'deleted';

interface DifficultyBadgeProps {
	difficulty: Difficulty;
}

interface RoleBadgeProps {
	role: Role | string;
}

interface StatusBadgeProps {
	isBlocked: boolean;
	deletedAt: Date | null;
}

export function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
	const colors: Record<Difficulty, string> = {
		easy: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
		medium: 'bg-brand-amber/10 text-brand-amber dark:bg-brand-amber/20',
		hard: 'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400',
	};

	return (
		<Badge className={`rounded-lg  tracking-widest text-[9px] font-black ${colors[difficulty]}`}>
			{difficulty}
		</Badge>
	);
}

export function RoleBadge({ role }: RoleBadgeProps) {
	const colors: Record<string, string> = {
		admin: 'bg-primary text-primary-foreground font-black',
		moderator: 'bg-blue-500 text-white font-black',
		user: 'bg-muted text-muted-foreground font-bold',
	};

	return (
		<Badge
			className={`rounded-lg  tracking-widest text-[9px] font-black ${colors[role] || colors.user}`}
		>
			{role}
		</Badge>
	);
}

export function UserStatusBadge({ isBlocked, deletedAt }: StatusBadgeProps) {
	const colorMap: Record<UserStatus, string> = {
		active: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
		blocked: 'bg-brand-amber/10 text-brand-amber border-brand-amber/20',
		deleted: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
	};

	const status: UserStatus = deletedAt ? 'deleted' : isBlocked ? 'blocked' : 'active';

	return (
		<Badge
			variant="outline"
			className={`rounded-lg  tracking-widest text-[9px] font-black border-2 ${colorMap[status]}`}
		>
			{status.charAt(0).toUpperCase() + status.slice(1)}
		</Badge>
	);
}

export function getDifficultyColor(difficulty: string): string {
	switch (difficulty) {
		case 'easy':
			return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400';
		case 'medium':
			return 'bg-brand-amber/10 text-brand-amber dark:bg-brand-amber/20';
		case 'hard':
			return 'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400';
		default:
			return 'bg-muted text-label-secondary';
	}
}

export function getRoleColor(role: string): string {
	switch (role) {
		case 'admin':
			return 'bg-primary text-primary-foreground font-black';
		case 'moderator':
			return 'bg-blue-500 text-white font-black';
		default:
			return 'bg-muted text-muted-foreground font-bold';
	}
}

export function getStatusColor(isBlocked: boolean, deletedAt: Date | null): string {
	if (deletedAt) return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
	if (isBlocked) return 'bg-brand-amber/10 text-brand-amber border-brand-amber/20';
	return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
}

export function getStatusText(isBlocked: boolean, deletedAt: Date | null): string {
	if (deletedAt) return 'Deleted';
	if (isBlocked) return 'Blocked';
	return 'Active';
}
