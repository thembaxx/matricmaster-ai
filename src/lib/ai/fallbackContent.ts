'use client';

interface FallbackTopic {
	subject: string;
	topic: string;
	content: string;
	keyPoints: string[];
	formulas?: string[];
	examples?: string[];
}

const MATH_FALLBACK_CONTENT: Record<string, FallbackTopic> = {
	'quadratic-equations': {
		subject: 'Mathematics',
		topic: 'Quadratic Equations',
		content:
			'A quadratic equation is an equation of the form ax² + bx + c = 0, where a, b, and c are constants and a ≠ 0. The solutions can be found using the quadratic formula or by factoring.',
		keyPoints: [
			'Standard form: ax² + bx + c = 0',
			'The quadratic formula: x = (-b ± √(b² - 4ac)) / 2a',
			'The discriminant (b² - 4ac) determines the nature of roots',
			'If discriminant > 0: two distinct real roots',
			'If discriminant = 0: one repeated root',
			'If discriminant < 0: two complex roots',
		],
		formulas: ['x = (-b ± √(b² - 4ac)) / 2a', ' discriminant = b² - 4ac'],
		examples: [
			'Solve x² - 5x + 6 = 0: factors to (x-2)(x-3)=0, so x=2 or x=3',
			'Solve x² + 4x + 4 = 0: factors to (x+2)²=0, so x=-2',
		],
	},
	'trigonometry-basics': {
		subject: 'Mathematics',
		topic: 'Trigonometry Basics',
		content:
			'Trigonometry deals with the relationships between the sides and angles of triangles. The three primary trigonometric ratios are sine, cosine, and tangent.',
		keyPoints: [
			'sin(θ) = opposite / hypotenuse',
			'cos(θ) = adjacent / hypotenuse',
			'tan(θ) = opposite / adjacent',
			'Pythagorean theorem: sin²(θ) + cos²(θ) = 1',
			'Angles in a triangle sum to 180°',
			'Remember SOH CAH TOA for mnemonic',
		],
		formulas: [
			'sin²(θ) + cos²(θ) = 1',
			'tan(θ) = sin(θ) / cos(θ)',
			'sec(θ) = 1 / cos(θ)',
			'csc(θ) = 1 / sin(θ)',
			'cot(θ) = 1 / tan(θ)',
		],
		examples: [
			'If sin(θ) = 3/5, find cos(θ): cos(θ) = √(1 - 9/25) = 4/5',
			'Find tan(45°): tan(45°) = 1',
		],
	},
	'differential-calculus': {
		subject: 'Mathematics',
		topic: 'Differential Calculus',
		content:
			'Differential calculus deals with the study of rates of change. The derivative of a function represents the instantaneous rate of change at any point.',
		keyPoints: [
			'Derivative: dy/dx = lim(Δx→0) [f(x+Δx) - f(x)] / Δx',
			'Power rule: d/dx(xⁿ) = nxⁿ⁻¹',
			'Product rule: d/dx(uv) = u(dv/dx) + v(du/dx)',
			'Quotient rule: d/dx(u/v) = [v(du/dx) - u(dv/dx)] / v²',
			"Chain rule: d/dx(f(g(x))) = f'(g(x)) · g'(x)",
		],
		formulas: [
			'd/dx(xⁿ) = nxⁿ⁻¹',
			'd/dx(sin(x)) = cos(x)',
			'd/dx(cos(x)) = -sin(x)',
			'd/dx(eˣ) = eˣ',
			'd/dx(ln(x)) = 1/x',
		],
		examples: ['d/dx(x³) = 3x²', 'd/dx(2x⁵) = 10x⁴', 'Find derivative of x² + 3x: 2x + 3'],
	},
};

