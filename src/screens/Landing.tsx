'use client';

import {
	Atom01Icon as Atom,
	Calculator01Icon as Calculator,
	ArrowRight01Icon as CaretRight,
	File01Icon as FileText,
	FlaskIcon as Flask,
	MicroscopeIcon as Microscope,
	SparklesIcon as Sparkle,
	ZapIcon as Zap,
} from 'hugeicons-react';
import { m } from 'framer-motion';
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
	Flask: Flask,
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
		<div className="flex flex-col h-full min-w-0 w-full bg-white dark:bg-zinc-950 overflow-x-hidden relative">
			<ScrollArea className="flex-1 no-scrollbar relative z-10">
				<main className="pb-4 px-8 sm:px-12 max-w-7xl mx-auto w-full lg:px-0 lg:pb-32">
					{/* Hero Section */}
					<section className="pt-20 pb-24 sm:pt-28 sm:pb-32 lg:pt-40 lg:pb-48 flex flex-col lg:flex-row items-center gap-20 lg:gap-24">
						<div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left space-y-10">
							<div className="space-y-8">
								<m.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ type: 'spring', damping: 25 }}
								>
									<div className="inline-flex items-center gap-3 px-6 py-2 bg-tiimo-purple/10 rounded-full border-none shadow-sm">
										<Sparkle size={18} className="text-tiimo-purple stroke-[3px]" />
										<span className="text-[10px] font-black text-tiimo-purple uppercase tracking-[0.2em]">Trusted by 50k+ Scholars</span>
									</div>
								</m.div>
								<h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-foreground leading-[0.9] tracking-tighter uppercase">
									Master <br />
									Finals.
								</h1>
								<p className="text-xl md:text-2xl font-bold text-muted-foreground/40 max-w-xl mx-auto lg:mx-0 leading-relaxed uppercase tracking-tight">
									Interactive past papers & expert guidance for South African Grade 12 success.
								</p>
							</div>

							<m.div
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ delay: 0.3, type: 'spring' }}
								className="w-full flex flex-col sm:flex-row gap-6 lg:max-w-none"
							>
								<Button
									size="lg"
									className="h-20 px-12 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-[2.5rem] text-xl font-black shadow-2xl shadow-black/20 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-4 group"
									onClick={() => handleAuthRoute('/dashboard')}
								>
									Start your quest
									<CaretRight size={24} className="stroke-[3.5px] group-hover:translate-x-1 transition-transform" />
								</Button>
								<Button
									variant="ghost"
									size="lg"
									className="h-20 px-10 bg-muted/10 hover:bg-muted/20 rounded-[2.5rem] text-lg font-black transition-all flex items-center justify-center gap-4"
									onClick={() => handleAuthRoute('/past-papers')}
								>
									<FileText size={24} className="stroke-[3px]" />
									Browse vault
								</Button>
							</m.div>

							<div className="flex items-center gap-4 pt-4">
								<div className="flex -space-x-3">
									{[1, 2, 3, 4].map((i) => (
										<div
											key={`avatar-${i}`}
											className="w-12 h-12 rounded-2xl border-4 border-white dark:border-zinc-950 bg-muted/10 flex items-center justify-center overflow-hidden relative shadow-lg"
										>
											<Image
												src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user-${i}`}
												alt="scholar"
												fill
												sizes="48px"
												className="object-cover"
												unoptimized
											/>
										</div>
									))}
								</div>
								<p className="text-xs font-black text-muted-foreground/30 uppercase tracking-[0.2em]">Growing community</p>
							</div>
						</div>

						{/* Hero Illustration */}
						<m.div
							initial={{ opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ type: 'spring', damping: 25, delay: 0.2 }}
							className="relative flex-1 w-full max-w-[400px] lg:max-w-none flex items-center justify-center"
						>
							<div className="relative w-full aspect-square bg-card rounded-[4rem] shadow-[0_30px_80px_rgba(0,0,0,0.08)] flex items-center justify-center group overflow-hidden transition-all duration-700 hover:rotate-2">
								<div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />

								{/* Playful Geometry */}
								<svg viewBox="0 0 100 100" className="w-64 h-64 relative z-10">
									<title>Geometry</title>
									<defs>
										<linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
											<stop offset="0%" style={{ stopColor: 'var(--primary)', stopOpacity: 1 }} />
											<stop offset="100%" style={{ stopColor: 'var(--tiimo-purple)', stopOpacity: 1 }} />
										</linearGradient>
									</defs>
									<m.circle
										cx="50"
										cy="50"
										r="40"
										stroke={`url(#${gradientId})`}
										strokeWidth="2"
										fill="none"
										strokeDasharray="10 10"
										animate={{ rotate: 360 }}
										transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
									/>
									<m.path
										d="M 50 10 L 90 80 L 10 80 Z"
										fill="none"
										stroke={`url(#${gradientId})`}
										strokeWidth="4"
										strokeLinejoin="round"
										animate={{ scale: [1, 1.05, 1], rotate: [0, 5, 0] }}
										transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY }}
									/>
									<circle cx="50" cy="10" r="6" fill="var(--tiimo-orange)" />
									<circle cx="90" cy="80" r="6" fill="var(--tiimo-pink)" />
									<circle cx="10" cy="80" r="6" fill="var(--tiimo-blue)" />
								</svg>
							</div>

							{/* Floating Huge Badges */}
							<m.div
								animate={{ y: [0, -20, 0], rotate: [-12, -8, -12] }}
								transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
								className="absolute -top-8 -right-8 w-24 h-24 bg-tiimo-orange text-white rounded-[1.75rem] shadow-2xl flex items-center justify-center z-20 border-8 border-white dark:border-zinc-950"
							>
								<Zap size={48} className="stroke-[3.5px] fill-white/20" />
							</m.div>
							<m.div
								animate={{ y: [0, 20, 0], rotate: [12, 18, 12] }}
								transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY }}
								className="absolute -bottom-8 -left-8 w-28 h-28 bg-tiimo-blue text-white rounded-[2rem] shadow-2xl flex items-center justify-center z-20 border-8 border-white dark:border-zinc-950"
							>
								<Atom size={56} className="stroke-[3px]" />
							</m.div>
						</m.div>
					</section>

					{/* Subjects Section */}
					<section className="space-y-16 sm:space-y-24 lg:space-y-32">
						<div className="flex items-center gap-8 px-2">
							<h2 className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.5em] whitespace-nowrap">
								Curriculum domains
							</h2>
							<div className="h-px flex-1 bg-muted/10" />
						</div>

						<m.div
							variants={STAGGER_CONTAINER}
							initial="hidden"
							whileInView="visible"
							viewport={{ once: true, margin: '-100px' }}
							className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12"
						>
							{SUBJECTS.map((subject) => {
								const Icon = ICON_MAP[subject.icon] || Calculator;
								return (
									<m.div key={subject.id} variants={STAGGER_ITEM}>
										<Card
											className="bg-card p-10 rounded-[3.5rem] border-none shadow-[0_15px_45px_rgba(0,0,0,0.05)] group hover:shadow-[0_40px_100px_rgba(0,0,0,0.12)] hover:-translate-y-4 transition-all duration-700 cursor-pointer overflow-hidden relative h-[420px] flex flex-col justify-between"
											onClick={() => handleAuthRoute(subject.path)}
										>
											<div className="absolute -top-12 -right-12 w-48 h-48 bg-muted/5 rounded-full blur-3xl group-hover:bg-primary/5 transition-colors duration-700" />

											<div className="space-y-10 relative z-10">
												<div className="flex items-start justify-between">
													<div
														className={cn(
															"w-24 h-24 rounded-[1.75rem] flex items-center justify-center shadow-2xl transition-all duration-700 group-hover:scale-110 group-hover:rotate-12",
															subject.bg.replace('/10', '').replace('bg-', 'bg-')
														)}
													>
														<Icon
															size={48}
															className="text-white stroke-[3px] fill-white/10"
															aria-hidden="true"
														/>
													</div>
													<div className="w-14 h-14 rounded-2xl bg-muted/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-x-4 group-hover:translate-x-0">
														<CaretRight size={28} className="text-foreground stroke-[3.5px]" />
													</div>
												</div>

												<div className="space-y-4">
													<h3 className="text-4xl font-black text-foreground tracking-tighter uppercase leading-none">
														{subject.name}
													</h3>
													<p className="text-sm font-bold text-muted-foreground/60 uppercase tracking-widest leading-relaxed">
														{subject.topics}
													</p>
												</div>
											</div>

											<div className="relative z-10">
												<div className="inline-flex items-center gap-3 px-6 h-12 rounded-2xl bg-muted/10 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground transition-all duration-500 group-hover:bg-primary group-hover:text-white group-hover:shadow-xl group-hover:shadow-primary/30">
													Learn more
													<CaretRight size={14} className="stroke-[4px]" />
												</div>
											</div>
										</Card>
									</m.div>
								);
							})}
						</m.div>
					</section>

					{/* Final CTA Section */}
					<section className="mt-40 sm:mt-56 lg:mt-64">
						<Card className="relative p-12 sm:p-20 lg:p-28 rounded-[4rem] sm:rounded-[6rem] bg-zinc-950 text-white overflow-hidden shadow-[0_50px_120px_rgba(0,0,0,0.5)] border-none">
							<div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[150px] -mr-40 -mt-40 pointer-events-none" />

							<div className="space-y-10 relative z-10 max-w-4xl">
								<h2 className="text-5xl sm:text-7xl lg:text-9xl font-black tracking-tighter leading-[0.85] uppercase">
									Reach your <br />
									True Peak.
								</h2>
								<p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white/40 max-w-2xl leading-relaxed uppercase tracking-tight">
									Join thousands of Grade 12 scholars making history.
								</p>
							</div>

							<div className="mt-16 sm:mt-24 relative z-10">
								<m.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
									<Button
										size="lg"
										className="w-full sm:w-auto bg-white text-zinc-950 hover:bg-white/90 rounded-[2.5rem] h-20 sm:h-24 px-16 lg:px-24 text-2xl lg:text-3xl font-black uppercase tracking-widest shadow-2xl transition-all border-none"
										onClick={() => router.push('/dashboard')}
									>
										Unlock your potential
									</Button>
								</m.div>
								<p className="mt-10 text-xs font-black uppercase tracking-[0.4em] text-white/20">
									No Commitment • Always Evolving
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
