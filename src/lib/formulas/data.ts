export interface Formula {
	id: string;
	name: string;
	formula: string;
	description: string;
	unit?: string;
	topic: string;
}

export interface Topic {
	id: string;
	name: string;
	formulas: Formula[];
}

export interface SubjectFormulas {
	subject: string;
	topics: Topic[];
}

export const mathFormulas: SubjectFormulas = {
	subject: 'Mathematics',
	topics: [
		{
			id: 'algebra',
			name: 'Algebra',
			formulas: [
				{
					id: 'quadratic',
					name: 'Quadratic Formula',
					formula: 'x = (-b ± √(b² - 4ac)) / 2a',
					description: 'Solves ax² + bx + c = 0',
					topic: 'Quadratic Equations',
				},
				{
					id: 'difference-squares',
					name: 'Difference of Squares',
					formula: 'a² - b² = (a + b)(a - b)',
					description: 'Factoring difference of two squares',
					topic: 'Factorisation',
				},
				{
					id: 'sum-cubes',
					name: 'Sum of Cubes',
					formula: 'a³ + b³ = (a + b)(a² - ab + b²)',
					description: 'Factoring sum of two cubes',
					topic: 'Factorisation',
				},
				{
					id: 'diff-cubes',
					name: 'Difference of Cubes',
					formula: 'a³ - b³ = (a - b)(a² + ab + b²)',
					description: 'Factoring difference of two cubes',
					topic: 'Factorisation',
				},
				{
					id: 'exponent-laws',
					name: 'Exponent Laws',
					formula: 'aᵐ × aⁿ = aᵐ⁺ⁿ, aᵐ / aⁿ = aᵐ⁻ⁿ',
					description: 'Laws of exponents',
					topic: 'Exponents',
				},
			],
		},
		{
			id: 'calculus',
			name: 'Calculus',
			formulas: [
				{
					id: 'power-rule',
					name: 'Power Rule (Derivative)',
					formula: 'd/dx(xⁿ) = nxⁿ⁻¹',
					description: 'Derivative of x raised to power n',
					topic: 'Differential Calculus',
				},
				{
					id: 'chain-rule',
					name: 'Chain Rule',
					formula: "d/dx[f(g(x))] = f'(g(x)) × g'(x)",
					description: 'Derivative of composite functions',
					topic: 'Differential Calculus',
				},
				{
					id: 'product-rule',
					name: 'Product Rule',
					formula: "d/dx(uv) = u'v + uv'",
					description: 'Derivative of product of two functions',
					topic: 'Differential Calculus',
				},
				{
					id: 'quotient-rule',
					name: 'Quotient Rule',
					formula: "d/dx(u/v) = (u'v - uv')/v²",
					description: 'Derivative of quotient of two functions',
					topic: 'Differential Calculus',
				},
				{
					id: 'power-rule-int',
					name: 'Power Rule (Integral)',
					formula: '∫xⁿdx = xⁿ⁺¹/(n+1) + C',
					description: 'Integral of x raised to power n (n ≠ -1)',
					topic: 'Integral Calculus',
				},
				{
					id: 'ftc',
					name: 'Fundamental Theorem',
					formula: '∫ₐᵇf(x)dx = F(b) - F(a)',
					description: 'Evaluating definite integrals',
					topic: 'Integral Calculus',
				},
			],
		},
		{
			id: 'trig',
			name: 'Trigonometry',
			formulas: [
				{
					id: 'pythagorean-identity',
					name: 'Pythagorean Identity',
					formula: 'sin²θ + cos²θ = 1',
					description: 'Fundamental trigonometric identity',
					topic: 'Identities',
				},
				{
					id: 'tan-identity',
					name: 'Tangent Identity',
					formula: 'tanθ = sinθ/cosθ',
					description: 'Definition of tangent',
					topic: 'Identities',
				},
				{
					id: 'double-angle-sin',
					name: 'Double Angle (Sine)',
					formula: 'sin2θ = 2sinθcosθ',
					description: 'Sine of double angle',
					topic: 'Double Angle',
				},
				{
					id: 'double-angle-cos',
					name: 'Double Angle (Cosine)',
					formula: 'cos2θ = cos²θ - sin²θ',
					description: 'Cosine of double angle',
					topic: 'Double Angle',
				},
				{
					id: 'sine-rule',
					name: 'Sine Rule',
					formula: 'a/sinA = b/sinB = c/sinC',
					description: 'Used in any triangle',
					topic: 'Triangles',
				},
				{
					id: 'cosine-rule',
					name: 'Cosine Rule',
					formula: 'c² = a² + b² - 2ab cosC',
					description: 'Used in any triangle',
					topic: 'Triangles',
				},
				{
					id: 'area-triangle',
					name: 'Area of Triangle',
					formula: 'Area = ½ab sinC',
					description: 'Using two sides and included angle',
					topic: 'Triangles',
				},
			],
		},
		{
			id: 'geometry',
			name: 'Geometry',
			formulas: [
				{
					id: 'circle-area',
					name: 'Area of Circle',
					formula: 'A = πr²',
					description: 'Area of a circle with radius r',
					topic: 'Circles',
				},
				{
					id: 'circumference',
					name: 'Circumference',
					formula: 'C = 2πr = πd',
					description: 'Perimeter of a circle',
					topic: 'Circles',
				},
				{
					id: 'sphere-volume',
					name: 'Volume of Sphere',
					formula: 'V = (4/3)πr³',
					description: 'Volume of a sphere',
					topic: '3D Shapes',
				},
				{
					id: 'cylinder-volume',
					name: 'Volume of Cylinder',
					formula: 'V = πr²h',
					description: 'Volume of a cylinder',
					topic: '3D Shapes',
				},
				{
					id: 'distance',
					name: 'Distance Formula',
					formula: 'd = √[(x₂-x₁)² + (y₂-y₁)²]',
					description: 'Distance between two points',
					topic: 'Analytical Geometry',
				},
				{
					id: 'midpoint',
					name: 'Midpoint Formula',
					formula: 'M = ((x₁+x₂)/2, (y₁+y₂)/2)',
					description: 'Midpoint of two points',
					topic: 'Analytical Geometry',
				},
				{
					id: 'gradient',
					name: 'Gradient',
					formula: 'm = (y₂-y₁)/(x₂-x₁)',
					description: 'Slope between two points',
					topic: 'Analytical Geometry',
				},
			],
		},
		{
			id: 'stats',
			name: 'Statistics & Probability',
			formulas: [
				{
					id: 'mean',
					name: 'Mean',
					formula: 'x̄ = Σxᵢ/n',
					description: 'Average of all values',
					topic: 'Measures of Central Tendency',
				},
				{
					id: 'variance',
					name: 'Variance',
					formula: 'σ² = Σ(xᵢ - x̄)²/n',
					description: 'Measure of spread',
					topic: 'Measures of Dispersion',
				},
				{
					id: 'std-dev',
					name: 'Standard Deviation',
					formula: 'σ = √[Σ(xᵢ - x̄)²/n]',
					description: 'Square root of variance',
					topic: 'Measures of Dispersion',
				},
				{
					id: 'probability',
					name: 'Probability',
					formula: 'P(A) = n(A)/n(S)',
					description: 'Probability of event A',
					topic: 'Probability',
				},
				{
					id: 'bayes',
					name: 'Bayes Theorem',
					formula: 'P(A|B) = P(B|A)×P(A)/P(B)',
					description: 'Conditional probability',
					topic: 'Probability',
				},
			],
		},
	],
};

