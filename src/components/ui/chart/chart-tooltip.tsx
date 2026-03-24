'use client';

import dynamic from 'next/dynamic';
import * as React from 'react';
import { cn } from '@/lib/utils';
import { useChart } from './chart-context';
import { getPayloadConfigFromCustom } from './chart-utils';

const RechartsTooltip = dynamic(() => import('recharts').then((mod) => mod.Tooltip), {
	ssr: false,
});

export const ChartTooltip = RechartsTooltip;

type ChartTooltipContentProps = React.ComponentProps<'div'> & {
	active?: boolean;
	payload?: any[];
	label?: any;
	labelFormatter?: (label: any, payload: any[]) => React.ReactNode;
	labelClassName?: string;
	formatter?: (value: any, name: any, item: any, index: number, payload: any[]) => React.ReactNode;
	hideLabel?: boolean;
	hideIndicator?: boolean;
	indicator?: 'line' | 'dot' | 'dashed';
	nameKey?: string;
	labelKey?: string;
};

export const ChartTooltipContent = React.forwardRef<HTMLDivElement, ChartTooltipContentProps>(
	(
		{
			active,
			payload,
			className,
			indicator = 'dot',
			hideLabel = false,
			hideIndicator = false,
			label,
			labelFormatter,
			labelClassName,
			formatter: _formatter,
			color,
			nameKey,
			labelKey,
		},
		ref
	) => {
		const { config } = useChart();

		const tooltipLabel = React.useMemo(() => {
			if (hideLabel || !payload?.length) {
				return null;
			}

			const [item] = payload;
			const key = `${labelKey || item.dataKey || item.name || 'value'}`;
			const itemConfig = getPayloadConfigFromCustom(config, item, key);
			const value =
				!labelKey && typeof label === 'string'
					? config[label as keyof typeof config]?.label || label
					: itemConfig?.label;

			if (labelFormatter) {
				return (
					<div className={cn('font-medium', labelClassName)}>{labelFormatter(value, payload)}</div>
				);
			}

			if (!value) {
				return null;
			}

			return <div className={cn('font-medium', labelClassName)}>{value}</div>;
		}, [label, labelFormatter, payload, hideLabel, labelClassName, config, labelKey]);

		if (!active || !payload?.length) {
			return null;
		}

		const nestLabel = payload.length === 1 && indicator !== 'dot';

		return (
			<div
				ref={ref}
				className={cn(
					'grid min-w-32 items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl',
					className
				)}
			>
				{!nestLabel ? tooltipLabel : null}
				<div className="grid gap-1.5">
					{payload.map((item, _index) => {
						const key = `${nameKey || item.name || item.dataKey || 'value'}`;
						const itemConfig = getPayloadConfigFromCustom(config, item, key);
						const indicatorColor = color || item.payload.fill || item.color;

						return (
							<div
								key={item.dataKey}
								className={cn(
									'flex w-full items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground',
									indicator === 'dot' && 'items-center'
								)}
							>
								{itemConfig?.icon ? (
									<itemConfig.icon />
								) : (
									!hideIndicator && (
										<div
											className={cn(
												'shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]',
												{
													'h-2.5 w-2.5': indicator === 'dot',
													'w-1': indicator === 'line',
													'w-0 border-[1.5px] border-dashed bg-transparent': indicator === 'dashed',
													'my-0.5': nestLabel && indicator === 'dashed',
												}
											)}
											style={
												{
													'--color-bg': indicatorColor,
													'--color-border': indicatorColor,
												} as React.CSSProperties
											}
										/>
									)
								)}
								<div
									className={cn(
										'flex flex-1 justify-between leading-none',
										nestLabel ? 'items-end' : 'items-center'
									)}
								>
									<div className="grid gap-1.5">
										{nestLabel ? tooltipLabel : null}
										<span className="text-muted-foreground">{itemConfig?.label || item.name}</span>
									</div>
									{item.value && (
										<span className="font-mono font-medium tabular-nums text-foreground">
											{item.value.toLocaleString()}
										</span>
									)}
								</div>
							</div>
						);
					})}
				</div>
			</div>
		);
	}
);
ChartTooltipContent.displayName = 'ChartTooltip';
