export const mathematicsQuestions = [
	// Grade 10 - Algebra
	{
		questionText: 'Solve for x: 2x + 5 = 15',
		gradeLevel: 10,
		topic: 'Algebra',
		difficulty: 'easy',
		marks: 2,
		options: [
			{
				letter: 'A',
				text: 'x = 5',
				isCorrect: true,
				explanation: 'Subtract 5 from both sides: 2x = 10, then divide by 2: x = 5',
			},
			{
				letter: 'B',
				text: 'x = 10',
				isCorrect: false,
				explanation: 'Incorrect: 2(10) + 5 = 25, not 15',
			},
			{
				letter: 'C',
				text: 'x = 7.5',
				isCorrect: false,
				explanation: 'Incorrect: 2(7.5) + 5 = 20, not 15',
			},
			{
				letter: 'D',
				text: 'x = 4',
				isCorrect: false,
				explanation: 'Incorrect: 2(4) + 5 = 13, not 15',
			},
		],
	},
	{
		questionText: 'Factorise: x² - 9',
		gradeLevel: 10,
		topic: 'Algebra',
		difficulty: 'easy',
		marks: 2,
		options: [
			{
				letter: 'A',
				text: '(x - 3)(x + 3)',
				isCorrect: true,
				explanation: 'Difference of squares: a² - b² = (a-b)(a+b)',
			},
			{
				letter: 'B',
				text: '(x - 3)²',
				isCorrect: false,
				explanation: '(x-3)² = x² - 6x + 9, not x² - 9',
			},
			{
				letter: 'C',
				text: '(x + 3)²',
				isCorrect: false,
				explanation: '(x+3)² = x² + 6x + 9, not x² - 9',
			},
			{
				letter: 'D',
				text: '(x - 9)(x + 1)',
				isCorrect: false,
				explanation: '(x-9)(x+1) = x² - 8x - 9, not x² - 9',
			},
		],
	},
	// Grade 11 - Trigonometry
	{
		questionText: 'If sin θ = 3/5 and θ is in the first quadrant, what is cos θ?',
		gradeLevel: 11,
		topic: 'Trigonometry',
		difficulty: 'medium',
		marks: 2,
		options: [
			{
				letter: 'A',
				text: '4/5',
				isCorrect: true,
				explanation:
					'Using sin²θ + cos²θ = 1: cos²θ = 1 - (3/5)² = 1 - 9/25 = 16/25, so cosθ = 4/5',
			},
			{
				letter: 'B',
				text: '3/4',
				isCorrect: false,
				explanation: 'Incorrect: cosθ is not the ratio of adjacent/hypotenuse here',
			},
			{
				letter: 'C',
				text: '5/3',
				isCorrect: false,
				explanation: 'Cosine cannot be greater than 1',
			},
			{
				letter: 'D',
				text: '5/4',
				isCorrect: false,
				explanation: 'Cosine cannot be greater than 1',
			},
		],
	},
	{
		questionText: 'Simplify: sin²θ × cos²θ',
		gradeLevel: 11,
		topic: 'Trigonometry',
		difficulty: 'medium',
		marks: 2,
		options: [
			{
				letter: 'A',
				text: '1/4 × sin²(2θ)',
				isCorrect: true,
				explanation: 'Using sin(2θ) = 2sinθcosθ, so sin²θcos²θ = (1/4)(2sinθcosθ)² = (1/4)sin²(2θ)',
			},
			{
				letter: 'B',
				text: 'sin(2θ)',
				isCorrect: false,
				explanation: 'Incorrect identity application',
			},
			{
				letter: 'C',
				text: 'sin²θ + cos²θ',
				isCorrect: false,
				explanation: 'That equals 1, not sin²θ × cos²θ',
			},
			{
				letter: 'D',
				text: '1',
				isCorrect: false,
				explanation: 'sin²θ × cos²θ ≠ 1 (that would be sin²θ + cos²θ)',
			},
		],
	},
	// Grade 12 - Calculus
	{
		questionText: 'Find the derivative of f(x) = x³ + 2x² - 5x + 3',
		gradeLevel: 12,
		topic: 'Calculus',
		difficulty: 'easy',
		marks: 2,
		options: [
			{
				letter: 'A',
				text: "f'(x) = 3x² + 4x - 5",
				isCorrect: true,
				explanation: 'Using power rule: d/dx(xⁿ) = nxⁿ⁻¹',
			},
			{
				letter: 'B',
				text: "f'(x) = 3x³ + 4x² - 5",
				isCorrect: false,
				explanation: 'Incorrect: derivative of x³ is 3x², not 3x³',
			},
			{
				letter: 'C',
				text: "f'(x) = x² + 2x - 5",
				isCorrect: false,
				explanation: 'Incorrect: derivative of x³ is 3x², not x²',
			},
			{
				letter: 'D',
				text: "f'(x) = 3x² + 2x - 5",
				isCorrect: false,
				explanation: 'Incorrect: derivative of 2x² is 4x, not 2x',
			},
		],
	},
	{
		questionText: 'Find ∫(2x + 1)dx',
		gradeLevel: 12,
		topic: 'Calculus',
		difficulty: 'easy',
		marks: 2,
		options: [
			{
				letter: 'A',
				text: 'x² + x + C',
				isCorrect: true,
				explanation: '∫2x dx = x² + C₁, ∫1 dx = x + C₂, so x² + x + C',
			},
			{
				letter: 'B',
				text: '2x² + x + C',
				isCorrect: false,
				explanation: 'Incorrect: ∫2x dx = x², not 2x²',
			},
			{
				letter: 'C',
				text: 'x² + C',
				isCorrect: false,
				explanation: 'Missing the integral of the constant term (1)',
			},
			{
				letter: 'D',
				text: '2x + C',
				isCorrect: false,
				explanation: 'That would be the derivative, not the integral',
			},
		],
	},
	{
		questionText: 'If f(x) = x², what is the average rate of change from x = 1 to x = 3?',
		gradeLevel: 11,
		topic: 'Calculus',
		difficulty: 'easy',
		marks: 2,
		options: [
			{
				letter: 'A',
				text: '4',
				isCorrect: true,
				explanation: 'Average rate = [f(3) - f(1)]/(3-1) = (9-1)/2 = 8/2 = 4',
			},
			{
				letter: 'B',
				text: '8',
				isCorrect: false,
				explanation: 'Incorrect: f(3)-f(1) = 8, divided by 2 gives 4',
			},
			{
				letter: 'C',
				text: '2',
				isCorrect: false,
				explanation: 'Incorrect: this is the difference in x values, not the rate of change',
			},
			{
				letter: 'D',
				text: '9',
				isCorrect: false,
				explanation: 'Incorrect: f(3) = 9, but we need the average rate of change',
			},
		],
	},
	// Grade 10 - Geometry
	{
		questionText:
			'In a right-angled triangle, if the two legs are 3cm and 4cm, what is the hypotenuse?',
		gradeLevel: 10,
		topic: 'Geometry',
		difficulty: 'easy',
		marks: 2,
		options: [
			{
				letter: 'A',
				text: '5 cm',
				isCorrect: true,
				explanation: 'Using Pythagorean theorem: 3² + 4² = 9 + 16 = 25, √25 = 5',
			},
			{
				letter: 'B',
				text: '7 cm',
				isCorrect: false,
				explanation: 'Incorrect: 3 + 4 = 7, but that is not how Pythagorean theorem works',
			},
			{
				letter: 'C',
				text: '6 cm',
				isCorrect: false,
				explanation: 'Incorrect: average of 3 and 4 is 3.5, not 6',
			},
			{
				letter: 'D',
				text: '25 cm',
				isCorrect: false,
				explanation: 'Incorrect: 25 is the sum of squares, we need the square root',
			},
		],
	},
	{
		questionText: 'The interior angle sum of a hexagon is:',
		gradeLevel: 10,
		topic: 'Geometry',
		difficulty: 'medium',
		marks: 2,
		options: [
			{
				letter: 'A',
				text: '720°',
				isCorrect: true,
				explanation: 'Sum = (n-2) × 180° = (6-2) × 180° = 4 × 180° = 720°',
			},
			{
				letter: 'B',
				text: '1080°',
				isCorrect: false,
				explanation: 'Incorrect: (6-2) × 180° = 720°, not 1080°',
			},
			{
				letter: 'C',
				text: '540°',
				isCorrect: false,
				explanation: 'Incorrect: 540° is the sum for a pentagon (5-2) × 180°',
			},
			{
				letter: 'D',
				text: '360°',
				isCorrect: false,
				explanation: 'Incorrect: 360° is for quadrilaterals or exterior angles',
			},
		],
	},
	// Grade 11 - Functions
	{
		questionText: 'What is the domain of f(x) = 1/(x-2)?',
		gradeLevel: 11,
		topic: 'Functions',
		difficulty: 'easy',
		marks: 2,
		options: [
			{
				letter: 'A',
				text: 'All real numbers except x = 2',
				isCorrect: true,
				explanation: 'Division by zero is undefined, so x cannot equal 2',
			},
			{
				letter: 'B',
				text: 'All real numbers',
				isCorrect: false,
				explanation: 'x = 2 makes the function undefined',
			},
			{
				letter: 'C',
				text: 'x > 2',
				isCorrect: false,
				explanation: 'The function is defined for all x except 2',
			},
			{
				letter: 'D',
				text: 'x < 2',
				isCorrect: false,
				explanation: 'The function is defined for all x except 2',
			},
		],
	},
	{
		questionText: 'If f(x) = 2x + 1 and g(x) = x², what is f(g(3))?',
		gradeLevel: 11,
		topic: 'Functions',
		difficulty: 'medium',
		marks: 2,
		options: [
			{
				letter: 'A',
				text: '19',
				isCorrect: true,
				explanation: 'g(3) = 3² = 9, then f(9) = 2(9) + 1 = 19',
			},
			{
				letter: 'B',
				text: '7',
				isCorrect: false,
				explanation: 'Incorrect: you need to first find g(3), not f(3)',
			},
			{
				letter: 'C',
				text: '18',
				isCorrect: false,
				explanation: 'Incorrect: f(g(x)) = 2(x²) + 1, so f(g(3)) = 2(9) + 1 = 19',
			},
			{
				letter: 'D',
				text: '13',
				isCorrect: false,
				explanation: 'Incorrect: 2(3) + 1 = 7 would be g(f(3)), not f(g(3))',
			},
		],
	},
	// Grade 12 - Calculus Applications
	{
		questionText: 'Find the stationary point of f(x) = x² - 4x + 3',
		gradeLevel: 12,
		topic: 'Calculus',
		difficulty: 'medium',
		marks: 3,
		options: [
			{
				letter: 'A',
				text: 'x = 2, minimum point',
				isCorrect: true,
				explanation: "f'(x) = 2x - 4 = 0 gives x = 2. Since f''(x) = 2 > 0, it is a minimum",
			},
			{
				letter: 'B',
				text: 'x = 2, maximum point',
				isCorrect: false,
				explanation: "f''(x) = 2 > 0 indicates a minimum, not maximum",
			},
			{
				letter: 'C',
				text: 'x = 4, minimum point',
				isCorrect: false,
				explanation: 'Incorrect: solve f prime of x = 0, not x = 4',
			},
			{
				letter: 'D',
				text: 'x = -2, minimum point',
				isCorrect: false,
				explanation: 'Incorrect: solve f prime of x = 0, not x = -2',
			},
		],
	},
	{
		questionText: 'The gradient of the tangent to the curve y = x³ at x = 1 is:',
		gradeLevel: 12,
		topic: 'Calculus',
		difficulty: 'medium',
		marks: 2,
		options: [
			{
				letter: 'A',
				text: '3',
				isCorrect: true,
				explanation: 'dy/dx = 3x squared. At x = 1, gradient = 3',
			},
			{
				letter: 'B',
				text: '1',
				isCorrect: false,
				explanation: 'Incorrect: derivative of x³ is 3x², evaluated at x=1 gives 3',
			},
			{
				letter: 'C',
				text: '2',
				isCorrect: false,
				explanation: 'Incorrect: 2 is the derivative of x², not x³',
			},
			{
				letter: 'D',
				text: '6',
				isCorrect: false,
				explanation: 'Incorrect: 3x² evaluated at x=1 gives 3, not 6',
			},
		],
	},
	// Grade 10 - Number Patterns
	{
		questionText: 'What is the next term in the sequence: 2, 5, 8, 11, ...?',
		gradeLevel: 10,
		topic: 'Number Patterns',
		difficulty: 'easy',
		marks: 2,
		options: [
			{
				letter: 'A',
				text: '14',
				isCorrect: true,
				explanation: 'Pattern: add 3 each time. 11 + 3 = 14',
			},
			{
				letter: 'B',
				text: '13',
				isCorrect: false,
				explanation: 'Incorrect: 11 + 2 = 13 would be wrong pattern',
			},
			{
				letter: 'C',
				text: '12',
				isCorrect: false,
				explanation: 'Incorrect: 11 + 1 = 12 would be wrong pattern',
			},
			{
				letter: 'D',
				text: '15',
				isCorrect: false,
				explanation: 'Incorrect: 11 + 4 = 15 would be wrong pattern',
			},
		],
	},
	{
		questionText: 'The nth term of a sequence is given by Tn = 3n + 2. What is T10?',
		gradeLevel: 10,
		topic: 'Number Patterns',
		difficulty: 'easy',
		marks: 2,
		options: [
			{ letter: 'A', text: '32', isCorrect: true, explanation: 'T10 = 3(10) + 2 = 30 + 2 = 32' },
			{
				letter: 'B',
				text: '30',
				isCorrect: false,
				explanation: 'Incorrect: 3(10) = 30, but we need to add 2',
			},
			{
				letter: 'C',
				text: '35',
				isCorrect: false,
				explanation: 'Incorrect: 3(10) + 5 = 35 would be wrong formula',
			},
			{
				letter: 'D',
				text: '12',
				isCorrect: false,
				explanation: 'Incorrect: 3(10) - 18 = 12 would be wrong formula',
			},
		],
	},
	// Grade 11 - Finance
	{
		questionText: 'Simple interest on R1000 at 5% per annum for 3 years is:',
		gradeLevel: 11,
		topic: 'Finance',
		difficulty: 'easy',
		marks: 2,
		options: [
			{
				letter: 'A',
				text: 'R150',
				isCorrect: true,
				explanation: 'I = P × r × n = 1000 × 0.05 × 3 = R150',
			},
			{
				letter: 'B',
				text: 'R50',
				isCorrect: false,
				explanation: 'Incorrect: that would be for 1 year, not 3',
			},
			{
				letter: 'C',
				text: 'R500',
				isCorrect: false,
				explanation: 'Incorrect: 1000 × 0.05 = 50, ×3 = 150',
			},
			{
				letter: 'D',
				text: 'R1150',
				isCorrect: false,
				explanation: 'Incorrect: that is the total amount including principal',
			},
		],
	},
	// Grade 12 - Probability
	{
		questionText: 'Two dice are rolled. What is the probability of getting a sum of 7?',
		gradeLevel: 12,
		topic: 'Probability',
		difficulty: 'medium',
		marks: 2,
		options: [
			{
				letter: 'A',
				text: '1/6',
				isCorrect: true,
				explanation:
					'Total outcomes = 36. Favorable: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1) = 6. Probability = 6/36 = 1/6',
			},
			{
				letter: 'B',
				text: '1/36',
				isCorrect: false,
				explanation: 'Incorrect: there are 6 ways to get sum of 7, not 1',
			},
			{
				letter: 'C',
				text: '1/12',
				isCorrect: false,
				explanation: 'Incorrect: 6/36 simplifies to 1/6, not 1/12',
			},
			{
				letter: 'D',
				text: '1/2',
				isCorrect: false,
				explanation: 'Incorrect: that would be half of all possible sums',
			},
		],
	},
	// Grade 11 - Exponents
	{
		questionText: 'Simplify: (x³)⁴',
		gradeLevel: 11,
		topic: 'Exponents',
		difficulty: 'easy',
		marks: 2,
		options: [
			{
				letter: 'A',
				text: 'x¹²',
				isCorrect: true,
				explanation: '(x³)⁴ = x^(3×4) = x¹² using (a^m)^n = a^(m×n)',
			},
			{
				letter: 'B',
				text: 'x⁷',
				isCorrect: false,
				explanation: 'Incorrect: add exponents, multiply (3+4=7)',
			},
			{
				letter: 'C',
				text: 'x⁶⁴',
				isCorrect: false,
				explanation: 'Incorrect: (x³)^4 is x^12, not x^64',
			},
			{
				letter: 'D',
				text: 'x³⁴',
				isCorrect: false,
				explanation: 'Incorrect: 3 and 4 are multiplied, not concatenated',
			},
		],
	},
	{
		questionText: 'Simplify: 2⁵ × 2³',
		gradeLevel: 10,
		topic: 'Exponents',
		difficulty: 'easy',
		marks: 2,
		options: [
			{
				letter: 'A',
				text: '2⁸',
				isCorrect: true,
				explanation: '2⁵ × 2³ = 2^(5+3) = 2⁸ using a^m × a^n = a^(m+n)',
			},
			{
				letter: 'B',
				text: '2¹⁵',
				isCorrect: false,
				explanation: 'Incorrect: multiply exponents, add bases (wrong rule)',
			},
			{
				letter: 'C',
				text: '4⁸',
				isCorrect: false,
				explanation: 'Incorrect: keep base 2, add exponents',
			},
			{
				letter: 'D',
				text: '4¹⁵',
				isCorrect: false,
				explanation: 'Incorrect: 2 × 2 = 4, but exponents add',
			},
		],
	},
	// Grade 12 - Analytical Geometry
	{
		questionText: 'The gradient of the line joining points (2, 3) and (6, 11) is:',
		gradeLevel: 12,
		topic: 'Analytical Geometry',
		difficulty: 'easy',
		marks: 2,
		options: [
			{
				letter: 'A',
				text: '2',
				isCorrect: true,
				explanation: 'm = (y₂-y₁)/(x₂-x₁) = (11-3)/(6-2) = 8/4 = 2',
			},
			{
				letter: 'B',
				text: '4',
				isCorrect: false,
				explanation: 'Incorrect: difference in y is 8, not 4',
			},
			{
				letter: 'C',
				text: '1/2',
				isCorrect: false,
				explanation: 'Incorrect: that would be the inverse of the correct answer',
			},
			{
				letter: 'D',
				text: '8',
				isCorrect: false,
				explanation: 'Incorrect: 8 is the difference in y values, not the gradient',
			},
		],
	},
	// Grade 12 - Euclidean Geometry
	{
		questionText:
			'In a circle, the angle subtended by an arc at the centre is 60°. What is the angle at the circumference?',
		gradeLevel: 12,
		topic: 'Euclidean Geometry',
		difficulty: 'medium',
		marks: 2,
		options: [
			{
				letter: 'A',
				text: '30°',
				isCorrect: true,
				explanation: 'The angle at the centre is twice the angle at the circumference: 60°/2 = 30°',
			},
			{
				letter: 'B',
				text: '60°',
				isCorrect: false,
				explanation: 'Incorrect: the angle at circumference is half the angle at centre',
			},
			{
				letter: 'C',
				text: '120°',
				isCorrect: false,
				explanation: 'Incorrect: multiply by 2 is wrong direction',
			},
			{
				letter: 'D',
				text: '90°',
				isCorrect: false,
				explanation: 'Incorrect: use the theorem that angle at centre = 2 × angle at circumference',
			},
		],
	},
];
