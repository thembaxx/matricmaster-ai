'use client';

import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { useLanguageStore } from '@/hooks/useLanguage';
import { CURRICULUM_TYPES, type CurriculumType, SUPPORTED_CURRICULUMS } from '@/lib/i18n/languages';

interface CurriculumSelectorProps {
	label?: string;
	showDescription?: boolean;
	className?: string;
}

export function CurriculumSelector({
	label = 'Curriculum',
	showDescription = true,
	className = '',
}: CurriculumSelectorProps) {
	const { curriculum, setCurriculum } = useLanguageStore();

	return (
		<div className={className}>
			{label && (
				<Label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</Label>
			)}
			<Select value={curriculum} onValueChange={(value) => setCurriculum(value as CurriculumType)}>
				<SelectTrigger className="w-full mt-1">
					<SelectValue placeholder="Select curriculum" />
				</SelectTrigger>
				<SelectContent>
					{SUPPORTED_CURRICULUMS.map((cur) => (
						<SelectItem key={cur} value={cur}>
							<div className="flex flex-col">
								<span className="font-medium">{CURRICULUM_TYPES[cur].name}</span>
								{showDescription && (
									<span className="text-xs text-muted-foreground">
										{CURRICULUM_TYPES[cur].description}
									</span>
								)}
							</div>
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			{showDescription && (
				<p className="mt-2 text-xs text-muted-foreground">
					<span className="flex items-center gap-1">
						<AlertCircle className="w-3 h-3" />
						Your curriculum affects which lessons and past papers you see.
					</span>
				</p>
			)}
		</div>
	);
}

export function CurriculumBadge({ curriculum }: { curriculum: CurriculumType }) {
	return (
		<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
			{curriculum}
		</span>
	);
}

export function CurriculumCard({
	curriculum,
	isSelected,
	onSelect,
}: {
	curriculum: CurriculumType;
	isSelected: boolean;
	onSelect: (curriculum: CurriculumType) => void;
}) {
	const info = CURRICULUM_TYPES[curriculum];

	return (
		<Button
			type="button"
			variant="ghost"
			onClick={() => onSelect(curriculum)}
			className={`w-full p-4 h-auto text-left border rounded-lg ${
				isSelected
					? 'border-primary bg-primary/5 ring-1 ring-primary'
					: 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
			}`}
		>
			<div className="flex items-start justify-between">
				<div>
					<h3 className="font-semibold text-gray-900 dark:text-gray-100">{info.name}</h3>
					<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{info.fullName}</p>
				</div>
				{isSelected && (
					<span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs">
						✓
					</span>
				)}
			</div>
			<p className="mt-2 text-xs text-gray-400 dark:text-gray-500">{info.examsBody}</p>
		</Button>
	);
}
