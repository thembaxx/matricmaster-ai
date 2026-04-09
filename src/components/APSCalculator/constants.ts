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
	{
		name: 'University of Cape Town',
		faculty: 'Commerce',
		minAps: 38,
		additionalRequirements: 'Mathematics (5+)',
	},
	{
		name: 'University of Cape Town',
		faculty: 'Medicine (MBChB)',
		minAps: 43,
		additionalRequirements: 'Mathematics + Physical Sciences (6+)',
	},
	{
		name: 'University of Cape Town',
		faculty: 'Law',
		minAps: 38,
		additionalRequirements: 'English (5+)',
	},
	{
		name: 'University of Cape Town',
		faculty: 'Science',
		minAps: 36,
		additionalRequirements: 'Mathematics (6+)',
	},
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
		name: 'University of the Witwatersrand',
		faculty: 'Commerce',
		minAps: 39,
		additionalRequirements: 'Mathematics (5+)',
	},
	{
		name: 'University of the Witwatersrand',
		faculty: 'Science',
		minAps: 36,
		additionalRequirements: 'Mathematics (5+)',
	},
	{
		name: 'University of the Witwatersrand',
		faculty: 'Computer Science',
		minAps: 42,
		additionalRequirements: 'Mathematics (6+)',
	},
	{
		name: 'University of Pretoria',
		faculty: 'Engineering',
		minAps: 35,
		additionalRequirements: 'Mathematics + Physical Sciences (5+)',
	},
	{
		name: 'University of Pretoria',
		faculty: 'Health Sciences',
		minAps: 35,
		additionalRequirements: 'Mathematics + Physical Sciences (5+)',
	},
	{
		name: 'University of Pretoria',
		faculty: 'Commerce',
		minAps: 30,
		additionalRequirements: 'Mathematics (4+)',
	},
	{
		name: 'University of Pretoria',
		faculty: 'Law',
		minAps: 35,
		additionalRequirements: 'English (5+)',
	},
	{
		name: 'University of Pretoria',
		faculty: 'Actuarial Science',
		minAps: 38,
		additionalRequirements: 'Mathematics (6+)',
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
	{
		name: 'Stellenbosch University',
		faculty: 'Commerce',
		minAps: 34,
		additionalRequirements: 'Mathematics (5+)',
	},
	{
		name: 'Stellenbosch University',
		faculty: 'Science',
		minAps: 34,
		additionalRequirements: 'Mathematics (5+)',
	},
	{
		name: 'Stellenbosch University',
		faculty: 'Computer Science',
		minAps: 36,
		additionalRequirements: 'Mathematics (6+)',
	},
	{
		name: 'University of Johannesburg',
		faculty: 'Engineering',
		minAps: 28,
		additionalRequirements: 'Mathematics (4+)',
	},
	{
		name: 'University of Johannesburg',
		faculty: 'Health Sciences',
		minAps: 30,
		additionalRequirements: 'Mathematics + Physical Sciences (4+)',
	},
	{
		name: 'University of Johannesburg',
		faculty: 'Commerce',
		minAps: 26,
		additionalRequirements: 'Mathematics (4+)',
	},
	{
		name: 'University of Johannesburg',
		faculty: 'Computer Science',
		minAps: 28,
		additionalRequirements: 'Mathematics (5+)',
	},
	{
		name: 'University of KwaZulu-Natal',
		faculty: 'Engineering',
		minAps: 30,
		additionalRequirements: 'Mathematics + Physical Sciences (4+)',
	},
	{
		name: 'University of KwaZulu-Natal',
		faculty: 'Health Sciences',
		minAps: 32,
		additionalRequirements: 'Mathematics + Physical Sciences (5+)',
	},
	{
		name: 'University of KwaZulu-Natal',
		faculty: 'Commerce',
		minAps: 26,
		additionalRequirements: 'Mathematics (4+)',
	},
	{
		name: 'University of the Free State',
		faculty: 'Health Sciences',
		minAps: 32,
		additionalRequirements: 'Mathematics + Physical Sciences (5+)',
	},
	{
		name: 'University of the Free State',
		faculty: 'Commerce',
		minAps: 28,
		additionalRequirements: 'Mathematics (4+)',
	},
	{
		name: 'University of the Western Cape',
		faculty: 'Dentistry',
		minAps: 35,
		additionalRequirements: 'Mathematics + Physical Sciences (5+)',
	},
	{
		name: 'University of the Western Cape',
		faculty: 'Health Sciences',
		minAps: 32,
		additionalRequirements: 'Mathematics + Physical Sciences (4+)',
	},
	{
		name: 'University of the Western Cape',
		faculty: 'Commerce',
		minAps: 28,
		additionalRequirements: 'Mathematics (4+)',
	},
	{
		name: 'North-West University',
		faculty: 'Engineering',
		minAps: 28,
		additionalRequirements: 'Mathematics + Physical Sciences (4+)',
	},
	{
		name: 'North-West University',
		faculty: 'Commerce',
		minAps: 24,
		additionalRequirements: 'Mathematics (4+)',
	},
	{
		name: 'North-West University',
		faculty: 'Computer Science',
		minAps: 26,
		additionalRequirements: 'Mathematics (5+)',
	},
	{
		name: 'Rhodes University',
		faculty: 'Commerce',
		minAps: 32,
		additionalRequirements: 'Mathematics (4+)',
	},
	{
		name: 'Rhodes University',
		faculty: 'Science',
		minAps: 30,
		additionalRequirements: 'Mathematics (5+)',
	},
	{
		name: 'Rhodes University',
		faculty: 'Law',
		minAps: 34,
		additionalRequirements: 'English (5+)',
	},
	{
		name: 'University of South Africa',
		faculty: 'Degree',
		minAps: 21,
		additionalRequirements: 'Mathematics (4+) for science/ commerce',
	},
	{
		name: 'University of South Africa',
		faculty: 'Higher Certificate',
		minAps: 15,
	},
	{
		name: 'Cape Peninsula University of Technology',
		faculty: 'Diploma',
		minAps: 24,
	},
	{
		name: 'Cape Peninsula University of Technology',
		faculty: 'Extended Diploma',
		minAps: 20,
	},
	{
		name: 'Tshwane University of Technology',
		faculty: 'Diploma',
		minAps: 22,
	},
	{
		name: 'Tshwane University of Technology',
		faculty: 'Extended Diploma',
		minAps: 18,
	},
	{
		name: 'Durban University of Technology',
		faculty: 'Diploma',
		minAps: 22,
	},
	{
		name: 'University of Limpopo',
		faculty: 'Health Sciences',
		minAps: 30,
		additionalRequirements: 'Mathematics + Physical Sciences (4+)',
	},
	{
		name: 'University of Limpopo',
		faculty: 'Commerce',
		minAps: 24,
		additionalRequirements: 'Mathematics (4+)',
	},
	{
		name: 'Walter Sisulu University',
		faculty: 'Diploma',
		minAps: 18,
	},
	{
		name: 'Mangosuthu University of Technology',
		faculty: 'Diploma',
		minAps: 18,
	},
	{
		name: 'University of Mpumalanga',
		faculty: 'Degree',
		minAps: 22,
	},
];
