'use client';

import { cn } from '@/lib/utils';

interface DiagramContainerProps {
	children: React.ReactNode;
	className?: string;
	hideSlider?: boolean;
	label?: string;
	minLabel?: string;
	maxLabel?: string;
	value?: number;
	onChange?: (value: number) => void;
	min?: number;
	max?: number;
}

export function DiagramContainer({
	children,
	className,
	hideSlider = false,
	label,
	minLabel,
	maxLabel,
	value,
	onChange,
	min = 0,
	max = 100,
}: DiagramContainerProps) {
	return (
		<div className={cn('w-full bg-secondary/30 rounded-[2rem] p-8 flex flex-col gap-6', className)}>
			<div className="h-48 relative bg-card rounded-2xl border border-border/50 overflow-hidden">
				{children}
			</div>
			{!hideSlider && (
				<div className="space-y-2">
					<div className="flex justify-between text-[10px] font-black  tracking-widest text-muted-foreground">
						<span>{minLabel}</span>
						<span>{label}</span>
						<span>{maxLabel}</span>
					</div>
					<input
						type="range"
						min={min}
						max={max}
						value={value}
						onChange={(e) => onChange?.(Number.parseInt(e.target.value, 10))}
						className="w-full accent-primary"
					/>
				</div>
			)}
		</div>
	);
}
