export interface Channel {
	id: string;
	title: string;
	info: string;
	tag?: string;
	icon: React.ReactNode;
	bg: string;
	onlineCount: number;
}
