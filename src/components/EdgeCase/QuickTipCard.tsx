import { Lightbulb, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QuickTipCardProps {
	title: string;
	description: string;
	icon?: React.ElementType;
	onDismiss?: () => void;
	className?: string;
}

export function QuickTipCard({
	title,
	description,
	icon: Icon = Lightbulb,
	onDismiss,
	className,
}: QuickTipCardProps) {
	return (
		<div
			className={cn(
				'group relative p-4 rounded-xl border bg-card text-card-foreground',
				'hover:shadow-md transition-all cursor-pointer',
				className
			)}
		>
			{onDismiss && (
				<Button
					variant="ghost"
					size="icon"
					className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
					onClick={(e) => {
						e.stopPropagation();
						onDismiss();
					}}
				>
					<X className="h-3 w-3" />
					<span className="sr-only">dismiss</span>
				</Button>
			)}

			<div className="flex items-start gap-3">
				<div className="p-2 rounded-lg bg-primary/10">
					<Icon className="h-4 w-4 text-primary" />
				</div>
				<div className="flex-1 min-w-0">
					<h4 className="font-medium text-sm">{title}</h4>
					<p className="text-xs text-muted-foreground mt-0.5">{description}</p>
				</div>
			</div>
		</div>
	);
}
