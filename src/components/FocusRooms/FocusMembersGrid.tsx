import { UserGroupIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { FocusSession } from './constants';

export function FocusMembersGrid({
	isGroupMode,
	presenceData,
}: {
	isGroupMode: boolean;
	presenceData: FocusSession[];
}) {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h3 className="text-xs font-black  tracking-[0.2em] text-tiimo-gray-muted ml-4 flex items-center gap-2">
					<HugeiconsIcon icon={UserGroupIcon} className="w-4 h-4" />
					{isGroupMode ? 'Study Buddies' : 'Active Scholars'} (
					{Array.isArray(presenceData) ? presenceData.length : 0})
				</h3>
			</div>
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
				{Array.isArray(presenceData) &&
					presenceData.map((member: FocusSession) => (
						<m.div
							key={member.clientId}
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							className="bg-card p-4 rounded-3xl border border-border/50 shadow-tiimo flex flex-col items-center text-center gap-3"
						>
							<div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center font-black text-primary text-xl">
								{member.data?.user?.charAt(0) || 'S'}
							</div>
							<div>
								<p className="font-black text-xs  truncate w-full">
									{member.data?.user || 'Scholar'}
								</p>
								<span
									className={cn(
										'text-[8px] font-black  tracking-widest px-2 py-0.5 rounded-full',
										member.data?.status === 'Studying'
											? 'bg-tiimo-green/10 text-tiimo-green'
											: 'bg-tiimo-yellow/10 text-tiimo-yellow'
									)}
								>
									{member.data?.status || 'Resting'}
								</span>
							</div>
							{member.data?.focusMinutes && member.data.focusMinutes > 0 && (
								<p className="text-[10px] text-muted-foreground">{member.data.focusMinutes} min</p>
							)}
						</m.div>
					))}
			</div>
		</div>
	);
}
