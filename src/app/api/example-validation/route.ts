import { NextResponse } from 'next/server';
import { dateRangeSchema, paginationSchema, uuidSchema } from '@/lib/validation';

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);

	const limit = searchParams.get('limit');
	const offset = searchParams.get('offset');
	const startDate = searchParams.get('startDate');
	const endDate = searchParams.get('endDate');

	const pagination = paginationSchema.safeParse({ limit, offset });
	if (!pagination.success) {
		return NextResponse.json({ error: pagination.error.issues }, { status: 400 });
	}

	const dateRange = dateRangeSchema.safeParse({ startDate, endDate });
	if (!dateRange.success) {
		return NextResponse.json({ error: dateRange.error.issues }, { status: 400 });
	}

	return NextResponse.json({
		limit: pagination.data.limit,
		offset: pagination.data.offset,
		dateRange: dateRange.data,
	});
}

export async function POST(request: Request) {
	const body = await request.json();

	const idValidation = uuidSchema.safeParse(body.id);
	if (!idValidation.success) {
		return NextResponse.json({ error: idValidation.error.issues }, { status: 400 });
	}

	return NextResponse.json({ id: idValidation.data });
}
