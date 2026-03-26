import type { QuizQuestion, Setwork } from './types';

export const setworks: Setwork[] = [
	{
		id: 'things-fall-apart',
		title: 'Things Fall Apart',
		author: 'Chinua Achebe',
		genre: 'novel',
		year: 1958,
		targetLevel: 'HL',
		synopsis:
			'The story follows Okonkwo, a respected warrior in the Igbo community of Umuofia, whose tragic flaw leads to his downfall. Set in pre-colonial Nigeria, the novel explores themes of masculinity, tradition, and the clash between Igbo and Western cultures.',
		context:
			'Achebe wrote this novel as a response to Western portrayals of African societies as primitive. It is widely regarded as one of the most important works of African literature.',
		characters: [
			{
				id: 'okonkwo',
				name: 'Okonkwo',
				role: 'protagonist',
				description:
					"A proud, ambitious warrior who fears failure. Strong but inflexible, he measures himself against his father's weaknesses.",
				relationships: [
					{ characterId: 'ezinma', relationship: 'daughter' },
					{ characterId: 'ikemefuna', relationship: 'adopted son' },
					{ characterId: 'nwoye', relationship: 'son' },
				],
			},
			{
				id: 'ezinma',
				name: 'Ezinma',
				role: 'supporting',
				description:
					"Okonkwo's favourite daughter, strong-willed and intelligent. She is the only child who truly understands her father.",
				relationships: [{ characterId: 'okonkwo', relationship: 'father' }],
			},
			{
				id: 'ikemefuna',
				name: 'Ikemefuna',
				role: 'supporting',
				description:
					'A young boy taken as a peace offering from another clan, raised by Okonkwo for three years.',
				relationships: [{ characterId: 'okonkwo', relationship: 'father figure' }],
			},
			{
				id: 'nwoye',
				name: 'Nwoye',
				role: 'supporting',
				description:
					"Okonkwo's son, gentle and sensitive. His interests clash with his father's expectations of masculinity.",
				relationships: [{ characterId: 'okonkwo', relationship: 'son' }],
			},
			{
				id: 'obierika',
				name: 'Obierika',
				role: 'supporting',
				description:
					"Okonkwo's best friend, wise and moderate. He provides counsel and questions the traditions that Okonkwo blindly follows.",
				relationships: [{ characterId: 'okonkwo', relationship: 'friend' }],
			},
			{
				id: 'mr-brown',
				name: 'Mr. Brown',
				role: 'supporting',
				description:
					'The first missionary who converts many villagers through patience and education rather than force.',
				relationships: [],
			},
		],
		themes: [
			{
				id: 'masculinity',
				name: 'Masculinity',
				description:
					'The novel examines what it means to be a man in Igbo society, and the dangers of toxic masculinity.',
				examples: [
					"Okonkwo's fear of being seen as weak like his father",
					'The banishment of Ikemefuna despite his love for the boy',
					'The tension between Okonkwo and Nwoye over what it means to be a man',
				],
			},
			{
				id: 'tradition',
				name: 'Tradition vs Change',
				description: 'Clash between traditional Igbo values and Christian missionary influence.',
				examples: [
					'The introduction of the missionaries and their religion',
					'The breaking of the Week of Peace by Okonkwo',
					'The conversion of Nwoye and other villagers',
				],
			},
			{
				id: 'fate',
				name: 'Fate vs Free Will',
				description: 'Whether characters control their destinies or are bound by fate.',
				examples: [
					"Okonkwo's belief in chi (personal spirit)",
					"The village seer's predictions about Ikemefuna",
					"The oracle's decree that leads to Okonkwo's exile",
				],
			},
			{
				id: 'language',
				name: 'The Power of Language',
				description:
					'The novel demonstrates the sophistication of Igbo language and oral traditions.',
				examples: [
					'The use of proverbs throughout the narrative',
					"The Village Crier's announcements",
					'The significance of naming ceremonies',
				],
			},
		],
		quotes: [
			{
				id: 'q1',
				text: 'Among the Ibo the art of conversation is regarded very highly, and proverbs are the palm-oil with which words are eaten.',
				speaker: 'Narrator',
				context: 'Opening line, establishing the importance of language in Igbo culture',
				themeIds: ['language'],
			},
			{
				id: 'q2',
				text: "Okonkwo's whole life was dominated by fear, the fear of failure and of weakness.",
				speaker: 'Narrator',
				context: "Describing Okonkwo's inner turmoil and driving motivation",
				themeIds: ['masculinity'],
			},
			{
				id: 'q3',
				text: "When he walked, he walked jauntily; his head was held high like a fighting cock's.",
				speaker: 'Narrator',
				context: 'Describing how Okonkwo presents himself to the world',
				themeIds: ['masculinity'],
			},
			{
				id: 'q4',
				text: 'He had already chosen the color of his cloth, a color of the sky, and he had sent to the chief medicine man for medicine.',
				speaker: 'Narrator',
				context: "About Ikemefuna's impending sacrifice, foreshadowing tragedy",
				themeIds: ['tradition'],
			},
		],
	},
	{
		id: 'cry-beloved-country',
		title: 'Cry, the Beloved Country',
		author: 'Alan Paton',
		genre: 'novel',
		year: 1948,
		targetLevel: 'HL',
		synopsis:
			'The story of Reverend Stephen Kumalo, a Zulu priest who travels from his rural village to Johannesburg to find his sister and son, only to discover the harsh realities of apartheid South Africa.',
		context:
			"Written during apartheid, the novel is a plea for reconciliation and understanding between South Africa's divided communities.",
		characters: [
			{
				id: 'kumalo',
				name: 'Stephen Kumalo',
				role: 'protagonist',
				description:
					'A dedicated parish priest from Ndotsheni who journeys to Johannesburg seeking his family.',
				relationships: [
					{ characterId: 'absalom', relationship: 'son' },
					{ characterId: 'gertrude', relationship: 'sister' },
				],
			},
			{
				id: 'absalom',
				name: 'Absalom Kumalo',
				role: 'supporting',
				description:
					"Stephen's son who moves to Johannesburg seeking work and becomes entangled in crime.",
				relationships: [{ characterId: 'kumalo', relationship: 'father' }],
			},
			{
				id: 'gertrude',
				name: 'Gertrude Kumalo',
				role: 'supporting',
				description: "Stephen's sister who moves to Johannesburg and becomes a prostitute.",
				relationships: [{ characterId: 'kumalo', relationship: 'sister' }],
			},
			{
				id: 'jarvis',
				name: 'Arthur Jarvis',
				role: 'supporting',
				description: 'A white South African activist working for reform and racial justice.',
				relationships: [],
			},
			{
				id: 'mapiere',
				name: 'Mapiere Kumalo',
				role: 'supporting',
				description: "Stephen's wife who remains in Ndotsheni tending to their home.",
				relationships: [{ characterId: 'kumalo', relationship: 'wife' }],
			},
		],
		themes: [
			{
				id: 'apartheid',
				name: 'Apartheid and Segregation',
				description: 'The destructive effects of racial division and discrimination.',
				examples: [
					"Johannesburg's contrast to the poverty of Ndotsheni",
					'The racial tension throughout the novel',
					'The separate and unequal treatment of black South Africans',
				],
			},
			{
				id: 'reconciliation',
				name: 'Reconciliation',
				description: 'The possibility of healing through understanding and forgiveness.',
				examples: [
					"Arthur Jarvis Sr's forgiveness of Absalom despite his son's death",
					"Kumalo's dignified speech at the trial",
					'The meeting between Kumalo and James Jarvis',
				],
			},
			{
				id: 'fear',
				name: 'Fear',
				description: 'How fear drives both black and white communities.',
				examples: [
					'Fear in Ndotsheni about the failing crops',
					'Fear in Johannesburg about crime',
					"The white farmers' fear of the black population",
				],
			},
			{
				id: 'nature',
				name: 'Nature and the Land',
				description: 'The relationship between people and the land they live on.',
				examples: [
					'The contrast between the red soil of Ndotsheni and Johannesburg',
					'The drought affecting the village',
					'The symbol of the broken dam representing societal breakdown',
				],
			},
		],
		quotes: [
			{
				id: 'q1',
				text: 'Cry, the beloved country, for the unborn child that is drawn to the yonder passed.',
				speaker: 'Poem/Song',
				context: 'The opening poem that frames the novel and establishes its themes',
				themeIds: ['apartheid'],
			},
			{
				id: 'q2',
				text: 'I have one great fear in my heart, that one day when they are turned to loving, they will find that we are turned to hating.',
				speaker: 'Stephen Kumalo',
				context: 'Expressing his fear about the consequences of oppression',
				themeIds: ['fear', 'apartheid'],
			},
			{
				id: 'q3',
				text: 'There is no love in the world like this love, this love that has no price and no demand.',
				speaker: 'Stephen Kumalo',
				context: 'About the unconditional love of a parent for a child',
				themeIds: ['reconciliation'],
			},
		],
	},
	{
		id: 'merchant-venice',
		title: 'The Merchant of Venice',
		author: 'William Shakespeare',
		genre: 'drama',
		year: 1598,
		targetLevel: 'FAL',
		synopsis:
			'A comedy exploring themes of mercy, justice, and prejudice through the story of Antonio, a merchant who borrows money from Shylock, a Jewish moneylender.',
		context:
			'Written in Elizabethan England, the play reflects antisemitic attitudes of the time while also challenging them through its complex portrayal of Shylock.',
		characters: [
			{
				id: 'shylock',
				name: 'Shylock',
				role: 'antagonist',
				description:
					"A Jewish moneylender seeking revenge for Antonio's insults. Complex character who is both villain and victim.",
				relationships: [{ characterId: 'portia', relationship: 'opponent' }],
			},
			{
				id: 'portia',
				name: 'Portia',
				role: 'protagonist',
				description:
					'A wealthy heiress who tests her suitors with the casket test, then disguises herself as a lawyer.',
				relationships: [{ characterId: 'bassanio', relationship: 'wife' }],
			},
			{
				id: 'antonio',
				name: 'Antonio',
				role: 'supporting',
				description: 'The merchant who borrows from Shylock, risking a pound of flesh.',
				relationships: [{ characterId: 'bassanio', relationship: 'friend' }],
			},
			{
				id: 'bassanio',
				name: 'Bassanio',
				role: 'supporting',
				description: "Antonio's friend who courts Portia to pay off his debts.",
				relationships: [
					{ characterId: 'portia', relationship: 'husband' },
					{ characterId: 'antonio', relationship: 'friend' },
				],
			},
			{
				id: 'jessica',
				name: 'Jessica',
				role: 'supporting',
				description: "Shylock's daughter who elopes with Lorenzo, taking her father's wealth.",
				relationships: [{ characterId: 'shylock', relationship: 'daughter' }],
			},
		],
		themes: [
			{
				id: 'prejudice',
				name: 'Prejudice and Antisemitism',
				description: 'The treatment of Jews in Christian society.',
				examples: [
					"Antonio's abuse and spitting on Shylock",
					'The way Christians speak about Jews',
					"The 'payment' scene where Shylock demands his bond",
				],
			},
			{
				id: 'mercy',
				name: 'Mercy',
				description: 'The virtue of forgiveness and compassion.',
				examples: [
					"Portia's famous 'quality of mercy' speech",
					'Antonio asking Shylock to show mercy',
					'The mercy shown to Shylock at the end of the trial',
				],
			},
			{
				id: 'justice',
				name: 'Justice',
				description: 'The law and its application, including poetic justice.',
				examples: [
					"The strict interpretation of Shylock's bond",
					'Portia arguing that mercy supersedes law',
					"Shylock's punishment fitting his crime",
				],
			},
			{
				id: 'appearance',
				name: 'Appearance vs Reality',
				description: 'Things are not always what they seem.',
				examples: [
					'Portia disguising herself as a lawyer',
					'The casket test revealing true character',
					'Bassanio choosing the correct casket based on love',
				],
			},
		],
		quotes: [
			{
				id: 'q1',
				text: "The quality of mercy is not strain'd, it droppeth as the gentle rain from heaven upon the place beneath.",
				speaker: 'Portia',
				context: 'Her famous speech on mercy delivered in the courtroom',
				themeIds: ['mercy'],
			},
			{
				id: 'q2',
				text: 'If you prick us, do we not bleed? If you tickle us, do we not laugh? If you poison us, do we not die?',
				speaker: 'Shylock',
				context: "Shylock's powerful speech demanding equal treatment",
				themeIds: ['prejudice'],
			},
			{
				id: 'q3',
				text: 'All that glitters is not gold; often have you heard that told.',
				speaker: 'Arragon',
				context: 'The inscription on the silver casket that saves Portia from unworthy suitors',
				themeIds: ['appearance'],
			},
		],
	},
];

