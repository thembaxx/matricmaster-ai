import { Flag01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { StudyPlan } from '@/lib/db/schema';

export function PriorityList({
	plans,
	isAdding,
	newTitle,
	onTitleChange,
	onAdd,
	onStartAdding,
}: {
	plans: StudyPlan[];
	isAdding: boolean;
	newTitle: string;
	onTitleChange: (value: string) => void;
	onAdd: () => void;
	onStartAdding: () => void;
}) {
	return (
		<Card className="md:col-span-2 shadow-tiimo border-border/50">
			<CardHeader>
				<CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
					<HugeiconsIcon icon={Flag01Icon} className="w-5 h-5 text-destructive" />
					Priority Focus (Big Rocks)
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					{plans.length > 0 ? (
						plans.map((item) => (
							<div
								key={item.id ?? item.title}
								className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border/50"
							>
								<div className="flex items-center gap-4">
									<div className="w-2 h-2 rounded-full bg-primary" />
									<div>
										<p className="font-bold text-sm">{item.title}</p>
										<p className="text-[10px] font-black text-muted-foreground uppercase">
											General Focus
										</p>
									</div>
								</div>
								<span className="text-[10px] font-black px-2 py-1 rounded-full bg-destructive/10 text-destructive">
									High
								</span>
							</div>
						))
					) : (
						<p className="py-8 text-center text-muted-foreground text-sm font-bold uppercase tracking-widest">
							No priority tasks yet.
						</p>
					)}
				</div>

				{isAdding ? (
					<div className="mt-4 flex gap-2">
						<Input
							type="text"
							value={newTitle}
							onChange={(e) => onTitleChange(e.target.value)}
							placeholder="What is your focus?"
							className="flex-1 bg-card border-2 border-border rounded-xl px-4 py-2 text-sm"
						/>
						<Button onClick={onAdd} size="sm" className="rounded-xl">
							Add
						</Button>
					</div>
				) : (
					<Button
						onClick={onStartAdding}
						variant="ghost"
						className="w-full mt-4 font-black uppercase text-[10px] tracking-widest"
					>
						Add Priority Task
					</Button>
				)}
			</CardContent>
		</Card>
	);
}
