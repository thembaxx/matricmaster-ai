import { type NextRequest, NextResponse } from 'next/server';
import { generateTextWithAI } from '@/lib/ai/provider';

interface TopicGap {
	topic: string;
	subject: string;
}

export async function POST(request: NextRequest) {
	try {
		const { topics } = (await request.json()) as { topics: TopicGap[] };

		if (!topics || topics.length === 0) {
			return NextResponse.json({ success: false, error: 'No topics provided' }, { status: 400 });
		}

		const topicList = topics.map((t) => `- ${t.topic} (${t.subject})`).join('\n');

		const prompt = `You are a South African NSC Grade 12 study assistant. Generate 5 flashcards for the following topics that the student is struggling with:

${topicList}

For each flashcard, provide:
1. Front: A clear question or key term
2. Back: The answer or explanation

Follow NSC/CAPS curriculum guidelines. Use South African examples where appropriate.

Respond in JSON format:
{
  "flashcards": [
    { "front": "...", "back": "..." },
    ...
  ]
}`;

		const result = await generateTextWithAI({
			prompt,
			system:
				'You are an expert NSC Grade 12 tutor. Generate educational flashcards following CAPS curriculum guidelines.',
		});

		let flashcards: { front: string; back: string }[] = [];

		try {
			const parsed = JSON.parse(result);
			flashcards = parsed.flashcards || [];
		} catch {
			const match = result.match(/\[[\s\S]*\]/);
			if (match) {
				try {
					flashcards = JSON.parse(match[0]);
				} catch {
					flashcards = result
						.split('\n\n')
						.filter(Boolean)
						.map((card) => ({
							front: card.split('\n')[0] || 'Question',
							back: card.split('\n').slice(1).join('\n') || 'Answer',
						}));
				}
			}
		}

		const savedCards = [];
		for (const card of flashcards.slice(0, 5)) {
			try {
				const response = await fetch('/api/flashcards/decks/default/cards', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						front: card.front,
						back: card.back,
						difficulty: 'medium',
					}),
				});

				if (response.ok) {
					savedCards.push(card);
				}
			} catch (error) {
				console.debug('Failed to save flashcard:', error);
			}
		}

		return NextResponse.json({
			success: true,
			cardsCreated: savedCards.length,
			flashcards: savedCards,
		});
	} catch (error) {
		console.debug('Failed to generate flashcards:', error);
		return NextResponse.json({ success: false, error: 'Generation failed' }, { status: 500 });
	}
}
