import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Screen } from '@/types';
import {
	Atom,
	Calculator,
	ChevronRight,
	LayoutDashboard,
	Microscope,
} from 'lucide-react';

interface LandingProps {
	onNavigate: (s: Screen) => void;
}

const subjects = [
	{
		id: 'math',
		name: 'Mathematics',
		topics: 'Calculus, Algebra, Geometry',
		icon: Calculator,
		color: 'text-blue-500',
		bg: 'bg-blue-100',
		border: 'border-blue-500',
	},
	{
		id: 'physics',
		name: 'Physical Sciences',
		topics: 'Mechanics, Chemistry, Waves',
		icon: Atom,
		color: 'text-purple-500',
		bg: 'bg-purple-100',
		border: 'border-purple-500',
	},
	{
		id: 'accounting',
		name: 'Accounting',
		topics: 'Financial statements, Ledgers',
		icon: LayoutDashboard, // Placeholder
		color: 'text-yellow-500',
		bg: 'bg-yellow-100',
		border: 'border-yellow-500',
	},
	{
		id: 'life',
		name: 'Life Sciences',
		topics: 'Genetics, Evolution, DNA',
		icon: Microscope,
		color: 'text-green-500',
		bg: 'bg-green-100',
		border: 'border-green-500',
	},
];

export default function Landing({ onNavigate }: LandingProps) {
	return (
		<div className="flex flex-col min-h-screen bg-background">
			{/* Header */}
			<header className="px-6 py-4 flex justify-between items-center bg-background/50 backdrop-blur-sm sticky top-0 z-10">
				<div className="flex items-center gap-2">
					<LayoutDashboard className="w-6 h-6 text-zinc-900 dark:text-white" />
					<span className="font-bold text-lg text-zinc-900 dark:text-white">MatricMaster</span>
				</div>
				<button type="button" className="text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white uppercase tracking-wide">
					Log In
				</button>
			</header>

			<ScrollArea className="flex-1">
				<main className="pb-32 px-6">
					{/* Hero Section */}
					<section className="pt-8 pb-12 flex flex-col items-center text-center">
						<h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white mb-4 leading-tight">
							Master your Matrics through practice.
						</h1>
						<p className="text-sm text-zinc-500 max-w-xs mb-8">
							Interactive past papers and step-by-step guides for South African Grade 12 students.
						</p>

						{/* 3D Icon Placeholder */}
						<div className="relative w-64 h-64 mb-8 flex items-center justify-center">
							<div className="absolute inset-0 bg-gradient-to-tr from-zinc-200/50 to-zinc-100/50 rounded-full blur-3xl" />
							{/* Placeholder for the 3D book/shield icon */}
							<div className="relative w-40 h-40 bg-gradient-to-br from-zinc-100 to-white rounded-3xl shadow-2xl flex items-center justify-center transform rotate-12 border border-white/50">
								<div className="absolute inset-0 bg-white/40 rounded-3xl backdrop-blur-sm" />
								<LayoutDashboard className="w-20 h-20 text-zinc-900/10" />
								{/* In a real implementation, we'd use the 3D image here */}
							</div>
						</div>

						<Button
							size="lg"
							className="w-full max-w-xs bg-zinc-900 hover:bg-zinc-800 text-white rounded-full h-14 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
							onClick={() => onNavigate('STUDY_PLAN')}
						>
							Get Started
						</Button>
						<p className="text-[10px] text-zinc-400 mt-4 uppercase tracking-wider">
							Over 10,000 past papers included
						</p>
					</section>

					{/* Start your journey */}
					<section>
						<h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-6">Start your journey</h2>
						
						<div className="relative pl-4">
							{/* Timeline Line */}
							<div className="absolute left-[19px] top-4 bottom-12 w-0.5 bg-zinc-200 dark:bg-zinc-800" />

							<div className="space-y-6">
								{subjects.map((subject) => (
									<div key={subject.id} className="relative pl-12">
										{/* Timeline Dot */}
										<div className={`absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-background rounded-full z-10`}>
											<div className={`w-4 h-4 rounded-full border-[3px] bg-background ${subject.border}`} />
										</div>

										<Card
											className="p-4 rounded-2xl border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all cursor-pointer bg-white dark:bg-zinc-900/50"
											onClick={() => onNavigate('QUIZ')}
										>
											<div className="flex items-center gap-4">
												<div className={`w-12 h-12 rounded-2xl ${subject.bg} flex items-center justify-center shrink-0`}>
													<subject.icon className={`w-6 h-6 ${subject.color}`} />
												</div>
												<div className="flex-1 min-w-0">
													<h3 className="font-bold text-zinc-900 dark:text-white text-base">
														{subject.name}
													</h3>
													<p className="text-xs text-zinc-500 truncate mt-0.5">
														{subject.topics}
													</p>
												</div>
												<ChevronRight className="w-5 h-5 text-zinc-300" />
											</div>
										</Card>
									</div>
								))}
							</div>
						</div>
					</section>
				</main>
			</ScrollArea>
		</div>
	);
}
