'use client';

import {
	ArrowRight01Icon,
	AtomIcon,
	BookOpen01Icon,
	CalculatorIcon,
	Chemistry01Icon,
	FlashIcon,
	MagicWand01Icon,
	MicroscopeIcon,
	SparklesIcon,
	Task02Icon,
	Timer02Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useId, useRef } from 'react';
import { toast } from 'sonner';
import { Footer } from '@/components/Layout/footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SUBJECTS } from '@/constants/mock-data';
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/animation-presets';
import { useSession } from '@/lib/auth-client';

type IconSvg = typeof CalculatorIcon;

const ICON_MAP: Record<string, IconSvg> = {
	Calculator: CalculatorIcon,
	Atom: AtomIcon,
	FlaskConical: Chemistry01Icon,
	Microscope: MicroscopeIcon,
};

const FEATURES = [
	{
		icon: MagicWand01Icon,
		title: 'Study Buddy',
		description: 'Stuck on a question? Get help instantly, anytime.',
		color: 'bg-tiimo-lavender/10 text-tiimo-lavender',
	},
	{
		icon: Task02Icon,
		title: 'Past Papers',
		description: 'Practice with real NSC exam questions. Full solutions included.',
		color: 'bg-subject-math/10 text-subject-math',
	},
	{
		icon: Timer02Icon,
		title: 'Track Progress',
		description: "Study streaks, XP, and achievements. See how far you've come.",
		color: 'bg-subject-life/10 text-subject-life',
	},
];

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
								<Badge className="tiimo-glass bg-primary-purple! rounded-full px-4 py-1.5 text-[10px] font-medium text-white">
									<HugeiconsIcon icon={SparklesIcon} className="w-3 h-3 mr-1.5" />
									The #1 NSC prep platform
								</Badge>

								<m.h1
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.1 }}
									className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-foreground leading-[0.95]"
								>
									Master your
									<br />
									<span className="text-tiimo-lavender">Matric exams</span>
								</m.h1>

								<m.p
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.2 }}
									className="text-lg md:text-xl text-muted-foreground max-w-lg text-pretty mx-auto lg:mx-0 leading-relaxed"
								>
									Practice past papers, get instant help when you're stuck, and track your progress.
									We help you pass your Matric.
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
												src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user-${i}`}
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
									<p className="text-xs text-muted-foreground">trust MatricMaster</p>
								</div>
							</m.div>
						</div>

						{/* Hero Visual */}
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

								{/* Central Illustration */}
								<div className="absolute inset-0 flex items-center justify-center">
									<div className="relative w-48 h-48">
										{/* Floating Cards */}
										<m.div
											animate={{ y: [0, -10, 0] }}
											transition={{
												duration: 4,
												repeat: Number.POSITIVE_INFINITY,
												ease: 'easeInOut',
											}}
											className="absolute -top-4 -left-8 w-24 h-28 bg-card rounded-[var(--radius-lg)] shadow-xl border border-border/50 flex flex-col items-center justify-center p-3 z-10"
										>
											<div className="w-10 h-10 rounded-[var(--radius-md)] bg-subject-math/20 flex items-center justify-center mb-2">
												<HugeiconsIcon
													icon={CalculatorIcon}
													className="w-5 h-5 text-subject-math"
												/>
											</div>
											<div className="h-1.5 w-16 bg-secondary rounded-full overflow-hidden">
												<div className="h-full w-3/4 bg-subject-math rounded-full" />
											</div>
										</m.div>

										<m.div
											animate={{ y: [0, 10, 0] }}
											transition={{
												duration: 5,
												repeat: Number.POSITIVE_INFINITY,
												ease: 'easeInOut',
												delay: 0.5,
											}}
											className="absolute -bottom-2 -right-6 w-24 h-28 bg-card rounded-[var(--radius-lg)] shadow-xl border border-border/50 flex flex-col items-center justify-center p-3 z-20"
										>
											<div className="w-10 h-10 rounded-[var(--radius-md)] bg-subject-life/20 flex items-center justify-center mb-2">
												<HugeiconsIcon icon={AtomIcon} className="w-5 h-5 text-subject-life" />
											</div>
											<div className="h-1.5 w-16 bg-secondary rounded-full overflow-hidden">
												<div className="h-full w-1/2 bg-subject-life rounded-full" />
											</div>
										</m.div>

										{/* Center Circle */}
										<div className="absolute inset-0 flex items-center justify-center">
											<div className="w-32 h-32 rounded-full bg-tiimo-lavender flex items-center justify-center shadow-2xl shadow-tiimo-lavender/30">
												<HugeiconsIcon icon={SparklesIcon} className="w-12 h-12 text-white" />
											</div>
										</div>
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
							</m.div>
						</m.div>
					</section>

					{/* Features Section */}
					<section className="py-20 lg:py-32">
						<m.div
							initial={{ opacity: 0, y: 40 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, margin: '-100px' }}
							transition={{ duration: 0.6 }}
							className="text-center mb-16"
						>
							<h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
								Everything you need to
								<span className="text-tiimo-lavender"> pass</span>
							</h2>
							<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
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
									className="group p-8 rounded-[var(--radius-xl)] bg-card border border-border/50 hover:border-tiimo-lavender/30 hover:shadow-xl hover:shadow-tiimo-lavender/10 transition-all duration-300"
								>
									<div
										className={`w-14 h-14 rounded-[var(--radius-lg)] ${feature.color} flex items-center justify-center mb-6`}
									>
										<HugeiconsIcon icon={feature.icon} className="w-7 h-7" />
									</div>
									<h3 className="text-xl font-bold mb-3">{feature.title}</h3>
									<p className="text-muted-foreground leading-relaxed">{feature.description}</p>
								</m.div>
							))}
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
							<h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
								Your
								<span className="text-tiimo-lavender"> subjects</span>
							</h2>
							<p className="text-lg text-muted-foreground">
								Pick your subjects and start practicing for the NSC.
							</p>
						</m.div>

						<m.div
							variants={STAGGER_CONTAINER}
							initial="hidden"
							whileInView="visible"
							viewport={{ once: true, margin: '-100px' }}
							className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
						>
							{SUBJECTS.map((subject) => {
								const icon = ICON_MAP[subject.icon] || CalculatorIcon;
								return (
									<m.button
										key={subject.id}
										type="button"
										variants={STAGGER_ITEM}
										onClick={() => handleAuthRoute(subject.path)}
										className="group relative p-6 rounded-[var(--radius-xl)] bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 text-left overflow-hidden"
									>
										<div
											className={`absolute top-0 right-0 w-32 h-32 ${subject.bg} rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl`}
										/>

										<div className="relative z-10">
											<div
												className={`w-12 h-12 rounded-[var(--radius-lg)] ${subject.bg} flex items-center justify-center mb-4`}
											>
												<HugeiconsIcon icon={icon} className={`w-6 h-6 ${subject.color}`} />
											</div>
											<h3 className="text-lg font-bold mb-1">{subject.name}</h3>
											<p className="text-sm text-muted-foreground">{subject.topics}</p>
										</div>

										<div className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-secondary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0 -translate-x-2">
											<HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4" />
										</div>
									</m.button>
								);
							})}
						</m.div>
					</section>

					{/* Final CTA Section */}
					<section className="py-20 lg:py-32">
						<m.div
							initial={{ opacity: 0, scale: 0.95 }}
							whileInView={{ opacity: 1, scale: 1 }}
							viewport={{ once: true }}
							transition={{ duration: 0.6 }}
							className="relative overflow-hidden rounded-[var(--radius-2xl)] bg-gradient-to-br from-tiimo-lavender via-tiimo-lavender to-subject-physics p-12 lg:p-20"
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
								<h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
									Ready to ace
									<br />
									your exams?
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
