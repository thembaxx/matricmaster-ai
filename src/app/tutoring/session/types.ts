export interface DailyCallFrame {
	join: (options: Record<string, unknown>) => Promise<void>;
	leave: () => Promise<void>;
	destroy: () => void;
	on: (event: string, callback: (data: unknown) => void) => void;
	off: (event: string, callback: (data: unknown) => void) => void;
	setLocalVideo: (enabled: boolean) => void;
	setLocalAudio: (enabled: boolean) => void;
	startScreenShare: () => Promise<void>;
	stopScreenShare: () => void;
	participants: () => Record<string, unknown>;
}

declare global {
	interface Window {
		DailyIframe: {
			createFrame: (element: HTMLElement, options: Record<string, unknown>) => DailyCallFrame;
		};
	}
}
