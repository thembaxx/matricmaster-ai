import { TargetIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGoalStore } from '@/stores/useGoalStore';

interface UniversityRequirement {
	name: string;
	faculty: string;
	minAps: number;
	additionalRequirements?: string;
}

interface EligibleUniversitiesProps {
	eligibleUniversities: UniversityRequirement[];
	totalAPS: number;
	onSelect: (uni: UniversityRequirement) => void;
}

export function EligibleUniversities({
	eligibleUniversities,
	totalAPS,
	onSelect,
}: EligibleUniversitiesProps) {
	const setGoal = useGoalStore((state) => state.setGoal);

	return (
		<Card className="rounded-xl">
			<CardHeader>
				<CardTitle>Eligible Universities</CardTitle>
				<CardDescription>Based on your APS score of {totalAPS}</CardDescription>
			</CardHeader>
			<CardContent>
				{eligibleUniversities.length === 0 ? (
					<div className="text-center py-8 text-muted-foreground">
						<p>Your APS is too low for the listed universities.</p>
						<p className="text-sm mt-2 text-pretty">Most universities require at least 25-30 APS</p>
					</div>
				) : (
					<div className="space-y-3">
						{eligibleUniversities.slice(0, 5).map((uni, idx) => (
							<div
								key={`${uni.name}-${uni.faculty}-${idx}`}
								role="button"
								tabIndex={0}
								className="p-3 rounded-lg border bg-card hover:border-primary/30 transition-colors cursor-pointer"
								onClick={() => onSelect(uni)}
								onKeyDown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										onSelect(uni);
									}
								}}
							>
								<div className="flex items-start justify-between">
									<div>
										<h4 className="font-semibold text-sm">{uni.name}</h4>
										<p className="text-sm text-muted-foreground">{uni.faculty}</p>
									</div>
									<Badge variant="outline" className="shrink-0">
										APS: {uni.minAps}
									</Badge>
								</div>
								{uni.additionalRequirements && (
									<p className="text-xs text-muted-foreground mt-1">{uni.additionalRequirements}</p>
								)}
							</div>
						))}
						{eligibleUniversities.length > 0 && (
							<Button
								className="w-full mt-4"
								onClick={() => {
									const firstUni = eligibleUniversities[0];
									setGoal({
										universityName: firstUni.name,
										faculty: firstUni.faculty,
										currentAps: totalAPS,
										targetAps: firstUni.minAps,
										setAt: Date.now(),
									});
									toast.success('Goal set!', {
										description: `${firstUni.name} - ${firstUni.faculty} is now your dashboard goal.`,
										action: {
											label: 'View',
											onClick: () => (window.location.href = '/dashboard'),
										},
									});
								}}
							>
								<HugeiconsIcon icon={TargetIcon} className="w-4 h-4 mr-2" />
								Set as Dashboard Goal
							</Button>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
