export { ACTINIDES_ELEMENTS } from './actinides';

export { GROUP_1_2_ELEMENTS } from './group-1-2';
export { GROUP_3_4_ELEMENTS } from './group-3-4';
export { GROUP_5_6_7_8_ELEMENTS } from './group-5-6-7-8';
export { GROUP_7_8_9_10_11_12_ELEMENTS } from './group-7-8-9-10-11-12';
export { LANTHANIDES_ELEMENTS } from './lanthanides';
export {
	BASE_ELEMENTS,
	type BaseElement,
	type ElementDetail,
	generateElementFromBase,
	generatePracticeQuestions,
	generateProperties,
	getGroupNumber,
	getPeriod,
} from './metadata';
export { NONMETALS_ELEMENTS } from './nonmetals';

import { ACTINIDES_ELEMENTS } from './actinides';
import { GROUP_1_2_ELEMENTS } from './group-1-2';
import { GROUP_3_4_ELEMENTS } from './group-3-4';
import { GROUP_5_6_7_8_ELEMENTS } from './group-5-6-7-8';
import { GROUP_7_8_9_10_11_12_ELEMENTS } from './group-7-8-9-10-11-12';
import { LANTHANIDES_ELEMENTS } from './lanthanides';
import {
	BASE_ELEMENTS,
	type BaseElement,
	type ElementDetail,
	generateElementFromBase,
} from './metadata';
import { NONMETALS_ELEMENTS } from './nonmetals';

export const ELEMENT_DETAILS: Record<number, ElementDetail> = {
	...GROUP_1_2_ELEMENTS,
	...GROUP_3_4_ELEMENTS,
	...GROUP_5_6_7_8_ELEMENTS,
	...GROUP_7_8_9_10_11_12_ELEMENTS,
	...NONMETALS_ELEMENTS,
	...LANTHANIDES_ELEMENTS,
	...ACTINIDES_ELEMENTS,
};

for (let i = 1; i <= 118; i++) {
	if (!ELEMENT_DETAILS[i]) {
		const baseElement = BASE_ELEMENTS.find((e) => e.num === i);
		if (baseElement) {
			ELEMENT_DETAILS[i] = generateElementFromBase(baseElement);
		}
	}
}

export const ELEMENTS: BaseElement[] = BASE_ELEMENTS;
