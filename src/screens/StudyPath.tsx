'use client';

import { ArrowLeft, Check, ChevronRight, Lock, Play, Star, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const pathNodes = [
	{
		id: 1,
		title: 'Physics Circuits',
		status: 'locked',
		icon: '÷±',
		iconBg: '#f8e8f4',
		position: { x: 15, y: 8 },
	},
	{
		id: 2,
		title: 'Calculus P1',
		status: 'current',
		icon: '📦',
		iconBg: '#3b82f6',
		progress: 40,
		position: { x: 60, y: 35 },
	},
	{
		id: 3,
		title: 'Intro to Functions',
		status: 'completed',
		icon: '✓',
		iconBg: '#22c55e',
		stars: 2,
		position: { x: 35, y: 70 },
	},
];

export default function StudyPath() {
	const router = useRouter();
	const overallProgress = 12;

	return (
		<div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-[#0a0f18]">
			{/* Header */}
			<header className="px-4 py-4 flex items-center justify-between shrink-0">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => router.back()}
					className="rounded-full text-zinc-900 dark:text-white"
				>
					<ArrowLeft className="w-6 h-6" />
				</Button>
				<h1 className="text-lg font-bold text-zinc-900 dark:text-white">My Physics Path</h1>
				<div className="flex items-center gap-1 text-blue-500">
					<Zap className="w-5 h-5 fill-yellow-400 text-yellow-400" />
					<span className="font-bold text-sm">{overallProgress}%</span>
				</div>
			</header>

			{/* Main Content - Quest Map */}
			<ScrollArea className="flex-1">
				<main className="relative min-h-[600px] px-4">
					{/* Background Pattern */}
					<div
						className="absolute inset-0 opacity-30 dark:opacity-10"
						style={{
							backgroundImage: `radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
								radial-gradient(circle at 80% 60%, rgba(34, 197, 94, 0.1) 0%, transparent 50%)`,
						}}
					/>

					{/* SVG Path Connections */}
					<svg
						className="absolute inset-0 w-full h-full pointer-events-none"
						viewBox="0 0 100 100"
						preserveAspectRatio="none"
					>
						<title>Path connections</title>
						{/* Dashed path from locked to current */}
						<path
							d="M 25 18 Q 45 25, 65 40"
							fill="none"
							stroke="rgb(209, 213, 219)"
							strokeWidth="0.5"
							strokeDasharray="2,2"
							className="dark:stroke-zinc-700"
						/>
						{/* Solid blue path from current to completed */}
						<path
							d="M 65 45 Q 55 55, 45 65"
							fill="none"
							stroke="#3b82f6"
							strokeWidth="0.8"
							className="dark:stroke-blue-500"
						/>
						{/* Path continues downward */}
						<path
							d="M 45 72 L 45 80"
							fill="none"
							stroke="#3b82f6"
							strokeWidth="0.8"
							className="dark:stroke-blue-500"
						/>
					</svg>

					{/* Node 1: Locked - Physics Circuits (Top Left) */}
					<div
						className="absolute"
						style={{ left: `${pathNodes[0].position.x}%`, top: `${pathNodes[0].position.y}%` }}
					>
						<div className="flex flex-col items-center gap-2">
							{/* Icon Container with Lock Badge */}
							<div className="relative">
								<div
									className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
									style={{ backgroundColor: pathNodes[0].iconBg }}
								>
									<span className="text-2xl font-bold text-purple-600">÷±</span>
								</div>
								{/* Lock Badge */}
								<div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 flex items-center justify-center shadow-sm">
									<Lock className="w-4 h-4 text-zinc-400" />
								</div>
							</div>
							{/* Label */}
							<div className="bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-full shadow-sm">
								<span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
									{pathNodes[0].title}
								</span>
							</div>
						</div>
					</div>

					{/* Node 2: Current - Calculus P1 (Middle Right) */}
					<div
						className="absolute"
						style={{ left: `${pathNodes[1].position.x}%`, top: `${pathNodes[1].position.y}%` }}
					>
						<div className="flex flex-col items-center gap-3">
							{/* Large Blue Circle with 3D Cube Icon */}
							<div className="relative">
								{/* Outer glow ring */}
								<div
									className="absolute inset-[-8px] rounded-full opacity-20"
									style={{
										background:
											'radial-gradient(circle, rgba(59, 130, 246, 0.5) 0%, transparent 70%)',
									}}
								/>
								<div
									className="w-20 h-20 rounded-full flex items-center justify-center shadow-xl relative"
									style={{
										background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%)',
									}}
								>
									{/* 3D Cube Icon */}
									<svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none">
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
								{/* NEXT Badge */}
								<div className="absolute -top-2 -right-2 flex items-center gap-1 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg">
									<span>NEXT</span>
									<span className="text-[10px]">🚩</span>
								</div>
							</div>

							{/* Info Card */}
							<div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-4 min-w-[140px]">
								<h3 className="font-bold text-zinc-900 dark:text-white text-center">
									{pathNodes[1].title}
								</h3>
								<p className="text-blue-500 text-xs font-semibold uppercase tracking-wide text-center mt-1">
									IN PROGRESS
								</p>
								{/* Progress Bar */}
								<div className="mt-3 w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
									<div
										className="h-full rounded-full transition-all duration-500"
										style={{
											width: `${pathNodes[1].progress}%`,
											backgroundColor: '#3b82f6',
										}}
									/>
								</div>
							</div>
						</div>
					</div>

					{/* Node 3: Completed - Intro to Functions (Bottom Center) */}
					<div
						className="absolute"
						style={{ left: `${pathNodes[2].position.x}%`, top: `${pathNodes[2].position.y}%` }}
					>
						<div className="flex flex-col items-center gap-2">
							{/* Green Circle with Checkmark */}
							<div
								className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
								style={{
									background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 50%, #16a34a 100%)',
								}}
							>
								<Check className="w-8 h-8 text-white" strokeWidth={3} />
							</div>
							{/* Label */}
							<p className="text-sm font-bold text-zinc-900 dark:text-white text-center">
								{pathNodes[2].title}
							</p>
							{/* Stars */}
							<div className="flex gap-1">
								{Array.from({ length: 3 }).map((_, i) => (
									<Star
										key={`star-${pathNodes[2].id}-${i}`}
										className={`w-5 h-5 ${
											i < (pathNodes[2].stars || 0)
												? 'fill-yellow-400 text-yellow-400'
												: 'text-zinc-300 dark:text-zinc-600'
										}`}
									/>
								))}
							</div>
						</div>
					</div>
				</main>
			</ScrollArea>

			{/* Bottom Resume Button */}
			<div className="px-4 pb-8 pt-4 shrink-0">
				<Button
					className="w-full h-16 rounded-2xl text-white font-semibold shadow-lg shadow-blue-500/25 flex items-center justify-between px-4"
					style={{
						background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%)',
					}}
					onClick={() => router.push('/quiz')}
				>
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
							<Play className="w-5 h-5 fill-white text-white" />
						</div>
						<div className="text-left">
							<p className="font-bold text-base">Resume: Calculus P1</p>
							<p className="text-xs text-white/80">Estimated time: 15 mins</p>
						</div>
					</div>
					<ChevronRight className="w-6 h-6" />
				</Button>
			</div>
		</div>
	);
}
