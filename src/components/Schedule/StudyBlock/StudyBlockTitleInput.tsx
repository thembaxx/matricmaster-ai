'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface StudyBlockTitleInputProps {
	id: string;
	value: string;
	onChange: (value: string) => void;
}

export function StudyBlockTitleInput({ id, value, onChange }: StudyBlockTitleInputProps) {
	return (
		<div className="flex flex-col gap-2.5">
			<Label htmlFor={id} className="text-xs font-bold tracking-wider text-muted-foreground ml-1">
				Title
			</Label>
			<Input
				id={id}
				placeholder="e.g., Mathematics Study"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className="h-12 rounded-xl"
				required
			/>
		</div>
	);
}
