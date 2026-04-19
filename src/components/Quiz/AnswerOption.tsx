'use client';

import { CancelCircleIcon, CheckmarkCircle02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m, useMotionValue, useSpring, useTransform } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export interface AnswerOptionProps {
	id: string;
	label: string;
	isSelected: boolean;
	isCorrect: boolean;
	isChecked: boolean;
	onSelect: () => void;
	disabled?: boolean;
}

const prefersReducedMotion = () =>
	typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

interface Particle {
	id: number;
	tx: number;
	ty: number;
	color: string;
}

const PARTICLE_COLORS = ['#10b981', '#34d399', '#6ee7b7', '#059669', '#047857', '#065f46'];

export function AnswerOption({
	id,
	label,
	isSelected,
	isCorrect,
	isChecked,
	onSelect,
	disabled = false,
}: AnswerOptionProps) {
	const reduced = useRef(prefersReducedMotion());
	const [particles, setParticles] = useState<Particle[]>([]);
	const optionRef = useRef<HTMLButtonElement>(null);

	const scaleMotion = useMotionValue(isSelected ? 1 : 1);
	const translateYMotion = useMotionValue(isSelected ? -2 : 0);
	const shadowMotion = useMotionValue(0);

	const scaleSpring = useSpring(scaleMotion, { stiffness: 300, damping: 20 });
	const translateYSpring = useSpring(translateYMotion, { stiffness: 300, damping: 20 });
	const shadowSpring = useSpring(shadowMotion, { stiffness: 300, damping: 20 });

	const boxShadow = useTransform(shadowSpring, (v) =>
		v > 0 ? `0 8px 25px rgba(0,0,0,${v * 0.12})` : '0 1px 3px rgba(0,0,0,0.06)'
	);

	const iconScaleSpring = useSpring(0, { stiffness: 300, damping: 20 });

	useEffect(() => {
		if (reduced.current) return;
		if (isSelected) {
			scaleMotion.set(1.015);
			translateYMotion.set(-2);
			shadowMotion.set(1);
		} else {
			scaleMotion.set(1);
			translateYMotion.set(0);
			shadowMotion.set(0);
		}
	}, [isSelected, scaleMotion, translateYMotion, shadowMotion]);

	useEffect(() => {
		if (isChecked) {
			iconScaleSpring.set(1);
		}
	}, [isChecked, iconScaleSpring]);

	useEffect(() => {
		if (isChecked && isCorrect && particles.length === 0) {
			const newParticles: Particle[] = Array.from({ length: 6 }, (_, i) => ({
				id: i,
				tx: Math.cos((i / 6) * Math.PI * 2) * 30,
				ty: Math.sin((i / 6) * Math.PI * 2) * 30,
				color: PARTICLE_COLORS[i],
			}));
			setParticles(newParticles);
			const timeout = setTimeout(() => setParticles([]), 700);
			return () => clearTimeout(timeout);
		}
	}, [isChecked, isCorrect, particles.length]);

	useEffect(() => {
		if (isSelected && optionRef.current) {
			optionRef.current.focus();
		}
	}, [isSelected]);

	const getContainerClasses = () => {
		if (isSelected) {
			if (isChecked) {
				return isCorrect ? 'bg-emerald-50 border-emerald-500/50' : 'bg-red-50 border-red-500/50';
			}
			return 'bg-primary/8 border-primary/30';
		}
		if (isChecked && isCorrect) {
			return 'bg-emerald-50 border-emerald-500/50';
		}
		return 'bg-muted/20 border-border/40 hover:border-primary/25 hover:bg-muted/30';
	};

	const getIndicatorClasses = () => {
		if (isSelected) {
			if (isChecked) {
				return isCorrect ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white';
			}
			return 'bg-primary text-primary-foreground';
		}
		if (isChecked && isCorrect) {
			return 'bg-emerald-500 text-white';
		}
		return 'bg-muted/40 text-muted-foreground/60';
	};

	const getLabelClasses = () => {
		if (isSelected && isChecked && !isCorrect) {
			return 'text-muted-foreground/60';
		}
		return 'text-foreground';
	};

	const getResultClass = () => {
		if (!reduced.current) {
			if (isChecked && isSelected && !isCorrect) return 'quiz-wrong-shake';
			if (isChecked && (isSelected || isCorrect) && isCorrect) return 'quiz-correct-pulse';
		}
		return '';
	};

	const optionLabel = `option ${id}: ${label}`;

	return (
		<m.button
			ref={optionRef}
			initial={{ opacity: 0, x: -10 }}
			animate={{ opacity: 1, x: 0 }}
			onClick={() => !disabled && onSelect()}
			disabled={disabled}
			style={reduced.current ? undefined : { scale: scaleSpring, y: translateYSpring, boxShadow }}
			role="radio"
			aria-checked={isSelected}
			aria-label={optionLabel}
			aria-disabled={disabled}
			tabIndex={0}
			className={cn(
				'w-full flex items-center gap-4 p-4 rounded-[1.5rem] border-2 transition-colors',
				'hover:border-tiimo-lavender/30 active:scale-[0.98]',
				getContainerClasses(),
				getResultClass()
			)}
		>
			<div
				className={cn(
					'w-12 h-12 rounded-xl flex items-center justify-center font-semibold text-lg transition-all',
					getIndicatorClasses()
				)}
			>
				{id}
			</div>
			<span className={cn('flex-1 text-left font-question text-base', getLabelClasses())}>
				{label}
			</span>

			{particles.length > 0 && (
				<div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[1.5rem]">
					{particles.map((p) => (
						<span
							key={p.id}
							className="quiz-particle absolute w-2 h-2 rounded-full"
							style={
								{
									left: '90%',
									top: '50%',
									backgroundColor: p.color,
									'--tx': `${p.tx}px`,
									'--ty': `${p.ty}px`,
								} as React.CSSProperties
							}
						/>
					))}
				</div>
			)}

			{isChecked && (isSelected || isCorrect) && (
				<m.div
					style={reduced.current ? undefined : { scale: iconScaleSpring }}
					className={cn(
						'w-5 h-5 rounded-full flex items-center justify-center text-white',
						isCorrect ? 'bg-emerald-500' : 'bg-red-500'
					)}
				>
					<HugeiconsIcon
						icon={isCorrect ? CheckmarkCircle02Icon : CancelCircleIcon}
						className="w-3.5 h-3.5"
					/>
				</m.div>
			)}
		</m.button>
	);
}
