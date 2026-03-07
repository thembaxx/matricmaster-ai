'use client';

import { FileArrowUp, FloppyDisk, Plus, Sparkle, X } from '@phosphor-icons/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { createSubjectAction, saveProcessedExtractedPaperAction } from '@/lib/db/actions';
import type { Subject } from '@/lib/db/schema';
import { uploadPdfFile } from '@/lib/pdf-upload';
import {
	type ExtractedOption,
	type ExtractedPaper,
	type ExtractedQuestion,
	extractQuestionsFromPDF,
	flattenExtractedPaper,
} from '@/services/pdfExtractor';

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

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files?.[0]) {
			const selectedFile = e.target.files[0];
			setFile(selectedFile);
			const name = selectedFile.name.replace('.pdf', '');
			setPaperDetails((prev) => ({ ...prev, paperId: name }));
		}
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

			const extractionResult = await extractQuestionsFromPDF(
				paperDetails.paperId,
				uploadResult.url!, // Use uploaded URL instead of base64
				subjectObj?.name || paperDetails.subject,
				paperDetails.paper,
				paperDetails.year,
				paperDetails.month
			);

			setProcessingProgress(95);
			setProcessingStatus('Finalizing...');

			setExtractedData(extractionResult);
			setStep('review');
			setProcessingProgress(100);
			toast.success(
				`AI successfully analyzed ${extractionResult.questions.length} questions from the paper!`
			);
		} catch (error) {
			console.error('Processing error:', error);

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
		value: ExtractedQuestion[keyof ExtractedQuestion]
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
			console.error('FloppyDisk error:', error);
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
								<Sparkle weight="bold" className="h-3 w-3 mr-1" /> Superpowered
							</Badge>
						)}
					</div>
					<DrawerDescription className="font-bold">
						{step === 'review'
							? `Analyzed ${extractedData?.questions.length} questions from ${paperDetails.paperId}.`
							: 'Transform any NSC PDF into an interactive quiz instantly using AI.'}
					</DrawerDescription>
				</DrawerHeader>

				<div className="flex-1 overflow-hidden">
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
												<Plus className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												onClick={() => setIsCreatingSubject(false)}
												className="h-12 px-4 rounded-xl"
											>
												<X className="h-4 w-4" />
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
												<Plus className="h-4 w-4" />
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
								<div className="relative">
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
											file
												? 'border-brand-blue bg-brand-blue/5'
												: 'border-border hover:border-brand-blue hover:bg-muted/50'
										}`}
									>
										<div
											className={`h-16 w-16 rounded-2xl flex items-center justify-center ${file ? 'bg-brand-blue text-white' : 'bg-muted text-muted-foreground'}`}
										>
											<FileArrowUp className="h-8 w-8" />
										</div>
										<div className="text-center">
											<p className="font-black uppercase tracking-widest text-xs">
												{file ? file.name : 'Drop PDF or Click to Browse'}
											</p>
											{file && (
												<p className="text-[10px] font-bold text-muted-foreground mt-1">
													{(file.size / 1024 / 1024).toFixed(2)} MB
												</p>
											)}
										</div>
									</label>
								</div>
							</div>
						</div>
					)}

					{step === 'processing' && (
						<div className="flex flex-col items-center justify-center py-24 px-8 space-y-8">
							<div className="relative">
								<div className="absolute inset-0 bg-brand-blue/20 blur-3xl rounded-full animate-pulse" />
								<Sparkle
									weight="bold"
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
											<div
												key={idx}
												className="p-8 rounded-[2rem] border-2 bg-background hover:border-brand-blue/30 transition-all space-y-6 shadow-sm"
											>
												<div className="flex justify-between items-center">
													<div className="flex items-center gap-4">
														<Badge className="h-10 px-4 rounded-xl font-black text-sm bg-brand-blue shadow-lg shadow-brand-blue/20">
															Q{q.questionNumber}
														</Badge>
														<div className="flex items-center gap-2">
															<Input
																type="number"
																value={q.marks}
																onChange={(e) =>
																	handleUpdateExtractedQuestion(
																		idx,
																		'marks',
																		Number.parseInt(e.target.value, 10)
																	)
																}
																className="w-16 h-10 rounded-xl border-2 text-center font-black"
															/>
															<span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">
																Marks
															</span>
														</div>
													</div>
													<Select
														value={q.difficulty}
														onValueChange={(v) =>
															handleUpdateExtractedQuestion(idx, 'difficulty', v)
														}
													>
														<SelectTrigger className="w-32 h-10 rounded-xl font-bold border-2">
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="easy">Easy</SelectItem>
															<SelectItem value="medium">Medium</SelectItem>
															<SelectItem value="hard">Hard</SelectItem>
														</SelectContent>
													</Select>
												</div>

												<div className="space-y-3">
													<Label className="text-[10px] font-black uppercase text-muted-foreground">
														Question Stem
													</Label>
													<Textarea
														value={q.questionText}
														onChange={(e) =>
															handleUpdateExtractedQuestion(idx, 'questionText', e.target.value)
														}
														className="min-h-24 rounded-2xl border-2 font-bold text-sm bg-muted/20"
													/>
												</div>

												{q.options && q.options.length > 0 && (
													<div className="space-y-3">
														<Label className="text-[10px] font-black uppercase text-muted-foreground">
															Multiple Choice Options
														</Label>
														<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
															{q.options.map((opt, oIdx) => (
																<div
																	key={oIdx}
																	className={`flex gap-3 items-center p-3 rounded-2xl border-2 transition-all ${opt.isCorrect ? 'border-emerald-500 bg-emerald-50/30' : 'bg-muted/10'}`}
																>
																	<Badge
																		variant={opt.isCorrect ? 'default' : 'outline'}
																		className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-sm ${opt.isCorrect ? 'bg-emerald-500 hover:bg-emerald-500' : ''}`}
																	>
																		{opt.letter}
																	</Badge>
																	<Input
																		value={opt.text}
																		onChange={(e) =>
																			handleUpdateExtractedOption(idx, oIdx, 'text', e.target.value)
																		}
																		className="h-10 text-xs font-bold rounded-xl border-none shadow-none bg-transparent"
																	/>
																	<Checkbox
																		checked={opt.isCorrect}
																		onCheckedChange={(v) =>
																			handleUpdateExtractedOption(idx, oIdx, 'isCorrect', !!v)
																		}
																		className="h-5 w-5 rounded-md border-2 border-emerald-500 data-[state=checked]:bg-emerald-500"
																	/>
																</div>
															))}
														</div>
													</div>
												)}

												{q.subQuestions && q.subQuestions.length > 0 && (
													<div className="pt-6 border-t space-y-4">
														<Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
															Sub-Questions ({q.subQuestions.length})
														</Label>
														<div className="space-y-6">
															{q.subQuestions.map((sq, sIdx) => (
																<div
																	key={sIdx}
																	className="pl-6 border-l-4 border-brand-blue/20 space-y-4 py-2"
																>
																	<div className="flex items-center justify-between">
																		<span className="text-xs font-black text-brand-blue uppercase">
																			Sub-Item {sq.id}
																		</span>
																		<div className="flex items-center gap-2">
																			<Input
																				type="number"
																				value={sq.marks}
																				onChange={(e) => {
																					const newData = { ...extractedData };
																					if (newData.questions[idx].subQuestions) {
																						newData.questions[idx].subQuestions[sIdx].marks =
																							Number.parseInt(e.target.value, 10);
																						setExtractedData(newData);
																					}
																				}}
																				className="w-14 h-8 rounded-lg border-2 text-center font-black p-0 text-xs"
																			/>
																			<span className="text-[10px] font-black uppercase text-muted-foreground">
																				Marks
																			</span>
																		</div>
																	</div>
																	<Textarea
																		value={sq.text}
																		onChange={(e) => {
																			const newData = { ...extractedData };
																			if (newData.questions[idx].subQuestions) {
																				newData.questions[idx].subQuestions[sIdx].text =
																					e.target.value;
																				setExtractedData(newData);
																			}
																		}}
																		className="min-h-20 rounded-xl border-2 font-bold text-xs bg-muted/10"
																	/>
																</div>
															))}
														</div>
													</div>
												)}
											</div>
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
							<Sparkle weight="bold" className="h-4 w-4 mr-2" /> Start Superpowered AI Extraction
						</Button>
					)}
					{step === 'review' && (
						<Button
							onClick={handleSave}
							disabled={isSaving}
							className="flex-1 h-14 bg-brand-blue hover:bg-brand-blue/90 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-brand-blue/20"
						>
							{isSaving ? (
								<Spinner className="h-5 w-5 text-white" />
							) : (
								<>
									<FloppyDisk className="h-4 w-4 mr-2" /> FloppyDisk Paper &{' '}
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
