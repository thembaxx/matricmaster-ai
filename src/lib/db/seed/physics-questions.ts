export const physicsQuestions = [
	// Q1: 4 options (Grade 9 - Kinematics)
	{
		questionText:
			"the velocity-time graph of an object is a horizontal line above the time axis. what is the object's acceleration?",
		imageUrl: 'https://example.com/physics-diagram-1.png',
		hint: 'remember that acceleration is the slope of a velocity-time graph',
		gradeLevel: 9,
		topic: 'kinematics',
		difficulty: 'medium',
		marks: 2,
		options: [
			{
				letter: 'a',
				text: 'zero',
				isCorrect: true,
				explanation:
					'a horizontal velocity-time graph indicates constant velocity, so acceleration (slope of the graph) is zero.',
			},
			{
				letter: 'b',
				text: 'constant and positive',
				isCorrect: false,
				explanation: 'a positive slope would indicate increasing velocity, not a horizontal line.',
			},
			{
				letter: 'c',
				text: 'constant and negative',
				isCorrect: false,
				explanation: 'a negative slope would indicate decreasing velocity, not a horizontal line.',
			},
			{
				letter: 'd',
				text: 'increasing',
				isCorrect: false,
				explanation:
					"acceleration would only increase if the slope of the velocity-time graph were changing, which it isn't here.",
			},
		],
	},
	// Q2: 4 options (Grade 10 - Forces)
	{
		questionText:
			'a book rests on a table. which free-body diagram correctly represents the forces acting on the book?',
		imageUrl: 'https://example.com/physics-diagram-2.png',
		hint: 'think about weight acting downward and normal force upward',
		gradeLevel: 10,
		topic: 'forces',
		difficulty: 'medium',
		marks: 2,
		options: [
			{
				letter: 'a',
				text: 'only weight force downward',
				isCorrect: false,
				explanation:
					'a book at rest must have balanced forces; weight alone would cause acceleration.',
			},
			{
				letter: 'b',
				text: 'weight downward and normal force upward, equal in magnitude',
				isCorrect: true,
				explanation:
					"at rest, the normal force from the table balances the book's weight, resulting in zero net force.",
			},
			{
				letter: 'c',
				text: 'weight downward, normal force upward, and a small friction force',
				isCorrect: false,
				explanation:
					'friction only acts when there is horizontal motion or attempted motion; no horizontal forces exist here.',
			},
			{
				letter: 'd',
				text: 'only normal force upward',
				isCorrect: false,
				explanation:
					'without weight, the book would accelerate upward, which contradicts the scenario of it resting on the table.',
			},
		],
	},
	// Q3: 4 options (Grade 11 - Energy)
	{
		questionText:
			'a pendulum swings from point a (highest) to point b (lowest). ignoring air resistance, what happens to its kinetic and potential energy?',
		imageUrl: 'https://example.com/physics-diagram-3.png',
		gradeLevel: 11,
		topic: 'energy',
		difficulty: 'hard',
		marks: 3,
		options: [
			{
				letter: 'a',
				text: 'kinetic energy increases, potential energy decreases',
				isCorrect: true,
				explanation:
					'at the highest point (a), potential energy is maximum and kinetic energy is zero. as it swings down to b, potential energy converts to kinetic energy.',
			},
			{
				letter: 'b',
				text: 'kinetic energy decreases, potential energy increases',
				isCorrect: false,
				explanation: 'this would occur if the pendulum were swinging upward, not downward.',
			},
			{
				letter: 'c',
				text: 'both kinetic and potential energy increase',
				isCorrect: false,
				explanation:
					'total mechanical energy is conserved, so one form must decrease as the other increases.',
			},
			{
				letter: 'd',
				text: 'both kinetic and potential energy decrease',
				isCorrect: false,
				explanation:
					'this would violate the conservation of mechanical energy in an isolated system.',
			},
		],
	},
	// Q4: 4 options (Grade 10 - Waves)
	{
		questionText:
			'in a transverse wave, the direction of particle motion is __________ to the direction of wave propagation.',
		imageUrl: 'https://example.com/physics-diagram-4.png',
		gradeLevel: 10,
		topic: 'waves',
		difficulty: 'medium',
		marks: 2,
		options: [
			{
				letter: 'a',
				text: 'parallel',
				isCorrect: false,
				explanation:
					'parallel motion describes longitudinal waves (e.g., sound waves), not transverse waves.',
			},
			{
				letter: 'b',
				text: 'perpendicular',
				isCorrect: true,
				explanation:
					"in transverse waves (e.g., light), particles oscillate perpendicular to the wave's direction of travel.",
			},
			{
				letter: 'c',
				text: 'at 45 degrees',
				isCorrect: false,
				explanation:
					'no standard wave type has particle motion at a fixed 45-degree angle to propagation direction.',
			},
			{
				letter: 'd',
				text: 'opposite',
				isCorrect: false,
				explanation:
					'opposite motion is not characteristic of transverse wave particle oscillation.',
			},
		],
	},
	// Q5: 4 options (Grade 9 - Electricity)
	{
		questionText:
			'in a series circuit with two identical bulbs, if one bulb burns out, what happens to the other bulb?',
		imageUrl: 'https://example.com/physics-diagram-5.png',
		gradeLevel: 9,
		topic: 'electricity',
		difficulty: 'easy',
		marks: 2,
		options: [
			{
				letter: 'a',
				text: 'it remains lit',
				isCorrect: false,
				explanation:
					'in a series circuit, a break (burned-out bulb) stops current flow through the entire circuit.',
			},
			{
				letter: 'b',
				text: 'it becomes brighter',
				isCorrect: false,
				explanation:
					'brightness depends on current; no current means no light, not increased brightness.',
			},
			{
				letter: 'c',
				text: 'it goes out',
				isCorrect: true,
				explanation:
					'series circuits require continuous current flow; a burned-out bulb breaks the circuit, turning off both bulbs.',
			},
			{
				letter: 'd',
				text: 'it flickers',
				isCorrect: false,
				explanation:
					'flickering implies intermittent current, but a burned-out bulb creates a permanent open circuit.',
			},
		],
	},
	// Q6: 4 options (Grade 11 - Magnetism)
	{
		questionText:
			'the magnetic field lines around a bar magnet emerge from the __________ pole and enter the __________ pole.',
		imageUrl: 'https://example.com/physics-diagram-6.png',
		gradeLevel: 11,
		topic: 'magnetism',
		difficulty: 'medium',
		marks: 2,
		options: [
			{
				letter: 'a',
				text: 'north, south',
				isCorrect: true,
				explanation:
					'magnetic field lines always flow from the north pole to the south pole outside the magnet.',
			},
			{
				letter: 'b',
				text: 'south, north',
				isCorrect: false,
				explanation: 'this describes the direction inside the magnet, not outside.',
			},
			{
				letter: 'c',
				text: 'north, north',
				isCorrect: false,
				explanation: 'field lines cannot emerge and enter the same pole; they form closed loops.',
			},
			{
				letter: 'd',
				text: 'south, south',
				isCorrect: false,
				explanation:
					'field lines do not terminate at the same pole; they flow from north to south.',
			},
		],
	},
	// Q7: 4 options (Grade 10 - Optics)
	{
		questionText:
			'when light reflects off a smooth surface, the angle of incidence is equal to the angle of __________.',
		imageUrl: 'https://example.com/physics-diagram-7.png',
		gradeLevel: 10,
		topic: 'optics',
		difficulty: 'medium',
		marks: 2,
		options: [
			{
				letter: 'a',
				text: 'refraction',
				isCorrect: false,
				explanation:
					'refraction involves light bending when entering a new medium, not reflection.',
			},
			{
				letter: 'b',
				text: 'reflection',
				isCorrect: true,
				explanation:
					'the law of reflection states that the angle of incidence equals the angle of reflection.',
			},
			{
				letter: 'c',
				text: 'diffraction',
				isCorrect: false,
				explanation:
					'diffraction is the spreading of waves around obstacles, unrelated to reflection angles.',
			},
			{
				letter: 'd',
				text: 'absorption',
				isCorrect: false,
				explanation:
					'absorption refers to energy being taken in by a material, not a reflection property.',
			},
		],
	},
	// Q8: 4 options (Grade 9 - Thermodynamics)
	{
		questionText: 'which method of heat transfer does not require a medium?',
		imageUrl: 'https://example.com/physics-diagram-8.png',
		gradeLevel: 9,
		topic: 'thermodynamics',
		difficulty: 'easy',
		marks: 2,
		options: [
			{
				letter: 'a',
				text: 'conduction',
				isCorrect: false,
				explanation: 'conduction requires direct contact between particles in a medium.',
			},
			{
				letter: 'b',
				text: 'convection',
				isCorrect: false,
				explanation: 'convection relies on fluid movement (e.g., air or water) to transfer heat.',
			},
			{
				letter: 'c',
				text: 'radiation',
				isCorrect: true,
				explanation:
					'radiation (e.g., sunlight) transfers heat via electromagnetic waves, which travel through vacuum.',
			},
			{
				letter: 'd',
				text: 'all require a medium',
				isCorrect: false,
				explanation: 'radiation does not require a medium, so this statement is false.',
			},
		],
	},
	// Q9: 4 options (Grade 12 - Nuclear Physics)
	{
		questionText:
			'which type of radioactive decay involves the emission of an electron from the nucleus?',
		imageUrl: 'https://example.com/physics-diagram-9.png',
		gradeLevel: 12,
		topic: 'nuclear physics',
		difficulty: 'hard',
		marks: 3,
		options: [
			{
				letter: 'a',
				text: 'alpha decay',
				isCorrect: false,
				explanation:
					'alpha decay emits a helium nucleus (2 protons + 2 neutrons), not an electron.',
			},
			{
				letter: 'b',
				text: 'beta decay',
				isCorrect: true,
				explanation:
					'beta decay (β⁻) occurs when a neutron converts to a proton, emitting an electron and an antineutrino.',
			},
			{
				letter: 'c',
				text: 'gamma decay',
				isCorrect: false,
				explanation: 'gamma decay releases high-energy photons, not electrons.',
			},
			{
				letter: 'd',
				text: 'positron emission',
				isCorrect: false,
				explanation:
					'positron emission (β⁺) emits a positron (positive electron), not a standard electron.',
			},
		],
	},
	// Q10: 4 options (Grade 11 - Motion)
	{
		questionText:
			'in projectile motion, the horizontal component of velocity __________ (ignoring air resistance).',
		imageUrl: 'https://example.com/physics-diagram-10.png',
		gradeLevel: 11,
		topic: 'motion',
		difficulty: 'medium',
		marks: 2,
		options: [
			{
				letter: 'a',
				text: 'increases',
				isCorrect: false,
				explanation:
					'no horizontal force acts on the projectile (ignoring air resistance), so horizontal velocity remains constant.',
			},
			{
				letter: 'b',
				text: 'decreases',
				isCorrect: false,
				explanation:
					'a decrease would require a horizontal force, which does not exist in ideal projectile motion.',
			},
			{
				letter: 'c',
				text: 'remains constant',
				isCorrect: true,
				explanation:
					'horizontal acceleration is zero, so horizontal velocity does not change during flight.',
			},
			{
				letter: 'd',
				text: 'becomes zero at the peak',
				isCorrect: false,
				explanation:
					'only the vertical component of velocity becomes zero at the peak; horizontal velocity remains unchanged.',
			},
		],
	},
];
