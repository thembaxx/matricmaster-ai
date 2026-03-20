'use client';

import {
	Add01Icon,
	Cancel01Icon,
	SaveIcon,
	SparklesIcon,
	Upload01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { createSubjectAction, saveProcessedExtractedPaperAction } from '@/lib/db/actions';
import type { Subject } from '@/lib/db/schema';
import { uploadPdfFile } from '@/lib/pdf-upload';
import {
	type ExtractedOption,
	type ExtractedPaper,
	type ExtractedQuestion,
	flattenExtractedPaper,
} from '@/services/pdfExtractor';
import { ExtractedQuestionCard } from './ExtractedQuestionCard';

interface PdfUploadDrawerProps {
	isOpen: boolean;
	onClose: () => void;
	subjects: Subject[];
	onSuccess: () => void;
}

export function PdfUploadDrawer({ isOpen, onClose, subjects, onSuccess }: PdfUploadDrawerProps) {
	const [step, setStep] = useState<'upload' | 'processing' | 'review'>('upload');
	const [file, setFile] = useState<File | null>(null);
	const [paperDetails, setPaperDetails] = useState({
		paperId: '',
		subject: '',
		paper: 'Paper 1',
		year: new Date().getFullYear(),
		month: 'October/November',
		gradeLevel: 12,
		subjectId: 0,
	});
	const [extractedData, setExtractedData] = useState<ExtractedPaper | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const [isCreatingSubject, setIsCreatingSubject] = useState(false);
	const [newSubjectName, setNewSubjectName] = useState('');
	const [processingProgress, setProcessingProgress] = useState(0);
	const [processingStatus, setProcessingStatus] = useState('');
	const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
	const [isDragging, setIsDragging] = useState(false);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files?.[0]) {
			const selectedFile = e.target.files[0];
			processFile(selectedFile);
		}
	};

	const handleDrag = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.type === 'dragenter' || e.type === 'dragover') {
			setIsDragging(true);
		} else if (e.type === 'dragleave') {
			setIsDragging(false);
		}
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);

		if (e.dataTransfer.files?.[0]) {
			const droppedFile = e.dataTransfer.files[0];
			if (droppedFile.type === 'application/pdf') {
				processFile(droppedFile);
			} else {
				toast.error('Only PDF files are allowed');
			}
		}
	};

	const processFile = (selectedFile: File) => {
		setFile(selectedFile);
		const name = selectedFile.name.replace('.pdf', '');
		setPaperDetails((prev) => ({ ...prev, paperId: name }));
	};

	const handleStartExtraction = async () => {
		// Client-side validation
		if (!file) {
			toast.error('Please select a PDF file');
			return;
		}

		if (!paperDetails.paperId.trim()) {
			toast.error('Please enter a paper ID');
			return;
		}

		if (!paperDetails.subjectId) {
			toast.error('Please select a subject');
			return;
		}

		// File size validation
		const maxSize = 16 * 1024 * 1024; // 16MB
		if (file.size > maxSize) {
			toast.error(
				`File too large. Maximum size is 16MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB`
			);
			return;
		}

		// File type validation
		if (file.type !== 'application/pdf') {
			toast.error('Invalid file type. Only PDF files are supported');
			return;
		}

		try {
			setStep('processing');
			setProcessingProgress(10);
			setProcessingStatus('Uploading PDF to storage...');

			// 1. Upload PDF to UploadThing first (sequential approach)
			const uploadResult = await uploadPdfFile(file);

			if (!uploadResult.success) {
				throw new Error(`Upload failed: ${uploadResult.error}`);
			}

			setUploadedUrl(uploadResult.url || null);
			setProcessingProgress(40);
			setProcessingStatus('PDF uploaded successfully, starting AI analysis...');

			// 2. Extract questions using the uploaded URL
			const subjectObj = subjects.find((s) => s.id === paperDetails.subjectId);

			setProcessingProgress(60);
			setProcessingStatus('AI is analyzing questions (Superpowered mode)...');

			const response = await fetch('/api/extract-questions', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					paperId: paperDetails.paperId,
					pdfUrl: uploadResult.url!,
					subject: subjectObj?.name || paperDetails.subject,
					paper: paperDetails.paper,
					year: paperDetails.year,
					month: paperDetails.month,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();

				if (errorData.isUnsupported) {
					setStep('upload');
					toast.info(
						errorData.suggestion || 'This document is not a supported NSC Grade 12 exam paper.'
					);
					return;
				}

				throw new Error(errorData.details || errorData.error || 'Failed to extract questions');
			}

			const result = await response.json();
			const extractionResult = result.data;

			setProcessingProgress(95);
			setProcessingStatus('Finalizing...');

			setExtractedData(extractionResult);
			setStep('review');
			setProcessingProgress(100);
			toast.success(
				`AI successfully analyzed ${extractionResult.questions.length} questions from the paper!`
			);
		} catch (error) {
			console.debug('Processing error:', error);

			// Provide specific error messages
			if (error instanceof Error) {
				if (error.message.includes('Upload failed')) {
					toast.error('Failed to upload PDF. Please check your internet connection and try again.');
				} else if (error.message.includes('AI service not configured')) {
					toast.error('AI service is not configured. Please contact support.');
				} else if (error.message.includes('Failed to fetch PDF')) {
					toast.error('Failed to process PDF. The file may be corrupted or too large.');
				} else {
					toast.error(`Processing failed: ${error.message}`);
				}
			} else {
				toast.error('An unexpected error occurred. Please try again.');
			}

			setStep('upload');
		}
	};

	const handleCreateSubject = async () => {
		if (!newSubjectName.trim()) return;
		try {
			setIsSaving(true);
			const newSubject = await createSubjectAction({
				name: newSubjectName.trim(),
				curriculumCode: `CAPS-${newSubjectName.trim().substring(0, 3).toUpperCase()}`,
			});
			toast.success(`Subject "${newSubject.name}" created!`);
			setPaperDetails((prev) => ({ ...prev, subjectId: newSubject.id }));
			setIsCreatingSubject(false);
			onSuccess();
		} catch (_error) {
			toast.error('Failed to create subject');
		} finally {
			setIsSaving(false);
		}
	};

	const handleUpdateExtractedQuestion = (
		idx: number,
		field: keyof ExtractedQuestion,
		value: string | number
	) => {
		if (!extractedData) return;
		const newData = { ...extractedData };
		newData.questions[idx] = { ...newData.questions[idx], [field]: value } as ExtractedQuestion;
		setExtractedData(newData);
	};

	const handleUpdateExtractedOption = (
		qIdx: number,
		optIdx: number,
		field: keyof ExtractedOption,
		value: string | boolean,
		sqIdx?: number
	) => {
		if (!extractedData) return;
		const newData = { ...extractedData };
		if (sqIdx !== undefined) {
			const sq = newData.questions[qIdx].subQuestions?.[sqIdx];
			if (sq) {
				if (!sq.options) sq.options = [];
				sq.options[optIdx] = { ...sq.options[optIdx], [field]: value } as ExtractedOption;
			}
		} else {
			const q = newData.questions[qIdx];
			if (!q.options) q.options = [];
			q.options[optIdx] = { ...q.options[optIdx], [field]: value } as ExtractedOption;
		}
		setExtractedData(newData);
	};

	const handleUpdateSubQuestion = (
		qIdx: number,
		sqIdx: number,
		field: string,
		value: string | number
	) => {
		if (!extractedData) return;
		const newData = { ...extractedData };
		const sq = newData.questions[qIdx].subQuestions?.[sqIdx];
		if (sq) {
			// @ts-expect-error - Dynamic field access
			sq[field] = value;
			setExtractedData(newData);
		}
	};

	const handleSave = async () => {
		if (!extractedData) return;

		try {
			setIsSaving(true);

			const flatQuestions = await flattenExtractedPaper(extractedData);

			await saveProcessedExtractedPaperAction(
				{
					paperId: paperDetails.paperId,
					originalPdfUrl: uploadedUrl || '',
					storedPdfUrl: uploadedUrl || null,
					subject:
						subjects.find((s) => s.id === paperDetails.subjectId)?.name || extractedData.subject,
					paper: paperDetails.paper,
					year: paperDetails.year,
					month: paperDetails.month,
					isExtracted: true,
					extractedQuestions: JSON.stringify(extractedData),
					instructions: extractedData.instructions || null,
				},
				flatQuestions.map((q) => ({
					...q,
					subjectId: paperDetails.subjectId,
					gradeLevel: paperDetails.gradeLevel,
				}))
			);

			toast.success('Paper and questions saved successfully!');
			onSuccess();
			onClose();
			reset();
		} catch (error) {
			console.debug('FloppyDisk error:', error);
			toast.error('Failed to save paper');
		} finally {
			setIsSaving(false);
		}
	};

	const reset = () => {
		setStep('upload');
		setFile(null);
		setExtractedData(null);
		setUploadedUrl(null);
		setProcessingProgress(0);
		setPaperDetails({
			paperId: '',
			subject: '',
			paper: 'Paper 1',
			year: new Date().getFullYear(),
			month: 'October/November',
			gradeLevel: 12,
			subjectId: 0,
		});
	};

	return (
		<Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DrawerContent className="max-h-[95vh] flex flex-col rounded-t-[3rem] pb-8 lg:max-w-5xl lg:mx-auto">
				<DrawerHeader className="text-left border-b pb-6 px-8">
					<div className="flex items-center gap-3">
						<DrawerTitle className="text-3xl font-black tracking-tighter uppercase">
							{step === 'review' ? 'Review AI Results' : 'AI Paper Extraction'}
						</DrawerTitle>
						{step === 'review' && (
							<Badge className="bg-brand-blue/10 text-brand-blue border-brand-blue/20">
								<HugeiconsIcon icon={SparklesIcon} className="h-3 w-3 mr-1" /> Superpowered
							</Badge>
						)}
					</div>
					<DrawerDescription className="font-bold">
						{step === 'review'
							? `Analyzed ${extractedData?.questions.length} questions from ${paperDetails.paperId}.`
							: 'Transform any NSC PDF into an interactive quiz instantly using AI.'}
					</DrawerDescription>
				</DrawerHeader>

				<div className="flex-1 overflow-y-auto">
					{step === 'upload' && (
						<div className="p-8 space-y-8">
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								<div className="space-y-3">
									<Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">
										Paper Identity
									</Label>
									<Input
										value={paperDetails.paperId}
										onChange={(e) => setPaperDetails({ ...paperDetails, paperId: e.target.value })}
										placeholder="e.g. Maths-P1-Nov2023"
										className="h-12 rounded-xl border-2 font-bold focus-visible:ring-brand-blue"
									/>
								</div>
								<div className="space-y-3">
									<Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">
										Subject Area
									</Label>
									{isCreatingSubject ? (
										<div className="flex gap-2">
											<Input
												value={newSubjectName}
												onChange={(e) => setNewSubjectName(e.target.value)}
												placeholder="New subject name"
												className="h-12 rounded-xl border-2 font-bold"
											/>
											<Button onClick={handleCreateSubject} className="h-12 px-4 rounded-xl">
												<HugeiconsIcon icon={Add01Icon} className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												onClick={() => setIsCreatingSubject(false)}
												className="h-12 px-4 rounded-xl"
											>
												<HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
											</Button>
										</div>
									) : (
										<div className="flex gap-2">
											<Select
												value={paperDetails.subjectId.toString()}
												onValueChange={(v) =>
													setPaperDetails({ ...paperDetails, subjectId: Number.parseInt(v, 10) })
												}
											>
												<SelectTrigger className="h-12 rounded-xl border-2 font-bold flex-1">
													<SelectValue placeholder="Select Subject" />
												</SelectTrigger>
												<SelectContent>
													{subjects.map((s) => (
														<SelectItem key={s.id} value={s.id.toString()}>
															{s.name}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<Button
												variant="outline"
												onClick={() => setIsCreatingSubject(true)}
												className="h-12 px-4 rounded-xl border-2"
											>
												<HugeiconsIcon icon={Add01Icon} className="h-4 w-4" />
											</Button>
										</div>
									)}
								</div>
								<div className="space-y-3">
									<Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">
										Grade & Session
									</Label>
									<div className="flex gap-2">
										<Select
											value={paperDetails.gradeLevel.toString()}
											onValueChange={(v) =>
												setPaperDetails({ ...paperDetails, gradeLevel: Number.parseInt(v, 10) })
											}
										>
											<SelectTrigger className="h-12 rounded-xl border-2 font-bold">
												<SelectValue placeholder="Grade" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="10">Grade 10</SelectItem>
												<SelectItem value="11">Grade 11</SelectItem>
												<SelectItem value="12">Grade 12</SelectItem>
											</SelectContent>
										</Select>
										<Input
											type="number"
											value={paperDetails.year}
											onChange={(e) =>
												setPaperDetails({
													...paperDetails,
													year: Number.parseInt(e.target.value, 10),
												})
											}
											className="h-12 w-24 rounded-xl border-2 font-bold"
										/>
									</div>
								</div>
							</div>

							<div className="space-y-3">
								<Label className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">
									PDF Document
								</Label>
								<section
									className="relative"
									onDragEnter={handleDrag}
									onDragOver={handleDrag}
									onDragLeave={handleDrag}
									onDrop={handleDrop}
									aria-label="PDF upload area"
								>
									<input
										type="file"
										id="pdf-upload"
										onChange={handleFileChange}
										accept="application/pdf"
										className="hidden"
									/>
									<label
										htmlFor="pdf-upload"
										className={`w-full h-48 rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all cursor-pointer ${
											file || isDragging
												? 'border-brand-blue bg-brand-blue/5'
												: 'border-border hover:border-brand-blue hover:bg-muted/50'
										} ${isDragging ? 'scale-[0.98] ring-4 ring-brand-blue/10' : ''}`}
									>
										<div
											className={`h-16 w-16 rounded-2xl flex items-center justify-center ${
												file || isDragging
													? 'bg-brand-blue text-white'
													: 'bg-muted text-muted-foreground'
											} ${isDragging ? 'animate-pulse' : ''}`}
										>
											<HugeiconsIcon icon={Upload01Icon} className="h-8 w-8" />
										</div>
										<div className="text-center">
											<p className="font-black uppercase tracking-widest text-xs">
												{isDragging
													? 'Drop PDF Here'
													: file
														? file.name
														: 'Drop PDF or Click to Browse'}
											</p>
											{file && !isDragging && (
												<p className="text-[10px] font-bold text-muted-foreground mt-1">
													{(file.size / 1024 / 1024).toFixed(2)} MB
												</p>
											)}
											{!file && !isDragging && (
												<p className="text-[10px] font-bold text-muted-foreground mt-1">
													PDF ONLY (MAX 16MB)
												</p>
											)}
										</div>
									</label>
								</section>
							</div>
						</div>
					)}

					{step === 'processing' && (
						<div className="flex flex-col items-center justify-center py-24 px-8 gap-8">
							<div className="relative">
								<div className="absolute inset-0 bg-brand-blue/20 blur-3xl rounded-full animate-pulse" />
								<HugeiconsIcon
									icon={SparklesIcon}
									className="h-16 w-16 text-brand-blue relative z-10 animate-bounce"
								/>
							</div>
							<div className="w-full max-w-md space-y-4">
								<div className="flex justify-between items-end">
									<div className="space-y-1">
										<h3 className="text-2xl font-black uppercase tracking-tighter">
											Working Magic
										</h3>
										<p className="text-muted-foreground font-bold text-sm">{processingStatus}</p>
									</div>
									<span className="font-black text-brand-blue">{processingProgress}%</span>
								</div>
								<Progress value={processingProgress} className="h-3 rounded-full bg-muted" />
							</div>
						</div>
					)}

					{step === 'review' && extractedData && (
						<ScrollArea className="h-full px-8 py-6">
							<div className="space-y-8">
								<div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 rounded-3xl bg-muted/30 border-2">
									<div>
										<p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">
											Subject
										</p>
										<p className="font-bold">{extractedData.subject}</p>
									</div>
									<div>
										<p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">
											Paper
										</p>
										<p className="font-bold">{extractedData.paper}</p>
									</div>
									<div>
										<p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">
											Year
										</p>
										<p className="font-bold">{extractedData.year}</p>
									</div>
									<div>
										<p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">
											Analysis
										</p>
										<p className="font-bold">{extractedData.questions.length} Questions Found</p>
									</div>
								</div>

								<div className="space-y-6">
									<div className="flex items-center justify-between">
										<h4 className="font-black uppercase text-sm tracking-widest flex items-center gap-2">
											Verification List{' '}
											<Badge variant="secondary" className="rounded-md">
												{extractedData.questions.length}
											</Badge>
										</h4>
									</div>

									<div className="space-y-6">
										{extractedData.questions.map((q, idx) => (
											<ExtractedQuestionCard
												key={q.id || `q-${idx}`}
												question={q}
												index={idx}
												onUpdateQuestion={handleUpdateExtractedQuestion}
												onUpdateOption={handleUpdateExtractedOption}
												onUpdateSubQuestion={handleUpdateSubQuestion}
											/>
										))}
									</div>
								</div>
							</div>
						</ScrollArea>
					)}
				</div>

				<DrawerFooter className="pt-6 border-t flex-row gap-4 px-8">
					<DrawerClose asChild>
						<Button
							variant="outline"
							className="flex-1 h-14 rounded-2xl border-2 font-black uppercase tracking-widest text-xs"
						>
							Cancel
						</Button>
					</DrawerClose>
					{step === 'upload' && (
						<Button
							onClick={handleStartExtraction}
							disabled={!file || !paperDetails.paperId || !paperDetails.subjectId}
							className="flex-1 h-14 bg-brand-blue hover:bg-brand-blue/90 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-brand-blue/20"
						>
							<HugeiconsIcon icon={SparklesIcon} className="h-4 w-4 mr-2" /> Start
						</Button>
					)}
					{step === 'review' && (
						<Button
							onClick={handleSave}
							disabled={isSaving}
							className="flex-1 h-14 bg-brand-blue hover:bg-brand-blue/90 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-brand-blue/20"
						>
							{isSaving ? (
								<div className="h-5 w-5 animate-spin border-2 border-white border-t-transparent rounded-full" />
							) : (
								<>
									<HugeiconsIcon icon={SaveIcon} className="h-4 w-4 mr-2" /> Paper &{' '}
									{extractedData?.questions.length} Questions
								</>
							)}
						</Button>
					)}
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}
