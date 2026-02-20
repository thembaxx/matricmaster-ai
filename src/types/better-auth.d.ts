import 'better-auth';

declare module 'better-auth' {
	interface User {
		role: string;
		isBlocked: boolean;
		deletedAt: Date | null;
	}
}
