/**
 * Utility for generating flashcard data from AI tutor responses.
 * Uses simple text parsing to extract key concepts, definitions, and formulas.
 */

export interface FlashcardData {
	front: string;
	back: string;
	type: 'definition' | 'qa' | 'formula' | 'concept';
}

interface ParseOptions {
	maxCards?: number;
	subject?: string;
}

/**
 * Generate flashcards from AI tutor response content.
 * Extracts key concepts, definitions, formulas, and creates Q&A style flashcards.
 */
export function generateFlashcardsFromAIResponse(
	content: string,
	_subject: string,
	options: ParseOptions = {}
): FlashcardData[] {
	const { maxCards = 10 } = options;
	const flashcards: FlashcardData[] = [];

	// Clean the content
	const cleanContent = content
		.replace(/\[DIAGRAM:[^\]]+\]/g, '')
		.replace(/\$([^$]+)\$/g, (_, formula) => formula)
		.trim();

	// Extract definition-style flashcards (X is/means/refers to Y patterns)
	const definitionPatterns = [
		/\*\*([^*]+)\*\*\s*(?:is|are|means?|refers? to|describes?|represents?)\s+(?:the\s+)?([^.!?]+[.!?])/gi,
		/([A-Z][a-z]+(?:\s+[a-z]+)*)\s*(?:is|are)\s+(?:the\s+)?([^.!?]+[.!?])/gi,
	];

	for (const pattern of definitionPatterns) {
		const matches = cleanContent.matchAll(pattern);
		for (const match of matches) {
			if (flashcards.length >= maxCards) break;
			const term = match[1]?.trim();
			const definition = match[2]?.trim();
			if (term && definition && term.length > 2 && definition.length > 10) {
				// Avoid duplicates
				const isDuplicate = flashcards.some((c) =>
					c.front.toLowerCase().includes(term.toLowerCase())
				);
				if (!isDuplicate) {
					flashcards.push({
						front: `What is ${term}?`,
						back: `${term} is ${definition}`,
						type: 'definition',
					});
				}
			}
		}
	}

	// Extract formula flashcards
	const formulaPatterns = [
		/\*\*([^*]+)\*\*\s*:\s*([^\n]+)/gi,
		/([A-Za-z\s]+(?:formula|equation|law|rule))\s*:\s*([^\n]+)/gi,
		/\$([^$]+)\$/g,
	];

	for (const pattern of formulaPatterns) {
		const matches = cleanContent.matchAll(pattern);
		for (const match of matches) {
			if (flashcards.length >= maxCards) break;
			const name = match[1]?.trim();
			const formula = match[2]?.trim();
			if (name && formula && formula.length > 2) {
				const isDuplicate = flashcards.some((c) =>
					c.front.toLowerCase().includes(name.toLowerCase())
				);
				if (!isDuplicate) {
					flashcards.push({
						front: `What is the formula for ${name}?`,
						back: formula,
						type: 'formula',
					});
				}
			}
		}
	}

	// Extract key concept flashcards from bullet points
	const bulletPointPattern = /[•\-*]\s+\*\*([^*]+)\*\*[:\s]+([^\n]+)/g;
	const bulletMatches = cleanContent.matchAll(bulletPointPattern);
	for (const match of bulletMatches) {
		if (flashcards.length >= maxCards) break;
		const concept = match[1]?.trim();
		const detail = match[2]?.trim();
		if (concept && detail && concept.length > 2 && detail.length > 10) {
			const isDuplicate = flashcards.some((c) =>
				c.front.toLowerCase().includes(concept.toLowerCase())
			);
			if (!isDuplicate) {
				flashcards.push({
					front: `Explain ${concept}`,
					back: detail,
					type: 'concept',
				});
			}
		}
	}

	// Extract Q&A from sections with headings
	const sectionPattern = /##\s+([^\n]+)\n+([^\n#]+)/g;
	const sectionMatches = cleanContent.matchAll(sectionPattern);
	for (const match of sectionMatches) {
		if (flashcards.length >= maxCards) break;
		const heading = match[1]?.trim();
		const body = match[2]?.trim();
		if (heading && body && heading.length > 3 && body.length > 20) {
			const isDuplicate = flashcards.some((c) =>
				c.front.toLowerCase().includes(heading.toLowerCase())
			);
			if (!isDuplicate) {
				flashcards.push({
					front: `What is ${heading}?`,
					back: body,
					type: 'qa',
				});
			}
		}
	}

	// Extract numbered step patterns
	const stepPattern = /(?:Step\s+)?(\d+)[:.)]\s+([^\n]+)/g;
	const stepMatches = cleanContent.matchAll(stepPattern);
	const steps: { step: number; text: string }[] = [];
	for (const match of stepMatches) {
		const stepNum = Number.parseInt(match[1], 10);
		const stepText = match[2]?.trim();
		if (!Number.isNaN(stepNum) && stepText && stepText.length > 10) {
			steps.push({ step: stepNum, text: stepText });
		}
	}

	if (steps.length >= 2 && flashcards.length < maxCards) {
		const stepsSummary = steps.map((s) => `${s.step}. ${s.text}`).join('\n');
		const firstStep = steps[0].text;
		const isDuplicate = flashcards.some((c) => c.front.toLowerCase().includes('steps'));
		if (!isDuplicate) {
			flashcards.push({
				front: `What are the steps involved? (Starts with: ${firstStep.slice(0, 50)}...)`,
				back: stepsSummary,
				type: 'qa',
			});
		}
	}

	// Generate fallback cards from sentences if we have too few
	if (flashcards.length < 3) {
		const sentencePattern = /([^.!?]+[.!?])/g;
		const sentences = cleanContent.match(sentencePattern) || [];
		const significantSentences = sentences.filter(
			(s) => s.trim().length > 40 && s.trim().length < 300
		);

		for (const sentence of significantSentences) {
			if (flashcards.length >= Math.min(maxCards, 5)) break;
			const trimmed = sentence.trim();
			const keyTerm = extractKeyTerm(trimmed);
			if (keyTerm) {
				const isDuplicate = flashcards.some((c) =>
					c.back.toLowerCase().includes(trimmed.toLowerCase().slice(0, 50))
				);
				if (!isDuplicate) {
					flashcards.push({
						front: `What can you tell me about ${keyTerm}?`,
						back: trimmed,
						type: 'concept',
					});
				}
			}
		}
	}

	return flashcards.slice(0, maxCards);
}

