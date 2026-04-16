'use client';

import { QuestionIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';

interface AIQuestionPopupProps {
	paperId: string;
	questionText?: string;
	subject: string;
	paper: string;
	year: number;
	month: string;
	children?: React.ReactNode;
	className?: string;
}

interface AIResponse {
	answer: string;
	followUp?: string[];
}

export function AIQuestionPopup({
	paperId,
	questionText,
	subject,
	paper,
	year,
	month,
	children,
	className,
}: AIQuestionPopupProps) {
	const [question, setQuestion] = useState('');
	const [isOpen, setIsOpen] = useState(false);

	const askQuestion = useMutation({
		mutationFn: async (q: string) => {
			const response = await fetch('/api/ai-tutor', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					messages: [
						{
							role: 'user',
							content: `You are an expert ${subject} tutor. The user is asking about ${subject} ${paper} (${month} ${year}). ${
								questionText ? `Question context: ${questionText}` : ''
							}\n\nUser question: ${q}\n\nProvide a clear, step-by-step explanation suitable for NSC Grade 12 students.`,
						},
					],
					context: {
						type: 'pastPaper',
						paperId,
						subject,
						year,
						month,
					},
				}),
			});
			if (!response.ok) throw new Error('Failed to get answer');
			return response.json() as Promise<AIResponse>;
		},
	});

	const handleAsk = async () => {
		if (!question.trim()) return;
		setQuestion('');
		await askQuestion.mutateAsync(question);
	};

	const handleClose = () => {
		setIsOpen(false);
		setQuestion('');
		askQuestion.reset();
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild className={className}>
				{children || (
					<Button variant="outline" size="sm" className="gap-2 bg-background/80 backdrop-blur-sm">
						<HugeiconsIcon icon={QuestionIcon} className="w-4 h-4" />
						Ask AI
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="sm:max-w-[600px] max-h-[80vh] gap-0 p-0 overflow-hidden">
				<DialogHeader className="p-4 pb-2 space-y-1">
					<DialogTitle className="text-lg flex items-center gap-2">
						<HugeiconsIcon icon={QuestionIcon} className="w-5 h-5 text-primary" />
						Ask about this paper
					</DialogTitle>
					<p className="text-sm text-muted-foreground">
						{subject} {paper} • {month} {year}
					</p>
				</DialogHeader>

				<ScrollArea className="max-h-[50vh] px-4">
					{questionText && (
						<div className="mb-4 p-3 bg-muted/50 rounded-lg">
							<p className="text-xs text-muted-foreground mb-1">Question context:</p>
							<p className="text-sm line-clamp-2">{questionText}</p>
						</div>
					)}

					{askQuestion.isSuccess && (
						<div className="mb-4 space-y-3">
							<div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
								<p className="text-sm whitespace-pre-wrap">{askQuestion.data.answer}</p>
							</div>
							{askQuestion.data.followUp && askQuestion.data.followUp.length > 0 && (
								<div className="space-y-2">
									<p className="text-xs text-muted-foreground">Follow-up questions:</p>
									<div className="flex flex-wrap gap-2">
										{askQuestion.data.followUp.map((followUp, i) => (
											<Button
												key={i}
												variant="outline"
												size="sm"
												className="text-xs h-auto py-1 px-2"
												onClick={() => setQuestion(followUp)}
											>
												{followUp}
											</Button>
										))}
									</div>
								</div>
							)}
						</div>
					)}
				</ScrollArea>

				{askQuestion.isPending && (
					<div className="px-4 py-3 border-t">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<HugeiconsIcon icon={QuestionIcon} className="w-4 h-4 animate-spin" />
							Thinking...
						</div>
					</div>
				)}

				{askQuestion.isError && (
					<div className="px-4 py-3 border-t">
						<p className="text-sm text-destructive">Failed to get answer. Please try again.</p>
					</div>
				)}

				<div className="p-4 border-t space-y-3">
					<Textarea
						placeholder="Type your question about this paper..."
						value={question}
						onChange={(e) => setQuestion(e.target.value)}
						className="min-h-[80px] resize-none"
						disabled={askQuestion.isPending}
					/>
					<div className="flex justify-end gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={handleClose}
							disabled={askQuestion.isPending}
						>
							Close
						</Button>
						<Button
							size="sm"
							onClick={handleAsk}
							disabled={!question.trim() || askQuestion.isPending}
						>
							Ask
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
