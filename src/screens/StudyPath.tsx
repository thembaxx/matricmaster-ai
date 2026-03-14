'use client';

import {
	ArrowLeft01Icon as ArrowLeft,
	ArrowRight01Icon as CaretRight,
	CheckmarkCircle01Icon as Check,
	Loading03Icon as CircleNotch,
	Lightning01Icon as Lightning,
	SquareLock01Icon as Lock,
	PlayIcon as Play,
	SparklesIcon as Sparkle,
	StarIcon as Star,
} from 'hugeicons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSession } from '@/lib/auth-client';
import type { StudyPlan } from '@/lib/db/schema';
import { getActiveStudyPlanAction } from '@/lib/db/study-plan-actions';
import { cn } from '@/lib/utils';

const defaultPathNodes: PathNode[] = [
	{
		id: 1,
		title: 'Physics Circuits',
		status: 'locked',
		iconBg: 'var(--color-brand-purple-light)',
		position: { x: 15, y: 8 },
	},
	{
		id: 2,
		title: 'Calculus P1',
		status: 'current',
		progress: 40,
		position: { x: 60, y: 35 },
	},
	{
		id: 3,
		title: 'Intro to Functions',
		status: 'completed',
		stars: 2,
		position: { x: 35, y: 70 },
	},
];

export default function StudyPath() {
	const router = useRouter();
	const { data: session } = useSession();
	const [activePlan, setActivePlan] = useState<StudyPlan | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [pathNodes] = useState(defaultPathNodes);
	const overallProgress = 12;

	useEffect(() => {
		const loadActivePlan = async () => {
			if (session?.user?.id) {
				try {
					const plan = await getActiveStudyPlanAction(session.user.id);
					if (plan) setActivePlan(plan);
				} catch (error) {
					console.error('Failed to load active plan:', error);
				}
			}
			setIsLoading(false);
		};
		loadActivePlan();
	}, [session?.user?.id]);

	if (isLoading) {
		return <StudyPathLoading />;
	}

	if (!activePlan && session?.user) {
		return <NoPlanState router={router} />;
	}

	if (!session) {
		return <SignInPrompt router={router} />;
	}

	return (
		<div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950">
			<StudyPathHeader router={router} progress={overallProgress} />
			<StudyPathMap pathNodes={pathNodes} />
			<ResumeButton router={router} title={pathNodes[1].title} />
		</div>
	);
}

function StudyPathLoading() {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-zinc-950">
			<CircleNotch size={64} className="animate-spin text-primary opacity-20" />
			<p className="mt-6 text-lg font-black text-muted-foreground/40 uppercase tracking-[0.3em]">Preparing Journey</p>
		</div>
	);
}

function NoPlanState({ router }: { router: ReturnType<typeof useRouter> }) {
	return (
		<div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950">
			<StudyPathHeader router={router} />
			<main className="flex-1 flex flex-col items-center justify-center px-8 text-center space-y-12">
				<div className="w-32 h-32 rounded-[2.5rem] bg-tiimo-purple text-white flex items-center justify-center shadow-2xl shadow-tiimo-purple/30">
					<Sparkle size={64} className="stroke-[2.5px]" />
				</div>
				<div className="space-y-4">
					<h2 className="text-5xl font-black text-foreground tracking-tighter">Your Path Awaits</h2>
					<p className="text-xl font-bold text-muted-foreground/60 max-w-sm mx-auto leading-relaxed">
							Create your personalized roadmap and start your mastery journey today.
					</p>
				</div>
				<Button
					onClick={() => router.push('/study-plan')}
					className="h-20 px-12 bg-primary hover:bg-primary/90 text-white font-black text-2xl rounded-[2.5rem] shadow-2xl shadow-primary/30 active:scale-95 transition-all"
				>
					Start quest
				</Button>
			</main>
		</div>
	);
}

