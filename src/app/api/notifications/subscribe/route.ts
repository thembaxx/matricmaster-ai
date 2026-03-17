import { eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { userSettings } from '@/lib/db/schema';

interface PushSubscription {
	endpoint: string;
	keys: {
		p256dh: string;
		auth: string;
	};
}

export async function POST(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const subscription: PushSubscription = await request.json();

		if (!subscription.endpoint || !subscription.keys) {
			return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
		}

		const existingSettings = await db.query.userSettings.findFirst({
			where: (settings, { eq }) => eq(settings.userId, session.user.id),
		});

		if (existingSettings) {
			await db
				.update(userSettings)
				.set({
					pushSubscription: JSON.stringify(subscription),
					updatedAt: new Date(),
				})
				.where(eq(userSettings.userId, existingSettings.userId));
		} else {
			await db.insert(userSettings).values({
				userId: session.user.id,
				pushSubscription: JSON.stringify(subscription),
				emailNotifications: true,
				pushNotifications: true,
			});
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.debug('Push subscription error:', error);
		return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 });
	}
}

export async function DELETE(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const existingSettings = await db.query.userSettings.findFirst({
			where: (settings, { eq }) => eq(settings.userId, session.user.id),
		});

		if (existingSettings) {
			await db
				.update(userSettings)
				.set({
					pushSubscription: null,
					pushNotifications: false,
					updatedAt: new Date(),
				})
				.where(eq(userSettings.userId, existingSettings.userId));
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.debug('Push unsubscription error:', error);
		return NextResponse.json({ error: 'Failed to remove subscription' }, { status: 500 });
	}
}
