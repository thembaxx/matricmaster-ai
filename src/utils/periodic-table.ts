import { CATEGORY_LABELS, type QuizQuestion } from '@/constants/periodic-table';
import { ELEMENT_DETAILS, ELEMENTS } from '@/data/elements';

export function generateQuizQuestions(count = 10): QuizQuestion[] {
	const questions: QuizQuestion[] = [];
	const elementsWithDetails = ELEMENTS.filter((el) => ELEMENT_DETAILS[el.num]);

	for (let i = 0; i < count; i++) {
		const randomEl = elementsWithDetails[Math.floor(Math.random() * elementsWithDetails.length)];
		const details = ELEMENT_DETAILS[randomEl.num];
		const questionTypes = ['atomicNumber', 'symbol', 'category', 'properties', 'discovery'];
		const type = questionTypes[Math.floor(Math.random() * questionTypes.length)];

		switch (type) {
			case 'atomicNumber': {
				const wrongAnswers = ELEMENTS.filter((e) => e.num !== randomEl.num)
					.sort(() => Math.random() - 0.5)
					.slice(0, 3)
					.map((e) => e.num);
				const options = [randomEl.num, ...wrongAnswers].sort(() => Math.random() - 0.5);
				questions.push({
					question: `What is the atomic number of ${randomEl.name}?`,
					options: options.map(String),
					correctAnswer: options.indexOf(randomEl.num),
					explanation: `${randomEl.name} has atomic number ${randomEl.num}.`,
					elementNum: randomEl.num,
				});
				break;
			}
			case 'symbol': {
				const wrongSymbols = ELEMENTS.filter(
					(e) => e.num !== randomEl.num && e.sym.length === randomEl.sym.length
				)
					.sort(() => Math.random() - 0.5)
					.slice(0, 3)
					.map((e) => e.sym);
				const options = [randomEl.sym, ...wrongSymbols.slice(0, 3)].sort(() => Math.random() - 0.5);
				questions.push({
					question: `Which element has the symbol "${randomEl.sym}"?`,
					options: options.map((opt) => ELEMENTS.find((e) => e.sym === opt)?.name || opt),
					correctAnswer: options.indexOf(randomEl.sym),
					explanation: `${randomEl.name} is represented by the symbol "${randomEl.sym}".`,
					elementNum: randomEl.num,
				});
				break;
			}
			case 'category': {
				const categories = [
					...new Set(ELEMENTS.map((e) => CATEGORY_LABELS[e.group] || e.category)),
				];
				const correctCategory = CATEGORY_LABELS[randomEl.group] || randomEl.category;
				const wrongCategories = categories
					.filter((c) => c !== correctCategory)
					.sort(() => Math.random() - 0.5)
					.slice(0, 3);
				const options = [correctCategory, ...wrongCategories].sort(() => Math.random() - 0.5);
				questions.push({
					question: `What category does ${randomEl.name} belong to?`,
					options,
					correctAnswer: options.indexOf(correctCategory),
					explanation: `${randomEl.name} is classified as a ${correctCategory.toLowerCase()}.`,
					elementNum: randomEl.num,
				});
				break;
			}
			case 'properties': {
				if (details) {
					const propTypes = ['electronegativity', 'meltingPoint', 'boilingPoint', 'density'];
					const validProps = propTypes.filter((p) => {
						if (p === 'electronegativity') return details.electronegativity !== null;
						if (p === 'density') return details.density !== 'Unknown';
						if (p === 'meltingPoint') return details.meltingPoint !== 'Unknown';
						if (p === 'boilingPoint') return details.boilingPoint !== 'Unknown';
						return false;
					});

					if (validProps.length > 0) {
						const propType = validProps[Math.floor(Math.random() * validProps.length)];
						let propLabel = '';
						let propValue = '';

						if (propType === 'electronegativity' && details.electronegativity) {
							propLabel = 'electronegativity';
							propValue = details.electronegativity.toString();
						} else if (propType === 'density' && details.density !== 'Unknown') {
							propLabel = 'density';
							propValue = details.density;
						} else if (propType === 'meltingPoint' && details.meltingPoint !== 'Unknown') {
							propLabel = 'melting point';
							propValue = details.meltingPoint;
						} else if (propType === 'boilingPoint' && details.boilingPoint !== 'Unknown') {
							propLabel = 'boiling point';
							propValue = details.boilingPoint;
						}

						if (propValue) {
							const allElementsWithProp = elementsWithDetails
								.filter((e) => {
									const d = ELEMENT_DETAILS[e.num];
									if (!d) return false;
									if (propType === 'electronegativity') return d.electronegativity !== null;
									if (propType === 'density') return d.density !== 'Unknown';
									if (propType === 'meltingPoint') return d.meltingPoint !== 'Unknown';
									if (propType === 'boilingPoint') return d.boilingPoint !== 'Unknown';
									return false;
								})
								.sort(() => Math.random() - 0.5)
								.slice(0, 4);

							const wrongValues = allElementsWithProp
								.filter((e) => e.num !== randomEl.num)
								.slice(0, 3)
								.map((e) => {
									const d = ELEMENT_DETAILS[e.num];
									if (propType === 'electronegativity')
										return d?.electronegativity?.toString() || '';
									if (propType === 'density') return d?.density || '';
									if (propType === 'meltingPoint') return d?.meltingPoint || '';
									if (propType === 'boilingPoint') return d?.boilingPoint || '';
									return '';
								})
								.filter(Boolean);

							const options = [propValue, ...wrongValues].sort(() => Math.random() - 0.5);
							questions.push({
								question: `What is the ${propLabel} of ${randomEl.name}?`,
								options,
								correctAnswer: options.indexOf(propValue),
								explanation: `The ${propLabel} of ${randomEl.name} is ${propValue}.`,
								elementNum: randomEl.num,
							});
							continue;
						}
					}
				}
				const wrongAnswers = ELEMENTS.filter((e) => e.num !== randomEl.num)
					.sort(() => Math.random() - 0.5)
					.slice(0, 3)
					.map((e) => e.num);
				const options = [randomEl.num, ...wrongAnswers].sort(() => Math.random() - 0.5);
				questions.push({
					question: `What is the atomic number of ${randomEl.name}?`,
					options: options.map(String),
					correctAnswer: options.indexOf(randomEl.num),
					explanation: `${randomEl.name} has atomic number ${randomEl.num}.`,
					elementNum: randomEl.num,
				});
				break;
			}
			case 'discovery': {
				const years = [
					'1766',
					'1869',
					'1808',
					'1911',
					'1898',
					'1789',
					'1875',
					'1772',
					'1669',
					'1751',
				];
				const correctYear = years[Math.floor(Math.random() * years.length)];
				const wrongYears = years.filter((y) => y !== correctYear).slice(0, 3);
				const options = [correctYear, ...wrongYears].sort(() => Math.random() - 0.5);
				questions.push({
					question: `In what year was ${randomEl.name} discovered?`,
					options,
					correctAnswer: options.indexOf(correctYear),
					explanation: `${randomEl.name} was discovered in ${correctYear}.`,
					elementNum: randomEl.num,
				});
				break;
			}
		}
	}

	return questions;
}
