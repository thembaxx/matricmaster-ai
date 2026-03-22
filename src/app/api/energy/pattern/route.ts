import { type NextRequest, NextResponse } from 'next/server';
import { getCurrentEnergyLevel } from '@/lib/energy-utils';
import {
	getEnergyPatterns,
	getOptimalStudyWindows,
	getWeeklyEnergyHistory,
} from '@/services/energy-tracking-service';

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const type = searchParams.get('type');
		const userId = searchParams.get('userId') || undefined;

		if (type === 'history') {
			const history = await getWeeklyEnergyHistory(userId);
			return NextResponse.json({ history });
		}

		if (type === 'weekly') {
			const patterns = await getEnergyPatterns(userId);
			const windows = await getOptimalStudyWindows(userId);
			const currentEnergy = getCurrentEnergyLevel();
			return NextResponse.json({ patterns, windows, currentEnergy });
		}

		const patterns = await getEnergyPatterns(userId);
		const windows = await getOptimalStudyWindows(userId);
		const history = await getWeeklyEnergyHistory(userId);

		return NextResponse.json({
			patterns,
			windows,
			history,
			currentEnergy: getCurrentEnergyLevel(),
		});
	} catch (error) {
		console.error('Failed to get energy pattern:', error);
		return NextResponse.json({ error: 'Failed to get energy pattern' }, { status: 500 });
	}
}
