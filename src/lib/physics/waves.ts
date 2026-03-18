export interface WaveResults {
	frequency: number;
	wavelength: number;
	speed: number;
	angularFrequency: number;
	waveNumber: number;
	period: number;
}

export function calculateWave(_amplitude: number, frequency: number): WaveResults {
	const wavelength = frequency > 0 ? 20 / frequency : 0; // Arbitrary relationship for display
	const speed = frequency * wavelength;
	const angularFrequency = 2 * Math.PI * frequency;
	const waveNumber = (2 * Math.PI) / wavelength;
	const period = frequency > 0 ? 1 / frequency : 0;

	return {
		frequency,
		wavelength,
		speed,
		angularFrequency,
		waveNumber,
		period,
	};
}

export function generateWavePoints(
	amplitude: number,
	frequency: number,
	phase: number,
	numPoints = 200
): { x: number; y: number }[] {
	const points: { x: number; y: number }[] = [];

	for (let i = 0; i < numPoints; i++) {
		const x = (i / numPoints) * 4 * Math.PI; // 2 wavelengths
		const y = amplitude * Math.sin(frequency * x - phase);
		points.push({ x, y });
	}

	return points;
}
