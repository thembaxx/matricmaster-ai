'use client';

import { Loading03Icon, SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { SUBJECTS } from './constants';

interface EssayInputFormProps {
	topic: string;
	setTopic: (topic: string) => void;
	subject: string;
	setSubject: (subject: string) => void;
	essay: string;
	setEssay: (essay: string) => void;
	wordCount: number;
	isGrading: boolean;
	onSubmit: () => void;
}

export function EssayInputForm({
	topic,
	setTopic,
	subject,
	setSubject,
	essay,
	setEssay,
	wordCount,
	isGrading,
	onSubmit,
}: EssayInputFormProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Write Your Essay</CardTitle>
				<CardDescription>Practice makes perfect! Write about the topic below.</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div>
					<label htmlFor="essay-topic" className="text-sm font-medium">
						Topic / Question
					</label>
					<Input
						id="essay-topic"
						placeholder="e.g., Discuss the impact of climate change on South Africa"
						value={topic}
						onChange={(e) => setTopic(e.target.value)}
						className="mt-1"
					/>
				</div>

				<div>
					<label htmlFor="essay-subject" className="text-sm font-medium">
						Subject (Optional)
					</label>
					<Select value={subject} onValueChange={setSubject}>
						<SelectTrigger id="essay-subject" className="mt-1">
							<SelectValue placeholder="Select subject" />
						</SelectTrigger>
						<SelectContent>
							{SUBJECTS.map((s) => (
								<SelectItem key={s} value={s}>
									{s}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div>
					<div className="flex justify-between items-center mb-1">
						<label htmlFor="essay-content" className="text-sm font-medium">
							Your Essay
						</label>
						<Badge variant="outline">{wordCount} words</Badge>
					</div>
					<Textarea
						id="essay-content"
						placeholder="Start writing your essay here..."
						value={essay}
						onChange={(e) => setEssay(e.target.value)}
						className="min-h-[300px] resize-none focus:ring-2 focus:ring-primary"
					/>
				</div>

				<Button className="w-full" onClick={onSubmit} disabled={isGrading || wordCount < 100}>
					{isGrading ? (
						<>
							<HugeiconsIcon icon={Loading03Icon} className="w-4 h-4 mr-2 animate-spin" />
							Grading your essay...
						</>
					) : (
						<>
							<HugeiconsIcon icon={SparklesIcon} className="w-4 h-4 mr-2" />
							Grade My Essay
						</>
					)}
				</Button>
			</CardContent>
		</Card>
	);
}
