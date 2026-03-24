import { Message01Icon, PlayIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export function StudyChat({ isGroupMode }: { isGroupMode: boolean }) {
	return (
		<Card className="rounded-[2.5rem] h-[400px] flex flex-col bg-card border-border/50 shadow-tiimo overflow-hidden">
			<div className="p-6 border-b border-border/50 bg-muted/30 flex items-center gap-3">
				<HugeiconsIcon icon={Message01Icon} className="w-5 h-5 text-primary" />
				<h3 className="font-black  tracking-widest text-[10px]">Study Chat</h3>
			</div>
			<CardContent className="flex-1 p-6 overflow-y-auto no-scrollbar">
				<div className="space-y-4">
					<div className="bg-secondary/50 p-4 rounded-2xl rounded-tl-none mr-8">
						<p className="text-[10px] font-black text-primary  mb-1">System</p>
						<p className="text-xs font-medium text-tiimo-gray-muted">
							{isGroupMode
								? 'Group Sprint Mode! Study together with your buddies.'
								: 'Welcome to the shared study room! Messages are real-time.'}
						</p>
					</div>
				</div>
			</CardContent>
			<div className="p-4 bg-muted/30">
				<Separator className="mb-4" />
				<div className="flex gap-2">
					<input
						type="text"
						placeholder="Say something motivating..."
						className="flex-1 bg-card border-none rounded-xl h-12 px-4 text-sm font-medium focus:ring-2 focus:ring-primary/50"
					/>
					<Button className="rounded-xl h-12 w-12 p-0">
						<HugeiconsIcon icon={PlayIcon} className="w-5 h-5" />
					</Button>
				</div>
			</div>
		</Card>
	);
}
