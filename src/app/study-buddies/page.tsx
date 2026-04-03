'use client';

import { UserGroupIcon, VideoReplayIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { DiscoverTab } from '@/components/StudyBuddies/DiscoverTab';
import { ProfileTab } from '@/components/StudyBuddies/ProfileTab';
import { VideoCallInvite } from '@/components/StudyBuddies/VideoCallInvite';
import { WeakAreasBanner } from '@/components/StudyBuddies/WeakAreasBanner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSession } from '@/lib/auth-client';
import { useStudyBuddyStore } from '@/stores/useStudyBuddyStore';

export default function StudyBuddiesPage() {
	const router = useRouter();
	const { data: session } = useSession();

	const searchQuery = useStudyBuddyStore((s) => s.searchQuery);
	const selectedSubjects = useStudyBuddyStore((s) => s.selectedSubjects);
	const activeTab = useStudyBuddyStore((s) => s.activeTab);
	const buddyRequests = useStudyBuddyStore((s) => s.buddyRequests);
	const myBuddies = useStudyBuddyStore((s) => s.myBuddies);
	const discoverableBuddies = useStudyBuddyStore((s) => s.discoverableBuddies);
	const profile = useStudyBuddyStore((s) => s.profile);
	const weakAreaMatches = useStudyBuddyStore((s) => s.weakAreaMatches);

	const setSearchQuery = useStudyBuddyStore((s) => s.setSearchQuery);
	const setActiveTab = useStudyBuddyStore((s) => s.setActiveTab);
	const setProfile = useStudyBuddyStore((s) => s.setProfile);
	const loadData = useStudyBuddyStore((s) => s.loadData);
	const loadWeakAreaMatches = useStudyBuddyStore((s) => s.loadWeakAreaMatches);
	const handleSubjectToggle = useStudyBuddyStore((s) => s.handleSubjectToggle);
	const handleSendRequest = useStudyBuddyStore((s) => s.handleSendRequest);
	const handleAcceptRequest = useStudyBuddyStore((s) => s.handleAcceptRequest);
	const handleRejectRequest = useStudyBuddyStore((s) => s.handleRejectRequest);

	const [videoInvites, setVideoInvites] = useState<
		Array<{
			id: string;
			callerName: string;
			callerInitials: string;
			subject: string;
			roomName: string;
			roomUrl: string;
		}>
	>([]);

	useEffect(() => {
		if (session?.user?.id) {
			loadData(session.user.id).then(() => {
				loadWeakAreaMatches(session.user.id);
			});
		}
	}, [session?.user?.id, loadData, loadWeakAreaMatches]);

	const filteredBuddies = discoverableBuddies.filter((buddy) => {
		const matchesSearch =
			buddy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			buddy.bio.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesSubjects =
			selectedSubjects.length === 0 || buddy.subjects.some((s) => selectedSubjects.includes(s));
		return matchesSearch && matchesSubjects;
	});

	const handleStartVideoCall = useCallback(
		async (buddy: { id: string; name: string; subjects: string[] }) => {
			if (!session?.user?.id) return;

			const subject = buddy.subjects[0] || 'Study Session';

			try {
				toast.loading('Creating video call room...');
				const response = await fetch('/api/video-calls', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						participantIds: [buddy.id],
						subject,
					}),
				});

				const result = await response.json();
				toast.dismiss();

				if (result.success && result.data) {
					toast.success('Video call room created!');
					const params = new URLSearchParams({
						room: result.data.roomName,
						url: result.data.roomUrl,
						subject,
						participants: JSON.stringify([
							{ id: buddy.id, name: buddy.name, isMuted: false, hasVideo: true },
						]),
					});
					router.push(`/video-call?${params.toString()}`);
				} else {
					toast.error(result.error || 'Failed to create video call');
				}
			} catch (error) {
				toast.dismiss();
				toast.error('Failed to start video call');
				console.debug('Error starting video call:', error);
			}
		},
		[session?.user?.id, router]
	);

	const handleAcceptVideoInvite = useCallback(
		(roomName: string, roomUrl: string) => {
			const params = new URLSearchParams({
				room: roomName,
				url: roomUrl,
				subject: 'Study Session',
			});
			router.push(`/video-call?${params.toString()}`);
		},
		[router]
	);

	const handleDeclineVideoInvite = useCallback((inviteId: string) => {
		setVideoInvites((prev) => prev.filter((i) => i.id !== inviteId));
		toast.info('Video call declined');
	}, []);

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
					<WeakAreasBanner onSelectSubject={(subject) => handleSubjectToggle(subject)} />
					<DiscoverTab
						searchQuery={searchQuery}
						selectedSubjects={selectedSubjects}
						filteredBuddies={filteredBuddies}
						weakAreaMatches={weakAreaMatches}
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
											<div className="relative">
												<div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
													{buddy.name[0]}
												</div>
												{buddy.isOnline && (
													<div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-card" />
												)}
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
										<div className="flex gap-2">
											<Button
												size="sm"
												className="flex-1"
												onClick={() => router.push(`/chat?buddy=${buddy.id}`)}
											>
												Message
											</Button>
											<Button
												size="sm"
												variant="outline"
												className="gap-1.5"
												onClick={() =>
													handleStartVideoCall({
														id: buddy.id,
														name: buddy.name,
														subjects: buddy.subjects,
													})
												}
											>
												<HugeiconsIcon icon={VideoReplayIcon} className="h-4 w-4" />
												Call
											</Button>
										</div>
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

			{/* Video call invite overlays */}
			{videoInvites.length > 0 && (
				<div className="fixed bottom-24 right-6 z-50 space-y-3">
					{videoInvites.map((invite) => (
						<VideoCallInvite
							key={invite.id}
							inviteId={invite.id}
							callerName={invite.callerName}
							callerInitials={invite.callerInitials}
							subject={invite.subject}
							roomName={invite.roomName}
							roomUrl={invite.roomUrl}
							onAccept={handleAcceptVideoInvite}
							onDecline={handleDeclineVideoInvite}
						/>
					))}
				</div>
			)}
		</div>
	);
}
