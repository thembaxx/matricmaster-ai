'use client';

import { m } from 'framer-motion';
import { Atom, Calculator, ChevronRight, FlaskConical, Microscope, Sparkles } from 'lucide-react';
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

// function EmailSubscriptionForm() {
// 	const [email, setEmail] = useState('');
// 	const [isSubmitting, setIsSubmitting] = useState(false);
// 	const [isSubscribed, setIsSubscribed] = useState(false);

// 	const handleSubmit = async (e: React.FormEvent) => {
// 		e.preventDefault();
// 		if (!email) return;

// 		setIsSubmitting(true);
// 		await new Promise((resolve) => setTimeout(resolve, 1000));
// 		setIsSubscribed(true);
// 		setIsSubmitting(false);
// 	};

// 	if (isSubscribed) {
// 		return (
// 			<m.div
// 				initial={{ opacity: 0, scale: 0.95 }}
// 				animate={{ opacity: 1, scale: 1 }}
// 				className="bg-brand-green/10 rounded-[2.5rem] p-8 text-center"
// 			>
// 				<div className="w-16 h-16 bg-brand-green rounded-full flex items-center justify-center mx-auto mb-4">
// 					<Sparkles className="w-8 h-8 text-white" />
// 				</div>
// 				<h3 className="text-xl font-black text-foreground mb-2">You're subscribed!</h3>
// 				<p className="text-muted-foreground">
// 					Thanks for subscribing. We'll send you exam tips and updates.
// 				</p>
// 			</m.div>
// 		);
// 	}

