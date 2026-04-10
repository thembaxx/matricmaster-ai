import { NextResponse } from 'next/server';

export async function GET() {
	const serverTime = Date.now();
	const serverTimeISO = new Date().toISOString();

	return NextResponse.json({
		serverTime,
		serverTimeISO,
		timezone: 'Africa/Johannesburg',
	});
}
