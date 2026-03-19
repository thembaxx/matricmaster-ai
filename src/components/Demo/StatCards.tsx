'use client';

import { BookOpenIcon, Medal01Icon, UserGroupIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Card, CardContent } from '@/components/ui/card';

interface StatCardsProps {
	subjectsCount: number;
	questionsCount: number;
	achievementsCount: number;
}

export function StatCards({ subjectsCount, questionsCount, achievementsCount }: StatCardsProps) {
	return (
		<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
			<Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
				<CardContent className="pt-6">
					<div className="flex items-center gap-4">
						<div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
							<HugeiconsIcon icon={BookOpenIcon} className="w-6 h-6 text-primary" />
						</div>
						<div>
							<p className="text-3xl font-bold">{subjectsCount}</p>
							<p className="text-sm text-muted-foreground">Subjects</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
				<CardContent className="pt-6">
					<div className="flex items-center gap-4">
						<div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
							<HugeiconsIcon icon={Medal01Icon} className="w-6 h-6 text-blue-500" />
						</div>
						<div>
							<p className="text-3xl font-bold">{questionsCount}</p>
							<p className="text-sm text-muted-foreground">Questions</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
				<CardContent className="pt-6">
					<div className="flex items-center gap-4">
						<div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
							<HugeiconsIcon icon={Medal01Icon} className="w-6 h-6 text-green-500" />
						</div>
						<div>
							<p className="text-3xl font-bold">{achievementsCount}</p>
							<p className="text-sm text-muted-foreground">Achievements</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
				<CardContent className="pt-6">
					<div className="flex items-center gap-4">
						<div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
							<HugeiconsIcon icon={UserGroupIcon} className="w-6 h-6 text-purple-500" />
						</div>
						<div>
							<p className="text-3xl font-bold">3</p>
							<p className="text-sm text-muted-foreground">Study Buddies</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
