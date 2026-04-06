'use client';

import { motion } from 'framer-motion';
import { AlertCircle, Target, TrendingDown, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WeakTopic {
	topic: string;
	accuracy: number;
	questionsAttempted: number;
}

interface SubjectPerformance {
	subject: string;
	accuracy: number;
	totalQuestions: number;
}

interface StrongTopic {
	topic: string;
	accuracy: number;
}

interface SkillsWeaknessAnalysisProps {
	weakTopics: WeakTopic[];
	subjectPerformance: SubjectPerformance[];
	strongTopics: StrongTopic[];
}

function getPerformanceColor(accuracy: number): string {
	if (accuracy > 70) return '#22c55e';
	if (accuracy >= 50) return '#eab308';
	return '#ef4444';
}

function SubjectPerformanceGrid({ subjects }: { subjects: SubjectPerformance[] }) {
	return (
		<Card className="rounded-[2rem] bg-card/50 backdrop-blur-sm border-border/50">
			<CardHeader className="pb-2">
				<CardTitle className="label-xs font-black text-label-tertiary tracking-tight">
					subject performance
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
					{subjects.map((subject, index) => {
						const color = getPerformanceColor(subject.accuracy);
						return (
							<motion.div
								key={subject.subject}
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.3, delay: index * 0.05 }}
								className="flex items-center justify-between p-3 rounded-xl bg-background/30 border border-border/30"
							>
								<div className="flex flex-col">
									<span className="body-sm font-medium text-foreground">
										{subject.subject.toLowerCase()}
									</span>
									<span className="label-xs text-label-tertiary font-numeric">
										{subject.totalQuestions} questions
									</span>
								</div>
								<div className="flex items-center gap-2">
									<div
										className="w-10 h-10 rounded-lg flex items-center justify-center tiimo-press"
										style={{ backgroundColor: `${color}20` }}
									>
										<span className="body-sm font-black font-numeric" style={{ color }}>
											{Math.round(subject.accuracy)}%
										</span>
									</div>
								</div>
							</motion.div>
						);
					})}
				</div>
				<div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/30">
					<div className="flex items-center gap-2">
						<div className="w-3 h-3 rounded-full bg-[#22c55e]" />
						<span className="label-xs text-label-tertiary">strong (&gt;70%)</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="w-3 h-3 rounded-full bg-[#eab308]" />
						<span className="label-xs text-label-tertiary">moderate (50-70%)</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="w-3 h-3 rounded-full bg-[#ef4444]" />
						<span className="label-xs text-label-tertiary">needs work (&lt;50%)</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

function WeakTopicsList({ topics }: { topics: WeakTopic[] }) {
	return (
		<Card className="rounded-[2rem] bg-card/50 backdrop-blur-sm border-border/50">
			<CardHeader className="pb-2">
				<CardTitle className="label-xs font-black text-label-tertiary tracking-tight flex items-center gap-2">
					<TrendingDown className="w-3 h-3 text-[#ef4444]" />
					areas for improvement
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				{topics.slice(0, 5).map((topic, index) => (
					<motion.div
						key={topic.topic}
						initial={{ opacity: 0, x: -10 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.3, delay: index * 0.1 }}
						className="flex items-center justify-between p-3 rounded-xl bg-[#ef4444]/5 border border-[#ef4444]/20"
					>
						<div className="flex flex-col">
							<span className="body-sm font-medium text-foreground">
								{topic.topic.toLowerCase()}
							</span>
							<span className="label-xs text-label-tertiary font-numeric">
								{topic.questionsAttempted} questions attempted
							</span>
						</div>
						<div className="flex items-center gap-2">
							<span className="text-lg font-black text-[#ef4444] font-numeric">
								{Math.round(topic.accuracy)}%
							</span>
							<AlertCircle className="w-4 h-4 text-[#ef4444]" />
						</div>
					</motion.div>
				))}
			</CardContent>
		</Card>
	);
}

function StrongTopicsList({ topics }: { topics: StrongTopic[] }) {
	return (
		<Card className="rounded-[2rem] bg-card/50 backdrop-blur-sm border-border/50">
			<CardHeader className="pb-2">
				<CardTitle className="label-xs font-black text-label-tertiary tracking-tight flex items-center gap-2">
					<TrendingUp className="w-3 h-3 text-[#22c55e]" />
					top strengths
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				{topics.slice(0, 3).map((topic, index) => (
					<motion.div
						key={topic.topic}
						initial={{ opacity: 0, x: -10 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.3, delay: index * 0.1 }}
						className="flex items-center justify-between p-3 rounded-xl bg-[#22c55e]/5 border border-[#22c55e]/20"
					>
						<span className="body-sm font-medium text-foreground">{topic.topic.toLowerCase()}</span>
						<span className="text-lg font-black text-[#22c55e] font-numeric">
							{Math.round(topic.accuracy)}%
						</span>
					</motion.div>
				))}
			</CardContent>
		</Card>
	);
}

function FocusRecommendations({ weakTopics }: { weakTopics: WeakTopic[] }) {
	const topWeak = weakTopics[0];

	return (
		<Card className="rounded-[2rem] bg-card/50 backdrop-blur-sm border-border/50">
			<CardHeader className="pb-2">
				<CardTitle className="label-xs font-black text-label-tertiary tracking-tight flex items-center gap-2">
					<Target className="w-3 h-3 text-primary-orange" />
					focus recommendation
				</CardTitle>
			</CardHeader>
			<CardContent>
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.5 }}
					className="p-4 rounded-xl bg-gradient-to-r from-primary-orange/10 to-primary-violet/10 border border-primary-orange/20"
				>
					<p className="label-xs text-label-tertiary mb-1">ai suggestion</p>
					<p className="body-md font-medium text-foreground">
						focus on{' '}
						<span className="text-primary-orange font-black">
							{(topWeak?.topic || 'your weakest topic').toLowerCase()}
						</span>
					</p>
					<p className="label-xs text-label-tertiary mt-2">
						with <span className="font-numeric">{Math.round(topWeak?.accuracy || 0)}%</span>{' '}
						accuracy, improving this area will have the biggest impact on your overall score.
					</p>
				</motion.div>
			</CardContent>
		</Card>
	);
}

export default function SkillsWeaknessAnalysis({
	weakTopics,
	subjectPerformance,
	strongTopics,
}: SkillsWeaknessAnalysisProps) {
	return (
		<div className="space-y-4">
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
				<SubjectPerformanceGrid subjects={subjectPerformance} />
				<div className="space-y-4">
					<WeakTopicsList topics={weakTopics} />
					<StrongTopicsList topics={strongTopics} />
				</div>
			</div>
			<FocusRecommendations weakTopics={weakTopics} />
		</div>
	);
}
