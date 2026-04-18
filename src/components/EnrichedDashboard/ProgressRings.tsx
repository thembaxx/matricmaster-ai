'use client';

import { m, useSpring, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DURATION, EASING } from '@/lib/animation-presets';

interface ProgressRingsProps {
	subjects: {
		name: string;
		color: string;
		progress: number;
		attempted: number;
		target: number;
	}[];
}

interface SingleRingProps {
	name: string;
	color: string;
	progress: number;
	attempted: number;
	target: number;
	compact?: boolean;
	expanded?: boolean;
	onToggle: () => void;
}

function Ring({
	progress,
	size = 72,
	strokeWidth = 6,
	color,
}: {
	progress: number;
	size?: number;
	strokeWidth?: number;
	color: string;
}) {
	const radius = size / 2 - strokeWidth / 2;
	const circumference = 2 * Math.PI * radius;

	const springProgress = useSpring(0, { stiffness: 80, damping: 16 });
	const strokeDashoffset = useTransform(springProgress, [0, 100], [circumference, 0]);

	useEffect(() => {
		springProgress.set(progress);
	}, [progress, springProgress]);

	return (
		<svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }} aria-hidden="true">
			<circle
				cx={size / 2}
				cy={size / 2}
				r={radius}
				fill="none"
				stroke="currentColor"
				strokeWidth={strokeWidth}
				className="text-muted/30"
			/>
			<m.circle
				cx={size / 2}
				cy={size / 2}
				r={radius}
				fill="none"
				stroke={color}
				strokeWidth={strokeWidth}
				strokeLinecap="round"
				style={{
					strokeDasharray: circumference,
					strokeDashoffset,
				}}
			/>
		</svg>
	);
}

function SubjectRing({
	name,
	color,
	progress,
	attempted,
	target,
	compact = false,
	expanded = false,
	onToggle,
}: SingleRingProps) {
	const prefersReducedMotion =
		typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	if (compact) {
		return (
			<m.button
				onClick={onToggle}
				onKeyDown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						onToggle();
					}
				}}
				className="flex flex-col items-center gap-1 cursor-pointer bg-transparent border-none p-2 rounded-xl hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
				whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
				aria-label={`${name}: ${progress}% complete, ${attempted} of ${target} attempted`}
				aria-expanded={expanded}
			>
				<Ring progress={progress} size={56} strokeWidth={5} color={color} />
				<span className="text-[10px] font-numeric text-muted-foreground truncate max-w-[56px]">
					{progress}%
				</span>
			</m.button>
		);
	}

	return (
		<m.div
			className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border/50"
			initial={prefersReducedMotion ? {} : { opacity: 0, y: 8 }}
			animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
			transition={{ duration: DURATION.normal, ease: EASING.easeOut }}
		>
			<Ring progress={progress} size={80} strokeWidth={7} color={color} />
			<div className="text-center">
				<p
					className="text-sm font-bold truncate"
					style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
				>
					{name}
				</p>
				<p className="text-xs font-numeric text-muted-foreground mt-0.5">
					{attempted}/{target}
				</p>
			</div>
			{expanded && (
				<m.div
					initial={prefersReducedMotion ? {} : { opacity: 0, height: 0 }}
					animate={prefersReducedMotion ? {} : { opacity: 1, height: 'auto' }}
					className="w-full pt-2 border-t border-border/50"
				>
					<div className="flex justify-between text-xs">
						<span className="text-muted-foreground">Progress</span>
						<span className="font-numeric font-medium">{progress}%</span>
					</div>
					<div className="flex justify-between text-xs mt-1">
						<span className="text-muted-foreground">Attempted</span>
						<span className="font-numeric">{attempted}</span>
					</div>
					<div className="flex justify-between text-xs mt-1">
						<span className="text-muted-foreground">Target</span>
						<span className="font-numeric">{target}</span>
					</div>
				</m.div>
			)}
		</m.div>
	);
}

export function ProgressRings({ subjects }: ProgressRingsProps) {
	const [expandedId, setExpandedId] = useState<string | null>(null);
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const check = () => setIsMobile(window.innerWidth < 640);
		check();
		window.addEventListener('resize', check);
		return () => window.removeEventListener('resize', check);
	}, []);

	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle className="text-base font-bold">Subject Progress</CardTitle>
			</CardHeader>
			<CardContent>
				{isMobile ? (
					<div className="flex flex-wrap gap-1 justify-center">
						{subjects.map((subject) => (
							<SubjectRing
								key={subject.name}
								{...subject}
								compact
								expanded={expandedId === subject.name}
								onToggle={() => setExpandedId(expandedId === subject.name ? null : subject.name)}
							/>
						))}
					</div>
				) : (
					<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
						{subjects.map((subject) => (
							<SubjectRing
								key={subject.name}
								{...subject}
								expanded={expandedId === subject.name}
								onToggle={() => setExpandedId(expandedId === subject.name ? null : subject.name)}
							/>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
