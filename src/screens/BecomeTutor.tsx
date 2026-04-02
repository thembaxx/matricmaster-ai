'use client';

import { GraduationCap, Sparkles, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BackgroundMesh } from '@/components/ui/background-mesh';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const SUBJECTS = [
	'Mathematics',
	'Physical Sciences',
	'Life Sciences',
	'Geography',
	'History',
	'English',
	'Afrikaans',
	'Economics',
	'Accounting',
	'Computer Applications Technology',
];

export default function BecomeTutor() {
	const router = useRouter();
	const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
	const [bio, setBio] = useState('');
	const [teachingStyle, setTeachingStyle] = useState('');
	const [hourlyRate, setHourlyRate] = useState('100');
	const [availability, setAvailability] = useState('');
	const [isAvailable, setIsAvailable] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isAlreadyTutor, setIsAlreadyTutor] = useState(false);

	useEffect(() => {
		const checkIfTutor = async () => {
			try {
				const response = await fetch('/api/marketplace?action=is-tutor');
				const data = await response.json();
				if (data.success && data.data.isTutor) {
					setIsAlreadyTutor(true);
				}
			} catch (error) {
				console.error('Error checking tutor status:', error);
			}
		};

		checkIfTutor();
	}, []);

	const handleToggleSubject = (subject: string) => {
		setSelectedSubjects((prev) =>
			prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
		);
	};

	const handleSubmit = async () => {
		if (selectedSubjects.length === 0) {
			alert('Please select at least one subject');
			return;
		}

		setIsSubmitting(true);
		try {
			const response = await fetch('/api/marketplace', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					action: 'create-profile',
					bio,
					teachingStyle,
					subjects: selectedSubjects,
					hourlyRateXP: Number.parseInt(hourlyRate, 10),
					availabilitySchedule: availability,
				}),
			});

			const data = await response.json();

			if (data.success) {
				router.push('/marketplace');
			} else {
				alert(data.error || 'Failed to create tutor profile');
			}
		} catch (error) {
			console.error('Error creating tutor profile:', error);
			alert('Failed to create tutor profile');
		} finally {
			setIsSubmitting(false);
		}
	};

	if (isAlreadyTutor) {
		return (
			<div className="flex flex-col h-full min-w-0 bg-background pb-40 px-4 sm:px-6 lg:px-8">
				<BackgroundMesh variant="subtle" />
				<main className="max-w-4xl mx-auto w-full pt-6 text-center relative z-10">
					<div className="size-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
						<GraduationCap className="size-8 text-green-600" />
					</div>
					<h1 className="text-2xl font-black">You are already a tutor!</h1>
					<p className="text-muted-foreground mt-2">
						Your tutor profile is active. Start helping other students!
					</p>
					<div className="flex gap-3 justify-center mt-6">
						<Button variant="outline" onClick={() => router.push('/marketplace')}>
							Browse Marketplace
						</Button>
						<Button onClick={() => router.push('/my-sessions')}>View My Sessions</Button>
					</div>
				</main>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full min-w-0 bg-background pb-40 px-4 sm:px-6 lg:px-8">
			<BackgroundMesh variant="subtle" />

			<main className="max-w-4xl mx-auto w-full pt-6 space-y-6 relative z-10">
				<div>
					<h1 className="text-2xl font-black tracking-tight">Become a Tutor</h1>
					<p className="text-sm text-muted-foreground mt-1">
						Share your knowledge and earn XP by helping other students
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<Card className="p-4 rounded-2xl border-border/50 bg-card/60 backdrop-blur-sm">
						<div className="size-10 bg-primary/10 rounded-full flex items-center justify-center mb-3">
							<GraduationCap className="size-5 text-primary" />
						</div>
						<h3 className="font-bold text-sm">Share Knowledge</h3>
						<p className="text-xs text-muted-foreground mt-1">
							Help other students master difficult topics
						</p>
					</Card>

					<Card className="p-4 rounded-2xl border-border/50 bg-card/60 backdrop-blur-sm">
						<div className="size-10 bg-primary/10 rounded-full flex items-center justify-center mb-3">
							<Sparkles className="size-5 text-primary" />
						</div>
						<h3 className="font-bold text-sm">Earn XP</h3>
						<p className="text-xs text-muted-foreground mt-1">
							Get paid in XP for every session you complete
						</p>
					</Card>

					<Card className="p-4 rounded-2xl border-border/50 bg-card/60 backdrop-blur-sm">
						<div className="size-10 bg-primary/10 rounded-full flex items-center justify-center mb-3">
							<TrendingUp className="size-5 text-primary" />
						</div>
						<h3 className="font-bold text-sm">Build Reputation</h3>
						<p className="text-xs text-muted-foreground mt-1">
							Get rated by students and build your profile
						</p>
					</Card>
				</div>

				<Card className="p-6 rounded-3xl border-border/50 bg-card/60 backdrop-blur-sm">
					<h2 className="text-lg font-bold mb-6">Set up your tutor profile</h2>

					<div className="space-y-6">
						<div>
							<Label>Subjects you can teach *</Label>
							<div className="flex flex-wrap gap-2 mt-3">
								{SUBJECTS.map((subject) => (
									<Button
										key={subject}
										variant={selectedSubjects.includes(subject) ? 'default' : 'outline'}
										type="button"
										onClick={() => handleToggleSubject(subject)}
										className="px-3 py-1.5 rounded-full text-sm transition-colors"
									>
										{subject}
									</Button>
								))}
							</div>
							{selectedSubjects.length === 0 && (
								<p className="text-xs text-muted-foreground mt-2">Select at least one subject</p>
							)}
						</div>

						<div>
							<Label htmlFor="bio">Bio</Label>
							<Textarea
								id="bio"
								value={bio}
								onChange={(e) => setBio(e.target.value)}
								placeholder="Tell students about yourself and your background..."
								className="mt-2"
								rows={4}
							/>
						</div>

						<div>
							<Label htmlFor="teachingStyle">Teaching Style</Label>
							<Textarea
								id="teachingStyle"
								value={teachingStyle}
								onChange={(e) => setTeachingStyle(e.target.value)}
								placeholder="Describe how you like to teach..."
								className="mt-2"
								rows={3}
							/>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div>
								<Label htmlFor="hourlyRate">Hourly Rate (XP) *</Label>
								<Input
									id="hourlyRate"
									type="number"
									value={hourlyRate}
									onChange={(e) => setHourlyRate(e.target.value)}
									min={10}
									max={1000}
									step={10}
									className="mt-2"
								/>
								<p className="text-xs text-muted-foreground mt-1">
									Students will pay this XP per hour
								</p>
							</div>

							<div>
								<Label>Quick Rate Presets</Label>
								<Select value={hourlyRate} onValueChange={setHourlyRate}>
									<SelectTrigger className="mt-2">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="50">Budget (50 XP/hr)</SelectItem>
										<SelectItem value="100">Standard (100 XP/hr)</SelectItem>
										<SelectItem value="200">Premium (200 XP/hr)</SelectItem>
										<SelectItem value="500">Expert (500 XP/hr)</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						<div>
							<Label htmlFor="availability">Availability</Label>
							<Textarea
								id="availability"
								value={availability}
								onChange={(e) => setAvailability(e.target.value)}
								placeholder="e.g., Weekdays after 4pm, Weekends anytime..."
								className="mt-2"
								rows={3}
							/>
						</div>

						<div className="flex items-center space-x-2">
							<Checkbox
								id="available"
								checked={isAvailable}
								onCheckedChange={(checked) => setIsAvailable(checked as boolean)}
							/>
							<Label htmlFor="available" className="cursor-pointer">
								I'm available to take sessions now
							</Label>
						</div>

						<div className="flex justify-end gap-3 pt-4 border-t">
							<Button variant="outline" onClick={() => router.back()}>
								Cancel
							</Button>
							<Button
								onClick={handleSubmit}
								disabled={selectedSubjects.length === 0 || isSubmitting}
								className="gap-2"
							>
								{isSubmitting ? 'Creating...' : 'Create Tutor Profile'}
							</Button>
						</div>
					</div>
				</Card>
			</main>
		</div>
	);
}
