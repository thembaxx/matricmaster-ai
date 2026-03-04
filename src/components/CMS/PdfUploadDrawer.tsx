'use client';

import { Edit2, FileUp, Loader2, Plus, Save, X } from 'lucide-react';
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
	const [step, setStep] = useState<'upload' | 'extracting' | 'review'>('upload');
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
	const [isProcessing, setIsProcessing] = useState(false);
	const [isCreatingSubject, setIsCreatingSubject] = useState(false);
	const [newSubjectName, setNewSubjectName] = useState('');

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files?.[0]) {
			const selectedFile = e.target.files[0];
			setFile(selectedFile);

			// Auto-fill some details from filename if possible
			const name = selectedFile.name.replace('.pdf', '');
			setPaperDetails((prev) => ({ ...prev, paperId: name }));
		}
	};

	const handleStartExtraction = async () => {
		if (!file || !paperDetails.paperId || !paperDetails.subjectId) {
			toast.error('Please fill in all required fields');
			return;
		}

		try {
			setStep('extracting');

			// 1. Upload to UploadThing
			const uploadResult = await uploadPdfFile(file);
			if (!uploadResult.success || !uploadResult.url) {
				throw new Error(uploadResult.error || 'Failed to upload PDF');
			}

			// 2. Extract Questions
			const subjectObj = subjects.find((s) => s.id === paperDetails.subjectId);
			const extractionResult = await extractQuestionsFromPDF(
				paperDetails.paperId,
				uploadResult.url,
				subjectObj?.name || paperDetails.subject,
				paperDetails.paper,
				paperDetails.year,
				paperDetails.month
			);

			setExtractedData(extractionResult);
			setStep('review');
			toast.success('Questions extracted successfully!');
		} catch (error) {
			console.error('Extraction error:', error);
			toast.error(error instanceof Error ? error.message : 'Extraction failed');
			setStep('upload');
		}
	};

	const handleCreateSubject = async () => {
		if (!newSubjectName.trim()) return;
		try {
			setIsProcessing(true);
			const newSubject = await createSubjectAction({
				name: newSubjectName.trim(),
				curriculumCode: 'CAPS-' + newSubjectName.trim().substring(0, 3).toUpperCase(),
			});
			toast.success(`Subject "${newSubject.name}" created!`);
			setPaperDetails((prev) => ({ ...prev, subjectId: newSubject.id }));
			setIsCreatingSubject(false);
			onSuccess(); // Refresh subjects list in parent
		} catch (error) {
			toast.error('Failed to create subject');
		} finally {
			setIsProcessing(false);
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

	const handleUpdateExtractedSubQuestion = (
		qIdx: number,
		sqIdx: number,
		field: string,
		value: string | number
	) => {
		if (!extractedData) return;
		const newData = { ...extractedData };
		const subQuestions = newData.questions[qIdx].subQuestions;
		if (subQuestions) {
			subQuestions[sqIdx] = {
				...subQuestions[sqIdx],
				[field]: value,
			} as any;
		}
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
				sq.options[optIdx] = {
					...sq.options[optIdx],
					[field]: value,
				} as ExtractedOption;
			}
		} else {
			const q = newData.questions[qIdx];
			if (!q.options) q.options = [];
			q.options[optIdx] = {
				...q.options[optIdx],
				[field]: value,
			} as ExtractedOption;
		}
		setExtractedData(newData);
	};

	const handleSave = async () => {
		if (!extractedData) return;

		try {
			setIsProcessing(true);

			const flatQuestions = await flattenExtractedPaper(extractedData);

			await saveProcessedExtractedPaperAction(
				{
					paperId: paperDetails.paperId,
					originalPdfUrl: extractedData.storedPdfUrl || '',
					storedPdfUrl: extractedData.storedPdfUrl || null,
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
			console.error('Save error:', error);
			toast.error('Failed to save paper');
		} finally {
			setIsProcessing(false);
		}
	};

	const reset = () => {
		setStep('upload');
		setFile(null);
		setExtractedData(null);
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
			<DrawerContent className="max-h-[90vh] flex flex-col rounded-t-[3rem] pb-8 lg:max-w-4xl lg:mx-auto">
				<DrawerHeader className="text-left border-b pb-6 px-8">
					<DrawerTitle className="text-3xl font-black tracking-tighter uppercase">
						{step === 'review' ? 'Review Extraction' : 'Upload Past Paper'}
					</DrawerTitle>
					<DrawerDescription className="font-bold">
						{step === 'review'
							? 'Check the extracted questions and edit if necessary.'
							: 'Upload a PDF to automatically extract questions and add them to the system.'}
					</DrawerDescription>
				</DrawerHeader>

				<div className="flex-1 overflow-hidden">
					{step === 'upload' && (
						<div className="p-8 space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="space-y-3">
									<Label className="font-black text-xs uppercase tracking-widest text-muted-foreground">
										Paper Title / ID
									</Label>
									<Input
										value={paperDetails.paperId}
										onChange={(e) => setPaperDetails({ ...paperDetails, paperId: e.target.value })}
										placeholder="e.g. Maths-P1-Nov2023"
										className="h-12 rounded-xl border-2 font-bold"
									/>
								</div>
								<div className="space-y-3">
									<Label className="font-black text-xs uppercase tracking-widest text-muted-foreground">
										Subject
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
													setPaperDetails({ ...paperDetails, subjectId: Number.parseInt(v) })
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
									<Label className="font-black text-xs uppercase tracking-widest text-muted-foreground">
										Grade Level
									</Label>
									<Select
										value={paperDetails.gradeLevel.toString()}
										onValueChange={(v) =>
											setPaperDetails({ ...paperDetails, gradeLevel: Number.parseInt(v) })
										}
									>
										<SelectTrigger className="h-12 rounded-xl border-2 font-bold">
											<SelectValue placeholder="Select Grade" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="10">Grade 10</SelectItem>
											<SelectItem value="11">Grade 11</SelectItem>
											<SelectItem value="12">Grade 12</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-3">
									<Label className="font-black text-xs uppercase tracking-widest text-muted-foreground">
										Year
									</Label>
									<Input
										type="number"
										value={paperDetails.year}
										onChange={(e) =>
											setPaperDetails({ ...paperDetails, year: Number.parseInt(e.target.value) })
										}
										className="h-12 rounded-xl border-2 font-bold"
									/>
								</div>
							</div>

							<div className="space-y-3">
								<Label className="font-black text-xs uppercase tracking-widest text-muted-foreground">
									PDF File
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
										className="w-full h-40 rounded-3xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-4 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer"
									>
										<div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center">
											<FileUp className="h-6 w-6 text-muted-foreground" />
										</div>
										<span className="text-sm font-black uppercase tracking-widest text-muted-foreground">
											{file ? file.name : 'Choose PDF File'}
										</span>
									</label>
								</div>
							</div>
						</div>
					)}

					{step === 'extracting' && (
						<div className="flex flex-col items-center justify-center py-20 space-y-6">
							<Loader2 className="h-12 w-12 animate-spin text-primary" />
							<div className="text-center space-y-2">
								<h3 className="text-xl font-black uppercase tracking-tighter">
									AI Extraction in Progress
								</h3>
								<p className="text-muted-foreground font-bold">This may take up to a minute...</p>
							</div>
						</div>
					)}

					{step === 'review' && extractedData && (
						<ScrollArea className="h-full px-8 py-6">
							<div className="space-y-6">
								<div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-6 border-b">
									<div>
										<p className="text-[10px] font-black uppercase text-muted-foreground">
											Subject
										</p>
										<p className="font-bold">{extractedData.subject}</p>
									</div>
									<div>
										<p className="text-[10px] font-black uppercase text-muted-foreground">Paper</p>
										<p className="font-bold">{extractedData.paper}</p>
									</div>
									<div>
										<p className="text-[10px] font-black uppercase text-muted-foreground">Year</p>
										<p className="font-bold">{extractedData.year}</p>
									</div>
									<div>
										<p className="text-[10px] font-black uppercase text-muted-foreground">
											Questions
										</p>
										<p className="font-bold">{extractedData.questions?.length || 0}</p>
									</div>
								</div>

								<div className="space-y-6">
									<h4 className="font-black uppercase text-sm tracking-widest">
										Extracted Questions
									</h4>
									{extractedData.questions.map((q, idx) => (
										<div key={idx} className="p-6 rounded-2xl border-2 bg-muted/20 space-y-4">
											<div className="flex justify-between items-center">
												<div className="flex items-center gap-3">
													<Badge className="h-8 px-3 rounded-lg font-black bg-primary">
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
																	Number.parseInt(e.target.value)
																)
															}
															className="w-16 h-8 rounded-lg border-2 text-center font-black p-0"
														/>
														<span className="text-[10px] font-black uppercase text-muted-foreground">
															Marks
														</span>
													</div>
												</div>
											</div>

											<Textarea
												value={q.questionText}
												onChange={(e) =>
													handleUpdateExtractedQuestion(idx, 'questionText', e.target.value)
												}
												className="min-h-24 rounded-xl border-2 font-bold text-sm bg-background"
												placeholder="Question text..."
											/>

											{q.options && q.options.length > 0 && (
												<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
													{q.options.map((opt, oIdx) => (
														<div key={oIdx} className="flex gap-2 items-center">
															<Badge
																variant="outline"
																className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
															>
																{opt.letter}
															</Badge>
															<Input
																value={opt.text}
																onChange={(e) =>
																	handleUpdateExtractedOption(idx, oIdx, 'text', e.target.value)
																}
																className="h-9 text-xs font-bold rounded-lg border-2"
															/>
															<Checkbox
																checked={opt.isCorrect}
																onCheckedChange={(v) =>
																	handleUpdateExtractedOption(idx, oIdx, 'isCorrect', !!v)
																}
															/>
														</div>
													))}
												</div>
											)}

											{q.subQuestions && q.subQuestions.length > 0 && (
												<div className="pl-6 border-l-4 border-primary/10 space-y-4">
													{q.subQuestions.map((sq, sIdx) => (
														<div key={sIdx} className="space-y-4">
															<div className="space-y-2">
																<div className="flex items-center justify-between">
																	<span className="text-xs font-black text-primary">
																		Sub-question {sq.id}
																	</span>
																	<div className="flex items-center gap-2">
																		<Input
																			type="number"
																			value={sq.marks}
																			onChange={(e) =>
																				handleUpdateExtractedSubQuestion(
																					idx,
																					sIdx,
																					'marks',
																					Number.parseInt(e.target.value)
																				)
																			}
																			className="w-12 h-6 rounded-md border-2 text-center font-black p-0 text-[10px]"
																		/>
																		<span className="text-[10px] font-black uppercase text-muted-foreground">
																			Marks
																		</span>
																	</div>
																</div>
																<Textarea
																	value={sq.text}
																	onChange={(e) =>
																		handleUpdateExtractedSubQuestion(
																			idx,
																			sIdx,
																			'text',
																			e.target.value
																		)
																	}
																	className="min-h-16 rounded-lg border-2 font-bold text-xs bg-background"
																	placeholder="Sub-question text..."
																/>
															</div>

															{sq.options && sq.options.length > 0 && (
																<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
																	{sq.options.map((opt, oIdx) => (
																		<div key={oIdx} className="flex gap-2 items-center">
																			<Badge
																				variant="outline"
																				className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
																			>
																				{opt.letter}
																			</Badge>
																			<Input
																				value={opt.text}
																				onChange={(e) =>
																					handleUpdateExtractedOption(
																						idx,
																						oIdx,
																						'text',
																						e.target.value,
																						sIdx
																					)
																				}
																				className="h-8 text-[10px] font-bold rounded-lg border-2"
																			/>
																			<Checkbox
																				checked={opt.isCorrect}
																				onCheckedChange={(v) =>
																					handleUpdateExtractedOption(
																						idx,
																						oIdx,
																						'isCorrect',
																						!!v,
																						sIdx
																					)
																				}
																			/>
																		</div>
																	))}
																</div>
															)}
														</div>
													))}
												</div>
											)}
										</div>
									))}
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
							className="flex-1 h-14 bg-primary hover:bg-primary/90 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/20"
						>
							Start AI Extraction
						</Button>
					)}
					{step === 'review' && (
						<Button
							onClick={handleSave}
							disabled={isProcessing}
							className="flex-1 h-14 bg-primary hover:bg-primary/90 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/20"
						>
							{isProcessing ? (
								<Spinner className="h-5 w-5 text-primary-foreground" />
							) : (
								<>
									<Save className="h-4 w-4 mr-2" /> Save Paper & Questions
								</>
							)}
						</Button>
					)}
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}
