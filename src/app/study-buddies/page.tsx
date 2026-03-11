'use client';

import {
	Chat01Icon as ChatCircle,
	CheckCircleIcon as CheckCircle,
	Clock01Icon as Clock,
	Search01Icon as MagnifyingGlass,
	Target02Icon as Target,
	UserPlus01Icon as UserPlus,
	UserGroupIcon as Users,
	CancelCircleIcon as XCircle,
} from 'hugeicons-react';
import { useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useSession } from '@/lib/auth-client';
import { useStudyBuddyStore } from '@/stores/useStudyBuddyStore';
import PageTransition from '@/components/Transition/PageTransition';

const SUBJECTS = [
	'Mathematics',
	'Physical Sciences',
	'Life Sciences',
	'Geography',
	'ClockCounterClockwise',
	'English',
	'Afrikaans',
	'Accounting',
	'Economics',
];

export default function StudyBuddiesPage() {
	const { data: session } = useSession();

	const searchQuery = useStudyBuddyStore((s) => s.searchQuery);
	const selectedSubjects = useStudyBuddyStore((s) => s.selectedSubjects);
	const activeTab = useStudyBuddyStore((s) => s.activeTab);
	const buddyRequests = useStudyBuddyStore((s) => s.buddyRequests);
	const myBuddies = useStudyBuddyStore((s) => s.myBuddies);
	const discoverableBuddies = useStudyBuddyStore((s) => s.discoverableBuddies);
	const profile = useStudyBuddyStore((s) => s.profile);

	const setSearchQuery = useStudyBuddyStore((s) => s.setSearchQuery);
	const setActiveTab = useStudyBuddyStore((s) => s.setActiveTab);
	const setProfile = useStudyBuddyStore((s) => s.setProfile);
	const loadData = useStudyBuddyStore((s) => s.loadData);
	const handleSubjectToggle = useStudyBuddyStore((s) => s.handleSubjectToggle);
	const handleSendRequest = useStudyBuddyStore((s) => s.handleSendRequest);
	const handleAcceptRequest = useStudyBuddyStore((s) => s.handleAcceptRequest);
	const handleRejectRequest = useStudyBuddyStore((s) => s.handleRejectRequest);

	// Load data on mount
	useEffect(() => {
		if (session?.user?.id) {
			loadData(session.user.id);
		}
	}, [session?.user?.id, loadData]);

	const filteredBuddies = discoverableBuddies.filter((buddy) => {
		const matchesSearch =
			buddy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			buddy.bio.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesSubjects =
			selectedSubjects.length === 0 || buddy.subjects.some((s) => selectedSubjects.includes(s));
		return matchesSearch && matchesSubjects;
	});

	return (
		<PageTransition>
			<div className="container mx-auto py-8 max-w-6xl px-6">
			<div className="flex items-center gap-4 mb-12">
				<div className="w-16 h-16 rounded-[2rem] bg-primary/10 flex items-center justify-center">
					<Users size={32} className="text-primary stroke-[3]" />
				</div>
				<div>
					<h1 className="text-4xl font-black tracking-tighter uppercase">Study buddies</h1>
					<p className="text-muted-foreground font-bold">Find and connect with fellow learners</p>
				</div>
			</div>

			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList className="grid w-full grid-cols-4 h-16 p-1.5 bg-muted/20 rounded-[2rem] mb-8">
					<TabsTrigger value="discover" className="rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest">Discover</TabsTrigger>
					<TabsTrigger value="requests" className="rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest">
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
					<TabsTrigger value="my-buddies" className="rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest">My buddies</TabsTrigger>
					<TabsTrigger value="profile" className="rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest">My profile</TabsTrigger>
				</TabsList>

				{/* Discover Tab */}
				<TabsContent value="discover" className="space-y-4">
					{/* MagnifyingGlass & Filters */}
					<Card>
						<CardContent className="pt-6">
							<div className="flex gap-4 flex-wrap">
								<div className="flex-1 min-w-50">
									<div className="relative">
										<MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40 stroke-[3]" />
										<Input
											placeholder="Search by name or bio..."
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
											className="pl-12 h-14 rounded-2xl border-none bg-muted/20 focus-visible:ring-primary/20"
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
										<Target weight="bold" className="h-3 w-3 inline mr-1" />
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
											<ChatCircle className="h-4 w-4" />
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
											<ChatCircle className="h-4 w-4 mr-2" />
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
									onChange={(e) => setProfile((prev) => ({ ...prev, bio: e.target.value }))}
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
									onChange={(e) => setProfile((prev) => ({ ...prev, studyGoals: e.target.value }))}
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
		</PageTransition>
	);
}
