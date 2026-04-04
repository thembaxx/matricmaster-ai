'use client';

import { Check, Edit2, FileImage, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useOCR } from '@/hooks/useOCR';
import type { ParsedQuestion } from '@/services/ocrService';

interface ScannedUploadProps {
	onQuestionsExtracted?: (questions: ParsedQuestion[]) => void;
	onCancel?: () => void;
}

export function ScannedUpload({ onQuestionsExtracted, onCancel }: ScannedUploadProps) {
	const [isDragging, setIsDragging] = useState(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [editingQuestions, setEditingQuestions] = useState<ParsedQuestion[] | null>(null);
	const [showEditMode, setShowEditMode] = useState(false);

	const {
		isProcessing,
		progress,
		extractedText,
		parsedQuestions,
		error,
		processImage,
		processPDF,
		reset,
	} = useOCR();

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	}, []);

	const handleDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
	}, []);

	const handleFile = useCallback(
		async (file: File) => {
			setSelectedFile(file);
			setPreviewUrl(URL.createObjectURL(file));
			setEditingQuestions(null);
			setShowEditMode(false);

			if (file.type === 'application/pdf') {
				await processPDF(file);
			} else if (file.type.startsWith('image/')) {
				await processImage(file);
			}
		},
		[processPDF, processImage]
	);

	const handleDrop = useCallback(
		async (e: React.DragEvent) => {
			e.preventDefault();
			setIsDragging(false);

			const files = e.dataTransfer.files;
			if (files.length > 0) {
				handleFile(files[0]);
			}
		},
		[handleFile]
	);

	const handleFileSelect = useCallback(
		async (e: React.ChangeEvent<HTMLInputElement>) => {
			const files = e.target.files;
			if (files && files.length > 0) {
				handleFile(files[0]);
			}
		},
		[handleFile]
	);

	const handleSaveQuestions = useCallback(() => {
		const questions = editingQuestions || parsedQuestions;
		if (questions.length > 0) {
			onQuestionsExtracted?.(questions);
		}
	}, [editingQuestions, parsedQuestions, onQuestionsExtracted]);

	const handleEditQuestion = (index: number, field: keyof ParsedQuestion, value: string) => {
		if (!editingQuestions) {
			setEditingQuestions([...parsedQuestions]);
			setShowEditMode(true);
		}

		setEditingQuestions((prev) => {
			if (!prev) return prev;
			const updated = [...prev];
			updated[index] = { ...updated[index], [field]: value };
			return updated;
		});
	};

	const handleCancel = useCallback(() => {
		reset();
		setSelectedFile(null);
		setPreviewUrl(null);
		setEditingQuestions(null);
		setShowEditMode(false);
		onCancel?.();
	}, [reset, onCancel]);

	const displayQuestions = editingQuestions || parsedQuestions;

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="font-semibold text-lg">upload scanned paper</h3>
					<p className="text-sm text-muted-foreground">
						upload a photo or scanned PDF of a past paper
					</p>
				</div>
				{onCancel && (
					<Button variant="ghost" size="sm" onClick={handleCancel}>
						<X className="w-4 h-4 mr-2" />
						cancel
					</Button>
				)}
			</div>

			{!selectedFile && !isProcessing && (
				<div
					className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${
						isDragging
							? 'border-primary bg-primary/5'
							: 'border-muted-foreground/20 hover:border-primary/50'
					}`}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
					role="button"
					tabIndex={0}
					aria-label="Upload files by drag and drop or click to browse"
					onKeyDown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							document.querySelector<HTMLInputElement>('input[type="file"]')?.click();
						}
					}}
				>
					<input
						type="file"
						accept="image/*,.pdf"
						onChange={handleFileSelect}
						className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
					/>
					<div className="space-y-4">
						<div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
							<Upload className="w-8 h-8 text-muted-foreground" />
						</div>
						<div>
							<p className="font-medium">drag & drop or click to upload</p>
							<p className="text-sm text-muted-foreground mt-1">
								supports JPG, PNG, PDF (max 10MB)
							</p>
						</div>
					</div>
				</div>
			)}

			{previewUrl && !isProcessing && (
				<div className="relative rounded-xl overflow-hidden border">
					<Image
						src={previewUrl}
						alt="Preview"
						width={800}
						height={400}
						className="w-full max-h-64 object-contain bg-muted"
					/>
					<button
						type="button"
						onClick={() => {
							setSelectedFile(null);
							setPreviewUrl(null);
						}}
						className="absolute top-2 right-2 p-1 bg-background/80 rounded-full hover:bg-background"
					>
						<X className="w-4 h-4" />
					</button>
				</div>
			)}

			{isProcessing && (
				<div className="space-y-4">
					<div className="flex items-center gap-4">
						<FileImage className="w-8 h-8 animate-pulse text-primary" />
						<div className="flex-1">
							<p className="text-sm font-medium">processing...</p>
							<p className="text-xs text-muted-foreground">
								{selectedFile?.type === 'application/pdf'
									? 'converting PDF pages'
									: 'extracting text from image'}
							</p>
						</div>
					</div>
					<Progress value={progress} className="h-2" />
					<p className="text-xs text-muted-foreground text-center">{Math.round(progress)}%</p>
				</div>
			)}

			{displayQuestions.length > 0 && !isProcessing && (
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<h4 className="font-medium">extracted questions ({displayQuestions.length})</h4>
						{!showEditMode && (
							<Button
								variant="outline"
								size="sm"
								onClick={() => {
									setEditingQuestions([...parsedQuestions]);
									setShowEditMode(true);
								}}
							>
								<Edit2 className="w-4 h-4 mr-2" />
								edit questions
							</Button>
						)}
					</div>

					<div className="space-y-3 max-h-80 overflow-y-auto">
						{displayQuestions.map((q, index) => (
							<div
								key={`q-${q.questionNumber ?? index}-${q.questionText.slice(0, 20)}`}
								className="p-4 bg-muted/50 rounded-xl border"
							>
								<div className="flex items-start gap-3">
									<span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
										{q.questionNumber || index + 1}
									</span>
									<div className="flex-1 min-w-0">
										{showEditMode ? (
											<div className="space-y-2">
												<textarea
													value={q.questionText}
													onChange={(e) =>
														handleEditQuestion(index, 'questionText', e.target.value)
													}
													className="w-full p-2 text-sm bg-background rounded border resize-none"
													rows={2}
												/>
												<input
													type="text"
													value={q.topic || ''}
													onChange={(e) => handleEditQuestion(index, 'topic', e.target.value)}
													placeholder="topic (optional)"
													className="w-full p-2 text-sm bg-background rounded border"
												/>
											</div>
										) : (
											<p className="text-sm">{q.questionText}</p>
										)}
										{q.topic && (
											<p className="text-xs text-muted-foreground mt-1">topic: {q.topic}</p>
										)}
									</div>
								</div>
							</div>
						))}
					</div>

					<div className="flex gap-3">
						<Button
							onClick={handleSaveQuestions}
							className="flex-1"
							disabled={displayQuestions.length === 0}
						>
							<Check className="w-4 h-4 mr-2" />
							save questions
						</Button>
						{showEditMode && (
							<Button
								variant="outline"
								onClick={() => {
									setEditingQuestions(null);
									setShowEditMode(false);
								}}
							>
								cancel editing
							</Button>
						)}
					</div>
				</div>
			)}

			{error && (
				<div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
					<p className="text-sm text-destructive">error: {error}</p>
				</div>
			)}

			{extractedText && displayQuestions.length === 0 && !isProcessing && (
				<div className="space-y-4">
					<p className="text-sm text-muted-foreground">
						no questions detected. you can edit the raw text below.
					</p>
					<textarea
						value={extractedText}
						onChange={() => {}}
						className="w-full p-4 text-sm bg-muted rounded-xl border resize-none font-mono"
						rows={8}
						readOnly
						aria-label="Extracted text from scanned paper"
					/>
				</div>
			)}
		</div>
	);
}
