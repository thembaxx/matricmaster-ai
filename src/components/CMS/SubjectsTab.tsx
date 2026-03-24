import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { Subject } from '@/lib/db/schema';

export function SubjectsTab({ subjects }: { subjects: Subject[] }) {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{subjects.map((s) => (
				<Card key={s.id} className="rounded-[2.5rem] border-2 border-border/50 p-8 space-y-4">
					<div className="flex items-center justify-between">
						<h3 className="text-2xl font-black text-foreground tracking-tighter ">{s.name}</h3>
						<Badge
							className={`rounded-lg  tracking-widest text-[9px] font-black ${s.isActive ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'}`}
						>
							{s.isActive ? 'Active' : 'Inactive'}
						</Badge>
					</div>
					<p className="text-sm font-bold text-muted-foreground line-clamp-2">{s.description}</p>
					<div className="pt-4 border-t border-border/50">
						<p className="text-[10px] font-black text-muted-foreground  tracking-widest">
							Curriculum Code
						</p>
						<p className="text-sm font-black text-foreground ">{s.curriculumCode}</p>
					</div>
				</Card>
			))}
		</div>
	);
}
