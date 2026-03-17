'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { useGeminiQuotaModal } from '@/contexts/GeminiQuotaModalContext';
import { isQuotaError } from '@/lib/ai/quota-error';
import { generateUniversityPath } from '@/services/universityPathfinder';

interface UniversityPathfinderDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	initialUniversity?: string;
	initialFaculty?: string;
}

const UNIVERSITIES = [
	'University of Cape Town',
	'University of Pretoria',
	'University of the Witwatersrand',
	'Stellenbosch University',
	'University of Johannesburg',
	'University of KwaZulu-Natal',
	'University of the Free State',
	'University of the Western Cape',
];

const FACULTIES: Record<string, string[]> = {
	'University of Cape Town': ['Engineering', 'Health Sciences', 'Commerce', 'Science', 'Arts'],
	'University of Pretoria': ['Engineering', 'Medicine', 'Commerce', 'Science'],
	'University of the Witwatersrand': ['Engineering', 'Health Sciences', 'Commerce', 'Science'],
	'Stellenbosch University': ['Engineering', 'Medicine', 'Commerce', 'Science'],
	'University of Johannesburg': ['Engineering', 'Health Sciences', 'Commerce'],
	'University of KwaZulu-Natal': ['Engineering', 'Health Sciences', 'Commerce'],
	'University of the Free State': ['Engineering', 'Health Sciences', 'Commerce'],
	'University of the Western Cape': ['Dentistry', 'Science', 'Arts'],
};

export function UniversityPathfinderDialog({
	open,
	onOpenChange,
	initialUniversity,
	initialFaculty,
}: UniversityPathfinderDialogProps) {
	const router = useRouter();
	const { triggerQuotaError } = useGeminiQuotaModal();
	const [university, setUniversity] = useState(initialUniversity || '');
	const [faculty, setFaculty] = useState(initialFaculty || '');
	const [loading, setLoading] = useState(false);

	const faculties = UNIVERSITIES.includes(university) ? FACULTIES[university] : [];

	const handleGenerate = async () => {
		if (!university || !faculty) return;

		setLoading(true);
		try {
			await generateUniversityPath('user-id', university, faculty, 32, ['English'], []);

			onOpenChange(false);
			router.push('/study-plan?view=roadmap');
		} catch (error) {
			if (isQuotaError(error)) {
				triggerQuotaError();
			}
			console.error('Failed to generate roadmap:', error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Set University Goal</DialogTitle>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<label className="text-sm font-medium" htmlFor="university-select">
							University
						</label>
						<Select value={university} onValueChange={setUniversity}>
							<SelectTrigger id="university-select">
								<SelectValue placeholder="Select university" />
							</SelectTrigger>
							<SelectContent>
								{UNIVERSITIES.map((uni) => (
									<SelectItem key={uni} value={uni}>
										{uni}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium" htmlFor="faculty-select">
							Faculty
						</label>
						<Select value={faculty} onValueChange={setFaculty} disabled={!university}>
							<SelectTrigger id="faculty-select">
								<SelectValue placeholder="Select faculty" />
							</SelectTrigger>
							<SelectContent>
								{faculties.map((fac) => (
									<SelectItem key={fac} value={fac}>
										{fac}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{university && faculty && (
						<div className="p-4 bg-secondary rounded-lg">
							<p className="text-sm text-muted-foreground">
								This will generate a personalized study roadmap with milestones to help you reach
								your {university} goal.
							</p>
						</div>
					)}

					<div className="flex gap-2 justify-end">
						<Button variant="outline" onClick={() => onOpenChange(false)}>
							Cancel
						</Button>
						<Button onClick={handleGenerate} disabled={!university || !faculty || loading}>
							{loading ? 'Generating...' : 'Generate Roadmap'}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
