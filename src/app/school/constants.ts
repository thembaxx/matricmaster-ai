export interface SchoolStats {
	totalLearners: number;
	activeLicenses: number;
	expiringSoon: number;
	usagePercent: number;
}

export interface School {
	id: string;
	name: string;
	emisNumber: string;
	province: string;
	contactName: string;
	contactEmail: string;
	subscriptionPlan: string;
	licenseCount: number;
	licenseExpiry: Date | null;
	status: string;
}

export interface License {
	id: string;
	licenseKey: string;
	licenseType: string;
	assignedTo: string | null;
	status: string;
	expiresAt: Date | null;
}

export const MOCK_SCHOOL: School = {
	id: '1',
	name: 'Johannesburg High School',
	emisNumber: '700123456',
	province: 'Gauteng',
	contactName: 'John Smith',
	contactEmail: 'john@school.edu.za',
	subscriptionPlan: 'premium',
	licenseCount: 500,
	licenseExpiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
	status: 'active',
};

export const MOCK_LICENSES: License[] = [
	{
		id: '1',
		licenseKey: 'SCH-2026-ABC123',
		licenseType: 'student',
		assignedTo: 'john.doe@school.edu.za',
		status: 'active',
		expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
	},
	{
		id: '2',
		licenseKey: 'SCH-2026-ABC124',
		licenseType: 'student',
		assignedTo: 'jane.doe@school.edu.za',
		status: 'active',
		expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
	},
	{
		id: '3',
		licenseKey: 'SCH-2026-ABC125',
		licenseType: 'student',
		assignedTo: null,
		status: 'available',
		expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
	},
];
