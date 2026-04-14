import { BookOpen01Icon, PlayCircleIcon, SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import Link from 'next/link';
import type { MistakeWithContent } from '@/actions/mistake-to-study-plan';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface BridgeToMasteryProps {
	score: number;
	totalQuestions: number;
	recommendations: MistakeWithContent[];
	onContinue: () => void;
}

export function BridgeToMastery({
	score,
	totalQuestions,
	recommendations,
	onContinue,
}: BridgeToMasteryProps) {
	const percentage = Math.round((score / totalQuestions) * 100);
	const hasMistakes = recommendations.length > 0;

	return (
		<div className="flex flex-col items-center justify-center min-h-full py-12 px-4 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
			<div className="text-center space-y-2">
				<div className="relative inline-flex items-center justify-center">
					<div className="absolute inset-0 blur-2xl bg-primary/20 rounded-full" />
					<div className="relative w-24 h-24 rounded-full bg-card border-4 border-primary flex items-center justify-center shadow-xl">
						<span className="text-3xl font-black text-foreground">{percentage}%</span>
					</div>
				</div>
				<h2 className="text-3xl font-bold text-foreground mt-6">Session Complete!</h2>
				<p className="text-muted-foreground max-w-xs mx-auto">
					{percentage === 100
						? "Perfect score! You've mastered these concepts."
						: `You got ${score} out of ${totalQuestions} correct. Let's bridge the gaps.`}
				</p>
			</div>

			{hasMistakes ? (
				<div className="w-full max-w-md space-y-4">
					<div className="flex items-center gap-2 px-2">
						<HugeiconsIcon icon={SparklesIcon} className="w-5 h-5 text-primary" />
						<h3 className="text-sm font-bold tracking-widest text-muted-foreground">
							recommended for mastery
						</h3>
					</div>

					<div className="grid gap-3">
						{recommendations.map((rec, idx) => (
							<Card
								key={idx}
								className="p-4 rounded-2xl border-2 border-border bg-card hover:border-primary/50 transition-colors group"
							>
								<div className="flex flex-col gap-3">
									<div className="flex items-center justify-between">
										<Badge variant="outline" className="text-[10px] font-bold rounded-full">
											{rec.topic}
										</Badge>
									</div>

									<div className="space-y-2">
										{rec.recommendedLesson && (
											<Link
												href={`/learning-center?topic=${encodeURIComponent(rec.recommendedLesson.topic)}`}
												className="flex items-center gap-3 p-2 rounded-xl bg-muted/50 hover:bg-primary/10 transition-colors group/link"
											>
												<div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm group-hover/link:scale-110 transition-transform">
													<HugeiconsIcon icon={BookOpen01Icon} className="w-4 h-4 text-primary" />
												</div>
												<div className="flex-1">
													<p className="text-xs font-bold text-foreground line-clamp-1">
														{rec.recommendedLesson.title}
													</p>
													<p className="text-[10px] text-muted-foreground">
														Easy-level bridge lesson
													</p>
												</div>
												<HugeiconsIcon
													icon={PlayCircleIcon}
													className="w-4 h-4 text-muted-foreground group-hover/link:text-primary transition-colors"
												/>
											</Link>
										)}

										{rec.recommendedPastPaper && (
											<Link
												href={`/past-papers?id=${rec.recommendedPastPaper.id}`}
												className="flex items-center gap-3 p-2 rounded-xl bg-muted/50 hover:bg-primary/10 transition-colors group/link"
											>
												<div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm group-hover/link:scale-110 transition-transform">
													<HugeiconsIcon
														icon={BookOpen01Icon}
														className="w-4 h-4 text-brand-blue"
													/>
												</div>
												<div className="flex-1">
													<p className="text-xs font-bold text-foreground line-clamp-1">
														{rec.recommendedPastPaper.title}
													</p>
													<p className="text-[10px] text-muted-foreground">
														Relevant past paper practice
													</p>
												</div>
												<HugeiconsIcon
													icon={PlayCircleIcon}
													className="w-4 h-4 text-muted-foreground group-hover/link:text-brand-blue transition-colors"
												/>
											</Link>
										)}
									</div>
								</div>
							</Card>
						))}
					</div>
				</div>
			) : (
				<div className="text-center p-8 rounded-3xl bg-primary/5 border border-primary/10 max-w-sm">
					<p className="text-sm text-muted-foreground">
						No gaps detected! You're ready for the next challenge.
					</p>
				</div>
			)}

			<Button
				onClick={onContinue}
				className="w-full max-w-xs rounded-full py-6 text-base font-bold shadow-lg shadow-primary/20"
			>
				Return to Dashboard
			</Button>
		</div>
	);
}