function SignInPrompt({ router }: { router: ReturnType<typeof useRouter> }) {
	return (
		<div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950">
			<StudyPathHeader router={router} />
			<main className="flex-1 flex flex-col items-center justify-center px-8 text-center space-y-12">
				<div className="w-32 h-32 rounded-[2.5rem] bg-muted/10 flex items-center justify-center">
					<Lock size={64} className="text-muted-foreground/20 stroke-[3px]" />
				</div>
				<div className="space-y-4">
					<h2 className="text-4xl font-black text-foreground tracking-tighter uppercase">Sign in required</h2>
					<p className="text-lg font-bold text-muted-foreground/60 max-w-xs mx-auto">Please join the community to track your learning journey.</p>
				</div>
				<Button
					onClick={() => router.push('/sign-in')}
					className="h-16 px-10 bg-primary hover:bg-primary/90 text-white font-black text-xl rounded-2xl shadow-xl shadow-primary/30"
				>
					Sign in
				</Button>
			</main>
		</div>
	);
}

type StudyPathHeaderProps = {
	router: ReturnType<typeof useRouter>;
	progress?: number;
};

function StudyPathHeader({ router, progress }: StudyPathHeaderProps) {
	return (
		<header className="px-8 py-10 flex items-center justify-between shrink-0">
			<Button
				variant="ghost"
				size="icon"
				onClick={() => router.back()}
				className="h-14 w-14 rounded-2xl bg-muted/10 hover:bg-muted/20 transition-all"
			>
				<ArrowLeft size={24} className="stroke-[3px]" />
			</Button>
			<h1 className="text-3xl font-black text-foreground tracking-tight uppercase">
				Map
			</h1>
			{progress !== undefined && (
				<div className="flex items-center gap-3 px-5 py-2.5 bg-tiimo-orange/10 rounded-2xl">
					<Lightning size={18} className="text-tiimo-orange fill-tiimo-orange stroke-[3px]" />
					<span className="font-black text-md text-tiimo-orange">{progress}%</span>
				</div>
			)}
		</header>
	);
}

type PathNode = {
	id: number;
	title: string;
	status: 'locked' | 'current' | 'completed';
	iconBg?: string;
	progress?: number;
	stars?: number;
	position: { x: number; y: number };
};

type StudyPathMapProps = {
	pathNodes: PathNode[];
};

function StudyPathMap({ pathNodes }: StudyPathMapProps) {
	return (
		<ScrollArea className="flex-1">
			<main className="relative min-h-[600px] px-4">
				<div
					className="absolute inset-0 opacity-30 dark:opacity-10"
					style={{
						backgroundImage: `radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
							radial-gradient(circle at 80% 60%, rgba(34, 197, 94, 0.1) 0%, transparent 50%)`,
					}}
				/>

				<PathConnections />

				{pathNodes.map((node) => (
					<PathNode key={node.id} node={node} />
				))}
			</main>
		</ScrollArea>
	);
}

function PathConnections() {
	return (
		<svg
			className="absolute inset-0 w-full h-full pointer-events-none"
			viewBox="0 0 100 100"
			preserveAspectRatio="none"
		>
			<title>Path connections</title>
			<path
				d="M 25 18 Q 45 25, 65 40"
				fill="none"
				stroke="var(--color-border)"
				strokeWidth="0.5"
				strokeDasharray="2,2"
			/>
			<path
				d="M 65 45 Q 55 55, 45 65"
				fill="none"
				stroke="var(--color-primary)"
				strokeWidth="0.8"
			/>
			<path d="M 45 72 L 45 80" fill="none" stroke="var(--color-primary)" strokeWidth="0.8" />
		</svg>
	);
}

type PathNodeProps = {
	node: PathNode;
};

function PathNode({ node }: PathNodeProps) {
	const style = { left: `${node.position.x}%`, top: `${node.position.y}%` };

	if (node.status === 'locked') {
		return (
			<div className="absolute" style={style}>
				<LockedNode node={node} />
			</div>
		);
	}

	if (node.status === 'current') {
		return (
			<div className="absolute" style={style}>
				<CurrentNode node={node} />
			</div>
		);
	}

	return (
		<div className="absolute" style={style}>
			<CompletedNode node={node} />
		</div>
	);
}

