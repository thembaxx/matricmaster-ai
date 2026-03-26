export interface ElementDetail {
	num: number;
	sym: string;
	name: string;
	mass: string;
	group: string;
	category: string;
	description: string;
	discovery: string;
	uses: string[];
	electronConfig: string;
	electronegativity: number | null;
	density: string;
	meltingPoint: string;
	boilingPoint: string;
	oxidationStates: string;
	period: number;
	groupNumber: number | null;
	atomicRadius: number | null;
	ionizationEnergy: number | null;
	practiceQuestions: {
		question: string;
		options: string[];
		answer: number;
	}[];
	properties: {
		label: string;
		value: string;
	}[];
}

export interface BaseElement {
	num: number;
	sym: string;
	name: string;
	mass: string;
	group: string;
	category: string;
}

export const BASE_ELEMENTS: BaseElement[] = [
	{
		num: 1,
		sym: 'H',
		name: 'Hydrogen',
		mass: '1.008',
		group: 'nonmetal',
		category: 'diatomic nonmetal',
	},
	{ num: 2, sym: 'He', name: 'Helium', mass: '4.002', group: 'noble', category: 'noble gas' },
	{ num: 3, sym: 'Li', name: 'Lithium', mass: '6.941', group: 'alkali', category: 'alkali metal' },
	{
		num: 4,
		sym: 'Be',
		name: 'Beryllium',
		mass: '9.012',
		group: 'alkaline',
		category: 'alkaline earth metal',
	},
	{ num: 5, sym: 'B', name: 'Boron', mass: '10.81', group: 'metalloid', category: 'metalloid' },
	{
		num: 6,
		sym: 'C',
		name: 'Carbon',
		mass: '12.01',
		group: 'nonmetal',
		category: 'polyatomic nonmetal',
	},
	{
		num: 7,
		sym: 'N',
		name: 'Nitrogen',
		mass: '14.01',
		group: 'nonmetal',
		category: 'diatomic nonmetal',
	},
	{
		num: 8,
		sym: 'O',
		name: 'Oxygen',
		mass: '16.00',
		group: 'nonmetal',
		category: 'diatomic nonmetal',
	},
	{ num: 9, sym: 'F', name: 'Fluorine', mass: '19.00', group: 'halogen', category: 'halogen' },
	{ num: 10, sym: 'Ne', name: 'Neon', mass: '20.18', group: 'noble', category: 'noble gas' },
	{ num: 11, sym: 'Na', name: 'Sodium', mass: '22.99', group: 'alkali', category: 'alkali metal' },
	{
		num: 12,
		sym: 'Mg',
		name: 'Magnesium',
		mass: '24.31',
		group: 'alkaline',
		category: 'alkaline earth metal',
	},
	{
		num: 13,
		sym: 'Al',
		name: 'Aluminium',
		mass: '26.98',
		group: 'metal',
		category: 'post-transition metal',
	},
	{ num: 14, sym: 'Si', name: 'Silicon', mass: '28.09', group: 'metalloid', category: 'metalloid' },
	{
		num: 15,
		sym: 'P',
		name: 'Phosphorus',
		mass: '30.97',
		group: 'nonmetal',
		category: 'polyatomic nonmetal',
	},
	{
		num: 16,
		sym: 'S',
		name: 'Sulfur',
		mass: '32.07',
		group: 'nonmetal',
		category: 'polyatomic nonmetal',
	},
	{ num: 17, sym: 'Cl', name: 'Chlorine', mass: '35.45', group: 'halogen', category: 'halogen' },
	{ num: 18, sym: 'Ar', name: 'Argon', mass: '39.95', group: 'noble', category: 'noble gas' },
	{
		num: 19,
		sym: 'K',
		name: 'Potassium',
		mass: '39.10',
		group: 'alkali',
		category: 'alkali metal',
	},
	{
		num: 20,
		sym: 'Ca',
		name: 'Calcium',
		mass: '40.08',
		group: 'alkaline',
		category: 'alkaline earth metal',
	},
	{
		num: 21,
		sym: 'Sc',
		name: 'Scandium',
		mass: '44.96',
		group: 'transition',
		category: 'transition metal',
	},
	{
		num: 22,
		sym: 'Ti',
		name: 'Titanium',
		mass: '47.87',
		group: 'transition',
		category: 'transition metal',
	},
	{
		num: 23,
		sym: 'V',
		name: 'Vanadium',
		mass: '50.94',
		group: 'transition',
		category: 'transition metal',
	},
	{
		num: 24,
		sym: 'Cr',
		name: 'Chromium',
		mass: '52.00',
		group: 'transition',
		category: 'transition metal',
	},
	{
		num: 25,
		sym: 'Mn',
		name: 'Manganese',
		mass: '54.94',
		group: 'transition',
		category: 'transition metal',
	},
	{
		num: 26,
		sym: 'Fe',
		name: 'Iron',
		mass: '55.85',
		group: 'transition',
		category: 'transition metal',
	},
	{
		num: 27,
		sym: 'Co',
		name: 'Cobalt',
		mass: '58.93',
		group: 'transition',
		category: 'transition metal',
	},
	{
		num: 28,
		sym: 'Ni',
		name: 'Nickel',
		mass: '58.69',
		group: 'transition',
		category: 'transition metal',
	},
	{
		num: 29,
		sym: 'Cu',
		name: 'Copper',
		mass: '63.55',
		group: 'transition',
		category: 'transition metal',
	},
	{
		num: 30,
		sym: 'Zn',
		name: 'Zinc',
		mass: '65.38',
		group: 'transition',
		category: 'transition metal',
	},
	{
		num: 31,
		sym: 'Ga',
		name: 'Gallium',
		mass: '69.72',
		group: 'metal',
		category: 'post-transition metal',
	},
	{
		num: 32,
		sym: 'Ge',
		name: 'Germanium',
		mass: '72.63',
		group: 'metalloid',
		category: 'metalloid',
	},
	{ num: 33, sym: 'As', name: 'Arsenic', mass: '74.92', group: 'metalloid', category: 'metalloid' },
	{
		num: 34,
		sym: 'Se',
		name: 'Selenium',
		mass: '78.97',
		group: 'nonmetal',
		category: 'polyatomic nonmetal',
	},
	{ num: 35, sym: 'Br', name: 'Bromine', mass: '79.90', group: 'halogen', category: 'halogen' },
	{ num: 36, sym: 'Kr', name: 'Krypton', mass: '83.80', group: 'noble', category: 'noble gas' },
	{
		num: 37,
		sym: 'Rb',
		name: 'Rubidium',
		mass: '85.47',
		group: 'alkali',
		category: 'alkali metal',
	},
	{
		num: 38,
		sym: 'Sr',
		name: 'Strontium',
		mass: '87.62',
		group: 'alkaline',
		category: 'alkaline earth metal',
	},
	{
		num: 39,
		sym: 'Y',
		name: 'Yttrium',
		mass: '88.91',
		group: 'transition',
		category: 'transition metal',
	},
	{
		num: 40,
		sym: 'Zr',
		name: 'Zirconium',
		mass: '91.22',
		group: 'transition',
		category: 'transition metal',
	},
	{
		num: 41,
		sym: 'Nb',
		name: 'Niobium',
		mass: '92.91',
		group: 'transition',
		category: 'transition metal',
	},
	{
		num: 42,
		sym: 'Mo',
		name: 'Molybdenum',
		mass: '95.95',
		group: 'transition',
		category: 'transition metal',
	},
	{
		num: 43,
		sym: 'Tc',
		name: 'Technetium',
		mass: '98.00',
		group: 'transition',
		category: 'transition metal',
	},
	{
		num: 44,
		sym: 'Ru',
		name: 'Ruthenium',
		mass: '101.1',
		group: 'transition',
		category: 'transition metal',
	},
	{
		num: 45,
		sym: 'Rh',
		name: 'Rhodium',
		mass: '102.9',
		group: 'transition',
		category: 'transition metal',
	},
	{
		num: 46,
		sym: 'Pd',
		name: 'Palladium',
		mass: '106.4',
		group: 'transition',
		category: 'transition metal',
	},
	{
		num: 47,
		sym: 'Ag',
		name: 'Silver',
		mass: '107.9',
		group: 'transition',
		category: 'transition metal',
	},
	{
		num: 48,
		sym: 'Cd',
		name: 'Cadmium',
		mass: '112.4',
		group: 'transition',
		category: 'transition metal',
	},
	{
		num: 49,
		sym: 'In',
		name: 'Indium',
		mass: '114.8',
		group: 'metal',
		category: 'post-transition metal',
	},
	{
		num: 50,
		sym: 'Sn',
		name: 'Tin',
		mass: '118.7',
		group: 'metal',
		category: 'post-transition metal',
	},
	{
		num: 51,
		sym: 'Sb',
		name: 'Antimony',
		mass: '121.8',
		group: 'metalloid',
		category: 'metalloid',
	},
	{
		num: 52,
		sym: 'Te',
		name: 'Tellurium',
		mass: '127.6',
		group: 'metalloid',
		category: 'metalloid',
	},
	{ num: 53, sym: 'I', name: 'Iodine', mass: '126.9', group: 'halogen', category: 'halogen' },
	{ num: 54, sym: 'Xe', name: 'Xenon', mass: '131.3', group: 'noble', category: 'noble gas' },
	{ num: 55, sym: 'Cs', name: 'Caesium', mass: '132.9', group: 'alkali', category: 'alkali metal' },
	{
		num: 56,
		sym: 'Ba',
		name: 'Barium',
		mass: '137.3',
		group: 'alkaline',
		category: 'alkaline earth metal',
	},
	{
		num: 57,
		sym: 'La',
		name: 'Lanthanum',
		mass: '138.9',
		group: 'lanthanide',
		category: 'lanthanide',
	},
	{
		num: 58,
		sym: 'Ce',
		name: 'Cerium',
		mass: '140.1',
		group: 'lanthanide',
		category: 'lanthanide',
	},
	{
		num: 59,
		sym: 'Pr',
		name: 'Praseodymium',
		mass: '140.9',
		group: 'lanthanide',
		category: 'lanthanide',
	},
	{
		num: 60,
		sym: 'Nd',
		name: 'Neodymium',
		mass: '144.2',
		group: 'lanthanide',
		category: 'lanthanide',
	},
	{
		num: 61,
		sym: 'Pm',
		name: 'Promethium',
		mass: '145.0',
		group: 'lanthanide',
		category: 'lanthanide',
	},
	{
		num: 62,
		sym: 'Sm',
		name: 'Samarium',
		mass: '150.4',
		group: 'lanthanide',
		category: 'lanthanide',
	},
	{
		num: 63,
		sym: 'Eu',
		name: 'Europium',
		mass: '152.0',
		group: 'lanthanide',
		category: 'lanthanide',
	},
	{
		num: 64,
		sym: 'Gd',
		name: 'Gadolinium',
		mass: '157.3',
		group: 'lanthanide',
		category: 'lanthanide',
	},
	{
		num: 65,
		sym: 'Tb',
		name: 'Terbium',
		mass: '158.9',
		group: 'lanthanide',
		category: 'lanthanide',
	},
	{
		num: 66,
		sym: 'Dy',
		name: 'Dysprosium',
		mass: '162.5',
		group: 'lanthanide',
		category: 'lanthanide',
	},
	{
		num: 67,
		sym: 'Ho',
		name: 'Holmium',
		mass: '164.9',
		group: 'lanthanide',
		category: 'lanthanide',
	},
	{
		num: 68,
		sym: 'Er',
		name: 'Erbium',
		mass: '167.3',
		group: 'lanthanide',
		category: 'lanthanide',
	},
	{
		num: 69,
		sym: 'Tm',
		name: 'Thulium',
		mass: '168.9',
		group: 'lanthanide',
		category: 'lanthanide',
	},
	{
		num: 70,
		sym: 'Yb',
		name: 'Ytterbium',
		mass: '173.0',
		group: 'lanthanide',
		category: 'lanthanide',
	},
	{
		num: 71,
		sym: 'Lu',
		name: 'Lutetium',
		mass: '175.0',
		group: 'lanthanide',
		category: 'lanthanide',
	},
	{
		num: 72,
		sym: 'Hf',
		name: 'Hafnium',
		mass: '178.5',
		group: 'transition',
		category: 'transition metal',
	},
	{
		num: 73,
		sym: 'Ta',
		name: 'Tantalum',
		mass: '180.9',
		group: 'transition',
		category: 'transition metal',
	},
	{
		num: 74,
		sym: 'W',
		name: 'Tungsten',
		mass: '183.8',
		group: 'transition',
		category: 'transition metal',
	},
	{
		num: 75,
		sym: 'Re',
		name: 'Rhenium',
		mass: '186.2',
		group: 'transition',
		category: 'transition metal',
	},
	{
		num: 76,
		sym: 'Os',
		name: 'Osmium',
		mass: '190.2',
		group: 'transition',
		category: 'transition metal',
	},
	{
		num: 77,
		sym: 'Ir',
		name: 'Iridium',
		mass: '192.2',
		group: 'transition',
		category: 'transition metal',
	},
	{
		num: 78,
		sym: 'Pt',
		name: 'Platinum',
		mass: '195.1',
		group: 'transition',
		category: 'transition metal',
	},
	{
		num: 79,
		sym: 'Au',
		name: 'Gold',
		mass: '197.0',
		group: 'transition',
		category: 'transition metal',
	},
	{
		num: 80,
		sym: 'Hg',
		name: 'Mercury',
		mass: '200.6',
		group: 'transition',
		category: 'transition metal',
	},
	{
		num: 81,
		sym: 'Tl',
		name: 'Thallium',
		mass: '204.4',
		group: 'metal',
		category: 'post-transition metal',
	},
	{
		num: 82,
		sym: 'Pb',
		name: 'Lead',
		mass: '207.2',
		group: 'metal',
		category: 'post-transition metal',
	},
	{
		num: 83,
		sym: 'Bi',
		name: 'Bismuth',
		mass: '209.0',
		group: 'metal',
		category: 'post-transition metal',
	},
	{
		num: 84,
		sym: 'Po',
		name: 'Polonium',
		mass: '209.0',
		group: 'metal',
		category: 'post-transition metal',
	},
	{ num: 85, sym: 'At', name: 'Astatine', mass: '210.0', group: 'halogen', category: 'halogen' },
	{ num: 86, sym: 'Rn', name: 'Radon', mass: '222.0', group: 'noble', category: 'noble gas' },
	{
		num: 87,
		sym: 'Fr',
		name: 'Francium',
		mass: '223.0',
		group: 'alkali',
		category: 'alkali metal',
	},
	{
		num: 88,
		sym: 'Ra',
		name: 'Radium',
		mass: '226.0',
		group: 'alkaline',
		category: 'alkaline earth metal',
	},
	{ num: 89, sym: 'Ac', name: 'Actinium', mass: '227.0', group: 'actinide', category: 'actinide' },
	{ num: 90, sym: 'Th', name: 'Thorium', mass: '232.0', group: 'actinide', category: 'actinide' },
	{
		num: 91,
		sym: 'Pa',
		name: 'Protactinium',
		mass: '231.0',
		group: 'actinide',
		category: 'actinide',
	},
	{ num: 92, sym: 'U', name: 'Uranium', mass: '238.0', group: 'actinide', category: 'actinide' },
	{ num: 93, sym: 'Np', name: 'Neptunium', mass: '237.0', group: 'actinide', category: 'actinide' },
	{ num: 94, sym: 'Pu', name: 'Plutonium', mass: '244.0', group: 'actinide', category: 'actinide' },
	{ num: 95, sym: 'Am', name: 'Americium', mass: '243.0', group: 'actinide', category: 'actinide' },
	{ num: 96, sym: 'Cm', name: 'Curium', mass: '247.0', group: 'actinide', category: 'actinide' },
	{ num: 97, sym: 'Bk', name: 'Berkelium', mass: '247.0', group: 'actinide', category: 'actinide' },
	{
		num: 98,
		sym: 'Cf',
		name: 'Californium',
		mass: '251.0',
		group: 'actinide',
		category: 'actinide',
	},
	{
		num: 99,
		sym: 'Es',
		name: 'Einsteinium',
		mass: '252.0',
		group: 'actinide',
		category: 'actinide',
	},
	{ num: 100, sym: 'Fm', name: 'Fermium', mass: '257.0', group: 'actinide', category: 'actinide' },
	{
		num: 101,
		sym: 'Md',
		name: 'Mendelevium',
		mass: '258.0',
		group: 'actinide',
		category: 'actinide',
	},
	{ num: 102, sym: 'No', name: 'Nobelium', mass: '259.0', group: 'actinide', category: 'actinide' },
	{
		num: 103,
		sym: 'Lr',
		name: 'Lawrencium',
		mass: '266.0',
		group: 'actinide',
		category: 'actinide',
	},
	{
		num: 104,
		sym: 'Rf',
		name: 'Rutherfordium',
		mass: '267.0',
		group: 'transition',
		category: 'transition metal',
	},
	{
		num: 105,
		sym: 'Db',
		name: 'Dubnium',
		mass: '268.0',
		group: 'transition',
		category: 'transition metal',
	},
	{
		num: 106,
		sym: 'Sg',
		name: 'Seaborgium',
		mass: '269.0',
		group: 'transition',
		category: 'transition metal',
	},
	{
		num: 107,
		sym: 'Bh',
		name: 'Bohrium',
		mass: '270.0',
		group: 'transition',
		category: 'transition metal',
	},
	{
		num: 108,
		sym: 'Hs',
		name: 'Hassium',
		mass: '277.0',
		group: 'transition',
		category: 'transition metal',
	},
	{
		num: 109,
		sym: 'Mt',
		name: 'Meitnerium',
		mass: '278.0',
		group: 'synthetic',
		category: 'unknown',
	},
	{
		num: 110,
		sym: 'Ds',
		name: 'Darmstadtium',
		mass: '281.0',
		group: 'synthetic',
		category: 'unknown',
	},
	{
		num: 111,
		sym: 'Rg',
		name: 'Roentgenium',
		mass: '282.0',
		group: 'synthetic',
		category: 'unknown',
	},
	{
		num: 112,
		sym: 'Cn',
		name: 'Copernicium',
		mass: '285.0',
		group: 'transition',
		category: 'transition metal',
	},
	{ num: 113, sym: 'Nh', name: 'Nihonium', mass: '286.0', group: 'synthetic', category: 'unknown' },
	{
		num: 114,
		sym: 'Fl',
		name: 'Flerovium',
		mass: '289.0',
		group: 'synthetic',
		category: 'unknown',
	},
	{
		num: 115,
		sym: 'Mc',
		name: 'Moscovium',
		mass: '290.0',
		group: 'synthetic',
		category: 'unknown',
	},
	{
		num: 116,
		sym: 'Lv',
		name: 'Livermorium',
		mass: '293.0',
		group: 'synthetic',
		category: 'unknown',
	},
	{
		num: 117,
		sym: 'Ts',
		name: 'Tennessine',
		mass: '294.0',
		group: 'synthetic',
		category: 'unknown',
	},
	{
		num: 118,
		sym: 'Og',
		name: 'Oganesson',
		mass: '294.0',
		group: 'synthetic',
		category: 'unknown',
	},
];

