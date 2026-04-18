'use client';

import { motion as m, type Variants } from 'motion/react';
import type { ElementType } from 'react';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

interface SmoothTextProps {
	text: string;
	className?: string;
	as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
	delay?: number;
	stagger?: number;
	once?: boolean;
}

export function SmoothText({
	text,
	className = '',
	as: Component = 'p',
	delay = 0,
	stagger = 0.02,
	once = true,
}: SmoothTextProps) {
	const prefersReducedMotion = useReducedMotion();

	if (prefersReducedMotion) {
		return <Component className={className}>{text}</Component>;
	}

	const containerVariants: Variants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: stagger,
				delayChildren: delay,
			},
		},
	};

	const letterVariants: Variants = {
		hidden: {
			opacity: 0,
			y: 10,
			filter: 'blur(4px)',
			scale: 0.95,
		},
		visible: {
			opacity: 1,
			y: 0,
			filter: 'blur(0px)',
			scale: 1,
			transition: {
				type: 'spring',
				stiffness: 200,
				damping: 20,
			},
		},
	};

	const MotionComponent = m.create(Component as ElementType);

	return (
		<MotionComponent
			variants={containerVariants}
			initial="hidden"
			whileInView="visible"
			viewport={{ once, amount: 0.3 }}
			className={className}
		>
			{text.split('').map((char, index) => (
				<m.span
					key={`${char}-${index}`}
					variants={letterVariants}
					className="inline-block whitespace-pre"
				>
					{char}
				</m.span>
			))}
		</MotionComponent>
	);
}

interface SmoothWordProps {
	text: string;
	className?: string;
	as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
	delay?: number;
	stagger?: number;
	once?: boolean;
}

export function SmoothWords({
	text,
	className = '',
	as: Component = 'p',
	delay = 0,
	stagger = 0.1,
	once = true,
}: SmoothWordProps) {
	const prefersReducedMotion = useReducedMotion();

	if (prefersReducedMotion) {
		return <Component className={className}>{text}</Component>;
	}

	const containerVariants: Variants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: stagger,
				delayChildren: delay,
			},
		},
	};

	const wordVariants: Variants = {
		hidden: {
			opacity: 0,
			y: 15,
			filter: 'blur(8px)',
		},
		visible: {
			opacity: 1,
			y: 0,
			filter: 'blur(0px)',
			transition: {
				type: 'spring',
				stiffness: 150,
				damping: 15,
			},
		},
	};

	const MotionComponent = m.create(Component as ElementType);

	return (
		<MotionComponent
			variants={containerVariants}
			initial="hidden"
			whileInView="visible"
			viewport={{ once, amount: 0.3 }}
			className={className}
		>
			{text.split(' ').map((word, index) => (
				<m.span
					key={`${word}-${index}`}
					variants={wordVariants}
					className="inline-block whitespace-pre mr-[0.25em]"
				>
					{word}
				</m.span>
			))}
		</MotionComponent>
	);
}
