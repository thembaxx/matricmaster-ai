'use client';

import { ArrowRightIcon, SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
	type BuddyPersonality,
	type ConceptStruggleInfo,
	getBuddyProfile,
	getStrugglingConcepts,
	getTopicConfidence,
	type TopicConfidenceInfo,
} from '@/services/buddyActions';
import { ConfidenceMeter } from './ConfidenceMeter';
import { PersonalitySelector } from './PersonalitySelector';
import { StruggleAlert } from './StruggleAlert';

interface BuddyPanelProps {
	onStartChat?: (topic?: string) => void;
}

export function BuddyPanel({ onStartChat }: BuddyPanelProps) {
	const router = useRouter();
	const [profile, setProfile] = useState<BuddyPersonality | null>(null);
	const [struggles, setStruggles] = useState<ConceptStruggleInfo[]>([]);
	const [confidence, setConfidence] = useState<TopicConfidenceInfo[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function loadData() {
			try {
				const [buddyProfile, struggling, conf] = await Promise.all([
					getBuddyProfile(),
					getStrugglingConcepts(),
					getTopicConfidence(),
				]);
				setProfile(buddyProfile?.personality || null);
				setStruggles(struggling);
				setConfidence(conf);
			} catch (error) {
				console.error('Failed to load buddy data:', error);
			} finally {
				setLoading(false);
			}
		}
		loadData();
	}, []);

	const handleStartChat = (topic?: string) => {
		if (onStartChat) {
			onStartChat(topic);
		} else {
			router.push(`/voice-tutor?topic=${encodeURIComponent(topic || '')}`);
		}
	};

	if (loading) {
		return (
			<Card className="p-6 rounded-[2rem] animate-pulse border-0 shadow-tiimo">
				<div className="space-y-4">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-full bg-primary/20" />
						<div className="h-5 w-32 bg-muted rounded" />
					</div>
					<div className="h-20 bg-muted rounded-xl" />
					<div className="h-12 bg-muted rounded-xl" />
				</div>
			</Card>
		);
	}

	const topStruggles = struggles.slice(0, 2);
	const weakTopics = confidence
		.filter((c) => Number.parseFloat(String(c.confidenceScore)) < 0.5)
		.slice(0, 3);

	const hasContent = topStruggles.length > 0 || weakTopics.length > 0;

	return (
		<Card className="p-6 rounded-[2rem] space-y-5 border-0 shadow-tiimo overflow-hidden relative">
			<div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-400 to-primary" />

			<div className="flex items-center gap-3">
				<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
					<HugeiconsIcon icon={SparklesIcon} className="w-5 h-5 text-primary" />
				</div>
				<div>
					<h3 className="font-display font-bold text-lg text-foreground">Your Study Buddy</h3>
					<p className="text-xs text-muted-foreground">AI-powered learning companion</p>
				</div>
			</div>

			<div className="py-2">
				<PersonalitySelector currentPersonality={profile || 'mentor'} compact />
			</div>

			{topStruggles.length > 0 && (
				<div className="space-y-3">
					<h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
						Keep Practicing
					</h4>
					<div className="space-y-2">
						{topStruggles.map((s) => (
							<StruggleAlert
								key={s.id}
								concept={s.concept}
								struggleCount={s.struggleCount}
								onGetHelp={() => handleStartChat(s.concept)}
							/>
						))}
					</div>
				</div>
			)}

			{weakTopics.length > 0 && (
				<div className="space-y-3">
					<h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
						Building Confidence
					</h4>
					<div className="space-y-3">
						{weakTopics.map((c) => (
							<div key={c.id} className="space-y-1.5">
								<div className="flex justify-between items-center">
									<span className="text-sm font-medium">{c.topic}</span>
									<span className="text-xs text-muted-foreground">{c.subject}</span>
								</div>
								<ConfidenceMeter
									score={Number.parseFloat(String(c.confidenceScore))}
									showValue
									size="sm"
								/>
							</div>
						))}
					</div>
				</div>
			)}

			{!hasContent && (
				<div className="py-6 text-center">
					<div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
						<HugeiconsIcon icon={SparklesIcon} className="w-6 h-6 text-success" />
					</div>
					<p className="text-sm text-muted-foreground">
						You&apos;re doing great! Keep practicing to build confidence.
					</p>
				</div>
			)}

			<Button
				variant="outline"
				className="w-full rounded-full h-11 font-medium border-primary/20 hover:bg-primary/5"
				onClick={() => handleStartChat()}
			>
				Chat with Buddy
				<HugeiconsIcon icon={ArrowRightIcon} className="w-4 h-4 ml-2" />
			</Button>
		</Card>
	);
}