export function getPeriod(num: number): number {
	return Math.ceil(num / 18);
}

export function getGroupNumber(num: number): number | null {
	if (num <= 2) return num;
	if (num <= 10) return num - 2;
	if (num <= 18) return num - 10;
	if (num <= 36) return num - 18;
	if (num <= 54) return num - 36;
	if (num <= 70) return num - 54;
	if (num <= 86) return num - 68;
	return null;
}

export function generatePracticeQuestions(
	num: number,
	name: string,
	sym: string,
	group: string,
	mass: string
) {
	const questions = [];

	questions.push({
		question: `What is the atomic number of ${name}?`,
		options: [(num - 1).toString(), num.toString(), (num + 1).toString(), (num + 2).toString()],
		answer: 1,
	});

	questions.push({
		question: `What is the symbol for ${name}?`,
		options: [sym, 'X', 'Y', 'Z'],
		answer: 0,
	});

	const groupNames: Record<string, string> = {
		nonmetal: 'nonmetal',
		noble: 'noble gas',
		alkali: 'alkali metal',
		alkaline: 'alkaline earth metal',
		metalloid: 'metalloid',
		halogen: 'halogen',
		transition: 'transition metal',
		metal: 'post-transition metal',
		lanthanide: 'lanthanide',
		actinide: 'actinide',
		synthetic: 'synthetic element',
	};

	questions.push({
		question: `Which category does ${name} belong to?`,
		options: [
			groupNames[group] || group,
			group === 'nonmetal' ? 'metal' : 'nonmetal',
			group === 'noble' ? 'halogen' : 'noble gas',
			group === 'alkali' ? 'alkaline' : 'alkali metal',
		],
		answer: 0,
	});

	questions.push({
		question: `What is the atomic mass of ${name}?`,
		options: [
			mass,
			(Number.parseFloat(mass) + 1).toFixed(2),
			(Number.parseFloat(mass) - 1).toFixed(2),
			(Number.parseFloat(mass) * 2).toFixed(2),
		],
		answer: 0,
	});

	return questions;
}

