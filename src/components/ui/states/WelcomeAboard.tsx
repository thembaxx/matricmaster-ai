'use client';

import { SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface WelcomeAboardProps {
	userName?: string;
	onCompleteProfile?: () => void;
}

export function WelcomeAboard({ userName, onCompleteProfile }: WelcomeAboardProps) {
	const router = useRouter();

	return (
		<m.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
			<Card className="p-8 text-center bg-gradient-to-br from-tiimo-lavender/10 to-tiimo-green/10 border-tiimo-lavender/20">
				<div className="w-20 h-20 bg-tiimo-lavender/20 rounded-full flex items-center justify-center mx-auto mb-6">
					<HugeiconsIcon icon={SparklesIcon} className="w-10 h-10 text-tiimo-lavender" />
				</div>
				<h2 className="text-2xl font-black text-foreground mb-2">
					Welcome Aboard, {userName || 'Scholar'}!
				</h2>
				<p className="text-muted-foreground mb-6 max-w-md mx-auto">
					Your personalized Grade 12 study journey starts here. Complete your profile to get
					tailored recommendations.
				</p>
				<div className="flex gap-3 justify-center">
					<Button onClick={onCompleteProfile || (() => router.push('/onboarding'))}>
						Complete Profile
					</Button>
					<Button variant="outline" onClick={() => router.push('/subjects')}>
						Browse Subjects
					</Button>
				</div>
			</Card>
		</m.div>
	);
}
