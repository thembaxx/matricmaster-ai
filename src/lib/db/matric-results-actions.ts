export interface MatricProvince {
	province: string;
	fullName: string;
	rate: number;
}

export interface MatricSubject {
	subject: string;
	rate: number;
}

export interface Learner {
	rank: number;
	name: string;
	school: string;
	province: string;
	overall: number;
	subjects: { name: string; score: number }[];
}

export interface MatricResultsData {
	year: number;
	nationalPassRate: number;
	provinces: MatricProvince[];
	subjects: MatricSubject[];
}

const MOCK_DATA: Record<number, MatricResultsData> = {
	2025: {
		year: 2025,
		nationalPassRate: 88.0,
		provinces: [
			{ province: 'KZN', fullName: 'KwaZulu-Natal', rate: 90.6 },
			{ province: 'FS', fullName: 'Free State', rate: 89.33 },
			{ province: 'GP', fullName: 'Gauteng', rate: 89.06 },
			{ province: 'NW', fullName: 'North West', rate: 88.49 },
			{ province: 'WC', fullName: 'Western Cape', rate: 88.2 },
			{ province: 'NC', fullName: 'Northern Cape', rate: 87.79 },
			{ province: 'MP', fullName: 'Mpumalanga', rate: 86.55 },
			{ province: 'LP', fullName: 'Limpopo', rate: 86.15 },
			{ province: 'EC', fullName: 'Eastern Cape', rate: 84.17 },
		],
		subjects: [
			{ subject: 'Accounting', rate: 78.0 },
			{ subject: 'Mathematics', rate: 64.0 },
			{ subject: 'Physical Sciences', rate: 75.4 },
			{ subject: 'Life Sciences', rate: 72.1 },
			{ subject: 'English FAL', rate: 89.2 },
		],
	},
	2024: {
		year: 2024,
		nationalPassRate: 87.3,
		provinces: [
			{ province: 'FS', fullName: 'Free State', rate: 90.9 },
			{ province: 'KZN', fullName: 'KwaZulu-Natal', rate: 89.2 },
			{ province: 'GP', fullName: 'Gauteng', rate: 88.4 },
			{ province: 'NW', fullName: 'North West', rate: 87.5 },
			{ province: 'WC', fullName: 'Western Cape', rate: 86.5 },
			{ province: 'LP', fullName: 'Limpopo', rate: 85.0 },
			{ province: 'MP', fullName: 'Mpumalanga', rate: 85.0 },
			{ province: 'EC', fullName: 'Eastern Cape', rate: 85.0 },
			{ province: 'NC', fullName: 'Northern Cape', rate: 84.1 },
		],
		subjects: [
			{ subject: 'Accounting', rate: 81.0 },
			{ subject: 'Mathematics', rate: 69.0 },
			{ subject: 'Physical Sciences', rate: 76.0 },
			{ subject: 'Life Sciences', rate: 73.0 },
			{ subject: 'English FAL', rate: 85.0 },
		],
	},
	2023: {
		year: 2023,
		nationalPassRate: 82.9,
		provinces: [
			{ province: 'FS', fullName: 'Free State', rate: 89.0 },
			{ province: 'KZN', fullName: 'KwaZulu-Natal', rate: 86.4 },
			{ province: 'GP', fullName: 'Gauteng', rate: 85.4 },
			{ province: 'NW', fullName: 'North West', rate: 81.6 },
			{ province: 'WC', fullName: 'Western Cape', rate: 81.5 },
			{ province: 'EC', fullName: 'Eastern Cape', rate: 81.4 },
			{ province: 'LP', fullName: 'Limpopo', rate: 79.5 },
			{ province: 'MP', fullName: 'Mpumalanga', rate: 77.0 },
			{ province: 'NC', fullName: 'Northern Cape', rate: 75.8 },
		],
		subjects: [
			{ subject: 'Accounting', rate: 76.8 },
			{ subject: 'Mathematics', rate: 63.5 },
			{ subject: 'Physical Sciences', rate: 76.2 },
			{ subject: 'Life Sciences', rate: 75.6 },
			{ subject: 'English FAL', rate: 81.0 },
		],
	},
	2022: {
		year: 2022,
		nationalPassRate: 80.1,
		provinces: [
			{ province: 'FS', fullName: 'Free State', rate: 88.5 },
			{ province: 'GP', fullName: 'Gauteng', rate: 84.4 },
			{ province: 'KZN', fullName: 'KwaZulu-Natal', rate: 83.0 },
			{ province: 'WC', fullName: 'Western Cape', rate: 81.4 },
			{ province: 'NW', fullName: 'North West', rate: 79.8 },
			{ province: 'EC', fullName: 'Eastern Cape', rate: 77.3 },
			{ province: 'MP', fullName: 'Mpumalanga', rate: 76.8 },
			{ province: 'NC', fullName: 'Northern Cape', rate: 74.2 },
			{ province: 'LP', fullName: 'Limpopo', rate: 72.1 },
		],
		subjects: [
			{ subject: 'Accounting', rate: 75.4 },
			{ subject: 'Mathematics', rate: 55.0 },
			{ subject: 'Physical Sciences', rate: 74.6 },
			{ subject: 'Life Sciences', rate: 71.5 },
			{ subject: 'English FAL', rate: 78.0 },
		],
	},
	2021: {
		year: 2021,
		nationalPassRate: 76.2,
		provinces: [
			{ province: 'GP', fullName: 'Gauteng', rate: 83.5 },
			{ province: 'FS', fullName: 'Free State', rate: 82.7 },
			{ province: 'WC', fullName: 'Western Cape', rate: 81.3 },
			{ province: 'KZN', fullName: 'KwaZulu-Natal', rate: 79.1 },
			{ province: 'NW', fullName: 'North West', rate: 75.5 },
			{ province: 'MP', fullName: 'Mpumalanga', rate: 73.9 },
			{ province: 'LP', fullName: 'Limpopo', rate: 73.0 },
			{ province: 'EC', fullName: 'Eastern Cape', rate: 70.1 },
			{ province: 'NC', fullName: 'Northern Cape', rate: 68.9 },
		],
		subjects: [
			{ subject: 'Accounting', rate: 46.8 },
			{ subject: 'Mathematics', rate: 41.4 },
			{ subject: 'Physical Sciences', rate: 48.6 },
			{ subject: 'Life Sciences', rate: 63.8 },
			{ subject: 'English FAL', rate: 73.1 },
		],
	},
	2020: {
		year: 2020,
		nationalPassRate: 76.2,
		provinces: [
			{ province: 'FS', fullName: 'Free State', rate: 85.1 },
			{ province: 'GP', fullName: 'Gauteng', rate: 83.8 },
			{ province: 'KZN', fullName: 'KwaZulu-Natal', rate: 77.6 },
			{ province: 'WC', fullName: 'Western Cape', rate: 79.9 },
			{ province: 'NW', fullName: 'North West', rate: 76.2 },
			{ province: 'MP', fullName: 'Mpumalanga', rate: 73.7 },
			{ province: 'LP', fullName: 'Limpopo', rate: 68.2 },
			{ province: 'EC', fullName: 'Eastern Cape', rate: 68.1 },
			{ province: 'NC', fullName: 'Northern Cape', rate: 66.0 },
		],
		subjects: [
			{ subject: 'Accounting', rate: 68.0 },
			{ subject: 'Mathematics', rate: 61.5 },
			{ subject: 'Physical Sciences', rate: 65.8 },
			{ subject: 'Life Sciences', rate: 78.0 },
			{ subject: 'English FAL', rate: 76.0 },
		],
	},
};

const cache = new Map<number, { data: MatricResultsData; timestamp: number }>();
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000;

export async function getMatricResults(year: number): Promise<MatricResultsData> {
	const cached = cache.get(year);
	if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MS) {
		return cached.data;
	}

	const data = MOCK_DATA[year] || MOCK_DATA[2025];
	cache.set(year, { data, timestamp: Date.now() });
	return data;
}

export async function getAllMatricYears(): Promise<number[]> {
	return [2025, 2024, 2023, 2022, 2021, 2020];
}

export function clearMatricCache() {
	cache.clear();
}
