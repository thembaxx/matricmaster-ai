'use client';

import {
	BookOpen01Icon,
	File01Icon,
	FunctionIcon,
	Layers01Icon,
	SparklesIcon,
	TestTube01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { motion as m } from 'motion/react';
import { useRouter } from 'next/navigation';

const RECOMMENDED_ITEMS = [
	{
		title: 'Weak Topics Practice',
		desc: 'Focus on areas needing improvement',
		icon: SparklesIcon,
		color: 'bg-red-100 dark:bg-red-900/20 text-red-600',
		href: '/review',
	},
	{
		title: 'Past Papers',
		desc: 'Practice with exam questions',
		icon: File01Icon,
		color: 'bg-green-100 dark:bg-green-900/20 text-green-600',
		href: '/past-papers',
	},
	{
		title: 'Flashcards Review',
		desc: 'Quick recall practice',
		icon: Layers01Icon,
		color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600',
		href: '/flashcards',
	},
	{
		title: 'Science Lab',
		desc: 'Interactive physics simulations',
		icon: TestTube01Icon,
		color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600',
		href: '/science-lab/circuits',
	},
	{
		title: 'Math Graphing',
		desc: 'Plot functions & explore graphs',
		icon: FunctionIcon,
		color: 'bg-orange-100 dark:bg-orange-900/20 text-orange-600',
		href: '/math/graph',
	},
	{
		title: 'Setwork Library',
		desc: 'Literature study guides & quizzes',
		icon: BookOpen01Icon,
		color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600',
		href: '/setwork-library',
	},
];

export function RecommendedSection() {
	const router = useRouter();

	return (
		<section className="space-y-6">
			<m.h2
				initial={{ opacity: 0, x: -20 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ delay: 0.6 }}
				className="text-xl font-semibold text-foreground"
			>
				Recommended for You
			</m.h2>
			<div className="space-y-3">
				{RECOMMENDED_ITEMS.map((item, idx) => (
					<m.button
						key={item.href}
						type="button"
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.65 + idx * 0.08 }}
						whileHover={{ x: 4 }}
						whileTap={{ scale: 0.99 }}
						onClick={() => router.push(item.href)}
						className="w-full p-4 bg-card border border-border rounded-2xl text-left transition-all flex items-center gap-4 group hover:border-primary/30 hover:shadow-md"
					>
						<div
							className={`w-10 h-10 ${item.color} rounded-xl flex items-center justify-center shrink-0`}
						>
							<HugeiconsIcon icon={item.icon} className="w-5 h-5" />
						</div>
						<div className="flex-1">
							<h3 className="font-bold text-foreground">{item.title}</h3>
							<p className="text-xs text-muted-foreground">{item.desc}</p>
						</div>
						<div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
							<svg
								width="12"
								height="12"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								className="text-muted-foreground"
								role="img"
								aria-label="Navigate"
							>
								<path d="M5 12h14M12 5l7 7-7 7" />
							</svg>
						</div>
					</m.button>
				))}
			</div>
		</section>
	);
}
