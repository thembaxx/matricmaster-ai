'use client';

import dynamic from 'next/dynamic';
import * as React from 'react';
import { cn } from '@/lib/utils';
import { type ChartConfig, ChartContext, type ChartContextProps } from './chart-context';
import { useIsMounted } from './chart-utils';

const ResponsiveContainer = dynamic(
	() => import('recharts').then((mod) => mod.ResponsiveContainer),
	{
		ssr: false,
	}
);

type ChartContainerProps = React.ComponentProps<'div'> & {
	config: ChartConfig;
	children: React.ComponentProps<typeof ResponsiveContainer>['children'];
};

export const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
	({ id, className, config, children, ...props }, ref) => {
		const uniqueId = React.useId();
		const chartId = `chart-${id || uniqueId.replace(/:/g, '')}`;
		const isMounted = useIsMounted();

		return (
			<ChartContext.Provider value={{ config } satisfies ChartContextProps}>
				<div
					style={
						{
							'--chart-1': 'var(--color-brand-blue)',
							'--chart-2': 'var(--color-brand-amber)',
							'--chart-3': 'var(--color-brand-purple)',
							'--chart-4': 'var(--color-brand-green)',
							'--chart-5': 'var(--color-brand-red)',
							minWidth: '0',
							minHeight: '200px',
						} as React.CSSProperties
					}
					ref={ref}
					className={cn(
						"flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid-concentric-polygon]:stroke-border [&_.recharts-polar-grid-concentric-path]:stroke-border [&_.recharts-polar-grid-angle_line]:stroke-border [&_.recharts-radar-cursor]:fill-muted [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
						className
					)}
					{...props}
				>
					<ChartStyle id={chartId} config={config} />
					{isMounted.current ? (
						<ResponsiveContainer width="100%" height="100%">
							{children}
						</ResponsiveContainer>
					) : (
						<div className="w-full h-full flex items-center justify-center">
							<div className="text-muted-foreground text-sm">Loading chart...</div>
						</div>
					)}
				</div>
			</ChartContext.Provider>
		);
	}
);
ChartContainer.displayName = 'Chart';

type ChartStyleProps = {
	id: string;
	config: ChartConfig;
};

export const ChartStyle = ({ id, config }: ChartStyleProps) => {
	const colorConfig = Object.entries(config).filter(([_, config]) => config.theme || config.color);

	if (!colorConfig.length) {
		return null;
	}

	const THEMES = { light: '', dark: '.dark' } as const;

	const styleContent = Object.entries(THEMES)
		.map(
			([theme, prefix]) => `
${prefix} [data-chart="${id}"] {
${colorConfig
	.map(([key, itemConfig]) => {
		const color = itemConfig.theme?.[theme as keyof typeof itemConfig.theme] || itemConfig.color;
		return color ? `  --color-${key}: ${color};` : null;
	})
	.join('\n')}
}
`
		)
		.join('\n');

	return <style suppressHydrationWarning>{styleContent}</style>;
};
