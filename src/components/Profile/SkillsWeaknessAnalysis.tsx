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
				<CardTitle className="text-xs font-black text-label-tertiary tracking-[0.2em] uppercase">
					Subject Performance
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
									<span className="text-sm font-medium text-foreground">{subject.subject}</span>
									<span className="text-[10px] text-label-tertiary">
										{subject.totalQuestions} questions
									</span>
								</div>
								<div className="flex items-center gap-2">
									<div
										className="w-10 h-10 rounded-lg flex items-center justify-center"
										style={{ backgroundColor: `${color}20` }}
									>
										<span className="text-sm font-black" style={{ color }}>
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
						<span className="text-[10px] text-label-tertiary">Strong (&gt;70%)</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="w-3 h-3 rounded-full bg-[#eab308]" />
						<span className="text-[10px] text-label-tertiary">Moderate (50-70%)</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="w-3 h-3 rounded-full bg-[#ef4444]" />
						<span className="text-[10px] text-label-tertiary">Needs Work (&lt;50%)</span>
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
				<CardTitle className="text-xs font-black text-label-tertiary tracking-[0.2em] uppercase flex items-center gap-2">
					<TrendingDown className="w-3 h-3 text-[#ef4444]" />
					Areas For Improvement
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
							<span className="text-sm font-medium text-foreground">{topic.topic}</span>
							<span className="text-[10px] text-label-tertiary">
								{topic.questionsAttempted} questions attempted
							</span>
						</div>
						<div className="flex items-center gap-2">
							<span className="text-lg font-black text-[#ef4444]">
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
				<CardTitle className="text-xs font-black text-label-tertiary tracking-[0.2em] uppercase flex items-center gap-2">
					<TrendingUp className="w-3 h-3 text-[#22c55e]" />
					Top Strengths
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
						<span className="text-sm font-medium text-foreground">{topic.topic}</span>
						<span className="text-lg font-black text-[#22c55e]">{Math.round(topic.accuracy)}%</span>
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
				<CardTitle className="text-xs font-black text-label-tertiary tracking-[0.2em] uppercase flex items-center gap-2">
					<Target className="w-3 h-3 text-primary-orange" />
					Focus Recommendation
				</CardTitle>
			</CardHeader>
			<CardContent>
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.5 }}
					className="p-4 rounded-xl bg-gradient-to-r from-primary-orange/10 to-primary-violet/10 border border-primary-orange/20"
				>
					<p className="text-sm text-label-tertiary mb-1">AI Suggestion</p>
					<p className="text-base font-medium text-foreground">
						Focus on{' '}
						<span className="text-primary-orange font-black">
							{topWeak?.topic || 'your weakest topic'}
						</span>
					</p>
					<p className="text-xs text-label-tertiary mt-2">
						With {Math.round(topWeak?.accuracy || 0)}% accuracy, improving this area will have the
						biggest impact on your overall score.
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
