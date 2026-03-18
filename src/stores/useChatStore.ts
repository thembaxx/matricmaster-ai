import { create } from 'zustand';

export interface ChatMessage {
	id: string;
	role: 'user' | 'assistant';
	content: string;
	createdAt: Date;
}

interface ChatState {
	currentSessionId: string | null;
	messages: ChatMessage[];
	isLoading: boolean;
	isWidgetOpen: boolean;

	setCurrentSession: (id: string | null) => void;
	setMessages: (messages: ChatMessage[]) => void;
	addMessage: (message: ChatMessage) => void;
	setLoading: (loading: boolean) => void;
	toggleWidget: () => void;
	setWidgetOpen: (open: boolean) => void;
	clearChat: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
	currentSessionId: null,
	messages: [],
	isLoading: false,
	isWidgetOpen: false,

	setCurrentSession: (id) => set({ currentSessionId: id }),
	setMessages: (messages) => set({ messages }),
	addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
	setLoading: (loading) => set({ isLoading: loading }),
	toggleWidget: () => set((state) => ({ isWidgetOpen: !state.isWidgetOpen })),
	setWidgetOpen: (open) => set({ isWidgetOpen: open }),
	clearChat: () => set({ currentSessionId: null, messages: [] }),
}));
