import { toast } from 'sonner';
import { create } from 'zustand';
import {
	getDiscoverableBuddies,
	getPendingRequests,
	getStudyBuddyProfile,
	getUserBuddies,
	getUserInfo,
} from '@/lib/db/buddy-actions';

export interface StudyBuddy {
	id: string;
	name: string;
	avatar?: string;
	bio: string;
	subjects: string[];
	studyGoals: string;
	isOnline?: boolean;
	userId?: string;
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

interface StudyBuddyState {
	searchQuery: string;
	selectedSubjects: string[];
	activeTab: string;
	buddyRequests: BuddyRequest[];
	myBuddies: StudyBuddy[];
	discoverableBuddies: StudyBuddy[];
	profile: StudyBuddyProfile;
	isLoading: boolean;

	setSearchQuery: (query: string) => void;
	setSelectedSubjects: (subjects: string[] | ((prev: string[]) => string[])) => void;
	setActiveTab: (tab: string) => void;
	setProfile: (
		profile: StudyBuddyProfile | ((prev: StudyBuddyProfile) => StudyBuddyProfile)
	) => void;

	loadData: (userId: string) => Promise<void>;
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
					} catch {
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
			set({ discoverableBuddies: buddiesWithNames });

			// Load user's buddies
			const buddies = await getUserBuddies(userId);
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
			set({ myBuddies: buddiesList });

			// Load pending requests
			const requests = await getPendingRequests(userId);
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
			set({ buddyRequests: requestsWithUsers });
		} catch (error) {
			console.error('Error loading study buddies data:', error);
		} finally {
			set({ isLoading: false });
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
			console.error('Error sending buddy request:', error);
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
			console.error('Error accepting buddy request:', error);
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
			console.error('Error rejecting buddy request:', error);
			toast.error('Failed to reject buddy request');
		}
	},
}));
