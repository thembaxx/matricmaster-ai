import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTheme } from '@/hooks/use-theme';
// import type { Screen } from '@/types'; // Removed unused import
import {
	Atom,
	Calculator,
	ChevronRight,
	LayoutDashboard,
	Microscope,
	Moon,
	Sparkles,
	Sun,
} from 'lucide-react';

import { useRouter } from 'next/navigation';

const subjects = [
	{
		id: 'math',
		name: 'Mathematics',
		topics: 'Calculus, Algebra, Geometry',
		icon: Calculator,
		color: 'text-brand-blue',
		bg: 'bg-brand-blue/10',
		border: 'border-brand-blue',
	},
	{
		id: 'physics',
		name: 'Physical Sciences',
		topics: 'Mechanics, Chemistry, Waves',
		icon: Atom,
		color: 'text-brand-purple',
		bg: 'bg-brand-purple/10',
		border: 'border-brand-purple',
	},
	{
		id: 'accounting',
		name: 'Accounting',
		topics: 'Financial statements, Ledgers',
		icon: LayoutDashboard,
		color: 'text-brand-amber',
		bg: 'bg-brand-amber/10',
		border: 'border-brand-amber',
	},
	{
		id: 'life',
		name: 'Life Sciences',
		topics: 'Genetics, Evolution, DNA',
		icon: Microscope,
		color: 'text-brand-green',
		bg: 'bg-brand-green/10',
		border: 'border-brand-green',
	},
];

