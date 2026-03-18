'use client';

import { Card, CardContent } from '@/components/ui/card';

interface BaseItem {
	id: string | number;
}

interface Column<T> {
	key: keyof T | string;
	label: string;
	render?: (item: T, index: number) => React.ReactNode;
	className?: string;
}

interface DataTableProps<T extends BaseItem> {
	data: T[];
	columns: Column<T>[];
	emptyMessage?: string;
	className?: string;
}

export function DataTable<T extends BaseItem>({
	data,
	columns,
	emptyMessage = 'No data found',
	className = '',
}: DataTableProps<T>) {
	if (data.length === 0) {
		return (
			<div className="flex items-center justify-center py-20">
				<p className="text-muted-foreground font-bold">{emptyMessage}</p>
			</div>
		);
	}

	return (
		<div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
			{data.map((item, index) => (
				<Card
					key={item.id}
					className="rounded-[2rem] border-2 border-border/50 hover:border-primary/20 transition-all duration-300"
				>
					<CardContent className="p-6">
						{columns.map((column) => (
							<div key={String(column.key)} className={column.className}>
								{column.render
									? column.render(item, index)
									: String(item[column.key as keyof T] ?? '')}
							</div>
						))}
					</CardContent>
				</Card>
			))}
		</div>
	);
}
