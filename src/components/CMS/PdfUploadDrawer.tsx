'use client';

import { SaveIcon, SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
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
import { usePdfUpload } from '@/hooks/usePdfUpload';
import type { Subject } from '@/lib/db/schema';
import { ProcessingStep } from './ProcessingStep';
import { ReviewStep } from './ReviewStep';
import { UploadStep } from './UploadStep';

interface PdfUploadDrawerProps {
	isOpen: boolean;
	onClose: () => void;
	subjects: Subject[];
	onSuccess: () => void;
}

export function PdfUploadDrawer({ isOpen, onClose, subjects, onSuccess }: PdfUploadDrawerProps) {
	const {
		step,
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
	} = usePdfUpload({ subjects, onSuccess, onClose });

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
						<UploadStep
							paperDetails={paperDetails}
							setPaperDetails={setPaperDetails}
							subjects={subjects}
							isCreatingSubject={isCreatingSubject}
							setIsCreatingSubject={setIsCreatingSubject}
							newSubjectName={newSubjectName}
							setNewSubjectName={setNewSubjectName}
							handleCreateSubject={handleCreateSubject}
							isDragging={isDragging}
							file={file}
							handleDrag={handleDrag}
							handleDrop={handleDrop}
							handleFileChange={handleFileChange}
						/>
					)}

					{step === 'processing' && (
						<ProcessingStep
							processingStatus={processingStatus}
							processingProgress={processingProgress}
						/>
					)}

					{step === 'review' && extractedData && (
						<ReviewStep
							extractedData={extractedData}
							handleUpdateExtractedQuestion={handleUpdateExtractedQuestion}
							handleUpdateExtractedOption={handleUpdateExtractedOption}
							handleUpdateSubQuestion={handleUpdateSubQuestion}
						/>
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
							onClick={handleSaveResult}
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
