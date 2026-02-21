'use client';

import { Loader2, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
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

interface CreateDeckModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onCreated: (deck: {
		id: string;
		name: string;
		description: string | null;
		subjectId: number | null;
		cardCount: number;
		isPublic: boolean;
		createdAt: Date;
		updatedAt: Date;
	}) => void;
}

export function CreateDeckModal({ open, onOpenChange, onCreated }: CreateDeckModalProps) {
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [isCreating, setIsCreating] = useState(false);

	const handleCreate = async () => {
		if (!name.trim()) {
			toast.error('Please enter a deck name');
			return;
		}

		setIsCreating(true);
		try {
			const response = await fetch('/api/flashcards/decks', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: name.trim(), description: description.trim() || null }),
			});

			if (response.ok) {
				const data = await response.json();
				toast.success('Deck created!');
				setName('');
				setDescription('');
				onCreated(data.deck);
			} else {
				const error = await response.json();
				toast.error(error.error || 'Failed to create deck');
			}
		} catch (error) {
			console.error('Failed to create deck:', error);
			toast.error('Failed to create deck');
		} finally {
			setIsCreating(false);
		}
	};

	const handleClose = () => {
		setName('');
		setDescription('');
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create New Deck</DialogTitle>
					<DialogDescription>
						Create a new flashcard deck to organize your study materials.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<Label htmlFor="name">Deck Name</Label>
						<Input
							id="name"
							placeholder="e.g., Mathematics Formulas"
							value={name}
							onChange={(e) => setName(e.target.value)}
							maxLength={200}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="description">Description (optional)</Label>
						<Textarea
							id="description"
							placeholder="What topics does this deck cover?"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							rows={3}
						/>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={handleClose}>
						Cancel
					</Button>
					<Button onClick={handleCreate} disabled={isCreating || !name.trim()}>
						{isCreating ? (
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						) : (
							<Plus className="mr-2 h-4 w-4" />
						)}
						Create Deck
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
