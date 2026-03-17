'use client';

import {
	ArrowRight01Icon,
	AtomIcon,
	BookOpen01Icon,
	BrainIcon,
	CalculatorIcon,
	Chemistry01Icon,
	FlashIcon,
	MicroscopeIcon,
	SparklesIcon,
	StarIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useId, useRef } from 'react';
import { toast } from 'sonner';
import { appConfig } from '@/app.config';
import { Footer } from '@/components/Layout/footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SUBJECTS } from '@/constants/mock-data';
import {
	type IconSvg,
	LANDING_FEATURES,
	LANDING_STATS,
	LANDING_TESTIMONIALS,
} from '@/data/landing';
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/animation-presets';
import { useSession } from '@/lib/auth-client';

const ICON_MAP: Record<string, IconSvg> = {
	Calculator: CalculatorIcon,
	Atom: AtomIcon,
	FlaskConical: Chemistry01Icon,
	Microscope: MicroscopeIcon,
};

const FEATURES = LANDING_FEATURES;
const STATS = LANDING_STATS;
const TESTIMONIALS = LANDING_TESTIMONIALS;

export default function Landing() {
	const router = useRouter();
	const { data: session } = useSession();
	const containerRef = useRef<HTMLDivElement>(null);
	const ctaPatternId = useId();
	const { scrollYProgress } = useScroll({
		target: containerRef,
		offset: ['start start', 'end start'],
	});

	const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
	const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

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
			<ScrollArea className="flex-1 no-scrollbar relative">
				<main
					ref={containerRef}
					className="pb-4 px-6 sm:px-6 max-w-7xl mx-auto w-full lg:px-0 lg:pb-24"
				>
					{/* Hero Section */}
					<section className="pt-8 pb-20 lg:pt-8 lg:pb-32 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
						<div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left space-y-8">
							<m.div
								initial={{ opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ type: 'spring', stiffness: 300, damping: 28 }}
								className="space-y-8"
							>
								<Badge variant="glass" className="rounded-full px-4 py-1.5 text-[10px] font-medium text-white bg-primary-purple!">
									<HugeiconsIcon icon={FlashIcon} className="w-3 h-3 mr-1.5" />
									The #1 NSC prep platform
								</Badge>

								<m.h1
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.1 }}
									className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-black text-foreground leading-[0.85] tracking-tighter"
								>
									REACH THE
									<br />
									<span className="text-galaxy-gradient uppercase">Stars</span>
								</m.h1>

								<m.p
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.2 }}
									className="text-xl md:text-2xl text-muted-foreground max-w-lg text-pretty mx-auto lg:mx-0 font-medium"
								>
									Your mission to ace Matric starts here. Expert guidance, 3D labs, and cosmic rewards.
								</m.p>
							</m.div>

							<m.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.3 }}
								className="flex flex-col sm:flex-row gap-4 w-full max-w-md"
							>
								<Button
									size="lg"
									className="w-full sm:w-auto h-14 rounded-[var(--radius-lg)] text-base font-semibold shadow-lg shadow-tiimo-lavender/25 hover:shadow-xl hover:shadow-tiimo-lavender/30 transition-all"
									onClick={() => handleAuthRoute('/dashboard')}
								>
									<span className="flex items-center gap-2">
										Start Learning
										<HugeiconsIcon icon={ArrowRight01Icon} className="w-5 h-5" />
									</span>
								</Button>
								<Button
									size="lg"
									variant="outline"
									className="w-full sm:w-auto h-14 rounded-[var(--radius-lg)] text-base font-medium"
									onClick={() => router.push('/past-papers')}
								>
									<span className="flex items-center gap-2">
										Browse Papers
										<HugeiconsIcon icon={BookOpen01Icon} className="w-5 h-5" />
									</span>
								</Button>
							</m.div>

							<m.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.5 }}
								className="flex items-center gap-4 pt-4"
							>
								<div className="flex -space-x-3">
									{[1, 2, 3, 4, 5].map((i) => (
										<div
											key={`avatar-${i}`}
											className="w-10 h-10 rounded-full border-3 border-background bg-secondary flex items-center justify-center overflow-hidden relative shadow-sm"
										>
											<Image
												src={''}
												alt="user"
												fill
												sizes="40px"
												className="object-cover"
												unoptimized
											/>
										</div>
									))}
								</div>
								<div className="text-left">
									<p className="text-sm font-semibold">50,000+ students</p>
									<p className="text-xs text-muted-foreground">trust {appConfig.name}</p>
								</div>
							</m.div>
						</div>

						{/* Hero Visual with 3D Character */}
						<m.div
							initial={{ opacity: 0, x: 40 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ type: 'spring', stiffness: 300, damping: 28, delay: 0.2 }}
							className="relative w-full max-w-lg lg:max-w-xl"
							style={{ y, opacity }}
						>
							{/* Main Card */}
							<m.div
								whileHover={{ scale: 1.02 }}
								className="relative w-full aspect-square max-w-lg mx-auto"
							>
								<div className="absolute inset-0 bg-gradient-to-br from-tiimo-lavender/20 via-transparent to-subject-physics/20 rounded-[var(--radius-2xl)]" />

								{/* Abstract Shapes */}
								<m.div
									animate={{ rotate: 360 }}
									transition={{ duration: 60, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
									className="absolute inset-8 rounded-full border border-tiimo-lavender/20"
								/>
								<m.div
									animate={{ rotate: -360 }}
									transition={{ duration: 45, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
									className="absolute inset-16 rounded-full border border-subject-physics/20 border-dashed"
								/>

								{/* Central Illustration with 3D Character */}
								<div className="absolute inset-0 flex items-center justify-center">
									<div className="relative w-64 h-64">
										{/* 3D Character Image */}
										<div className="absolute inset-0 flex items-center justify-center">
											<Image
												src="https://cdn3d.iconscout.com/3d/premium/thumb/astronaut-7253396-5912440.png"
												alt="3D Astronaut"
												fill
												className="object-contain"
												priority
												unoptimized
											/>
										</div>

										{/* Floating UI Elements */}
										<m.div
											animate={{ y: [0, -8, 0] }}
											transition={{
												duration: 3.5,
												repeat: Number.POSITIVE_INFINITY,
												ease: 'easeInOut',
											}}
											className="absolute -top-2 -left-4 w-20 h-24 bg-card rounded-[var(--radius-lg)] shadow-xl border border-border/50 flex flex-col items-center justify-center p-2 z-10"
										>
											<div className="w-8 h-8 rounded-[var(--radius-md)] bg-subject-math/20 flex items-center justify-center mb-1">
												<HugeiconsIcon
													icon={CalculatorIcon}
													className="w-4 h-4 text-subject-math"
												/>
											</div>
											<div className="h-1 w-12 bg-secondary rounded-full overflow-hidden">
												<div className="h-full w-3/4 bg-subject-math rounded-full" />
											</div>
											<span className="text-[8px] font-medium mt-1">Math 92%</span>
										</m.div>

										<m.div
											animate={{ y: [0, 8, 0] }}
											transition={{
												duration: 4,
												repeat: Number.POSITIVE_INFINITY,
												ease: 'easeInOut',
												delay: 0.5,
											}}
											className="absolute -bottom-2 -right-4 w-20 h-24 bg-card rounded-[var(--radius-lg)] shadow-xl border border-border/50 flex flex-col items-center justify-center p-2 z-20"
										>
											<div className="w-8 h-8 rounded-[var(--radius-md)] bg-subject-life/20 flex items-center justify-center mb-1">
												<HugeiconsIcon icon={BrainIcon} className="w-4 h-4 text-subject-life" />
											</div>
											<div className="h-1 w-12 bg-secondary rounded-full overflow-hidden">
												<div className="h-full w-1/2 bg-subject-life rounded-full" />
											</div>
											<span className="text-[8px] font-medium mt-1">Physics 78%</span>
										</m.div>
									</div>
								</div>

								{/* Stats Card */}
								<m.div
									initial={{ opacity: 0, x: 20 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: 0.8 }}
									className="absolute -right-4 top-1/4 bg-card rounded-[var(--radius-lg)] p-4 shadow-xl border border-border/50"
								>
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 rounded-[var(--radius-md)] bg-success/10 flex items-center justify-center">
											<HugeiconsIcon icon={FlashIcon} className="w-5 h-5 text-success" />
										</div>
										<div>
											<p className="text-lg font-bold">2,450</p>
											<p className="text-xs text-muted-foreground">XP Earned</p>
										</div>
									</div>
								</m.div>

								{/* Streak Card */}
								<m.div
									initial={{ opacity: 0, x: -20 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: 1 }}
									className="absolute -left-4 bottom-1/4 bg-card rounded-[var(--radius-lg)] p-4 shadow-xl border border-border/50"
								>
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 rounded-[var(--radius-md)] bg-orange-100 flex items-center justify-center">
											<span className="text-lg">🔥</span>
										</div>
										<div>
											<p className="text-lg font-bold">12 day</p>
											<p className="text-xs text-muted-foreground">Study Streak</p>
										</div>
									</div>
								</m.div>

								{/* Achievement Badge */}
								<m.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 1.2 }}
									className="absolute -bottom-2 left-1/4 bg-card rounded-[var(--radius-lg)] p-3 shadow-xl border border-border/50 flex items-center gap-2"
								>
									<div className="w-8 h-8 rounded-full bg-tiimo-yellow/20 flex items-center justify-center">
										<HugeiconsIcon icon={StarIcon} className="w-4 h-4 text-tiimo-yellow" />
									</div>
									<div>
										<p className="text-sm font-bold">Top 5%</p>
										<p className="text-[10px] text-muted-foreground">Math Challenge</p>
									</div>
								</m.div>
							</m.div>
						</m.div>
					</section>

					{/* Features Section */}
					<section className="py-20 lg:py-32 relative">
						<div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-sa-pattern opacity-5 -z-10" />
						<m.div
							initial={{ opacity: 0, y: 40 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, margin: '-100px' }}
							transition={{ duration: 0.6 }}
							className="text-center mb-16"
						>
							<h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 text-pretty uppercase tracking-tighter">
								Ready for
								<span className="text-tiimo-lavender"> Liftoff?</span>
							</h2>
							<p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
								Study tools built specifically for the NSC Grade 12 exams.
							</p>
						</m.div>

						<m.div
							variants={STAGGER_CONTAINER}
							initial="hidden"
							whileInView="visible"
							viewport={{ once: true, margin: '-100px' }}
							className="grid md:grid-cols-3 gap-6 lg:gap-8"
						>
							{FEATURES.map((feature) => (
								<m.div
									key={feature.title}
									variants={STAGGER_ITEM}
									className="group p-8 rounded-[var(--radius-2xl)] bg-white dark:bg-slate-900 shadow-clay hover:shadow-tiimo-xl transition-all duration-500 hover:-translate-y-2 border-none"
								>
									<div
										className={`w-16 h-16 rounded-[var(--radius-xl)] ${feature.color} flex items-center justify-center mb-8 shadow-inner`}
									>
										<HugeiconsIcon icon={feature.icon} className="w-8 h-8" />
									</div>
									<h3 className="text-2xl font-black mb-3 tracking-tight uppercase">{feature.title}</h3>
									<p className="text-muted-foreground leading-relaxed font-medium">{feature.description}</p>
								</m.div>
							))}
						</m.div>
					</section>

					{/* Stats Section */}
					<section className="py-16 lg:py-24 bg-muted/30 rounded-[var(--radius-2xl)] mx-4 lg:mx-0">
						<m.div
							initial={{ opacity: 0, y: 40 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.6 }}
							className="max-w-7xl mx-auto px-6"
						>
							<div className="grid grid-cols-2 md:grid-cols-4 gap-8">
								{STATS.map((stat, index) => (
									<m.div
										key={stat.label}
										initial={{ opacity: 0, y: 20 }}
										whileInView={{ opacity: 1, y: 0 }}
										viewport={{ once: true }}
										transition={{ duration: 0.5, delay: index * 0.1 }}
										className="text-center"
									>
										<p className="text-3xl lg:text-4xl font-bold text-tiimo-lavender mb-2">
											{stat.value}
										</p>
										<p className="text-muted-foreground text-xs font-medium">{stat.label}</p>
									</m.div>
								))}
							</div>
						</m.div>
					</section>

					{/* Subjects Section */}
					<section className="py-20 lg:py-32">
						<m.div
							initial={{ opacity: 0, y: 40 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, margin: '-100px' }}
							transition={{ duration: 0.6 }}
							className="mb-12"
						>
							<h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 uppercase tracking-tighter">
								Select Your
								<span className="text-tiimo-lavender"> Planet</span>
							</h2>
							<p className="text-lg text-muted-foreground font-medium">
								Pick your subjects and start your journey through the NSC galaxy.
							</p>
						</m.div>

						<m.div
							variants={STAGGER_CONTAINER}
							initial="hidden"
							whileInView="visible"
							viewport={{ once: true, margin: '-100px' }}
							className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
						>
							{SUBJECTS.map((subject) => {
								const icon = ICON_MAP[subject.icon] || CalculatorIcon;
								return (
									<m.button
										key={subject.id}
										type="button"
										variants={STAGGER_ITEM}
										onClick={() => handleAuthRoute(subject.path)}
										className="group relative p-8 rounded-[var(--radius-2xl)] bg-white dark:bg-slate-900 shadow-clay hover:shadow-tiimo-xl transition-all duration-500 text-left overflow-hidden border-none"
									>
										<div
											className={`absolute top-0 right-0 w-32 h-32 ${subject.bg} rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl`}
										/>

										<div className="relative z-10">
											<div
												className={`w-14 h-14 rounded-[var(--radius-xl)] ${subject.bg} flex items-center justify-center mb-6 shadow-inner`}
											>
												<HugeiconsIcon icon={icon} className={`w-7 h-7 ${subject.color}`} />
											</div>
											<h3 className="text-2xl font-black mb-2 uppercase tracking-tight">{subject.name}</h3>
											<p className="text-sm text-muted-foreground font-medium">{subject.topics}</p>
										</div>

										<div className="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-secondary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0 -translate-x-2">
											<HugeiconsIcon icon={ArrowRight01Icon} className="w-5 h-5" />
										</div>
									</m.button>
								);
							})}
						</m.div>
					</section>

					{/* Testimonials Section */}
					<section className="py-20 lg:py-32">
						<m.div
							initial={{ opacity: 0, y: 40 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, margin: '-100px' }}
							transition={{ duration: 0.6 }}
							className="text-center mb-16"
						>
							<h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
								Loved by
								<span className="text-tiimo-lavender"> thousands</span>
							</h2>
							<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
								See what South African students are saying about {appConfig.name}.
							</p>
						</m.div>

						<m.div
							variants={STAGGER_CONTAINER}
							initial="hidden"
							whileInView="visible"
							viewport={{ once: true, margin: '-100px' }}
							className="grid md:grid-cols-3 gap-6 lg:gap-8"
						>
							{TESTIMONIALS.map((testimonial) => (
								<m.div
									key={testimonial.name}
									variants={STAGGER_ITEM}
									className="p-8 rounded-[var(--radius-xl)] bg-card border border-border/50 hover:border-tiimo-lavender/30 transition-all duration-300"
								>
									<div className="flex items-center gap-1 mb-4">
										{[1, 2, 3, 4, 5].map((i) => (
											<HugeiconsIcon
												key={i}
												icon={StarIcon}
												className="w-5 h-5 text-tiimo-yellow fill-tiimo-yellow"
											/>
										))}
									</div>
									<p className="text-muted-foreground mb-6 leading-relaxed">
										"{testimonial.quote}"
									</p>
									<div className="flex items-center gap-4">
										<Image
											src={testimonial.image}
											alt={testimonial.name}
											width={48}
											height={48}
											className="rounded-full object-cover"
											unoptimized
										/>
										<div>
											<p className="font-bold">{testimonial.name}</p>
											<p className="text-sm text-muted-foreground">{testimonial.grade}</p>
										</div>
									</div>
								</m.div>
							))}
						</m.div>
					</section>

					{/* Final CTA Section */}
					<section className="py-20 lg:py-32">
						<m.div
							initial={{ opacity: 0, scale: 0.95 }}
							whileInView={{ opacity: 1, scale: 1 }}
							viewport={{ once: true }}
							transition={{ duration: 0.6 }}
							className="relative overflow-hidden rounded-[var(--radius-2xl)] bg-galaxy-gradient p-12 lg:p-20 shadow-tiimo-xl"
						>
							{/* Background Pattern */}
							<div className="absolute inset-0 opacity-10">
								<svg
									className="w-full h-full"
									viewBox="0 0 100 100"
									preserveAspectRatio="none"
									role="img"
									aria-label="Decorative pattern"
								>
									<pattern id={ctaPatternId} width="10" height="10" patternUnits="userSpaceOnUse">
										<circle cx="1" cy="1" r="1" fill="white" />
									</pattern>
									<rect width="100%" height="100%" fill={`url(#${ctaPatternId})`} />
								</svg>
							</div>

							<div className="relative z-10 text-center space-y-8">
								<h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-white uppercase tracking-tighter">
									Ready for
									<br />
									Liftoff?
								</h2>
								<p className="text-lg md:text-xl text-white/80 max-w-xl mx-auto">
									Join thousands of South African students who are already mastering their subjects.
								</p>
								<div className="flex flex-col sm:flex-row gap-4 justify-center">
									<Button
										size="lg"
										className="w-full sm:w-auto h-14 rounded-[var(--radius-lg)] text-base font-semibold bg-white text-tiimo-lavender hover:bg-white/90 shadow-xl"
										onClick={() => router.push('/sign-up')}
									>
										<span className="flex items-center gap-2">
											Get Started Free
											<HugeiconsIcon icon={ArrowRight01Icon} className="w-5 h-5" />
										</span>
									</Button>
								</div>
								<p className="text-sm text-white/60">No credit card required · Cancel anytime</p>
							</div>
						</m.div>
					</section>

					{/* Footer Section */}
					<Footer />
				</main>
			</ScrollArea>
		</div>
	);
}
