'use client';

import {
	ArrowRight01Icon,
	SparklesIcon,
	Rocket01Icon,
	Notebook01Icon,
	Layout01Icon,
} from 'hugeicons-react';
import { m } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useId } from 'react';
import { toast } from 'sonner';
import { Footer } from '@/components/Layout/footer';
import { SmoothText, SmoothWords } from '@/components/Transition/SmoothText';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { STAGGER_CONTAINER, STAGGER_ITEM } from '@/lib/animation-presets';
import { useSession } from '@/lib/auth-client';
import { AIThinkingGradient } from '@/components/AI/AIThinkingGradient';

export default function Landing() {
	const router = useRouter();
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
			<div className="flex-1 overflow-y-auto no-scrollbar relative z-10">
				<main className="pb-4 px-6 sm:px-6 max-w-5xl mx-auto w-full lg:pb-24">
					{/* Hero Section */}
					<section className="pt-20 pb-32 flex flex-col items-center text-center space-y-10">
						<m.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ type: 'spring', stiffness: 400, damping: 30 }}
							className="space-y-6"
						>
							<Badge className="bg-electric-blue/10 text-electric-blue border-none rounded-full px-6 py-2 font-black text-[10px] tracking-[0.2em] uppercase shadow-sm">
								<SparklesIcon size={12} className="mr-2" />
								The Premium Study Experience
							</Badge>

							<div className="space-y-4">
								<SmoothWords
									as="h1"
									text="Master your Matrics."
									className="text-6xl sm:text-7xl md:text-8xl font-black text-foreground leading-[0.9] tracking-tighter uppercase"
									stagger={0.06}
								/>
								<SmoothWords
									as="h1"
									text="With AI precision."
									className="text-6xl sm:text-7xl md:text-8xl font-black text-electric-blue leading-[0.9] tracking-tighter uppercase"
									stagger={0.06}
									delay={0.5}
								/>
							</div>

							<SmoothText
								text="The most minimalist, powerful study companion for South African Grade 12 students. Fluid, fast, and focused."
								className="text-lg md:text-xl font-medium text-muted-foreground max-w-2xl mx-auto leading-relaxed pt-4"
								delay={1}
							/>
						</m.div>

						<m.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ delay: 1.2, type: 'spring', stiffness: 400, damping: 30 }}
							className="w-full max-w-sm flex flex-col gap-4"
						>
							<Button
								size="lg"
								className="w-full rounded-2xl h-16 text-xs font-black uppercase tracking-[0.2em] shadow-xl bg-electric-blue hover:bg-electric-blue/90 text-white ios-active-scale"
								onClick={() => handleAuthRoute('/dashboard')}
							>
								Get Started
								<ArrowRight01Icon size={16} className="ml-2" />
							</Button>
							<Button
								variant="outline"
								size="lg"
								className="w-full rounded-2xl h-16 text-xs font-black uppercase tracking-[0.2em] border-2 border-border ios-active-scale"
								onClick={() => handleAuthRoute('/past-papers')}
							>
								Past Papers
							</Button>
						</m.div>
					</section>

					{/* Experience Grid */}
					<m.section
						variants={STAGGER_CONTAINER}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true }}
						className="grid grid-cols-1 md:grid-cols-2 gap-6"
					>
						<m.div variants={STAGGER_ITEM}>
							<Card className="relative overflow-hidden p-10 h-80 squircle bg-neutral-900 text-white border-none flex flex-col justify-between group">
								<AIThinkingGradient isThinking={true} className="opacity-20" />
								<div className="relative z-10 space-y-4">
									<div className="w-12 h-12 rounded-xl bg-electric-blue flex items-center justify-center">
										<SparklesIcon size={24} className="text-white" />
									</div>
									<h3 className="text-3xl font-bold tracking-tight uppercase">AI Tutor</h3>
									<p className="text-neutral-400 font-medium">Personalised explanations for every concept.</p>
								</div>
								<Button variant="link" className="relative z-10 w-fit p-0 text-white font-black uppercase tracking-widest text-[10px] group-hover:translate-x-2 transition-transform">
									Learn More <ArrowRight01Icon size={14} className="ml-2" />
								</Button>
							</Card>
						</m.div>

						<m.div variants={STAGGER_ITEM}>
							<Card className="p-10 h-80 squircle bg-neutral-50 dark:bg-neutral-900 border-none flex flex-col justify-between group cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
								<div className="space-y-4">
									<div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
										<Notebook01Icon size={24} className="text-foreground" />
									</div>
									<h3 className="text-3xl font-bold tracking-tight uppercase">Exam Ready</h3>
									<p className="text-muted-foreground font-medium">Full NSC past paper library at your fingertips.</p>
								</div>
								<Button variant="link" className="w-fit p-0 text-foreground font-black uppercase tracking-widest text-[10px] group-hover:translate-x-2 transition-transform">
									View Papers <ArrowRight01Icon size={14} className="ml-2" />
								</Button>
							</Card>
						</m.div>
					</m.section>

					{/* Footer */}
					<div className="mt-32">
						<Footer />
					</div>
				</main>
			</div>
		</div>
	);
}
