'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { createSubjectAction, saveProcessedExtractedPaperAction } from '@/lib/db/actions';
import type { Subject } from '@/lib/db/schema';
import { uploadPdfFile } from '@/lib/pdf-upload';
import {
	type ExtractedOption,
	type ExtractedPaper,
	type ExtractedQuestion,
	flattenExtractedPaper,
} from '@/services/pdfExtractor';

interface UsePdfUploadProps {
	subjects: Subject[];
	onSuccess: () => void;
	onClose: () => void;
}

export function usePdfUpload({ subjects, onSuccess, onClose }: UsePdfUploadProps) {
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

	const processFile = (selectedFile: File) => {
		setFile(selectedFile);
		const name = selectedFile.name.replace('.pdf', '');
		setPaperDetails((prev) => ({ ...prev, paperId: name }));
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files?.[0]) {
			processFile(e.target.files[0]);
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

	const handleStartExtraction = async () => {
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

		const maxSize = 16 * 1024 * 1024;
		if (file.size > maxSize) {
			toast.error(
				`File too large. Maximum size is 16MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB`
			);
			return;
		}

		if (file.type !== 'application/pdf') {
			toast.error('Invalid file type. Only PDF files are supported');
			return;
		}

		try {
			setStep('processing');
			setProcessingProgress(10);
			setProcessingStatus('Uploading PDF to storage...');

			const uploadResult = await uploadPdfFile(file);
			if (!uploadResult.success) {
				throw new Error(`Upload failed: ${uploadResult.error}`);
			}

			setUploadedUrl(uploadResult.url || null);
			setProcessingProgress(40);
			setProcessingStatus('PDF uploaded successfully, starting AI analysis...');

			const subjectObj = subjects.find((s) => s.id === paperDetails.subjectId);
			setProcessingProgress(60);
			setProcessingStatus('AI is analyzing questions (Superpowered mode)...');

			const response = await fetch('/api/extract-questions', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
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
			if (error instanceof Error) {
				toast.error(`Processing failed: ${error.message}`);
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

	const handleSaveResult = async () => {
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
			console.debug('Save error:', error);
			toast.error('Failed to save paper');
		} finally {
			setIsSaving(false);
		}
	};

	return {
		step,
		setStep,
		file,
		paperDetails,
		setPaperDetails,
		extractedData,
		isSaving,
		isCreatingSubject,
		setIsCreatingSubject,
		newSubjectName,
		setNewSubjectName,
		processingProgress,
		processingStatus,
		isDragging,
		handleFileChange,
		handleDrag,
		handleDrop,
		handleStartExtraction,
		handleCreateSubject,
		handleUpdateExtractedQuestion,
		handleUpdateExtractedOption,
		handleUpdateSubQuestion,
		handleSaveResult,
		reset,
	};
}