// 	return (
// 		<m.div
// 			initial={{ opacity: 0, y: 20 }}
// 			whileInView={{ opacity: 1, y: 0 }}
// 			viewport={{ once: true }}
// 			className="space-y-6"
// 		>
// 			<div className="space-y-2">
// 				<p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">
// 					Stay Updated
// 				</p>
// 				<h3 className="text-xl sm:text-2xl font-black text-foreground">Get exam tips & updates</h3>
// 			</div>
// 			<form onSubmit={handleSubmit} className="space-y-4">
// 				<div className="flex flex-col sm:flex-row gap-3">
// 					<Input
// 						type="email"
// 						placeholder="Enter your email"
// 						value={email}
// 						onChange={(e) => setEmail(e.target.value)}
// 						className="h-12 sm:h-14 px-4 sm:px-6 rounded-xl sm:rounded-2xl text-base border-border bg-background flex-1"
// 						required
// 					/>
// 					<Button
// 						type="submit"
// 						size="lg"
// 						disabled={isSubmitting}
// 						className="h-12 sm:h-14 px-6 sm:px-8 rounded-xl sm:rounded-2xl font-black shrink-0"
// 					>
// 						{isSubmitting ? (
// 							<span className="flex items-center gap-2">
// 								<span className="animate-spin">⏳</span>
// 								Subscribing...
// 							</span>
// 						) : (
// 							<span className="flex items-center gap-2">
// 								<Mail className="w-5 h-5" />
// 								Subscribe
// 							</span>
// 						)}
// 					</Button>
// 				</div>
// 				<p className="text-xs text-muted-foreground">
// 					No spam, just exam tips and updates. Unsubscribe anytime.
// 				</p>
// 			</form>
// 		</m.div>
// 	);
// }

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
			{/* Decorative Orbs */}
			<div className="absolute top-[-10%] right-[-10%] w-125 h-125 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
			{/* <div className="absolute bottom-[-10%] left-[-10%] w-100 h-100 bg-brand-purple/5 rounded-full blur-[100px] pointer-events-none" /> */}

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
									<Badge className="bg-brand-green/20 text-brand-green-darker border-none rounded-full px-4 sm:px-6 py-2 font-black text-xs tracking-widest uppercase mb-4 shadow-sm">
										Trusted by 50,000+ Students
									</Badge>
								</m.div>
								<SmoothWords
									as="h1"
									text="Master your Matrics through practice."
									className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-foreground drop-shadow-sm leading-[1.05] tracking-tighter"
									stagger={0.08}
								/>
								<SmoothText
									text="Interactive past papers and step-by-step guides for South African Grade 12 students."
									className="text-base md:text-lg lg:text-xl font-medium text-muted-foreground max-w-lg mx-auto lg:mx-0 leading-relaxed pt-2 sm:pt-4"
									delay={0.5}
								/>
							</div>

							<m.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.8 }}
								className="w-full max-w-sm flex flex-col sm:flex-row gap-3 sm:gap-4 lg:max-w-none"
							>
								<Button
									size="lg"
									className="w-full sm:w-auto lg:flex-none lg:w-72 rounded-2xl shrink-0 h-12 lg:h-14 xl:h-16 text-base lg:text-lg xl:text-xl font-black shadow-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-primary/20 bg-primary"
									onClick={() => handleAuthRoute('/dashboard')}
								>
									Start Learning
									<ChevronRight className="w-5 h-5 ml-2" />
								</Button>
								<Button
									variant="outline"
									size="lg"
									className="w-full sm:w-auto lg:flex-none lg:w-64 rounded-2xl h-12 lg:h-14 xl:h-16 text-base lg:text-lg font-black border-2 hover:bg-muted active:scale-95 transition-all"
									onClick={() => handleAuthRoute('/past-papers')}
								>
									Past Papers
								</Button>
							</m.div>

							<div className="flex items-center gap-4 pt-4 opacity-60">
								<div className="flex -space-x-3">
									{[1, 2, 3, 4].map((i) => (
										<div
											key={i}
											className="w-10 h-10 rounded-full border-2 border-background bg-muted flex items-center justify-center overflow-hidden relative"
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
								<p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
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
							<div className="absolute inset-0 bg-linear-to-tr from-primary/20 to-brand-purple/20 rounded-full blur-[100px] animate-pulse-slow" />

							<m.div
								whileHover={{ scale: 1.02 }}
								className="relative w-full aspect-square max-w-75 sm:max-w-87.5 md:max-w-112.5 bg-card rounded-2xl sm:rounded-[3rem] md:rounded-[4rem] shadow-2xl flex items-center justify-center transform border-4 border-card transition-transform duration-700 overflow-hidden"
								style={{ boxShadow: '0 40px 100px -20px rgba(0,0,0,0.15)' }}
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
											<stop offset="0%" style={{ stopColor: 'var(--primary)', stopOpacity: 1 }} />
											<stop
												offset="100%"
												style={{ stopColor: 'var(--color-brand-purple)', stopOpacity: 1 }}
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
										stroke="var(--color-brand-green)"
										strokeWidth="2"
									/>
									<circle cx="50" cy="15" r="4" fill="var(--color-brand-amber)" />
									<circle cx="85" cy="75" r="4" fill="var(--color-brand-amber)" />
									<circle cx="15" cy="75" r="4" fill="var(--color-brand-amber)" />
								</svg>
							</m.div>

							{/* Floating Badges */}
							<m.div
								animate={{ y: [0, -15, 0] }}
								transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
								className="absolute -top-3 sm:-top-4 right-0 sm:right-2 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-brand-amber rounded-2xl sm:rounded-3xl shadow-2xl flex items-center justify-center -rotate-12 z-20"
							>
								<Sparkles className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white fill-white" />
							</m.div>
							<m.div
								animate={{ y: [0, 20, 0], rotate: [12, 18, 12] }}
								transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
								className="absolute -bottom-4 sm:-bottom-6 left-0 sm:left-2 w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-brand-green rounded-2xl sm:rounded-[2rem] md:rounded-[2.5rem] shadow-2xl flex items-center justify-center z-20"
							>
								<Atom className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-white" />
							</m.div>
						</m.div>
					</section>

					{/* Subjects Section - Responsive Grid */}
					<section className="space-y-12 sm:space-y-16 lg:space-y-24">
						<div className="flex items-center gap-6 sm:gap-8 lg:gap-12">
							<div className="h-px flex-1 bg-border/60" />
							<h2 className="text-xs sm:text-sm font-black text-muted-foreground uppercase tracking-[0.3em] lg:tracking-[0.4em] whitespace-nowrap">
								Explore Subjects
							</h2>
							<div className="h-px flex-1 bg-border/60" />
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
											className="bg-card p-6 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border border-border shadow-sm group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden relative h-full flex flex-col justify-between"
											onClick={() => handleAuthRoute(subject.path)}
										>
											<m.div
												className={`absolute top-0 right-0 w-48 h-48 ${subject.bg} rounded-full -mr-24 -mt-24 blur-3xl opacity-0 group-hover:opacity-40 transition-opacity duration-700`}
											/>

											<div className="space-y-6 sm:space-y-8 relative z-10">
												<div className="flex items-start justify-between">
													<m.div
														whileHover={{ scale: 1.1, rotate: 5 }}
														className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-[2rem] ${subject.bg} flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-500 relative overflow-hidden`}
													>
														<Icon
															className={`w-8 h-8 sm:w-10 sm:h-10 ${subject.color} relative z-10`}
															aria-hidden="true"
														/>
													</m.div>
													<div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-x-4 group-hover:translate-x-0">
														<ChevronRight className="w-5 h-5 text-foreground" />
													</div>
												</div>

												<div className="space-y-3">
													<h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tighter">
														{subject.name}
													</h3>
													<p className="text-base text-muted-foreground font-medium leading-relaxed opacity-80">
														{subject.topics}
													</p>
												</div>
											</div>

											<div className="pt-6 sm:pt-8 relative z-10">
												<div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500">
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
						<Card className="bg-primary p-8 sm:p-12 lg:p-16 xl:p-24 rounded-2xl sm:rounded-[3rem] lg:rounded-[4rem] text-center space-y-8 sm:space-y-12 relative overflow-hidden group">
							<div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
							<div className="absolute -top-24 -left-24 w-96 h-96 bg-white/5 rounded-full blur-[100px] pointer-events-none" />
							<div className="absolute -bottom-24 -right-24 w-96 h-96 bg-black/10 rounded-full blur-[100px] pointer-events-none" />

							<div className="space-y-4 sm:space-y-6 relative z-10">
								<h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-primary-foreground tracking-tighter leading-none">
									Ready to ace your exams?
								</h2>
								<p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-primary-foreground/80 max-w-xl sm:max-w-2xl mx-auto">
									Join thousands of students and start your journey to success today.
								</p>
							</div>

							<div className="relative z-10">
								<Button
									size="lg"
									className="w-full sm:w-auto bg-white text-primary hover:bg-zinc-100 rounded-[2rem] h-12 sm:h-14 lg:h-16 px-8 lg:px-12 text-lg lg:text-xl xl:text-2xl font-black shadow-2xl transition-all hover:scale-105 active:scale-95"
									onClick={() => router.push('/dashboard')}
								>
									Get Started for Free
								</Button>
								<p className="mt-6 sm:mt-8 text-xs font-black uppercase tracking-[0.3em] text-primary-foreground/60">
									No credit card required • Instant access
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
