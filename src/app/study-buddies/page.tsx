'use client';

import { UserGroupIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useEffect } from 'react';
import { DiscoverTab } from '@/components/StudyBuddies/DiscoverTab';
import { ProfileTab } from '@/components/StudyBuddies/ProfileTab';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSession } from '@/lib/auth-client';
import { useStudyBuddyStore } from '@/stores/useStudyBuddyStore';

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
		<div className="container mx-auto py-8 max-w-6xl px-6">
			<div className="flex items-center gap-3 mb-6">
				<HugeiconsIcon icon={UserGroupIcon} className="h-8 w-8 text-primary" />
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

				<TabsContent value="discover" className="space-y-4">
					<DiscoverTab
						searchQuery={searchQuery}
						selectedSubjects={selectedSubjects}
						filteredBuddies={filteredBuddies}
						onSearchChange={setSearchQuery}
						onSubjectToggle={handleSubjectToggle}
						onSendRequest={handleSendRequest}
					/>
				</TabsContent>

				<TabsContent value="requests" className="space-y-4">
					{buddyRequests.length > 0 ? (
						buddyRequests.map((request) => (
							<Card key={request.id}>
								<CardContent className="pt-6">
									<div className="flex items-center gap-4">
										<div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
											{request.fromUser.name[0]}
										</div>
										<div className="flex-1">
											<p className="font-medium">{request.fromUser.name}</p>
											<p className="text-sm text-muted-foreground">Wants to be your study buddy</p>
											{request.message && (
												<p className="text-sm mt-1 italic">"{request.message}"</p>
											)}
										</div>
										<div className="flex gap-2">
											<Button size="sm" onClick={() => handleAcceptRequest(request.id)}>
												Accept
											</Button>
											<Button
												size="sm"
												variant="outline"
												onClick={() => handleRejectRequest(request.id)}
											>
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
								<HugeiconsIcon
									icon={UserGroupIcon}
									className="h-12 w-12 mx-auto mb-4 text-muted-foreground"
								/>
								<p className="text-muted-foreground">No pending buddy requests</p>
							</CardContent>
						</Card>
					)}
				</TabsContent>

				<TabsContent value="my-buddies" className="space-y-4">
					{myBuddies.length > 0 ? (
						<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
							{myBuddies.map((buddy) => (
								<Card key={buddy.id}>
									<CardContent className="pt-6">
										<div className="flex items-center gap-3 mb-4">
											<div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
												{buddy.name[0]}
											</div>
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
											Message
										</Button>
									</CardContent>
								</Card>
							))}
						</div>
					) : (
						<Card>
							<CardContent className="py-12 text-center">
								<HugeiconsIcon
									icon={UserGroupIcon}
									className="h-12 w-12 mx-auto mb-4 text-muted-foreground"
								/>
								<p className="text-muted-foreground mb-4">
									You haven't connected with any study buddies yet
								</p>
								<Button onClick={() => setActiveTab('discover')}>Find Study Buddies</Button>
							</CardContent>
						</Card>
					)}
				</TabsContent>

				<TabsContent value="profile">
					<ProfileTab profile={profile} onProfileChange={setProfile} />
				</TabsContent>
			</Tabs>
		</div>
	);
}
