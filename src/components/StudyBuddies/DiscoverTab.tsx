import {
	Chat01Icon,
	Search01Icon,
	Target01Icon,
	UserGroupIcon,
	UserPlus,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { StudyBuddy } from '@/stores/useStudyBuddyStore';
import { SUBJECTS } from './constants';

interface DiscoverTabProps {
	searchQuery: string;
	selectedSubjects: string[];
	filteredBuddies: StudyBuddy[];
	onSearchChange: (query: string) => void;
	onSubjectToggle: (subject: string) => void;
	onSendRequest: (buddyId: string) => void;
}

export function DiscoverTab({
	searchQuery,
	selectedSubjects,
	filteredBuddies,
	onSearchChange,
	onSubjectToggle,
	onSendRequest,
}: DiscoverTabProps) {
	return (
		<>
			<Card>
				<CardContent className="pt-6">
					<div className="flex gap-4 flex-wrap">
						<div className="flex-1 min-w-50">
							<div className="relative">
								<HugeiconsIcon
									icon={Search01Icon}
									className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
								/>
								<Input
									placeholder="MagnifyingGlass by name or bio..."
									value={searchQuery}
									onChange={(e) => onSearchChange(e.target.value)}
									className="pl-10"
								/>
							</div>
						</div>
						<div className="flex gap-2 flex-wrap">
							{SUBJECTS.slice(0, 5).map((subject) => (
								<Badge
									key={subject}
									variant={selectedSubjects.includes(subject) ? 'default' : 'outline'}
									className="cursor-pointer"
									onClick={() => onSubjectToggle(subject)}
								>
									{subject}
								</Badge>
							))}
						</div>
					</div>
				</CardContent>
			</Card>

			<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
				{filteredBuddies.map((buddy) => (
					<Card key={buddy.id} className="hover:shadow-lg transition-shadow">
						<CardHeader className="pb-2">
							<div className="flex items-start gap-3">
								<Avatar className="h-12 w-12">
									<AvatarImage src={buddy.avatar} />
									<AvatarFallback>{buddy.name[0]}</AvatarFallback>
								</Avatar>
								<div className="flex-1">
									<CardTitle className="text-lg">{buddy.name}</CardTitle>
									<div className="flex gap-1 mt-1">
										{buddy.subjects.slice(0, 2).map((subject) => (
											<Badge key={subject} variant="secondary" className="text-xs">
												{subject}
											</Badge>
										))}
									</div>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground mb-4">{buddy.bio}</p>
							<p className="text-xs text-muted-foreground mb-4">
								<HugeiconsIcon icon={Target01Icon} className="h-3 w-3 inline mr-1" />
								{buddy.studyGoals}
							</p>
							<div className="flex gap-2">
								<Button size="sm" className="flex-1" onClick={() => onSendRequest(buddy.id)}>
									<HugeiconsIcon icon={UserPlus} className="h-4 w-4 mr-2" />
									Connect
								</Button>
								<Button size="sm" variant="outline">
									<HugeiconsIcon icon={Chat01Icon} className="h-4 w-4" />
								</Button>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{filteredBuddies.length === 0 && (
				<Card>
					<CardContent className="py-12 text-center">
						<HugeiconsIcon
							icon={UserGroupIcon}
							className="h-12 w-12 mx-auto mb-4 text-muted-foreground"
						/>
						<p className="text-muted-foreground">No study buddies found matching your criteria</p>
					</CardContent>
				</Card>
			)}
		</>
	);
}
