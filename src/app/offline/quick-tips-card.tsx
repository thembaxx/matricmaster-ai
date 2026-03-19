import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { OFFLINE_SUBJECTS } from './constants';

interface QuickTipsCardProps {
	selectedSubject: string;
	onSubjectChange: (subject: string) => void;
	tips: Array<{ id: string; title: string; content: string }>;
}

export function QuickTipsCard({ selectedSubject, onSubjectChange, tips }: QuickTipsCardProps) {
	if (tips.length === 0) return null;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg">Quick Tips</CardTitle>
				<CardDescription>Study tips available offline</CardDescription>
			</CardHeader>
			<CardContent className="space-y-3">
				<div className="flex gap-2 flex-wrap">
					{OFFLINE_SUBJECTS.map((subject) => (
						<Button
							key={subject}
							variant={selectedSubject === subject ? 'default' : 'outline'}
							size="sm"
							onClick={() => onSubjectChange(subject)}
						>
							{subject}
						</Button>
					))}
				</div>
				<div className="space-y-2 mt-4">
					{tips.map((tip) => (
						<div key={tip.id} className="p-3 bg-muted rounded-lg">
							<p className="font-medium text-sm">{tip.title}</p>
							<p className="text-xs text-muted-foreground mt-1">{tip.content}</p>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
