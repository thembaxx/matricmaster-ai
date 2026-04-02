import { SUBJECTS } from '@/content';
import { GRADE_POINTS, GRADES } from '@/lib/constants/aps-grade-points';

interface UniversityRequirement {
	name: string;
	faculty: string;
	minAps: number;
	additionalRequirements?: string;
}

const CORE_SUBJECTS = [
	SUBJECTS.mathematics.name,
	'Physical Sciences',
	SUBJECTS['life-sciences'].name,
	SUBJECTS.geography.name,
	SUBJECTS.history.name,
	'English Home Language',
	'English First Additional Language',
	'Afrikaans Home Language',
	'Afrikaans First Additional Language',
	SUBJECTS.accounting.name,
	SUBJECTS['business-studies'].name,
	SUBJECTS.economics.name,
	'Information Technology',
	'Computer Applications Technology',
	'Mathematics Literacy',
	SUBJECTS.lo.name,
	'Art',
	'Music',
	'Drama',
	'Design',
];

export const SOUTH_AFRICAN_SUBJECTS = CORE_SUBJECTS;

export { GRADE_POINTS, GRADES };

export const UNIVERSITY_REQUIREMENTS: UniversityRequirement[] = [
	{
		name: 'University of Cape Town',
		faculty: 'Engineering',
		minAps: 42,
		additionalRequirements: 'Mathematics + Physical Sciences (5+)',
	},
	{
		name: 'University of Cape Town',
		faculty: 'Health Sciences',
		minAps: 45,
		additionalRequirements: 'Mathematics + Physical Sciences (6+)',
	},
	{ name: 'University of Cape Town', faculty: 'Commerce', minAps: 38 },
	{
		name: 'University of the Witwatersrand',
		faculty: 'Engineering',
		minAps: 42,
		additionalRequirements: 'Mathematics + Physical Sciences (5+)',
	},
	{
		name: 'University of the Witwatersrand',
		faculty: 'Health Sciences',
		minAps: 44,
		additionalRequirements: 'Mathematics + Physical Sciences (6+)',
	},
	{
		name: 'University of Pretoria',
		faculty: 'Engineering',
		minAps: 40,
		additionalRequirements: 'Mathematics + Physical Sciences (5+)',
	},
	{
		name: 'Stellenbosch University',
		faculty: 'Engineering',
		minAps: 38,
		additionalRequirements: 'Mathematics + Physical Sciences (5+)',
	},
	{
		name: 'Stellenbosch University',
		faculty: 'Medicine',
		minAps: 42,
		additionalRequirements: 'Mathematics + Physical Sciences (6+)',
	},
	{ name: 'University of Johannesburg', faculty: 'Engineering', minAps: 26 },
	{ name: 'University of Johannesburg', faculty: 'Health Sciences', minAps: 30 },
	{ name: 'University of KwaZulu-Natal', faculty: 'Engineering', minAps: 30 },
	{ name: 'University of the Free State', faculty: 'Health Sciences', minAps: 32 },
	{ name: 'University of the Western Cape', faculty: 'Dentistry', minAps: 35 },
];
