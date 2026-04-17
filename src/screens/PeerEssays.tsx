'use client';

import { EditIcon, SentIcon, StarIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

const GRADING_XP = 15;
const MAX_PEER_GRADES = 3;

interface PeerEssay {
	id: string;
	subject: string;
	topic: string;
	essayContent: string;
	status: string;
	peerGradeCount: number;
	xpEarned: number;
	createdAt: string;
}

interface EssayGrade {
	id: string;
	clarity: number;
	argument: number;
	evidence: number;
	mechanics: number;
	feedback: string;
}

interface Subject {
	id: number;
	name: string;
	displayName: string;
}

const RUBRIC_INFO = [
	{ key: 'clarity', label: 'Clarity', desc: 'How clear and organized is the essay?' },
	{ key: 'argument', label: 'Argument', desc: 'Strength of thesis and reasoning' },
	{ key: 'evidence', label: 'Evidence', desc: 'Use of examples and sources' },
	{ key: 'mechanics', label: 'Mechanics', desc: 'Grammar, spelling, and punctuation' },
];

function RubricSlider({
	label,
	description,
	value,
	onChange,
}: {
	label: string;
	description: string;
	value: number;
	onChange: (v: number) => void;
}) {
	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between">
				<Label className="text-sm font-medium">{label}</Label>
				<span className="text-lg font-bold text-primary">{value}/5</span>
			</div>
			<p className="text-xs text-muted-foreground">{description}</p>
			<div className="flex gap-1">
				{[1, 2, 3, 4, 5].map((score) => (
					<button
						key={score}
						type="button"
						onClick={() => onChange(score)}
						className={`flex-1 h-10 rounded-lg text-sm font-semibold transition-all ${
							score <= value
								? 'bg-primary text-primary-foreground'
								: 'bg-muted text-muted-foreground hover:bg-muted/80'
						}`}
					>
						{score}
					</button>
				))}
			</div>
		</div>
	);
}