/**
 * Extract a key term from a sentence for flashcard generation.
 */
function extractKeyTerm(sentence: string): string | null {
	// Look for bold text first
	const boldMatch = sentence.match(/\*\*([^*]+)\*\*/);
	if (boldMatch) return boldMatch[1].trim();

	// Look for capitalized terms (but skip sentence starters)
	const words = sentence.trim().split(/\s+/);
	for (let i = 1; i < Math.min(words.length, 5); i++) {
		const word = words[i]?.replace(/[^a-zA-Z]/g, '');
		if (word && word.length > 3 && /^[A-Z]/.test(word)) {
			return word;
		}
	}

	// Extract noun phrases (simplified)
	const nounPhraseMatch = sentence.match(/(?:the|a|an)\s+([a-z]+\s+[a-z]+)/i);
	if (nounPhraseMatch) return nounPhraseMatch[1].trim();

	return null;
}

/**
 * Validate flashcard data before saving.
 */
export function validateFlashcard(card: FlashcardData): boolean {
	return (
		card.front.trim().length >= 3 &&
		card.back.trim().length >= 5 &&
		card.front.trim().length <= 500 &&
		card.back.trim().length <= 2000
	);
}

/**
 * Filter and validate an array of flashcard data.
 */
export function validateFlashcards(cards: FlashcardData[]): FlashcardData[] {
	return cards.filter(validateFlashcard);
}
