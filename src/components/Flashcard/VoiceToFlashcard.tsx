'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import { FileText, Mic, MicOff, Wand2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useGeminiQuotaModal } from '@/contexts/GeminiQuotaModalContext';
import { isQuotaError } from '@/lib/ai/quota-error';
import {
	generateFlashcardsFromVoice,
	generateNotesFromConversation,
} from '@/services/learningLoopEngine';

interface VoiceToFlashcardProps {
	subject?: string;
	onFlashcardsGenerated?: (cards: Array<{ front: string; back: string }>) => void;
}

export function VoiceToFlashcard({ subject, onFlashcardsGenerated }: VoiceToFlashcardProps) {
	const { triggerQuotaError } = useGeminiQuotaModal();
	const [isRecording, setIsRecording] = useState(false);
	const [transcript, setTranscript] = useState('');
	const [processing, setProcessing] = useState(false);
	const [mode, setMode] = useState<'flashcard' | 'notes'>('flashcard');

	const recognitionRef = useRef<any>(null);

	const startRecording = () => {
		const SpeechRecognition =
			(window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
		if (!SpeechRecognition) {
			toast.error('Speech recognition not supported');
			return;
		}

		const recognition = new SpeechRecognition();
		recognition.continuous = true;
		recognition.interimResults = true;

		recognition.onresult = (event: any) => {
			const transcriptText = Array.from(event.results)
				.map((result: any) => result[0].transcript)
				.join('');
			setTranscript(transcriptText);
		};

		recognition.onerror = (event: any) => {
			console.debug('Speech recognition error:', event.error);
			setIsRecording(false);
		};

		recognition.onend = () => {
			setIsRecording(false);
		};

		recognition.start();
		recognitionRef.current = recognition;
		setIsRecording(true);
	};

	const stopRecording = () => {
		if (recognitionRef.current) {
			recognitionRef.current.stop();
			setIsRecording(false);
		}
	};

	const processVoice = async () => {
		if (!transcript.trim()) {
			toast.error('No speech recorded');
			return;
		}

		setProcessing(true);

		try {
			if (mode === 'flashcard') {
				const cards = await generateFlashcardsFromVoice(transcript, subject);
				onFlashcardsGenerated?.(cards);
				toast.success(`Generated ${cards.length} flashcards!`);
			} else {
				await generateNotesFromConversation(transcript, subject);
				toast.success('Notes generated!');
			}

			setTranscript('');
		} catch (error) {
			if (isQuotaError(error)) {
				triggerQuotaError();
			}
			console.debug('Processing error:', error);
			toast.error('Failed to process voice');
		} finally {
			setProcessing(false);
		}
	};

	return (
		<Card className="p-4 space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="font-semibold">Voice to Knowledge</h3>
				<div className="flex gap-2">
					<Button
						variant={mode === 'flashcard' ? 'default' : 'outline'}
						size="sm"
						onClick={() => setMode('flashcard')}
					>
						<Wand2 className="w-4 h-4 mr-1" />
						Flashcards
					</Button>
					<Button
						variant={mode === 'notes' ? 'default' : 'outline'}
						size="sm"
						onClick={() => setMode('notes')}
					>
						<FileText className="w-4 h-4 mr-1" />
						Notes
					</Button>
				</div>
			</div>

			<div className="space-y-2">
				<Button
					onClick={isRecording ? stopRecording : startRecording}
					className={`w-full ${isRecording ? 'bg-red-500 hover:bg-red-600' : ''}`}
				>
					{isRecording ? (
						<>
							<MicOff className="w-4 h-4 mr-2" />
							Stop Recording
						</>
					) : (
						<>
							<Mic className="w-4 h-4 mr-2" />
							Start Recording
						</>
					)}
				</Button>

				{transcript && (
					<div className="p-3 bg-secondary rounded-lg">
						<p className="text-sm text-muted-foreground">{transcript}</p>
					</div>
				)}
			</div>

			{transcript && (
				<Button onClick={processVoice} disabled={processing} className="w-full">
					{processing
						? 'Processing...'
						: `Generate ${mode === 'flashcard' ? 'Flashcards' : 'Notes'}`}
				</Button>
			)}
		</Card>
	);
}