export const physicsFormulas: SubjectFormulas = {
	subject: 'Physical Sciences',
	topics: [
		{
			id: 'mechanics',
			name: 'Mechanics',
			formulas: [
				{
					id: 'velocity',
					name: 'Velocity',
					formula: 'v = Δx/Δt',
					description: 'Average velocity',
					unit: 'm/s',
					topic: 'Kinematics',
				},
				{
					id: 'acceleration',
					name: 'Acceleration',
					formula: 'a = Δv/Δt',
					description: 'Rate of change of velocity',
					unit: 'm/s²',
					topic: 'Kinematics',
				},
				{
					id: 'suvat',
					name: 'Equations of Motion',
					formula: 'v = u + at, s = ut + ½at², v² = u² + 2as',
					description: 'SUVAT equations',
					unit: 'm, m/s, m/s²',
					topic: 'Kinematics',
				},
				{
					id: 'newton2',
					name: "Newton's 2nd Law",
					formula: 'F = ma',
					description: 'Force equals mass times acceleration',
					unit: 'N',
					topic: 'Dynamics',
				},
				{
					id: 'momentum',
					name: 'Momentum',
					formula: 'p = mv',
					description: 'Linear momentum',
					unit: 'kg·m/s',
					topic: 'Dynamics',
				},
				{
					id: 'impulse',
					name: 'Impulse',
					formula: 'J = FΔt = Δp',
					description: 'Change in momentum',
					unit: 'N·s',
					topic: 'Dynamics',
				},
				{
					id: 'weight',
					name: 'Weight',
					formula: 'W = mg',
					description: 'Force due to gravity',
					unit: 'N',
					topic: 'Forces',
				},
				{
					id: 'friction',
					name: 'Friction',
					formula: 'f = μN',
					description: 'Maximum static/kinetic friction',
					unit: 'N',
					topic: 'Forces',
				},
				{
					id: 'work',
					name: 'Work',
					formula: 'W = FΔx cosθ',
					description: 'Work done by a force',
					unit: 'J',
					topic: 'Work & Energy',
				},
				{
					id: 'ke',
					name: 'Kinetic Energy',
					formula: 'KE = ½mv²',
					description: 'Energy of motion',
					unit: 'J',
					topic: 'Work & Energy',
				},
				{
					id: 'gpe',
					name: 'Gravitational PE',
					formula: 'PE = mgh',
					description: 'Energy due to height',
					unit: 'J',
					topic: 'Work & Energy',
				},
				{
					id: 'power',
					name: 'Power',
					formula: 'P = W/t = Fv',
					description: 'Rate of doing work',
					unit: 'W',
					topic: 'Work & Energy',
				},
			],
		},
		{
			id: 'waves',
			name: 'Waves & Sound',
			formulas: [
				{
					id: 'wave-speed',
					name: 'Wave Speed',
					formula: 'v = fλ',
					description: 'Speed equals frequency times wavelength',
					unit: 'm/s',
					topic: 'Wave Properties',
				},
				{
					id: 'period-freq',
					name: 'Period-Frequency',
					formula: 'f = 1/T',
					description: 'Frequency is inverse of period',
					unit: 'Hz, s',
					topic: 'Wave Properties',
				},
				{
					id: 'doppler',
					name: 'Doppler Effect',
					formula: "f' = f(v ± v₀)/(v ∓ vₛ)",
					description: 'Frequency change due to motion',
					unit: 'Hz',
					topic: 'Sound',
				},
			],
		},
		{
			id: 'electricity',
			name: 'Electricity',
			formulas: [
				{
					id: 'ohms-law',
					name: "Ohm's Law",
					formula: 'V = IR',
					description: 'Voltage equals current times resistance',
					unit: 'V, A, Ω',
					topic: 'Circuits',
				},
				{
					id: 'power-elec',
					name: 'Electrical Power',
					formula: 'P = IV = I²R = V²/R',
					description: 'Rate of electrical energy transfer',
					unit: 'W',
					topic: 'Circuits',
				},
				{
					id: 'resistance',
					name: 'Resistance (Series)',
					formula: 'R = R₁ + R₂ + R₃',
					description: 'Total resistance in series',
					unit: 'Ω',
					topic: 'Circuits',
				},
				{
					id: 'resistance-parallel',
					name: 'Resistance (Parallel)',
					formula: '1/R = 1/R₁ + 1/R₂ + 1/R₃',
					description: 'Total resistance in parallel',
					unit: 'Ω',
					topic: 'Circuits',
				},
				{
					id: 'coulombs',
					name: "Coulomb's Law",
					formula: 'F = kq₁q₂/r²',
					description: 'Force between two charges',
					unit: 'N',
					topic: 'Electrostatics',
				},
			],
		},
		{
			id: 'optics',
			name: 'Optics',
			formulas: [
				{
					id: 'snells',
					name: "Snell's Law",
					formula: 'n₁ sinθ₁ = n₂ sinθ₂',
					description: 'Law of refraction',
					topic: 'Refraction',
				},
				{
					id: 'lens',
					name: 'Thin Lens Equation',
					formula: '1/f = 1/do + 1/di',
					description: 'Lens maker equation',
					unit: 'm',
					topic: 'Lenses',
				},
				{
					id: 'magnification',
					name: 'Magnification',
					formula: 'M = -di/do = hi/ho',
					description: 'Image size relative to object',
					topic: 'Lenses',
				},
			],
		},
		{
			id: 'thermo',
			name: 'Thermodynamics',
			formulas: [
				{
					id: 'heat',
					name: 'Heat Transfer',
					formula: 'Q = mcΔT',
					description: 'Heat equals mass times specific heat times temperature change',
					unit: 'J',
					topic: 'Heat',
				},
				{
					id: 'latent',
					name: 'Latent Heat',
					formula: 'Q = mL',
					description: 'Heat during phase change',
					unit: 'J',
					topic: 'Heat',
				},
				{
					id: 'ideal-gas',
					name: 'Ideal Gas Law',
					formula: 'PV = nRT',
					description: 'Pressure, volume, moles, temperature relationship',
					unit: 'Pa, m³, mol, K',
					topic: 'Gases',
				},
			],
		},
	],
};

