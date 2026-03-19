interface UniversityRequirement {
	name: string;
	faculty: string;
	minAps: number;
	additionalRequirements?: string;
}

export const SOUTH_AFRICAN_SUBJECTS = [
	'Mathematics',
	'Physical Sciences',
	'Life Sciences',
	'Geography',
	'History',
	'English Home Language',
	'English First Additional Language',
	'Afrikaans Home Language',
	'Afrikaans First Additional Language',
	'Accounting',
	'Business Studies',
	'Economics',
	'Information Technology',
	'Computer Applications Technology',
	'Mathematics Literacy',
	'Life Orientation',
	'Art',
	'Music',
	'Drama',
	'Design',
];

export const GRADE_POINTS: Record<string, number> = {
	'7': 7,
	'6': 6,
	'5': 5,
	'4': 4,
	'3': 3,
	'2': 2,
	'1': 1,
	U: 0,
};

export const GRADES = ['7', '6', '5', '4', '3', '2', '1', 'U'];

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
