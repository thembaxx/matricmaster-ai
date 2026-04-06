'use client';

import { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';

interface QuickFlashcardSaveProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	initialTerm?: string;
	initialDefinition?: string;
	subject?: string;
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

export function QuickFlashcardSave({
	open,
	onOpenChange,
	initialTerm = '',
	initialDefinition = '',
	subject: initialSubject,
}: QuickFlashcardSaveProps) {
	const [isSaving, setIsSaving] = useState(false);
	const [term, setTerm] = useState(initialTerm);
	const [definition, setDefinition] = useState(initialDefinition);
	const [subject, setSubject] = useState(initialSubject || '');
	const [deckId, setDeckId] = useState<string | null>(null);
	const [deckName, setDeckName] = useState('');

	const handleSave = async () => {
		if (!term.trim()) {
			toast.error('Term is required');
			return;
		}

		if (!definition.trim()) {
			toast.error('Definition is required');
			return;
		}

		setIsSaving(true);
		try {
			const response = await fetch(`/api/flashcards/decks/${deckId || 'create'}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: deckName.trim() || `${subject || 'Study'} Flashcards`,
					description: 'Quick-saved flashcard',
				}),
			});

			let targetDeckId = deckId;

			if (!targetDeckId) {
				const data = await response.json();
				if (data.deck?.id) {
					targetDeckId = data.deck.id;
				} else {
					toast.error('Failed to create deck');
					return;
				}
			}

			const cardResponse = await fetch(`/api/flashcards/decks/${targetDeckId}/cards`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					front: term.trim(),
					back: definition.trim(),
					difficulty: 'medium',
				}),
			});

			if (cardResponse.ok) {
				toast.success('Flashcard saved!');
				handleClose();
			} else {
				const errorData = await cardResponse.json();
				toast.error(errorData.error || 'Failed to save flashcard');
			}
		} catch (error) {
			console.debug('Failed to save flashcard:', error);
			toast.error('Failed to save flashcard');
		} finally {
			setIsSaving(false);
		}
	};

	const handleClose = () => {
		setTerm('');
		setDefinition('');
		setSubject(initialSubject || '');
		setDeckId(null);
		setDeckName('');
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[450px]">
				<DialogHeader>
					<DialogTitle>Save as Flashcard</DialogTitle>
					<DialogDescription>
						Save a key concept from this conversation as a flashcard.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<Label htmlFor="term">Term</Label>
						<Input
							id="term"
							placeholder="e.g., Photosynthesis"
							value={term}
							onChange={(e) => setTerm(e.target.value)}
							maxLength={500}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="definition">Definition</Label>
						<Textarea
							id="definition"
							placeholder="The process by which plants..."
							value={definition}
							onChange={(e) => setDefinition(e.target.value)}
							rows={3}
							maxLength={2000}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="subject">Subject</Label>
						<select
							id="subject"
							className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
							value={subject}
							onChange={(e) => setSubject(e.target.value)}
						>
							<option value="">Select subject</option>
							{SUBJECTS.map((s) => (
								<option key={s} value={s}>
									{s}
								</option>
							))}
						</select>
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
							<Label htmlFor="deckName">New Deck Name</Label>
							<Input
								id="deckName"
								placeholder={`${subject || 'Study'} - Flashcards`}
								value={deckName}
								onChange={(e) => setDeckName(e.target.value)}
								maxLength={200}
							/>
						</div>
					)}
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={handleClose}>
						Cancel
					</Button>
					<Button onClick={handleSave} disabled={isSaving || !term.trim() || !definition.trim()}>
						{isSaving ? 'Saving...' : 'Save Flashcard'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
