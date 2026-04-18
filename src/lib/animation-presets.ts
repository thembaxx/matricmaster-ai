import type { Variants } from 'motion/react';

// Timing constants per UI/UX guidelines: max 300ms for user-initiated
// Updated with duration guidelines for large elements
export const DURATION = {
	instant: 0.1,
	quick: 0.15, // Standard quick
	normal: 0.25, // Standard enter
	slow: 0.25,
	slower: 0.3,
	// Large elements (drawers, modals) - longer per principle
	drawer: 0.35,
	drawerSlow: 0.4,
} as const;

// Spring configs for gesture-driven motion (per guidelines)
export const SPRING_CONFIG = {
	responsive: { stiffness: 300, damping: 30, mass: 1 },
	bouncy: { stiffness: 400, damping: 28, mass: 1 },
	gentle: { stiffness: 200, damping: 24, mass: 1 },
	fluid: { stiffness: 350, damping: 28, mass: 0.9 },
	press: { stiffness: 400, damping: 30, mass: 0.8 },
	gesture: { stiffness: 300, damping: 30, mass: 1 },
	interruptible: { stiffness: 400, damping: 35 },
} as const;

// Physics constants for interactive elements (per guidelines)
// - ACTIVE_SCALE: 0.97 for :active state
// - HOVER_SCALE: 1.02 for hover state
// - SQUASH range: 0.95-1.05 for subtle deformation
export const PHYSICS = {
	ACTIVE_SCALE: 0.97,
	HOVER_SCALE: 1.02,
	SQUASH_MIN: 0.95,
	SQUASH_MAX: 1.05,
	DEFORMATION_RANGE: { min: 0.97, max: 1.02 },
} as const;

// Easing curves per UI principles:
// 1. Entering elements → ease-out (decelerate to rest)
// 2. On-screen movement → ease-in-out
// 3. Hover/color → ease (standard)
// 4. Exits → Faster than entrances (use accelerate)
// 5. Large elements (drawers) → Longer duration
// 6. Frequent (100+/day) → No animation
export const EASING = {
	ios: [0.33, 1, 0.68, 1],
	decelerate: [0, 0, 0.2, 1], // easeOut - for entrances (principle #1)
	accelerate: [0.4, 0, 1, 1], // easeIn - for exits (faster than enter)
	liquid: [0.2, 0, 0.2, 1],
	smooth: [0.33, 1, 0.68, 1],
	easeOut: [0.4, 0, 0.2, 1], // entrances
	easeIn: [0.4, 0, 1, 0.6], // exits
	easeInOut: [0.4, 0, 0.2, 1], // movement (principle #2)
	ease: [0.25, 0.1, 0.25, 1], // hover/color (principle #3)
	linear: 'linear',
} as const;

// Duration guidelines:
// - Standard: 150-300ms
// - Large (drawers): 300-400ms (principle #5)
// - Exits: Faster than entrances (principle #6)
export const DURATION_GUIDELINES = {
	// Standard durations
	instant: 0.1,
	quick: 0.15,
	normal: 0.25,
	slow: 0.3,
	// Large elements (drawers, panels) - longer per principle #5
	large: 0.35,
	largeSlow: 0.4,
	// Exit - faster than enter per principle #6
	exit: 0.15,
	exitQuick: 0.1,
} as const;

// Stagger delays per guidelines: under 50ms per item
export const STAGGER = {
	FAST: 0.03,
	NORMAL: 0.04,
	SLOW: 0.05,
	MAX_DELAY: 0.05,
} as const;

export const MATERIALIZATION: Variants = {
	initial: { opacity: 0, scale: 0.96, filter: 'blur(8px)' },
	animate: {
		opacity: 1,
		scale: 1,
		filter: 'blur(0px)',
		transition: { duration: DURATION.normal, ease: EASING.decelerate },
	},
	exit: {
		opacity: 0,
		scale: 0.98,
		filter: 'blur(4px)',
		transition: { duration: DURATION.quick, ease: EASING.accelerate },
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
	whileHover: { scale: PHYSICS.HOVER_SCALE },
	whileTap: { scale: PHYSICS.ACTIVE_SCALE },
	transition: { type: 'spring', ...SPRING_CONFIG.fluid },
};

export const HOVER_LIFT = {
	whileHover: { y: -2, transition: { duration: DURATION.quick } },
	whileTap: { y: 0 },
};

export const STAGGER_CONTAINER: Variants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: { staggerChildren: STAGGER.NORMAL, delayChildren: STAGGER.NORMAL },
	},
};

export const STAGGER_ITEM: Variants = {
	hidden: { opacity: 0, y: 12 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { type: 'spring', ...SPRING_CONFIG.gesture },
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
		transition: { type: 'spring', ...SPRING_CONFIG.fluid },
	},
	exit: { opacity: 0, scale: 0.94 },
};