export default function Landing() {
	const router = useRouter();
	const { theme, setTheme } = useTheme();

	return (
		<div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 font-lexend overflow-hidden">
			{/* Decorative Orbs */}
			<div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand-blue/10 rounded-full blur-[120px] pointer-events-none" />
			<div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-brand-purple/10 rounded-full blur-[100px] pointer-events-none" />

			{/* Header */}
			<header className="px-6 py-6 flex justify-between items-center bg-transparent relative z-20 max-w-2xl mx-auto w-full">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 bg-zinc-900 dark:bg-white rounded-2xl flex items-center justify-center shadow-lg">
						<Sparkles className="w-6 h-6 text-white dark:text-zinc-900" />
					</div>
					<span className="font-black text-xl tracking-tighter text-zinc-900 dark:text-white uppercase">
						MatricMaster
					</span>
				</div>
				<div className="flex items-center gap-4">
					<button
						type="button"
						onClick={() => router.push('/language')}
						className="text-[10px] font-black text-zinc-400 hover:text-brand-blue uppercase tracking-widest transition-colors"
					>
						Language: EN
					</button>
					<button
						type="button"
						onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
						className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all active:scale-90"
					>
						{theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
					</button>
				</div>
			</header>

			<ScrollArea className="flex-1 relative z-10">
				<main className="pb-12 px-6 max-w-2xl mx-auto w-full">
					{/* Hero Section */}
					<section className="pt-12 pb-16 flex flex-col items-center text-center space-y-8">
						<div className="space-y-4">
							<Badge className="bg-brand-green/10 text-brand-green border-none rounded-full px-4 py-1.5 font-black text-[10px] tracking-widest uppercase mb-4 animate-fade-in">
								Trusted by 50,000+ Students
							</Badge>
							<h1 className="text-5xl font-black text-zinc-900 dark:text-white leading-[1.1] tracking-tight">
								Master your <br />
								<span className="text-brand-blue italic font-serif">Matrics</span> through <br />
								<span className="relative">
									practice.
									<div className="absolute -bottom-2 left-0 w-full h-3 bg-brand-blue/20 rounded-full -rotate-1" />
								</span>
							</h1>
							<p className="text-base font-medium text-zinc-500 max-w-xs mx-auto leading-relaxed pt-4">
								Interactive past papers and step-by-step guides for South African Grade 12 students.
							</p>
						</div>

						{/* Hero Image Container */}
						<div className="relative w-full aspect-square max-w-[320px] flex items-center justify-center animate-float">
							<div className="absolute inset-0 bg-gradient-to-tr from-brand-blue/20 to-brand-purple/20 rounded-full blur-[80px]" />

							<div className="relative w-64 h-64 bg-white dark:bg-zinc-900 rounded-[3rem] shadow-2xl flex items-center justify-center transform rotate-6 border-4 border-white dark:border-zinc-800 transition-transform hover:rotate-0 duration-500">
								<div className="absolute inset-0 bg-brand-blue/5 rounded-[2.5rem]" />
								<div className="relative z-10 flex flex-col items-center gap-4">
									<Calculator className="w-24 h-24 text-brand-blue opacity-20" />
									<div className="h-2 w-32 bg-zinc-100 dark:bg-zinc-800 rounded-full" />
									<div className="h-2 w-24 bg-zinc-100 dark:bg-zinc-800 rounded-full opacity-50" />
								</div>
							</div>

							{/* Floating Elements */}
							<div className="absolute top-0 right-0 w-16 h-16 bg-brand-amber rounded-2xl shadow-xl flex items-center justify-center -rotate-12 animate-bounce">
								<Sparkles className="w-8 h-8 text-white fill-white" />
							</div>
							<div className="absolute bottom-10 left-0 w-20 h-20 bg-brand-green rounded-[1.5rem] shadow-xl flex items-center justify-center rotate-12 transition-transform hover:rotate-0">
								<Atom className="w-10 h-10 text-white" />
							</div>
						</div>

						<Button
							size="lg"
							className="w-full max-w-sm bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-[2rem] h-20 text-xl font-black shadow-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-brand-blue/10"
							onClick={() => router.push('/dashboard')}
						>
							Start Learning Now
							<ChevronRight className="w-6 h-6 ml-2" />
						</Button>
					</section>

					{/* Start your journey */}
					<section className="space-y-8">
						<div className="flex items-center gap-4 px-1">
							<div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
							<h2 className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em] whitespace-nowrap">
								Explore Subjects
							</h2>
							<div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
						</div>

						<div className="grid grid-cols-1 gap-4">
							{subjects.map((subject) => (
								<Card
									key={subject.id}
									className="p-6 rounded-[2.5rem] border-none shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer bg-white dark:bg-zinc-900 group relative overflow-hidden"
									onClick={() => router.push('/quiz')}
								>
									<div
										className={`absolute top-0 right-0 w-32 h-32 ${subject.bg} rounded-full -mr-16 -mt-16 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity`}
									/>

									<div className="flex items-center gap-6 relative z-10">
										<div
											className={`w-16 h-16 rounded-[1.5rem] ${subject.bg} flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform`}
										>
											<subject.icon className={`w-8 h-8 ${subject.color}`} />
										</div>
										<div className="flex-1 min-w-0">
											<h3 className="font-black text-zinc-900 dark:text-white text-xl group-hover:text-brand-blue transition-colors">
												{subject.name}
											</h3>
											<p className="text-sm font-bold text-zinc-400 truncate mt-1">
												{subject.topics}
											</p>
										</div>
										<div className="w-12 h-12 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-brand-blue group-hover:text-white transition-all shadow-sm">
											<ChevronRight className="w-6 h-6" />
										</div>
									</div>
								</Card>
							))}
						</div>
					</section>

					{/* Stats Section */}
					<section className="mt-16 py-12 px-8 bg-zinc-900 dark:bg-white rounded-[3rem] text-center space-y-6">
						<div className="grid grid-cols-2 gap-8">
							<div className="space-y-1">
								<h4 className="text-4xl font-black text-white dark:text-zinc-900">10k+</h4>
								<p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
									Papers
								</p>
							</div>
							<div className="space-y-1">
								<h4 className="text-4xl font-black text-white dark:text-zinc-900">98%</h4>
								<p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
									Pass Rate
								</p>
							</div>
						</div>
					</section>
				</main>
			</ScrollArea>
		</div>
	);
}
