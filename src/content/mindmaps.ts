export interface MindMapNode {
	id: string;
	label: string;
	children?: MindMapNode[];
}

export const mathMindMap: MindMapNode = {
	id: 'math',
	label: 'Mathematics',
	children: [
		{
			id: 'algebra',
			label: 'Algebra',
			children: [
				{ id: 'eq', label: 'Equations' },
				{ id: 'ineq', label: 'Inequalities' },
				{ id: 'expo', label: 'Exponents' },
				{ id: 'logs', label: 'Logarithms' },
			],
		},
		{
			id: 'geometry',
			label: 'Geometry',
			children: [
				{ id: 'triangles', label: 'Triangles' },
				{ id: 'circles', label: 'Circles' },
				{ id: 'quads', label: 'Quadrilaterals' },
				{ id: '3d', label: '3D Shapes' },
			],
		},
		{
			id: 'trig',
			label: 'Trigonometry',
			children: [
				{ id: 'ratios', label: 'Ratios' },
				{ id: 'identities', label: 'Identities' },
				{ id: 'laws', label: 'Laws' },
				{ id: 'graphs', label: 'Graphs' },
			],
		},
		{
			id: 'calculus',
			label: 'Calculus',
			children: [
				{ id: 'limits', label: 'Limits' },
				{ id: 'diff', label: 'Differentiation' },
				{ id: 'int', label: 'Integration' },
			],
		},
		{
			id: 'stats',
			label: 'Statistics',
			children: [
				{ id: 'data', label: 'Data Handling' },
				{ id: 'prob', label: 'Probability' },
				{ id: 'dist', label: 'Distributions' },
			],
		},
	],
};

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
				{ id: 'inter', label: 'Interference' },
				{ id: 'sound', label: 'Sound Waves' },
			],
		},
		{
			id: 'electricity',
			label: 'Electricity & Magnetism',
			children: [
				{ id: 'circuits', label: 'Circuits' },
				{ id: 'fields', label: 'Electric Fields' },
				{ id: 'ind', label: 'Electromagnetic Induction' },
			],
		},
		{
			id: 'matter',
			label: 'Matter & Materials',
			children: [
				{ id: 'atomic', label: 'Atomic Structure' },
				{ id: 'periodic', label: 'Periodic Table' },
				{ id: 'bonding', label: 'Chemical Bonding' },
			],
		},
		{
			id: 'chemistry',
			label: 'Chemical Reactions',
			children: [
				{ id: 'acidbase', label: 'Acids & Bases' },
				{ id: 'redox', label: 'Redox Reactions' },
				{ id: 'equil', label: 'Chemical Equilibrium' },
			],
		},
	],
};

export const lifeSciencesMindMap: MindMapNode = {
	id: 'life',
	label: 'Life Sciences',
	children: [
		{
			id: 'cells',
			label: 'Cells',
			children: [
				{ id: 'cellbio', label: 'Cell Biology' },
				{ id: 'cellorg', label: 'Cell Organisation' },
				{ id: 'transport', label: 'Transport' },
			],
		},
		{
			id: 'genetics',
			label: 'Genetics',
			children: [
				{ id: 'inherit', label: 'Inheritance' },
				{ id: 'dna', label: 'DNA & RNA' },
				{ id: 'mutations', label: 'Mutations' },
			],
		},
		{
			id: 'evolution',
			label: 'Evolution',
			children: [
				{ id: 'natural', label: 'Natural Selection' },
				{ id: 'adapt', label: 'Adaptation' },
				{ id: 'speciation', label: 'Speciation' },
			],
		},
		{
			id: 'ecology',
			label: 'Ecology',
			children: [
				{ id: 'ecosystems', label: 'Ecosystems' },
				{ id: 'biomes', label: 'Biomes' },
				{ id: 'conservation', label: 'Conservation' },
			],
		},
		{
			id: 'human',
			label: 'Human Systems',
			children: [
				{ id: 'digestion', label: 'Digestion' },
				{ id: 'respiration', label: 'Respiration' },
				{ id: 'circulation', label: 'Circulation' },
			],
		},
	],
};

export const geographyMindMap: MindMapNode = {
	id: 'geography',
	label: 'Geography',
	children: [
		{
			id: 'geomorphology',
			label: 'Geomorphology',
			children: [
				{ id: 'landforms', label: 'Landforms' },
				{ id: 'weathering', label: 'Weathering' },
				{ id: 'erosion', label: 'Erosion' },
			],
		},
		{
			id: 'climatology',
			label: 'Climatology',
			children: [
				{ id: 'climate', label: 'Climate' },
				{ id: 'weather', label: 'Weather' },
				{ id: 'climatechange', label: 'Climate Change' },
			],
		},
		{
			id: 'settlement',
			label: 'Settlement',
			children: [
				{ id: 'urban', label: 'Urbanisation' },
				{ id: 'rural', label: 'Rural Settlements' },
				{ id: 'services', label: 'Services' },
			],
		},
		{
			id: 'economy',
			label: 'Economic Geography',
			children: [
				{ id: 'primary', label: 'Primary Activities' },
				{ id: 'secondary', label: 'Secondary Activities' },
				{ id: 'tertiary', label: 'Tertiary Activities' },
			],
		},
	],
};

export const DEFAULT_MINDMAPS: Record<string, MindMapNode> = {
	mathematics: mathMindMap,
	'physical-sciences': physicsMindMap,
	'life-sciences': lifeSciencesMindMap,
	geography: geographyMindMap,
};
