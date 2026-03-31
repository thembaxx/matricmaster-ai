import { toast } from 'sonner';
import { create } from 'zustand';
import {
	getDiscoverableBuddies,
	getPendingRequests,
	getStudyBuddyProfile,
	getUserBuddies,
	getUserInfo,
} from '@/lib/db/buddy-actions';
import type { studyBuddyRequests } from '@/lib/db/schema';

type PendingRequest = typeof studyBuddyRequests.$inferSelect;

export interface StudyBuddy {
	id: string;
	name: string;
	avatar?: string;
	bio: string;
	subjects: string[];
	studyGoals: string;
	isOnline?: boolean;
	userId?: string;
	weakAreas?: {
		topic: string;
		subject: string;
		masteryLevel: number;
	}[];
	strongAreas?: {
		topic: string;
		subject: string;
		masteryLevel: number;
	}[];
}

export interface BuddyRequest {
	id: string;
	fromUser: StudyBuddy;
	message?: string;
	createdAt: string;
}

interface StudyBuddyProfile {
	bio: string;
	studyGoals: string;
	selectedSubjects: string[];
}

interface WeakAreaMatch {
	buddy: StudyBuddy;
	matchScore: number;
	weakAreasYouCanHelp: string[];
	weakAreasTheyCanHelp: string[];
}

interface StudyBuddyState {
	searchQuery: string;
	selectedSubjects: string[];
	activeTab: string;
	buddyRequests: BuddyRequest[];
	myBuddies: StudyBuddy[];
	discoverableBuddies: StudyBuddy[];
	profile: StudyBuddyProfile;
	isLoading: boolean;
	weakAreaMatches: WeakAreaMatch[];
	myWeakAreas: {
		topic: string;
		subject: string;
		masteryLevel: number;
	}[];

	setSearchQuery: (query: string) => void;
	setSelectedSubjects: (subjects: string[] | ((prev: string[]) => string[])) => void;
	setActiveTab: (tab: string) => void;
	setProfile: (
		profile: StudyBuddyProfile | ((prev: StudyBuddyProfile) => StudyBuddyProfile)
	) => void;

	loadData: (userId: string) => Promise<void>;
	loadWeakAreaMatches: (userId: string) => Promise<void>;
	handleSubjectToggle: (subject: string) => void;
	handleSendRequest: (buddyId: string) => Promise<void>;
	handleAcceptRequest: (requestId: string) => Promise<void>;
	handleRejectRequest: (requestId: string) => Promise<void>;
}