const PHYSICS_FALLBACK_CONTENT: Record<string, FallbackTopic> = {
	'newtons-laws': {
		subject: 'Physical Sciences',
		topic: "Newton's Laws of Motion",
		content:
			"Newton's three laws of motion form the foundation of classical mechanics. They describe the relationship between the motion of an object and the forces acting on it.",
		keyPoints: [
			'First Law (Inertia): An object remains at rest or continues in uniform motion unless acted upon by an external force',
			'Second Law (F=ma): Force equals mass times acceleration',
			'Third Law (Action-Reaction): For every action, there is an equal and opposite reaction',
			'Momentum is conserved in closed systems',
			'Weight = mass × gravitational acceleration (W = mg)',
		],
		formulas: ['F = ma', 'p = mv (momentum)', 'W = mg', 'F = Δp/Δt'],
		examples: [
			'A 5kg object accelerating at 2m/s²: F = 5 × 2 = 10N',
			'A 2kg object at rest hits the ground: momentum change equals force applied',
		],
	},
	kinematics: {
		subject: 'Physical Sciences',
		topic: 'Kinematics',
		content:
			'Kinematics is the study of motion without considering the forces that cause it. It describes the motion of objects using displacement, velocity, and acceleration.',
		keyPoints: [
			'v = u + at (final velocity = initial velocity + acceleration × time)',
			's = ut + ½at² (displacement)',
			'v² = u² + 2as (velocity-displacement relation)',
			's = ½(u + v)t (average velocity)',
			'Graphs: slope = velocity, area under graph = displacement',
		],
		formulas: ['v = u + at', 's = ut + ½at²', 'v² = u² + 2as', 's = ½(u + v)t'],
		examples: [
			'A car accelerates from 10m/s to 30m/s in 5s: a = (30-10)/5 = 4m/s²',
			'A ball dropped from rest: u = 0, after 3s: v = 0 + 9.8×3 = 29.4m/s',
		],
	},
	'chemical-bonding': {
		subject: 'Physical Sciences',
		topic: 'Chemical Bonding',
		content:
			'Chemical bonding is the process by which atoms combine to form molecules and compounds. The main types are ionic, covalent, and metallic bonding.',
		keyPoints: [
			'Ionic bonding: Transfer of electrons between metals and non-metals',
			'Covalent bonding: Sharing of electron pairs between non-metals',
			'Metallic bonding: Sea of delocalized electrons in metals',
			'Octet rule: Atoms tend to have 8 electrons in their outer shell',
			' electronegativity difference determines bond type',
			'Polar bonds have unequal sharing of electrons',
		],
		formulas: [
			' electronegativity difference = E_N - E_M',
			'Bond type: < 0.4 = nonpolar covalent, 0.4-1.7 = polar covalent, > 1.7 = ionic',
		],
		examples: [
			'NaCl: sodium loses electron to chlorine (ionic bond)',
			'H₂O: oxygen shares electrons with hydrogen (polar covalent)',
			'CH₄: carbon shares electrons with hydrogen (nonpolar covalent)',
		],
	},
};

const ACCOUNTING_FALLBACK_CONTENT: Record<string, FallbackTopic> = {
	'debtors-reconciliation': {
		subject: 'Accounting',
		topic: 'Debtors Reconciliation',
		content:
			'A debtors reconciliation compares the debtors control account in the general ledger with the debtors list (subsidiary ledger) to ensure they agree.',
		keyPoints: [
			'Debitors control account shows total of all debtors',
			'Debitors list shows individual debtor balances',
			'Reconcile differences: credit entries in control but not list, or vice versa',
			'Common differences: unpresented cheques, deposits in transit, errors',
			'End balance of control account should equal total of debtors list',
		],
		examples: [
			'Control account balance: R5,000, List total: R4,800, Difference: R200 (cheque not yet presented)',
			'Control: R3,000, List: R3,200, Difference: R200 (deposit in transit)',
		],
	},
	'cost-accounting': {
		subject: 'Accounting',
		topic: 'Cost Accounting',
		content:
			'Cost accounting involves recording, classifying, and analyzing costs to help management make decisions. Key concepts include fixed costs, variable costs, and break-even analysis.',
		keyPoints: [
			'Fixed costs: remain constant regardless of output (rent, salaries)',
			'Variable costs: change with output (materials, direct labor)',
			'Total cost = Fixed cost + (Variable cost per unit × Number of units)',
			'Break-even point: where total revenue = total costs',
			'Contribution margin = Selling price - Variable cost per unit',
			'Break-even units = Fixed costs / Contribution margin per unit',
		],
		formulas: [
			'Total Cost = Fixed Costs + (Variable Cost × Quantity)',
			'Contribution Margin = Selling Price - Variable Cost',
			'Break-even = Fixed Costs / Contribution Margin per unit',
			'Margin of Safety = Budgeted Sales - Break-even Sales',
		],
		examples: [
			'Fixed costs R10,000, selling price R50, variable cost R30: Contribution = R20, Break-even = 500 units',
			'If actual sales = 600 units, profit = (600-500) × R20 = R2,000',
		],
	},
};

