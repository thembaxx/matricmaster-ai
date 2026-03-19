import { CheckmarkCircle02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

export function PassRequirementsList() {
	return (
		<div>
			<h4 className="font-medium mb-3">Pass Requirements</h4>
			<ul className="text-sm text-muted-foreground space-y-2">
				<li className="flex gap-2">
					<HugeiconsIcon
						icon={CheckmarkCircle02Icon}
						className="w-4 h-4 text-green-500 shrink-0 mt-0.5"
					/>
					<span>National Certificate: Pass 6 subjects (including Home Language)</span>
				</li>
				<li className="flex gap-2">
					<HugeiconsIcon
						icon={CheckmarkCircle02Icon}
						className="w-4 h-4 text-green-500 shrink-0 mt-0.5"
					/>
					<span>Admission to Bachelor: Pass 4 subjects (including Language)</span>
				</li>
				<li className="flex gap-2">
					<HugeiconsIcon
						icon={CheckmarkCircle02Icon}
						className="w-4 h-4 text-green-500 shrink-0 mt-0.5"
					/>
					<span>Minimum 30% in Home Language for certificate endorsement</span>
				</li>
			</ul>
		</div>
	);
}
