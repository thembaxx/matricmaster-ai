export const AblyChannels = {
	userNotifications: (userId: string) => `user:${userId}:notifications`,
	channelChat: (channelId: string) => `chat:${channelId}`,
	channelPresence: (channelId: string) => `presence:${channelId}`,
	channelTyping: (channelId: string) => `typing:${channelId}`,
	globalAnnouncements: () => 'global:announcements',
	studyGroup: (groupId: string) => `study-group:${groupId}`,
	videoCalls: (userId: string) => `user:${userId}:notifications`,
	videoPresence: (roomName: string) => `video-presence:${roomName}`,
} as const;

export type AblyChannelName = ReturnType<(typeof AblyChannels)[keyof typeof AblyChannels]>;
