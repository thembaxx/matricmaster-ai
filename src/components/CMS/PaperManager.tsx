'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { PastPaper } from '@/lib/db/schema';

interface PaperManagerProps {
	papers: PastPaper[];
}

export function PaperManager({ papers }: PaperManagerProps) {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{papers.map((p) => (
				<Card
					key={p.id}
					className="rounded-[2rem] border-2 border-border/50 hover:border-primary/20 transition-all duration-300 group"
				>
					<CardContent className="p-6 space-y-6">
						<div className="flex items-start justify-between">
							<div className="flex flex-wrap gap-2">
								<Badge className="rounded-lg uppercase tracking-widest text-[9px] font-black bg-primary/10 text-primary border-primary/20">
									{p.year}
								</Badge>
								<Badge
									variant="outline"
									className="rounded-lg uppercase tracking-widest text-[9px] font-black"
								>
									{p.paper}
								</Badge>
							</div>
						</div>

						<div>
							<h3 className="text-lg font-black text-foreground tracking-tighter uppercase line-clamp-1">
								{p.paperId}
							</h3>
							<p className="text-xs font-bold text-muted-foreground">{p.subject}</p>
						</div>

						<div className="pt-4 border-t border-border/50 flex items-center justify-between">
							<div className="space-y-1">
								<p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
									Status
								</p>
								<Badge
									className={`rounded-lg uppercase tracking-widest text-[9px] font-black ${p.isExtracted ? 'bg-emerald-500/10 text-emerald-500' : 'bg-brand-amber/10 text-brand-amber'}`}
								>
									{p.isExtracted ? 'Extracted' : 'Pending'}
								</Badge>
							</div>
							<div className="text-right">
								<p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
									Month
								</p>
								<p className="text-xs font-black text-foreground uppercase">{p.month}</p>
							</div>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
