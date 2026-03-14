'use client';

import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { AnimatePresence, m } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const ELEMENT_QUESTIONS: Record<number, { question: string; options: string[]; answer: number }> = {
	1: {
		question: 'Hydrogen is the lightest element. What is its atomic number?',
		options: ['1', '2', '0', '3'],
		answer: 0,
	},
	2: {
		question: 'Which group do Helium and Neon belong to?',
		options: ['Halogens', 'Alkali metals', 'Noble gases', 'Transition metals'],
		answer: 2,
	},
	6: {
		question: 'Carbon can form many allotropes. Which of these is NOT an allotrope of carbon?',
		options: ['Diamond', 'Graphite', 'Fullerene', 'Quartz'],
		answer: 3,
	},
	8: {
		question: 'Oxygen is essential for respiration. What is the chemical symbol for oxygen?',
		options: ['O', 'Ox', 'Og', 'On'],
		answer: 0,
	},
	11: {
		question: 'Sodium (Na) is an alkali metal. What happens when it reacts with water?',
		options: ['It sinks', 'It floats and fizzes', 'It turns blue', 'It explodes silently'],
		answer: 1,
	},
	17: {
		question: 'Chlorine is a halogen used in disinfectants. What type of ion does it form?',
		options: ['Cation (+)', 'Anion (-)', 'Neutral', 'It does not form ions'],
		answer: 1,
	},
	26: {
		question: 'Iron (Fe) is a transition metal. What is its most common oxidation state?',
		options: ['+1', '+2 and +3', '+4', '+6'],
		answer: 1,
	},
	29: {
		question:
			'Copper is known for its electrical conductivity. What colour is copper sulfate solution?',
		options: ['Green', 'Blue', 'Yellow', 'Colourless'],
		answer: 1,
	},
	35: {
		question: 'Bromine is one of two liquid elements at room temperature. What is its symbol?',
		options: ['Br', 'Bm', 'Bo', 'Bn'],
		answer: 0,
	},
	47: {
		question:
			'Silver (Ag) has the highest electrical conductivity of any element. What is its atomic number?',
		options: ['45', '47', '49', '51'],
		answer: 1,
	},
	79: {
		question: 'Gold (Au) is a precious metal. What is its atomic number?',
		options: ['77', '78', '79', '80'],
		answer: 2,
	},
	92: {
		question: 'Uranium is a radioactive element used in nuclear power. What is its symbol?',
		options: ['U', 'Ur', 'Um', 'Un'],
		answer: 0,
	},
};