interface FallbackResponse {
	content: string;
	keyPoints: string[];
	formulas?: string[];
	examples?: string[];
	topic: string;
	subject: string;
}

function findMatchingFallback(subject: string, topic: string): FallbackTopic | null {
	const normalizedSubject = subject.toLowerCase();
	const normalizedTopic = topic.toLowerCase();

	let contentMap: Record<string, FallbackTopic> = {};

	if (normalizedSubject.includes('math')) {
		contentMap = MATH_FALLBACK_CONTENT;
	} else if (normalizedSubject.includes('physic')) {
		contentMap = PHYSICS_FALLBACK_CONTENT;
	} else if (normalizedSubject.includes('account')) {
		contentMap = ACCOUNTING_FALLBACK_CONTENT;
	}

	for (const [key, fallback] of Object.entries(contentMap)) {
		if (
			normalizedTopic.includes(key) ||
			key.includes(normalizedTopic) ||
			fallback.topic.toLowerCase().includes(normalizedTopic)
		) {
			return fallback;
		}
	}

	return null;
}

export function getFallbackResponse(subject: string, topic: string): FallbackResponse | null {
	const fallback = findMatchingFallback(subject, topic);

	if (!fallback) {
		return null;
	}

	return {
		content: fallback.content,
		keyPoints: fallback.keyPoints,
		formulas: fallback.formulas,
		examples: fallback.examples,
		topic: fallback.topic,
		subject: fallback.subject,
	};
}

export function hasFallbackContent(subject: string, topic: string): boolean {
	return findMatchingFallback(subject, topic) !== null;
}

export function getAllFallbackSubjects(): string[] {
	const subjects = new Set<string>();

	for (const f of Object.values(MATH_FALLBACK_CONTENT)) {
		subjects.add(f.subject);
	}
	for (const f of Object.values(PHYSICS_FALLBACK_CONTENT)) {
		subjects.add(f.subject);
	}
	for (const f of Object.values(ACCOUNTING_FALLBACK_CONTENT)) {
		subjects.add(f.subject);
	}

	return Array.from(subjects);
}

export function getFallbackTopicsBySubject(subject: string): string[] {
	const normalizedSubject = subject.toLowerCase();
	let contentMap: Record<string, FallbackTopic> = {};

	if (normalizedSubject.includes('math')) {
		contentMap = MATH_FALLBACK_CONTENT;
	} else if (normalizedSubject.includes('physic')) {
		contentMap = PHYSICS_FALLBACK_CONTENT;
	} else if (normalizedSubject.includes('account')) {
		contentMap = ACCOUNTING_FALLBACK_CONTENT;
	}

	return Object.values(contentMap).map((f) => f.topic);
}

export function formatFallbackContent(response: FallbackResponse): string {
	let formatted = `## ${response.subject}: ${response.topic}\n\n`;
	formatted += `${response.content}\n\n`;
	formatted += '### Key Points:\n';
	response.keyPoints.forEach((point) => {
		formatted += `- ${point}\n`;
	});

	if (response.formulas && response.formulas.length > 0) {
		formatted += '\n### Important Formulas:\n';
		response.formulas.forEach((formula) => {
			formatted += `- ${formula}\n`;
		});
	}

	if (response.examples && response.examples.length > 0) {
		formatted += '\n### Examples:\n';
		response.examples.forEach((example) => {
			formatted += `- ${example}\n`;
		});
	}

	formatted += '\n\n*This is cached content shown while offline.*';

	return formatted;
}