export const useStudyBuddyStore = create<StudyBuddyState>((set, _get) => ({
	searchQuery: '',
	selectedSubjects: [],
	activeTab: 'discover',
	buddyRequests: [],
	myBuddies: [],
	discoverableBuddies: [],
	profile: {
		bio: '',
		studyGoals: '',
		selectedSubjects: [],
	},
	isLoading: true,
	weakAreaMatches: [],
	myWeakAreas: [],

	setSearchQuery: (searchQuery) => set({ searchQuery }),
	setSelectedSubjects: (selectedSubjects) =>
		set((state) => ({
			selectedSubjects:
				typeof selectedSubjects === 'function'
					? selectedSubjects(state.selectedSubjects)
					: selectedSubjects,
		})),
	setActiveTab: (activeTab) => set({ activeTab }),
	setProfile: (profile) =>
		set((state) => ({
			profile: typeof profile === 'function' ? profile(state.profile) : profile,
		})),

	loadData: async (userId: string) => {
		set({ isLoading: true });
		try {
			// Load profile
			const profileData = await getStudyBuddyProfile(userId);
			if (profileData) {
				let subjects: string[] = [];
				if (profileData.preferredSubjects) {
					try {
						subjects =
							typeof profileData.preferredSubjects === 'string'
								? JSON.parse(profileData.preferredSubjects)
								: profileData.preferredSubjects;
					} catch (error) {
						console.warn('Failed to parse preferred subjects:', error);
						subjects = [];
					}
				}
				set({
					profile: {
						bio: profileData.bio || '',
						studyGoals: profileData.studyGoals || '',
						selectedSubjects: subjects,
					},
				});
			}

			// Load discoverable buddies
			const discoverable = await getDiscoverableBuddies(userId, 20);
			const buddiesWithNames = await Promise.all(
				discoverable.map(
					async (buddy: Awaited<ReturnType<typeof getDiscoverableBuddies>>[number]) => {
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
						} catch (error) {
							console.warn('Failed to get user info for discoverable buddy:', error);
							return {
								id: buddy.userId,
								userId: buddy.userId,
								name: 'Unknown User',
								bio: buddy.bio || '',
								subjects: buddy.preferredSubjects || [],
								studyGoals: buddy.studyGoals || '',
							} as StudyBuddy;
						}
					}
				)
			);
			set({ discoverableBuddies: buddiesWithNames });

			// Load user's buddies
			const buddies = await getUserBuddies(userId);
			type BuddyProfile = Awaited<ReturnType<typeof getUserBuddies>>[number];
			const buddiesList = await Promise.all(
				buddies.map(async (buddy: BuddyProfile) => {
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
					} catch (error) {
						console.warn('Failed to get user info for buddy:', error);
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
			set({ myBuddies: buddiesList });

			// Load pending requests
			const requests = await getPendingRequests(userId);
			const requestsWithUsers = await Promise.all(
				requests.map(async (req: PendingRequest) => {
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
					} catch (error) {
						console.warn('Failed to get user info for request:', error);
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
			set({ buddyRequests: requestsWithUsers });
		} catch (error) {
			console.debug('Error loading study buddies data:', error);
		} finally {
			set({ isLoading: false });
		}
	},

	loadWeakAreaMatches: async (userId: string) => {
		try {
			// Fetch discoverable buddies with their mastery data from the API
			const matchesRes = await fetch(`/api/buddies/matches?userId=${userId}`);
			if (!matchesRes.ok) return;

			const { matches, userWeakAreas } = await matchesRes.json();

			// Store user's weak areas
			set({ myWeakAreas: userWeakAreas || [] });

			// Map API matches to the expected format
			const state = _get();
			const buddyMatches: WeakAreaMatch[] = matches
				.map(
					(match: {
						userId: string;
						name: string;
						image?: string;
						bio: string;
						studyGoals: string;
						subjects: string[];
						strongAreas: { topic: string; subjectId: number; masteryLevel: number }[];
					}) => {
						// Find the buddy in discoverableBuddies
						const buddy = state.discoverableBuddies.find((b) => b.id === match.userId);
						if (!buddy) return null;

						// Calculate weak areas the buddy can help with
						const weakAreasTheyCanHelp = match.strongAreas
							.filter((strong) =>
								userWeakAreas?.some(
									(weak: { topic: string; subjectId: number }) => weak.topic === strong.topic
								)
							)
							.map((s) => s.topic);

						// Calculate weak areas user can help buddy with
						const weakAreasYouCanHelp =
							userWeakAreas
								?.filter((weak: { topic: string }) =>
									match.strongAreas.some((strong) => strong.topic === weak.topic)
								)
								.map((w: { topic: string }) => w.topic) ?? [];

						const matchScore = (weakAreasYouCanHelp.length + weakAreasTheyCanHelp.length) * 10;

						// Update buddy with strong areas for display
						buddy.strongAreas = match.strongAreas.map((a) => ({
							topic: a.topic,
							subject: '',
							masteryLevel: a.masteryLevel,
						}));

						return {
							buddy,
							matchScore,
							weakAreasYouCanHelp,
							weakAreasTheyCanHelp,
						};
					}
				)
				.filter((m: WeakAreaMatch | null): m is WeakAreaMatch => m !== null && m.matchScore > 0)
				.sort((a: WeakAreaMatch, b: WeakAreaMatch) => b.matchScore - a.matchScore);

			set({ weakAreaMatches: buddyMatches });
		} catch (error) {
			console.debug('Error loading weak area matches:', error);
		}
	},

	handleSubjectToggle: (subject: string) => {
		set((state) => ({
			selectedSubjects: state.selectedSubjects.includes(subject)
				? state.selectedSubjects.filter((s) => s !== subject)
				: [...state.selectedSubjects, subject],
		}));
	},

	handleSendRequest: async (buddyId: string) => {
		try {
			const response = await fetch('/api/buddies', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ recipientId: buddyId }),
			});

			const result = await response.json();

			if (result.success) {
				toast.success('Buddy request sent!');
			} else {
				toast.error(result.error || 'Failed to send request');
			}
		} catch (error) {
			console.debug('Error sending buddy request:', error);
			toast.error('Failed to send buddy request');
		}
	},

	handleAcceptRequest: async (requestId: string) => {
		try {
			const response = await fetch('/api/buddies', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ action: 'accept', requestId }),
			});

			const result = await response.json();

			if (result.success) {
				set((state) => ({
					buddyRequests: state.buddyRequests.filter((r) => r.id !== requestId),
				}));
				toast.success('Buddy request accepted!');
			} else {
				toast.error(result.error || 'Failed to accept request');
			}
		} catch (error) {
			console.debug('Error accepting buddy request:', error);
			toast.error('Failed to accept buddy request');
		}
	},

	handleRejectRequest: async (requestId: string) => {
		try {
			const response = await fetch('/api/buddies', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ action: 'reject', requestId }),
			});

			const result = await response.json();

			if (result.success) {
				set((state) => ({
					buddyRequests: state.buddyRequests.filter((r) => r.id !== requestId),
				}));
				toast.success('Buddy request rejected');
			} else {
				toast.error(result.error || 'Failed to reject request');
			}
		} catch (error) {
			console.debug('Error rejecting buddy request:', error);
			toast.error('Failed to reject buddy request');
		}
	},
}));
