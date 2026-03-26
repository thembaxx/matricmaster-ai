import type { MindMapNode } from '@/content/mindmaps';

export const physicsMindMap: MindMapNode = {
	id: 'physics',
	label: 'Physical Sciences',
	children: [
		{
			id: 'mechanics',
			label: 'Mechanics',
			children: [
				{ id: 'kin', label: 'Kinematics' },
				{ id: 'dyn', label: 'Dynamics' },
				{ id: 'work', label: 'Work & Energy' },
				{ id: 'mom', label: 'Momentum' },
			],
		},
		{
			id: 'waves',
			label: 'Waves & Sound',
			children: [
				{ id: 'prop', label: 'Properties' },
				{ id: 'sound', label: 'Sound' },
				{ id: 'light', label: 'Light' },
				{ id: 'doppler', label: 'Doppler' },
			],
		},
		{
			id: 'electricity',
			label: 'Electricity',
			children: [
				{ id: 'circuits', label: 'Circuits' },
				{ id: 'electro', label: 'Electrostatics' },
				{ id: 'magnetism', label: 'Magnetism' },
				{ id: 'induction', label: 'Electromagnetic Induction' },
			],
		},
		{
			id: 'matter',
			label: 'Matter',
			children: [
				{ id: 'particles', label: 'Particles' },
				{ id: 'thermal', label: 'Thermal' },
				{ id: 'gases', label: 'Gases' },
			],
		},
	],
};

export const mathMindMap: MindMapNode = {
	id: 'math',
	label: 'Mathematics',
	children: [
		{
			id: 'algebra',
			label: 'Algebra',
			children: [
				{ id: 'expressions', label: 'Expressions' },
				{ id: 'equations', label: 'Equations' },
				{ id: 'inequalities', label: 'Inequalities' },
			],
		},
		{
			id: 'functions',
			label: 'Functions',
			children: [
				{ id: 'linear', label: 'Linear' },
				{ id: 'quadratic', label: 'Quadratic' },
				{ id: 'exponential', label: 'Exponential' },
			],
		},
		{
			id: 'geometry',
			label: 'Geometry',
			children: [
				{ id: 'triangles', label: 'Triangles' },
				{ id: 'circles', label: 'Circles' },
				{ id: 'quadrilaterals', label: 'Quadrilaterals' },
			],
		},
		{
			id: 'trig',
			label: 'Trigonometry',
			children: [
				{ id: 'ratios', label: 'Ratios' },
				{ id: 'identities', label: 'Identities' },
				{ id: 'equations', label: 'Equations' },
			],
		},
	],
};

export const chemistryMindMap: MindMapNode = {
	id: 'chemistry',
	label: 'Chemistry',
	children: [
		{
			id: 'matter',
			label: 'Matter',
			children: [
				{ id: 'atomic', label: 'Atomic Structure' },
				{ id: 'periodic', label: 'Periodic Table' },
				{ id: 'bonding', label: 'Chemical Bonding' },
			],
		},
		{
			id: 'reactions',
			label: 'Reactions',
			children: [
				{ id: 'types', label: 'Reaction Types' },
				{ id: 'redox', label: 'Redox' },
				{ id: 'acidbase', label: 'Acids & Bases' },
			],
		},
		{
			id: 'quant',
			label: 'Quantitative',
			children: [
				{ id: 'moles', label: 'Moles & Mass' },
				{ id: 'conc', label: 'Concentration' },
				{ id: 'stoich', label: 'Stoichiometry' },
			],
		},
		{
			id: 'organic',
			label: 'Organic Chemistry',
			children: [
				{ id: 'hydrocarbons', label: 'Hydrocarbons' },
				{ id: 'functional', label: 'Functional Groups' },
				{ id: 'polymers', label: 'Polymers' },
			],
		},
	],
};

export const mindMaps: Record<string, MindMapNode> = {
	math: mathMindMap,
	physics: physicsMindMap,
	chemistry: chemistryMindMap,
};

export const subjectLabels: Record<string, string> = {
	math: 'Mathematics',
	physics: 'Physical Sciences',
	chemistry: 'Chemistry',
};
