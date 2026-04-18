'use client';

import type * as React from 'react';
import { Fragment } from 'react';
import { cn } from '@/lib/utils';

type Justify = 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
type Align = 'start' | 'end' | 'center' | 'stretch' | 'baseline';
type Gap = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;

interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode;
	className?: string;
	justify?: Justify;
	align?: Align;
	gap?: Gap;
	wrap?: boolean;
	column?: boolean;
}

const justifyMap = {
	start: 'justify-start',
	end: 'justify-end',
	center: 'justify-center',
	between: 'justify-between',
	around: 'justify-around',
	evenly: 'justify-evenly',
};

const alignMap = {
	start: 'items-start',
	end: 'items-end',
	center: 'items-center',
	stretch: 'items-stretch',
	baseline: 'items-baseline',
};

const gapMap = {
	0: 'gap-0',
	1: 'gap-1',
	2: 'gap-2',
	3: 'gap-3',
	4: 'gap-4',
	5: 'gap-5',
	6: 'gap-6',
	8: 'gap-8',
	10: 'gap-10',
	12: 'gap-12',
};

export function Flex({
	children,
	className,
	justify = 'between',
	align = 'center',
	gap = 4,
	wrap,
	column,
}: FlexProps) {
	const Comp = column ? 'div' : 'span';
	return (
		<Comp
			className={cn(
				'flex',
				justifyMap[justify],
				alignMap[align],
				gapMap[gap],
				wrap && 'flex-wrap',
				column && 'flex-col',
				className
			)}
		>
			{children}
		</Comp>
	);
}

interface FlexRowProps {
	children: React.ReactNode;
	className?: string;
	justify?: Justify;
	align?: Align;
	gap?: Gap;
}

export function FlexRow({
	children,
	className,
	justify = 'between',
	align = 'center',
	gap = 4,
}: FlexRowProps) {
	return (
		<div
			className={cn(
				'flex items-center',
				justifyMap[justify],
				alignMap[align],
				gapMap[gap],
				className
			)}
		>
			{children}
		</div>
	);
}

interface CardSectionProps {
	children: React.ReactNode;
	className?: string;
}

export function CardSection({ children, className }: CardSectionProps) {
	return <div className={cn('flex flex-col gap-4 p-4', className)}>{children}</div>;
}

interface SplitViewProps {
	left: React.ReactNode;
	right: React.ReactNode;
	className?: string;
}

export function SplitView({ left, right, className }: SplitViewProps) {
	return (
		<div className={cn('flex items-center justify-between gap-4', className)}>
			{left}
			{right}
		</div>
	);
}

interface StackProps extends FlexProps {
	separator?: React.ReactNode;
}

export function Stack({
	children,
	className,
	justify = 'start',
	align = 'stretch',
	gap = 4,
	wrap,
	column = true,
	separator,
}: StackProps) {
	const items = Array.isArray(children) ? children : [children];
	const needsSeparator = separator && items.length > 1;

	return (
		<div
			className={cn(
				'flex',
				column ? 'flex-col' : 'flex-row',
				justifyMap[justify],
				alignMap[align],
				gapMap[gap],
				wrap && 'flex-wrap',
				className
			)}
		>
			{needsSeparator
				? items.map((item, i) => (
						<Fragment key={i}>
							{item}
							{i < items.length - 1 && <span className="shrink-0">{separator}</span>}
						</Fragment>
					))
				: items}
		</div>
	);
}

export default { Flex, FlexRow, CardSection, SplitView, Stack };
