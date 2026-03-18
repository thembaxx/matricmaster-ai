'use client';

import { m } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface QuickAction {
	id: string;
	label: string;
	icon: string;
	href: string;
	color: string;
}

const defaultActions: QuickAction[] = [
	{ id: 'quiz', label: 'Start Quiz', icon: '🎯', href: '/quiz', color: 'bg-tiimo-lavender' },
	{
		id: 'flashcards',
		label: 'Flashcards',
		icon: '📚',
		href: '/flashcards',
		color: 'bg-tiimo-yellow',
	},
	{ id: 'practice', label: 'Practice', icon: '✏️', href: '/practice', color: 'bg-tiimo-blue' },
	{ id: 'review', label: 'Review', icon: '🔄', href: '/review', color: 'bg-tiimo-green' },
];

interface QuickActionsProps {
	actions?: QuickAction[];
}

export function QuickActions({ actions = defaultActions }: QuickActionsProps) {
	return (
		<div className="flex flex-wrap gap-3">
			{actions.map((action, index) => (
				<m.div
					key={action.id}
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ delay: index * 0.05 }}
					whileTap={{ scale: 0.95 }}
				>
					<Link href={action.href}>
						<Button
							variant="outline"
							className={`h-12 px-6 rounded-2xl border-none shadow-tiimo ${action.color} hover:opacity-90 transition-opacity`}
						>
							<span className="mr-2 text-lg">{action.icon}</span>
							<span className="font-bold text-foreground">{action.label}</span>
						</Button>
					</Link>
				</m.div>
			))}
		</div>
	);
}
