'use client';

import { BookOpen01Icon, Copy01Icon, Search01Icon, SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getAllTips, type QuickTip } from '@/lib/offline/quick-tips';
import { cn } from '@/lib/utils';

const SUBJECT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
	Mathematics: { bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-500/30' },
	'Physical Sciences': { bg: 'bg-sky-500/10', text: 'text-sky-600', border: 'border-sky-500/30' },
	'Life Sciences': {
		bg: 'bg-emerald-500/10',
		text: 'text-emerald-600',
		border: 'border-emerald-500/30',
	},
	English: { bg: 'bg-indigo-500/10', text: 'text-indigo-600', border: 'border-indigo-500/30' },
	History: { bg: 'bg-rose-500/10', text: 'text-rose-600', border: 'border-rose-500/30' },
	Afrikaans: { bg: 'bg-violet-500/10', text: 'text-violet-600', border: 'border-violet-500/30' },
};

const DEFAULT_SUBJECT_STYLE = {
	bg: 'bg-gray-500/10',
	text: 'text-gray-600',
	border: 'border-gray-500/30',
};

function getSubjectStyle(subject: string) {
	return SUBJECT_COLORS[subject] ?? DEFAULT_SUBJECT_STYLE;
}

interface TipCardProps {
	tip: QuickTip;
}

function TipCard({ tip }: TipCardProps) {
	const [isOpen, setIsOpen] = useState(false);
	const style = getSubjectStyle(tip.subject);

	const handleCopyFormula = () => {
		if (tip.formula) {
			navigator.clipboard.writeText(tip.formula);
			toast.success('Formula copied to clipboard');
		}
	};

	return (
		<Collapsible open={isOpen} onOpenChange={setIsOpen}>
			<Card className={cn('border transition-all', isOpen && style.border)}>
				<CollapsibleTrigger asChild>
					<CardHeader className="cursor-pointer py-3 px-4">
						<div className="flex items-start justify-between gap-2">
							<div className="flex items-center gap-2 min-w-0">
								<div
									className={cn(
										'w-2 h-2 rounded-full shrink-0',
										style.text.replace('text-', 'bg-')
									)}
								/>
								<CardTitle className="text-sm font-medium truncate">{tip.title}</CardTitle>
							</div>
							<Badge
								variant="secondary"
								className={cn('text-[10px] shrink-0 font-medium', style.bg, style.text)}
							>
								{tip.topic}
							</Badge>
						</div>
					</CardHeader>
				</CollapsibleTrigger>
				<CollapsibleContent>
					<CardContent className="pt-0 px-4 pb-4 space-y-3">
						<p className="text-sm text-muted-foreground leading-relaxed">{tip.content}</p>
						{tip.formula && (
							<div className={cn('rounded-lg p-3 font-mono text-sm', style.bg)}>
								<div className="flex items-center justify-between">
									<span className={cn('font-semibold', style.text)}>{tip.formula}</span>
									<Button
										variant="ghost"
										size="icon"
										className="h-7 w-7"
										onClick={handleCopyFormula}
									>
										<HugeiconsIcon icon={Copy01Icon} className="w-3.5 h-3.5" />
									</Button>
								</div>
							</div>
						)}
						{tip.example && (
							<div className="rounded-lg bg-muted/50 p-3">
								<p className="text-xs font-medium text-muted-foreground mb-1">Example</p>
								<p className="text-sm">{tip.example}</p>
							</div>
						)}
					</CardContent>
				</CollapsibleContent>
			</Card>
		</Collapsible>
	);
}

export function QuickTipsPanel() {
	const [tips, setTips] = useState<QuickTip[]>([]);
	const [subjects, setSubjects] = useState<string[]>([]);
	const [activeSubject, setActiveSubject] = useState<string>('all');
	const [searchQuery, setSearchQuery] = useState('');
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function loadTips() {
			try {
				const allTips = await getAllTips();
				setTips(allTips);
				const uniqueSubjects = [...new Set(allTips.map((t) => t.subject))];
				setSubjects(uniqueSubjects);
			} catch (error) {
				console.error('Failed to load quick tips:', error);
				toast.error('Failed to load quick tips');
			} finally {
				setIsLoading(false);
			}
		}
		loadTips();
	}, []);

	const filteredTips = useMemo(() => {
		let result = tips;
		if (activeSubject !== 'all') {
			result = result.filter((t) => t.subject === activeSubject);
		}
		if (searchQuery.trim()) {
			const lower = searchQuery.toLowerCase();
			result = result.filter(
				(t) =>
					t.title.toLowerCase().includes(lower) ||
					t.topic.toLowerCase().includes(lower) ||
					t.content.toLowerCase().includes(lower) ||
					(t.formula?.toLowerCase().includes(lower) ?? false)
			);
		}
		return result.sort((a, b) => a.priority - b.priority);
	}, [tips, activeSubject, searchQuery]);

	return (
		<Card>
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2 text-base">
						<HugeiconsIcon icon={SparklesIcon} className="w-5 h-5 text-brand-purple" />
						Quick Tips
					</CardTitle>
					<Badge variant="secondary" className="text-xs">
						{filteredTips.length} tips
					</Badge>
				</div>
				<div className="relative mt-2">
					<HugeiconsIcon
						icon={Search01Icon}
						className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
					/>
					<Input
						placeholder="Search tips..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-9 h-9 text-sm"
					/>
				</div>
			</CardHeader>
			<CardContent className="space-y-3">
				{isLoading ? (
					<div className="space-y-2">
						{Array.from({ length: 3 }).map((_, i) => (
							<div key={`skeleton-${i}`} className="h-14 rounded-lg bg-muted animate-pulse" />
						))}
					</div>
				) : (
					<Tabs value={activeSubject} onValueChange={setActiveSubject}>
						<TabsList className="w-full h-auto flex-wrap justify-start gap-1 bg-transparent p-0">
							<TabsTrigger value="all" className="text-xs h-7 data-[state=active]:bg-muted">
								All
							</TabsTrigger>
							{subjects.map((subject) => {
								const style = getSubjectStyle(subject);
								return (
									<TabsTrigger
										key={subject}
										value={subject}
										className={cn('text-xs h-7', style.text)}
									>
										{subject}
									</TabsTrigger>
								);
							})}
						</TabsList>
						<TabsContent value={activeSubject} className="mt-3 space-y-2">
							{filteredTips.length === 0 ? (
								<div className="text-center py-8 text-sm text-muted-foreground">
									<HugeiconsIcon
										icon={BookOpen01Icon}
										className="w-8 h-8 mx-auto mb-2 opacity-40"
									/>
									No tips found
								</div>
							) : (
								filteredTips.map((tip) => <TipCard key={tip.id} tip={tip} />)
							)}
						</TabsContent>
					</Tabs>
				)}
			</CardContent>
		</Card>
	);
}
