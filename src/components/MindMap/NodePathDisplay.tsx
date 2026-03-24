'use client';

import { Card, CardContent } from '@/components/ui/card';

interface NodePathDisplayProps {
	path: string[];
}

export function NodePathDisplay({ path }: NodePathDisplayProps) {
	return (
		<Card className="bg-muted/50">
			<CardContent className="py-3">
				<p className="text-sm">
					<span className="text-muted-foreground">Path: </span>
					<span className="font-medium">{path.join(' → ')}</span>
				</p>
			</CardContent>
		</Card>
	);
}