export const quizQuestions: QuizQuestion[] = [
	// Things Fall Apart
	{
		id: 'tfa-q1',
		setworkId: 'things-fall-apart',
		question: "What is Okonkwo's greatest fear?",
		options: ['Failure', 'Death', 'Losing his wealth', 'The gods'],
		correctAnswer: 0,
		explanation:
			'Okonkwo fears failure above all else, believing it to be the greatest shame and weakness.',
		difficulty: 'easy',
	},
	{
		id: 'tfa-q2',
		setworkId: 'things-fall-apart',
		question: 'Who is Ikemefuna?',
		options: ["Okonkwo's brother", "Okonkwo's adopted son", 'A tribal elder', 'A missionary'],
		correctAnswer: 1,
		explanation:
			'Ikemefuna is a young boy taken as a peace offering from another clan, raised by Okonkwo for three years.',
		difficulty: 'easy',
	},
	{
		id: 'tfa-q3',
		setworkId: 'things-fall-apart',
		question: "What triggers Okonkwo's mental downfall?",
		options: [
			'Killing his son',
			'Killing Ikemefuna',
			'Losing his wealth',
			'Converting to Christianity',
		],
		correctAnswer: 1,
		explanation:
			'Being forced to participate in killing Ikemefuna haunts Okonkwo and creates internal conflict.',
		difficulty: 'medium',
	},
	{
		id: 'tfa-q4',
		setworkId: 'things-fall-apart',
		question: 'What does the title "Things Fall Apart" suggest?',
		options: [
			'A battle outcome',
			'The breakdown of traditional society',
			"A character's death",
			'A natural disaster',
		],
		correctAnswer: 1,
		explanation:
			'The novel depicts the collapse of Igbo society when confronted with colonial forces.',
		difficulty: 'medium',
	},

	// Cry, the Beloved Country
	{
		id: 'cbq-q1',
		setworkId: 'cry-beloved-country',
		question: 'Where does Kumalo travel to in Part 2?',
		options: ['Durban', 'Johannesburg', 'Cape Town', 'Pretoria'],
		correctAnswer: 1,
		explanation: 'Kumalo travels to Johannesburg to find his sister and son.',
		difficulty: 'easy',
	},
	{
		id: 'cbq-q2',
		setworkId: 'cry-beloved-country',
		question: 'What crime does Absalom commit?',
		options: ['Theft', 'Murder', 'Fraud', 'Assault'],
		correctAnswer: 1,
		explanation: 'Absalom kills Arthur Jarvis during a robbery at his home.',
		difficulty: 'easy',
	},
	{
		id: 'cbq-q3',
		setworkId: 'cry-beloved-country',
		question: 'What is the significance of the title?',
		options: [
			"A reference to South Africa's beauty",
			"A poet's lament for the country",
			'A call for justice',
			'A description of the landscape',
		],
		correctAnswer: 1,
		explanation:
			"The title comes from a poem/song expressing grief for South Africa's divided state.",
		difficulty: 'medium',
	},

	// Merchant of Venice
	{
		id: 'mv-q1',
		setworkId: 'merchant-venice',
		question: 'What does Shylock demand if Antonio defaults?',
		options: ['His ships', 'His home', 'A pound of flesh', 'His fortune'],
		correctAnswer: 2,
		explanation: "The bond specifies a pound of Antonio's flesh if he fails to repay the loan.",
		difficulty: 'easy',
	},
	{
		id: 'mv-q2',
		setworkId: 'merchant-venice',
		question: 'How does Portia save Antonio?',
		options: [
			'By paying the debt',
			'By finding a legal loophole',
			'By convincing Shylock',
			'By revealing herself',
		],
		correctAnswer: 1,
		explanation:
			'Portia argues that Shylock can take flesh but not blood, making the contract impossible to fulfill.',
		difficulty: 'medium',
	},
	{
		id: 'mv-q3',
		setworkId: 'merchant-venice',
		question: 'What is the casket test about?',
		options: ['Wealth', 'True worth over appearance', 'Family heritage', 'Religious faith'],
		correctAnswer: 1,
		explanation:
			'The test reveals who truly loves Portia by their ability to look beyond external appearances.',
		difficulty: 'medium',
	},
];

export function getSetworkById(id: string): Setwork | undefined {
	return setworks.find((s) => s.id === id);
}

export function getQuizBySetwork(setworkId: string): QuizQuestion[] {
	return quizQuestions.filter((q) => q.setworkId === setworkId);
}
