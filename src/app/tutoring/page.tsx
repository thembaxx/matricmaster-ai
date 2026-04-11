'use client';

import {
	ArrowRight02Icon,
	Calendar03Icon,
	CommentAdd02Icon,
	Loading03Icon,
	PlayIcon,
	PlusSignIcon,
	SparklesIcon,
	TimeScheduleIcon,
	UserGroup02Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRouter } from 'next/navigation';
import { useState, ViewTransition } from 'react';
import { toast } from 'sonner';
import { FeatureGate } from '@/components/Subscription/FeatureGate';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MOCK_SESSIONS, type TutoringSession } from './constants';

export default function TutoringPage() {
	return (
		<FeatureGate
			feature="liveTutoring"
			showPreviewButton={true}
			upgradeMessage="Get 2 free live tutoring sessions per month with Basic plan or higher"
		>
			<ViewTransition default="none">
				<TutoringContent />
			</ViewTransition>
		</FeatureGate>
	);
}

function TutoringContent() {
	const router = useRouter();
	const [sessions] = useState<TutoringSession[]>(MOCK_SESSIONS);
	const [roomCode, setRoomCode] = useState('');
	const [_userName, _setUserName] = useState('');
	const [isCreating, setIsCreating] = useState(false);

	const handleCreateSession = async () => {
		setIsCreating(true);
		try {
			const response = await fetch('/api/tutoring/create', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
			});

			const data = await response.json();

			if (data.roomUrl) {
				toast.success('Session created! Redirecting...');
				router.push(data.roomUrl);
			} else {
				toast.error('Failed to create session');
			}
		} catch (_error) {
			toast.error('Failed to create session');
		} finally {
			setIsCreating(false);
		}
	};

	const handleJoinSession = (_roomName: string) => {
		if (!roomCode.trim()) {
			toast.error('Please enter a room code');
			return;
		}
		router.push(`/tutoring/session?room=${roomCode}&token=demo_token`);
	};

	const handleJoinScheduled = (session: TutoringSession) => {
		router.push(`/tutoring/session?room=${session.roomName}&token=demo_token&host=false`);
	};

	const liveSessions = sessions.filter((s) => s.status === 'live');
	const scheduledSessions = sessions.filter((s) => s.status === 'scheduled');

	return (
		<div className="min-h-screen pb-40 pt-8 px-4">
			<div className="max-w-4xl mx-auto">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
						<HugeiconsIcon icon={PlayIcon} className="w-8 h-8 text-primary" />
						Live Tutoring
					</h1>
					<p className="text-muted-foreground">
						Connect with tutors and peers for live study sessions
					</p>
				</div>

				<div className="grid md:grid-cols-2 gap-6 mb-8">
					<Card className="border-2 border-primary/20">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<HugeiconsIcon icon={PlusSignIcon} className="w-5 h-5 text-primary" />
								Start a Session
							</CardTitle>
							<CardDescription>Host your own live tutoring session</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<p className="text-sm text-muted-foreground">
								Create a room and invite others to join. Perfect for study groups or one-on-one
								tutoring.
							</p>
							<Button className="w-full" onClick={handleCreateSession} disabled={isCreating}>
								{isCreating ? (
									<>
										<HugeiconsIcon icon={Loading03Icon} className="w-4 h-4 mr-2 animate-spin" />
										Creating...
									</>
								) : (
									<>
										<HugeiconsIcon icon={SparklesIcon} className="w-4 h-4 mr-2" />
										Create New Session
									</>
								)}
							</Button>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<HugeiconsIcon icon={CommentAdd02Icon} className="w-5 h-5" />
								Join a Session
							</CardTitle>
							<CardDescription>Enter a room code to join</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<label htmlFor="room-code" className="text-sm font-medium">
									Room Code
								</label>
								<Input
									id="room-code"
									placeholder="Enter room code"
									value={roomCode}
									onChange={(e) => setRoomCode(e.target.value)}
									className="mt-1"
								/>
							</div>
							<Button
								className="w-full"
								variant="outline"
								onClick={() => handleJoinSession(roomCode)}
							>
								Join Session
								<HugeiconsIcon icon={ArrowRight02Icon} className="w-4 h-4 ml-2" />
							</Button>
						</CardContent>
					</Card>
				</div>

				{liveSessions.length > 0 && (
					<div className="mb-8">
						<h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
							<span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
							Live Now
						</h2>
						<div className="grid md:grid-cols-2 gap-4">
							{liveSessions.map((session) => (
								<Card key={session.id} className="border-green-500/20 bg-green-500/5">
									<CardContent className="p-4">
										<div className="flex items-start justify-between mb-3">
											<div>
												<h3 className="font-semibold">{session.subject}</h3>
												<p className="text-sm text-muted-foreground">
													Hosted by {session.hostName}
												</p>
											</div>
											<Badge variant="default" className="bg-green-500">
												LIVE
											</Badge>
										</div>
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-3 text-sm text-muted-foreground">
												<span className="flex items-center gap-1">
													<HugeiconsIcon icon={UserGroup02Icon} className="w-4 h-4" />
													{session.currentParticipants}/{session.maxParticipants}
												</span>
											</div>
											<Button
												type="button"
												size="sm"
												onClick={() => handleJoinScheduled(session)}
												aria-label="Join tutoring session now"
											>
												Join Now
											</Button>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					</div>
				)}

				{scheduledSessions.length > 0 && (
					<div>
						<h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
							<HugeiconsIcon icon={Calendar03Icon} className="w-5 h-5" />
							Scheduled Sessions
						</h2>
						<div className="grid md:grid-cols-2 gap-4">
							{scheduledSessions.map((session) => (
								<Card key={session.id}>
									<CardContent className="p-4">
										<div className="flex items-start justify-between mb-3">
											<div>
												<h3 className="font-semibold">{session.subject}</h3>
												<p className="text-sm text-muted-foreground">
													Hosted by {session.hostName}
												</p>
											</div>
											<Badge variant="outline">
												{new Date(session.startTime).toLocaleTimeString([], {
													hour: '2-digit',
													minute: '2-digit',
												})}
											</Badge>
										</div>
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-3 text-sm text-muted-foreground">
												<span className="flex items-center gap-1">
													<HugeiconsIcon icon={TimeScheduleIcon} className="w-4 h-4" />
													Starts in {Math.round((session.startTime.getTime() - Date.now()) / 60000)}{' '}
													min
												</span>
											</div>
											<Button
												size="sm"
												variant="outline"
												onClick={() => handleJoinScheduled(session)}
											>
												Join
											</Button>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
