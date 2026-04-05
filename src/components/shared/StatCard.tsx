'use client';

import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import { m } from 'framer-motion';
import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface TrendIndicatorProps {
	value: number;
	formatter?: (value: number) => string;
}

const TrendIndicator = memo(function TrendIndicator({
	value,
	formatter = (v) => `${v > 0 ? '+' : ''}${v}%`,
}: TrendIndicatorProps) {
	const isPositive = value > 0;
	const isNegative = value < 0;
	const colorClass = isPositive
		? 'text-accent-lime'
		: isNegative
			? 'text-primary-red'
			: 'text-muted-foreground';

	return (
		<div className={`flex items-center gap-1 text-xs font-black  tracking-widest ${colorClass}`}>
			<span className="text-[8px]">{isPositive ? '▲' : isNegative ? '▼' : '●'}</span>
			<span>{formatter(value)}</span>
		</div>
	);
});

interface StatCardProps {
	icon: IconSvgElement;
	value: string | number;
	label: string;
	trend?: number;
	trendLabel?: string;
	trendFormatter?: (value: number) => string;
	color?: 'violet' | 'lime' | 'orange' | 'cyan' | 'amber';
	size?: 'default' | 'compact';
	className?: string;
	onClick?: () => void;
}

const colorMap = {
	violet: {
		bg: 'bg-primary-violet/10',
		icon: 'text-primary-violet',
		ring: 'ring-primary-violet/20',
	},
	lime: {
		bg: 'bg-accent-lime/10',
		icon: 'text-accent-lime',
		ring: 'ring-accent-lime/20',
	},
	orange: {
		bg: 'bg-primary-orange/10',
		icon: 'text-primary-orange',
		ring: 'ring-primary-orange/20',
	},
	cyan: {
		bg: 'bg-primary-cyan/10',
		icon: 'text-primary-cyan',
		ring: 'ring-primary-cyan/20',
	},
	amber: {
		bg: 'bg-brand-amber/10',
		icon: 'text-brand-amber',
		ring: 'ring-brand-amber/20',
	},
};

export const StatCard = memo(function StatCard({
	icon,
	value,
	label,
	trend,
	trendLabel,
	trendFormatter,
	color = 'violet',
	size = 'default',
	className = '',
	onClick,
}: StatCardProps) {
	const colorTheme = colorMap[color];
	const isCompact = size === 'compact';
	const iconSize = isCompact ? 'w-8 h-8' : 'w-10 h-10';
	const containerPadding = isCompact ? 'p-4 sm:p-5' : 'p-6 sm:p-8';

	const content = (
		<Card
			className={`
				${containerPadding}
				rounded-3xl border border-border bg-card/50 backdrop-blur-sm
				relative overflow-hidden group shadow-xl hover:shadow-soft-lg transition-all duration-500
				${onClick ? 'cursor-pointer' : ''}
				${className}
			`}
		>
			<div className="flex items-center gap-4 sm:gap-6 relative z-10">
				<div
					className={`
						${colorTheme.bg} ${iconSize} rounded-2xl
						flex items-center justify-center
						group-hover:scale-110 transition-transform duration-500
						shadow-inner
					`}
				>
					<HugeiconsIcon
						icon={icon}
						className={`${colorTheme.icon} ${isCompact ? 'w-5 h-5' : 'w-6 h-6'}`}
					/>
				</div>
				<div className={`space-y-1 ${isCompact ? 'min-w-0' : ''}`}>
					<p
						className={`
							${isCompact ? 'text-[9px]' : 'text-[10px]'}
							font-black text-label-tertiary  tracking-[0.2em]
						`}
					>
						{label}
					</p>
					{typeof value === 'number' ? (
						<m.h4
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							className={`
								${isCompact ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl'}
								font-black text-foreground tracking-tighter
							`}
						>
							{value.toLocaleString()}
						</m.h4>
					) : (
						<h4
							className={`
								${isCompact ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl'}
								font-black text-foreground tracking-tighter
							`}
						>
							{value}
						</h4>
					)}
					{trend !== undefined && <TrendIndicator value={trend} formatter={trendFormatter} />}
					{trendLabel && (
						<p className="text-[9px] font-bold text-muted-foreground  tracking-wider">
							{trendLabel}
						</p>
					)}
				</div>
			</div>
		</Card>
	);

	if (onClick) {
		return (
			<Button
				type="button"
				variant="ghost"
				onClick={onClick}
				className="w-full text-left p-0 h-auto"
			>
				{content}
			</Button>
		);
	}

	return content;
});

export default StatCard;
