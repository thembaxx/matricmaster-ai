import { NextResponse } from 'next/server';

export async function POST(
	request: Request,
	{ params }: { params: { id: string } }
) {
	const body = await request.json();
	const { score, totalQuestions, weakAreas } = body;

	// In a real app, we would save results, update progress, award XP, etc.
	// For now, we return the calculated results.

	return NextResponse.json({
		success: true,
		results: {
			quizId: params.id,
			score,
			percentage: Math.round((score / totalQuestions) * 100),
			weakAreas,
			xpEarned: score * 10,
		},
	});
}
