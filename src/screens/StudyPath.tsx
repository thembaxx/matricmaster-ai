'use client';

import {
	ArrowLeft02Icon,
	ArrowRight01Icon,
	FlashIcon,
	Loading03Icon,
	LockIcon,
	PlayIcon,
	SparklesIcon,
	StarIcon,
	Tick01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSession } from '@/lib/auth-client';
import type { StudyPlan } from '@/lib/db/schema';
import { getActiveStudyPlanAction } from '@/lib/db/study-plan-actions';

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
			<div className="w-24 h-24 rounded-[2rem] bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center shadow-xl mb-6 animate-pulse">
				<HugeiconsIcon icon={Loading03Icon} className="w-10 h-10 animate-spin text-primary" />
			</div>
			<p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Loading Map</p>
		</div>
	);
}

function NoPlanState({ router }: { router: ReturnType<typeof useRouter> }) {
	return (
		<div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950">
			<StudyPathHeader router={router} />
			<main className="flex-1 flex flex-col items-center justify-center px-8 text-center space-y-12">
				<div className="w-40 h-40 rounded-[3rem] bg-primary/10 flex items-center justify-center shadow-inner">
					<HugeiconsIcon icon={SparklesIcon} className="w-16 h-16 text-primary" variant="solid" />
				</div>
				<div className="space-y-4">
					<h2 className="text-4xl font-black text-foreground tracking-tighter uppercase leading-none">Your Path is Empty</h2>
					<p className="text-lg font-bold text-muted-foreground max-w-xs mx-auto">
						Let AI build a personalized study journey for you.
					</p>
				</div>
				<Button
					onClick={() => router.push('/study-plan')}
					className="h-20 w-full max-w-sm rounded-[2.5rem] bg-primary text-white font-black text-xl uppercase tracking-widest shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
				>
					Generate Plan
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
				<div className="w-40 h-40 rounded-[3rem] bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center shadow-inner">
					<span className="text-6xl">🔒</span>
				</div>
				<div className="space-y-4">
					<h2 className="text-4xl font-black text-foreground tracking-tighter uppercase leading-none">Locked Path</h2>
					<p className="text-lg font-bold text-muted-foreground max-w-xs mx-auto">Please sign in to unlock your custom curriculum.</p>
				</div>
				<Button
					onClick={() => router.push('/sign-in')}
					className="h-20 w-full max-w-sm rounded-[2.5rem] bg-primary text-white font-black text-xl uppercase tracking-widest shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
				>
					Sign In
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
		<header className="px-6 pt-16 pb-8 flex items-center justify-between shrink-0">
			<Button
				variant="ghost"
				size="icon"
				onClick={() => router.back()}
				className="rounded-[1.5rem] h-14 w-14 bg-zinc-100 dark:bg-zinc-900 shadow-sm"
			>
				<HugeiconsIcon icon={ArrowLeft02Icon} className="w-6 h-6" />
			</Button>
			<h1 className="text-xl font-black text-foreground tracking-tighter uppercase">
				Curriculum Map
			</h1>
			{progress !== undefined && (
				<div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-2xl shadow-sm border border-primary/20">
					<HugeiconsIcon
						icon={FlashIcon}
						className="w-4 h-4 text-primary"
						variant="solid"
					/>
					<span className="font-black text-xs text-primary">{progress}%</span>
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
		<div className="flex flex-col items-center gap-2 opacity-60">
			<div className="relative">
				<div className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-lg bg-muted grayscale">
					<span className="text-2xl font-black text-muted-foreground">÷±</span>
				</div>
				<div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-background border-2 border-border flex items-center justify-center shadow-sm">
					<HugeiconsIcon icon={LockIcon} className="w-4 h-4 text-muted-foreground" />
				</div>
			</div>
			<div className="bg-muted/50 px-3 py-1 rounded-full border border-border/10">
				<span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
					{node.title}
				</span>
			</div>
		</div>
	);
}

function CurrentNode({ node }: { node: PathNode }) {
	return (
		<div className="flex flex-col items-center gap-6 scale-110">
			<div className="relative">
				<div
					className="absolute inset-[-16px] rounded-full opacity-20 animate-pulse bg-primary"
				/>
				<div
					className="w-24 h-24 rounded-[2.5rem] flex items-center justify-center shadow-2xl relative bg-primary text-white"
				>
					<HugeiconsIcon icon={PlayIcon} className="w-10 h-10 fill-white" />
				</div>
				<div className="absolute -top-4 -right-4 flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl border-4 border-white dark:border-zinc-900">
					Active
				</div>
			</div>

			<div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-6 min-w-[200px] border-none">
				<h3 className="font-black text-foreground text-center tracking-tighter uppercase leading-none text-sm">
					{node.title}
				</h3>
				<div className="mt-6 w-full h-4 bg-muted rounded-full overflow-hidden border-2 border-border/10">
					<m.div
						initial={{ width: 0 }}
						animate={{ width: `${node.progress}%` }}
						transition={{ duration: 1.5, ease: "circOut" }}
						className="h-full rounded-full bg-primary"
					/>
				</div>
				<p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary text-center mt-3">
					{node.progress}% Mastered
				</p>
			</div>
		</div>
	);
}

function CompletedNode({ node }: { node: PathNode }) {
	return (
		<div className="flex flex-col items-center gap-2">
			<div
				className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
				style={{
					background: 'linear-gradient(135deg, var(--accent-lime) 0%, #65A30D 100%)',
				}}
			>
				<HugeiconsIcon icon={Tick01Icon} className="w-8 h-8 text-white" strokeWidth={4} />
			</div>
			<p className="text-[10px] font-black text-foreground text-center uppercase tracking-tight opacity-80">
				{node.title}
			</p>
			<div className="flex gap-1">
				{Array.from({ length: 3 }).map((_, i) => (
					<HugeiconsIcon
						icon={StarIcon}
						key={`star-${node.id}-${i}`}
						className={`w-5 h-5 ${
							i < (node.stars || 0)
								? 'fill-primary-orange text-primary-orange'
								: 'text-muted-foreground/20'
						}`}
					/>
				))}
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
		<div className="px-6 pb-12 pt-4 shrink-0 max-w-lg mx-auto w-full">
			<Button
				className="w-full h-24 rounded-[2.5rem] bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black shadow-2xl flex items-center justify-between px-8 transition-all hover:scale-105 active:scale-95"
				onClick={() => router.push('/quiz')}
			>
				<div className="flex items-center gap-6">
					<div className="w-14 h-14 rounded-2xl bg-white/10 dark:bg-black/10 flex items-center justify-center">
						<HugeiconsIcon icon={PlayIcon} className="w-8 h-8 fill-current" />
					</div>
					<div className="text-left">
						<p className="font-black text-xl tracking-tighter uppercase leading-none">Resume</p>
						<p className="text-[10px] opacity-60 uppercase tracking-widest mt-1 font-black">
							{title}
						</p>
					</div>
				</div>
				<HugeiconsIcon icon={ArrowRight01Icon} className="w-8 h-8" />
			</Button>
		</div>
	);
}
