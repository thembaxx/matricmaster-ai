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
			<Card className="p-4 rounded-2xl animate-pulse">
				<div className="h-40 bg-muted rounded-xl" />
			</Card>
		);
	}

	const topStruggles = struggles.slice(0, 3);
	const weakTopics = confidence
		.filter((c) => Number.parseFloat(String(c.confidenceScore)) < 0.5)
		.slice(0, 3);

	return (
		<Card className="p-4 rounded-2xl space-y-4">
			<div className="flex items-center gap-2">
				<div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
					<HugeiconsIcon icon={SparklesIcon} className="w-4 h-4 text-primary" />
				</div>
				<h3 className="font-bold">Your Study Buddy</h3>
			</div>

			<PersonalitySelector currentPersonality={profile || 'mentor'} compact />

			{topStruggles.length > 0 && (
				<div className="space-y-2">
					<h4 className="text-xs font-medium text-muted-foreground uppercase">Keep Practicing</h4>
					{topStruggles.map((s) => (
						<StruggleAlert
							key={s.id}
							concept={s.concept}
							struggleCount={s.struggleCount}
							onGetHelp={() => handleStartChat(s.concept)}
						/>
					))}
				</div>
			)}

			{weakTopics.length > 0 && (
				<div className="space-y-2">
					<h4 className="text-xs font-medium text-muted-foreground uppercase">
						Building Confidence
					</h4>
					{weakTopics.map((c) => (
						<div key={c.id} className="space-y-1">
							<div className="flex justify-between text-xs">
								<span>{c.topic}</span>
								<span className="text-muted-foreground">{c.subject}</span>
							</div>
							<ConfidenceMeter
								score={Number.parseFloat(String(c.confidenceScore))}
								showValue={false}
								size="sm"
							/>
						</div>
					))}
				</div>
			)}

			{struggles.length === 0 && weakTopics.length === 0 && (
				<div className="text-center py-4 text-muted-foreground text-sm">
					You&apos;re doing great! Keep practicing to build confidence.
				</div>
			)}

			<Button variant="outline" className="w-full rounded-full" onClick={() => handleStartChat()}>
				Chat with Buddy
				<HugeiconsIcon icon={ArrowRightIcon} className="w-4 h-4 ml-1" />
			</Button>
		</Card>
	);
}