export function generateProperties(
	num: number,
	mass: string,
	period: number,
	groupNumber: number | null,
	electronConfig: string,
	electronegativity: number | null,
	density: string,
	meltingPoint: string,
	boilingPoint: string,
	oxidationStates: string
) {
	const props = [
		{ label: 'Atomic Number', value: num.toString() },
		{ label: 'Atomic Mass', value: `${mass} u` },
	];

	if (electronConfig && electronConfig !== 'Unknown') {
		props.push({ label: 'Electron Config', value: electronConfig });
	}

	if (electronegativity) {
		props.push({ label: 'Electronegativity', value: electronegativity.toFixed(2) });
	}

	props.push(
		{ label: 'Period', value: period.toString() },
		{ label: 'Group', value: groupNumber?.toString() || 'N/A' }
	);

	if (density && density !== 'Unknown') {
		props.push({ label: 'Density', value: density });
	}

	if (meltingPoint && meltingPoint !== 'Unknown') {
		props.push({ label: 'Melting Point', value: meltingPoint });
	}

	if (boilingPoint && boilingPoint !== 'Unknown') {
		props.push({ label: 'Boiling Point', value: boilingPoint });
	}

	if (oxidationStates && oxidationStates !== 'Unknown') {
		props.push({ label: 'Oxidation States', value: oxidationStates });
	}

	return props;
}

export function generateElementFromBase(baseElement: BaseElement): ElementDetail {
	const period = getPeriod(baseElement.num);
	const groupNumber = getGroupNumber(baseElement.num);

	return {
		num: baseElement.num,
		sym: baseElement.sym,
		name: baseElement.name,
		mass: baseElement.mass,
		group: baseElement.group,
		category: baseElement.category,
		description: `${baseElement.name} is a ${baseElement.category.toLowerCase()} with atomic number ${baseElement.num}.`,
		discovery: 'Synthetically produced',
		uses: ['Research purposes'],
		electronConfig: 'Unknown',
		electronegativity: null,
		density: 'Unknown',
		meltingPoint: 'Unknown',
		boilingPoint: 'Unknown',
		oxidationStates: 'Unknown',
		period,
		groupNumber,
		atomicRadius: null,
		ionizationEnergy: null,
		practiceQuestions: generatePracticeQuestions(
			baseElement.num,
			baseElement.name,
			baseElement.sym,
			baseElement.group,
			baseElement.mass
		),
		properties: generateProperties(
			baseElement.num,
			baseElement.mass,
			period,
			groupNumber,
			'Unknown',
			null,
			'Unknown',
			'Unknown',
			'Unknown',
			'Unknown'
		),
	};
}
