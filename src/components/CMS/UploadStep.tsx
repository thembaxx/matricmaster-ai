'use client';

import { Add01Icon, Cancel01Icon, Upload01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import type { Subject } from '@/lib/db/schema';

interface UploadStepProps {
	paperDetails: {
		paperId: string;
		gradeLevel: number;
		year: number;
		subjectId: number;
	};
	setPaperDetails: (details: any) => void;
	subjects: Subject[];
	isCreatingSubject: boolean;
	setIsCreatingSubject: (v: boolean) => void;
	newSubjectName: string;
	setNewSubjectName: (v: string) => void;
	handleCreateSubject: () => void;
	isDragging: boolean;
	file: File | null;
	handleDrag: (e: React.DragEvent) => void;
	handleDrop: (e: React.DragEvent) => void;
	handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function UploadStep({
	paperDetails,
	setPaperDetails,
	subjects,
	isCreatingSubject,
	setIsCreatingSubject,
	newSubjectName,
	setNewSubjectName,
	handleCreateSubject,
	isDragging,
	file,
	handleDrag,
	handleDrop,
	handleFileChange,
}: UploadStepProps) {
	return (
		<div className="p-8 space-y-8">
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				<div className="space-y-3">
					<Label className="font-black text-[10px]  tracking-widest text-muted-foreground">
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
					<Label className="font-black text-[10px]  tracking-widest text-muted-foreground">
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
					<Label className="font-black text-[10px]  tracking-widest text-muted-foreground">
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
				<Label className="font-black text-[10px]  tracking-widest text-muted-foreground">
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
								file || isDragging ? 'bg-brand-blue text-white' : 'bg-muted text-muted-foreground'
							} ${isDragging ? 'animate-pulse' : ''}`}
						>
							<HugeiconsIcon icon={Upload01Icon} className="h-8 w-8" />
						</div>
						<div className="text-center">
							<p className="font-black  tracking-widest text-xs">
								{isDragging ? 'Drop PDF Here' : file ? file.name : 'Drop PDF or Click to Browse'}
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
	);
}
