'use client';

import {
	AiBrain01Icon,
	ArrowRight01Icon,
	ContentWritingIcon,
	Mic01Icon,
	SparklesIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

const AiTutorView = dynamic(
	async () => {
		const { useAiTutor } = await import('@/hooks/useAiTutor');
		function AiTutorWrapper() {
			useAiTutor();
			return (
				<div className="p-4">
					<div className="text-center text-muted-foreground py-20">ai tutor chat interface</div>
				</div>
			);
		}
		return { default: AiTutorWrapper };
	},
	{
		ssr: false,
		loading: () => <div className="h-[60vh] animate-pulse bg-muted/10 rounded-3xl" />,
	}
);

const EssayGraderView = dynamic(
	() =>
		import('@/components/EssayGrader/EssayGraderContent').then((mod) => ({
			default: mod.EssayGraderContent,
		})),
	{
		ssr: false,
		loading: () => <div className="h-[60vh] animate-pulse bg-muted/10 rounded-3xl" />,
	}
);

const VoiceTutorView = dynamic(
	() =>
		import('@/components/VoiceTutor/VoiceOverlay').then((mod) => ({ default: mod.VoiceOverlay })),
	{
		ssr: false,
		loading: () => <div className="h-[60vh] animate-pulse bg-muted/10 rounded-3xl" />,
	}
);

type AiTool = 'tutor' | 'grader' | 'voice';

export default function AiLab() {
	const [activeTool, setActiveTool] = useState<AiTool>('tutor');

	const tools = [
		{
			id: 'tutor',
			label: 'ai study tutor',
			icon: SparklesIcon,
			desc: 'get answers to any question.',
			color: 'text-brand-orange',
			bg: 'bg-brand-orange/10',
		},
		{
			id: 'grader',
			label: 'essay grader',
			icon: ContentWritingIcon,
			desc: 'get instant feedback on essays.',
			color: 'text-primary',
			bg: 'bg-primary/10',
		},
		{
			id: 'voice',
			label: 'voice tutor',
			icon: Mic01Icon,
			desc: 'discuss concepts via voice.',
			color: 'text-brand-navy',
			bg: 'bg-brand-navy/10',
		},
	];

	return (
		<div className="flex flex-col h-full min-w-0 bg-background overflow-x-hidden">
			{/* Header */}
			<header className="px-4 sm:px-6 pt-8 sm:pt-12 pb-4 sm:pb-6 shrink-0">
				<div className="space-y-1">
					<h1 className="text-3xl font-black text-foreground tracking-tight font-display">
						ai lab hub
					</h1>
					<p className="text-muted-foreground font-medium text-sm">
						supercharge your learning with advanced intelligence.
					</p>
				</div>

				{/* Tool Quick Switcher */}
				<div className="flex flex-wrap gap-3 mt-8">
					{tools.map((tool) => (
						<Button
							key={tool.id}
							variant="ghost"
							onClick={() => setActiveTool(tool.id as AiTool)}
							className={`h-auto flex flex-col items-start gap-1 p-4 rounded-3xl transition-all border shrink-0 ${
								activeTool === tool.id
									? 'bg-card border-border shadow-tiimo'
									: 'bg-transparent border-transparent hover:bg-muted/50'
							}`}
						>
							<div className={`p-2 rounded-xl ${tool.bg}`}>
								<HugeiconsIcon icon={tool.icon} className={`w-5 h-5 ${tool.color}`} />
							</div>
							<div className="text-left mt-1">
								<p
									className={`font-black text-sm tracking-tight ${activeTool === tool.id ? 'text-foreground' : 'text-muted-foreground'}`}
								>
									{tool.label}
								</p>
								<p className="text-[10px] text-muted-foreground font-medium">{tool.desc}</p>
							</div>
						</Button>
					))}
				</div>
			</header>

			<ScrollArea className="flex-1">
				<main className="px-4 sm:px-6 py-4">
					<div className="rounded-[2.5rem] bg-card border border-border/50 min-h-[60vh] relative overflow-hidden shadow-tiimo-lg mb-32">
						{activeTool === 'tutor' && <AiTutorView />}
						{activeTool === 'grader' && <EssayGraderView />}
						{activeTool === 'voice' && <VoiceTutorView />}
					</div>

					{/* AI Insights Card (Mock) */}
					<Card className="p-8 rounded-[2.5rem] bg-brand-navy text-white overflow-hidden relative border-none">
						<div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />
						<div className="relative z-10 space-y-6">
							<div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
								<HugeiconsIcon icon={AiBrain01Icon} className="w-8 h-8 text-brand-orange" />
							</div>
							<div className="space-y-2">
								<h3 className="text-2xl font-black tracking-tight">ai-powered study plan</h3>
								<p className="text-white/60 font-medium text-sm">
									based on your quiz performance, we recommend focusing on "organic chemistry" this
									weekend.
								</p>
							</div>
							<Button className="bg-white text-brand-navy hover:bg-white/90 font-black rounded-2xl h-14 px-8 group">
								view analysis{' '}
								<HugeiconsIcon
									icon={ArrowRight01Icon}
									className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1"
								/>
							</Button>
						</div>
					</Card>
				</main>
			</ScrollArea>
		</div>
	);
}
