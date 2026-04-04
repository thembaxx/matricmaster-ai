import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { LOOKING_FOR_OPTIONS, SUBJECTS } from './constants';

interface ProfileData {
	bio: string;
	studyGoals: string;
	selectedSubjects: string[];
}

interface ProfileTabProps {
	profile: ProfileData;
	onProfileChange: (updater: (prev: ProfileData) => ProfileData) => void;
}

export function ProfileTab({ profile, onProfileChange }: ProfileTabProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>My Study Buddy Profile</CardTitle>
				<CardDescription>Set up your profile to help others find you</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<div>
					<label htmlFor="profile_input" className="text-sm font-medium mb-2 block">
						Bio
					</label>
					<Textarea
						id="profile_input"
						placeholder="Tell others about yourself and your study goals..."
						value={profile.bio}
						onChange={(e) => onProfileChange((prev) => ({ ...prev, bio: e.target.value }))}
						className="min-h-25"
					/>
				</div>

				<div>
					<label htmlFor="goal_input" className="text-sm font-medium mb-2 block">
						Study Goals
					</label>
					<Textarea
						id="goal_input"
						placeholder="What do you want to achieve?"
						value={profile.studyGoals}
						onChange={(e) => onProfileChange((prev) => ({ ...prev, studyGoals: e.target.value }))}
					/>
				</div>

				<div>
					<p className="text-sm font-medium mb-2 block">Subjects You Need Help With</p>
					<div className="flex gap-2 flex-wrap">
						{SUBJECTS.map((subject) => (
							<Badge
								key={subject}
								variant={profile.selectedSubjects.includes(subject) ? 'default' : 'outline'}
								className="cursor-pointer"
								role="button"
								tabIndex={0}
								onClick={() => {
									onProfileChange((prev) => ({
										...prev,
										selectedSubjects: prev.selectedSubjects.includes(subject)
											? prev.selectedSubjects.filter((s) => s !== subject)
											: [...prev.selectedSubjects, subject],
									}));
								}}
								onKeyDown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										onProfileChange((prev) => ({
											...prev,
											selectedSubjects: prev.selectedSubjects.includes(subject)
												? prev.selectedSubjects.filter((s) => s !== subject)
												: [...prev.selectedSubjects, subject],
										}));
									}
								}}
							>
								{subject}
							</Badge>
						))}
					</div>
				</div>

				<div>
					<p className="text-sm font-medium mb-2 block">Looking For</p>
					<div className="flex gap-2 flex-wrap">
						{LOOKING_FOR_OPTIONS.map((item) => (
							<Badge key={item} variant="outline" className="cursor-pointer">
								{item}
							</Badge>
						))}
					</div>
				</div>

				<div className="flex items-center gap-4">
					<Button>FloppyDisk Profile</Button>
					<Button variant="outline">Make Profile Visible</Button>
				</div>
			</CardContent>
		</Card>
	);
}
