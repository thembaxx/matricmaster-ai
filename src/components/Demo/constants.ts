import {
	AtomIcon,
	BookOpenIcon,
	CalculatorIcon,
	Globe02Icon,
	Medal01Icon,
	MicroscopeIcon,
} from '@hugeicons/core-free-icons';

type IconSvg = typeof CalculatorIcon;

export const subjectIcons: Record<string, IconSvg> = {
	Mathematics: CalculatorIcon,
	'Physical Sciences': AtomIcon,
	'Life Sciences': MicroscopeIcon,
	Geography: Globe02Icon,
	History: BookOpenIcon,
	Accounting: Medal01Icon,
	Economics: Medal01Icon,
};