function LockedNode({ node }: { node: PathNode }) {
	return (
		<div className="flex flex-col items-center gap-4 opacity-30 scale-90">
			<div className="relative">
				<div className="w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-sm bg-muted/20">
					<Lock size={32} className="text-muted-foreground/30 stroke-[3px]" />
				</div>
			</div>
			<div className="px-4 py-1.5 rounded-full bg-muted/10">
				<span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 whitespace-nowrap">
					{node.title}
				</span>
			</div>
		</div>
	);
}

function CurrentNode({ node }: { node: PathNode }) {
	return (
		<div className="flex flex-col items-center gap-6 scale-125 z-10">
			<div className="relative group cursor-pointer">
				<m.div
					animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
					transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
					className="absolute inset-[-20px] rounded-full bg-primary/20 blur-2xl"
				/>
				<m.div
					whileHover={{ rotate: 10, scale: 1.1 }}
					className="w-24 h-24 rounded-[2.5rem] bg-primary text-white flex items-center justify-center shadow-[0_20px_50px_rgba(var(--primary),0.3)] relative transition-all duration-500"
				>
					<Play size={44} className="fill-current stroke-[3px] ml-1.5" />
				</m.div>
				<div className="absolute -top-4 -right-4 flex items-center gap-2 px-4 py-1.5 bg-tiimo-pink text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl border-4 border-white dark:border-zinc-950">
					Active
				</div>
			</div>

			<div className="bg-card rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-6 min-w-[200px] border-none text-center space-y-4">
				<div className="space-y-1">
					<h3 className="font-black text-foreground tracking-tight text-md uppercase">
						{node.title}
					</h3>
					<p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">
						Priority step
					</p>
				</div>
				<div className="space-y-2">
					<div className="w-full h-4 bg-muted/20 rounded-full overflow-hidden p-1 shadow-inner">
						<m.div
							initial={{ width: 0 }}
							animate={{ width: `${node.progress}%` }}
							transition={{ duration: 2, type: 'spring' }}
							className="h-full rounded-full bg-primary"
						/>
					</div>
					<span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">{node.progress}% Done</span>
				</div>
			</div>
		</div>
	);
}

function CompletedNode({ node }: { node: PathNode }) {
	return (
		<div className="flex flex-col items-center gap-4">
			<m.div
				whileHover={{ scale: 1.1, rotate: -5 }}
				className="w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-xl shadow-tiimo-green/20 transition-all duration-500 bg-tiimo-green text-white"
			>
				<Check size={32} className="stroke-[4px]" />
			</m.div>
			<div className="text-center space-y-2">
				<p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
					{node.title}
				</p>
				<div className="flex justify-center gap-1.5">
					{Array.from({ length: 3 }).map((_, i) => (
						<Star
							key={`star-${node.id}-${i}`}
							size={14}
							className={cn(
								"stroke-[3px]",
								i < (node.stars || 0)
									? 'fill-tiimo-orange text-tiimo-orange'
									: 'text-muted-foreground/20'
							)}
						/>
					))}
				</div>
			</div>
		</div>
	);
}

type ResumeButtonProps = {
	router: ReturnType<typeof useRouter>;
	title: string;
};

function ResumeButton({ router, title }: ResumeButtonProps) {
	return (
		<div className="fixed bottom-12 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-40">
			<m.div whileHover={{ scale: 1.02, y: -4 }} whileTap={{ scale: 0.98 }}>
				<Button
					className="w-full h-24 rounded-[2.5rem] bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-black shadow-[0_30px_60px_rgba(0,0,0,0.4)] flex items-center justify-between px-10 transition-all border-none"
					onClick={() => router.push('/quiz')}
				>
					<div className="flex items-center gap-6">
						<div className="w-14 h-14 rounded-2xl bg-white/20 dark:bg-zinc-900/20 flex items-center justify-center">
							<Play size={28} className="fill-current stroke-[3px] ml-1" />
						</div>
						<div className="text-left space-y-1">
						<p className="text-2xl tracking-tighter leading-none uppercase">Resume quest</p>
							<p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">
								{title} • 15 min
							</p>
						</div>
					</div>
					<CaretRight size={28} className="stroke-[3.5px]" />
				</Button>
			</m.div>
		</div>
	);
}
