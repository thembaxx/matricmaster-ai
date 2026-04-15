'use client';

import { Loading03Icon, MagicWand01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useState } from 'react';
import { toast } from 'sonner';
import type { FlashcardDeck } from '@/components/Flashcards/constants';
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

interface GenerateFlashcardsFromPastPaperProps {
	paperId: string;
	paperTitle: string;
	subject: string;
	year: number;
	month: string;
	onGenerated?: (deck: FlashcardDeck) => void;
}

export function GenerateFlashcardsFromPastPaper({
	paperId,
	paperTitle,
	subject,
	year,
	month,
	onGenerated,
}: GenerateFlashcardsFromPastPaperProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [isGenerating, setIsGenerating] = useState(false);
	const [maxCards, setMaxCards] = useState(10);
	const [deckName, setDeckName] = useState('');

	const handleGenerate = async () => {
		setIsGenerating(true);
		try {
			const response = await fetch('/api/flashcards/from-past-paper', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					paperId,
					maxCards,
					deckName: deckName.trim() || undefined,
				}),
			});

			const data = await response.json();

			if (!response.ok || !data.success) {
				throw new Error(data.error || 'Failed to generate flashcards');
			}

			toast.success(`Created ${data.count} flashcards!`);
			setIsOpen(false);

			if (onGenerated && data.deck) {
				onGenerated({
					id: data.deck.id,
					name: data.deck.name,
					description: null,
					cardCount: data.deck.cardCount + data.count,
					subjectId: null,
					isPublic: false,
					createdAt: new Date(),
					updatedAt: new Date(),
				});
			}
		} catch (error) {
			console.error('Failed to generate flashcards:', error);
			toast.error('Could not generate flashcards from this paper');
		} finally {
			setIsGenerating(false);
		}
	};

	return (
		<>
			<Button
				variant="outline"
				className="w-full rounded-2xl font-black text-[10px] tracking-widest h-12 border border-border"
				onClick={() => setIsOpen(true)}
			>
				<HugeiconsIcon icon={MagicWand01Icon} className="w-4 h-4 mr-2" />
				Generate Flashcards
			</Button>

			<Dialog open={isOpen} onOpenChange={setIsOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Generate Flashcards</DialogTitle>
						<DialogDescription>
							Create flashcards from {paperTitle} ({month} {year})
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="deckName">Deck Name (optional)</Label>
							<Input
								id="deckName"
								placeholder={`${subject} - ${month} ${year}`}
								value={deckName}
								onChange={(e) => setDeckName(e.target.value)}
								maxLength={200}
							/>
							<p className="text-xs text-muted-foreground">Leave empty to use default naming</p>
						</div>

						<div className="space-y-2">
							<Label htmlFor="maxCards">Maximum cards</Label>
							<Input
								id="maxCards"
								type="number"
								min={1}
								max={20}
								value={maxCards}
								onChange={(e) => setMaxCards(Number.parseInt(e.target.value, 10) || 10)}
							/>
							<p className="text-xs text-muted-foreground">
								How many flashcards to generate (1-20)
							</p>
						</div>
					</div>

					<DialogFooter>
						<Button variant="outline" onClick={() => setIsOpen(false)}>
							Cancel
						</Button>
						<Button onClick={handleGenerate} disabled={isGenerating}>
							{isGenerating ? (
								<>
									<HugeiconsIcon icon={Loading03Icon} className="mr-2 h-4 w-4 animate-spin" />
									Generating...
								</>
							) : (
								<>
									<HugeiconsIcon icon={MagicWand01Icon} className="mr-2 h-4 w-4" />
									Generate
								</>
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