export const chemistryFormulas: SubjectFormulas = {
	subject: 'Chemistry',
	topics: [
		{
			id: 'stoichiometry',
			name: 'Stoichiometry',
			formulas: [
				{
					id: 'molar-mass',
					name: 'Molar Mass',
					formula: 'M = m/n',
					description: 'Mass per mole',
					unit: 'g/mol',
					topic: 'Moles',
				},
				{
					id: 'moles',
					name: 'Moles',
					formula: 'n = m/M = N/NA',
					description: 'Number of moles from mass or particles',
					unit: 'mol',
					topic: 'Moles',
				},
				{
					id: 'concentration',
					name: 'Concentration',
					formula: 'c = n/V',
					description: 'Molar concentration',
					unit: 'mol/L',
					topic: 'Solutions',
				},
				{
					id: 'dilution',
					name: 'Dilution',
					formula: 'c₁V₁ = c₂V₂',
					description: 'Diluting solutions',
					unit: 'mol/L, L',
					topic: 'Solutions',
				},
			],
		},
		{
			id: 'gas-laws',
			name: 'Gas Laws',
			formulas: [
				{
					id: 'boyles',
					name: "Boyle's Law",
					formula: 'P₁V₁ = P₂V₂',
					description: 'Pressure-volume relationship (constant T)',
					unit: 'Pa, m³',
					topic: 'Gas Laws',
				},
				{
					id: 'charles',
					name: "Charles's Law",
					formula: 'V₁/T₁ = V₂/T₂',
					description: 'Volume-temperature relationship (constant P)',
					unit: 'm³, K',
					topic: 'Gas Laws',
				},
				{
					id: 'combined-gas',
					name: 'Combined Gas Law',
					formula: 'P₁V₁/T₁ = P₂V₂/T₂',
					description: 'Combined gas law equation',
					unit: 'Pa, m³, K',
					topic: 'Gas Laws',
				},
			],
		},
		{
			id: 'electrochemistry',
			name: 'Electrochemistry',
			formulas: [
				{
					id: 'faraday',
					name: "Faraday's Law",
					formula: 'm = (Q × M) / (z × F)',
					description: 'Mass deposited during electrolysis',
					unit: 'g',
					topic: 'Electrolysis',
				},
				{
					id: 'charge',
					name: 'Electric Charge',
					formula: 'Q = It',
					description: 'Charge equals current times time',
					unit: 'C',
					topic: 'Electrolysis',
				},
			],
		},
		{
			id: 'equilibrium',
			name: 'Equilibrium',
			formulas: [
				{
					id: 'eq-constant',
					name: 'Equilibrium Constant',
					formula: 'Kc = [C]ᶜ[D]ᵈ / [A]ᵃ[B]ᵇ',
					description: 'Concentration equilibrium constant',
					topic: 'Chemical Equilibrium',
				},
				{
					id: 'leh-chatelier',
					name: 'Le Chatelier Principle',
					formula: 'K = Kw = [H⁺][OH⁻]',
					description: 'Water ionization constant',
					unit: 'mol²/L²',
					topic: 'Acids & Bases',
				},
				{
					id: 'ph',
					name: 'pH',
					formula: 'pH = -log[H⁺]',
					description: 'Measure of acidity',
					unit: 'unitless',
					topic: 'Acids & Bases',
				},
				{
					id: 'poh',
					name: 'pOH',
					formula: 'pOH = -log[OH⁻]',
					description: 'Measure of basicity',
					unit: 'unitless',
					topic: 'Acids & Bases',
				},
				{
					id: 'ph-poh',
					name: 'pH-pH Relationship',
					formula: 'pH + pOH = 14',
					description: 'pH and pOH relationship at 25°C',
					unit: 'unitless',
					topic: 'Acids & Bases',
				},
			],
		},
		{
			id: 'kinetics',
			name: 'Chemical Kinetics',
			formulas: [
				{
					id: 'rate-law',
					name: 'Rate Law',
					formula: 'Rate = k[A]ᵐ[B]ⁿ',
					description: 'Reaction rate equation',
					unit: 'mol/(L·s)',
					topic: 'Reaction Rates',
				},
				{
					id: 'arrhenius',
					name: 'Arrhenius Equation',
					formula: 'k = Ae^(-Ea/RT)',
					description: 'Temperature dependence of rate constant',
					topic: 'Reaction Rates',
				},
			],
		},
	],
};

export function getFormulasBySubject(subject: string): SubjectFormulas | null {
	const subjects: Record<string, SubjectFormulas> = {
		mathematics: mathFormulas,
		maths: mathFormulas,
		math: mathFormulas,
		physics: physicsFormulas,
		'physical sciences': physicsFormulas,
		chemistry: chemistryFormulas,
	};

	return subjects[subject.toLowerCase()] || null;
}

export function searchFormulas(query: string): Formula[] {
	const results: Formula[] = [];
	const q = query.toLowerCase();

	const allFormulas = [mathFormulas, physicsFormulas, chemistryFormulas];

	for (const subject of allFormulas) {
		for (const topic of subject.topics) {
			for (const formula of topic.formulas) {
				if (
					formula.name.toLowerCase().includes(q) ||
					formula.formula.toLowerCase().includes(q) ||
					formula.description.toLowerCase().includes(q) ||
					topic.name.toLowerCase().includes(q)
				) {
					results.push(formula);
				}
			}
		}
	}

	return results;
}
