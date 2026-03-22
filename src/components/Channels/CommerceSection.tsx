'use client';

import { ChartBar, UserGroupIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Avatar, AvatarImage } from '@/components/ui/avatar';

interface CommerceCardProps {
	title: string;
	studentCount: string;
	onlineCount?: number;
}

export function CommerceCard({ title, studentCount }: CommerceCardProps) {
	return (
		<div className="bg-card p-4 rounded-3xl flex items-center justify-between shadow-sm border border-border hover:shadow-md transition-all cursor-pointer group ios-active-scale">
			<div className="flex items-center gap-4">
				<div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-accounting/10">
					<HugeiconsIcon icon={ChartBar} className="w-6 h-6 text-accounting" />
				</div>
				<div className="text-left">
					<h4 className="font-black text-foreground uppercase tracking-tight">{title}</h4>
					<div className="flex items-center gap-1 text-[10px] font-black text-label-tertiary uppercase tracking-widest">
						<HugeiconsIcon icon={UserGroupIcon} className="w-3 h-3" />
						{studentCount}
					</div>
				</div>
			</div>
			<div className="flex items-center -space-x-2">
				{[1, 2, 3].map((item) => (
					<div
						key={`commerce-avatar-${item}`}
						className="w-7 h-7 rounded-full border-2 border-background bg-secondary overflow-hidden relative shadow-sm"
					>
						<Avatar className="w-full h-full">
							<AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces" />
						</Avatar>
					</div>
				))}
				<div className="w-7 h-7 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[8px] font-black text-label-tertiary">
					+4
				</div>
			</div>
		</div>
	);
}

export function CommerceSection() {
	return (
		<section className="space-y-4">
			<h3 className="text-xl font-black text-foreground uppercase tracking-tight">Commerce</h3>
			<CommerceCard title="Accounting" studentCount="8.2k" />
		</section>
	);
}
