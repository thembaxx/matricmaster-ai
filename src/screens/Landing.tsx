'use client';

import { m } from 'framer-motion';
import {
	Atom,
	Calculator,
	ChevronRight,
	FileText,
	FlaskConical,
	Microscope,
	Sparkles,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useId } from 'react';
import { toast } from 'sonner';
import { Footer } from '@/components/Layout/footer';
import { SmoothText, SmoothWords } from '@/components/Transition/SmoothText';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SUBJECTS } from '@/constants/mock-data';
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/animation-presets';
import { useSession } from '@/lib/auth-client';

const ICON_MAP: Record<string, React.ElementType> = {
	Calculator: Calculator,
	Atom: Atom,
	FlaskConical: FlaskConical,
	Microscope: Microscope,
};

export default function Landing() {
	const router = useRouter();
	const gradientId = useId();
	const { data: session } = useSession();

	const handleAuthRoute = (path: string) => {
		if (!session?.user) {
			toast.info('Login Required', {
				description: 'Please sign in to access this feature.',
			});
			router.push('/sign-in');
			return;
		}
		router.push(path);
	};

	return (
		<div className="flex flex-col h-full min-w-0 w-full bg-background overflow-x-hidden relative">
			<ScrollArea className="flex-1 no-scrollbar relative z-10">
				<main className="pb-4 px-6 sm:px-6 max-w-7xl mx-auto w-full lg:px-0 lg:pb-24">
					{/* Hero Section - Responsive Layout */}
					<section className="pt-10 pb-16 sm:pt-12 sm:pb-20 lg:pt-24 lg:pb-32 flex flex-col lg:flex-row items-center gap-12 lg:gap-16 xl:gap-24">
						<div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 sm:space-y-8">
							<div className="space-y-6">
								<m.div
									initial={{ opacity: 0, scale: 0.9 }}
									animate={{ opacity: 1, scale: 1 }}
									transition={{ type: 'spring', stiffness: 300, damping: 20 }}
								>
									<Badge className="bg-primary-orange/20 text-primary-orange border-none rounded-full px-4 sm:px-6 py-2 font-black text-[10px] tracking-widest uppercase mb-4 shadow-sm animate-pulse-slow">
										<Sparkles className="w-3 h-3 mr-1.5" />
										Trusted by 50,000+ Students
									</Badge>
								</m.div>
								<SmoothWords
									as="h1"
									text="Master your Matrics through practice."
									className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-extrabold text-foreground drop-shadow-sm leading-[0.95] tracking-tighter uppercase"
									stagger={0.06}
								/>
								<SmoothText
									text="Interactive past papers and step-by-step guides for South African Grade 12 students."
									className="text-base md:text-lg lg:text-xl font-medium text-label-secondary max-w-xl mx-auto lg:mx-0 leading-relaxed pt-4 sm:pt-6 tracking-tight"
									delay={0.4}
								/>
							</div>

							<m.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.6 }}
								className="w-full max-w-sm flex flex-col sm:flex-row gap-3 sm:gap-4 lg:max-w-none"
							>
								<Button
									size="lg"
									className="group relative w-full sm:w-auto lg:flex-none lg:w-72 rounded-2xl shrink-0 h-14 lg:h-16 xl:h-18 text-base lg:text-lg xl:text-xl font-black uppercase tracking-widest shadow-2xl ios-active-scale transition-all bg-primary hover:bg-primary/90"
									onClick={() => handleAuthRoute('/dashboard')}
								>
									<span className="relative z-10 flex items-center justify-center">
										Start Learning
										<ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
									</span>
								</Button>
								<Button
									variant="outline"
									size="lg"
									className="group w-full sm:w-auto lg:flex-none lg:w-64 rounded-2xl h-14 lg:h-16 xl:h-18 text-base lg:text-lg font-black uppercase tracking-widest border-3 border-border hover:border-primary-violet/50 hover:bg-primary-violet/5 ios-active-scale transition-all"
									onClick={() => handleAuthRoute('/past-papers')}
								>
									<span className="flex items-center gap-2">
										<FileText className="w-5 h-5" />
										Past Papers
									</span>
								</Button>
							</m.div>

							<div className="flex items-center gap-4 pt-4 opacity-60">
								<div className="flex -space-x-3">
									{[1, 2, 3, 4].map((i) => (
										<div
											key={i}
											className="w-10 h-10 rounded-full border-2 border-background bg-secondary flex items-center justify-center overflow-hidden relative shadow-sm"
										>
											<Image
												src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`}
												alt="user"
												fill
												sizes="40px"
												className="object-cover"
												unoptimized
												priority={i < 2}
											/>
										</div>
									))}
								</div>
								<p className="text-[10px] font-black uppercase tracking-widest text-label-tertiary">
									Join our growing community
								</p>
							</div>
						</div>

						{/* Hero Illustration - Desktop Sizing */}
						<m.div
							initial={{ opacity: 0, x: 50, rotate: 5 }}
							animate={{ opacity: 1, x: 0, rotate: 0 }}
							transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.3 }}
							className="relative flex-1 w-full max-w-[320px] sm:max-w-100 md:max-w-112.5 lg:max-w-none flex items-center justify-center"
						>
							<m.div
								whileHover={{ scale: 1.02 }}
								className="relative w-full aspect-square max-w-75 sm:max-w-87.5 md:max-w-112.5 bg-card rounded-3xl sm:rounded-[4rem] shadow-xl flex items-center justify-center transform border border-border transition-transform duration-700 overflow-hidden"
							>
								<div className="absolute inset-0 bg-primary/5" />

								{/* Large SVG Illustration */}
								<svg
									viewBox="0 0 100 100"
									className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 relative z-10 opacity-80"
								>
									<title>Mathematical Geometry Illustration</title>
									<defs>
										<linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
											<stop
												offset="0%"
												style={{ stopColor: 'var(--primary-violet)', stopOpacity: 1 }}
											/>
											<stop
												offset="100%"
												style={{ stopColor: 'var(--primary-cyan)', stopOpacity: 1 }}
											/>
										</linearGradient>
									</defs>
									<circle
										cx="50"
										cy="50"
										r="35"
										stroke={`url(#${gradientId})`}
										strokeWidth="0.5"
										fill="none"
										strokeDasharray="2 2"
										className="animate-spin-slow"
									/>
									<path
										d="M 50 15 L 85 75 L 15 75 Z"
										fill="none"
										stroke={`url(#${gradientId})`}
										strokeWidth="2"
										strokeLinejoin="round"
									/>
									<path
										d="M 5 50 Q 25 20 50 50 T 95 50"
										fill="none"
										stroke="var(--success)"
										strokeWidth="2"
									/>
									<circle cx="50" cy="15" r="4" fill="var(--warning)" />
									<circle cx="85" cy="75" r="4" fill="var(--warning)" />
									<circle cx="15" cy="75" r="4" fill="var(--warning)" />
								</svg>
							</m.div>
						</m.div>
					</section>

					{/* Subjects Section - Responsive Grid */}
					<section className="space-y-12 sm:space-y-16 lg:space-y-24">
						<div className="flex items-center gap-6 sm:gap-8 lg:gap-12">
							<div className="h-px flex-1 bg-border" />
							<h2 className="text-[10px] sm:text-[11px] font-black text-label-tertiary uppercase tracking-[0.4em] whitespace-nowrap">
								Explore Subjects
							</h2>
							<div className="h-px flex-1 bg-border" />
						</div>

						<m.div
							variants={STAGGER_CONTAINER}
							initial="hidden"
							whileInView="visible"
							viewport={{ once: true, margin: '-100px' }}
							className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
						>
							{SUBJECTS.map((subject) => {
								const Icon = ICON_MAP[subject.icon] || Calculator;
								return (
									<m.div key={subject.id} variants={STAGGER_ITEM}>
										<Card
											className="bg-card p-6 sm:p-8 rounded-3xl border border-border shadow-sm group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden relative h-full flex flex-col justify-between ios-active-scale"
											onClick={() => handleAuthRoute(subject.path)}
										>
											<m.div
												className={`absolute top-0 right-0 w-48 h-48 ${subject.bg} rounded-full -mr-24 -mt-24 blur-3xl opacity-0 group-hover:opacity-40 transition-opacity duration-700`}
											/>

											<div className="space-y-6 sm:space-y-8 relative z-10">
												<div className="flex items-start justify-between">
													<m.div
														whileHover={{ scale: 1.1, rotate: 5 }}
														className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ${subject.bg} flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-500 relative overflow-hidden`}
													>
														<Icon
															className={`w-8 h-8 sm:w-10 sm:h-10 ${subject.color} relative z-10`}
															aria-hidden="true"
														/>
													</m.div>
													<div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-x-4 group-hover:translate-x-0">
														<ChevronRight className="w-5 h-5 text-foreground" />
													</div>
												</div>

												<div className="space-y-3">
													<h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tighter uppercase">
														{subject.name}
													</h3>
													<p className="text-sm text-label-secondary font-black uppercase tracking-tight leading-relaxed opacity-80">
														{subject.topics}
													</p>
												</div>
											</div>

											<div className="pt-6 sm:pt-8 relative z-10">
												<div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500">
													Learn More
													<ChevronRight className="w-4 h-4" />
												</div>
											</div>
										</Card>
									</m.div>
								);
							})}
						</m.div>
					</section>

					{/* Final CTA Section */}
					<section className="mt-24 sm:mt-32 lg:mt-48 pb-12 sm:pb-16">
						<Card className="relative p-8 sm:p-12 lg:p-16 xl:p-24 rounded-3xl lg:rounded-[4rem] bg-primary overflow-hidden">
							<div className="space-y-6 sm:space-y-8">
								<h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white tracking-tighter leading-[0.95] uppercase">
									Ready to ace
									<br className="hidden sm:block" /> your exams?
								</h2>
								<p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white/90 max-w-xl sm:max-w-2xl mx-auto tracking-tight">
									Join thousands of students and start your journey to success today.
								</p>
							</div>

							<div className="mt-10 sm:mt-12">
								<Button
									size="lg"
									className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 rounded-full h-14 sm:h-16 lg:h-20 px-10 lg:px-16 text-lg lg:text-xl xl:text-2xl font-black uppercase tracking-widest shadow-lg transition-all hover:scale-105 active:scale-95 ios-active-scale border-none"
									onClick={() => router.push('/dashboard')}
								>
									<span className="flex items-center gap-3">Get Started Free</span>
								</Button>
								<p className="mt-6 sm:mt-8 text-[10px] font-bold uppercase tracking-[0.3em] text-white/60">
									No credit card required
								</p>
							</div>
						</Card>
					</section>

					{/* Footer Section */}
					<Footer />
				</main>
			</ScrollArea>
		</div>
	);
}
