import { type NextRequest, NextResponse } from 'next/server';
import { exportWeeklyReportPDF } from '@/services/progress-pdf-export';

export async function POST(request: NextRequest) {
	try {
		const body = await request.json().catch(() => ({}));
		const startDate = body.startDate ? new Date(body.startDate) : undefined;

		const pdfBuffer = await exportWeeklyReportPDF(startDate);

		if (!pdfBuffer) {
			return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
		}

		// Convert Node Buffer to Uint8Array for Web API compatibility
		const uint8Array = new Uint8Array(pdfBuffer);

		return new NextResponse(uint8Array, {
			status: 200,
			headers: {
				'Content-Type': 'application/pdf',
				'Content-Disposition': `attachment; filename="progress-report-${new Date().toISOString().split('T')[0]}.pdf"`,
			},
		});
	} catch (error) {
		console.error('Error generating parent report PDF:', error);
		return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
	}
}
