'use client';

import { Loading03Icon, SaveIcon, Square01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { DeckSelector } from '@/components/Flashcards/DeckSelector';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { generateFlashcardsFromAIResponse, validateFlashcards } from '@/lib/flashcard-generator';

interface FlashcardPreview {
	front: string;
	back: string;
	type: string;
}

interface SaveResult {
	flashcards: FlashcardPreview[];
	deck: { id: string; name: string; cardCount: number };
	count: number;
}

interface SaveAsFlashcardButtonProps {
	content: string;
	subject?: string;
	topic?: string;
	className?: string;
	variant?: 'default' | 'ghost' | 'outline';
	size?: 'default' | 'sm' | 'icon';
}

const SUBJECTS = [
	'Mathematics',
	'Physical Sciences',
	'Life Sciences',
	'English',
	'Afrikaans',
	'History',
	'Geography',
	'Accounting',
	'Economics',
	'Business Studies',
	'Consumer Studies',
	'Technical Mathematics',
	'Technical Sciences',
	'Tourism',
	'Information Technology',
	'Other',
];

export function SaveAsFlashcardButton({
	content,
	subject: initialSubject,
	topic: initialTopic,
	className,
	variant = 'ghost',
	size = 'icon',
}: SaveAsFlashcardButtonProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [subject, setSubject] = useState(initialSubject || '');
	const [topic, setTopic] = useState(initialTopic || '');
	const [deckId, setDeckId] = useState<string | null>(null);
	const [deckName, setDeckName] = useState('');
	const [previewCards, setPreviewCards] = useState<FlashcardPreview[]>([]);
	const [result, setResult] = useState<SaveResult | null>(null);
	const [step, setStep] = useState<'configure' | 'preview' | 'result'>('configure');

	const generatePreview = useCallback(() => {
		const raw = generateFlashcardsFromAIResponse(content, subject || 'General', {
			maxCards: 10,
		});
		const validated = validateFlashcards(raw);
		setPreviewCards(validated);
	}, [content, subject]);

	const handleOpen = () => {
		setResult(null);
		setStep('configure');
		generatePreview();
		setIsOpen(true);
	};

	const handleSave = async () => {
		if (!subject.trim()) {
			toast.error('Please select a subject');
			return;
		}

		if (previewCards.length === 0) {
			toast.error('No flashcards could be generated from this content');
			return;
		}

		setIsSaving(true);
		try {
			const response = await fetch('/api/flashcards/from-ai', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					content,
					subject: subject.trim(),
					topic: topic.trim() || 'General',
					deckId: deckId || undefined,
					deckName: deckName.trim() || undefined,
					maxCards: 10,
				}),
			});

			const data = await response.json();

			if (response.ok && data.success) {
				setResult(data);
				setStep('result');
				toast.success(`Created ${data.count} flashcards in "${data.deck.name}"`);
			} else {
				toast.error(data.error || 'Failed to save flashcards');
			}
		} catch (error) {
			console.debug('Failed to save flashcards:', error);
			toast.error('Failed to save flashcards');
		} finally {
			setIsSaving(false);
		}
	};

	const handleClose = () => {
		setIsOpen(false);
		setDeckId(null);
		setDeckName('');
		setResult(null);
	};

	return (
		<>
			<Button
				variant={variant}
				size={size}
				className={className}
				onClick={handleOpen}
				aria-label="Save as flashcards"
				title="Save as flashcards"
			>
				<HugeiconsIcon icon={Square01Icon} className="h-4 w-4" />
			</Button>

			<Dialog open={isOpen} onOpenChange={handleClose}>
				<DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
					{step === 'configure' && (
						<>
							<DialogHeader>
								<DialogTitle>Save as Flashcards</DialogTitle>
								<DialogDescription>
									Extract key concepts from this AI explanation and save them as flashcards.
								</DialogDescription>
							</DialogHeader>

							<div className="space-y-4 py-4">
								<div className="space-y-2">
									<Label htmlFor="subject">Subject</Label>
									<Select value={subject} onValueChange={setSubject}>
										<SelectTrigger id="subject">
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

								<div className="space-y-2">
									<Label htmlFor="topic">Topic</Label>
									<Input
										id="topic"
										placeholder="e.g., Quadratic Equations"
										value={topic}
										onChange={(e) => setTopic(e.target.value)}
										maxLength={500}
									/>
								</div>

								<div className="space-y-2">
									<Label>Deck</Label>
									<DeckSelector
										value={deckId}
										onChange={setDeckId}
										onNewDeck={(deck) => {
											setDeckId(deck.id);
										}}
									/>
								</div>

								{!deckId && (
									<div className="space-y-2">
										<Label htmlFor="deckName">New Deck Name (optional)</Label>
										<Input
											id="deckName"
											placeholder={`${subject || 'Study'} - ${topic || 'Flashcards'}`}
											value={deckName}
											onChange={(e) => setDeckName(e.target.value)}
											maxLength={200}
										/>
									</div>
								)}

								{previewCards.length > 0 && (
									<div className="rounded-lg border bg-muted/30 p-3">
										<p className="text-sm font-medium mb-2">
											Preview ({previewCards.length} cards)
										</p>
										<div className="space-y-2 max-h-32 overflow-y-auto">
											{previewCards.slice(0, 3).map((card, i) => (
												<div key={i} className="text-xs p-2 rounded bg-background border">
													<p className="font-medium truncate">{card.front}</p>
													<p className="text-muted-foreground truncate mt-0.5">{card.back}</p>
												</div>
											))}
											{previewCards.length > 3 && (
												<p className="text-xs text-muted-foreground text-center">
													+{previewCards.length - 3} more cards
												</p>
											)}
										</div>
									</div>
								)}

								{previewCards.length === 0 && (
									<div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
										<p className="text-sm text-destructive">
											Could not extract flashcards from this content. Try a longer or more detailed
											explanation.
										</p>
									</div>
								)}
							</div>

							<DialogFooter>
								<Button variant="outline" onClick={handleClose}>
									Cancel
								</Button>
								<Button
									onClick={handleSave}
									disabled={isSaving || previewCards.length === 0 || !subject.trim()}
								>
									{isSaving ? (
										<HugeiconsIcon icon={Loading03Icon} className="mr-2 h-4 w-4 animate-spin" />
									) : (
										<HugeiconsIcon icon={SaveIcon} className="mr-2 h-4 w-4" />
									)}
									Save {previewCards.length} Flashcards
								</Button>
							</DialogFooter>
						</>
					)}

					{step === 'result' && result && (
						<>
							<DialogHeader>
								<DialogTitle>Flashcards Saved!</DialogTitle>
								<DialogDescription>
									Created {result.count} flashcards in &quot;{result.deck.name}&quot;
								</DialogDescription>
							</DialogHeader>

							<div className="space-y-4 py-4">
								<div className="rounded-lg border bg-green-50 dark:bg-green-950/20 p-4">
									<p className="text-sm font-medium text-green-700 dark:text-green-400">
										Successfully saved {result.count} flashcards!
									</p>
									<p className="text-xs text-muted-foreground mt-1">
										Deck: {result.deck.name} ({result.deck.cardCount + result.count} total cards)
									</p>
								</div>

								<div className="space-y-2">
									<p className="text-sm font-medium">Created cards:</p>
									<div className="space-y-1.5 max-h-40 overflow-y-auto">
										{result.flashcards.map((card, i) => (
											<div key={i} className="text-xs p-2 rounded bg-muted/50 border">
												<p className="font-medium truncate">{card.front}</p>
											</div>
										))}
									</div>
								</div>
							</div>

							<DialogFooter>
								<Button onClick={handleClose}>Done</Button>
								<Button
									variant="outline"
									onClick={() => {
										window.open(`/flashcards?deck=${result.deck.id}`, '_blank');
									}}
								>
									View Deck
								</Button>
							</DialogFooter>
						</>
					)}
				</DialogContent>
			</Dialog>
		</>
	);
}