function EssayCard({ essay, onGrade }: { essay: PeerEssay; onGrade: (e: PeerEssay) => void }) {
	return (
		<Card className="bg-card/50 border-border/50 hover:border-border transition-colors">
			<CardHeader className="pb-2">
				<div className="flex items-start justify-between">
					<div>
						<CardTitle className="text-base font-semibold">{essay.topic}</CardTitle>
						<CardDescription className="text-xs mt-1">{essay.subject}</CardDescription>
					</div>
					<div className="flex items-center gap-1 text-yellow-500">
						<HugeiconsIcon icon={StarIcon} className="w-4 h-4" />
						<span className="text-xs font-semibold">
							{essay.peerGradeCount}/{MAX_PEER_GRADES}
						</span>
					</div>
				</div>
			</CardHeader>
			<CardContent className="pb-3">
				<p className="text-sm text-muted-foreground line-clamp-3">{essay.essayContent}</p>
				{essay.status === 'pending' || essay.status === 'being_graded' ? (
					<Button size="sm" onClick={() => onGrade(essay)} className="mt-3 w-full">
						<HugeiconsIcon icon={EditIcon} className="w-4 h-4 mr-2" />
						Grade This Essay
					</Button>
				) : (
					<div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
						<span>XP Earned: {essay.xpEarned}</span>
						<span className="capitalize">{essay.status.replace('_', ' ')}</span>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

function GradeForm({
	essay,
	onSubmit,
	onCancel,
}: {
	essay: PeerEssay;
	onSubmit: (grades: EssayGrade) => void;
	onCancel: () => void;
}) {
	const [clarity, setClarity] = useState(3);
	const [argument, setArgument] = useState(3);
	const [evidence, setEvidence] = useState(3);
	const [mechanics, setMechanics] = useState(3);
	const [feedback, setFeedback] = useState('');

	const handleSubmit = () => {
		onSubmit({
			id: essay.id,
			clarity,
			argument,
			evidence,
			mechanics,
			feedback,
		});
	};

	return (
		<Card className="bg-card border-border">
			<CardHeader>
				<CardTitle className="text-lg">Grade: {essay.topic}</CardTitle>
				<CardDescription>{essay.subject}</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="p-3 bg-muted/30 rounded-lg max-h-48 overflow-y-auto">
					<p className="text-sm whitespace-pre-wrap">{essay.essayContent}</p>
				</div>

				<div className="space-y-4">
					{RUBRIC_INFO.map((rubric) => (
						<RubricSlider
							key={rubric.key}
							label={rubric.label}
							description={rubric.desc}
							value={
								rubric.key === 'clarity'
									? clarity
									: rubric.key === 'argument'
										? argument
										: rubric.key === 'evidence'
											? evidence
											: mechanics
							}
							onChange={(v) => {
								if (rubric.key === 'clarity') setClarity(v);
								else if (rubric.key === 'argument') setArgument(v);
								else if (rubric.key === 'evidence') setEvidence(v);
								else setMechanics(v);
							}}
						/>
					))}
				</div>

				<div className="space-y-2">
					<Label className="text-sm font-medium">Feedback (optional)</Label>
					<Textarea
						placeholder="Give constructive feedback..."
						value={feedback}
						onChange={(e) => setFeedback(e.target.value)}
						className="min-h-20"
					/>
				</div>

				<div className="flex gap-3">
					<Button variant="outline" onClick={onCancel} className="flex-1">
						Cancel
					</Button>
					<Button onClick={handleSubmit} className="flex-1">
						<HugeiconsIcon icon={StarIcon} className="w-4 h-4 mr-2" />
						Submit Grade (+{GRADING_XP} XP)
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}

export default function PeerEssaysScreen() {
	const queryClient = useQueryClient();
	const [activeTab, setActiveTab] = useState('submit');
	const [selectedEssay, setSelectedEssay] = useState<PeerEssay | null>(null);

	// Form state
	const [subject, setSubject] = useState('');
	const [topic, setTopic] = useState('');
	const [content, setContent] = useState('');

	// Fetch subjects
	const { data: subjects = [] } = useQuery<Subject[]>({
		queryKey: ['subjects'],
		queryFn: async () => {
			const res = await fetch('/api/subjects');
			if (!res.ok) return [];
			return res.json();
		},
	});

	// Fetch user's essays
	const { data: myEssays = [] } = useQuery<PeerEssay[]>({
		queryKey: ['peer-essays', 'mine'],
		queryFn: async () => {
			const res = await fetch('/api/peer-essays');
			if (!res.ok) return [];
			return res.json();
		},
	});

	// Fetch essays to grade
	const { data: essaysToGrade = [] } = useQuery<PeerEssay[]>({
		queryKey: ['peer-essays', 'to-grade'],
		queryFn: async () => {
			const res = await fetch('/api/peer-essays?to_grade=true');
			if (!res.ok) return [];
			return res.json();
		},
		enabled: activeTab === 'grade',
	});

	// Submit essay mutation
	const submitEssay = useMutation({
		mutationFn: async () => {
			const res = await fetch('/api/peer-essays', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ subject, topic, content }),
			});
			if (!res.ok) throw new Error('Failed to submit essay');
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['peer-essays'] });
			setSubject('');
			setTopic('');
			setContent('');
			setActiveTab('submissions');
		},
	});

	// Submit grade mutation
	const submitGrade = useMutation({
		mutationFn: async (grade: EssayGrade) => {
			const res = await fetch('/api/peer-essays/grade', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(grade),
			});
			if (!res.ok) throw new Error('Failed to submit grade');
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['peer-essays'] });
			setSelectedEssay(null);
		},
	});

	const canSubmit = subject && topic && content.length >= 100;

	const handleGrade = (essay: PeerEssay) => {
		setSelectedEssay(essay);
	};

	if (selectedEssay) {
		return (
			<div className="min-h-screen bg-background px-4 py-8 sm:px-6">
				<div className="max-w-2xl mx-auto space-y-4">
					<Button variant="ghost" onClick={() => setSelectedEssay(null)}>
						← Back to Essays
					</Button>
					<GradeForm
						essay={selectedEssay}
						onSubmit={(grades) => submitGrade.mutate(grades)}
						onCancel={() => setSelectedEssay(null)}
					/>
				</div>
			</div>
		);
	}

	return (
		<ScrollArea className="h-screen">
			<div className="px-4 py-8 sm:px-6 pb-40">
				<div className="max-w-3xl mx-auto space-y-6">
					{/* Header */}
					<div className="space-y-2">
						<h1 className="text-3xl font-black tracking-tight font-display">peer essays</h1>
						<p className="text-muted-foreground">
							submit essays and earn XP by grading others. get 3 peer grades before AI feedback.
						</p>
					</div>

					<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
						<TabsList className="grid w-full grid-cols-3">
							<TabsTrigger value="submit" className="gap-2">
								<HugeiconsIcon icon={SentIcon} className="w-4 h-4" />
								submit
							</TabsTrigger>
							<TabsTrigger value="grade" className="gap-2">
								<HugeiconsIcon icon={EditIcon} className="w-4 h-4" />
								grade others
							</TabsTrigger>
							<TabsTrigger value="submissions" className="gap-2">
								<HugeiconsIcon icon={StarIcon} className="w-4 h-4" />
								my submissions
							</TabsTrigger>
						</TabsList>

						{/* Submit Tab */}
						<TabsContent value="submit" className="space-y-4">
							<Card>
								<CardHeader>
									<CardTitle>submit your essay</CardTitle>
									<CardDescription>
										write on any NSC topic. get feedback from 3 peers + AI.
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="space-y-2">
										<Label>subject</Label>
										<select
											value={subject}
											onChange={(e) => setSubject(e.target.value)}
											className="w-full h-10 rounded-lg border border-input bg-background px-3"
										>
											<option value="">select a subject</option>
											{subjects.map((s) => (
												<option key={s.id} value={s.name}>
													{s.displayName}
												</option>
											))}
										</select>
									</div>

									<div className="space-y-2">
										<Label>topic / question</Label>
										<Input
											placeholder="e.g., The role of music in South African culture"
											value={topic}
											onChange={(e) => setTopic(e.target.value)}
										/>
									</div>

									<div className="space-y-2">
										<Label>your essay (min 100 characters)</Label>
										<Textarea
											placeholder="write your essay here..."
											value={content}
											onChange={(e) => setContent(e.target.value)}
											className="min-h-48"
										/>
										<p className="text-xs text-muted-foreground text-right">
											{content.length} characters
										</p>
									</div>

									<Button
										onClick={() => submitEssay.mutate()}
										disabled={!canSubmit || submitEssay.isPending}
										className="w-full"
									>
										<HugeiconsIcon icon={SentIcon} className="w-4 h-4 mr-2" />
										{submitEssay.isPending ? 'Submitting...' : 'Submit Essay'}
									</Button>
								</CardContent>
							</Card>
						</TabsContent>

						{/* Grade Others Tab */}
						<TabsContent value="grade" className="space-y-4">
							<div className="flex items-center justify-between">
								<p className="text-sm text-muted-foreground">
									{essaysToGrade.length} essays waiting for grading
								</p>
								<span className="text-sm font-semibold text-primary">
									+{GRADING_XP} XP per grade
								</span>
							</div>

							{essaysToGrade.length === 0 ? (
								<Card>
									<CardContent className="py-12 text-center">
										<HugeiconsIcon
											icon={StarIcon}
											className="w-12 h-12 mx-auto text-muted-foreground/50"
										/>
										<p className="mt-4 text-muted-foreground">
											no essays to grade right now. check back later!
										</p>
									</CardContent>
								</Card>
							) : (
								<div className="grid gap-4 sm:grid-cols-2">
									{essaysToGrade.slice(0, 6).map((essay) => (
										<EssayCard key={essay.id} essay={essay} onGrade={handleGrade} />
									))}
								</div>
							)}
						</TabsContent>

						{/* My Submissions Tab */}
						<TabsContent value="submissions" className="space-y-4">
							{myEssays.length === 0 ? (
								<Card>
									<CardContent className="py-12 text-center">
										<HugeiconsIcon
											icon={EditIcon}
											className="w-12 h-12 mx-auto text-muted-foreground/50"
										/>
										<p className="mt-4 text-muted-foreground">
											you haven&apos;t submitted any essays yet.
										</p>
										<Button onClick={() => setActiveTab('submit')} className="mt-4">
											submit your first essay
										</Button>
									</CardContent>
								</Card>
							) : (
								<div className="space-y-4">
									{myEssays.map((essay) => (
										<Card key={essay.id}>
											<CardHeader className="pb-2">
												<CardTitle className="text-base">{essay.topic}</CardTitle>
												<CardDescription className="text-xs">
													{essay.subject} · {new Date(essay.createdAt).toLocaleDateString()}
												</CardDescription>
											</CardHeader>
											<CardContent>
												<p className="text-sm text-muted-foreground line-clamp-2">
													{essay.essayContent}
												</p>
												<div className="mt-3 flex items-center justify-between text-sm">
													<span className="text-muted-foreground">
														{essay.peerGradeCount}/{MAX_PEER_GRADES} peer grades
													</span>
													<span className="font-semibold text-primary">+{essay.xpEarned} XP</span>
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							)}
						</TabsContent>
					</Tabs>
				</div>
			</div>
		</ScrollArea>
	);
}