const ELEMENTS = [
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

const GROUP_COLORS: Record<string, string> = {
	nonmetal: 'bg-primary-violet/20 border-primary-violet/30 text-primary-violet',
	noble: 'bg-accent-blue/20 border-accent-blue/30 text-accent-blue',
	alkali: 'bg-primary-orange/20 border-primary-orange/30 text-primary-orange',
	alkaline: 'bg-tiimo-yellow/20 border-tiimo-yellow/30 text-tiimo-yellow',
	metalloid: 'bg-tiimo-green/20 border-tiimo-green/30 text-tiimo-green',
	halogen: 'bg-destructive/20 border-destructive/30 text-destructive',
	transition: 'bg-blue-500/20 border-blue-500/30 text-blue-500',
	metal: 'bg-zinc-400/20 border-zinc-400/30 text-zinc-600 dark:text-zinc-300',
	lanthanide: 'bg-pink-400/20 border-pink-400/30 text-pink-600',
	actinide: 'bg-red-400/20 border-red-400/30 text-red-600',
	synthetic: 'bg-gray-400/20 border-gray-400/30 text-gray-500',
};

const CATEGORY_LABELS: Record<string, string> = {
	nonmetal: 'Nonmetal',
	noble: 'Noble Gas',
	alkali: 'Alkali Metal',
	alkaline: 'Alkaline Earth Metal',
	metalloid: 'Metalloid',
	halogen: 'Halogen',
	transition: 'Transition Metal',
	metal: 'Post-Transition Metal',
	lanthanide: 'Lanthanide',
	actinide: 'Actinide',
	synthetic: 'Synthetic Element',
};

export default function PeriodicTable() {
	const router = useRouter();
	type ElementType = (typeof ELEMENTS)[number];
	const [selectedElement, setSelectedElement] = useState<ElementType | null>(null);
	const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
	const [showAnswer, setShowAnswer] = useState(false);

	const currentQuestion = selectedElement ? ELEMENT_QUESTIONS[selectedElement.num] : null;

	const handleCheckAnswer = () => {
		if (selectedAnswer === currentQuestion?.answer) {
			setShowAnswer(true);
		}
	};

	return (
		<div className="flex flex-col h-full bg-background min-w-0">
			<header className="px-8 pt-12 pb-6 flex items-center justify-between shrink-0 max-w-6xl mx-auto w-full">
				<h1 className="text-xl font-black tracking-normal">Periodic Table</h1>
				<div className="w-10" />
			</header>

			<ScrollArea className="flex-1">
				<main className="px-6 py-4 flex flex-col items-center pb-32 max-w-6xl mx-auto w-full gap-8">
					<div className="w-full max-w-5xl mx-auto">
						<div className="flex flex-wrap justify-center gap-1.5">
							{ELEMENTS.map((el, i) => (
								<m.button
									key={el.num}
									initial={{ opacity: 0, scale: 0.9 }}
									animate={{ opacity: 1, scale: 1 }}
									transition={{ delay: Math.min(i * 0.015, 1.5) }}
									whileHover={{ scale: 1.15, zIndex: 10 }}
									whileTap={{ scale: 0.95 }}
									onClick={() => setSelectedElement(el)}
									className={cn(
										'w-12 h-14 sm:w-14 sm:h-16 rounded-sm sm:rounded-md border flex flex-col items-center justify-center transition-all shadow-md bg-card',
										el.num >= 57 && el.num <= 71 && 'row-start-1 row-end-1',
										el.num >= 89 && el.num <= 103 && 'row-start-1 row-end-1',
										selectedElement?.num === el.num
											? 'ring-4 ring-primary border-primary shadow-primary/30 scale-110 z-10'
											: GROUP_COLORS[el.group]
									)}
								>
									<span className="text-[8px] sm:text-[9px] font-bold self-start ml-1.5 opacity-60">
										{el.num}
									</span>
									<span className="text-sm sm:text-base font-black">{el.sym}</span>
									<span className="text-[6px] sm:text-[7px] font-bold uppercase tracking-wider truncate w-full text-center max-w-full px-0.5">
										{el.name.length > 7 ? `${el.name.slice(0, 6)}.` : el.name}
									</span>
								</m.button>
							))}
						</div>

						<div className="flex flex-wrap justify-center gap-3 mt-6">
							{Object.entries(GROUP_COLORS).map(([group, color]) => (
								<div key={group} className="flex items-center gap-2">
									<div className={cn('w-4 h-4 rounded border', color.split(' ')[0])} />
									<span className="text-xs font-bold uppercase">
										{CATEGORY_LABELS[group] || group}
									</span>
								</div>
							))}
						</div>
					</div>

					<AnimatePresence>
						{selectedElement && (
							<m.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: 20 }}
								className="w-full"
							>
								<Card className="rounded-[2rem] p-10 border-2 border-primary/20 shadow-2xl bg-card overflow-hidden relative">
									<div className="flex flex-col sm:flex-row gap-10 items-center">
										<div
											className={cn(
												'w-48 h-48 rounded-[2.5rem] border-4 flex flex-col items-center justify-center relative',
												GROUP_COLORS[selectedElement.group]
											)}
										>
											<span className="text-2xl font-black absolute top-4 left-6">
												{selectedElement.num}
											</span>
											<span className="text-7xl font-black">{selectedElement.sym}</span>
											<span className="text-sm font-black uppercase tracking-widest mt-2">
												{selectedElement.name}
											</span>
										</div>
										<div className="flex-1 space-y-6">
											<div>
												<h3 className="text-3xl font-black text-foreground uppercase tracking-tight">
													{selectedElement.name}
												</h3>
												<p className="text-muted-foreground font-bold uppercase text-xs tracking-widest mt-1">
													{CATEGORY_LABELS[selectedElement.group] || selectedElement.category}
												</p>
											</div>
											<div className="grid grid-cols-2 gap-4">
												<div className="p-4 bg-muted/50 rounded-lg border border-border/50">
													<p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
														Atomic Mass
													</p>
													<p className="text-xl font-black">{selectedElement.mass} u</p>
												</div>
												<div className="p-4 bg-muted/50 rounded-lg border border-border/50">
													<p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
														Atomic Number
													</p>
													<p className="text-xl font-black">{selectedElement.num}</p>
												</div>
											</div>
											{currentQuestion ? (
												<div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border/50">
													<p className="text-sm font-bold text-foreground">
														{currentQuestion.question}
													</p>
													<RadioGroup
														value={selectedAnswer?.toString()}
														onValueChange={(val) => setSelectedAnswer(Number.parseInt(val, 10))}
														className="space-y-2"
													>
														{currentQuestion.options.map((opt, idx) => (
															<div key={idx} className="flex items-center gap-3">
																<RadioGroupItem
																	value={idx.toString()}
																	id={`opt-${idx}`}
																	className="peer"
																/>
																<Label
																	htmlFor={`opt-${idx}`}
																	className="text-sm font-medium cursor-pointer flex-1"
																>
																	{opt}
																</Label>
															</div>
														))}
													</RadioGroup>
													{selectedAnswer !== null && !showAnswer && (
														<Button
															onClick={handleCheckAnswer}
															className="w-full rounded-full font-black uppercase text-xs"
														>
															Check Answer
														</Button>
													)}
													{showAnswer && (
														<div
															className={cn(
																'p-3 rounded-xl text-sm font-bold',
																selectedAnswer === currentQuestion.answer
																	? 'bg-success/20 text-success'
																	: 'bg-destructive/20 text-destructive'
															)}
														>
															{selectedAnswer === currentQuestion.answer
																? 'Correct! Well done!'
																: `Incorrect. The answer is: ${currentQuestion.options[currentQuestion.answer]}`}
														</div>
													)}
												</div>
											) : (
												<Button
													onClick={() => router.push('/practice-quiz')}
													className="w-full h-14 rounded-full font-black uppercase text-xs tracking-widest gap-2 shadow-xl shadow-primary/20"
												>
													Practice Questions
												</Button>
											)}
										</div>
									</div>
									<div className="absolute -bottom-10 -right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
								</Card>
							</m.div>
						)}
					</AnimatePresence>
				</main>
			</ScrollArea>
		</div>
	);
}
