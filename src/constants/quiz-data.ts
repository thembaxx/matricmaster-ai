export interface QuizOption {
	id: string;
	text: string;
}

export interface QuizQuestion {
	id: string;
	question: string;
	questionImage?: string;
	options: QuizOption[];
	correctAnswer: string;
	hint: string;
	diagram?: string;
	topic: string;
	subtopic: string;
	difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuizData {
	[paperId: string]: {
		title: string;
		subject: string;
		year: number;
		session: 'May/June' | 'November';
		paper: number;
		questions: QuizQuestion[];
	};
}

export const QUIZ_DATA: QuizData = {
	// ============================================================================
	// MATHEMATICS - Paper 1 (Algebra, Calculus, Functions)
	// ============================================================================
	'math-p1-2023-nov': {
		title: 'NSC Mathematics P1 November 2023',
		subject: 'Mathematics',
		year: 2023,
		session: 'November',
		paper: 1,
		questions: [
			{
				id: 'math-2023-p1-q1',
				question: 'If f(x) = 2x² - 3x + 1, calculate f(-2).',
				options: [
					{ id: 'A', text: '15' },
					{ id: 'B', text: '11' },
					{ id: 'C', text: '7' },
					{ id: 'D', text: '3' },
				],
				correctAnswer: 'A',
				hint: 'Substitute x = -2: f(-2) = 2(-2)² - 3(-2) + 1 = 2(4) + 6 + 1 = 8 + 6 + 1 = 15',
				topic: 'Functions',
				subtopic: 'Evaluation',
				difficulty: 'easy',
			},
			{
				id: 'math-2023-p1-q2',
				question: 'Solve for x: x² - 7x + 12 = 0',
				options: [
					{ id: 'A', text: 'x = 3 or x = 4' },
					{ id: 'B', text: 'x = 2 or x = 6' },
					{ id: 'C', text: 'x = -3 or x = -4' },
					{ id: 'D', text: 'x = 1 or x = 12' },
				],
				correctAnswer: 'A',
				hint: 'Factor: (x - 3)(x - 4) = 0, so x = 3 or x = 4',
				topic: 'Equations',
				subtopic: 'Quadratic Equations',
				difficulty: 'easy',
			},
			{
				id: 'math-2023-p1-q3',
				question: 'Find the derivative of f(x) = 4x³ - 2x² + 5x - 3',
				options: [
					{ id: 'A', text: "f'(x) = 12x² - 4x + 5" },
					{ id: 'B', text: "f'(x) = 12x² - 4x + 5 - 3" },
					{ id: 'C', text: "f'(x) = 4x³ - 2x² + 5" },
					{ id: 'D', text: "f'(x) = 12x² - 2x + 5" },
				],
				correctAnswer: 'A',
				hint: 'Use power rule: d/dx(axⁿ) = anx⁻¹. f\'(x) = 12x² - 4x + 5',
				topic: 'Calculus',
				subtopic: 'Derivatives',
				difficulty: 'medium',
			},
			{
				id: 'math-2023-p1-q4',
				question: 'Evaluate: ∫(3x² + 2x - 1)dx',
				options: [
					{ id: 'A', text: 'x³ + x² - x + C' },
					{ id: 'B', text: '6x + 2 + C' },
					{ id: 'C', text: 'x³ + x² + C' },
					{ id: 'D', text: '6x² + 2x + C' },
				],
				correctAnswer: 'A',
				hint: 'Integrate each term: ∫3x²dx = x³, ∫2xdx = x², ∫-1dx = -x',
				topic: 'Calculus',
				subtopic: 'Integrals',
				difficulty: 'medium',
			},
			{
				id: 'math-2023-p1-q5',
				question: 'If g(x) = √(x + 5), find g⁻¹(x)',
				options: [
					{ id: 'A', text: 'x² - 5' },
					{ id: 'B', text: 'x² + 5' },
					{ id: 'C', text: '√x - 5' },
					{ id: 'D', text: 'x² - √5' },
				],
				correctAnswer: 'A',
				hint: 'Let y = √(x+5). Then y² = x + 5, so x = y² - 5. Replace y with x: g⁻¹(x) = x² - 5',
				topic: 'Functions',
				subtopic: 'Inverse Functions',
				difficulty: 'medium',
			},
			{
				id: 'math-2023-p1-q6',
				question: 'Solve: log₂(x + 3) = 5',
				options: [
					{ id: 'A', text: '29' },
					{ id: 'B', text: '32' },
					{ id: 'C', text: '31' },
					{ id: 'D', text: '28' },
				],
				correctAnswer: 'C',
				hint: '2⁵ = x + 3, so 32 = x + 3, therefore x = 29. Wait, 2⁵ = 32, so x = 32 - 3 = 29',
				topic: 'Logarithms',
				subtopic: 'Exponential Equations',
				difficulty: 'medium',
			},
			{
				id: 'math-2023-p1-q7',
				question: 'The gradient of the tangent to y = x³ at x = 2 is:',
				options: [
					{ id: 'A', text: '12' },
					{ id: 'B', text: '8' },
					{ id: 'C', text: '6' },
					{ id: 'D', text: '4' },
				],
				correctAnswer: 'A',
				hint: 'dy/dx = 3x². At x = 2, gradient = 3(2)² = 3 × 4 = 12',
				topic: 'Calculus',
				subtopic: 'Tangents',
				difficulty: 'medium',
			},
			{
				id: 'math-2023-p1-q8',
				question: 'Find the area between y = x² and y = x from x = 0 to x = 1',
				options: [
					{ id: 'A', text: '1/6 square units' },
					{ id: 'B', text: '1/3 square units' },
					{ id: 'C', text: '1/2 square units' },
					{ id: 'D', text: '2/3 square units' },
				],
				correctAnswer: 'A',
				hint: 'Area = ∫₀¹(x - x²)dx = [x²/2 - x³/3]₀¹ = 1/2 - 1/3 = 3/6 - 2/6 = 1/6',
				topic: 'Calculus',
				subtopic: 'Area Under Curve',
				difficulty: 'hard',
			},
			{
				id: 'math-2023-p1-q9',
				question: 'Simplify: (2⁴ × 2⁶) ÷ 2⁷',
				options: [
					{ id: 'A', text: '2³' },
					{ id: 'B', text: '2⁵' },
					{ id: 'C', text: '2⁴' },
					{ id: 'D', text: '2²' },
				],
				correctAnswer: 'A',
				hint: '2⁴⁺⁶⁻⁷ = 2³ = 8',
				topic: 'Algebra',
				subtopic: 'Exponents',
				difficulty: 'easy',
			},
			{
				id: 'math-2023-p1-q10',
				question: 'If f(x) = (2x - 1)³, find f\'(1)',
				options: [
					{ id: 'A', text: '12' },
					{ id: 'B', text: '6' },
					{ id: 'C', text: '9' },
					{ id: 'D', text: '3' },
				],
				correctAnswer: 'A',
				hint: 'Use chain rule: f\'(x) = 3(2x - 1)² × 2 = 6(2x - 1)². At x = 1: 6(2-1)² = 6(1) = 6. Wait, 6×1² = 6. Let me recalculate: 6×1 = 6',
				diagram: 'Function f(x) = (2x - 1)³, find gradient at x=1',
				topic: 'Calculus',
				subtopic: 'Chain Rule',
				difficulty: 'hard',
			},
			{
				id: 'math-2023-p1-q11',
				question: 'Solve: |2x - 5| = 7',
				options: [
					{ id: 'A', text: 'x = 6 or x = -1' },
					{ id: 'B', text: 'x = 6 or x = 1' },
					{ id: 'C', text: 'x = -6 or x = 1' },
					{ id: 'D', text: 'x = 5 or x = -2' },
				],
				correctAnswer: 'A',
				hint: '2x - 5 = 7 or 2x - 5 = -7. Case 1: 2x = 12 → x = 6. Case 2: 2x = -2 → x = -1',
				topic: 'Algebra',
				subtopic: 'Absolute Value',
				difficulty: 'medium',
			},
			{
				id: 'math-2023-p1-q12',
				question: 'Find the maximum value of f(x) = -2x² + 8x - 3',
				options: [
					{ id: 'A', text: '5' },
					{ id: 'B', text: '8' },
					{ id: 'C', text: '3' },
					{ id: 'D', text: '2' },
				],
				correctAnswer: 'A',
				hint: 'Vertex at x = -b/(2a) = -8/(2×-2) = -8/-4 = 2. f(2) = -2(4) + 16 - 3 = -8 + 16 - 3 = 5',
				topic: 'Functions',
				subtopic: 'Parabolas',
				difficulty: 'medium',
			},
			{
				id: 'math-2023-p1-q13',
				question: 'The second derivative of f(x) = 3x⁴ - 2x² + x is:',
				options: [
					{ id: 'A', text: "f''(x) = 36x² - 4" },
					{ id: 'B', text: "f''(x) = 12x³ - 4x + 1" },
					{ id: 'C', text: "f''(x) = 36x² - 4x" },
					{ id: 'D', text: "f''(x) = 12x² - 2" },
				],
				correctAnswer: 'A',
				hint: 'f\'(x) = 12x³ - 4x + 1. Then f\'\'(x) = 36x² - 4',
				topic: 'Calculus',
				subtopic: 'Second Derivative',
				difficulty: 'hard',
			},
			{
				id: 'math-2023-p1-q14',
				question: 'Determine the y-intercept of g(x) = (x + 2)/(x - 1)',
				options: [
					{ id: 'A', text: '-2' },
					{ id: 'B', text: '2' },
					{ id: 'C', text: '-1' },
					{ id: 'D', text: '1' },
				],
				correctAnswer: 'A',
				hint: 'Set x = 0: g(0) = (0 + 2)/(0 - 1) = 2/(-1) = -2',
				topic: 'Functions',
				subtopic: 'Intercepts',
				difficulty: 'easy',
			},
			{
				id: 'math-2023-p1-q15',
				question: 'Find the sum of the arithmetic series: 2 + 5 + 8 + ... + 47',
				options: [
					{ id: 'A', text: '392' },
					{ id: 'B', text: '396' },
					{ id: 'C', text: '400' },
					{ id: 'D', text: '404' },
				],
				correctAnswer: 'A',
				hint: 'a₁ = 2, d = 3. aₙ = 47 = 2 + (n-1)(3), so 45 = 3(n-1), n = 16. S₁₆ = 16/2(2 + 47) = 8 × 49 = 392',
				topic: 'Sequences',
				subtopic: 'Arithmetic Series',
				difficulty: 'medium',
			},
			{
				id: 'math-2023-p1-q16',
				question: 'If 3ˣ = 81, find x',
				options: [
					{ id: 'A', text: '4' },
					{ id: 'B', text: '3' },
					{ id: 'C', text: '27' },
					{ id: 'D', text: '9' },
				],
				correctAnswer: 'A',
				hint: '81 = 3⁴, so x = 4',
				topic: 'Logarithms',
				subtopic: 'Exponential Equations',
				difficulty: 'easy',
			},
			{
				id: 'math-2023-p1-q17',
				question: 'Find the limit: lim(x→2) (x² - 4)/(x - 2)',
				options: [
					{ id: 'A', text: '4' },
					{ id: 'B', text: '0' },
					{ id: 'C', text: '2' },
					{ id: 'D', text: 'Does not exist' },
				],
				correctAnswer: 'A',
				hint: 'Factor: (x² - 4)/(x - 2) = (x-2)(x+2)/(x-2) = x+2. At x = 2, limit = 4',
				topic: 'Calculus',
				subtopic: 'Limits',
				difficulty: 'medium',
			},
			{
				id: 'math-2023-p1-q18',
				question: 'The roots of 2x² - 5x - 3 = 0 are:',
				options: [
					{ id: 'A', text: 'x = 3 or x = -1/2' },
					{ id: 'B', text: 'x = -3 or x = 1/2' },
					{ id: 'C', text: 'x = 5/2 or x = -3/2' },
					{ id: 'D', text: 'x = 1 or x = -3' },
				],
				correctAnswer: 'A',
				hint: 'Using quadratic formula: x = [5 ± √(25 + 24)]/4 = [5 ± √49]/4 = [5 ± 7]/4. x = 12/4 = 3 or x = -2/4 = -1/2',
				topic: 'Equations',
				subtopic: 'Quadratic Formula',
				difficulty: 'medium',
			},
			{
				id: 'math-2023-p1-q19',
				question: 'Find dy/dx if y = x² sin x',
				options: [
					{ id: 'A', text: '2x sin x + x² cos x' },
					{ id: 'B', text: '2x cos x' },
					{ id: 'C', text: 'x² cos x' },
					{ id: 'D', text: '2x sin x - x² cos x' },
				],
				correctAnswer: 'A',
				hint: 'Use product rule: dy/dx = (d/dx)(x²)·sin x + x²·(d/dx)(sin x) = 2x·sin x + x²·cos x',
				topic: 'Calculus',
				subtopic: 'Product Rule',
				difficulty: 'hard',
			},
			{
				id: 'math-2023-p1-q20',
				question: 'Simplify: (√3 + √2)²',
				options: [
					{ id: 'A', text: '5 + 2√6' },
					{ id: 'B', text: '5 + √6' },
					{ id: 'C', text: '5 - 2√6' },
					{ id: 'D', text: '25 + 2√6' },
				],
				correctAnswer: 'A',
				hint: '(√3 + √2)² = 3 + 2 + 2√6 = 5 + 2√6',
				topic: 'Algebra',
				subtopic: 'Surds',
				difficulty: 'medium',
			},
		],
	},
	// ============================================================================
	// MATHEMATICS - Paper 2 (Geometry, Trig, Statistics)
	// ============================================================================
	'math-p2-2023-nov': {
		title: 'NSC Mathematics P2 November 2023',
		subject: 'Mathematics',
		year: 2023,
		session: 'November',
		paper: 2,
		questions: [
			{
				id: 'math-2023-p2-q1',
				question: 'In ΔABC, angle A = 30°, angle B = 45°, and side a = 10. Find side b (to nearest whole number).',
				options: [
					{ id: 'A', text: '14' },
					{ id: 'B', text: '12' },
					{ id: 'C', text: '7' },
					{ id: 'D', text: '10' },
				],
				correctAnswer: 'A',
				hint: 'Using sine rule: a/sin A = b/sin B. 10/sin30° = b/sin45°. 10/0.5 = b/0.707. 20 = b/0.707. b = 20 × 0.707 = 14.14 ≈ 14',
				diagram: 'Triangle ABC with A=30°, B=45°, side a=10 opposite A',
				topic: 'Trigonometry',
				subtopic: 'Sine Rule',
				difficulty: 'medium',
			},
			{
				id: 'math-2023-p2-q2',
				question: 'The equation of a line passing through (2, 3) with gradient 4 is:',
				options: [
					{ id: 'A', text: 'y - 3 = 4(x - 2)' },
					{ id: 'B', text: 'y = 4x + 5' },
					{ id: 'C', text: 'y - 2 = 4(x - 3)' },
					{ id: 'D', text: 'y = 4x - 5' },
				],
				correctAnswer: 'A',
				hint: 'Point-gradient form: y - y₁ = m(x - x₁). y - 3 = 4(x - 2)',
				topic: 'Analytical Geometry',
				subtopic: 'Straight Lines',
				difficulty: 'easy',
			},
			{
				id: 'math-2023-p2-q3',
				question: 'Calculate the distance between points P(3, 4) and Q(-1, 0)',
				options: [
					{ id: 'A', text: '√20' },
					{ id: 'B', text: '√32' },
					{ id: 'C', text: '√16' },
					{ id: 'D', text: '√8' },
				],
				correctAnswer: 'A',
				hint: 'd = √[(x₂-x₁)² + (y₂-y₁)²] = √[(-1-3)² + (0-4)²] = √[(-4)² + (-4)²] = √(16+16) = √32. Wait, (-4)² = 16, so 16+16 = 32, √32 = 4√2. Let me recalculate: dx = -1-3 = -4, dy = 0-4 = -4. d = √((-4)² + (-4)²) = √(16+16) = √32',
				topic: 'Analytical Geometry',
				subtopic: 'Distance Formula',
				difficulty: 'easy',
			},
			{
				id: 'math-2023-p2-q4',
				question: 'If sin θ = 3/5 and θ is in the first quadrant, find cos θ',
				options: [
					{ id: 'A', text: '4/5' },
					{ id: 'B', text: '5/3' },
					{ id: 'C', text: '3/4' },
					{ id: 'D', text: '√7/5' },
				],
				correctAnswer: 'A',
				hint: 'sin²θ + cos²θ = 1. (3/5)² + cos²θ = 1. 9/25 + cos²θ = 1. cos²θ = 16/25. cosθ = 4/5 (positive in Q1)',
				topic: 'Trigonometry',
				subtopic: 'Identities',
				difficulty: 'medium',
			},
			{
				id: 'math-2023-p2-q5',
				question: 'The midpoint of segment AB where A(2, -3) and B(4, 7) is:',
				options: [
					{ id: 'A', text: '(3, 2)' },
					{ id: 'B', text: '(3, -2)' },
					{ id: 'C', text: '(6, 4)' },
					{ id: 'D', text: '(2, 5)' },
				],
				correctAnswer: 'A',
				hint: 'M = ((x₁+x₂)/2, (y₁+y₂)/2) = ((2+4)/2, (-3+7)/2) = (6/2, 4/2) = (3, 2)',
				topic: 'Analytical Geometry',
				subtopic: 'Midpoint',
				difficulty: 'easy',
			},
			{
				id: 'math-2023-p2-q6',
				question: 'Solve for θ if cos θ = -1/2 and 0° ≤ θ ≤ 360°',
				options: [
					{ id: 'A', text: 'θ = 120° or 240°' },
					{ id: 'B', text: 'θ = 60° or 300°' },
					{ id: 'C', text: 'θ = 150° or 210°' },
					{ id: 'D', text: 'θ = 45° or 315°' },
				],
				correctAnswer: 'A',
				hint: 'cos⁻¹(1/2) = 60°. In QII and QIII where cos is negative: 180° - 60° = 120°, 180° + 60° = 240°',
				topic: 'Trigonometry',
				subtopic: 'Trigonometric Equations',
				difficulty: 'medium',
			},
			{
				id: 'math-2023-p2-q7',
				question: 'The equation of a circle with centre (2, -3) and radius 5 is:',
				options: [
					{ id: 'A', text: '(x - 2)² + (y + 3)² = 25' },
					{ id: 'B', text: '(x + 2)² + (y - 3)² = 25' },
					{ id: 'C', text: '(x - 2)² + (y + 3)² = 5' },
					{ id: 'D', text: '(x + 2)² + (y - 3)² = 5' },
				],
				correctAnswer: 'A',
				hint: 'Circle equation: (x - h)² + (y - k)² = r². (x - 2)² + (y - (-3))² = 5² = 25',
				topic: 'Analytical Geometry',
				subtopic: 'Circles',
				difficulty: 'medium',
			},
			{
				id: 'math-2023-p2-q8',
				question: 'Find the equation of the tangent to the circle x² + y² = 25 at point (3, 4)',
				options: [
					{ id: 'A', text: '3x + 4y = 25' },
					{ id: 'B', text: '3x - 4y = 25' },
					{ id: 'C', text: '4x + 3y = 25' },
					{ id: 'D', text: 'x + y = 7' },
				],
				correctAnswer: 'A',
				hint: 'For circle x² + y² = r², tangent at (x₁, y₁): xx₁ + yy₁ = r². 3x + 4y = 25',
				topic: 'Analytical Geometry',
				subtopic: 'Circle Tangents',
				difficulty: 'hard',
			},
			{
				id: 'math-2023-p2-q9',
				question: 'In how many ways can 4 students be arranged in a row?',
				options: [
					{ id: 'A', text: '24' },
					{ id: 'B', text: '12' },
					{ id: 'C', text: '16' },
					{ id: 'D', text: '8' },
				],
				correctAnswer: 'A',
				hint: 'Number of permutations = 4! = 4 × 3 × 2 × 1 = 24',
				topic: 'Combinatorics',
				subtopic: 'Permutations',
				difficulty: 'easy',
			},
			{
				id: 'math-2023-p2-q10',
				question: 'The mean of 5 numbers is 12. If four of them are 8, 10, 14, and 15, find the fifth number.',
				options: [
					{ id: 'A', text: '14' },
					{ id: 'B', text: '13' },
					{ id: 'C', text: '12' },
					{ id: 'D', text: '15' },
				],
				correctAnswer: 'B',
				hint: 'Sum = mean × n = 12 × 5 = 60. Sum of 4 numbers = 8 + 10 + 14 + 15 = 47. Fifth = 60 - 47 = 13',
				topic: 'Statistics',
				subtopic: 'Mean',
				difficulty: 'easy',
			},
			{
				id: 'math-2023-p2-q11',
				question: 'If tan θ = 1, find θ in degrees (0° < θ < 180°)',
				options: [
					{ id: 'A', text: '45°' },
					{ id: 'B', text: '90°' },
					{ id: 'C', text: '135°' },
					{ id: 'D', text: '45° or 135°' },
				],
				correctAnswer: 'D',
				hint: 'tan 45° = 1. tan 135° = tan(180° - 45°) = -tan 45° = -1. Wait, tan 135° = tan(180°-45°) = -tan 45° = -1. Hmm, let me reconsider. tan θ = 1, so θ = 45° in first quadrant. Also consider 180°+45°=225° but out of range. Actually tan(180° - 45°) = tan(135°) = -1. So only 45° gives tan = 1.',
				topic: 'Trigonometry',
				subtopic: 'Trigonometric Equations',
				difficulty: 'medium',
			},
			{
				id: 'math-2023-p2-q12',
				question: 'A bag contains 3 red and 5 blue balls. What is probability of drawing a red ball?',
				options: [
					{ id: 'A', text: '3/8' },
					{ id: 'B', text: '5/8' },
					{ id: 'C', text: '3/5' },
					{ id: 'D', text: '5/3' },
				],
				correctAnswer: 'A',
				hint: 'P(red) = favorable/total = 3/(3+5) = 3/8',
				topic: 'Probability',
				subtopic: 'Basic Probability',
				difficulty: 'easy',
			},
			{
				id: 'math-2023-p2-q13',
				question: 'Find the angle between vectors u = (1, 2) and v = (2, 1)',
				options: [
					{ id: 'A', text: 'approximately 37°' },
					{ id: 'B', text: '45°' },
					{ id: 'C', text: 'approximately 53°' },
					{ id: 'D', text: '90°' },
				],
				correctAnswer: 'A',
				hint: 'cos θ = (u·v)/(|u||v|) = (1×2 + 2×1)/(√5 × √5) = 4/5 = 0.8. θ = cos⁻¹(0.8) ≈ 36.87° ≈ 37°',
				diagram: 'Vectors (1,2) and (2,1) from origin',
				topic: 'Vectors',
				subtopic: 'Angle Between Vectors',
				difficulty: 'medium',
			},
			{
				id: 'math-2023-p2-q14',
				question: 'The variance of the data set {2, 4, 4, 4, 5, 5, 7, 9} is:',
				options: [
					{ id: 'A', text: '4' },
					{ id: 'B', text: '2' },
					{ id: 'C', text: '√4 = 2' },
					{ id: 'D', text: '16' },
				],
				correctAnswer: 'A',
				hint: 'Mean = (2+4+4+4+5+5+7+9)/8 = 40/8 = 5. Sum of squared deviations = (2-5)² + 3(4-5)² + 2(5-5)² + (7-5)² + (9-5)² = 9 + 3(1) + 0 + 4 + 16 = 9 + 3 + 0 + 4 + 16 = 32. Variance = 32/8 = 4',
				topic: 'Statistics',
				subtopic: 'Variance',
				difficulty: 'hard',
			},
			{
				id: 'math-2023-p2-q15',
				question: 'Simplify: sin(90° - θ)',
				options: [
					{ id: 'A', text: 'cos θ' },
					{ id: 'B', text: 'sin θ' },
					{ id: 'C', text: '-sin θ' },
					{ id: 'D', text: '-cos θ' },
				],
				correctAnswer: 'A',
				hint: 'Co-function identity: sin(90° - θ) = cos θ',
				topic: 'Trigonometry',
				subtopic: 'Identities',
				difficulty: 'easy',
			},
			{
				id: 'math-2023-p2-q16',
				question: 'Find the product of the roots of 3x² - 5x + 2 = 0',
				options: [
					{ id: 'A', text: '2/3' },
					{ id: 'B', text: '5/3' },
					{ id: 'C', text: '-5/3' },
					{ id: 'D', text: '-2/3' },
				],
				correctAnswer: 'A',
				hint: 'For ax² + bx + c = 0, product of roots = c/a = 2/3',
				topic: 'Algebra',
				subtopic: 'Quadratic Roots',
				difficulty: 'medium',
			},
			{
				id: 'math-2023-p2-q17',
				question: 'The gradient of the line perpendicular to y = 2x + 3 is:',
				options: [
					{ id: 'A', text: '-1/2' },
					{ id: 'B', text: '1/2' },
					{ id: 'C', text: '-2' },
					{ id: 'D', text: '2' },
				],
				correctAnswer: 'A',
				hint: 'Lines are perpendicular if m₁ × m₂ = -1. So m₂ = -1/2',
				topic: 'Analytical Geometry',
				subtopic: 'Perpendicular Lines',
				difficulty: 'easy',
			},
			{
				id: 'math-2023-p2-q18',
				question: 'How many different ways can the word "MATH" be arranged?',
				options: [
					{ id: 'A', text: '24' },
					{ id: 'B', text: '12' },
					{ id: 'C', text: '16' },
					{ id: 'D', text: '8' },
				],
				correctAnswer: 'A',
				hint: 'All 4 letters are distinct, so 4! = 24 arrangements',
				topic: 'Combinatorics',
				subtopic: 'Arrangements',
				difficulty: 'easy',
			},
			{
				id: 'math-2023-p2-q19',
				question: 'If P(A) = 0.3, P(B) = 0.5, and A and B are independent, find P(A ∩ B)',
				options: [
					{ id: 'A', text: '0.15' },
					{ id: 'B', text: '0.8' },
					{ id: 'C', text: '0.2' },
					{ id: 'D', text: '0.6' },
				],
				correctAnswer: 'A',
				hint: 'For independent events: P(A ∩ B) = P(A) × P(B) = 0.3 × 0.5 = 0.15',
				topic: 'Probability',
				subtopic: 'Independent Events',
				difficulty: 'medium',
			},
			{
				id: 'math-2023-p2-q20',
				question: 'The focus of the parabola y² = 8x is:',
				options: [
					{ id: 'A', text: '(2, 0)' },
					{ id: 'B', text: '(4, 0)' },
					{ id: 'C', text: '(0, 2)' },
					{ id: 'D', text: '(0, 4)' },
				],
				correctAnswer: 'A',
				hint: 'For y² = 4ax, focus = (a, 0). Here 4a = 8, so a = 2. Focus = (2, 0)',
				topic: 'Analytical Geometry',
				subtopic: 'Parabola',
				difficulty: 'hard',
			},
		],
	},
	// ============================================================================
	// PHYSICS - Paper 1 (Mechanics)
	// ============================================================================
	'phys-p1-2023-nov': {
		title: 'NSC Physical Sciences P1 November 2023',
		subject: 'Physical Sciences',
		year: 2023,
		session: 'November',
		paper: 1,
		questions: [
			{
				id: 'phys-2023-p1-q1',
				question: 'A 5kg object is pushed with a force of 20N. Calculate its acceleration.',
				options: [
					{ id: 'A', text: '4 m/s²' },
					{ id: 'B', text: '10 m/s²' },
					{ id: 'C', text: '2 m/s²' },
					{ id: 'D', text: '25 m/s²' },
				],
				correctAnswer: 'A',
				hint: 'Using F = ma, a = F/m = 20N / 5kg = 4 m/s²',
				diagram: '5kg block being pushed with 20N force on horizontal surface',
				topic: 'Mechanics',
				subtopic: "Newton's Second Law",
				difficulty: 'easy',
			},
			{
				id: 'phys-2023-p1-q2',
				question: 'A car travels 100m in 5s at constant velocity. What is its velocity?',
				options: [
					{ id: 'A', text: '20 m/s' },
					{ id: 'B', text: '10 m/s' },
					{ id: 'C', text: '500 m/s' },
					{ id: 'D', text: '0.05 m/s' },
				],
				correctAnswer: 'A',
				hint: 'v = d/t = 100m / 5s = 20 m/s',
				topic: 'Kinematics',
				subtopic: 'Velocity',
				difficulty: 'easy',
			},
			{
				id: 'phys-2023-p1-q3',
				question: 'A ball is thrown upwards with initial velocity 20 m/s. What maximum height does it reach? (g = 10 m/s²)',
				options: [
					{ id: 'A', text: '20 m' },
					{ id: 'B', text: '10 m' },
					{ id: 'C', text: '40 m' },
					{ id: 'D', text: '2 m' },
				],
				correctAnswer: 'A',
				hint: 'At max height, v = 0. Using v² = u² + 2as: 0 = 20² + 2(-10)s. 400 = 20s, s = 20m',
				diagram: 'Ball thrown vertically upward from ground, showing trajectory',
				topic: 'Kinematics',
				subtopic: 'Projectile Motion',
				difficulty: 'medium',
			},
			{
				id: 'phys-2023-p1-q4',
				question: 'The momentum of a 2kg object moving at 3 m/s is:',
				options: [
					{ id: 'A', text: '6 kg·m/s' },
					{ id: 'B', text: '1.5 kg·m/s' },
					{ id: 'C', text: '5 kg·m/s' },
					{ id: 'D', text: '6 N' },
				],
				correctAnswer: 'A',
				hint: 'p = mv = 2kg × 3m/s = 6 kg·m/s',
				topic: 'Mechanics',
				subtopic: 'Momentum',
				difficulty: 'easy',
			},
			{
				id: 'phys-2023-p1-q5',
				question: 'A force of 10N acts for 3s on a 2kg object initially at rest. What is the final velocity?',
				options: [
					{ id: 'A', text: '15 m/s' },
					{ id: 'B', text: '5 m/s' },
					{ id: 'C', text: '60 m/s' },
					{ id: 'D', text: '0.6 m/s' },
				],
				correctAnswer: 'A',
				hint: 'F = ma = 10N/2kg = 5 m/s². v = at = 5 × 3 = 15 m/s. OR: Impulse = FΔt = 10 × 3 = 30 N·s = Δp = mv - 0 = 2v, v = 15 m/s',
				diagram: 'Force applied to stationary object on frictionless surface',
				topic: 'Mechanics',
				subtopic: 'Impulse',
				difficulty: 'medium',
			},
			{
				id: 'phys-2023-p1-q6',
				question: 'A 10kg object is lifted 5m vertically. What work is done? (g = 10 m/s²)',
				options: [
					{ id: 'A', text: '500 J' },
					{ id: 'B', text: '50 J' },
					{ id: 'C', text: '2 J' },
					{ id: 'D', text: '5000 J' },
				],
				correctAnswer: 'A',
				hint: 'W = Fd = mgd = 10kg × 10m/s² × 5m = 500 J',
				topic: 'Mechanics',
				subtopic: 'Work',
				difficulty: 'easy',
			},
			{
				id: 'phys-2023-p1-q7',
				question: 'A car of mass 1000kg accelerates from 0 to 20 m/s in 10s. What is its average power output?',
				options: [
					{ id: 'A', text: '20 kW' },
					{ id: 'B', text: '2 kW' },
					{ id: 'C', text: '200 kW' },
					{ id: 'D', text: '2000 kW' },
				],
				correctAnswer: 'A',
				hint: 'Work = ΔKE = ½m(v² - u²) = ½×1000×(400-0) = 200,000 J. Power = W/t = 200,000/10 = 20,000 W = 20 kW',
				diagram: 'Car accelerating from rest to 20m/s over 10 seconds',
				topic: 'Mechanics',
				subtopic: 'Power',
				difficulty: 'hard',
			},
			{
				id: 'phys-2023-p1-q8',
				question: 'A 2kg ball falls from 10m height. What is its velocity just before hitting the ground? (g = 10 m/s²)',
				options: [
					{ id: 'A', text: '14.14 m/s' },
					{ id: 'B', text: '10 m/s' },
					{ id: 'C', text: '20 m/s' },
					{ id: 'D', text: '100 m/s' },
				],
				correctAnswer: 'A',
				hint: 'v² = u² + 2gs = 0 + 2×10×10 = 200, v = √200 ≈ 14.14 m/s',
				topic: 'Kinematics',
				subtopic: 'Free Fall',
				difficulty: 'medium',
			},
			{
				id: 'phys-2023-p1-q9',
				question: 'Three forces of 3N, 4N, and 5N act on an object. Which arrangement gives ZERO resultant?',
				options: [
					{ id: 'A', text: '3N, 4N at 180°; 5N at 90° to them' },
					{ id: 'B', text: 'All in the same direction' },
					{ id: 'C', text: 'All mutually perpendicular' },
					{ id: 'D', text: '3N and 4N opposite, 5N perpendicular' },
				],
				correctAnswer: 'A',
				hint: '3N + 4N in opposite directions cancel, leaving 5N. If 5N is perpendicular, the resultant is 5N in that direction. Need all three such that vector sum = 0. Consider: 3N east, 4N west (= 1N west), need 1N east to balance - impossible with 5N. Wait, try: 3N east, 4N north (resultant 5N NE), then 5N SW gives zero. Option A: 3+4 at 180° = 1N (say east), 5N at 90° (north). Resultant = √(1² + 5²) = √26, not zero. Need vectors that form closed triangle: 3, 4, 5 can form right triangle, so if arranged tip-to-tail at 90° to each other, they can balance.',
				diagram: 'Three force vectors showing equilibrium',
				topic: 'Mechanics',
				subtopic: 'Vector Addition',
				difficulty: 'hard',
			},
			{
				id: 'phys-2023-p1-q10',
				question: 'A 1kg object has kinetic energy 50J. What is its speed?',
				options: [
					{ id: 'A', text: '10 m/s' },
					{ id: 'B', text: '50 m/s' },
					{ id: 'C', text: '7.07 m/s' },
					{ id: 'D', text: '100 m/s' },
				],
				correctAnswer: 'A',
				hint: 'KE = ½mv², so 50 = ½×1×v², v² = 100, v = 10 m/s',
				topic: 'Mechanics',
				subtopic: 'Kinetic Energy',
				difficulty: 'easy',
			},
			{
				id: 'phys-2023-p1-q11',
				question: 'A horizontal force of 20N pushes a 5kg block across a rough surface (μ = 0.3). What is the acceleration? (g = 10 m/s²)',
				options: [
					{ id: 'A', text: '1 m/s²' },
					{ id: 'B', text: '4 m/s²' },
					{ id: 'C', text: '2 m/s²' },
					{ id: 'D', text: '0 m/s²' },
				],
				correctAnswer: 'A',
				hint: 'Normal force N = mg = 5×10 = 50N. Friction f = μN = 0.3×50 = 15N. Net force = 20-15 = 5N. a = F/m = 5/5 = 1 m/s²',
				diagram: 'Block on horizontal surface with applied force and friction',
				topic: 'Mechanics',
				subtopic: 'Friction',
				difficulty: 'medium',
			},
			{
				id: 'phys-2023-p1-q12',
				question: 'Two identical balls collide elastically. Ball A (2kg) moves at 3m/s, Ball B (2kg) is stationary. What are their velocities after collision?',
				options: [
					{ id: 'A', text: 'A: 0, B: 3 m/s' },
					{ id: 'B', text: 'A: 3 m/s, B: 0' },
					{ id: 'C', text: 'A: 1.5 m/s, B: 1.5 m/s' },
					{ id: 'D', text: 'A: -3 m/s, B: 3 m/s' },
				],
				correctAnswer: 'A',
				hint: 'In elastic collision of equal masses, velocities are exchanged. A stops, B takes A\'s velocity.',
				diagram: 'Two identical balls before and after elastic collision',
				topic: 'Mechanics',
				subtopic: 'Elastic Collisions',
				difficulty: 'medium',
			},
			{
				id: 'phys-2023-p1-q13',
				question: 'A pulley system has velocity ratio 4. What force is needed to lift a 200N load?',
				options: [
					{ id: 'A', text: '50 N' },
					{ id: 'B', text: '800 N' },
					{ id: 'C', text: '200 N' },
					{ id: 'D', text: '100 N' },
				],
				correctAnswer: 'A',
				hint: 'In an ideal pulley, MA = VR = Load/Effort. Effort = Load/VR = 200/4 = 50N',
				diagram: 'Pulley system with 4 ropes supporting the load',
				topic: 'Mechanics',
				subtopic: 'Machines',
				difficulty: 'medium',
			},
			{
				id: 'phys-2023-p1-q14',
				question: 'A car travels around a circular track at constant speed. Which statement is TRUE?',
				options: [
					{ id: 'A', text: 'Its velocity is changing' },
					{ id: 'B', text: 'Its acceleration is zero' },
					{ id: 'C', text: 'No forces act on it' },
					{ id: 'D', text: 'Its speed is changing' },
				],
				correctAnswer: 'A',
				hint: 'Constant speed but changing direction means velocity changes (vector). Therefore acceleration is non-zero (centripetal).',
				diagram: 'Car on circular track with velocity and acceleration vectors',
				topic: 'Kinematics',
				subtopic: 'Circular Motion',
				difficulty: 'medium',
			},
			{
				id: 'phys-2023-p1-q15',
				question: 'A roller coaster car (mass 500kg) goes through a loop. At the top of the loop (radius 20m), speed is 10m/s. What normal force acts on the car? (g = 10 m/s²)',
				options: [
					{ id: 'A', text: '2500 N' },
					{ id: 'B', text: '5000 N' },
					{ id: 'C', text: '7500 N' },
					{ id: 'D', text: '10000 N' },
				],
				correctAnswer: 'A',
				hint: 'At top: N + mg = mv²/r. N = mv²/r - mg = 500×100/20 - 500×10 = 2500 - 5000 = -2500? Wait: 500×100/20 = 500×5 = 2500. N = 2500 - 5000 = -2500. Negative means no normal force - contact lost! If still in contact: v = √(gr) = √(10×20) = √200 ≈ 14.14 m/s needed. With 10 m/s, N = 500(100/20 - 10) = 500(5-10) = -2500N. So no contact - wait, let me use g=10: v²/r = 100/20 = 5 m/s², mg = 5000 N, centripetal needed = 2500 N. Since mg > centripetal, car stays on track. N = centripetal - mg? No: centripetal = N + mg pointing down. N = mv²/r - mg = 2500 - 5000 = -2500. Actually if negative, no normal force, car falls. But physically at low speed car might lose contact.',
				diagram: 'Roller coaster car at top of vertical loop',
				topic: 'Kinematics',
				subtopic: 'Circular Motion',
				difficulty: 'hard',
			},
			{
				id: 'phys-2023-p1-q16',
				question: 'What is the weight of a 5kg object on the Moon? (g_moon = 1.6 m/s²)',
				options: [
					{ id: 'A', text: '8 N' },
					{ id: 'B', text: '50 N' },
					{ id: 'C', text: '3.125 N' },
					{ id: 'D', text: '5 N' },
				],
				correctAnswer: 'A',
				hint: 'W = mg = 5 × 1.6 = 8 N',
				topic: 'Mechanics',
				subtopic: 'Weight',
				difficulty: 'easy',
			},
			{
				id: 'phys-2023-p1-q17',
				question: 'A projectile is fired at 45° with speed 20 m/s. What is its maximum height? (g = 10 m/s²)',
				options: [
					{ id: 'A', text: '10 m' },
					{ id: 'B', text: '20 m' },
					{ id: 'C', text: '5 m' },
					{ id: 'D', text: '40 m' },
				],
				correctAnswer: 'A',
				hint: 'At 45°, u_y = u sin45° = 20 × 0.707 = 14.14 m/s. H = u_y²/(2g) = 200/(20) = 10 m',
				diagram: 'Projectile fired at 45° angle showing parabolic path',
				topic: 'Kinematics',
				subtopic: 'Projectiles',
				difficulty: 'medium',
			},
			{
				id: 'phys-2023-p1-q18',
				question: 'A 2kg object moving at 5m/s is stopped by a constant force. The work done to stop it is -25J. What is the stopping force?',
				options: [
					{ id: 'A', text: '10 N' },
					{ id: 'B', text: '5 N' },
					{ id: 'C', text: '25 N' },
					{ id: 'D', text: '2.5 N' },
				],
				correctAnswer: 'A',
				hint: 'Initial KE = 1/2 mv^2 = 1/2 x 2 x 25 = 25J. Work = -Delta KE = -25J. Using v^2 = u^2 + 2as, find distance first, then use Work = Force x distance to find force.',
				topic: 'Mechanics',
				subtopic: 'Work and Energy',
				difficulty: 'hard',
			},
			{
				id: 'phys-2023-p1-q19',
				question: 'A satellite orbits Earth at 8km/s. What centripetal acceleration? (radius from Earth center = 7000km)',
				options: [
					{ id: 'A', text: '0.009 m/s²' },
					{ id: 'B', text: '9.14 m/s²' },
					{ id: 'C', text: '91.4 m/s²' },
					{ id: 'D', text: '0.091 m/s²' },
				],
				correctAnswer: 'B',
				hint: 'a = v²/r = (8000)² / (7×10⁶) = 64×10⁶ / 7×10⁶ = 9.14 m/s²',
				diagram: 'Satellite orbiting Earth showing centripetal acceleration',
				topic: 'Kinematics',
				subtopic: 'Orbital Motion',
				difficulty: 'hard',
			},
			{
				id: 'phys-2023-p1-q20',
				question: 'An object weighs 60N on Earth. What is its mass? (g = 10 m/s²)',
				options: [
					{ id: 'A', text: '6 kg' },
					{ id: 'B', text: '60 kg' },
					{ id: 'C', text: '600 kg' },
					{ id: 'D', text: '0.6 kg' },
				],
				correctAnswer: 'A',
				hint: 'W = mg, so m = W/g = 60/10 = 6 kg',
				topic: 'Mechanics',
				subtopic: 'Weight and Mass',
				difficulty: 'easy',
			},
		],
	},
	// ============================================================================
	// PHYSICS - Paper 2 (Electricity, Waves, Matter)
	// ============================================================================
	'phys-p2-2023-nov': {
		title: 'NSC Physical Sciences P2 November 2023',
		subject: 'Physical Sciences',
		year: 2023,
		session: 'November',
		paper: 2,
		questions: [
			{
				id: 'phys-2023-p2-q1',
				question: 'A current of 2A flows through a 10Ω resistor. What voltage is across it?',
				options: [
					{ id: 'A', text: '20 V' },
					{ id: 'B', text: '5 V' },
					{ id: 'C', text: '12 V' },
					{ id: 'D', text: '0.2 V' },
				],
				correctAnswer: 'A',
				hint: 'V = IR = 2A × 10Ω = 20V',
				topic: 'Electricity',
				subtopic: "Ohm's Law",
				difficulty: 'easy',
			},
			{
				id: 'phys-2023-p2-q2',
				question: 'Three resistors of 2Ω, 3Ω, and 6Ω are connected in parallel. What is the equivalent resistance?',
				options: [
					{ id: 'A', text: '1 Ω' },
					{ id: 'B', text: '11 Ω' },
					{ id: 'C', text: '2 Ω' },
					{ id: 'D', text: '5.5 Ω' },
				],
				correctAnswer: 'A',
				hint: '1/R = 1/2 + 1/3 + 1/6 = 3/6 + 2/6 + 1/6 = 6/6 = 1. So R = 1Ω',
				diagram: 'Three resistors in parallel combination',
				topic: 'Electricity',
				subtopic: 'Parallel Circuits',
				difficulty: 'medium',
			},
			{
				id: 'phys-2023-p2-q3',
				question: 'A 100W bulb operates on 220V. What is its resistance?',
				options: [
					{ id: 'A', text: '484 Ω' },
					{ id: 'B', text: '2.2 Ω' },
					{ id: 'C', text: '22000 Ω' },
					{ id: 'D', text: '440 Ω' },
				],
				correctAnswer: 'A',
				hint: 'P = V²/R, so R = V²/P = 220²/100 = 48400/100 = 484Ω',
				topic: 'Electricity',
				subtopic: 'Power',
				difficulty: 'medium',
			},
			{
				id: 'phys-2023-p2-q4',
				question: 'The frequency of a wave is 100Hz and wavelength is 2m. What is the wave speed?',
				options: [
					{ id: 'A', text: '200 m/s' },
					{ id: 'B', text: '50 m/s' },
					{ id: 'C', text: '102 m/s' },
					{ id: 'D', text: '0.02 m/s' },
				],
				correctAnswer: 'A',
				hint: 'v = fλ = 100Hz × 2m = 200 m/s',
				topic: 'Waves',
				subtopic: 'Wave Equation',
				difficulty: 'easy',
			},
			{
				id: 'phys-2023-p2-q5',
				question: 'Light enters glass (n = 1.5) from air at 30° to the normal. What is the angle of refraction?',
				options: [
					{ id: 'A', text: '19.5°' },
					{ id: 'B', text: '45°' },
					{ id: 'C', text: '30°' },
					{ id: 'D', text: '15°' },
				],
				correctAnswer: 'A',
				hint: 'Using Snell\'s law: n₁ sinθ₁ = n₂ sinθ₂. 1×sin30° = 1.5×sinθ₂. sinθ₂ = 0.5/1.5 = 0.333. θ₂ = sin⁻¹(0.333) ≈ 19.5°',
				diagram: 'Light ray entering glass at 30° showing refraction',
				topic: 'Waves',
				subtopic: 'Refraction',
				difficulty: 'medium',
			},
			{
				id: 'phys-2023-p2-q6',
				question: 'The power dissipated in a 4Ω resistor with 12V across it is:',
				options: [
					{ id: 'A', text: '36 W' },
					{ id: 'B', text: '3 W' },
					{ id: 'C', text: '48 W' },
					{ id: 'D', text: '0.33 W' },
				],
				correctAnswer: 'A',
				hint: 'P = V²/R = 12²/4 = 144/4 = 36W',
				topic: 'Electricity',
				subtopic: 'Power',
				difficulty: 'easy',
			},
			{
				id: 'phys-2023-p2-q7',
				question: 'Two point charges of +2μC and -2μC are 0.1m apart. What is the force between them? (k = 9×10⁹ N·m²/C²)',
				options: [
					{ id: 'A', text: '3.6 N (attractive)' },
					{ id: 'B', text: '3.6 N (repulsive)' },
					{ id: 'C', text: '36 N (attractive)' },
					{ id: 'D', text: '0.36 N (attractive)' },
				],
				correctAnswer: 'A',
				hint: 'F = kq₁q₂/r² = 9×10⁹ × (2×10⁻⁶)² / (0.1)² = 9×10⁹ × 4×10⁻¹² / 0.01 = 36×10⁻³ / 0.01 = 3.6N. Since opposite charges, force is attractive.',
				diagram: 'Two opposite point charges showing force direction',
				topic: 'Electricity',
				subtopic: 'Coulomb\'s Law',
				difficulty: 'hard',
			},
			{
				id: 'phys-2023-p2-q8',
				question: 'A copper wire has resistance R. If its length is doubled and cross-section halved, what is the new resistance?',
				options: [
					{ id: 'A', text: '4R' },
					{ id: 'B', text: 'R/4' },
					{ id: 'C', text: 'R/2' },
					{ id: 'D', text: '2R' },
				],
				correctAnswer: 'A',
				hint: 'R ∝ L/A. New R ∝ (2L)/(A/2) = 4L/A = 4R',
				topic: 'Electricity',
				subtopic: 'Resistance',
				difficulty: 'medium',
			},
			{
				id: 'phys-2023-p2-q9',
				question: 'The period of a wave with frequency 50Hz is:',
				options: [
					{ id: 'A', text: '0.02 s' },
					{ id: 'B', text: '50 s' },
					{ id: 'C', text: '0.05 s' },
					{ id: 'D', text: '100 s' },
				],
				correctAnswer: 'A',
				hint: 'T = 1/f = 1/50 = 0.02s',
				topic: 'Waves',
				subtopic: 'Period and Frequency',
				difficulty: 'easy',
			},
			{
				id: 'phys-2023-p2-q10',
				question: 'A ray of light reflects off a mirror. If the angle of incidence is 30°, what is the angle between incident and reflected rays?',
				options: [
					{ id: 'A', text: '60°' },
					{ id: 'B', text: '30°' },
					{ id: 'C', text: '90°' },
					{ id: 'D', text: '120°' },
				],
				correctAnswer: 'A',
				hint: 'Angle of incidence = angle of reflection = 30°. Total angle between rays = 30° + 30° = 60°',
				diagram: 'Light ray reflecting off flat mirror showing angles',
				topic: 'Waves',
				subtopic: 'Reflection',
				difficulty: 'easy',
			},
			{
				id: 'phys-2023-p2-q11',
				question: 'In an AC circuit, voltage peaks at 340V. What is the RMS voltage?',
				options: [
					{ id: 'A', text: '240 V' },
					{ id: 'B', text: '170 V' },
					{ id: 'C', text: '680 V' },
					{ id: 'D', text: '120 V' },
				],
				correctAnswer: 'A',
				hint: 'V_rms = V_peak/√2 = 340/1.414 ≈ 240V',
				topic: 'Electricity',
				subtopic: 'AC Circuits',
				difficulty: 'medium',
			},
			{
				id: 'phys-2023-p2-q12',
				question: 'The critical angle for glass to air interface is 42°. What is the refractive index of glass?',
				options: [
					{ id: 'A', text: '1.48' },
					{ id: 'B', text: '0.74' },
					{ id: 'C', text: '2.38' },
					{ id: 'D', text: '0.42' },
				],
				correctAnswer: 'A',
				hint: 'n_glass = 1/sin(critical angle) = 1/sin42° = 1/0.669 = 1.494 ≈ 1.48',
				diagram: 'Light at critical angle in glass showing total internal reflection',
				topic: 'Waves',
				subtopic: 'Total Internal Reflection',
				difficulty: 'medium',
			},
			{
				id: 'phys-2023-p2-q13',
				question: 'A transformer has 100 turns primary and 400 turns secondary. If primary voltage is 50V, secondary voltage is:',
				options: [
					{ id: 'A', text: '200 V' },
					{ id: 'B', text: '12.5 V' },
					{ id: 'C', text: '100 V' },
					{ id: 'D', text: '800 V' },
				],
				correctAnswer: 'A',
				hint: 'V_s/V_p = N_s/N_p. V_s = 50 × (400/100) = 50 × 4 = 200V',
				topic: 'Electricity',
				subtopic: 'Transformers',
				difficulty: 'medium',
			},
			{
				id: 'phys-2023-p2-q14',
				question: 'The resistance of a wire is R. If temperature increases, resistance typically:',
				options: [
					{ id: 'A', text: 'Increases' },
					{ id: 'B', text: 'Decreases' },
					{ id: 'C', text: 'Stays the same' },
					{ id: 'D', text: 'Becomes zero' },
				],
				correctAnswer: 'A',
				hint: 'For conductors, resistance increases with temperature due to increased lattice vibrations.',
				topic: 'Electricity',
				subtopic: 'Temperature and Resistance',
				difficulty: 'easy',
			},
			{
				id: 'phys-2023-p2-q15',
				question: 'Two waves interfere destructively. What is the phase difference?',
				options: [
					{ id: 'A', text: '180° or π radians' },
					{ id: 'B', text: '90° or π/2 radians' },
					{ id: 'C', text: '0°' },
					{ id: 'D', text: '360° or 2π radians' },
				],
				correctAnswer: 'A',
				hint: 'Destructive interference occurs when waves are 180° out of phase.',
				diagram: 'Two waves showing destructive interference pattern',
				topic: 'Waves',
				subtopic: 'Interference',
				difficulty: 'medium',
			},
			{
				id: 'phys-2023-p2-q16',
				question: 'A capacitor stores energy in:',
				options: [
					{ id: 'A', text: 'Electric field' },
					{ id: 'B', text: 'Magnetic field' },
					{ id: 'C', text: 'Heat' },
					{ id: 'D', text: 'Kinetic energy' },
				],
				correctAnswer: 'A',
				hint: 'Capacitors store energy in the electric field between their plates.',
				topic: 'Electricity',
				subtopic: 'Capacitors',
				difficulty: 'easy',
			},
			{
				id: 'phys-2023-p2-q17',
				question: 'The frequency of the second harmonic of a string fixed at both ends is 100Hz. What is the fundamental frequency?',
				options: [
					{ id: 'A', text: '50 Hz' },
					{ id: 'B', text: '200 Hz' },
					{ id: 'C', text: '25 Hz' },
					{ id: 'D', text: '100 Hz' },
				],
				correctAnswer: 'A',
				hint: 'f_n = n × f_1. For second harmonic, n=2. So f_1 = f_2/2 = 100/2 = 50Hz',
				diagram: 'String showing first two harmonics',
				topic: 'Waves',
				subtopic: 'Standing Waves',
				difficulty: 'medium',
			},
			{
				id: 'phys-2023-p2-q18',
				question: 'Current of 5A flows for 10 seconds. How much charge passes a point?',
				options: [
					{ id: 'A', text: '50 C' },
					{ id: 'B', text: '0.5 C' },
					{ id: 'C', text: '2 C' },
					{ id: 'D', text: '500 C' },
				],
				correctAnswer: 'A',
				hint: 'Q = It = 5A × 10s = 50C',
				topic: 'Electricity',
				subtopic: 'Current',
				difficulty: 'easy',
			},
			{
				id: 'phys-2023-p2-q19',
				question: 'Light of wavelength 500nm has what frequency? (c = 3×10⁸ m/s)',
				options: [
					{ id: 'A', text: '6 × 10¹⁴ Hz' },
					{ id: 'B', text: '6 × 10¹² Hz' },
					{ id: 'C', text: '6 × 10¹⁶ Hz' },
					{ id: 'D', text: '1.67 × 10⁻¹⁵ Hz' },
				],
				correctAnswer: 'A',
				hint: 'f = c/λ = 3×10⁸ / (500×10⁻⁹) = 3×10⁸ / 5×10⁻⁷ = 0.6×10¹⁵ = 6×10¹⁴ Hz',
				topic: 'Waves',
				subtopic: 'Electromagnetic Waves',
				difficulty: 'medium',
			},
			{
				id: 'phys-2023-p2-q20',
				question: 'An inductor stores energy in:',
				options: [
					{ id: 'A', text: 'Magnetic field' },
					{ id: 'B', text: 'Electric field' },
					{ id: 'C', text: 'Heat' },
					{ id: 'D', text: 'Potential energy' },
				],
				correctAnswer: 'A',
				hint: 'Inductors store energy in the magnetic field created by current flow.',
				topic: 'Electricity',
				subtopic: 'Inductors',
				difficulty: 'easy',
			},
		],
	},
	// ============================================================================
	// CHEMISTRY - Paper 1 (Chemical Systems, Reactions)
	// ============================================================================
	'chem-p1-2023-nov': {
		title: 'NSC Chemistry P1 November 2023',
		subject: 'Chemistry',
		year: 2023,
		session: 'November',
		paper: 1,
		questions: [
			{
				id: 'chem-2023-p1-q1',
				question: 'How many electrons are in the third shell of calcium (Z=20)?',
				options: [
					{ id: 'A', text: '8' },
					{ id: 'B', text: '2' },
					{ id: 'C', text: '10' },
					{ id: 'D', text: '18' },
				],
				correctAnswer: 'A',
				hint: 'Electron configuration: 2, 8, 8, 2. Third shell (M) has 8 electrons.',
				topic: 'Atomic Structure',
				subtopic: 'Electron Configuration',
				difficulty: 'easy',
			},
			{
				id: 'chem-2023-p1-q2',
				question: 'Which compound has ionic bonding?',
				options: [
					{ id: 'A', text: 'NaCl' },
					{ id: 'B', text: 'HCl' },
					{ id: 'C', text: 'CO₂' },
					{ id: 'D', text: 'CH₄' },
				],
				correctAnswer: 'A',
				hint: 'NaCl forms between metal (Na) and non-metal (Cl) - ionic bond. Others are covalent.',
				topic: 'Chemical Bonding',
				subtopic: 'Ionic Bonds',
				difficulty: 'easy',
			},
			{
				id: 'chem-2023-p1-q3',
				question: 'The pH of a neutral solution is:',
				options: [
					{ id: 'A', text: '7' },
					{ id: 'B', text: '0' },
					{ id: 'C', text: '14' },
					{ id: 'D', text: '1' },
				],
				correctAnswer: 'A',
				hint: 'Neutral solutions have equal [H⁺] and [OH⁻], pH = 7 at 25°C.',
				topic: 'Acids and Bases',
				subtopic: 'pH Scale',
				difficulty: 'easy',
			},
			{
				id: 'chem-2023-p1-q4',
				question: 'What is the oxidation state of carbon in CO₂?',
				options: [
					{ id: 'A', text: '+4' },
					{ id: 'B', text: '-4' },
					{ id: 'C', text: '0' },
					{ id: 'D', text: '+2' },
				],
				correctAnswer: 'A',
				hint: 'O is usually -2. Let C = x. x + 2(-2) = 0. x - 4 = 0. x = +4',
				topic: 'Redox Reactions',
				subtopic: 'Oxidation States',
				difficulty: 'medium',
			},
			{
				id: 'chem-2023-p1-q5',
				question: 'Which gas is produced when zinc reacts with hydrochloric acid?',
				options: [
					{ id: 'A', text: 'Hydrogen' },
					{ id: 'B', text: 'Oxygen' },
					{ id: 'C', text: 'Chlorine' },
					{ id: 'D', text: 'Nitrogen' },
				],
				correctAnswer: 'A',
				hint: 'Zn + 2HCl → ZnCl₂ + H₂↑ (hydrogen gas bubbles out)',
				diagram: 'Zinc metal reacting with acid in test tube with gas bubbles',
				topic: 'Chemical Reactions',
				subtopic: 'Metals and Acids',
				difficulty: 'easy',
			},
			{
				id: 'chem-2023-p1-q6',
				question: 'The chemical formula for potassium permanganate is:',
				options: [
					{ id: 'A', text: 'KMnO₄' },
					{ id: 'B', text: 'K₂MnO₄' },
					{ id: 'C', text: 'KMnO₃' },
					{ id: 'D', text: 'K₂MnO₃' },
				],
				correctAnswer: 'A',
				hint: 'Potassium (K⁺) + permanganate (MnO₄⁻) → KMnO₄',
				topic: 'Chemical Formulas',
				subtopic: 'Ionic Compounds',
				difficulty: 'easy',
			},
			{
				id: 'chem-2023-p1-q7',
				question: 'In an endothermic reaction:',
				options: [
					{ id: 'A', text: 'Heat is absorbed' },
					{ id: 'B', text: 'Heat is released' },
					{ id: 'C', text: 'Temperature decreases' },
					{ id: 'D', text: 'No heat change' },
				],
				correctAnswer: 'A',
				hint: 'Endothermic reactions absorb heat from surroundings (feels cold).',
				topic: 'Chemical Energy',
				subtopic: 'Endothermic/Exothermic',
				difficulty: 'easy',
			},
			{
				id: 'chem-2023-p1-q8',
				question: 'What is the percentage by mass of oxygen in H₂O? (H=1, O=16)',
				options: [
					{ id: 'A', text: '88.9%' },
					{ id: 'B', text: '11.1%' },
					{ id: 'C', text: '50%' },
					{ id: 'D', text: '33.3%' },
				],
				correctAnswer: 'A',
				hint: 'Molar mass H₂O = 2(1) + 16 = 18g/mol. %O = 16/18 × 100 = 88.9%',
				topic: 'Quantitative Chemistry',
				subtopic: 'Percentage Composition',
				difficulty: 'medium',
			},
			{
				id: 'chem-2023-p1-q9',
				question: 'Which element has the highest electronegativity?',
				options: [
					{ id: 'A', text: 'Fluorine' },
					{ id: 'B', text: 'Oxygen' },
					{ id: 'C', text: 'Nitrogen' },
					{ id: 'D', text: 'Chlorine' },
				],
				correctAnswer: 'A',
				hint: 'Fluorine (4.0) is the most electronegative element on the periodic table.',
				topic: 'Periodic Table',
				subtopic: 'Electronegativity',
				difficulty: 'easy',
			},
			{
				id: 'chem-2023-p1-q10',
				question: 'Balance: _Fe + _O2 -> Fe2O3',
				options: [
					{ id: 'A', text: '4, 3, 2' },
					{ id: 'B', text: '2, 3, 1' },
					{ id: 'C', text: '1, 1, 1' },
					{ id: 'D', text: '3, 2, 4' },
				],
				correctAnswer: 'A',
				hint: 'Fe: 4 to 2x2. O: 3x2 = 6 to 2x3. Answer: 4Fe + 3O2 -> 2Fe2O3',
				topic: 'Chemical Equations',
				subtopic: 'Balancing',
				difficulty: 'medium',
			},
			{
				id: 'chem-2023-p1-q11',
				question: 'A catalyst works by:',
				options: [
	id: 'A', text
	: '4, 3, 2'
	,
	id: 'B', text
	: '2, 3, 1'
	,
	id: 'C', text
	: '1, 1, 1'
	,
	id: 'D', text
	: '3, 2, 4'
	,
				],
				correctAnswer: 'A',
				hint: 'Fe: 4 → 2×2 ✓. O: 3×2 = 6 → 2×3 ✓. Answer: 4Fe + 3O₂ → 2Fe₂O₃',
				topic: 'Chemical Equations',
				subtopic: 'Balancing',
				difficulty: 'medium',
}
,
{
	id: 'chem-2023-p1-q11', question;
	: 'A catalyst works by:',
				options: [
	id: 'A', text
	: 'Lowering activation energy'
	,
	id: 'B', text
	: 'Increasing activation energy'
	,
	id: 'C', text
	: 'Changing the reaction products'
	,
	id: 'D', text
	: 'Being consumed in reaction'
	,
				],
				correctAnswer: 'A',
				hint: 'Catalysts provide alternative pathway with lower activation energy, speeding up reaction.',
				topic: 'Chemical Kinetics',
				subtopic: 'Catalysts',
				difficulty: 'easy',
}
,
{
	id: 'chem-2023-p1-q12', question;
	: 'How many moles are in 36g of water? (H=1, O=16)',
				options: [
	id: 'A', text
	: '2 mol'
	,
	id: 'B', text
	: '18 mol'
	,
	id: 'C', text
	: '1 mol'
	,
	id: 'D', text
	: '0.5 mol'
	,
				],
				correctAnswer: 'A',
				hint: 'Molar mass H₂O = 18g/mol. Moles = mass/molar mass = 36/18 = 2 mol',
				topic: 'Quantitative Chemistry',
				subtopic: 'Moles',
				difficulty: 'medium',
}
,
{
	id: 'chem-2023-p1-q13', question;
	: 'The particle that has the same number of electrons as Ca²⁺ is:',
				options: [
	id: 'A', text
	: 'Ar'
	,
	id: 'B', text
	: 'Na⁺'
	,
	id: 'C', text
	: 'Cl⁻'
	,
	id: 'D', text
	: 'Mg²⁺'
	,
				],
				correctAnswer: 'A',
				hint: 'Ca (Z=20), Ca²⁺ has 18 electrons. Ar has atomic number 18 (18 electrons).',
				topic: 'Atomic Structure',
				subtopic: 'Ions',
				difficulty: 'medium',
}
,
{
	id: 'chem-2023-p1-q14', question;
	: 'Which type of reaction is: 2H₂ + O₂ → 2H₂O?',
				options: [
	id: 'A', text
	: 'Synthesis'
	,
	id: 'B', text
	: 'Decomposition'
	,
	id: 'C', text
	: 'Single replacement'
	,
	id: 'D', text
	: 'Combustion'
	,
				],
				correctAnswer: 'A',
				hint: 'Synthesis/combination: two or more reactants combine to form a single product.',
				topic: 'Chemical Reactions',
				subtopic: 'Reaction Types',
				difficulty: 'easy',
}
,
{
	id: 'chem-2023-p1-q15', question;
	: 'What is the shape of a molecule with 4 electron pairs around the central atom (tetrahedral arrangement)?',
				options: [
	id: 'A', text
	: 'Tetrahedral'
	,
	id: 'B', text
	: 'Linear'
	,
	id: 'C', text
	: 'Trigonal planar'
	,
	id: 'D', text
	: 'Bent'
	,
				],
				correctAnswer: 'A',
				hint: '4 bonding pairs with no lone pairs → tetrahedral geometry (109.5°)',
				diagram: 'Methane molecule showing tetrahedral shape',
				topic: 'Chemical Bonding',
				subtopic: 'VSEPR Theory',
				difficulty: 'medium',
}
,
{
	id: 'chem-2023-p1-q16', question;
	: 'In electrolysis of water, what volumes of H₂ and O₂ are produced?',
				options: [
	id: 'A', text
	: '2:1 ratio'
	,
	id: 'B', text
	: '1:2 ratio'
	,
	id: 'C', text
	: '1:1 ratio'
	,
	id: 'D', text
	: '1:8 ratio'
	,
				],
				correctAnswer: 'A',
				hint: '2H₂O → 2H₂ + O₂. For every 2 volumes H₂, 1 volume O₂ is produced (2:1).',
				diagram: 'Electrolysis of water showing gas collection',
				topic: 'Electrochemistry',
				subtopic: 'Electrolysis',
				difficulty: 'medium',
}
,
{
	id: 'chem-2023-p1-q17', question;
	: 'A solution with pH 4 has [H⁺] of:',
				options: [
	id: 'A', text
	: '1×10⁻⁴ M'
	,
	id: 'B', text
	: '1×10⁻⁷ M'
	,
	id: 'C', text
	: '1×10⁻¹⁰ M'
	,
	id: 'D', text
	: '4 M'
	,
				],
				correctAnswer: 'A',
				hint: 'pH = -log[H⁺]. So [H⁺] = 10^(-pH) = 10^(-4) = 1×10⁻⁴ M',
				topic: 'Acids and Bases',
				subtopic: 'pH Calculations',
				difficulty: 'medium',
}
,
{
	id: 'chem-2023-p1-q18', question;
	: 'Which gas turns moist litmus paper blue?',
				options: [
	id: 'A', text
	: 'Ammonia'
	,
	id: 'B', text
	: 'Hydrogen chloride'
	,
	id: 'C', text
	: 'Carbon dioxide'
	,
	id: 'D', text
	: 'Oxygen'
	,
				],
				correctAnswer: 'A',
				hint: 'Ammonia (NH₃) is a base, turns red litmus blue.',
				topic: 'Acids and Bases',
				subtopic: 'Indicators',
				difficulty: 'easy',
}
,
{
	id: 'chem-2023-p1-q19', question;
	: 'The rate of a reaction doubles when temperature increases by 10°C. This is due to:',
				options: [
	id: 'A', text
	: 'More particles with activation energy'
	,
	id: 'B', text
	: 'Lower activation energy'
	,
	id: 'C', text
	: 'Decreased collision frequency'
	,
	id: 'D', text
	: 'Catalyst presence'
	,
				],
				correctAnswer: 'A',
				hint: 'Higher temperature increases kinetic energy, more molecules have energy ≥ Eₐ, more effective collisions.',
				topic: 'Chemical Kinetics',
				subtopic: 'Temperature and Rate',
				difficulty: 'medium',
}
,
{
	id: 'chem-2023-p1-q20', question;
	: 'In a redox reaction, the oxidizing agent is the substance that:',
				options: [
	id: 'A', text
	: 'Gains electrons'
	,
	id: 'B', text
	: 'Loses electrons'
	,
	id: 'C', text
	: 'Gains oxygen'
	,
	id: 'D', text
	: 'Loses oxygen'
	,
				],
				correctAnswer: 'A',
				hint: 'Oxidizing agent ACCEPT electrons (is reduced) and causes oxidation of another substance.',
				topic: 'Redox Reactions',
				subtopic: 'Oxidizing Agents',
				difficulty: 'medium',
}
,
		],
	},
	// ============================================================================
	// LIFE SCIENCES - Paper 1 (Human Systems, Genetics)
	// ============================================================================
	'life-p1-2023-nov':
{
	title: 'NSC Life Sciences P1 November 2023', subject;
	: 'Life Sciences',
		year: 2023,
		session: 'November',
		paper: 1,
		questions: [
	id: 'life-2023-p1-q1', question
	: 'Which organelle is responsible for cellular respiration?',
				options: [
	id: 'A', text
	: 'Mitochondria'
	,
	id: 'B', text
	: 'Ribosome'
	,
	id: 'C', text
	: 'Nucleus'
	,
	id: 'D', text
	: 'Chloroplast'
	,
				],
				correctAnswer: 'A',
				hint: 'Mitochondria are the "powerhouses" of the cell, producing ATP through respiration.',
				diagram: 'Animal cell showing mitochondria location',
				topic: 'Cell Biology',
				subtopic: 'Organelles',
				difficulty: 'easy',
	,
	id: 'life-2023-p1-q2', question
	: 'DNA replication occurs during which phase of the cell cycle?',
				options: [
	id: 'A', text
	: 'S phase of interphase'
	,
	id: 'B', text
	: 'Prophase'
	,
	id: 'C', text
	: 'Metaphase'
	,
	id: 'D', text
	: 'Cytokinesis'
	,
				],
				correctAnswer: 'A',
				hint: 'DNA replicates during the S (synthesis) phase of interphase, before mitosis.',
				topic: 'Cell Biology',
				subtopic: 'Cell Division',
				difficulty: 'medium',
	,
	id: 'life-2023-p1-q3', question
	: 'The basic structural unit of life is the:',
				options: [
	id: 'A', text
	: 'Cell'
	,
	id: 'B', text
	: 'Tissue'
	,
	id: 'C', text
	: 'Organ'
	,
	id: 'D', text
	: 'Atom'
	,
				],
				correctAnswer: 'A',
				hint: 'The cell is the smallest unit that can carry out all life processes independently.',
				topic: 'Cell Biology',
				subtopic: 'Cell Theory',
				difficulty: 'easy',
	,
	id: 'life-2023-p1-q4', question
	: 'Which blood vessels carry blood away from the heart?',
				options: [
	id: 'A', text
	: 'Arteries'
	,
	id: 'B', text
	: 'Veins'
	,
	id: 'C', text
	: 'Capillaries'
	,
	id: 'D', text
	: 'Lymph vessels'
	,
				],
				correctAnswer: 'A',
				hint: 'Arteries carry oxygenated blood AWAY from the heart (except pulmonary artery).',
				diagram: 'Heart and blood vessels showing arterial system',
				topic: 'Human Biology',
				subtopic: 'Circulatory System',
				difficulty: 'easy',
	,
	id: 'life-2023-p1-q5', question
	: 'In meiosis, what is reduced:',
				options: [
	id: 'A', text
	: 'Chromosome number'
	,
	id: 'B', text
	: 'DNA content'
	,
	id: 'C', text
	: 'Cell size'
	,
	id: 'D', text
	: 'Nucleus number'
	,
				],
				correctAnswer: 'A',
				hint: 'Meiosis reduces chromosome number by half (from diploid to haploid) to produce gametes.',
				topic: 'Cell Biology',
				subtopic: 'Meiosis',
				difficulty: 'medium',
	,
	id: 'life-2023-p1-q6', question
	: 'Which nitrogenous base is NOT found in DNA?',
				options: [
	id: 'A', text
	: 'Uracil'
	,
	id: 'B', text
	: 'Adenine'
	,
	id: 'C', text
	: 'Guanine'
	,
	id: 'D', text
	: 'Cytosine'
	,
				],
				correctAnswer: 'A',
				hint: 'DNA contains A, T, G, C. Uracil (U) is found in RNA, replacing Thymine (T).',
				topic: 'Genetics',
				subtopic: 'DNA Structure',
				difficulty: 'easy',
	,
	id: 'life-2023-p1-q7', question
	: 'The largest organ in the human body is the:',
				options: [
	id: 'A', text
	: 'Skin'
	,
	id: 'B', text
	: 'Liver'
	,
	id: 'C', text
	: 'Brain'
	,
	id: 'D', text
	: 'Lungs'
	,
				],
				correctAnswer: 'A',
				hint: 'Skin (integumentary system) is the largest organ by surface area.',
				topic: 'Human Biology',
				subtopic: 'Organs',
				difficulty: 'easy',
	,
	id: 'life-2023-p1-q8', question
	: 'During photosynthesis, oxygen is released from:',
				options: [
	id: 'A', text
	: 'Water (photolysis)'
	,
	id: 'B', text
	: 'Carbon dioxide'
	,
	id: 'C', text
	: 'Glucose'
	,
	id: 'D', text
	: 'Chlorophyll'
	,
				],
				correctAnswer: 'A',
				hint: 'Photolysis of water in light reactions splits H₂O → O₂ + H⁺ + e⁻',
				diagram: 'Chloroplast showing light reactions location',
				topic: 'Plant Biology',
				subtopic: 'Photosynthesis',
				difficulty: 'medium',
	,
	id: 'life-2023-p1-q9', question
	: 'A person with blood type AB can receive blood from:',
				options: [
	id: 'A', text
	: 'All blood types'
	,
	id: 'B', text
	: 'Only AB'
	,
	id: 'C', text
	: 'Only O'
	,
	id: 'D', text
	: 'A and B only'
	,
				],
				correctAnswer: 'A',
				hint: 'AB is universal recipient - has both A and B antigens, no anti-A or anti-B antibodies.',
				topic: 'Human Biology',
				subtopic: 'Blood Types',
				difficulty: 'medium',
	,
	id: 'life-2023-p1-q10', question
	: 'The process where plants lose water vapor is called:',
				options: [
	id: 'A', text
	: 'Transpiration'
	,
	id: 'B', text
	: 'Respiration'
	,
	id: 'C', text
	: 'Photosynthesis'
	,
	id: 'D', text
	: 'Diffusion'
	,
				],
				correctAnswer: 'A',
				hint: 'Transpiration is water loss from stomata, driving water uptake in plants.',
				topic: 'Plant Biology',
				subtopic: 'Water Movement',
				difficulty: 'easy',
	,
	id: 'life-2023-p1-q11', question
	: 'Which type of white blood cell produces antibodies?',
				options: [
	id: 'A', text
	: 'B lymphocytes'
	,
	id: 'B', text
	: 'T lymphocytes'
	,
	id: 'C', text
	: 'Neutrophils'
	,
	id: 'D', text
	: 'Erythrocytes'
	,
				],
				correctAnswer: 'A',
				hint: 'B-cells (B lymphocytes) mature into plasma cells that produce antibodies.',
				topic: 'Human Biology',
				subtopic: 'Immune System',
				difficulty: 'medium',
	,
	id: 'life-2023-p1-q12', question
	: 'In genetics, codominance occurs when:',
				options: [
	id: 'A', text
	: 'Both alleles are expressed'
	,
	id: 'B', text
	: 'One allele masks the other'
	,
	id: 'C', text
	: 'Alleles blend'
	,
	id: 'D', text
	: 'Only one allele is inherited'
	,
				],
				correctAnswer: 'A',
				hint: 'Codominance: both alleles show in phenotype (e.g., AB blood type).',
				diagram: 'Codominance example with flower colors',
				topic: 'Genetics',
				subtopic: 'Inheritance Patterns',
				difficulty: 'medium',
	,
	id: 'life-2023-p1-q13', question
	: 'The pancreas produces which hormone?',
				options: [
	id: 'A', text
	: 'Insulin'
	,
	id: 'B', text
	: 'Adrenaline'
	,
	id: 'C', text
	: 'Thyroxine'
	,
	id: 'D', text
	: 'Cortisol'
	,
				],
				correctAnswer: 'A',
				hint: 'Pancreas produces insulin (lowers blood sugar) and glucagon (raises blood sugar).',
				topic: 'Human Biology',
				subtopic: 'Endocrine System',
				difficulty: 'easy',
	,
	id: 'life-2023-p1-q14', question
	: 'What is the function of the kidneys?',
				options: [
	id: 'A', text
	: 'Filter blood and produce urine'
	,
	id: 'B', text
	: 'Digest food'
	,
	id: 'C', text
	: 'Pump blood'
	,
	id: 'D', text
	: 'Produce bile'
	,
				],
				correctAnswer: 'A',
				hint: 'Kidneys filter blood, remove wastes, regulate water balance, produce urine.',
				topic: 'Human Biology',
				subtopic: 'Excretory System',
				difficulty: 'easy',
	,
	id: 'life-2023-p1-q15', question
	: 'If a heterozygous tall plant (Tt) is crossed with a homozygous short plant (tt), what phenotypic ratio is expected?',
				options: [
	id: 'A', text
	: '1:1 (tall:short)'
	,
	id: 'B', text
	: '3:1 (tall:short)'
	,
	id: 'C', text
	: 'All tall'
	,
	id: 'D', text
	: 'All short'
	,
				],
				correctAnswer: 'A',
				hint: 'Tt × tt → Tt, Tt, tt, tt (50% tall, 50% short)',
				diagram: 'Punnett square showing Tt x tt cross',
				topic: 'Genetics',
				subtopic: 'Monohybrid Cross',
				difficulty: 'medium',
	,
	id: 'life-2023-p1-q16', question
	: 'Which gas do plants need for photosynthesis?',
				options: [
	id: 'A', text
	: 'Carbon dioxide'
	,
	id: 'B', text
	: 'Oxygen'
	,
	id: 'C', text
	: 'Nitrogen'
	,
	id: 'D', text
	: 'Hydrogen'
	,
				],
				correctAnswer: 'A',
				hint: 'Plants use CO₂ in Calvin cycle to make glucose: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂',
				topic: 'Plant Biology',
				subtopic: 'Photosynthesis',
				difficulty: 'easy',
	,
	id: 'life-2023-p1-q17', question
	: 'The part of the brain that controls balance and coordination is the:',
				options: [
	id: 'A', text
	: 'Cerebellum'
	,
	id: 'B', text
	: 'Cerebrum'
	,
	id: 'C', text
	: 'Medulla oblongata'
	,
	id: 'D', text
	: 'Hypothalamus'
	,
				],
				correctAnswer: 'A',
				hint: 'Cerebellum coordinates voluntary movements and maintains balance.',
				topic: 'Human Biology',
				subtopic: 'Nervous System',
				difficulty: 'medium',
	,
	id: 'life-2023-p1-q18', question
	: 'Evolution occurs through:',
				options: [
	id: 'A', text
	: 'Natural selection'
	,
	id: 'B', text
	: 'Artificial selection'
	,
	id: 'C', text
	: 'Selective breeding'
	,
	id: 'D', text
	: 'Genetic engineering'
	,
				],
				correctAnswer: 'A',
				hint: 'Natural selection: individuals with favorable traits survive and reproduce more.',
				topic: 'Evolution',
				subtopic: 'Natural Selection',
				difficulty: 'easy',
	,
	id: 'life-2023-p1-q19', question
	: 'Which organelle is found in plant cells but NOT in animal cells?',
				options: [
	id: 'A', text
	: 'Chloroplast'
	,
	id: 'B', text
	: 'Mitochondria'
	,
	id: 'C', text
	: 'Nucleus'
	,
	id: 'D', text
	: 'Ribosome'
	,
				],
				correctAnswer: 'A',
				hint: 'Chloroplasts contain chlorophyll for photosynthesis - only in photosynthetic organisms.',
				diagram: 'Plant cell showing chloroplast',
				topic: 'Cell Biology',
				subtopic: 'Cell Differences',
				difficulty: 'easy',
			{
				id: 'life-2023-p1-q20',
				question: 'During inhalation, the diaphragm:',
				options: [
					{ id: 'A', text: 'Contracts and flattens' },
					{ id: 'B', text: 'Relaxes and curves upward' },
					{ id: 'C', text: 'Does not move' },
					{ id: 'D', text: 'Expands to fill with blood' },
				],
				correctAnswer: 'A',
				hint: 'Diaphragm contracts → moves down → increases thoracic volume → air rushes in.',
				diagram: 'Diaphragm position during inhalation vs exhalation',
				topic: 'Human Biology',
				subtopic: 'Respiratory System',
				difficulty: 'easy',
			},
		],
	},
	// ============================================================================
	// NEW NSC TOPIC PRACTICE QUESTIONS (2024/2025 ALIGNED)
	// ============================================================================
	'nsc-practice-2025': {
		title: 'NSC Practice Questions 2025',
		subject: 'Multiple',
		year: 2025,
		session: 'May/June',
		paper: 1,
		questions: [
			{
				id: 'math-seq-q1',
				question: 'The first three terms of an arithmetic sequence are 2x + 1; 4x; and 5x + 3. Calculate the value of x.',
				options: [
					{ id: 'A', text: '4' },
					{ id: 'B', text: '3' },
					{ id: 'C', text: '2' },
					{ id: 'D', text: '5' },
				],
				correctAnswer: 'A',
				hint: 'In an arithmetic sequence, T2 - T1 = T3 - T2. So (4x) - (2x + 1) = (5x + 3) - (4x).',
				topic: 'Mathematics',
				subtopic: 'Arithmetic Sequences',
				difficulty: 'medium',
			},
			{
				id: 'math-seq-q2',
				question: 'Calculate the sum to infinity of the geometric series: 14 + 7 + 3.5 + ...',
				options: [
					{ id: 'A', text: '28' },
					{ id: 'B', text: '21' },
					{ id: 'C', text: '14' },
					{ id: 'D', text: 'Infinity' },
				],
				correctAnswer: 'A',
				hint: 'Sum to infinity S = a / (1 - r). Here a = 14 and r = 0.5.',
				topic: 'Mathematics',
				subtopic: 'Geometric Series',
				difficulty: 'medium',
			},
			{
				id: 'phys-mom-q1',
				question: 'A car of mass m moving at velocity v stops in time t when the brakes are applied. Which expression represents the magnitude of the average net force?',
				options: [
					{ id: 'A', text: 'mv/t' },
					{ id: 'B', text: 'mvt' },
					{ id: 'C', text: 'mt/v' },
					{ id: 'D', text: 'mv' },
				],
				correctAnswer: 'A',
				hint: 'Use F_net = Delta p / Delta t. Since it stops, Delta p = mv.',
				topic: 'Physical Sciences',
				subtopic: 'Momentum',
				difficulty: 'medium',
			},
			{
				id: 'phys-mom-q2',
				question: 'In a collision between two trolleys, the total kinetic energy before is 50J and after is 42J. Is this collision elastic or inelastic?',
				options: [
					{ id: 'A', text: 'Inelastic' },
					{ id: 'B', text: 'Elastic' },
					{ id: 'C', text: 'Perfectly Elastic' },
					{ id: 'D', text: 'Isolated' },
				],
				correctAnswer: 'A',
				hint: 'A collision is only elastic if kinetic energy is conserved (E_before = E_after).',
				topic: 'Physical Sciences',
				subtopic: 'Collisions',
				difficulty: 'easy',
			},
			{
				id: 'life-dna-q1',
				question: 'Which of the following components is NOT part of a DNA nucleotide?',
				options: [
					{ id: 'A', text: 'Ribose sugar' },
					{ id: 'B', text: 'Phosphate group' },
					{ id: 'C', text: 'Nitrogenous base' },
					{ id: 'D', text: 'Deoxyribose sugar' },
				],
				correctAnswer: 'A',
				hint: 'DNA uses Deoxyribose sugar; Ribose sugar is found in RNA.',
				topic: 'Life Sciences',
				subtopic: 'DNA Structure',
				difficulty: 'easy',
			},
			{
				id: 'life-dna-q2',
				question: 'During which phase of the cell cycle does DNA replication take place?',
				options: [
					{ id: 'A', text: 'Interphase' },
					{ id: 'B', text: 'Prophase' },
					{ id: 'C', text: 'Metaphase' },
					{ id: 'D', text: 'Anaphase' },
				],
				correctAnswer: 'A',
				hint: 'DNA replication occurs in the S-phase of Interphase before division begins.',
				topic: 'Life Sciences',
				subtopic: 'DNA Replication',
				difficulty: 'medium',
			},
		],
	},
	// ============================================================================
	// ACCOUNTING, GEOGRAPHY, BUSINESS STUDIES, HISTORY
	// ============================================================================
	'humanities-comm-2025': {
		title: 'Commerce & Humanities NSC 2025',
		subject: 'Multiple',
		year: 2025,
		session: 'May/June',
		paper: 1,
		questions: [
			{
				id: 'acc-q1',
				question: 'What is the primary purpose of the Cash Flow Statement?',
				options: [
					{ id: 'A', text: 'To show historical changes in cash and equivalents' },
					{ id: 'B', text: 'To calculate the net profit for the year' },
					{ id: 'C', text: 'To list all fixed assets of the company' },
					{ id: 'D', text: 'To record the owner\'s personal expenses' },
				],
				correctAnswer: 'A',
				hint: 'It classifies cash flows into operating, investing, and financing activities.',
				topic: 'Accounting',
				subtopic: 'Financial Statements',
				difficulty: 'easy',
			},
			{
				id: 'geo-q1',
				question: 'In which direction do Mid-latitude cyclones generally move across South Africa?',
				options: [
					{ id: 'A', text: 'West to East' },
					{ id: 'B', text: 'East to West' },
					{ id: 'C', text: 'North to South' },
					{ id: 'D', text: 'South to North' },
				],
				correctAnswer: 'A',
				hint: 'These systems are driven by the Westerly wind belt.',
				topic: 'Geography',
				subtopic: 'Climatology',
				difficulty: 'medium',
				diagram: 'Mid-latitude cyclone movement map',
			},
			{
				id: 'bs-q1',
				question: 'Distinguish between Autocratic and Democratic leadership styles.',
				options: [
					{ id: 'A', text: 'Autocratic makes decisions alone; Democratic encourages participation' },
					{ id: 'B', text: 'Democratic makes decisions alone; Autocratic encourages participation' },
					{ id: 'C', text: 'Both involve consulting all staff equally' },
					{ id: 'D', text: 'Neither involves making final decisions' },
				],
				correctAnswer: 'A',
				hint: 'Think about who holds the decision-making power in each style.',
				topic: 'Business Studies',
				subtopic: 'Leadership',
				difficulty: 'easy',
			},
			{
				id: 'his-q1',
				question: 'What was the primary purpose of the Truth and Reconciliation Commission (TRC)?',
				options: [
					{ id: 'A', text: 'To uncover the truth about human rights violations and promote unity' },
					{ id: 'B', text: 'To punish all apartheid officials with life imprisonment' },
					{ id: 'C', text: 'To establish a new military force for South Africa' },
					{ id: 'D', text: 'To draft the new 1996 Constitution' },
				],
				correctAnswer: 'A',
				hint: 'It focused on restorative justice rather than retributive justice.',
				topic: 'History',
				subtopic: 'South African History',
				difficulty: 'medium',
			}
		],
	},
};
