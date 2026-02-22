'use client';

import {
	CheckCircle,
	Clock,
	MessageCircle,
	Search,
	Target,
	UserPlus,
	Users,
	XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useSession } from '@/lib/auth-client';
import {
	getDiscoverableBuddies,
	getPendingRequests,
	getStudyBuddyProfile,
	getUserBuddies,
	getUserInfo,
} from '@/lib/db/buddy-actions';

interface StudyBuddy {
	id: string;
	name: string;
	avatar?: string;
	bio: string;
	subjects: string[];
	studyGoals: string;
	isOnline?: boolean;
	userId?: string;
}

interface BuddyRequest {
	id: string;
	fromUser: StudyBuddy;
	message?: string;
	createdAt: string;
}

const SUBJECTS = [
	'Mathematics',
	'Physical Sciences',
	'Life Sciences',
	'Geography',
	'History',
	'English',
	'Afrikaans',
	'Accounting',
	'Economics',
];

export default function StudyBuddiesPage() {
	const { data: session } = useSession();
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
	const [activeTab, setActiveTab] = useState('discover');
	const [buddyRequests, setBuddyRequests] = useState<BuddyRequest[]>([]);
	const [myBuddies, setMyBuddies] = useState<StudyBuddy[]>([]);
	const [discoverableBuddies, setDiscoverableBuddies] = useState<StudyBuddy[]>([]);
	const [profile, setProfile] = useState({
		bio: '',
		studyGoals: '',
		selectedSubjects: [] as string[],
	});
	const [_isLoading, setIsLoading] = useState(true);

	const loadData = useCallback(async () => {
		if (!session?.user?.id) return;
		setIsLoading(true);

		try {
			// Load profile
			const profileData = await getStudyBuddyProfile(session.user.id);
			if (profileData) {
				// Parse preferredSubjects from JSON string if needed
				let subjects: string[] = [];
				if (profileData.preferredSubjects) {
					try {
						subjects =
							typeof profileData.preferredSubjects === 'string'
								? JSON.parse(profileData.preferredSubjects)
								: profileData.preferredSubjects;
					} catch {
						subjects = [];
					}
				}
				setProfile({
					bio: profileData.bio || '',
					studyGoals: profileData.studyGoals || '',
					selectedSubjects: subjects,
				});
			}

			// Load discoverable buddies
			const discoverable = await getDiscoverableBuddies(session.user.id, 20);

			// Get user names for each buddy
			const buddiesWithNames = await Promise.all(
				discoverable.map(async (buddy) => {
					try {
						const user = await getUserInfo(buddy.userId);
						return {
							id: buddy.userId,
							userId: buddy.userId,
							name: user?.name || 'Unknown User',
							avatar: user?.image || undefined,
							bio: buddy.bio || '',
							subjects: buddy.preferredSubjects || [],
							studyGoals: buddy.studyGoals || '',
						} as StudyBuddy;
					} catch {
						return {
							id: buddy.userId,
							userId: buddy.userId,
							name: 'Unknown User',
							bio: buddy.bio || '',
							subjects: buddy.preferredSubjects || [],
							studyGoals: buddy.studyGoals || '',
						} as StudyBuddy;
					}
				})
			);
			setDiscoverableBuddies(buddiesWithNames);

			// Load user's buddies
			const buddies = await getUserBuddies(session.user.id);
			const buddiesList = await Promise.all(
				buddies.map(async (buddy) => {
					try {
						const user = await getUserInfo(buddy.userId);
						return {
							id: buddy.userId,
							userId: buddy.userId,
							name: user?.name || 'Unknown User',
							avatar: user?.image || undefined,
							bio: buddy.bio || '',
							subjects: buddy.preferredSubjects || [],
							studyGoals: buddy.studyGoals || '',
						} as StudyBuddy;
					} catch {
						return {
							id: buddy.userId,
							userId: buddy.userId,
							name: 'Unknown User',
							bio: buddy.bio || '',
							subjects: buddy.preferredSubjects || [],
							studyGoals: buddy.studyGoals || '',
						} as StudyBuddy;
					}
				})
			);
			setMyBuddies(buddiesList);

			// Load pending requests
			const requests = await getPendingRequests(session.user.id);
			const requestsWithUsers = await Promise.all(
				requests.map(async (req) => {
					try {
						const user = await getUserInfo(req.requesterId);
						return {
							id: req.id,
							fromUser: {
								id: req.requesterId,
								userId: req.requesterId,
								name: user?.name || 'Unknown User',
								avatar: user?.image || undefined,
								bio: '',
								subjects: [],
								studyGoals: '',
							},
							message: req.message || undefined,
							createdAt: req.createdAt?.toISOString() ?? new Date().toISOString(),
						} as BuddyRequest;
					} catch {
						return {
							id: req.id,
							fromUser: {
								id: req.requesterId,
								userId: req.requesterId,
								name: 'Unknown User',
								bio: '',
								subjects: [],
								studyGoals: '',
							},
							message: req.message || undefined,
							createdAt: req.createdAt?.toISOString() ?? new Date().toISOString(),
						} as BuddyRequest;
					}
				})
			);
			setBuddyRequests(requestsWithUsers);
		} catch (error) {
			console.error('Error loading study buddies data:', error);
		} finally {
			setIsLoading(false);
		}
	}, [session?.user?.id]);

	// Load data on mount
	useEffect(() => {
		if (session?.user?.id) {
			loadData();
		}
	}, [session?.user?.id, loadData]);

	const handleSubjectToggle = (subject: string) => {
		setSelectedSubjects((prev) =>
			prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
		);
	};

	const handleSendRequest = async (buddyId: string) => {
		// API call would go here
		console.log('Sending buddy request to:', buddyId);
	};

	const handleAcceptRequest = async (requestId: string) => {
		setBuddyRequests((prev) => prev.filter((r) => r.id !== requestId));
		// API call would go here
	};

	const handleRejectRequest = async (requestId: string) => {
		setBuddyRequests((prev) => prev.filter((r) => r.id !== requestId));
	};

	const filteredBuddies = discoverableBuddies.filter((buddy) => {
		const matchesSearch =
			buddy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			buddy.bio.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesSubjects =
			selectedSubjects.length === 0 || buddy.subjects.some((s) => selectedSubjects.includes(s));
		return matchesSearch && matchesSubjects;
	});

	return (
		<div className="container mx-auto py-8 max-w-6xl px-6">
			<div className="flex items-center gap-3 mb-6">
				<Users className="h-8 w-8 text-primary" />
				<div>
					<h1 className="text-3xl font-bold">Study Buddies</h1>
					<p className="text-muted-foreground">Find and connect with fellow learners</p>
				</div>
			</div>

			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList className="grid w-full grid-cols-4">
					<TabsTrigger value="discover">Discover</TabsTrigger>
					<TabsTrigger value="requests">
						Requests
						{buddyRequests.length > 0 && (
							<Badge
								variant="destructive"
								className="ml-2 h-5 w-5 p-0 flex items-center justify-center"
							>
								{buddyRequests.length}
							</Badge>
						)}
					</TabsTrigger>
					<TabsTrigger value="my-buddies">My Buddies</TabsTrigger>
					<TabsTrigger value="profile">My Profile</TabsTrigger>
				</TabsList>

				{/* Discover Tab */}
				<TabsContent value="discover" className="space-y-4">
					{/* Search & Filters */}
					<Card>
						<CardContent className="pt-6">
							<div className="flex gap-4 flex-wrap">
								<div className="flex-1 min-w-50">
									<div className="relative">
										<Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
										<Input
											placeholder="Search by name or bio..."
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
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
											onClick={() => handleSubjectToggle(subject)}
										>
											{subject}
										</Badge>
									))}
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Buddy Cards */}
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
										<Target className="h-3 w-3 inline mr-1" />
										{buddy.studyGoals}
									</p>
									<div className="flex gap-2">
										<Button
											size="sm"
											className="flex-1"
											onClick={() => handleSendRequest(buddy.id)}
										>
											<UserPlus className="h-4 w-4 mr-2" />
											Connect
										</Button>
										<Button size="sm" variant="outline">
											<MessageCircle className="h-4 w-4" />
										</Button>
									</div>
								</CardContent>
							</Card>
						))}
					</div>

					{filteredBuddies.length === 0 && (
						<Card>
							<CardContent className="py-12 text-center">
								<Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
								<p className="text-muted-foreground">
									No study buddies found matching your criteria
								</p>
							</CardContent>
						</Card>
					)}
				</TabsContent>

				{/* Requests Tab */}
				<TabsContent value="requests" className="space-y-4">
					{buddyRequests.length > 0 ? (
						buddyRequests.map((request) => (
							<Card key={request.id}>
								<CardContent className="pt-6">
									<div className="flex items-center gap-4">
										<Avatar>
											<AvatarImage src={request.fromUser.avatar} />
											<AvatarFallback>{request.fromUser.name[0]}</AvatarFallback>
										</Avatar>
										<div className="flex-1">
											<p className="font-medium">{request.fromUser.name}</p>
											<p className="text-sm text-muted-foreground">Wants to be your study buddy</p>
											{request.message && (
												<p className="text-sm mt-1 italic">"{request.message}"</p>
											)}
										</div>
										<div className="flex gap-2">
											<Button size="sm" onClick={() => handleAcceptRequest(request.id)}>
												<CheckCircle className="h-4 w-4 mr-1" />
												Accept
											</Button>
											<Button
												size="sm"
												variant="outline"
												onClick={() => handleRejectRequest(request.id)}
											>
												<XCircle className="h-4 w-4 mr-1" />
												Decline
											</Button>
										</div>
									</div>
								</CardContent>
							</Card>
						))
					) : (
						<Card>
							<CardContent className="py-12 text-center">
								<Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
								<p className="text-muted-foreground">No pending buddy requests</p>
							</CardContent>
						</Card>
					)}
				</TabsContent>

				{/* My Buddies Tab */}
				<TabsContent value="my-buddies" className="space-y-4">
					{myBuddies.length > 0 ? (
						<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
							{myBuddies.map((buddy) => (
								<Card key={buddy.id}>
									<CardContent className="pt-6">
										<div className="flex items-center gap-3 mb-4">
											<Avatar>
												<AvatarImage src={buddy.avatar} />
												<AvatarFallback>{buddy.name[0]}</AvatarFallback>
											</Avatar>
											<div>
												<p className="font-medium">{buddy.name}</p>
												<div className="flex gap-1">
													{buddy.subjects.map((s) => (
														<Badge key={s} variant="secondary" className="text-xs">
															{s}
														</Badge>
													))}
												</div>
											</div>
										</div>
										<Button size="sm" className="w-full">
											<MessageCircle className="h-4 w-4 mr-2" />
											Message
										</Button>
									</CardContent>
								</Card>
							))}
						</div>
					) : (
						<Card>
							<CardContent className="py-12 text-center">
								<Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
								<p className="text-muted-foreground mb-4">
									You haven't connected with any study buddies yet
								</p>
								<Button onClick={() => setActiveTab('discover')}>Find Study Buddies</Button>
							</CardContent>
						</Card>
					)}
				</TabsContent>

				{/* Profile Tab */}
				<TabsContent value="profile">
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
									onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
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
									onChange={(e) => setProfile({ ...profile, studyGoals: e.target.value })}
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
											onClick={() => {
												setProfile((prev) => ({
													...prev,
													selectedSubjects: prev.selectedSubjects.includes(subject)
														? prev.selectedSubjects.filter((s) => s !== subject)
														: [...prev.selectedSubjects, subject],
												}));
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
									{['Study partner', 'Tutor', 'Accountability buddy', 'Group study'].map((item) => (
										<Badge key={item} variant="outline" className="cursor-pointer">
											{item}
										</Badge>
									))}
								</div>
							</div>

							<div className="flex items-center gap-4">
								<Button>Save Profile</Button>
								<Button variant="outline">Make Profile Visible</Button>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
