import type { Variants } from 'framer-motion';

export const SPRING_CONFIG = {
	responsive: { stiffness: 300, damping: 30, mass: 1 },
	bouncy: { stiffness: 400, damping: 28, mass: 1 },
	gentle: { stiffness: 200, damping: 24, mass: 1 },
	fluid: { stiffness: 350, damping: 28, mass: 0.9 },
	press: { stiffness: 400, damping: 30, mass: 0.8 },
};

export const DURATION = {
	instant: 0.1,
	quick: 0.15,
	normal: 0.25,
	slow: 0.35,
	slower: 0.3,
};

export const EASING = {
	ios: [0.33, 1, 0.68, 1],
	decelerate: [0, 0, 0.2, 1],
	accelerate: [0.4, 0, 1, 1],
	liquid: [0.2, 0, 0.2, 1],
	smooth: [0.33, 1, 0.68, 1],
} as const;

export const MATERIALIZATION: Variants = {
	initial: { opacity: 0, scale: 0.96, filter: 'blur(8px)' },
	animate: {
		opacity: 1,
		scale: 1,
		filter: 'blur(0px)',
		transition: { duration: 0.4, ease: EASING.liquid },
	},
	exit: {
		opacity: 0,
		scale: 0.98,
		filter: 'blur(4px)',
		transition: { duration: 0.25, ease: EASING.accelerate },
	},
};

export const FADE_UP: Variants = {
	initial: { opacity: 0, y: 10 },
	animate: { opacity: 1, y: 0 },
	exit: { opacity: 0, y: -10 },
};

export const FADE_SCALE: Variants = {
	initial: { opacity: 0, scale: 0.95 },
	animate: { opacity: 1, scale: 1 },
	exit: { opacity: 0, scale: 0.95 },
};

export const LIQUID_FLEX = {
	whileHover: { scale: 1.02 },
	whileTap: { scale: 0.98 },
	transition: { type: 'spring', stiffness: 350, damping: 28 },
};

export const HOVER_LIFT = {
	whileHover: { y: -1, transition: { duration: 0.15 } },
	whileTap: { y: 0 },
};

export const STAGGER_CONTAINER: Variants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: { staggerChildren: 0.04, delayChildren: 0.06 },
	},
};

export const STAGGER_ITEM: Variants = {
	hidden: { opacity: 0, y: 12 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { type: 'spring', stiffness: 300, damping: 28 },
	},
};

export const SLIDE_IN_RIGHT: Variants = {
	initial: { opacity: 0, x: 20 },
	animate: { opacity: 1, x: 0 },
	exit: { opacity: 0, x: -20 },
};

export const SCALE_IN: Variants = {
	initial: { opacity: 0, scale: 0.94 },
	animate: {
		opacity: 1,
		scale: 1,
		transition: { type: 'spring', stiffness: 350, damping: 28 },
	},
	exit: { opacity: 0, scale: 0.94 },
};

export const BLUR_REVEAL: Variants = {
	initial: { opacity: 0, filter: 'blur(10px)' },
	animate: {
		opacity: 1,
		filter: 'blur(0px)',
		transition: { duration: 0.3, ease: EASING.decelerate },
	},
};

export const GLOW_PULSE = {
	initial: { boxShadow: '0 0 0 0 rgba(0,0,0,0)' },
	animate: { boxShadow: '0 0 20px 2px rgba(59, 130, 246, 0.3)' },
	exit: { boxShadow: '0 0 0 0 rgba(0,0,0,0)' },
};

export const SCROLL_BLUR = {
	min: 'blur(0px)',
	mid: 'blur(10px)',
	max: 'blur(20px)',
};

export const SHADOW_DEPTH = {
	low: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
	medium: '0 3px 6px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.12)',
	high: '0 10px 20px rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.10)',
	elevated: '0 15px 25px rgba(0,0,0,0.15), 0 5px 10px rgba(0,0,0,0.05)',
};

export const ANIMATION_PRESETS = {
	page: {
		initial: { opacity: 0, y: 6 },
		animate: { opacity: 1, y: 0 },
		exit: { opacity: 0, y: -6 },
		transition: { duration: 0.2, ease: EASING.ios },
	},
	card: {
		initial: { opacity: 0, y: 12, scale: 0.98 },
		animate: { opacity: 1, y: 0, scale: 1 },
		exit: { opacity: 0, y: -6 },
		transition: { type: 'spring', stiffness: 300, damping: 30 },
	},
	button: {
		whileHover: { scale: 1.02 },
		whileTap: { scale: 0.98 },
		transition: { type: 'spring', stiffness: 350, damping: 28 },
	},
	modal: {
		initial: { opacity: 0, scale: 0.95, y: 16 },
		animate: {
			opacity: 1,
			scale: 1,
			y: 0,
			transition: { type: 'spring', stiffness: 300, damping: 28 },
		},
		exit: { opacity: 0, scale: 0.95, y: 16 },
	},
	toast: {
		initial: { opacity: 0, y: 40, scale: 0.9 },
		animate: {
			opacity: 1,
			y: 0,
			scale: 1,
			transition: { type: 'spring', stiffness: 350, damping: 28 },
		},
		exit: { opacity: 0, y: 16, scale: 0.9 },
	},
	list: {
		hidden: { opacity: 0 },
		visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
	},
	listItem: {
		hidden: { opacity: 0, x: -8 },
		visible: { opacity: 1, x: 0 },
	},
};
