export const mathematicsQuestions = [
	// Grade 10 - Algebra
	{
		questionText: 'solve for x: 2x + 5 = 15',
		gradeLevel: 10,
		topic: 'algebra',
		difficulty: 'easy',
		marks: 2,
		options: [
			{
				letter: 'a',
				text: 'x = 5',
				isCorrect: true,
				explanation: 'subtract 5 from both sides: 2x = 10, then divide by 2: x = 5',
			},
			{
				letter: 'b',
				text: 'x = 10',
				isCorrect: false,
				explanation: 'incorrect: 2(10) + 5 = 25, not 15',
			},
			{
				letter: 'c',
				text: 'x = 7.5',
				isCorrect: false,
				explanation: 'incorrect: 2(7.5) + 5 = 20, not 15',
			},
			{
				letter: 'd',
				text: 'x = 4',
				isCorrect: false,
				explanation: 'incorrect: 2(4) + 5 = 13, not 15',
			},
		],
	},
	{
		questionText: 'factorise: x² - 9',
		gradeLevel: 10,
		topic: 'algebra',
		difficulty: 'easy',
		marks: 2,
		options: [
			{
				letter: 'a',
				text: '(x - 3)(x + 3)',
				isCorrect: true,
				explanation: 'difference of squares: a² - b² = (a-b)(a+b)',
			},
			{
				letter: 'b',
				text: '(x - 3)²',
				isCorrect: false,
				explanation: '(x-3)² = x² - 6x + 9, not x² - 9',
			},
			{
				letter: 'c',
				text: '(x + 3)²',
				isCorrect: false,
				explanation: '(x+3)² = x² + 6x + 9, not x² - 9',
			},
			{
				letter: 'd',
				text: '(x - 9)(x + 1)',
				isCorrect: false,
				explanation: '(x-9)(x+1) = x² - 8x - 9, not x² - 9',
			},
		],
	},
	// Grade 11 - Trigonometry
	{
		questionText: 'if sin θ = 3/5 and θ is in the first quadrant, what is cos θ?',
		gradeLevel: 11,
		topic: 'trigonometry',
		difficulty: 'medium',
		marks: 2,
		options: [
			{
				letter: 'a',
				text: '4/5',
				isCorrect: true,
				explanation:
					'using sin²θ + cos²θ = 1: cos²θ = 1 - (3/5)² = 1 - 9/25 = 16/25, so cosθ = 4/5',
			},
			{
				letter: 'b',
				text: '3/4',
				isCorrect: false,
				explanation: 'incorrect: cosθ is not the ratio of adjacent/hypotenuse here',
			},
			{
				letter: 'c',
				text: '5/3',
				isCorrect: false,
				explanation: 'cosine cannot be greater than 1',
			},
			{
				letter: 'd',
				text: '5/4',
				isCorrect: false,
				explanation: 'cosine cannot be greater than 1',
			},
		],
	},
	{
		questionText: 'simplify: sin²θ × cos²θ',
		gradeLevel: 11,
		topic: 'trigonometry',
		difficulty: 'medium',
		marks: 2,
		options: [
			{
				letter: 'a',
				text: '1/4 × sin²(2θ)',
				isCorrect: true,
				explanation: 'using sin(2θ) = 2sinθcosθ, so sin²θcos²θ = (1/4)(2sinθcosθ)² = (1/4)sin²(2θ)',
			},
			{
				letter: 'b',
				text: 'sin(2θ)',
				isCorrect: false,
				explanation: 'incorrect identity application',
			},
			{
				letter: 'c',
				text: 'sin²θ + cos²θ',
				isCorrect: false,
				explanation: 'that equals 1, not sin²θ × cos²θ',
			},
			{
				letter: 'd',
				text: '1',
				isCorrect: false,
				explanation: 'sin²θ × cos²θ ≠ 1 (that would be sin²θ + cos²θ)',
			},
		],
	},
	// Grade 12 - Calculus
	{
		questionText: 'find the derivative of f(x) = x³ + 2x² - 5x + 3',
		gradeLevel: 12,
		topic: 'calculus',
		difficulty: 'easy',
		marks: 2,
		options: [
			{
				letter: 'a',
				text: "f'(x) = 3x² + 4x - 5",
				isCorrect: true,
				explanation: 'using power rule: d/dx(xⁿ) = nxⁿ⁻¹',
			},
			{
				letter: 'b',
				text: "f'(x) = 3x³ + 4x² - 5",
				isCorrect: false,
				explanation: 'incorrect: derivative of x³ is 3x², not 3x³',
			},
			{
				letter: 'c',
				text: "f'(x) = x² + 2x - 5",
				isCorrect: false,
				explanation: 'incorrect: derivative of x³ is 3x², not x²',
			},
			{
				letter: 'd',
				text: "f'(x) = 3x² + 2x - 5",
				isCorrect: false,
				explanation: 'incorrect: derivative of 2x² is 4x, not 2x',
			},
		],
	},
	{
		questionText: 'find ∫(2x + 1)dx',
		gradeLevel: 12,
		topic: 'calculus',
		difficulty: 'easy',
		marks: 2,
		options: [
			{
				letter: 'a',
				text: 'x² + x + c',
				isCorrect: true,
				explanation: '∫2x dx = x² + c₁, ∫1 dx = x + c₂, so x² + x + c',
			},
			{
				letter: 'b',
				text: '2x² + x + c',
				isCorrect: false,
				explanation: 'incorrect: ∫2x dx = x², not 2x²',
			},
			{
				letter: 'c',
				text: 'x² + c',
				isCorrect: false,
				explanation: 'missing the integral of the constant term (1)',
			},
			{
				letter: 'd',
				text: '2x + c',
				isCorrect: false,
				explanation: 'that would be the derivative, not the integral',
			},
		],
	},
	{
		questionText: 'if f(x) = x², what is the average rate of change from x = 1 to x = 3?',
		gradeLevel: 11,
		topic: 'calculus',
		difficulty: 'easy',
		marks: 2,
		options: [
			{
				letter: 'a',
				text: '4',
				isCorrect: true,
				explanation: 'average rate = [f(3) - f(1)]/(3-1) = (9-1)/2 = 8/2 = 4',
			},
			{
				letter: 'b',
				text: '8',
				isCorrect: false,
				explanation: 'incorrect: f(3)-f(1) = 8, divided by 2 gives 4',
			},
			{
				letter: 'c',
				text: '2',
				isCorrect: false,
				explanation: 'incorrect: this is the difference in x values, not the rate of change',
			},
			{
				letter: 'd',
				text: '9',
				isCorrect: false,
				explanation: 'incorrect: f(3) = 9, but we need the average rate of change',
			},
		],
	},
	// Grade 10 - Geometry
	{
		questionText:
			'in a right-angled triangle, if the two legs are 3cm and 4cm, what is the hypotenuse?',
		gradeLevel: 10,
		topic: 'geometry',
		difficulty: 'easy',
		marks: 2,
		options: [
			{
				letter: 'a',
				text: '5 cm',
				isCorrect: true,
				explanation: 'using pythagorean theorem: 3² + 4² = 9 + 16 = 25, √25 = 5',
			},
			{
				letter: 'b',
				text: '7 cm',
				isCorrect: false,
				explanation: 'incorrect: 3 + 4 = 7, but that is not how pythagorean theorem works',
			},
			{
				letter: 'c',
				text: '6 cm',
				isCorrect: false,
				explanation: 'incorrect: average of 3 and 4 is 3.5, not 6',
			},
			{
				letter: 'd',
				text: '25 cm',
				isCorrect: false,
				explanation: 'incorrect: 25 is the sum of squares, we need the square root',
			},
		],
	},
	{
		questionText: 'the interior angle sum of a hexagon is:',
		gradeLevel: 10,
		topic: 'geometry',
		difficulty: 'medium',
		marks: 2,
		options: [
			{
				letter: 'a',
				text: '720°',
				isCorrect: true,
				explanation: 'sum = (n-2) × 180° = (6-2) × 180° = 4 × 180° = 720°',
			},
			{
				letter: 'b',
				text: '1080°',
				isCorrect: false,
				explanation: 'incorrect: (6-2) × 180° = 720°, not 1080°',
			},
			{
				letter: 'c',
				text: '540°',
				isCorrect: false,
				explanation: 'incorrect: 540° is the sum for a pentagon (5-2) × 180°',
			},
			{
				letter: 'd',
				text: '360°',
				isCorrect: false,
				explanation: 'incorrect: 360° is for quadrilaterals or exterior angles',
			},
		],
	},
	// Grade 11 - Functions
	{
		questionText: 'what is the domain of f(x) = 1/(x-2)?',
		gradeLevel: 11,
		topic: 'functions',
		difficulty: 'easy',
		marks: 2,
		options: [
			{
				letter: 'a',
				text: 'all real numbers except x = 2',
				isCorrect: true,
				explanation: 'division by zero is undefined, so x cannot equal 2',
			},
			{
				letter: 'b',
				text: 'all real numbers',
				isCorrect: false,
				explanation: 'x = 2 makes the function undefined',
			},
			{
				letter: 'c',
				text: 'x > 2',
				isCorrect: false,
				explanation: 'the function is defined for all x except 2',
			},
			{
				letter: 'd',
				text: 'x < 2',
				isCorrect: false,
				explanation: 'the function is defined for all x except 2',
			},
		],
	},
	{
		questionText: 'if f(x) = 2x + 1 and g(x) = x², what is f(g(3))?',
		gradeLevel: 11,
		topic: 'functions',
		difficulty: 'medium',
		marks: 2,
		options: [
			{
				letter: 'a',
				text: '19',
				isCorrect: true,
				explanation: 'g(3) = 3² = 9, then f(9) = 2(9) + 1 = 19',
			},
			{
				letter: 'b',
				text: '7',
				isCorrect: false,
				explanation: 'incorrect: you need to first find g(3), not f(3)',
			},
			{
				letter: 'c',
				text: '18',
				isCorrect: false,
				explanation: 'incorrect: f(g(x)) = 2(x²) + 1, so f(g(3)) = 2(9) + 1 = 19',
			},
			{
				letter: 'd',
				text: '13',
				isCorrect: false,
				explanation: 'incorrect: 2(3) + 1 = 7 would be g(f(3)), not f(g(3))',
			},
		],
	},
	// Grade 12 - Calculus Applications
	{
		questionText: 'find the stationary point of f(x) = x² - 4x + 3',
		gradeLevel: 12,
		topic: 'calculus',
		difficulty: 'medium',
		marks: 3,
		options: [
			{
				letter: 'a',
				text: 'x = 2, minimum point',
				isCorrect: true,
				explanation: "f'(x) = 2x - 4 = 0 gives x = 2. Since f''(x) = 2 > 0, it is a minimum",
			},
			{
				letter: 'b',
				text: 'x = 2, maximum point',
				isCorrect: false,
				explanation: "f''(x) = 2 > 0 indicates a minimum, not maximum",
			},
			{
				letter: 'c',
				text: 'x = 4, minimum point',
				isCorrect: false,
				explanation: 'incorrect: solve f prime of x = 0, not x = 4',
			},
			{
				letter: 'd',
				text: 'x = -2, minimum point',
				isCorrect: false,
				explanation: 'incorrect: solve f prime of x = 0, not x = -2',
			},
		],
	},
	{
		questionText: 'the gradient of the tangent to the curve y = x³ at x = 1 is:',
		gradeLevel: 12,
		topic: 'calculus',
		difficulty: 'medium',
		marks: 2,
		options: [
			{
				letter: 'a',
				text: '3',
				isCorrect: true,
				explanation: 'dy/dx = 3x squared. at x = 1, gradient = 3',
			},
			{
				letter: 'b',
				text: '1',
				isCorrect: false,
				explanation: 'incorrect: derivative of x³ is 3x², evaluated at x=1 gives 3',
			},
			{
				letter: 'c',
				text: '2',
				isCorrect: false,
				explanation: 'incorrect: 2 is the derivative of x², not x³',
			},
			{
				letter: 'd',
				text: '6',
				isCorrect: false,
				explanation: 'incorrect: 3x² evaluated at x=1 gives 3, not 6',
			},
		],
	},
	// Grade 10 - Number Patterns
	{
		questionText: 'what is the next term in the sequence: 2, 5, 8, 11, ...?',
		gradeLevel: 10,
		topic: 'number patterns',
		difficulty: 'easy',
		marks: 2,
		options: [
			{
				letter: 'a',
				text: '14',
				isCorrect: true,
				explanation: 'pattern: add 3 each time. 11 + 3 = 14',
			},
			{
				letter: 'b',
				text: '13',
				isCorrect: false,
				explanation: 'incorrect: 11 + 2 = 13 would be wrong pattern',
			},
			{
				letter: 'c',
				text: '12',
				isCorrect: false,
				explanation: 'incorrect: 11 + 1 = 12 would be wrong pattern',
			},
			{
				letter: 'd',
				text: '15',
				isCorrect: false,
				explanation: 'incorrect: 11 + 4 = 15 would be wrong pattern',
			},
		],
	},
	{
		questionText: 'the nth term of a sequence is given by tn = 3n + 2. what is t10?',
		gradeLevel: 10,
		topic: 'number patterns',
		difficulty: 'easy',
		marks: 2,
		options: [
			{ letter: 'a', text: '32', isCorrect: true, explanation: 't10 = 3(10) + 2 = 30 + 2 = 32' },
			{
				letter: 'b',
				text: '30',
				isCorrect: false,
				explanation: 'incorrect: 3(10) = 30, but we need to add 2',
			},
			{
				letter: 'c',
				text: '35',
				isCorrect: false,
				explanation: 'incorrect: 3(10) + 5 = 35 would be wrong formula',
			},
			{
				letter: 'd',
				text: '12',
				isCorrect: false,
				explanation: 'incorrect: 3(10) - 18 = 12 would be wrong formula',
			},
		],
	},
	// Grade 11 - Finance
	{
		questionText: 'simple interest on r1000 at 5% per annum for 3 years is:',
		gradeLevel: 11,
		topic: 'finance',
		difficulty: 'easy',
		marks: 2,
		options: [
			{
				letter: 'a',
				text: 'r150',
				isCorrect: true,
				explanation: 'i = p × r × n = 1000 × 0.05 × 3 = r150',
			},
			{
				letter: 'b',
				text: 'r50',
				isCorrect: false,
				explanation: 'incorrect: that would be for 1 year, not 3',
			},
			{
				letter: 'c',
				text: 'r500',
				isCorrect: false,
				explanation: 'incorrect: 1000 × 0.05 = 50, ×3 = 150',
			},
			{
				letter: 'd',
				text: 'r1150',
				isCorrect: false,
				explanation: 'incorrect: that is the total amount including principal',
			},
		],
	},
	// Grade 12 - Probability
	{
		questionText: 'two dice are rolled. what is the probability of getting a sum of 7?',
		gradeLevel: 12,
		topic: 'probability',
		difficulty: 'medium',
		marks: 2,
		options: [
			{
				letter: 'a',
				text: '1/6',
				isCorrect: true,
				explanation:
					'total outcomes = 36. favorable: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1) = 6. probability = 6/36 = 1/6',
			},
			{
				letter: 'b',
				text: '1/36',
				isCorrect: false,
				explanation: 'incorrect: there are 6 ways to get sum of 7, not 1',
			},
			{
				letter: 'c',
				text: '1/12',
				isCorrect: false,
				explanation: 'incorrect: 6/36 simplifies to 1/6, not 1/12',
			},
			{
				letter: 'd',
				text: '1/2',
				isCorrect: false,
				explanation: 'incorrect: that would be half of all possible sums',
			},
		],
	},
	// Grade 11 - Exponents
	{
		questionText: 'simplify: (x³)⁴',
		gradeLevel: 11,
		topic: 'exponents',
		difficulty: 'easy',
		marks: 2,
		options: [
			{
				letter: 'a',
				text: 'x¹²',
				isCorrect: true,
				explanation: '(x³)⁴ = x^(3×4) = x¹² using (a^m)^n = a^(m×n)',
			},
			{
				letter: 'b',
				text: 'x⁷',
				isCorrect: false,
				explanation: 'incorrect: add exponents, multiply (3+4=7)',
			},
			{
				letter: 'c',
				text: 'x⁶⁴',
				isCorrect: false,
				explanation: 'incorrect: (x³)^4 is x^12, not x^64',
			},
			{
				letter: 'd',
				text: 'x³⁴',
				isCorrect: false,
				explanation: 'incorrect: 3 and 4 are multiplied, not concatenated',
			},
		],
	},
	{
		questionText: 'simplify: 2⁵ × 2³',
		gradeLevel: 10,
		topic: 'exponents',
		difficulty: 'easy',
		marks: 2,
		options: [
			{
				letter: 'a',
				text: '2⁸',
				isCorrect: true,
				explanation: '2⁵ × 2³ = 2^(5+3) = 2⁸ using a^m × a^n = a^(m+n)',
			},
			{
				letter: 'b',
				text: '2¹⁵',
				isCorrect: false,
				explanation: 'incorrect: multiply exponents, add bases (wrong rule)',
			},
			{
				letter: 'c',
				text: '4⁸',
				isCorrect: false,
				explanation: 'incorrect: keep base 2, add exponents',
			},
			{
				letter: 'd',
				text: '4¹⁵',
				isCorrect: false,
				explanation: 'incorrect: 2 × 2 = 4, but exponents add',
			},
		],
	},
	// Grade 12 - Analytical Geometry
	{
		questionText: 'the gradient of the line joining points (2, 3) and (6, 11) is:',
		gradeLevel: 12,
		topic: 'analytical geometry',
		difficulty: 'easy',
		marks: 2,
		options: [
			{
				letter: 'a',
				text: '2',
				isCorrect: true,
				explanation: 'm = (y₂-y₁)/(x₂-x₁) = (11-3)/(6-2) = 8/4 = 2',
			},
			{
				letter: 'b',
				text: '4',
				isCorrect: false,
				explanation: 'incorrect: difference in y is 8, not 4',
			},
			{
				letter: 'c',
				text: '1/2',
				isCorrect: false,
				explanation: 'incorrect: that would be the inverse of the correct answer',
			},
			{
				letter: 'd',
				text: '8',
				isCorrect: false,
				explanation: 'incorrect: 8 is the difference in y values, not the gradient',
			},
		],
	},
	// Grade 12 - Euclidean Geometry
	{
		questionText:
			'in a circle, the angle subtended by an arc at the centre is 60°. what is the angle at the circumference?',
		gradeLevel: 12,
		topic: 'euclidean geometry',
		difficulty: 'medium',
		marks: 2,
		options: [
			{
				letter: 'a',
				text: '30°',
				isCorrect: true,
				explanation: 'the angle at the centre is twice the angle at the circumference: 60°/2 = 30°',
			},
			{
				letter: 'b',
				text: '60°',
				isCorrect: false,
				explanation: 'incorrect: the angle at circumference is half the angle at centre',
			},
			{
				letter: 'c',
				text: '120°',
				isCorrect: false,
				explanation: 'incorrect: multiply by 2 is wrong direction',
			},
			{
				letter: 'd',
				text: '90°',
				isCorrect: false,
				explanation: 'incorrect: use the theorem that angle at centre = 2 × angle at circumference',
			},
		],
	},
];