export const BLUR_REVEAL: Variants = {
	initial: { opacity: 0, filter: 'blur(10px)' },
	animate: {
		opacity: 1,
		filter: 'blur(0px)',
		transition: { duration: DURATION.normal, ease: EASING.decelerate },
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
		transition: { duration: DURATION.normal, ease: EASING.easeOut },
	},
	card: {
		initial: { opacity: 0, y: 12, scale: 0.98 },
		animate: { opacity: 1, y: 0, scale: 1 },
		exit: { opacity: 0, y: -6 },
		transition: { type: 'spring', ...SPRING_CONFIG.gesture },
	},
	button: {
		whileHover: { scale: PHYSICS.HOVER_SCALE },
		whileTap: { scale: PHYSICS.ACTIVE_SCALE },
		transition: { type: 'spring', ...SPRING_CONFIG.responsive },
	},
	modal: {
		initial: { opacity: 0, scale: 0.95, y: 16 },
		animate: {
			opacity: 1,
			scale: 1,
			y: 0,
			transition: { type: 'spring', ...SPRING_CONFIG.gesture },
		},
		exit: { opacity: 0, scale: 0.95, y: 16 },
	},
	toast: {
		initial: { opacity: 0, y: 40, scale: 0.9 },
		animate: {
			opacity: 1,
			y: 0,
			scale: 1,
			transition: { type: 'spring', ...SPRING_CONFIG.fluid },
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

// ==========================================================================
// UI PRINCIPLE-BASED PRESETS
// ==========================================================================

// Hover/Color transitions - use standard ease (principle #3: hover/color → ease)
export const HOVER_EASE = {
	whileHover: { scale: PHYSICS.HOVER_SCALE },
	whileTap: { scale: PHYSICS.ACTIVE_SCALE },
	transition: { duration: DURATION.quick, ease: EASING.ease },
};

export const COLOR_EASE = {
	whileHover: { opacity: 0.9 },
	whileTap: { opacity: 0.8 },
	transition: { duration: DURATION.quick, ease: EASING.ease },
};

// Large elements (drawers, panels) - use longer duration (principle #5)
export const DRAWER_SLIDE: Variants = {
	initial: { opacity: 0, x: '100%' },
	animate: {
		opacity: 1,
		x: 0,
		transition: { duration: DURATION.drawer, ease: EASING.easeOut },
	},
	exit: {
		opacity: 0,
		x: '100%',
		transition: { duration: DURATION_GUIDELINES.exit, ease: EASING.easeIn },
	},
};

export const DRAWER_MODAL: Variants = {
	initial: { opacity: 0, scale: 0.95, x: '100%' },
	animate: {
		opacity: 1,
		scale: 1,
		x: 0,
		transition: { duration: DURATION.drawer, ease: EASING.easeOut },
	},
	exit: {
		opacity: 0,
		scale: 0.95,
		x: '100%',
		transition: { duration: DURATION_GUIDELINES.exit, ease: EASING.easeIn },
	},
};

// Exit animations - faster than entrance (principle #6)
export const EXIT_FAST: Variants = {
	initial: { opacity: 0, y: 10 },
	animate: {
		opacity: 1,
		y: 0,
		transition: { duration: DURATION.normal, ease: EASING.easeOut },
	},
	exit: {
		opacity: 0,
		y: -10,
		transition: { duration: DURATION_GUIDELINES.exit, ease: EASING.easeIn },
	},
};

export const EXIT_SCALE_FAST: Variants = {
	initial: { opacity: 0, scale: 0.95 },
	animate: {
		opacity: 1,
		scale: 1,
		transition: { duration: DURATION.normal, ease: EASING.easeOut },
	},
	exit: {
		opacity: 0,
		scale: 0.95,
		transition: { duration: DURATION_GUIDELINES.exit, ease: EASING.easeIn },
	},
};

// Movement on screen - use ease-in-out (principle #2)
export const MOVE_EASE_IN_OUT: Variants = {
	initial: { opacity: 0, x: 20 },
	animate: {
		opacity: 1,
		x: 0,
		transition: { duration: DURATION.normal, ease: EASING.easeInOut },
	},
	exit: {
		opacity: 0,
		x: -20,
		transition: { duration: DURATION.normal, ease: EASING.easeInOut },
	},
};

// Spring for drag/interruptible gestures (principle #4)
export const DRAG_SPRING = {
	drag: 'x',
	dragTransition: SPRING_CONFIG.interruptible,
	whileDrag: { scale: PHYSICS.ACTIVE_SCALE },
	transition: { type: 'spring', ...SPRING_CONFIG.interruptible },
};
