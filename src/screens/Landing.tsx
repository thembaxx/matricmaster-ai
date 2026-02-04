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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

import { SUBJECTS } from '@/constants/mock-data';
import { useTheme } from '@/hooks/use-theme';

const ICON_MAP: Record<string, React.ElementType> = {
	Calculator: Calculator,
	Atom: Atom,
	Beaker: LayoutDashboard,
	Microscope: Microscope,
};

export default function Landing() {
	const router = useRouter();
	const { theme, setTheme } = useTheme();

	return (
		<div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 font-inter overflow-hidden">
			{/* Decorative Orbs */}
			<div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-brand-blue/10 rounded-full blur-[120px] pointer-events-none" />
			<div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-brand-purple/10 rounded-full blur-[100px] pointer-events-none" />

			{/* Header - iOS-style sticky with safe area */}
			<header
				className="px-6 pb-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl sticky top-0 z-20 transition-all duration-200 max-w-2xl mx-auto w-full"
				style={{
					paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)',
				}}
			>
				<div className="flex justify-between items-center">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 bg-zinc-900 dark:bg-white rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95">
							<Sparkles className="w-6 h-6 text-white dark:text-zinc-900" />
						</div>
						<span className="font-black text-xl tracking-tighter text-zinc-900 dark:text-white uppercase">
							MatricMaster
						</span>
					</div>
					<div className="flex items-center gap-3">
						<button
							type="button"
							onClick={() => router.push('/language')}
							className="text-[10px] font-black text-zinc-400 hover:text-brand-blue uppercase tracking-wider transition-colors active:scale-95"
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
				</div>
			</header>

			{/* Content area with proper bottom spacing for navigation */}
			<ScrollArea className="flex-1 relative z-10">
				<main
					className="pb-28 px-6 max-w-2xl mx-auto w-full"
					style={{
						paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 112px)',
					}}
				>
					{/* Hero Section */}
					<section className="pt-12 pb-16 flex flex-col items-center text-center space-y-8">
						<div className="space-y-4">
							<Badge className="bg-brand-green/10 text-brand-green border-none rounded-full px-4 py-1.5 font-black text-[10px] tracking-wider uppercase mb-4 animate-fade-in">
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

						{/* Hero Image Container - SVG Mathematical Illustration */}
						<div className="relative w-full aspect-square max-w-[320px] flex items-center justify-center animate-float">
							<div className="absolute inset-0 bg-gradient-to-tr from-brand-blue/20 to-brand-purple/20 rounded-full blur-[80px]" />

							<div className="relative w-72 h-72 bg-white dark:bg-zinc-900 rounded-[3.5rem] shadow-2xl flex items-center justify-center transform rotate-3 border-4 border-white dark:border-zinc-800 transition-transform hover:rotate-0 duration-500 overflow-hidden">
								<div className="absolute inset-0 bg-brand-blue/5 rounded-[2.5rem]" />

								{/* Custom SVG Illustration */}
								<svg viewBox="0 0 100 100" className="w-48 h-48 relative z-10">
									<title>Mathematical Geometry Illustration</title>
									<defs>
										<linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
											<stop offset="0%" style={{ stopColor: '#2563eb', stopOpacity: 1 }} />
											<stop offset="100%" style={{ stopColor: '#7c3aed', stopOpacity: 1 }} />
										</linearGradient>
									</defs>
									{/* Circle Geometry */}
									<circle
										cx="50"
										cy="50"
										r="30"
										stroke="url(#grad1)"
										strokeWidth="0.5"
										fill="none"
										strokeDasharray="2 2"
										className="animate-spin-slow"
									/>
									{/* Triangle */}
									<path
										d="M 50 20 L 80 70 L 20 70 Z"
										fill="none"
										stroke="url(#grad1)"
										strokeWidth="2"
										strokeLinejoin="round"
									/>
									{/* Sine Wave */}
									<path
										d="M 10 50 Q 25 30 40 50 T 70 50 T 100 50"
										fill="none"
										stroke="#10b981"
										strokeWidth="2"
									/>
									{/* Floating Points */}
									<circle cx="50" cy="20" r="3" fill="#f59e0b" />
									<circle cx="80" cy="70" r="3" fill="#f59e0b" />
									<circle cx="20" cy="70" r="3" fill="#f59e0b" />
								</svg>
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
							{SUBJECTS.map((subject) => {
								const Icon = ICON_MAP[subject.icon] || Calculator;
								return (
									<Card
										key={subject.id}
										className="p-6 rounded-[2.5rem] border-none shadow-sm hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 cursor-pointer bg-white dark:bg-zinc-900 group relative overflow-hidden active:scale-[0.98]"
										onClick={() => router.push(subject.path)}
									>
										<div
											className={`absolute top-0 right-0 w-32 h-32 ${subject.bg} rounded-full -mr-16 -mt-16 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
										/>

										<div className="flex items-center gap-6 relative z-10">
											<div
												className={`w-16 h-16 rounded-[1.5rem] ${subject.bg} flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-300`}
											>
												<Icon className={`w-8 h-8 ${subject.color}`} />
											</div>
											<div className="flex-1 min-w-0">
												<h3 className="font-black text-zinc-900 dark:text-white text-xl group-hover:text-brand-blue transition-colors duration-200">
													{subject.name}
												</h3>
												<p className="text-sm font-bold text-zinc-400 truncate mt-1">
													{subject.topics}
												</p>
											</div>
											<div className="w-12 h-12 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-brand-blue group-hover:text-white transition-all duration-300 shadow-sm">
												<ChevronRight className="w-6 h-6" />
											</div>
										</div>
									</Card>
								);
							})}
						</div>
					</section>

					{/* Stats Section */}
					<section className="mt-16 py-12 px-8 bg-zinc-900 dark:bg-white rounded-[3rem] text-center space-y-6">
						<div className="grid grid-cols-2 gap-8">
							<div className="space-y-1">
								<h4 className="text-4xl font-black text-white dark:text-zinc-900">10k+</h4>
								<p className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">
									Papers
								</p>
							</div>
							<div className="space-y-1">
								<h4 className="text-4xl font-black text-white dark:text-zinc-900">98%</h4>
								<p className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">
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
