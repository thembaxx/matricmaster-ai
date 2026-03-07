'use client';

import {
	ArrowLeft,
	Check,
	ChevronRight,
	Loader2,
	Lock,
	Play,
	Sparkles,
	Star,
	Zap,
} from 'lucide-react';
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
		<div className="min-h-screen flex flex-col bg-muted dark:bg-background">
			<StudyPathHeader router={router} progress={overallProgress} />
			<StudyPathMap pathNodes={pathNodes} />
			<ResumeButton router={router} title={pathNodes[1].title} />
		</div>
	);
}

function StudyPathLoading() {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-muted dark:bg-background">
			<Loader2 className="w-8 h-8 animate-spin text-primary" />
			<p className="mt-4 text-muted-foreground">Loading your study path...</p>
		</div>
	);
}

function NoPlanState({ router }: { router: ReturnType<typeof useRouter> }) {
	return (
		<div className="min-h-screen flex flex-col bg-muted dark:bg-background">
			<StudyPathHeader router={router} />
			<main className="flex-1 flex flex-col items-center justify-center px-4 text-center space-y-6">
				<div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
					<Sparkles className="w-12 h-12 text-primary" />
				</div>
				<div className="space-y-2">
					<h2 className="text-2xl font-bold text-foreground">No Study Plan Yet</h2>
					<p className="text-muted-foreground max-w-xs">
						Create your personalized study plan with AI and track your progress
					</p>
				</div>
				<Button
					onClick={() => router.push('/study-plan')}
					className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8"
				>
					Create Study Plan
				</Button>
			</main>
		</div>
	);
}

function SignInPrompt({ router }: { router: ReturnType<typeof useRouter> }) {
	return (
		<div className="min-h-screen flex flex-col bg-muted dark:bg-background">
			<StudyPathHeader router={router} />
			<main className="flex-1 flex flex-col items-center justify-center px-4 text-center space-y-6">
				<div className="space-y-2">
					<h2 className="text-2xl font-bold text-foreground">Sign In Required</h2>
					<p className="text-muted-foreground max-w-xs">Please sign in to view your study path</p>
				</div>
				<Button
					onClick={() => router.push('/sign-in')}
					className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8"
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
		<header className="px-4 py-4 flex items-center justify-between shrink-0">
			<Button
				variant="ghost"
				size="icon"
				onClick={() => router.back()}
				className="rounded-full text-foreground"
			>
				<ArrowLeft className="w-6 h-6" />
			</Button>
			<h1 className="text-lg font-black text-foreground tracking-tight uppercase">
				My Physics Path
			</h1>
			{progress !== undefined && (
				<div className="flex items-center gap-2 px-3 py-1.5 bg-primary-violet/10 rounded-full">
					<Zap className="w-4 h-4 fill-primary-violet text-primary-violet" />
					<span className="font-black text-xs text-primary-violet">{progress}%</span>
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
					<Lock className="w-4 h-4 text-muted-foreground" />
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
		<div className="flex flex-col items-center gap-4 scale-110">
			<div className="relative">
				<div
					className="absolute inset-[-12px] rounded-full opacity-30 animate-pulse"
					style={{
						background: 'radial-gradient(circle, var(--primary-violet) 0%, transparent 70%)',
					}}
				/>
				<div
					className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl relative"
					style={{
						background:
							'linear-gradient(135deg, var(--primary-violet) 0%, var(--accent-indigo) 100%)',
					}}
				>
					<svg className="w-10 h-10 text-primary-foreground" viewBox="0 0 24 24" fill="none">
						<title>Cube icon</title>
						<path
							d="M12 2L2 7L12 12L22 7L12 2Z"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
						<path
							d="M2 17L12 22L22 17"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
						<path
							d="M2 12L12 17L22 12"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</div>
				<div className="absolute -top-3 -right-3 flex items-center gap-1 px-3 py-1 bg-primary-orange text-white text-[10px] font-black uppercase tracking-tighter rounded-full shadow-xl">
					<span>NEXT</span>
					<span>🚩</span>
				</div>
			</div>

			<div className="bg-card rounded-3xl shadow-2xl p-5 min-w-[160px] border-2 border-primary-violet/10">
				<h3 className="font-black text-foreground text-center tracking-tight leading-none uppercase text-xs">
					{node.title}
				</h3>
				<p className="text-primary-violet text-[9px] font-black uppercase tracking-widest text-center mt-2 opacity-70">
					Active Quest
				</p>
				<div className="mt-4 w-full h-2.5 bg-muted/50 rounded-full overflow-hidden shadow-inner">
					<div
						className="h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r from-primary-violet to-primary-cyan"
						style={{ width: `${node.progress}%` }}
					/>
				</div>
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
				<Check className="w-8 h-8 text-white" strokeWidth={4} />
			</div>
			<p className="text-[10px] font-black text-foreground text-center uppercase tracking-tight opacity-80">
				{node.title}
			</p>
			<div className="flex gap-1">
				{Array.from({ length: 3 }).map((_, i) => (
					<Star
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
		<div className="px-4 pb-8 pt-4 shrink-0 max-w-md mx-auto w-full">
			<Button
				variant="gradient"
				className="w-full h-20 rounded-3xl text-white font-black shadow-2xl flex items-center justify-between px-6 ios-active-scale"
				onClick={() => router.push('/quiz')}
			>
				<div className="flex items-center gap-5">
					<div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
						<Play className="w-6 h-6 fill-white text-white" />
					</div>
					<div className="text-left">
						<p className="font-black text-lg tracking-tight uppercase leading-none">Resume Path</p>
						<p className="text-[10px] text-white/70 uppercase tracking-widest mt-1 font-bold">
							{title} • 15 mins
						</p>
					</div>
				</div>
				<ChevronRight className="w-6 h-6" />
			</Button>
		</div>
	);
}
