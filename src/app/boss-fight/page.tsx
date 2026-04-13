'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { BossFightExam } from '@/components/BossFight/BossFightExam';
import { MasteryBadge } from '@/components/BossFight/MasteryBadge';
import { Button } from '@/components/ui/button';

const SUBJECTS = ['mathematics', 'physical sciences', 'life sciences'];

export default function BossFightPage() {
	const [stage, setStage] = useState<'select' | 'fight' | 'victory'>('select');
	const [selectedSubject, setSelectedSubject] = useState('');
	const [finalScore, setFinalScore] = useState(0);

	const handleStartFight = () => {
		if (!selectedSubject) return;
		setStage('fight');
	};

	const handleFightComplete = (score: number) => {
		setFinalScore(score);
		setStage('victory');
	};

	const handleShare = async () => {
		const shareData = {
			title: 'MatricMaster AI — Achievement Unlocked!',
			text: `I just scored ${finalScore}/10 in the ${selectedSubject} Boss Fight!`,
			url: window.location.href,
		};
		if (navigator.share) {
			try {
				await navigator.share(shareData);
			} catch {
				// User cancelled share
			}
		} else {
			await navigator.clipboard.writeText(window.location.href);
			toast.success('Link copied to clipboard!');
		}
	};

	if (stage === 'fight') {
		return <BossFightExam subject={selectedSubject} onComplete={handleFightComplete} />;
	}

	if (stage === 'victory') {
		return (
			<MasteryBadge
				subject={selectedSubject}
				score={finalScore}
				totalQuestions={10}
				onShare={handleShare}
			/>
		);
	}

	return (
		<div className="min-h-screen bg-background p-4 sm:p-6">
			<div className="max-w-2xl mx-auto">
				<header className="text-center mb-8">
					<h1 className="text-3xl font-bold tracking-tight mb-2">boss fight</h1>
					<p className="text-muted-foreground">defeat the exam boss to earn your mastery badge</p>
				</header>

				<div className="bg-card rounded-2xl border border-border/30 p-8 shadow-lg">
					<div className="text-center mb-6">
						<div className="text-6xl mb-4">👹</div>
						<h2 className="text-xl font-semibold mb-2">choose your battleground</h2>
						<p className="text-muted-foreground">select a subject to challenge the boss</p>
					</div>

					<div className="space-y-3 mb-6">
						{SUBJECTS.map((subject) => (
							<button
								key={subject}
								type="button"
								onClick={() => setSelectedSubject(subject)}
								className={`w-full p-4 rounded-xl border transition-all ${
									selectedSubject === subject
										? 'border-primary bg-primary/5'
										: 'border-border/30 hover:border-border'
								}`}
							>
								{subject}
							</button>
						))}
					</div>

					<Button
						onClick={handleStartFight}
						disabled={!selectedSubject}
						className="w-full"
						size="lg"
					>
						start boss fight
					</Button>
				</div>
			</div>
		</div>
	);
}
