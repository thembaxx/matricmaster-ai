export const physicsQuestions = [
	// Q1: 4 options (Grade 9 - Kinematics)
	{
		questionText:
			"The velocity-time graph of an object is a horizontal line above the time axis. What is the object's acceleration?",
		imageUrl: 'https://example.com/physics-diagram-1.png',
		hint: 'Remember that acceleration is the slope of a velocity-time graph',
		gradeLevel: 9,
		topic: 'Kinematics',
		difficulty: 'medium',
		marks: 2,
		options: [
			{
				letter: 'A',
				text: 'Zero',
				isCorrect: true,
				explanation:
					'A horizontal velocity-time graph indicates constant velocity, so acceleration (slope of the graph) is zero.',
			},
			{
				letter: 'B',
				text: 'Constant and positive',
				isCorrect: false,
				explanation: 'A positive slope would indicate increasing velocity, not a horizontal line.',
			},
			{
				letter: 'C',
				text: 'Constant and negative',
				isCorrect: false,
				explanation: 'A negative slope would indicate decreasing velocity, not a horizontal line.',
			},
			{
				letter: 'D',
				text: 'Increasing',
				isCorrect: false,
				explanation:
					"Acceleration would only increase if the slope of the velocity-time graph were changing, which it isn't here.",
			},
		],
	},
	// Q2: 4 options (Grade 10 - Forces)
	{
		questionText:
			'A book rests on a table. Which free-body diagram correctly represents the forces acting on the book?',
		imageUrl: 'https://example.com/physics-diagram-2.png',
		hint: 'Think about weight acting downward and normal force upward',
		gradeLevel: 10,
		topic: 'Forces',
		difficulty: 'medium',
		marks: 2,
		options: [
			{
				letter: 'A',
				text: 'Only weight force downward',
				isCorrect: false,
				explanation:
					'A book at rest must have balanced forces; weight alone would cause acceleration.',
			},
			{
				letter: 'B',
				text: 'Weight downward and normal force upward, equal in magnitude',
				isCorrect: true,
				explanation:
					"At rest, the normal force from the table balances the book's weight, resulting in zero net force.",
			},
			{
				letter: 'C',
				text: 'Weight downward, normal force upward, and a small friction force',
				isCorrect: false,
				explanation:
					'Friction only acts when there is horizontal motion or attempted motion; no horizontal forces exist here.',
			},
			{
				letter: 'D',
				text: 'Only normal force upward',
				isCorrect: false,
				explanation:
					'Without weight, the book would accelerate upward, which contradicts the scenario of it resting on the table.',
			},
		],
	},
	// Q3: 4 options (Grade 11 - Energy)
	{
		questionText:
			'A pendulum swings from point A (highest) to point B (lowest). Ignoring air resistance, what happens to its kinetic and potential energy?',
		imageUrl: 'https://example.com/physics-diagram-3.png',
		gradeLevel: 11,
		topic: 'Energy',
		difficulty: 'hard',
		marks: 3,
		options: [
			{
				letter: 'A',
				text: 'Kinetic energy increases, potential energy decreases',
				isCorrect: true,
				explanation:
					'At the highest point (A), potential energy is maximum and kinetic energy is zero. As it swings down to B, potential energy converts to kinetic energy.',
			},
			{
				letter: 'B',
				text: 'Kinetic energy decreases, potential energy increases',
				isCorrect: false,
				explanation: 'This would occur if the pendulum were swinging upward, not downward.',
			},
			{
				letter: 'C',
				text: 'Both kinetic and potential energy increase',
				isCorrect: false,
				explanation:
					'Total mechanical energy is conserved, so one form must decrease as the other increases.',
			},
			{
				letter: 'D',
				text: 'Both kinetic and potential energy decrease',
				isCorrect: false,
				explanation:
					'This would violate the conservation of mechanical energy in an isolated system.',
			},
		],
	},
	// Q4: 4 options (Grade 10 - Waves)
	{
		questionText:
			'In a transverse wave, the direction of particle motion is __________ to the direction of wave propagation.',
		imageUrl: 'https://example.com/physics-diagram-4.png',
		gradeLevel: 10,
		topic: 'Waves',
		difficulty: 'medium',
		marks: 2,
		options: [
			{
				letter: 'A',
				text: 'Parallel',
				isCorrect: false,
				explanation:
					'Parallel motion describes longitudinal waves (e.g., sound waves), not transverse waves.',
			},
			{
				letter: 'B',
				text: 'Perpendicular',
				isCorrect: true,
				explanation:
					"In transverse waves (e.g., light), particles oscillate perpendicular to the wave's direction of travel.",
			},
			{
				letter: 'C',
				text: 'At 45 degrees',
				isCorrect: false,
				explanation:
					'No standard wave type has particle motion at a fixed 45-degree angle to propagation direction.',
			},
			{
				letter: 'D',
				text: 'Opposite',
				isCorrect: false,
				explanation:
					'Opposite motion is not characteristic of transverse wave particle oscillation.',
			},
		],
	},
	// Q5: 4 options (Grade 9 - Electricity)
	{
		questionText:
			'In a series circuit with two identical bulbs, if one bulb burns out, what happens to the other bulb?',
		imageUrl: 'https://example.com/physics-diagram-5.png',
		gradeLevel: 9,
		topic: 'Electricity',
		difficulty: 'easy',
		marks: 2,
		options: [
			{
				letter: 'A',
				text: 'It remains lit',
				isCorrect: false,
				explanation:
					'In a series circuit, a break (burned-out bulb) stops current flow through the entire circuit.',
			},
			{
				letter: 'B',
				text: 'It becomes brighter',
				isCorrect: false,
				explanation:
					'Brightness depends on current; no current means no light, not increased brightness.',
			},
			{
				letter: 'C',
				text: 'It goes out',
				isCorrect: true,
				explanation:
					'Series circuits require continuous current flow; a burned-out bulb breaks the circuit, turning off both bulbs.',
			},
			{
				letter: 'D',
				text: 'It flickers',
				isCorrect: false,
				explanation:
					'Flickering implies intermittent current, but a burned-out bulb creates a permanent open circuit.',
			},
		],
	},
	// Q6: 4 options (Grade 11 - Magnetism)
	{
		questionText:
			'The magnetic field lines around a bar magnet emerge from the __________ pole and enter the __________ pole.',
		imageUrl: 'https://example.com/physics-diagram-6.png',
		gradeLevel: 11,
		topic: 'Magnetism',
		difficulty: 'medium',
		marks: 2,
		options: [
			{
				letter: 'A',
				text: 'North, South',
				isCorrect: true,
				explanation:
					'Magnetic field lines always flow from the north pole to the south pole outside the magnet.',
			},
			{
				letter: 'B',
				text: 'South, North',
				isCorrect: false,
				explanation: 'This describes the direction inside the magnet, not outside.',
			},
			{
				letter: 'C',
				text: 'North, North',
				isCorrect: false,
				explanation: 'Field lines cannot emerge and enter the same pole; they form closed loops.',
			},
			{
				letter: 'D',
				text: 'South, South',
				isCorrect: false,
				explanation:
					'Field lines do not terminate at the same pole; they flow from north to south.',
			},
		],
	},
	// Q7: 4 options (Grade 10 - Optics)
	{
		questionText:
			'When light reflects off a smooth surface, the angle of incidence is equal to the angle of __________.',
		imageUrl: 'https://example.com/physics-diagram-7.png',
		gradeLevel: 10,
		topic: 'Optics',
		difficulty: 'medium',
		marks: 2,
		options: [
			{
				letter: 'A',
				text: 'Refraction',
				isCorrect: false,
				explanation:
					'Refraction involves light bending when entering a new medium, not reflection.',
			},
			{
				letter: 'B',
				text: 'Reflection',
				isCorrect: true,
				explanation:
					'The law of reflection states that the angle of incidence equals the angle of reflection.',
			},
			{
				letter: 'C',
				text: 'Diffraction',
				isCorrect: false,
				explanation:
					'Diffraction is the spreading of waves around obstacles, unrelated to reflection angles.',
			},
			{
				letter: 'D',
				text: 'Absorption',
				isCorrect: false,
				explanation:
					'Absorption refers to energy being taken in by a material, not a reflection property.',
			},
		],
	},
	// Q8: 4 options (Grade 9 - Thermodynamics)
	{
		questionText: 'Which method of heat transfer does NOT require a medium?',
		imageUrl: 'https://example.com/physics-diagram-8.png',
		gradeLevel: 9,
		topic: 'Thermodynamics',
		difficulty: 'easy',
		marks: 2,
		options: [
			{
				letter: 'A',
				text: 'Conduction',
				isCorrect: false,
				explanation: 'Conduction requires direct contact between particles in a medium.',
			},
			{
				letter: 'B',
				text: 'Convection',
				isCorrect: false,
				explanation: 'Convection relies on fluid movement (e.g., air or water) to transfer heat.',
			},
			{
				letter: 'C',
				text: 'Radiation',
				isCorrect: true,
				explanation:
					'Radiation (e.g., sunlight) transfers heat via electromagnetic waves, which travel through vacuum.',
			},
			{
				letter: 'D',
				text: 'All require a medium',
				isCorrect: false,
				explanation: 'Radiation does not require a medium, so this statement is false.',
			},
		],
	},
	// Q9: 4 options (Grade 12 - Nuclear Physics)
	{
		questionText:
			'Which type of radioactive decay involves the emission of an electron from the nucleus?',
		imageUrl: 'https://example.com/physics-diagram-9.png',
		gradeLevel: 12,
		topic: 'Nuclear Physics',
		difficulty: 'hard',
		marks: 3,
		options: [
			{
				letter: 'A',
				text: 'Alpha decay',
				isCorrect: false,
				explanation:
					'Alpha decay emits a helium nucleus (2 protons + 2 neutrons), not an electron.',
			},
			{
				letter: 'B',
				text: 'Beta decay',
				isCorrect: true,
				explanation:
					'Beta decay (β⁻) occurs when a neutron converts to a proton, emitting an electron and an antineutrino.',
			},
			{
				letter: 'C',
				text: 'Gamma decay',
				isCorrect: false,
				explanation: 'Gamma decay releases high-energy photons, not electrons.',
			},
			{
				letter: 'D',
				text: 'Positron emission',
				isCorrect: false,
				explanation:
					'Positron emission (β⁺) emits a positron (positive electron), not a standard electron.',
			},
		],
	},
	// Q10: 4 options (Grade 11 - Motion)
	{
		questionText:
			'In projectile motion, the horizontal component of velocity __________ (ignoring air resistance).',
		imageUrl: 'https://example.com/physics-diagram-10.png',
		gradeLevel: 11,
		topic: 'Motion',
		difficulty: 'medium',
		marks: 2,
		options: [
			{
				letter: 'A',
				text: 'Increases',
				isCorrect: false,
				explanation:
					'No horizontal force acts on the projectile (ignoring air resistance), so horizontal velocity remains constant.',
			},
			{
				letter: 'B',
				text: 'Decreases',
				isCorrect: false,
				explanation:
					'A decrease would require a horizontal force, which does not exist in ideal projectile motion.',
			},
			{
				letter: 'C',
				text: 'Remains constant',
				isCorrect: true,
				explanation:
					'Horizontal acceleration is zero, so horizontal velocity does not change during flight.',
			},
			{
				letter: 'D',
				text: 'Becomes zero at the peak',
				isCorrect: false,
				explanation:
					'Only the vertical component of velocity becomes zero at the peak; horizontal velocity remains unchanged.',
			},
		],
	},
];
