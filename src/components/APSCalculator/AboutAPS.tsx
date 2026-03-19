import { HelpCircleIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AboutAPS() {
	return (
		<Card className="mt-6 rounded-xl">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<HugeiconsIcon icon={HelpCircleIcon} className="w-5 h-5" />
					About APS
				</CardTitle>
			</CardHeader>
			<CardContent className="text-sm text-muted-foreground space-y-2">
				<p className="text-pretty">
					<strong>APS (Admission Point Score)</strong> is used by South African universities to
					determine your eligibility for degree programmes.
				</p>
				<p className="text-pretty leading-5">
					Each subject grade is converted to points: A (7), B (6), C (5), D (4), E (3), F (2), G
					(1), U (0). Your total APS is the sum of your best 7 subjects, including Life Orientation.
				</p>
				<p className="text-xs text-pretty">
					<em>
						Note: Requirements may change annually. Always verify with the university's official
						admissions office.
					</em>
				</p>
			</CardContent>
		</Card>
	);
}
