'use client';

import {
	DndContext,
	type DragEndEvent,
	PointerSensor,
	useDraggable,
	useDroppable,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { AnimatePresence, motion as m } from 'motion/react';
import Image from 'next/image';
import { useCallback, useState } from 'react';
import { cn } from '@/lib/utils';

export interface DiagramZone {
	id: string;
	label: string;
	x: number;
	y: number;
	width: number;
	height: number;
}

export interface DiagramLabel {
	id: string;
	text: string;
	zoneId: string;
}

interface DraggableDiagramProps {
	zones: DiagramZone[];
	labels: DiagramLabel[];
	imageUrl?: string;
	answer: Record<string, string>;
	isChecked: boolean;
	onChange: (mapping: Record<string, string>) => void;
}

function DraggableLabel({ id, text, disabled }: { id: string; text: string; disabled: boolean }) {
	const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
		id,
		data: { text },
		disabled,
	});

	const style = transform
		? { transform: CSS.Translate.toString(transform), zIndex: 50 }
		: undefined;

	return (
		<m.div
			ref={setNodeRef}
			style={style}
			{...listeners}
			{...attributes}
			initial={{ opacity: 0, scale: 0.9 }}
			animate={{
				opacity: 1,
				scale: 1,
				boxShadow: isDragging ? '0 8px 24px rgba(0,0,0,0.15)' : undefined,
			}}
			className={cn(
				'px-3 py-1.5 rounded-xl text-xs font-medium select-none touch-none',
				'bg-card border border-border/50 shadow-sm',
				isDragging && 'shadow-lg ring-2 ring-primary/30',
				disabled ? 'cursor-default opacity-70' : 'cursor-grab active:cursor-grabbing'
			)}
		>
			{text}
		</m.div>
	);
}

function DroppableZone({
	zone,
	placedLabelId,
	labels,
	isChecked,
	answer,
	children,
}: {
	zone: DiagramZone;
	placedLabelId: string | null;
	labels: DiagramLabel[];
	isChecked: boolean;
	answer: Record<string, string>;
	children?: React.ReactNode;
}) {
	const { isOver, setNodeRef } = useDroppable({ id: zone.id });
	const placedLabel = placedLabelId ? labels.find((l) => l.id === placedLabelId) : null;
	const isCorrect = isChecked && placedLabelId && answer[zone.id] === placedLabelId;
	const isWrong = isChecked && placedLabelId && answer[zone.id] !== placedLabelId;

	return (
		<div
			ref={setNodeRef}
			className={cn(
				'absolute rounded-xl border-2 border-dashed flex items-center justify-center transition-all',
				isOver && 'border-primary bg-primary/5 scale-105',
				isCorrect && 'border-emerald-500 bg-emerald-500/10',
				isWrong && 'border-red-500 bg-red-500/10',
				!isOver && !isChecked && 'border-muted-foreground/30'
			)}
			style={{ left: zone.x, top: zone.y, width: zone.width, height: zone.height }}
		>
			{placedLabel ? (
				<span
					className={cn(
						'text-xs font-semibold px-2 py-1 rounded-lg',
						isCorrect && 'text-emerald-400',
						isWrong && 'text-red-400',
						!isChecked && 'text-foreground bg-card'
					)}
				>
					{placedLabel.text}
				</span>
			) : (
				<span className="text-[10px] text-muted-foreground/40">{zone.label}</span>
			)}
			{children}
		</div>
	);
}

export function DraggableDiagram({
	zones,
	labels,
	imageUrl,
	answer,
	isChecked,
	onChange,
}: DraggableDiagramProps) {
	const [mapping, setMapping] = useState<Record<string, string>>({});
	const [poolLabels, setPoolLabels] = useState<string[]>(labels.map((l) => l.id));

	const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

	const handleDragEnd = useCallback(
		(event: DragEndEvent) => {
			const { active, over } = event;
			if (!over) return;

			const labelId = active.id as string;
			const zoneId = over.id as string;

			const newMapping = { ...mapping };

			for (const [z, l] of Object.entries(newMapping)) {
				if (l === labelId) delete newMapping[z];
			}

			if (newMapping[zoneId]) {
				const displacedLabel = newMapping[zoneId];
				setPoolLabels((prev) => [...prev, displacedLabel]);
			}

			newMapping[zoneId] = labelId;
			setMapping(newMapping);
			onChange(newMapping);

			setPoolLabels((prev) => prev.filter((id) => id !== labelId));
		},
		[mapping, onChange]
	);

	const handleRemoveFromZone = useCallback(
		(zoneId: string) => {
			if (isChecked) return;
			const labelId = mapping[zoneId];
			if (!labelId) return;

			const newMapping = { ...mapping };
			delete newMapping[zoneId];
			setMapping(newMapping);
			onChange(newMapping);
			setPoolLabels((prev) => [...prev, labelId]);
		},
		[mapping, isChecked, onChange]
	);

	return (
		<DndContext sensors={sensors} onDragEnd={handleDragEnd}>
			<div className="space-y-4">
				<div
					className="relative bg-muted/30 rounded-2xl border border-border/30 overflow-hidden"
					style={{ minHeight: 300 }}
				>
					{imageUrl && (
						<Image
							src={imageUrl}
							alt="diagram"
							className="w-full h-full object-contain opacity-30"
							fill
						/>
					)}
					{zones.map((zone) => (
						<DroppableZone
							key={zone.id}
							zone={zone}
							placedLabelId={mapping[zone.id] || null}
							labels={labels}
							isChecked={isChecked}
							answer={answer}
						>
							{mapping[zone.id] && !isChecked && (
								<button
									type="button"
									onClick={() => handleRemoveFromZone(zone.id)}
									className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-muted-foreground/30 text-[8px] flex items-center justify-center hover:bg-destructive transition-colors"
								>
									x
								</button>
							)}
						</DroppableZone>
					))}
				</div>

				<div className="flex flex-wrap gap-2 p-3 bg-muted/20 rounded-xl border border-border/20">
					<span className="text-[10px] text-muted-foreground font-medium w-full mb-1">labels</span>
					<AnimatePresence>
						{poolLabels.map((labelId) => {
							const label = labels.find((l) => l.id === labelId);
							if (!label) return null;
							return (
								<DraggableLabel
									key={label.id}
									id={label.id}
									text={label.text}
									disabled={isChecked}
								/>
							);
						})}
					</AnimatePresence>
					{poolLabels.length === 0 && (
						<span className="text-[10px] text-muted-foreground/50">all labels placed</span>
					)}
				</div>
			</div>
		</DndContext>
	);
}
