'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useSettings } from '@/contexts/SettingsContext';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import type { Citation } from '@/lib/ai/citations';
import { authClient } from '@/lib/auth-client';
import { saveConversationAction } from '@/lib/db/ai-tutor-actions';
import type { AiConversation } from '@/lib/db/schema';
import { generateFollowUpQuizFromConversationAction } from '@/services/aiActions';
import { useAiContextStore } from '@/stores/useAiContextStore';

export interface Message {
	id: string;
	role: 'user' | 'assistant';
	content: string;
	timestamp: Date;
	suggestions?: string[];
	citations?: Citation[];
	conceptTags?: string[];
}

export interface PracticeProblem {
	id: string;
	question: string;
	type: 'multiple-choice' | 'short-answer' | 'step-by-step';
	options?: string[];
	answer: string;
	explanation: string;
}

export interface Flashcard {
	id: string;
	front: string;
	back: string;
	tags: string[];
}

export function useAiTutor() {
	const { data: session, isPending: isSessionLoading } = authClient.useSession();
	const { aiLanguage } = useSettings();
	const getRecentStruggles = useAiContextStore((s) => s.getRecentStruggles);
	const struggles = getRecentStruggles();

	const generateProactiveGreeting = useMemo(() => {
		if (struggles.length === 0) {
			return "Hey! I'm your Study Buddy. I can help you understand any NSC topic, answer exam questions, or explain tricky concepts. What do you need help with today?";
		}

		const recentStruggle = struggles[0];
		const subjectName = recentStruggle.subject || 'this topic';
		const topicName = recentStruggle.topic || 'the concept';

		const greetings = [
			`I noticed you struggled with ${topicName} in your recent ${recentStruggle.type}. Want to do a quick 3-minute drill on that before we move on?`,
			`I saw you had some trouble with ${topicName} (${subjectName}). Want to tackle this together?`,
			`Let's work on ${topicName} - I know that one can be tricky! Shall we start with a quick review?`,
		];

		return greetings[Math.floor(Math.random() * greetings.length)];
	}, [struggles]);

	const [messages, setMessages] = useState<Message[]>([
		{
			id: '1',
			role: 'assistant',
			content: generateProactiveGreeting,
			timestamp: new Date(),
		},
	]);
	const [input, setInput] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
	const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
	const [isGeneratingPractice, setIsGeneratingPractice] = useState(false);
	const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
	const [practiceProblems, setPracticeProblems] = useState<PracticeProblem[]>([]);
	const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
	const [showPracticeModal, setShowPracticeModal] = useState(false);
	const [showFlashcardModal, setShowFlashcardModal] = useState(false);
	const [showSources, setShowSources] = useState(true);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const {
		isListening,
		isSupported: voiceSupported,
		startListening,
		stopListening,
	} = useVoiceInput({
		onTranscript: (transcript) => {
			setInput(transcript);
		},
		onError: (error) => {
			toast.error(`Voice input error: ${error}`);
		},
		lang: 'en-ZA',
	});

	const handleToggleSources = useCallback(() => {
		setShowSources((prev) => !prev);
	}, []);

	const scrollToBottom = useCallback(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, []);

	const handleSend = async (messageText?: string, contextOverride?: string) => {
		const textToSend = messageText || input;
		if (!textToSend.trim() || isLoading) return;

		const finalMessage = contextOverride ? `${contextOverride}\n\n${textToSend}` : textToSend;

		const userMessage: Message = {
			id: Date.now().toString(),
			role: 'user',
			content: finalMessage,
			timestamp: new Date(),
		};

		setMessages((prev) => [...prev, userMessage]);
		scrollToBottom();
		setInput('');
		setIsLoading(true);

		try {
			const response = await fetch('/api/ai-tutor', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					message: finalMessage,
					subject: selectedSubject,
					history: messages.map((m) => ({ role: m.role, content: m.content })),
					includeSuggestions: true,
					language: aiLanguage,
				}),
			});

			const data = await response.json();

			const assistantMessage: Message = {
				id: (Date.now() + 1).toString(),
				role: 'assistant',
				content: data.response || 'I apologize, but I encountered an error. Please try again.',
				timestamp: new Date(),
				suggestions: data.suggestions || [],
				citations: data.citations || [],
			};

			setMessages((prev) => [...prev, assistantMessage]);
			scrollToBottom();
		} catch (error) {
			console.error('AI tutor error:', error);
			const errorMessage: Message = {
				id: (Date.now() + 1).toString(),
				role: 'assistant',
				content: 'I apologize, but I encountered an error. Please try again.',
				timestamp: new Date(),
			};
			setMessages((prev) => [...prev, errorMessage]);
			scrollToBottom();
		} finally {
			setIsLoading(false);
		}
	};

	const handleVoiceInput = useCallback(() => {
		if (isListening) {
			stopListening();
		} else {
			startListening();
			toast.info('Listening... Speak your question');
		}
	}, [isListening, startListening, stopListening]);

	const handleGenerateQuizFromConversation = useCallback(async () => {
		if (messages.length <= 1) {
			toast.info('Have a conversation first to generate a quiz');
			return;
		}

		try {
			const result = await generateFollowUpQuizFromConversationAction(
				messages.map((m) => ({ role: m.role, content: m.content })),
				selectedSubject ?? undefined
			);

			if (result.success && result.questions) {
				toast.success(`Generated ${result.questions.length} quiz questions from our conversation!`);
				// Here you could navigate to a quiz page or show the questions
			} else {
				toast.error(result.error || 'Failed to generate quiz');
			}
		} catch (error) {
			console.error('Quiz generation failed:', error);
			toast.error('Failed to generate quiz from conversation');
		}
	}, [messages, selectedSubject]);

	const handleSave = async () => {
		if (!session?.user?.id) {
			toast.error('You must be logged in to save conversations');
			return;
		}

		if (messages.length <= 1) {
			toast.info('Start a conversation first');
			return;
		}

		const firstUserMessage = messages.find((m) => m.role === 'user');
		const title = firstUserMessage
			? `${firstUserMessage.content.slice(0, 50)}...`
			: 'Untitled Conversation';

		const result = await saveConversationAction(
			session.user.id,
			title,
			messages.map((m) => ({
				role: m.role,
				content: m.content,
				timestamp: m.timestamp,
			})),
			selectedSubject ?? undefined
		);

		if (result.success) {
			toast.success('Conversation saved');
			if (result.conversationId) {
				setCurrentConversationId(result.conversationId);
			}

			const quizResult = await generateFollowUpQuizFromConversationAction(
				messages.map((m) => ({ role: m.role, content: m.content })),
				selectedSubject ?? undefined
			);
			if (quizResult.success && quizResult.questions && quizResult.questions.length > 0) {
				toast.info('Created follow-up quiz from conversation');
			}
		} else {
			toast.error(result.error || 'Failed to save');
		}
	};

	const handleGeneratePractice = async () => {
		if (messages.length <= 1) {
			toast.info('Have a conversation first to generate practice problems');
			return;
		}

		setIsGeneratingPractice(true);
		try {
			const recentMessages = messages.slice(-6);
			const context = recentMessages.map((m) => `${m.role}: ${m.content}`).join('\n\n');

			const response = await fetch('/api/ai-tutor/practice', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					context,
					subject: selectedSubject,
					difficulty: 'medium',
					count: 3,
				}),
			});

			const data = await response.json();
			if (data.problems) {
				setPracticeProblems(data.problems);
				setShowPracticeModal(true);
				toast.success(`Generated ${data.problems.length} practice problems!`);
			}
		} catch (error) {
			console.error('Failed to generate practice problems:', error);
			toast.error('Failed to generate practice problems');
		} finally {
			setIsGeneratingPractice(false);
		}
	};

	const handleGenerateFlashcards = async () => {
		if (messages.length <= 1) {
			toast.info('Have a conversation first to generate flashcards');
			return;
		}

		setIsGeneratingFlashcards(true);
		try {
			const recentMessages = messages.slice(-6);
			const context = recentMessages.map((m) => `${m.role}: ${m.content}`).join('\n\n');

			const response = await fetch('/api/ai-tutor/flashcards', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					context,
					subject: selectedSubject,
					count: 5,
				}),
			});

			const data = await response.json();
			if (data.flashcards) {
				setFlashcards(data.flashcards);
				setShowFlashcardModal(true);
				toast.success(`Generated ${data.flashcards.length} flashcards!`);
			}
		} catch (error) {
			console.error('Failed to generate flashcards:', error);
			toast.error('Failed to generate flashcards');
		} finally {
			setIsGeneratingFlashcards(false);
		}
	};

	const handleLoadConversation = (conversation: AiConversation) => {
		try {
			const parsedMessages = JSON.parse(conversation.messages);
			const loadedMessages: Message[] = parsedMessages.map(
				(m: { role: string; content: string; timestamp: string }, index: number) => ({
					id: `loaded-${index}`,
					role: m.role as 'user' | 'assistant',
					content: m.content,
					timestamp: new Date(m.timestamp),
				})
			);
			setMessages(loadedMessages);
			setCurrentConversationId(conversation.id);
			setSelectedSubject(conversation.subject || null);
		} catch (error) {
			console.error('Failed to load conversation:', error);
			toast.error('Failed to load conversation');
		}
	};

	const handleNewConversation = () => {
		setMessages([
			{
				id: '1',
				role: 'assistant',
				content: generateProactiveGreeting,
				timestamp: new Date(),
			},
		]);
		setCurrentConversationId(null);
		setSelectedSubject(null);
		setPracticeProblems([]);
		setFlashcards([]);
	};

	useEffect(() => {
		if (messages.length > 0) {
			scrollToBottom();
		}
	}, [messages, scrollToBottom]);

	return {
		session,
		isSessionLoading,
		messages,
		input,
		setInput,
		isLoading,
		selectedSubject,
		setSelectedSubject,
		currentConversationId,
		isGeneratingPractice,
		isGeneratingFlashcards,
		practiceProblems,
		flashcards,
		showPracticeModal,
		setShowPracticeModal,
		showFlashcardModal,
		setShowFlashcardModal,
		showSources,
		messagesEndRef,
		handleSend,
		handleSave,
		handleGeneratePractice,
		handleGenerateFlashcards,
		handleLoadConversation,
		handleNewConversation,
		handleToggleSources,
		handleVoiceInput,
		handleGenerateQuizFromConversation,
		isListening,
		voiceSupported,
	};
}
