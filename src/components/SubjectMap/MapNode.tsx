'use client';

import { SquareLock01Icon, SquareUnlock01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { Handle, type NodeProps, Position } from 'reactflow';
import { cn } from '@/lib/utils';
import type { MapNodeData } from './types';

const masteryStyles: Record<string, { bg: string; border: string; text: string; glow: string }> = {
	unknown: {
		bg: 'bg-muted/60',
		border: 'border-muted-foreground/20',
		text: 'text-muted-foreground',
		glow: '',
	},
	learning: {
		bg: 'bg-blue-500/10',
		border: 'border-blue-500/40',
		text: 'text-blue-400',
		glow: 'shadow-blue-500/20 shadow-lg',
	},
	mastered: {
		bg: 'bg-emerald-500/10',
		border: 'border-emerald-500/40',
		text: 'text-emerald-400',
		glow: 'shadow-emerald-500/20 shadow-lg',
	},
};

export function MapNode({ data, selected }: NodeProps<MapNodeData>) {
	const style = masteryStyles[data.mastery] || masteryStyles.unknown;
	const isLocked = data.isLocked;

	return (
		<m.div
			initial={{ opacity: 0, scale: 0.8 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
			className={cn(
				'px-4 py-3 rounded-2xl border-2 min-w-[140px] max-w-[200px] transition-all duration-200',
				isLocked && 'opacity-40 grayscale',
				!isLocked && 'cursor-pointer hover:scale-105',
				style.bg,
				style.border,
				!isLocked && style.glow,
				selected && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
			)}
		>
			<Handle
				type="target"
				position={Position.Top}
				className="!bg-muted-foreground/40 !w-2 !h-2 !border-0"
			/>

			<div className="flex items-center gap-2 mb-1">
				{isLocked ? (
					<HugeiconsIcon
						icon={SquareLock01Icon}
						className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0"
					/>
				) : (
					<HugeiconsIcon icon={SquareUnlock01Icon} className="w-3.5 h-3.5 shrink-0" style={style} />
				)}
				<span
					className={cn(
						'text-xs font-medium truncate',
						isLocked ? 'text-muted-foreground/60' : style.text
					)}
				>
					{data.subject}
				</span>
			</div>

			<p
				className={cn(
					'text-sm font-semibold leading-snug',
					isLocked ? 'text-muted-foreground/50' : 'text-foreground'
				)}
			>
				{data.topic}
			</p>

			{!isLocked && data.mastery === 'mastered' && (
				<div className="mt-1.5 flex items-center gap-1">
					<div className="h-1 flex-1 rounded-full bg-emerald-500/30 overflow-hidden">
						<div className="h-full w-full bg-emerald-500 rounded-full" />
					</div>
					<span className="text-[10px] font-medium text-emerald-400">done</span>
				</div>
			)}

			{!isLocked && data.mastery === 'learning' && (
				<div className="mt-1.5 flex items-center gap-1">
					<div className="h-1 flex-1 rounded-full bg-blue-500/30 overflow-hidden">
						<div className="h-full w-1/2 bg-blue-500 rounded-full" />
					</div>
					<span className="text-[10px] font-medium text-blue-400">{data.estimatedHours}h</span>
				</div>
			)}

			{!isLocked && data.mastery === 'unknown' && (
				<span className="text-[10px] text-muted-foreground/60 mt-1 block">
					{data.estimatedHours}h to master
				</span>
			)}

			<Handle
				type="source"
				position={Position.Bottom}
				className="!bg-muted-foreground/40 !w-2 !h-2 !border-0"
			/>
		</m.div>
	);
}
